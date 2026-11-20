/* Componentes de interface reaproveitados pelas páginas. */
(function () {
  "use strict";
  var RL = window.RL;
  var ui = (RL.ui = {});
  var esc = RL.esc;

  /* ---------- ícones (traço fino, desenhados para a RL) ---------- */
  var I = {
    busca: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="8.6" cy="8.6" r="6.1"/><path d="M13.2 13.2L18 18" stroke-linecap="round"/></svg>',
    sacola: '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 7.5h14l-1 10.6a1.6 1.6 0 0 1-1.6 1.4H6.6A1.6 1.6 0 0 1 5 18.1z" stroke-linejoin="round"/><path d="M7.8 9.5V6.3a3.2 3.2 0 0 1 6.4 0v3.2" stroke-linecap="round"/></svg>',
    menu: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path class="l1" d="M3 7h14"/><path class="l2" d="M3 13h14"/></svg>',
    fechar: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12"/></svg>',
    ant: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 2L4 7l5 5"/></svg>',
    prox: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 2l5 5-5 5"/></svg>',
    seta: '<svg viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 1l3 3-3 3"/></svg>',
    mais: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>',
    ok: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5"/></svg>',
    okCirculo: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="M6.4 10.2l2.4 2.3 4.8-5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    conversa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M4 11.5a7.5 7.5 0 1 1 3.4 6.3L4 19l1.1-3.3A7.4 7.4 0 0 1 4 11.5z"/><path d="M9 10.2c.3 1.7 1.7 3.4 3.6 4" stroke-linecap="round"/><path d="M9 10.2l.9-.9M12.6 14.2l.9-.9" stroke-linecap="round"/></svg>',
    caminhao: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5h16v13H3zM19 13h5.5l4 4.5v4H19"/><circle cx="8.5" cy="23" r="2.4" fill="#fff"/><circle cx="23.5" cy="23" r="2.4" fill="#fff"/></svg>',
    loja: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M5 13v14h22V13"/><path d="M3.5 13l3-7h19l3 7a3.4 3.4 0 0 1-6.3 0 3.4 3.4 0 0 1-6.2 0 3.4 3.4 0 0 1-6.2 0A3.4 3.4 0 0 1 3.5 13z"/><path d="M13 27v-7h6v7"/></svg>',
    escudo: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M16 3.5l10 4v7.3c0 6.6-4.2 11.4-10 13.7C10.2 26.2 6 21.4 6 14.8V7.5z"/><path d="M11.5 16l3.2 3.1 5.8-6.3" stroke-linecap="round"/></svg>',
    cartao: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="7" width="25" height="18" rx="3"/><path d="M3.5 12.5h25M8 20h6" stroke-linecap="round"/></svg>',
    troca: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 13a9.5 9.5 0 0 1 16.8-4.4L26 11"/><path d="M26 5.5V11h-5.5"/><path d="M25 19a9.5 9.5 0 0 1-16.8 4.4L6 21"/><path d="M6 26.5V21h5.5"/></svg>',
    bateria: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="10" width="22" height="12" rx="3.2"/><path d="M28.5 14v4" stroke-linecap="round"/><rect x="6.5" y="13" width="12" height="6" rx="1.4" fill="currentColor" stroke="none"/></svg>',
    boleto: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M6 8v16M9.5 8v16M12 8v16M15.5 8v16M18.5 8v16M22 8v16M24 8v16M27 8v16"/></svg>',
    raio: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M18 3.5L7 18h8l-1.5 10.5L25 14h-8z"/></svg>',
    dinheiro: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="8" width="25" height="16" rx="2.5"/><circle cx="16" cy="16" r="3.6"/><path d="M8 12v.01M24 20v.01" stroke-linecap="round" stroke-width="2.2"/></svg>',
    pessoa: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="16" cy="11" r="5"/><path d="M6.5 27c.8-5.3 4.6-8.5 9.5-8.5s8.7 3.2 9.5 8.5" stroke-linecap="round"/></svg>',
    iphone: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="9" y="3.5" width="14" height="25" rx="3"/><path d="M14 6.5h4" stroke-linecap="round"/></svg>',
    ipad: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="5" y="4" width="22" height="24" rx="2.6"/></svg>',
    watch: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="14" height="14" rx="4"/><path d="M11 9l1-5h8l1 5M11 23l1 5h8l1-5"/></svg>',
    mac: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="7" width="20" height="14" rx="1.6"/><path d="M3 24.5h26l-1 2H4z"/></svg>',
    chip: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="16" height="16" rx="2.5"/><rect x="12.5" y="12.5" width="7" height="7" rx="1"/><path d="M12 4v4M16 4v4M20 4v4M12 24v4M16 24v4M20 24v4M4 12h4M4 16h4M4 20h4M24 12h4M24 16h4M24 20h4" stroke-linecap="round"/></svg>',
    camera: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="5" width="22" height="22" rx="6"/><circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="20.5" r="3.2"/><circle cx="20.5" cy="16.2" r="3.2"/></svg>',
    filtro: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3 6h14M6 10h8M8.5 14h3"/></svg>',
    lupaZoom: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="8.6" cy="8.6" r="6.1"/><path d="M13.2 13.2L18 18M8.6 6v5.2M6 8.6h5.2"/></svg>'
  };
  ui.icone = function (nome) { return I[nome] || ""; };

  /* ---------- pedaços ---------- */
  ui.nivelBateria = function (pct) { return pct >= 85 ? "ok" : pct >= 75 ? "medio" : "baixo"; };
  ui.bat = function (pct, texto) {
    if (!pct) return "";
    return '<span class="bat bat--' + ui.nivelBateria(pct) + '"><span class="bat__corpo"><span class="bat__nivel" style="width:' + pct + '%"></span></span>' + (texto || pct + "%") + "</span>";
  };
  ui.garantiaCurta = function (sku) { return sku.garantia.texto; };
  ui.condicaoNome = function (c) { return c === "lacrado" ? "Lacrado" : "Seminovo"; };

  /* imagem do produto, com reserva para modelo sem foto */
  ui.imagem = function (foto, familia, alt, tamanho, extra) {
    if (!foto) return '<span class="sem-foto" role="img" aria-label="' + esc(alt) + '">' + (I[familia] || I.iphone) + "</span>";
    return '<img src="' + RL.foto(foto, tamanho) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async"' + (extra || "") + ">";
  };

  /* ---------- cartão de produto (modelo + condição) ---------- */
  ui.cartaoGrupo = function (g, opts) {
    opts = opts || {};
    var p = g.produto, lac = g.condicao === "lacrado";
    var url = RL.url("produto.html", Object.assign({ id: p.id, cond: g.condicao }, opts.params || {}));
    var varios = g.unidades > 1 && g.skus.some(function (s) { return s.preco !== g.aPartirDe; });
    var extra = [];
    if (!lac && g.melhorBateria) extra.push('<span class="etiqueta">' + ui.bat(g.melhorBateria, (g.unidades > 1 ? "Bateria até " : "Bateria ") + g.melhorBateria + "%") + "</span>");
    if (g.garantiaMax === 12) extra.push('<span class="etiqueta">' + (lac ? "Garantia Apple de 1 ano" : (g.unidades > 1 ? "Até 1 ano de garantia" : "1 ano de garantia")) + "</span>");
    var cores = g.cores.map(function (c, i) {
      return '<button type="button" class="cor' + (i === 0 ? " is-ativa" : "") + '" style="background:' + (p.coresHex[c] || "#ccc") + '" data-foto="' + esc(p.fotoDaCor(c) || "") + '" data-cor="' + esc(c) + '" aria-label="' + esc(c) + '" title="' + esc(c) + '"></button>';
    }).join("");
    return (
      '<article class="cartao" data-grupo="' + esc(g.id) + '"' + (opts.rev ? ' data-rev style="--i:' + (opts.i || 0) + '"' : "") + ">" +
      '<a class="cartao__link" href="' + url + '" data-url="' + url + '" aria-label="' + esc(p.nome + ", " + ui.condicaoNome(g.condicao) + ", " + (varios ? "a partir de " : "") + RL.preco(g.aPartirDe)) + '"></a>' +
      '<div class="cartao__topo"><span class="selo' + (lac ? " selo--lacrado" : "") + '">' + ui.condicaoNome(g.condicao) + "</span>" +
      (g.unidades === 1 ? '<span class="selo">Última unidade</span>' : "") + "</div>" +
      '<div class="cartao__img">' + ui.imagem(g.foto, p.familia, p.nome + " " + (g.cores[0] || ""), "p") + "</div>" +
      (g.cores.length > 1 ? '<div class="cores" aria-label="Cores disponíveis">' + cores + "</div>" : '<div class="cores" aria-label="Cor">' + cores + "</div>") +
      '<h3 class="cartao__nome">' + esc(p.nome) + "</h3>" +
      '<p class="cartao__det">' + esc(g.armazenamentos.join(", ").replace(/, ([^,]*)$/, " e $1")) + "</p>" +
      (extra.length ? '<div class="cartao__extra">' + extra.join("") + "</div>" : "") +
      '<div class="cartao__rodape"><div><p class="cartao__preco">' + (varios ? "<small>A partir de</small>" : "") + RL.preco(g.aPartirDe) + '</p><p class="cartao__parc">' + RL.parcelas(g.aPartirDe) + "</p></div></div>" +
      "</article>"
    );
  };

  /* as bolinhas de cor trocam a foto do cartão (passando o mouse ou tocando) */
  ui.ligarCartoes = function (raiz) {
    raiz = raiz || document;
    if (raiz.__cartoes) return;
    raiz.__cartoes = true;
    function trocar(b) {
      var cartao = b.closest(".cartao");
      if (!cartao || b.classList.contains("is-ativa")) return;
      RL.$$(".cor", cartao).forEach(function (c) { c.classList.toggle("is-ativa", c === b); });
      var img = RL.$(".cartao__img img", cartao);
      var link = RL.$(".cartao__link", cartao);
      var base = link.getAttribute("data-url");
      link.href = base + (base.indexOf("?") > -1 ? "&" : "?") + "cor=" + encodeURIComponent(b.getAttribute("data-cor"));
      var nova = b.getAttribute("data-foto");
      if (!img || !nova) return;
      var src = RL.foto(nova, "p");
      if (img.getAttribute("src") === src) return;
      var pre = new Image();
      pre.onload = function () {
        img.classList.add("is-saindo");
        setTimeout(function () {
          img.src = src;
          img.alt = RL.$(".cartao__nome", cartao).textContent + " " + b.getAttribute("data-cor");
          img.classList.remove("is-saindo");
        }, 160);
      };
      pre.src = src;
    }
    raiz.addEventListener("mouseover", function (e) { var b = e.target.closest(".cartao .cor"); if (b && RL.temHover) trocar(b); });
    raiz.addEventListener("click", function (e) { var b = e.target.closest(".cartao .cor"); if (b) { e.preventDefault(); trocar(b); } });
  };

  /* ---------- aviso flutuante ---------- */
  var toastEl, toastT;
  ui.toast = function (html, ms) {
    if (!toastEl) {
      toastEl = RL.html('<div class="toast" role="status" aria-live="polite"></div>');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = html;
    requestAnimationFrame(function () { toastEl.classList.add("is-on"); });
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("is-on"); }, ms || 3600);
  };

  /* links com data-whats viram conversa no WhatsApp com a mensagem pronta */
  ui.ligarWhats = function (raiz) {
    RL.$$("[data-whats]", raiz).forEach(function (a) {
      a.href = RL.whats(a.getAttribute("data-whats"), a.getAttribute("data-vendedor"));
      a.target = "_blank";
      a.rel = "noopener";
    });
  };

  /* controle segmentado com a marca deslizando */
  ui.abas = function (el, aoTrocar) {
    var marca = el.querySelector(".abas__marca") || el.appendChild(RL.html('<span class="abas__marca" aria-hidden="true"></span>'));
    function mover() {
      var b = el.querySelector('[aria-selected="true"]');
      if (!b) return;
      marca.style.width = b.offsetWidth + "px";
      marca.style.transform = "translateX(" + b.offsetLeft + "px)";
    }
    el.addEventListener("click", function (e) {
      var b = e.target.closest("button[role=tab]");
      if (!b) return;
      RL.$$("button[role=tab]", el).forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      mover();
      aoTrocar(b.getAttribute("data-aba"));
    });
    window.addEventListener("resize", RL.debounce(mover, 100));
    mover();
    return mover;
  };
})();
