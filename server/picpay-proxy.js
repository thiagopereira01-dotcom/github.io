/**
 * Gateway PIX — PicPay e/ou Asaas (mesmo serviço Node).
 *
 * PicPay: PICPAY_CLIENT_ID, PICPAY_CLIENT_SECRET, opcional PICPAY_API_BASE, PICPAY_PIX_EXPIRATION_SEC
 * Asaas: ASAAS_API_KEY (header access_token), opcional ASAAS_API_BASE (senão deduz sandbox/prod pela chave)
 * Comum: ALLOWED_ORIGINS (origens do site estático, vírgula). User-Agent fixo (exigência Asaas).
 */
"use strict";

var express = require("express");
var cors = require("cors");

var app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "120kb" }));

var allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(function (s) {
    return s.trim();
  })
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (allowed.length === 0) {
        console.warn("ALLOWED_ORIGINS vazio — aceitando qualquer origem (não use em produção).");
        return cb(null, true);
      }
      if (allowed.indexOf(origin) !== -1) return cb(null, true);
      return cb(null, false);
    },
  })
);

var tokenCache = { access_token: null, expiresAt: 0 };

function getApiBase() {
  return (process.env.PICPAY_API_BASE || "https://checkout-api.picpay.com").replace(/\/$/, "");
}

function getToken() {
  var now = Date.now();
  if (tokenCache.access_token && now < tokenCache.expiresAt - 15000) {
    return Promise.resolve(tokenCache.access_token);
  }
  var id = process.env.PICPAY_CLIENT_ID;
  var secret = process.env.PICPAY_CLIENT_SECRET;
  if (!id || !secret) {
    return Promise.reject(new Error("PICPAY_CLIENT_ID e PICPAY_CLIENT_SECRET são obrigatórios"));
  }
  return fetch(getApiBase() + "/oauth2/token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: id,
      client_secret: secret,
    }),
  }).then(function (r) {
    return r.text().then(function (text) {
      var j;
      try {
        j = JSON.parse(text);
      } catch (e) {
        throw new Error("Token PicPay: resposta inválida " + r.status);
      }
      if (!r.ok) {
        throw new Error("Token PicPay " + r.status + ": " + (j.message || text).slice(0, 500));
      }
      var ttl = typeof j.expires_in === "number" ? j.expires_in : 280;
      tokenCache = {
        access_token: j.access_token,
        expiresAt: Date.now() + ttl * 1000,
      };
      return j.access_token;
    });
  });
}

function getAsaasBase() {
  var b = (process.env.ASAAS_API_BASE || "").replace(/\/$/, "");
  if (b) return b;
  var key = process.env.ASAAS_API_KEY || "";
  if (key.indexOf("$aact_hmlg_") === 0) return "https://api-sandbox.asaas.com";
  return "https://api.asaas.com";
}

function asaasHeaders() {
  var key = process.env.ASAAS_API_KEY;
  if (!key) return null;
  return {
    accept: "application/json",
    "content-type": "application/json",
    access_token: key,
    "user-agent": process.env.ASAAS_USER_AGENT || "CartelaSorteio/1.0 (gateway-pix)",
  };
}

function dueDateSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function normalizeAsaasQrBase64(encodedImage) {
  if (!encodedImage || typeof encodedImage !== "string") return "";
  var s = encodedImage.trim();
  if (s.charAt(0) === "=") s = s.slice(1);
  if (s.indexOf("data:image") === 0) return s.split(",").pop() || s;
  return s;
}

function respondPixCompatible(res, qrPayload, encodedImage) {
  res.json({
    transactions: [
      {
        pix: {
          qrCode: qrPayload || "",
          qrCodeBase64: normalizeAsaasQrBase64(encodedImage),
        },
      },
    ],
  });
}

app.get("/api/health", function (_req, res) {
  res.json({
    ok: true,
    service: "cartela-gateway-pix",
    picpay: !!(process.env.PICPAY_CLIENT_ID && process.env.PICPAY_CLIENT_SECRET),
    asaas: !!process.env.ASAAS_API_KEY,
  });
});

