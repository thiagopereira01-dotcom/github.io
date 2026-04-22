/**
 * Proxy PicPay PIX — use com Web Service no Render (ou outro Node).
 * Variáveis: PICPAY_CLIENT_ID, PICPAY_CLIENT_SECRET, ALLOWED_ORIGINS (origens do site estático, separadas por vírgula)
 * Opcional: PICPAY_API_BASE (padrão https://checkout-api.picpay.com), PICPAY_PIX_EXPIRATION_SEC (padrão 900)
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

app.get("/api/health", function (_req, res) {
  res.json({ ok: true, service: "cartela-picpay-proxy" });
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

var port = parseInt(process.env.PORT || "8787", 10);
app.listen(port, function () {
  console.log("PicPay proxy escutando na porta " + port);
});
