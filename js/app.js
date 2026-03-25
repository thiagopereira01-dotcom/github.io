(function () {
  "use strict";

  var STORAGE_V1 = "sorteio-cartela-v1";
  var STORAGE_V2 = "sorteio-cartela-v2";
  var SESSION_ADMIN_KEY = "sorteio-admin-session";

  /** @type {{ cartelas: Array<{ id: string, title: string, total: number, precoPadrao: number, promocoes: Array<{ id: string, qtd: number, valorTotal: number }>, vendas: Record<string, { nome: string, pago: boolean, valor: number }>, createdAt: number }>, activeId: string | null, settings: { adminPwHash: string | null, pixChave: string, pixNome: string, pixCidade: string } }} */
  var store = {
    cartelas: [],
    activeId: null,
    settings: {
      adminPwHash: null,
      pixChave: "",
      pixNome: "",
      pixCidade: "",
    },
  };

  /** @type {string | null} */
  var publicModalCartelaId = null;
  /** @type {number | null} */
  var publicModalNumero = null;

  var el = {
    screenSetup: document.getElementById("screen-setup"),
    screenCartela: document.getElementById("screen-cartela"),
    cartelasList: document.getElementById("cartelas-list"),
    cartelasEmpty: document.getElementById("cartelas-empty"),
    formSetup: document.getElementById("form-setup"),
    inputTitle: document.getElementById("input-title"),
    inputTotal: document.getElementById("input-total"),
    inputPrecoSetup: document.getElementById("input-preco-setup"),
    setupPromocoesLista: document.getElementById("setup-promocoes-lista"),
    setupPromoQtd: document.getElementById("setup-promo-qtd"),
    setupPromoValor: document.getElementById("setup-promo-valor"),
    btnSetupAddPromo: document.getElementById("btn-setup-add-promo"),
    btnVendaLote: document.getElementById("btn-venda-lote"),
    modalVendaLote: document.getElementById("modal-venda-lote"),
    formVendaLote: document.getElementById("form-venda-lote"),
    inputNumerosLote: document.getElementById("input-numeros-lote"),
    lotePreview: document.getElementById("lote-preview"),
    inputNomeLote: document.getElementById("input-nome-lote"),
    selectLotePreco: document.getElementById("select-lote-preco"),
    wrapLoteValorManual: document.getElementById("wrap-lote-valor-manual"),
    inputLoteValorTotal: document.getElementById("input-lote-valor-total"),
    loteSplitHint: document.getElementById("lote-split-hint"),
    inputPagoLote: document.getElementById("input-pago-lote"),
    btnCancelarLote: document.getElementById("btn-cancelar-lote"),
    btnLoteSelecionarGrade: document.getElementById("btn-lote-selecionar-grade"),
    selectionBar: document.getElementById("selection-bar"),
    selectionBarText: document.getElementById("selection-bar-text"),
    btnSelectionAplicar: document.getElementById("btn-selection-aplicar"),
    btnSelectionLimpar: document.getElementById("btn-selection-limpar"),
    btnSelectionCancelar: document.getElementById("btn-selection-cancelar"),
    btnVoltarCartelas: document.getElementById("btn-voltar-cartelas"),
    cartelaTitle: document.getElementById("cartela-title-display"),
    progressText: document.getElementById("progress-text"),
    btnSortear: document.getElementById("btn-sortear"),
    btnRelatorioPdf: document.getElementById("btn-relatorio-pdf"),
    btnNovaCartela: document.getElementById("btn-nova-cartela"),
    numberGrid: document.getElementById("number-grid"),
    totalGeral: document.getElementById("total-geral"),
    totalRecebido: document.getElementById("total-recebido"),
    totalPendente: document.getElementById("total-pendente"),
    inputPrecoPadrao: document.getElementById("input-preco-padrao"),
    promocoesLista: document.getElementById("promocoes-lista"),
    promoQtd: document.getElementById("promo-qtd"),
    promoValorTotal: document.getElementById("promo-valor-total"),
    btnAddPromo: document.getElementById("btn-add-promo"),
    modalOverlay: document.getElementById("modal-overlay"),
    modalVenda: document.getElementById("modal-venda"),
    modalNumero: document.getElementById("modal-numero"),
    formVenda: document.getElementById("form-venda"),
    inputNome: document.getElementById("input-nome"),
    inputValor: document.getElementById("input-valor"),
    selectAplicarPreco: document.getElementById("select-aplicar-preco"),
    inputPago: document.getElementById("input-pago"),
    btnCancelarVenda: document.getElementById("btn-cancelar-venda"),
    btnRemoverVenda: document.getElementById("btn-remover-venda"),
    modalSorteio: document.getElementById("modal-sorteio"),
    sorteioHint: document.getElementById("sorteio-hint"),
    sorteioResult: document.getElementById("sorteio-result"),
    sorteioNumero: document.getElementById("sorteio-numero"),
    sorteioNome: document.getElementById("sorteio-nome"),
    btnFecharSorteio: document.getElementById("btn-fechar-sorteio"),
    screenChoose: document.getElementById("screen-choose"),
    screenLogin: document.getElementById("screen-login"),
    screenPublic: document.getElementById("screen-public"),
    btnChooseAdmin: document.getElementById("btn-choose-admin"),
    btnChoosePublic: document.getElementById("btn-choose-public"),
    btnLoginVoltar: document.getElementById("btn-login-voltar"),
    formLogin: document.getElementById("form-login"),
    wrapLoginNova: document.getElementById("wrap-login-nova"),
    wrapLoginNova2: document.getElementById("wrap-login-nova2"),
    wrapLoginSenha: document.getElementById("wrap-login-senha"),
    inputLoginNova: document.getElementById("input-login-nova"),
    inputLoginNova2: document.getElementById("input-login-nova2"),
    inputLoginSenha: document.getElementById("input-login-senha"),
    labelLoginSenha: document.getElementById("label-login-senha"),
    loginLede: document.getElementById("login-lede"),
    loginMsg: document.getElementById("login-msg"),
    btnPublicVoltar: document.getElementById("btn-public-voltar"),
    selectPublicCartela: document.getElementById("select-public-cartela"),
    publicGridWrap: document.getElementById("public-grid-wrap"),
    publicCartelaMeta: document.getElementById("public-cartela-meta"),
    publicNumberGrid: document.getElementById("public-number-grid"),
    btnAdminIrPublico: document.getElementById("btn-admin-ir-publico"),
    btnAdminSairSetup: document.getElementById("btn-admin-sair-setup"),
    btnAdminIrPublicoToolbar: document.getElementById("btn-admin-ir-publico-toolbar"),
    btnAdminSairCartela: document.getElementById("btn-admin-sair-cartela"),
    inputSettingsPixChave: document.getElementById("input-settings-pix-chave"),
    inputSettingsPixNome: document.getElementById("input-settings-pix-nome"),
    inputSettingsPixCidade: document.getElementById("input-settings-pix-cidade"),
    btnSettingsSalvarPix: document.getElementById("btn-settings-salvar-pix"),
    settingsPixMsg: document.getElementById("settings-pix-msg"),
    modalPublicReserva: document.getElementById("modal-public-reserva"),
    modalPublicNumero: document.getElementById("modal-public-numero"),
    modalPublicStepForm: document.getElementById("modal-public-step-form"),
    modalPublicStepPix: document.getElementById("modal-public-step-pix"),
    formPublicReserva: document.getElementById("form-public-reserva"),
    inputPublicNome: document.getElementById("input-public-nome"),
    modalPublicValorLine: document.getElementById("modal-public-valor-line"),
    modalPublicPixValor: document.getElementById("modal-public-pix-valor"),
    publicPixQr: document.getElementById("public-pix-qr"),
    textareaPublicPix: document.getElementById("textarea-public-pix"),
    btnPublicCancelar: document.getElementById("btn-public-cancelar"),
    btnPublicCopiarPix: document.getElementById("btn-public-copiar-pix"),
    btnPublicFecharPix: document.getElementById("btn-public-fechar-pix"),
  };

  /** @type {number | null} */
  var modalNumeroAtual = null;

  var loteSelectionMode = false;
  /** @type {number[]} */
  var loteSelectedNums = [];
  /** @type {{ numeros: string, nome: string, pago: boolean, selectValor: string, manualValor: string } | null} */
  var draftLote = null;

  /** @type {Array<{ id: string, qtd: number, valorTotal: number }>} */
  var setupPromocoesDraft = [];

  function generateId(prefix) {
    return (prefix || "c") + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  function formatMoney(n) {
    var x = typeof n === "number" && !isNaN(n) ? n : 0;
    return x.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function parseMoneyInput(s) {
    if (s === "" || s == null) return 0;
    var n = parseFloat(String(s).replace(",", "."));
    return isNaN(n) ? 0 : Math.max(0, n);
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  /**
   * Divide o valor total em N partes em centavos (soma exata).
   * @param {number} total
   * @param {number} n
   * @returns {number[]}
   */
  function splitTotalReais(total, n) {
    if (n <= 0) return [];
    var cents = Math.round(total * 100);
    var base = Math.floor(cents / n);
    var rem = cents % n;
    var out = [];
    for (var i = 0; i < n; i++) {
      var c = base + (i < rem ? 1 : 0);
      out.push(c / 100);
    }
    return out;
  }

  /**
   * @param {string} text
   * @param {number} maxN
   * @returns {{ nums?: number[], error?: string }}
   */
  function parseNumerosLote(text, maxN) {
    var raw = String(text).trim();
    if (!raw) return { nums: [] };
    var parts = raw.split(/[\s,;]+/).filter(function (x) {
      return x.length > 0;
    });
    var set = {};
    var err = "";

    function addNum(n) {
      if (isNaN(n) || n < 1 || n > maxN) {
        err = "Número fora da cartela: " + n + " (use 1 a " + maxN + ")";
        return false;
      }
      set[String(n)] = true;
      return true;
    }

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i].trim();
      var range = p.match(/^(\d+)\s*-\s*(\d+)$/);
      if (range) {
        var a = parseInt(range[1], 10);
        var b = parseInt(range[2], 10);
        if (isNaN(a) || isNaN(b)) {
          err = "Intervalo inválido: \"" + p + "\"";
          return { error: err };
        }
        if (a > b) {
          var t = a;
          a = b;
          b = t;
        }
        for (var n = a; n <= b; n++) {
        if (!addNum(n)) return { error: err };
      }
    } else {
      var num = parseInt(p, 10);
      if (isNaN(num)) {
        err = "Trecho não reconhecido: \"" + p + "\"";
        return { error: err };
      }
      if (!addNum(num)) {
        return { error: err };
      }
    }
  }

    var nums = Object.keys(set).map(function (k) {
      return parseInt(k, 10);
    });
    nums.sort(function (a, b) {
      return a - b;
    });
    return { nums: nums };
  }

  function normalizeCartela(c) {
    if (!c) return;
    if (typeof c.precoPadrao !== "number" || isNaN(c.precoPadrao)) c.precoPadrao = 0;
    if (!Array.isArray(c.promocoes)) c.promocoes = [];
    var vendas = c.vendas;
    if (!vendas || typeof vendas !== "object") return;
    for (var k in vendas) {
      if (!Object.prototype.hasOwnProperty.call(vendas, k)) continue;
      var v = vendas[k];
      if (typeof v.valor !== "number" || isNaN(v.valor)) v.valor = 0;
    }
  }

  function normalizeAllStore() {
    for (var i = 0; i < store.cartelas.length; i++) {
      normalizeCartela(store.cartelas[i]);
    }
  }

  function getCartela(id) {
    for (var i = 0; i < store.cartelas.length; i++) {
      if (store.cartelas[i].id === id) return store.cartelas[i];
    }
    return null;
  }

  function getActiveCartela() {
    if (!store.activeId) return null;
    return getCartela(store.activeId);
  }

  function saveStore() {
    try {
      localStorage.setItem(STORAGE_V2, JSON.stringify(store));
    } catch (e) {
      console.warn("Não foi possível salvar.", e);
    }
  }

  function migrateFromV1() {
    if (store.cartelas.length > 0) return;
    try {
      var raw = localStorage.getItem(STORAGE_V1);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (data && typeof data.total === "number" && data.total > 0) {
        var vendas = data.vendas && typeof data.vendas === "object" ? data.vendas : {};
        for (var k in vendas) {
          if (Object.prototype.hasOwnProperty.call(vendas, k)) {
            var v = vendas[k];
            if (typeof v.valor !== "number" || isNaN(v.valor)) v.valor = 0;
          }
        }
        store.cartelas.push({
          id: generateId("c"),
          title: typeof data.title === "string" ? data.title : "Cartela",
          total: data.total,
          precoPadrao: 0,
          promocoes: [],
          vendas: vendas,
          createdAt: Date.now(),
        });
        store.activeId = store.cartelas[0].id;
        saveStore();
      }
      localStorage.removeItem(STORAGE_V1);
    } catch (e) {
      console.warn("Migração v1 ignorada.", e);
    }
  }

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORAGE_V2);
      if (raw) {
        var data = JSON.parse(raw);
        if (data && Array.isArray(data.cartelas)) {
          store.cartelas = data.cartelas;
          store.activeId =
            typeof data.activeId === "string" || data.activeId === null
              ? data.activeId
              : null;
          if (data.settings && typeof data.settings === "object") {
            store.settings = {
              adminPwHash:
                data.settings.adminPwHash === null || typeof data.settings.adminPwHash === "string"
                  ? data.settings.adminPwHash
                  : null,
              pixChave: typeof data.settings.pixChave === "string" ? data.settings.pixChave : "",
              pixNome: typeof data.settings.pixNome === "string" ? data.settings.pixNome : "",
              pixCidade: typeof data.settings.pixCidade === "string" ? data.settings.pixCidade : "",
            };
          }
        }
      }
    } catch (e) {
      console.warn("Não foi possível carregar dados.", e);
    }
    migrateFromV1();
    normalizeAllStore();
    ensureSettings();
  }

  function ensureSettings() {
    if (!store.settings || typeof store.settings !== "object") {
      store.settings = {
        adminPwHash: null,
        pixChave: "",
        pixNome: "",
        pixCidade: "",
      };
      return;
    }
    if (store.settings.adminPwHash !== null && typeof store.settings.adminPwHash !== "string") {
      store.settings.adminPwHash = null;
    }
    if (typeof store.settings.pixChave !== "string") store.settings.pixChave = "";
    if (typeof store.settings.pixNome !== "string") store.settings.pixNome = "";
    if (typeof store.settings.pixCidade !== "string") store.settings.pixCidade = "";
  }

  function isAdminSession() {
    try {
      return sessionStorage.getItem(SESSION_ADMIN_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setAdminSession() {
    try {
      sessionStorage.setItem(SESSION_ADMIN_KEY, "1");
    } catch (e) {}
  }

  function clearAdminSession() {
    try {
      sessionStorage.removeItem(SESSION_ADMIN_KEY);
    } catch (e) {}
  }

  function sha256Hex(plain) {
    if (!window.crypto || !crypto.subtle) {
      return Promise.reject(new Error("Crypto"));
    }
    var enc = new TextEncoder();
    return crypto.subtle.digest("SHA-256", enc.encode(plain)).then(function (buf) {
      var a = new Uint8Array(buf);
      var hex = "";
      for (var i = 0; i < a.length; i++) hex += a[i].toString(16).padStart(2, "0");
      return hex;
    });
  }

  function pixSanitize(str, maxLen) {
    var s = String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9 ]/g, "")
      .toUpperCase()
      .trim();
    return s.slice(0, maxLen);
  }

  function emvTag(id, value) {
    var v = String(value);
    if (v.length > 99) v = v.slice(0, 99);
    var len = String(v.length);
    if (len.length === 1) len = "0" + len;
    return id + len + v;
  }

  function crc16CcittPix(payload) {
    var crc = 0xffff;
    for (var i = 0; i < payload.length; i++) {
      crc ^= (payload.charCodeAt(i) & 0xff) << 8;
      for (var j = 0; j < 8; j++) {
        if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xffff;
        else crc = (crc << 1) & 0xffff;
      }
    }
    var hex = crc.toString(16).toUpperCase();
    return ("0000" + hex).slice(-4);
  }

  /**
   * @param {{ chave: string, nome: string, cidade: string, amount: number, txid?: string }} o
   */
  function buildPixCopiaECola(o) {
    var chave = String(o.chave || "").trim();
    if (!chave) return "";
    var nome = pixSanitize(o.nome, 25) || "RECEBEDOR";
    var cidade = pixSanitize(o.cidade, 15) || "BRASIL";
    var amount = round2(typeof o.amount === "number" ? o.amount : 0);
    var amountStr = amount > 0 ? amount.toFixed(2) : "";
    var txRaw = String(o.txid != null ? o.txid : "***")
      .replace(/\s/g, "")
      .toUpperCase();
    var txid = pixSanitize(txRaw.replace(/[^A-Z0-9]/g, ""), 25) || "***";
    var gui = emvTag("00", "BR.GOV.BCB.PIX");
    var keyField = emvTag("01", chave);
    var merchantAccount = emvTag("26", gui + keyField);
    var payload =
      emvTag("00", "01") + merchantAccount + emvTag("52", "0000") + emvTag("53", "986");
    if (amountStr) payload += emvTag("54", amountStr);
    payload += emvTag("58", "BR") + emvTag("59", nome) + emvTag("60", cidade);
    payload += emvTag("62", emvTag("05", txid));
    payload += "6304";
    return payload + crc16CcittPix(payload);
  }

  function hideAllMainScreens() {
    if (el.screenChoose) el.screenChoose.classList.add("hidden");
    if (el.screenLogin) el.screenLogin.classList.add("hidden");
    if (el.screenPublic) el.screenPublic.classList.add("hidden");
    if (el.screenSetup) el.screenSetup.classList.add("hidden");
    if (el.screenCartela) el.screenCartela.classList.add("hidden");
  }

  function showChooseMode() {
    hideAllMainScreens();
    if (el.screenChoose) el.screenChoose.classList.remove("hidden");
  }

  function updateLoginFormMode() {
    ensureSettings();
    var primeiro = !store.settings.adminPwHash;
    if (el.wrapLoginNova) el.wrapLoginNova.classList.toggle("hidden", !primeiro);
    if (el.wrapLoginNova2) el.wrapLoginNova2.classList.toggle("hidden", !primeiro);
    if (el.wrapLoginSenha) el.wrapLoginSenha.classList.toggle("hidden", primeiro);
    if (el.loginLede) {
      el.loginLede.textContent = primeiro
        ? "Crie a senha do painel neste aparelho. Guarde-a com segurança; não há recuperação automática."
        : "Digite a senha para acessar cartelas, vendas e relatórios.";
    }
    if (el.labelLoginSenha) el.labelLoginSenha.textContent = "Senha";
    if (el.loginMsg) el.loginMsg.textContent = "";
    if (el.inputLoginSenha) el.inputLoginSenha.required = !primeiro;
    if (el.inputLoginNova) el.inputLoginNova.required = primeiro;
    if (el.inputLoginNova2) el.inputLoginNova2.required = primeiro;
  }

  function showLoginScreen() {
    hideAllMainScreens();
    if (el.screenLogin) el.screenLogin.classList.remove("hidden");
    updateLoginFormMode();
    if (el.formLogin) el.formLogin.reset();
    updateLoginFormMode();
    var primeiro = !store.settings.adminPwHash;
    if (primeiro && el.inputLoginNova) el.inputLoginNova.focus();
    else if (el.inputLoginSenha) el.inputLoginSenha.focus();
  }

  function refreshAdminSettingsInputs() {
    ensureSettings();
    if (el.inputSettingsPixChave) el.inputSettingsPixChave.value = store.settings.pixChave || "";
    if (el.inputSettingsPixNome) el.inputSettingsPixNome.value = store.settings.pixNome || "";
    if (el.inputSettingsPixCidade) el.inputSettingsPixCidade.value = store.settings.pixCidade || "";
    if (el.settingsPixMsg) el.settingsPixMsg.textContent = "";
  }

  function salvarSettingsPix() {
    ensureSettings();
    if (el.inputSettingsPixChave) store.settings.pixChave = el.inputSettingsPixChave.value.trim();
    if (el.inputSettingsPixNome) store.settings.pixNome = el.inputSettingsPixNome.value.trim();
    if (el.inputSettingsPixCidade) store.settings.pixCidade = el.inputSettingsPixCidade.value.trim();
    saveStore();
    if (el.settingsPixMsg) el.settingsPixMsg.textContent = "Dados PIX salvos.";
  }

  function enterAdminFromLogin() {
    hideAllMainScreens();
    if (el.screenSetup) el.screenSetup.classList.remove("hidden");
    refreshAdminSettingsInputs();
    showLista();
  }

  function exitAdminToChoose() {
    if (loteSelectionMode) exitLoteSelectionDiscard();
    clearAdminSession();
    fecharModalPublica();
    fecharModalVenda();
    fecharModalVendaLote();
    fecharSorteio();
    showChooseMode();
  }

  function showPublicMode() {
    hideAllMainScreens();
    if (el.screenPublic) el.screenPublic.classList.remove("hidden");
    fecharModalPublica();
    refreshPublicCartelaSelect();
  }

  function refreshPublicCartelaSelect() {
    if (!el.selectPublicCartela) return;
    el.selectPublicCartela.innerHTML = "";
    var n = store.cartelas.length;
    if (n === 0) {
      var o = document.createElement("option");
      o.value = "";
      o.textContent = "Nenhuma cartela disponível";
      el.selectPublicCartela.appendChild(o);
      if (el.publicGridWrap) el.publicGridWrap.classList.add("hidden");
      return;
    }
    var o0 = document.createElement("option");
    o0.value = "";
    o0.textContent = "Selecione…";
    el.selectPublicCartela.appendChild(o0);
    for (var i = 0; i < n; i++) {
      var c = store.cartelas[i];
      normalizeCartela(c);
      var opt = document.createElement("option");
      opt.value = c.id;
      var livres = c.total - countVendidos(c);
      var tit = c.title && String(c.title).trim() ? c.title : "Sem título";
      opt.textContent = tit + " (" + livres + " livres)";
      el.selectPublicCartela.appendChild(opt);
    }
    el.selectPublicCartela.onchange = onPublicCartelaChange;
    if (el.selectPublicCartela.value) onPublicCartelaChange();
    else if (el.publicGridWrap) el.publicGridWrap.classList.add("hidden");
  }

  function onPublicCartelaChange() {
    if (!el.selectPublicCartela || !el.publicGridWrap || !el.publicCartelaMeta) return;
    var id = el.selectPublicCartela.value;
    if (!id) {
      el.publicGridWrap.classList.add("hidden");
      return;
    }
    var c = getCartela(id);
    if (!c) {
      el.publicGridWrap.classList.add("hidden");
      return;
    }
    normalizeCartela(c);
    el.publicGridWrap.classList.remove("hidden");
    var tit = c.title && String(c.title).trim() ? c.title : "Sem título";
    var livres = c.total - countVendidos(c);
    el.publicCartelaMeta.textContent =
      tit +
      " · " +
      livres +
      " número(s) disponível(is) · " +
      c.total +
      " no total" +
      (c.precoPadrao > 0 ? " · " + formatMoney(c.precoPadrao) + " por número" : " · preço padrão não definido");
    renderPublicGrid(c);
  }

  function renderPublicGrid(c) {
    if (!el.publicNumberGrid) return;
    el.publicNumberGrid.innerHTML = "";
    var cols = Math.min(16, Math.max(8, Math.ceil(Math.sqrt(c.total))));
    el.publicNumberGrid.style.gridTemplateColumns = "repeat(" + cols + ", minmax(48px, 1fr))";

    for (var n = 1; n <= c.total; n++) {
      var key = String(n);
      var venda = c.vendas[key];
      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("role", "gridcell");
      if (venda) {
        cell.classList.add("cell-sold", "cell-public-taken");
        cell.disabled = true;
        cell.setAttribute("aria-label", "Número " + n + ", indisponível");
      } else {
        cell.setAttribute("aria-label", "Número " + n + ", disponível. Toque para reservar.");
        cell.dataset.numero = key;
        cell.dataset.cartelaId = c.id;
        cell.addEventListener("click", onPublicCellClick);
      }
      var span = document.createElement("span");
      span.className = "cell-num";
      span.textContent = String(n);
      cell.appendChild(span);
      el.publicNumberGrid.appendChild(cell);
    }
  }

  function onPublicCellClick(ev) {
    var btn = ev.currentTarget;
    var id = btn.dataset.cartelaId;
    var num = parseInt(btn.dataset.numero, 10);
    if (!id || isNaN(num)) return;
    var c = getCartela(id);
    if (!c || c.vendas[String(num)]) return;
    if (c.precoPadrao <= 0) {
      alert(
        "Esta cartela ainda não tem preço por número definido. Peça ao organizador para configurar o preço padrão no painel."
      );
      return;
    }
    publicModalCartelaId = id;
    publicModalNumero = num;
    if (el.modalPublicNumero) el.modalPublicNumero.textContent = String(num);
    if (el.modalPublicValorLine) {
      el.modalPublicValorLine.textContent = "Valor: " + formatMoney(c.precoPadrao);
    }
    if (el.inputPublicNome) el.inputPublicNome.value = "";
    if (el.modalPublicStepForm) el.modalPublicStepForm.classList.remove("hidden");
    if (el.modalPublicStepPix) el.modalPublicStepPix.classList.add("hidden");
    if (el.modalPublicReserva) el.modalPublicReserva.classList.remove("hidden");
    if (el.modalOverlay) el.modalOverlay.classList.remove("hidden");
    if (el.inputPublicNome) el.inputPublicNome.focus();
  }

  function fecharModalPublica() {
    publicModalCartelaId = null;
    publicModalNumero = null;
    if (el.modalPublicReserva) el.modalPublicReserva.classList.add("hidden");
    if (el.modalOverlay && el.modalVenda.classList.contains("hidden") && el.modalSorteio.classList.contains("hidden")) {
      if (!el.modalVendaLote || el.modalVendaLote.classList.contains("hidden")) {
        el.modalOverlay.classList.add("hidden");
      }
    }
    if (el.publicPixQr) el.publicPixQr.innerHTML = "";
    if (el.textareaPublicPix) el.textareaPublicPix.value = "";
  }

  function abrirPassoPixPublico(c, nome, valor) {
    ensureSettings();
    if (el.modalPublicStepForm) el.modalPublicStepForm.classList.add("hidden");
    if (el.modalPublicStepPix) el.modalPublicStepPix.classList.remove("hidden");
    if (el.modalPublicPixValor) el.modalPublicPixValor.textContent = "Valor: " + formatMoney(valor);

    var txid = "S" + String(publicModalNumero) + "T" + Date.now().toString(36).toUpperCase().slice(-12);
    var payload = buildPixCopiaECola({
      chave: store.settings.pixChave,
      nome: store.settings.pixNome,
      cidade: store.settings.pixCidade,
      amount: valor,
      txid: txid,
    });

    if (el.textareaPublicPix) el.textareaPublicPix.value = payload || "";

    if (el.publicPixQr) {
      el.publicPixQr.innerHTML = "";
      if (payload && typeof QRCode !== "undefined") {
        try {
          new QRCode(el.publicPixQr, { text: payload, width: 200, height: 200 });
        } catch (e) {
          console.warn(e);
        }
      }
    }

    if (!payload) {
      if (el.textareaPublicPix) {
        el.textareaPublicPix.value =
          "PIX não configurado pelo organizador. Pague " +
          formatMoney(valor) +
          " usando a chave combinada com o organizador. Nome na reserva: " +
          nome;
      }
    }
  }

  function onSubmitPublicReserva(ev) {
    ev.preventDefault();
    if (publicModalCartelaId == null || publicModalNumero == null) return;
    var c = getCartela(publicModalCartelaId);
    if (!c) return;
    var key = String(publicModalNumero);
    if (c.vendas[key]) {
      alert("Este número acabou de ser reservado por outra pessoa. Escolha outro.");
      fecharModalPublica();
      refreshPublicCartelaSelect();
      return;
    }
    var nome = el.inputPublicNome ? el.inputPublicNome.value.trim() : "";
    if (!nome) {
      if (el.inputPublicNome) el.inputPublicNome.focus();
      return;
    }
    if (c.precoPadrao <= 0) {
      alert("Preço não configurado.");
      return;
    }
    var valor = round2(c.precoPadrao);
    c.vendas[key] = { nome: nome, pago: false, valor: valor };
    saveStore();
    renderListaCartelas();
    abrirPassoPixPublico(c, nome, valor);
    var idCartela = publicModalCartelaId;
    if (el.selectPublicCartela && el.selectPublicCartela.value === idCartela) {
      onPublicCartelaChange();
    }
  }

  function countVendidos(c) {
    return Object.keys(c.vendas).length;
  }

  function countPagos(c) {
    var n = 0;
    for (var k in c.vendas) {
      if (!Object.prototype.hasOwnProperty.call(c.vendas, k)) continue;
      if (c.vendas[k].pago) n++;
    }
    return n;
  }

  function totaisCartela(c) {
    var geral = 0;
    var recebido = 0;
    var pendente = 0;
    for (var k in c.vendas) {
      if (!Object.prototype.hasOwnProperty.call(c.vendas, k)) continue;
      var v = c.vendas[k];
      var val = typeof v.valor === "number" ? v.valor : 0;
      geral += val;
      if (v.pago) recebido += val;
      else pendente += val;
    }
    return { geral: round2(geral), recebido: round2(recebido), pendente: round2(pendente) };
  }

  function totalRecebidoCartela(c) {
    return totaisCartela(c).recebido;
  }

  function formatDate(ts) {
    try {
      var d = new Date(ts);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "";
    }
  }

  function renderListaCartelas() {
    el.cartelasList.innerHTML = "";
    var n = store.cartelas.length;
    el.cartelasEmpty.classList.toggle("hidden", n > 0);

    for (var i = 0; i < n; i++) {
      (function (cartela) {
        normalizeCartela(cartela);
        var li = document.createElement("li");
        li.className = "cartela-row";

        var vendidos = countVendidos(cartela);
        var titleText = cartela.title && String(cartela.title).trim() ? cartela.title : "Sem título";
        var tr = totalRecebidoCartela(cartela);
        var moneyHint = tr > 0 ? " · " + formatMoney(tr) + " recebidos" : "";

        var btnOpen = document.createElement("button");
        btnOpen.type = "button";
        btnOpen.className = "cartela-card";
        btnOpen.setAttribute("data-id", cartela.id);
        btnOpen.setAttribute(
          "aria-label",
          "Abrir cartela " + titleText + ", " + vendidos + " de " + cartela.total + " vendidos"
        );

        var main = document.createElement("div");
        main.className = "cartela-card-main";
        var t = document.createElement("div");
        t.className = "cartela-card-title";
        t.textContent = titleText;
        var m = document.createElement("div");
        m.className = "cartela-card-meta";
        m.textContent =
          vendidos +
          " / " +
          cartela.total +
          " vendidos" +
          moneyHint +
          (cartela.createdAt ? " · " + formatDate(cartela.createdAt) : "");
        main.appendChild(t);
        main.appendChild(m);
        btnOpen.appendChild(main);

        var btnDel = document.createElement("button");
        btnDel.type = "button";
        btnDel.className = "btn btn-danger btn-icon";
        btnDel.setAttribute("data-delete-id", cartela.id);
        btnDel.setAttribute("aria-label", "Excluir cartela " + titleText);
        btnDel.textContent = "Excluir";

        btnOpen.addEventListener("click", function () {
          store.activeId = cartela.id;
          saveStore();
          openCartelaView();
        });

        btnDel.addEventListener("click", function (ev) {
          ev.stopPropagation();
          if (
            !confirm(
              "Excluir a cartela \"" +
                titleText +
                "\" e todas as vendas? Esta ação não pode ser desfeita."
            )
          ) {
            return;
          }
          var next = [];
          for (var j = 0; j < store.cartelas.length; j++) {
            if (store.cartelas[j].id !== cartela.id) next.push(store.cartelas[j]);
          }
          store.cartelas = next;
          if (store.activeId === cartela.id) {
            store.activeId = store.cartelas.length ? store.cartelas[0].id : null;
          }
          saveStore();
          renderListaCartelas();
        });

        li.appendChild(btnOpen);
        li.appendChild(btnDel);
        el.cartelasList.appendChild(li);
      })(store.cartelas[i]);
    }
  }

  function showLista() {
    if (!isAdminSession()) {
      showLoginScreen();
      return;
    }
    if (loteSelectionMode) {
      exitLoteSelectionDiscard();
    }
    if (el.screenChoose) el.screenChoose.classList.add("hidden");
    if (el.screenLogin) el.screenLogin.classList.add("hidden");
    if (el.screenPublic) el.screenPublic.classList.add("hidden");
    el.screenSetup.classList.remove("hidden");
    el.screenCartela.classList.add("hidden");
    renderListaCartelas();
    refreshAdminSettingsInputs();
  }

  function showSelectionBar() {
    if (el.selectionBar) el.selectionBar.classList.remove("hidden");
  }

  function hideSelectionBar() {
    if (el.selectionBar) el.selectionBar.classList.add("hidden");
  }

  function exitLoteSelectionDiscard() {
    loteSelectionMode = false;
    loteSelectedNums = [];
    hideSelectionBar();
    draftLote = null;
    renderGrid();
  }

  function updateSelectionBarText() {
    if (!el.selectionBarText) return;
    var c = getActiveCartela();
    var txt = loteSelectedNums.length + " número(s) selecionado(s)";
    if (loteSelectedNums.length > 0) {
      txt += ": " + loteSelectedNums.join(", ");
    }
    if (c && c.promocoes.length > 0) {
      var parts = [];
      for (var pi = 0; pi < c.promocoes.length; pi++) {
        var pr = c.promocoes[pi];
        parts.push(pr.qtd + " por " + formatMoney(pr.valorTotal));
      }
      txt +=
        " — Promoções ativas: " +
        parts.join(" · ") +
        ". Para aplicar um pacote, selecione exatamente aquela quantidade.";
    }
    el.selectionBarText.textContent = txt;
  }

  function enterLoteGridSelection() {
    if (!el.modalVendaLote || el.modalVendaLote.classList.contains("hidden")) return;
    if (!el.selectLotePreco) return;
    draftLote = {
      numeros: el.inputNumerosLote.value,
      nome: el.inputNomeLote.value,
      pago: el.inputPagoLote.checked,
      selectValor: el.selectLotePreco.value,
      manualValor: el.inputLoteValorTotal.value,
    };
    loteSelectedNums = [];
    var c = getActiveCartela();
    if (c && draftLote.numeros.trim()) {
      var parsed = parseNumerosLote(draftLote.numeros, c.total);
      if (!parsed.error && parsed.nums && parsed.nums.length) {
        for (var i = 0; i < parsed.nums.length; i++) {
          var nn = parsed.nums[i];
          if (!c.vendas[String(nn)]) loteSelectedNums.push(nn);
        }
        loteSelectedNums.sort(function (a, b) {
          return a - b;
        });
      }
    }
    fecharModalVendaLote();
    loteSelectionMode = true;
    showSelectionBar();
    updateSelectionBarText();
    renderGrid();
  }

  function applyLoteSelection() {
    if (loteSelectedNums.length === 0) {
      alert("Selecione ao menos um número na cartela.");
      return;
    }
    var text = loteSelectedNums.join(", ");
    loteSelectionMode = false;
    hideSelectionBar();
    loteSelectedNums = [];
    renderGrid();
    el.modalVendaLote.classList.remove("hidden");
    el.modalOverlay.classList.remove("hidden");
    if (draftLote) {
      el.inputNomeLote.value = draftLote.nome;
      el.inputPagoLote.checked = draftLote.pago;
      el.inputLoteValorTotal.value = draftLote.manualValor;
      var selDraft = draftLote.selectValor;
      draftLote = null;
      el.inputNumerosLote.value = text;
      refreshLoteUI();
      if (el.selectLotePreco) {
        for (var ii = 0; ii < el.selectLotePreco.options.length; ii++) {
          if (el.selectLotePreco.options[ii].value === selDraft) {
            el.selectLotePreco.selectedIndex = ii;
            break;
          }
        }
      }
      updateLoteManualWrap();
      refreshLoteUI();
    } else {
      el.inputNumerosLote.value = text;
      refreshLoteUI();
    }
  }

  function limparLoteSelection() {
    loteSelectedNums = [];
    renderGrid();
    updateSelectionBarText();
  }

  function cancelLoteSelection() {
    loteSelectionMode = false;
    loteSelectedNums = [];
    hideSelectionBar();
    renderGrid();
    el.modalVendaLote.classList.remove("hidden");
    el.modalOverlay.classList.remove("hidden");
    if (draftLote) {
      var d = draftLote;
      draftLote = null;
      el.inputNumerosLote.value = d.numeros;
      el.inputNomeLote.value = d.nome;
      el.inputPagoLote.checked = d.pago;
      el.inputLoteValorTotal.value = d.manualValor;
      refreshLoteUI();
      if (el.selectLotePreco) {
        for (var ii = 0; ii < el.selectLotePreco.options.length; ii++) {
          if (el.selectLotePreco.options[ii].value === d.selectValor) {
            el.selectLotePreco.selectedIndex = ii;
            break;
          }
        }
      }
      updateLoteManualWrap();
      refreshLoteUI();
    }
  }

  function showScreenCartela() {
    if (el.screenChoose) el.screenChoose.classList.add("hidden");
    if (el.screenLogin) el.screenLogin.classList.add("hidden");
    if (el.screenPublic) el.screenPublic.classList.add("hidden");
    el.screenSetup.classList.add("hidden");
    el.screenCartela.classList.remove("hidden");
  }

  function updateFinancePanel() {
    var c = getActiveCartela();
    if (!c) return;
    var t = totaisCartela(c);
    el.totalGeral.textContent = formatMoney(t.geral);
    el.totalRecebido.textContent = formatMoney(t.recebido);
    el.totalPendente.textContent = formatMoney(t.pendente);
  }

  function renderPromocoesLista() {
    var c = getActiveCartela();
    el.promocoesLista.innerHTML = "";
    if (!c) return;

    for (var i = 0; i < c.promocoes.length; i++) {
      (function (p) {
        var li = document.createElement("li");
        li.className = "promo-item";
        var porNumero = round2(p.valorTotal / p.qtd);
        var span = document.createElement("span");
        span.className = "promo-item-text";
        span.textContent =
          p.qtd +
          " números por " +
          formatMoney(p.valorTotal) +
          " (" +
          formatMoney(porNumero) +
          " cada)";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-danger btn-sm";
        btn.textContent = "Remover";
        btn.addEventListener("click", function () {
          var next = [];
          for (var j = 0; j < c.promocoes.length; j++) {
            if (c.promocoes[j].id !== p.id) next.push(c.promocoes[j]);
          }
          c.promocoes = next;
          saveStore();
          renderPromocoesLista();
        });
        li.appendChild(span);
        li.appendChild(btn);
        el.promocoesLista.appendChild(li);
      })(c.promocoes[i]);
    }
  }

  function renderSetupPromocoesLista() {
    if (!el.setupPromocoesLista) return;
    el.setupPromocoesLista.innerHTML = "";
    for (var i = 0; i < setupPromocoesDraft.length; i++) {
      (function (p) {
        var li = document.createElement("li");
        li.className = "promo-item";
        var porNumero = round2(p.valorTotal / p.qtd);
        var span = document.createElement("span");
        span.className = "promo-item-text";
        span.textContent =
          p.qtd +
          " números por " +
          formatMoney(p.valorTotal) +
          " (" +
          formatMoney(porNumero) +
          " cada)";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-danger btn-sm";
        btn.textContent = "Remover";
        btn.addEventListener("click", function () {
          var next = [];
          for (var j = 0; j < setupPromocoesDraft.length; j++) {
            if (setupPromocoesDraft[j].id !== p.id) next.push(setupPromocoesDraft[j]);
          }
          setupPromocoesDraft = next;
          renderSetupPromocoesLista();
        });
        li.appendChild(span);
        li.appendChild(btn);
        el.setupPromocoesLista.appendChild(li);
      })(setupPromocoesDraft[i]);
    }
  }

  function onSetupAddPromo() {
    if (!el.setupPromoQtd || !el.setupPromoValor) return;
    var qtd = parseInt(el.setupPromoQtd.value, 10);
    var vt = parseMoneyInput(el.setupPromoValor.value);
    if (isNaN(qtd) || qtd < 2) {
      alert("Informe a quantidade da promoção (mínimo 2).");
      el.setupPromoQtd.focus();
      return;
    }
    if (vt <= 0) {
      alert("Informe o valor total do pacote (maior que zero).");
      el.setupPromoValor.focus();
      return;
    }
    setupPromocoesDraft.push({
      id: generateId("t"),
      qtd: qtd,
      valorTotal: round2(vt),
    });
    el.setupPromoQtd.value = "";
    el.setupPromoValor.value = "";
    renderSetupPromocoesLista();
  }

  function syncPrecoPadraoInput() {
    var c = getActiveCartela();
    if (!c) return;
    el.inputPrecoPadrao.value = c.precoPadrao > 0 ? String(c.precoPadrao) : "";
  }

  function openCartelaView() {
    if (!isAdminSession()) {
      showLoginScreen();
      return;
    }
    var c = getActiveCartela();
    if (!c) {
      showLista();
      return;
    }
    if (loteSelectionMode) {
      exitLoteSelectionDiscard();
    }
    normalizeCartela(c);
    showScreenCartela();
    el.inputTitle.value = c.title || "";
    el.inputTotal.value = String(c.total);
    syncPrecoPadraoInput();
    renderPromocoesLista();
    renderGrid();
    updateToolbar();
    updateFinancePanel();
  }

  function renderGrid() {
    var c = getActiveCartela();
    if (!c) return;

    el.numberGrid.innerHTML = "";
    el.numberGrid.classList.toggle("selection-active", loteSelectionMode);
    var cols = Math.min(16, Math.max(8, Math.ceil(Math.sqrt(c.total))));
    el.numberGrid.style.gridTemplateColumns = "repeat(" + cols + ", minmax(48px, 1fr))";

    for (var n = 1; n <= c.total; n++) {
      var key = String(n);
      var venda = c.vendas[key];
      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", labelCelula(n, venda));

      var span = document.createElement("span");
      span.className = "cell-num";
      span.textContent = String(n);
      cell.appendChild(span);

      if (venda) {
        cell.classList.add("cell-sold");
        cell.classList.add(venda.pago ? "cell-paid" : "cell-unpaid");
      } else if (loteSelectionMode && loteSelectedNums.indexOf(n) >= 0) {
        cell.classList.add("cell-selected");
      }

      cell.dataset.numero = key;
      cell.addEventListener("click", onCellClick);
      el.numberGrid.appendChild(cell);
    }
  }

  function labelCelula(n, venda) {
    if (loteSelectionMode && !venda) {
      return (
        "Número " +
        n +
        (loteSelectedNums.indexOf(n) >= 0
          ? ", selecionado. Toque para desmarcar."
          : ", disponível. Toque para selecionar.")
      );
    }
    if (!venda) return "Número " + n + ", disponível";
    return (
      "Número " +
      n +
      ", vendido, " +
      (venda.pago ? "pago" : "não pago") +
      ". Toque para editar."
    );
  }

  function updateToolbar() {
    var c = getActiveCartela();
    if (!c) return;

    el.cartelaTitle.value = c.title || "";
    var v = countVendidos(c);
    var pagos = countPagos(c);
    el.progressText.textContent = v + " / " + c.total + " vendidos";
    var podeSortear = pagos > 0;
    el.btnSortear.disabled = !podeSortear;
    el.btnSortear.title = podeSortear
      ? "Sorteia aleatoriamente entre os " + pagos + " número(s) com pagamento confirmado"
      : v > 0
        ? "Marque como pago ao menos um número vendido para poder sortear"
        : "Venda pelo menos um número e confirme o pagamento para poder sortear";
    if (el.btnRelatorioPdf) {
      el.btnRelatorioPdf.disabled = v === 0;
    }
  }

  var RELATORIO_CSS =
    "body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;margin:0;color:#111;} h1{font-size:1.25rem;margin:0 0 6px;font-weight:700;} .meta{color:#444;font-size:0.88rem;margin:0 0 16px;} table{width:100%;border-collapse:collapse;font-size:0.88rem;} th,td{border:1px solid #bbb;padding:7px 9px;} th{background:#eee;text-align:left;font-weight:600;} td:nth-child(4),th:nth-child(4){text-align:right;} .totais{margin-top:16px;font-size:0.92rem;line-height:1.55;} .totais p{margin:4px 0;}";

  function escapeHtml(text) {
    if (text == null) return "";
    var d = document.createElement("div");
    d.textContent = String(text);
    return d.innerHTML;
  }

  function sanitizeFilename(s) {
    try {
      var x = String(s || "relatorio")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9\-]+/g, "-")
        .replace(/^-|-$/g, "");
      return (x || "relatorio").slice(0, 80);
    } catch (e) {
      return "relatorio-vendas";
    }
  }

  function buildRelatorioBodyHtml(c) {
    var titulo = c.title && String(c.title).trim() ? c.title : "Sem título";
    var dataStr = new Date().toLocaleString("pt-BR");
    var keys = Object.keys(c.vendas).map(function (k) {
      return parseInt(k, 10);
    });
    keys.sort(function (a, b) {
      return a - b;
    });
    var rows = [];
    for (var i = 0; i < keys.length; i++) {
      var num = keys[i];
      var v = c.vendas[String(num)];
      var val = typeof v.valor === "number" ? v.valor : 0;
      rows.push(
        "<tr><td>" +
          num +
          "</td><td>" +
          escapeHtml(v.nome) +
          "</td><td>" +
          (v.pago ? "Sim" : "Não") +
          '</td><td style="text-align:right">' +
          formatMoney(val) +
          "</td></tr>"
      );
    }
    var t = totaisCartela(c);
    return (
      "<h1>" +
      escapeHtml(titulo) +
      "</h1>" +
      "<p class=\"meta\">Gerado em " +
      escapeHtml(dataStr) +
      " · " +
      keys.length +
      " venda(s) · Total de números na cartela: " +
      c.total +
      "</p>" +
      "<table><thead><tr><th>Número</th><th>Nome</th><th>Pago</th><th>Valor</th></tr></thead><tbody>" +
      rows.join("") +
      "</tbody></table>" +
      '<div class="totais"><p><strong>Total em vendas:</strong> ' +
      formatMoney(t.geral) +
      "</p><p><strong>Recebido (pago):</strong> " +
      formatMoney(t.recebido) +
      "</p><p><strong>A receber:</strong> " +
      formatMoney(t.pendente) +
      "</p></div>"
    );
  }

  function abrirRelatorioImpressao() {
    var c = getActiveCartela();
    if (!c || countVendidos(c) === 0) {
      alert("Não há números vendidos para o relatório.");
      return;
    }
    var titulo = c.title && String(c.title).trim() ? c.title : "Cartela";
    var body = buildRelatorioBodyHtml(c);
    var html =
      "<!DOCTYPE html><html lang=\"pt-BR\"><head><meta charset=\"UTF-8\"/><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/><title>Relatório — " +
      escapeHtml(titulo) +
      "</title><style>" +
      RELATORIO_CSS +
      " @media print{.no-print{display:none}} button{padding:10px 16px;font-size:1rem;cursor:pointer;margin-top:16px}</style></head><body>" +
      body +
      "<p class=\"no-print\"><button type=\"button\" onclick=\"window.print()\">Imprimir ou salvar como PDF</button></p></body></html>";
    var w = window.open("", "_blank");
    if (!w) {
      alert("Permita pop-ups para abrir o relatório.");
      return;
    }
    w.document.write(html);
    w.document.close();
  }

  function baixarRelatorioPdfArquivo() {
    var c = getActiveCartela();
    if (!c || countVendidos(c) === 0) {
      alert("Não há números vendidos para o relatório.");
      return;
    }
    if (typeof html2pdf === "undefined") {
      abrirRelatorioImpressao();
      return;
    }
    // Conteúdo em left:-10000px não é pintado em vários navegadores → html2canvas/PDF em branco.
    // Overlay branco cobre a tela só durante a captura (pointer-events:none).
    var outer = document.createElement("div");
    outer.setAttribute("aria-hidden", "true");
    outer.style.cssText =
      "position:fixed;inset:0;z-index:2147483646;overflow:auto;background:#fff;pointer-events:none;";
    var inner = document.createElement("div");
    inner.style.cssText =
      "width:210mm;max-width:100%;margin:0 auto;padding:12mm;box-sizing:border-box;background:#fff;color:#111;font-family:system-ui,sans-serif;font-size:11pt;";
    inner.innerHTML = "<style>" + RELATORIO_CSS + "</style>" + buildRelatorioBodyHtml(c);
    outer.appendChild(inner);
    document.body.appendChild(outer);
    var fn = sanitizeFilename(c.title && String(c.title).trim() ? c.title : "relatorio") + "-vendas.pdf";
    var opt = {
      margin: [10, 10, 10, 10],
      filename: fn,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    function removeOverlay() {
      if (outer.parentNode) document.body.removeChild(outer);
    }
    function runPdf() {
      html2pdf()
        .set(opt)
        .from(inner)
        .save()
        .then(removeOverlay)
        .catch(function () {
          removeOverlay();
          abrirRelatorioImpressao();
        });
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(runPdf);
    });
  }

  function gerarRelatorioPDF() {
    if (typeof html2pdf !== "undefined") {
      baixarRelatorioPdfArquivo();
    } else {
      abrirRelatorioImpressao();
    }
  }

  function buildSelectAplicarPreco(c) {
    var sel = el.selectAplicarPreco;
    sel.innerHTML = "";
    var o0 = document.createElement("option");
    o0.value = "";
    o0.textContent = "Digite ou escolha abaixo";
    sel.appendChild(o0);

    var op = document.createElement("option");
    op.value = "padrao";
    op.textContent =
      "Preço padrão" + (c.precoPadrao > 0 ? " (" + formatMoney(c.precoPadrao) + " cada)" : " (não definido)");
    sel.appendChild(op);

    for (var i = 0; i < c.promocoes.length; i++) {
      var p = c.promocoes[i];
      var por = round2(p.valorTotal / p.qtd);
      var opt = document.createElement("option");
      opt.value = "promo:" + p.id;
      opt.textContent =
        p.qtd +
        " por " +
        formatMoney(p.valorTotal) +
        " (" +
        formatMoney(por) +
        " / número)";
      sel.appendChild(opt);
    }
  }

  function aplicarValorDoSelect() {
    var c = getActiveCartela();
    if (!c) return;
    var v = el.selectAplicarPreco.value;
    if (v === "padrao") {
      el.inputValor.value = c.precoPadrao > 0 ? String(c.precoPadrao) : "0";
      return;
    }
    if (v.indexOf("promo:") === 0) {
      var pid = v.slice(6);
      for (var i = 0; i < c.promocoes.length; i++) {
        if (c.promocoes[i].id === pid) {
          var por = round2(c.promocoes[i].valorTotal / c.promocoes[i].qtd);
          el.inputValor.value = String(por);
          return;
        }
      }
    }
  }

  function onCellClick(ev) {
    var c = getActiveCartela();
    if (!c) return;

    var btn = ev.currentTarget;
    var num = parseInt(btn.dataset.numero, 10);
    if (isNaN(num)) return;
    var key = String(num);
    var venda = c.vendas[key];

    if (loteSelectionMode) {
      if (venda) return;
      var idx = loteSelectedNums.indexOf(num);
      if (idx >= 0) {
        loteSelectedNums.splice(idx, 1);
      } else {
        loteSelectedNums.push(num);
        loteSelectedNums.sort(function (a, b) {
          return a - b;
        });
      }
      renderGrid();
      updateSelectionBarText();
      return;
    }

    modalNumeroAtual = num;

    el.modalNumero.textContent = String(num);
    el.inputNome.value = venda ? venda.nome : "";
    el.inputPago.checked = venda ? !!venda.pago : true;
    el.btnRemoverVenda.classList.toggle("hidden", !venda);

    buildSelectAplicarPreco(c);
    if (venda && typeof venda.valor === "number") {
      el.inputValor.value = String(venda.valor);
    } else {
      el.inputValor.value = c.precoPadrao > 0 ? String(c.precoPadrao) : "0";
    }
    el.selectAplicarPreco.value = "";

    el.modalVenda.classList.remove("hidden");
    el.modalOverlay.classList.remove("hidden");
    el.inputNome.focus();
  }

  function fecharModalVenda() {
    el.modalVenda.classList.add("hidden");
    el.modalOverlay.classList.add("hidden");
    modalNumeroAtual = null;
  }

  function onSubmitVenda(ev) {
    ev.preventDefault();
    var c = getActiveCartela();
    if (!c || modalNumeroAtual == null) return;

    var nome = el.inputNome.value.trim();
    if (!nome) {
      el.inputNome.focus();
      return;
    }
    var valor = round2(parseMoneyInput(el.inputValor.value));
    var key = String(modalNumeroAtual);
    c.vendas[key] = {
      nome: nome,
      pago: el.inputPago.checked,
      valor: valor,
    };
    saveStore();
    fecharModalVenda();
    renderGrid();
    updateToolbar();
    updateFinancePanel();
    renderListaCartelas();
  }

  function onRemoverVenda() {
    var c = getActiveCartela();
    if (!c || modalNumeroAtual == null) return;
    var key = String(modalNumeroAtual);
    delete c.vendas[key];
    saveStore();
    fecharModalVenda();
    renderGrid();
    updateToolbar();
    updateFinancePanel();
    renderListaCartelas();
  }

  function abrirSorteio() {
    var c = getActiveCartela();
    if (!c) return;

    var keys = Object.keys(c.vendas).filter(function (k) {
      return c.vendas[k].pago;
    });
    if (keys.length === 0) {
      alert(
        "Não há números com pagamento confirmado. Marque \"pago\" nas vendas antes de sortear."
      );
      return;
    }

    el.modalSorteio.classList.remove("hidden");
    el.modalOverlay.classList.remove("hidden");
    el.sorteioResult.classList.add("hidden");
    el.sorteioHint.classList.remove("hidden");
    el.btnFecharSorteio.classList.add("hidden");
    el.sorteioHint.textContent = "Embaralhando entre os números já pagos…";

    var candidatos = keys.map(function (k) {
      return parseInt(k, 10);
    });
    var escolhido = candidatos[Math.floor(Math.random() * candidatos.length)];
    var nome = c.vendas[String(escolhido)].nome;

    var delay = 1800 + Math.random() * 800;
    setTimeout(function () {
      el.sorteioHint.classList.add("hidden");
      el.sorteioNumero.textContent = String(escolhido);
      el.sorteioNome.textContent = nome;
      el.sorteioResult.classList.remove("hidden");
      el.btnFecharSorteio.classList.remove("hidden");
    }, delay);
  }

  function fecharSorteio() {
    el.modalSorteio.classList.add("hidden");
    el.modalOverlay.classList.add("hidden");
  }

  function getPromoById(c, id) {
    for (var i = 0; i < c.promocoes.length; i++) {
      if (c.promocoes[i].id === id) return c.promocoes[i];
    }
    return null;
  }

  function fecharModalVendaLote() {
    if (!el.modalVendaLote) return;
    el.modalVendaLote.classList.add("hidden");
    if (el.modalVenda.classList.contains("hidden") && el.modalSorteio.classList.contains("hidden")) {
      el.modalOverlay.classList.add("hidden");
    }
  }

  function rebuildLotePrecoSelect(c, nums) {
    if (!el.selectLotePreco) return;
    var sel = el.selectLotePreco;
    var prev = sel.value;
    sel.innerHTML = "";
    var n = nums.length;
    var o1 = document.createElement("option");
    o1.value = "padrao";
    o1.textContent =
      "Preço padrão × " +
      (n > 0 ? n : "?") +
      " número(s)" +
      (c.precoPadrao > 0 ? " (" + formatMoney(c.precoPadrao) + " cada)" : "");
    sel.appendChild(o1);

    for (var i = 0; i < c.promocoes.length; i++) {
      var p = c.promocoes[i];
      if (n > 0 && p.qtd === n) {
        var opt = document.createElement("option");
        opt.value = "promo:" + p.id;
        opt.textContent =
          "Promoção: " + p.qtd + " por " + formatMoney(p.valorTotal) + " (pacote)";
        sel.appendChild(opt);
      }
    }

    var o2 = document.createElement("option");
    o2.value = "manual";
    o2.textContent = "Informar valor total manualmente";
    sel.appendChild(o2);

    var foundPrev = false;
    for (var ii = 0; ii < sel.options.length; ii++) {
      if (sel.options[ii].value === prev) {
        sel.selectedIndex = ii;
        foundPrev = true;
        break;
      }
    }
    if (!foundPrev) {
      if (n > 0) {
        var firstPromo = sel.querySelector('option[value^="promo:"]');
        if (firstPromo) sel.value = firstPromo.value;
        else sel.value = "padrao";
      } else {
        sel.value = "padrao";
      }
    }
  }

  function updateLoteManualWrap() {
    if (!el.selectLotePreco || !el.wrapLoteValorManual) return;
    var manual = el.selectLotePreco.value === "manual";
    el.wrapLoteValorManual.classList.toggle("hidden", !manual);
  }

  function refreshLoteUI() {
    var c = getActiveCartela();
    if (!c || !el.inputNumerosLote) return;
    var parsed = parseNumerosLote(el.inputNumerosLote.value, c.total);
    var preview = el.lotePreview;

    if (parsed.error) {
      preview.textContent = parsed.error;
      preview.className = "lote-preview lote-err";
      el.loteSplitHint.textContent = "";
      rebuildLotePrecoSelect(c, []);
      updateLoteManualWrap();
      return;
    }

    var nums = parsed.nums || [];
    if (nums.length === 0) {
      preview.textContent = "Digite os números acima.";
      preview.className = "lote-preview";
      el.loteSplitHint.textContent = "";
      rebuildLotePrecoSelect(c, []);
      updateLoteManualWrap();
      return;
    }

    var ocupados = [];
    for (var i = 0; i < nums.length; i++) {
      if (c.vendas[String(nums[i])]) ocupados.push(nums[i]);
    }
    if (ocupados.length > 0) {
      preview.textContent = "Já vendidos: " + ocupados.join(", ");
      preview.className = "lote-preview lote-err";
      el.loteSplitHint.textContent = "";
      rebuildLotePrecoSelect(c, nums);
      updateLoteManualWrap();
      return;
    }

    preview.textContent =
      nums.length + " número(s): " + nums.join(", ") + " — todos disponíveis.";
    preview.className = "lote-preview lote-ok";
    rebuildLotePrecoSelect(c, nums);
    updateLoteManualWrap();

    var mode = el.selectLotePreco.value;
    var total = 0;
    if (mode === "padrao") {
      total = round2(nums.length * c.precoPadrao);
    } else if (mode.indexOf("promo:") === 0) {
      var pr = getPromoById(c, mode.slice(6));
      if (pr) total = pr.valorTotal;
    } else if (mode === "manual") {
      total = round2(parseMoneyInput(el.inputLoteValorTotal.value));
    }

    var partes = splitTotalReais(total, nums.length);
    var igual = true;
    for (var j = 1; j < partes.length; j++) {
      if (round2(partes[j]) !== round2(partes[0])) igual = false;
    }
    var cada = igual
      ? formatMoney(partes[0])
      : formatMoney(partes[0]) + " a " + formatMoney(partes[partes.length - 1]);
    var hint = "Total do lote: " + formatMoney(total) + " → " + cada + " por número.";
    if (mode === "padrao" && c.precoPadrao <= 0 && nums.length > 0) {
      hint +=
        " (preço padrão zero — use promoção ou valor manual.)";
    }
    el.loteSplitHint.textContent = hint;
  }

  function abrirModalVendaLote() {
    var c = getActiveCartela();
    if (!c || !el.modalVendaLote) return;
    if (loteSelectionMode) {
      exitLoteSelectionDiscard();
    }
    el.inputNumerosLote.value = "";
    el.inputNomeLote.value = "";
    el.inputPagoLote.checked = true;
    el.inputLoteValorTotal.value = "";
    el.lotePreview.textContent = "";
    el.lotePreview.className = "lote-preview";
    el.loteSplitHint.textContent = "";
    rebuildLotePrecoSelect(c, []);
    el.selectLotePreco.value = "padrao";
    updateLoteManualWrap();
    refreshLoteUI();
    el.modalVendaLote.classList.remove("hidden");
    el.modalOverlay.classList.remove("hidden");
    el.inputNumerosLote.focus();
  }

  function onSubmitVendaLote(ev) {
    ev.preventDefault();
    var c = getActiveCartela();
    if (!c || !el.inputNumerosLote) return;
    var parsed = parseNumerosLote(el.inputNumerosLote.value, c.total);
    if (parsed.error) {
      alert(parsed.error);
      return;
    }
    var nums = parsed.nums || [];
    if (nums.length === 0) {
      alert("Informe ao menos um número.");
      return;
    }
    for (var i = 0; i < nums.length; i++) {
      if (c.vendas[String(nums[i])]) {
        alert("O número " + nums[i] + " já foi vendido.");
        return;
      }
    }
    var nome = el.inputNomeLote.value.trim();
    if (!nome) {
      el.inputNomeLote.focus();
      return;
    }
    var mode = el.selectLotePreco.value;
    var total = 0;
    if (mode === "padrao") {
      total = round2(nums.length * c.precoPadrao);
    } else if (mode.indexOf("promo:") === 0) {
      var pr = getPromoById(c, mode.slice(6));
      if (!pr || pr.qtd !== nums.length) {
        alert("Escolha uma promoção com a mesma quantidade de números informados.");
        return;
      }
      total = pr.valorTotal;
    } else if (mode === "manual") {
      total = round2(parseMoneyInput(el.inputLoteValorTotal.value));
    }

    var partes = splitTotalReais(total, nums.length);
    var pago = el.inputPagoLote.checked;
    for (var j = 0; j < nums.length; j++) {
      c.vendas[String(nums[j])] = {
        nome: nome,
        pago: pago,
        valor: partes[j],
      };
    }
    saveStore();
    fecharModalVendaLote();
    renderGrid();
    updateToolbar();
    updateFinancePanel();
    renderListaCartelas();
  }

  function onNovaCartela() {
    showLista();
    el.formSetup.scrollIntoView({ behavior: "smooth", block: "nearest" });
    el.inputTitle.focus();
  }

  function onTitleInput() {
    var c = getActiveCartela();
    if (!c) return;
    c.title = el.cartelaTitle.value;
    saveStore();
    renderListaCartelas();
  }

  function onPrecoPadraoChange() {
    var c = getActiveCartela();
    if (!c) return;
    c.precoPadrao = round2(parseMoneyInput(el.inputPrecoPadrao.value));
    saveStore();
  }

  function onAddPromo() {
    var c = getActiveCartela();
    if (!c) return;
    var qtd = parseInt(el.promoQtd.value, 10);
    var vt = parseMoneyInput(el.promoValorTotal.value);
    if (isNaN(qtd) || qtd < 2) {
      alert("Informe a quantidade de números na promoção (mínimo 2).");
      el.promoQtd.focus();
      return;
    }
    if (vt <= 0) {
      alert("Informe o valor total do pacote (maior que zero).");
      el.promoValorTotal.focus();
      return;
    }
    c.promocoes.push({
      id: generateId("p"),
      qtd: qtd,
      valorTotal: round2(vt),
    });
    el.promoQtd.value = "";
    el.promoValorTotal.value = "";
    saveStore();
    renderPromocoesLista();
  }

  el.formSetup.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var title = el.inputTitle.value.trim();
    var total = parseInt(el.inputTotal.value, 10);
    if (isNaN(total) || total < 1 || total > 5000) {
      alert("Informe um total entre 1 e 5000.");
      return;
    }
    var precoIni = el.inputPrecoSetup
      ? round2(parseMoneyInput(el.inputPrecoSetup.value))
      : 0;
    var promosNovas = setupPromocoesDraft.map(function (p) {
      return {
        id: generateId("p"),
        qtd: p.qtd,
        valorTotal: p.valorTotal,
      };
    });
    var novo = {
      id: generateId("c"),
      title: title,
      total: total,
      precoPadrao: precoIni,
      promocoes: promosNovas,
      vendas: {},
      createdAt: Date.now(),
    };
    store.cartelas.push(novo);
    store.activeId = novo.id;
    saveStore();
    setupPromocoesDraft = [];
    renderSetupPromocoesLista();
    el.inputTitle.value = "";
    el.inputTotal.value = "100";
    if (el.inputPrecoSetup) el.inputPrecoSetup.value = "";
    openCartelaView();
    renderListaCartelas();
  });

  el.formVenda.addEventListener("submit", onSubmitVenda);
  el.btnCancelarVenda.addEventListener("click", fecharModalVenda);
  el.btnRemoverVenda.addEventListener("click", onRemoverVenda);
  el.btnSortear.addEventListener("click", abrirSorteio);
  el.btnFecharSorteio.addEventListener("click", fecharSorteio);
  el.btnNovaCartela.addEventListener("click", onNovaCartela);
  if (el.btnRelatorioPdf) el.btnRelatorioPdf.addEventListener("click", gerarRelatorioPDF);
  el.btnVoltarCartelas.addEventListener("click", function () {
    showLista();
  });
  el.cartelaTitle.addEventListener("input", onTitleInput);
  el.cartelaTitle.addEventListener("change", onTitleInput);

  el.inputPrecoPadrao.addEventListener("change", onPrecoPadraoChange);
  el.inputPrecoPadrao.addEventListener("blur", onPrecoPadraoChange);
  el.btnAddPromo.addEventListener("click", onAddPromo);
  if (el.btnSetupAddPromo) el.btnSetupAddPromo.addEventListener("click", onSetupAddPromo);
  if (el.btnVendaLote) el.btnVendaLote.addEventListener("click", abrirModalVendaLote);
  if (el.formVendaLote) el.formVendaLote.addEventListener("submit", onSubmitVendaLote);
  if (el.btnCancelarLote) el.btnCancelarLote.addEventListener("click", fecharModalVendaLote);
  if (el.inputNumerosLote) {
    el.inputNumerosLote.addEventListener("input", refreshLoteUI);
  }
  if (el.selectLotePreco) {
    el.selectLotePreco.addEventListener("change", function () {
      updateLoteManualWrap();
      refreshLoteUI();
    });
  }
  if (el.inputLoteValorTotal) {
    el.inputLoteValorTotal.addEventListener("input", refreshLoteUI);
  }
  if (el.btnLoteSelecionarGrade) {
    el.btnLoteSelecionarGrade.addEventListener("click", enterLoteGridSelection);
  }
  if (el.btnSelectionAplicar) el.btnSelectionAplicar.addEventListener("click", applyLoteSelection);
  if (el.btnSelectionLimpar) el.btnSelectionLimpar.addEventListener("click", limparLoteSelection);
  if (el.btnSelectionCancelar) el.btnSelectionCancelar.addEventListener("click", cancelLoteSelection);

  el.selectAplicarPreco.addEventListener("change", function () {
    aplicarValorDoSelect();
  });

  el.modalOverlay.addEventListener("click", function () {
    if (!el.modalSorteio.classList.contains("hidden")) return;
    if (el.modalPublicReserva && !el.modalPublicReserva.classList.contains("hidden")) {
      fecharModalPublica();
      return;
    }
    if (el.modalVendaLote && !el.modalVendaLote.classList.contains("hidden")) {
      fecharModalVendaLote();
      return;
    }
    fecharModalVenda();
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
      if (!el.modalSorteio.classList.contains("hidden")) {
        fecharSorteio();
      } else if (el.modalPublicReserva && !el.modalPublicReserva.classList.contains("hidden")) {
        fecharModalPublica();
      } else if (loteSelectionMode) {
        cancelLoteSelection();
      } else if (el.modalVendaLote && !el.modalVendaLote.classList.contains("hidden")) {
        fecharModalVendaLote();
      } else {
        fecharModalVenda();
      }
    }
  });

  if (el.btnChooseAdmin) {
    el.btnChooseAdmin.addEventListener("click", function () {
      showLoginScreen();
    });
  }
  if (el.btnChoosePublic) {
    el.btnChoosePublic.addEventListener("click", function () {
      showPublicMode();
    });
  }
  if (el.btnLoginVoltar) {
    el.btnLoginVoltar.addEventListener("click", function () {
      showChooseMode();
    });
  }
  if (el.formLogin) {
    el.formLogin.addEventListener("submit", function (ev) {
      ev.preventDefault();
      ensureSettings();
      if (el.loginMsg) el.loginMsg.textContent = "";
      var primeiro = !store.settings.adminPwHash;

      function fail(msg) {
        if (el.loginMsg) el.loginMsg.textContent = msg;
      }

      if (primeiro) {
        var n1 = el.inputLoginNova ? el.inputLoginNova.value : "";
        var n2 = el.inputLoginNova2 ? el.inputLoginNova2.value : "";
        if (n1.length < 4) {
          fail("Use uma senha com pelo menos 4 caracteres.");
          return;
        }
        if (n1 !== n2) {
          fail("As senhas não coincidem.");
          return;
        }
        sha256Hex(n1)
          .then(function (hash) {
            store.settings.adminPwHash = hash;
            saveStore();
            setAdminSession();
            enterAdminFromLogin();
          })
          .catch(function () {
            fail("Não foi possível criar a senha neste navegador.");
          });
        return;
      }

      var senha = el.inputLoginSenha ? el.inputLoginSenha.value : "";
      if (!senha) {
        fail("Digite a senha.");
        return;
      }
      sha256Hex(senha)
        .then(function (hash) {
          if (hash === store.settings.adminPwHash) {
            setAdminSession();
            enterAdminFromLogin();
          } else {
            fail("Senha incorreta.");
          }
        })
        .catch(function () {
          fail("Login indisponível neste navegador.");
        });
    });
  }
  if (el.btnPublicVoltar) {
    el.btnPublicVoltar.addEventListener("click", function () {
      showChooseMode();
    });
  }
  if (el.btnAdminSairSetup) {
    el.btnAdminSairSetup.addEventListener("click", function () {
      exitAdminToChoose();
    });
  }
  if (el.btnAdminSairCartela) {
    el.btnAdminSairCartela.addEventListener("click", function () {
      exitAdminToChoose();
    });
  }
  if (el.btnAdminIrPublico) {
    el.btnAdminIrPublico.addEventListener("click", function () {
      showPublicMode();
    });
  }
  if (el.btnAdminIrPublicoToolbar) {
    el.btnAdminIrPublicoToolbar.addEventListener("click", function () {
      showPublicMode();
    });
  }
  if (el.btnSettingsSalvarPix) {
    el.btnSettingsSalvarPix.addEventListener("click", function () {
      salvarSettingsPix();
    });
  }
  if (el.formPublicReserva) {
    el.formPublicReserva.addEventListener("submit", onSubmitPublicReserva);
  }
  if (el.btnPublicCancelar) {
    el.btnPublicCancelar.addEventListener("click", function () {
      fecharModalPublica();
    });
  }
  if (el.btnPublicFecharPix) {
    el.btnPublicFecharPix.addEventListener("click", function () {
      fecharModalPublica();
    });
  }
  if (el.btnPublicCopiarPix) {
    el.btnPublicCopiarPix.addEventListener("click", function () {
      if (!el.textareaPublicPix) return;
      el.textareaPublicPix.select();
      try {
        document.execCommand("copy");
        if (el.btnPublicCopiarPix) el.btnPublicCopiarPix.textContent = "Copiado!";
        setTimeout(function () {
          if (el.btnPublicCopiarPix) el.btnPublicCopiarPix.textContent = "Copiar código PIX";
        }, 2000);
      } catch (e) {
        alert("Copie manualmente o texto do campo.");
      }
    });
  }

  loadStore();
  renderSetupPromocoesLista();

  var hash = (location.hash || "").replace(/^#/, "").toLowerCase();
  if (hash === "comprar" || hash === "public") {
    showPublicMode();
  } else if (isAdminSession()) {
    refreshAdminSettingsInputs();
    if (store.activeId && getCartela(store.activeId)) {
      openCartelaView();
      renderListaCartelas();
    } else {
      enterAdminFromLogin();
    }
  } else if (hash === "admin") {
    showLoginScreen();
  } else {
    showChooseMode();
  }
})();