/**
 * Body: { merchantChargeId, amountCents, customer: { name, email, document, documentType?, phone } }
 * phone: { countryCode, areaCode, number, type? }
 */
app.post("/api/picpay/charge-pix", function (req, res) {
  var body = req.body || {};
  var merchantChargeId = body.merchantChargeId;
  var amountCents = body.amountCents;
  var customer = body.customer;
  if (!merchantChargeId || typeof merchantChargeId !== "string") {
    return res.status(400).json({ error: "merchantChargeId obrigatório (6–36 caracteres, [a-zA-Z0-9-])" });
  }
  if (
    merchantChargeId.length < 6 ||
    merchantChargeId.length > 36 ||
    !/^([a-zA-Z0-9-]+)$/.test(merchantChargeId)
  ) {
    return res.status(400).json({ error: "merchantChargeId inválido para a PicPay (6–36, só letras, números e hífen)" });
  }
  if (typeof amountCents !== "number" || amountCents < 1) {
    return res.status(400).json({ error: "amountCents deve ser inteiro >= 1 (centavos)" });
  }
  if (!customer || typeof customer !== "object") {
    return res.status(400).json({ error: "customer obrigatório" });
  }
  var doc = String(customer.document || "").replace(/\D/g, "");
  var docType = customer.documentType || "CPF";
  if (!customer.name || !customer.email || !doc) {
    return res.status(400).json({ error: "customer.name, customer.email e customer.document são obrigatórios" });
  }
  var ph = customer.phone;
  if (!ph || !ph.areaCode || !ph.number) {
    return res.status(400).json({ error: "customer.phone com countryCode, areaCode e number" });
  }

  var ip =
    (req.headers["x-forwarded-for"] && String(req.headers["x-forwarded-for"]).split(",")[0].trim()) ||
    req.socket.remoteAddress ||
    "0.0.0.0";

  var expiration = parseInt(process.env.PICPAY_PIX_EXPIRATION_SEC || "900", 10);
  if (isNaN(expiration) || expiration < 60) expiration = 900;

  var payload = {
    paymentSource: "GATEWAY",
    merchantChargeId: merchantChargeId,
    customer: {
      name: String(customer.name).trim(),
      email: String(customer.email).trim().toLowerCase(),
      documentType: docType,
      document: doc,
      phone: {
        countryCode: String(ph.countryCode || "55"),
        areaCode: String(ph.areaCode),
        number: String(ph.number),
        type: ph.type || "MOBILE",
      },
    },
    transactions: [
      {
        paymentType: "PIX",
        amount: amountCents,
        pix: { expiration: expiration },
      },
    ],
    deviceInformation: {
      ip: ip,
    },
  };

  getToken()
    .then(function (token) {
      return fetch(getApiBase() + "/charge/pix", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
          "caller-origin": "cartela-sorteio",
        },
        body: JSON.stringify(payload),
      });
    })
    .then(function (r) {
      return r.text().then(function (text) {
        var j;
        try {
          j = JSON.parse(text);
        } catch (e) {
          j = { raw: text };
        }
        if (!r.ok) {
          return res.status(r.status).json({ error: "PicPay", status: r.status, details: j });
        }
        res.json(j);
      });
    })
    .catch(function (e) {
      console.error(e);
      res.status(500).json({ error: String(e.message || e) });
    });
});

/**
 * Asaas: cria cliente, cobrança PIX e retorna QR no mesmo formato que o front já espera (transactions[0].pix).
 * Body igual ao PicPay: { merchantChargeId, amountCents, customer: { name, email, document, phone } }
 */
