/* Núcleo: utilidades compartilhadas por todas as páginas. */
(function () {
  "use strict";

  var RL = (window.RL = window.RL || {});
  RL.config = window.RL_CONFIG;

  /* ---------- DOM ---------- */
  RL.$ = function (sel, root) { return (root || document).querySelector(sel); };
  RL.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  RL.html = function (str) {
    var t = document.createElement("template");
    t.innerHTML = String(str).trim();
    return t.content.childElementCount === 1 ? t.content.firstElementChild : t.content;
  };
  RL.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ---------- texto ---------- */
  RL.semAcento = function (s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
  };
  RL.slug = function (s) {
    return RL.semAcento(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  };
  RL.plural = function (n, um, varios) { return n + " " + (n === 1 ? um : varios); };

  /* ---------- números (preços em centavos) ---------- */
  var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 2 });
  RL.preco = function (centavos) {
    if (centavos == null) return "Consulte";
    return brl.format(centavos / 100).replace(/ /g, " ");
  };
  RL.parcelas = function (centavos) {
    var p = RL.config.pagamento;
    if (!centavos) return "";
    if (p.semJuros) return "ou " + p.parcelasCartao + "x de " + RL.preco(Math.ceil(centavos / p.parcelasCartao)) + " sem juros";
    return "ou em até " + p.parcelasCartao + "x no cartão";
  };
  RL.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  RL.lerp = function (a, b, t) { return a + (b - a) * t; };
  RL.trecho = function (t, a, b, ease) {
    var x = RL.clamp((t - a) / (b - a), 0, 1);
    return ease ? ease(x) : x;
  };
  RL.ease = {
    out: function (x) { return 1 - Math.pow(1 - x, 3); },
    inOut: function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  };
  RL.debounce = function (fn, ms) {
    var t;
    return function () {
      var a = arguments, s = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(s, a); }, ms);
    };
  };

  /* ---------- eventos ---------- */
  RL.on = function (nome, fn) { document.addEventListener("rl:" + nome, function (e) { fn(e.detail || {}); }); };
  RL.emit = function (nome, detail) { document.dispatchEvent(new CustomEvent("rl:" + nome, { detail: detail })); };

  /* ---------- armazenamento local ---------- */
  RL.store = {
    get: function (k, padrao) {
      try { var v = localStorage.getItem(k); return v == null ? padrao : JSON.parse(v); } catch (e) { return padrao; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* navegação privada: segue sem salvar */ }
    }
  };

  /* ---------- URL ---------- */
  RL.params = function () { return new URLSearchParams(location.search); };
  RL.url = function (pagina, params) {
    var q = new URLSearchParams();
    Object.keys(params || {}).forEach(function (k) {
      var v = params[k];
      if (v !== undefined && v !== null && v !== "" && v !== false) q.set(k, v);
    });
    var s = q.toString();
    return pagina + (s ? "?" + s : "");
  };

  /* ---------- imagens ---------- */
  RL.img = function (arquivo) { return "assets/img/" + arquivo; };
  RL.foto = function (base, tamanho) { return base ? "assets/produtos/" + base + "-" + (tamanho || "p") + ".webp" : ""; };

  /* ---------- WhatsApp ---------- */
  RL.vendedor = function (nome) {
    var vs = RL.config.vendedores;
    for (var i = 0; i < vs.length; i++) if (vs[i].nome === nome) return vs[i];
    return vs[0];
  };
  RL.whats = function (texto, nomeVendedor) {
    return "https://wa.me/" + RL.vendedor(nomeVendedor).whatsapp + "?text=" + encodeURIComponent(texto);
  };
  RL.telefone = function (numero) {
    var n = String(numero).replace(/^55/, "");
    return "(" + n.slice(0, 2) + ") " + n.slice(2, 7) + "-" + n.slice(7);
  };

  /* ---------- preferências do sistema ---------- */
  RL.menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  RL.temHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
})();