app.post("/api/asaas/charge-pix", function (req, res) {
  var headers = asaasHeaders();
  if (!headers) {
    return res.status(503).json({ error: "ASAAS_API_KEY não configurada no servidor" });
  }

  var body = req.body || {};
  var merchantChargeId = body.merchantChargeId;
  var amountCents = body.amountCents;
  var customer = body.customer;

  if (!merchantChargeId || typeof merchantChargeId !== "string") {
    return res.status(400).json({ error: "merchantChargeId obrigatório" });
  }
  if (typeof amountCents !== "number" || amountCents < 1) {
    return res.status(400).json({ error: "amountCents deve ser inteiro >= 1 (centavos)" });
  }
  if (!customer || typeof customer !== "object") {
    return res.status(400).json({ error: "customer obrigatório" });
  }
  var doc = String(customer.document || "").replace(/\D/g, "");
  if (!customer.name || !customer.email || (doc.length !== 11 && doc.length !== 14)) {
    return res
      .status(400)
      .json({ error: "customer.name, customer.email e CPF (11 dígitos) ou CNPJ (14) em customer.document" });
  }
  var ph = customer.phone;
  if (!ph || !ph.areaCode || !ph.number) {
    return res.status(400).json({ error: "customer.phone com areaCode e number" });
  }

  var mobileDigits = String(ph.areaCode) + String(ph.number).replace(/\D/g, "");
  var base = getAsaasBase();
  var valueReais = Number((Math.round(amountCents) / 100).toFixed(2));

  var extRef = String(merchantChargeId).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
  if (!extRef) extRef = "cartela-" + Date.now();

  fetch(base + "/v3/customers", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      name: String(customer.name).trim(),
      cpfCnpj: doc.length === 11 ? doc : doc.slice(0, 14),
      email: String(customer.email).trim().toLowerCase(),
      mobilePhone: mobileDigits.replace(/\D/g, ""),
      notificationDisabled: true,
      externalReference: extRef.slice(0, 50),
    }),
  })
    .then(function (r) {
      return r.text().then(function (text) {
        var j;
        try {
          j = JSON.parse(text);
        } catch (e) {
          j = { raw: text };
        }
        return { ok: r.ok, status: r.status, j: j };
      });
    })
    .then(function (custRes) {
      if (!custRes.ok) {
        res.status(custRes.status).json({ error: "Asaas (cliente)", details: custRes.j });
        return null;
      }
      var custId = custRes.j && custRes.j.id;
      if (!custId) {
        res.status(500).json({ error: "Asaas: resposta de cliente sem id", details: custRes.j });
        return null;
      }
      return fetch(base + "/v3/payments", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          customer: custId,
          billingType: "PIX",
          value: valueReais,
          dueDate: dueDateSaoPaulo(),
          description: "Reserva número — " + extRef.slice(0, 80),
          externalReference: extRef.slice(0, 100),
        }),
      }).then(function (r) {
        return r.text().then(function (text) {
          var j;
          try {
            j = JSON.parse(text);
          } catch (e) {
            j = { raw: text };
          }
          return { ok: r.ok, status: r.status, j: j };
        });
      });
    })
    .then(function (payRes) {
      if (payRes == null) return null;
      if (!payRes.ok) {
        res.status(payRes.status).json({ error: "Asaas (cobrança)", details: payRes.j });
        return null;
      }
      var payId = payRes.j && payRes.j.id;
      if (!payId) {
        res.status(500).json({ error: "Asaas: cobrança sem id", details: payRes.j });
        return null;
      }
      return fetch(base + "/v3/payments/" + encodeURIComponent(payId) + "/pixQrCode", {
        method: "GET",
        headers: {
          accept: "application/json",
          access_token: headers.access_token,
          "user-agent": headers["user-agent"],
        },
      }).then(function (r) {
        return r.text().then(function (text) {
          var j;
          try {
            j = JSON.parse(text);
          } catch (e) {
            j = { raw: text };
          }
          return { ok: r.ok, status: r.status, j: j };
        });
      });
    })
    .then(function (qrRes) {
      if (qrRes == null) return;
      if (!qrRes.ok) {
        res.status(qrRes.status).json({ error: "Asaas (QR Code PIX)", details: qrRes.j });
        return;
      }
      var payload = (qrRes.j && qrRes.j.payload) || "";
      var img = (qrRes.j && qrRes.j.encodedImage) || "";
      respondPixCompatible(res, payload, img);
    })
    .catch(function (e) {
      console.error(e);
      if (!res.headersSent) res.status(500).json({ error: String(e.message || e) });
    });
});

var port = parseInt(process.env.PORT || "8787", 10);
app.listen(port, function () {
  console.log("Gateway PIX (PicPay/Asaas) na porta " + port);
});
