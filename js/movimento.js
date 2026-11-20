/* Movimento: entradas ao rolar, vitrines com setas, carrossel do topo, cenas presas ao scroll e paralaxe. */
(function () {
  "use strict";
  var RL = window.RL;
  var mv = (RL.movimento = {});

  /* ---------- entradas ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (ents) {
    ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }) : null;
  mv.revelar = function (raiz) {
    RL.$$("[data-rev]:not(.is-in)", raiz).forEach(function (el) {
      if (!io || RL.menosMovimento) el.classList.add("is-in"); else io.observe(el);
    });
  };

  /* ---------- motor de scroll (um requestAnimationFrame para todas as cenas) ---------- */
  var cenas = [], pedido = false, vh = window.innerHeight;
  function quadro() {
    pedido = false;
    cenas.forEach(function (c) {
      var r = c.el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) { if (c.fora) return; c.fora = true; } else c.fora = false;
      var p;
      if (c.modo === "presa") {
        var topo = c.topo();
        var curso = r.height - (vh - topo);
        p = curso > 0 ? (topo - r.top) / curso : 0;
      } else {
        p = (vh - r.top) / (vh + r.height);
      }
      p = RL.clamp(p, 0, 1);
      if (p !== c.p || c.forcar) { c.forcar = false; c.p = p; c.fn(p, r); }
    });
  }
  function agendar() { if (!pedido) { pedido = true; requestAnimationFrame(quadro); } }
  window.addEventListener("scroll", agendar, { passive: true });
  window.addEventListener("resize", function () { vh = window.innerHeight; cenas.forEach(function (c) { c.forcar = true; }); agendar(); });

  /* modo "presa": a seção é mais alta que a tela e o conteúdo fica sticky; p vai de 0 a 1 durante o curso */
  mv.cena = function (el, fn, modo) {
    if (!el) return;
    cenas.push({
      el: el, fn: fn, modo: modo || "presa", forcar: true,
      topo: function () { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--cab-h")) || 0; }
    });
    agendar();
  };
  mv.atualizar = function () { cenas.forEach(function (c) { c.forcar = true; }); agendar(); };

  /* paralaxe leve em imagens marcadas com data-paralaxe="0.1" */
  mv.paralaxe = function (raiz) {
    if (RL.menosMovimento) return;
    RL.$$("[data-paralaxe]", raiz).forEach(function (el) {
      var f = parseFloat(el.getAttribute("data-paralaxe")) || 0.08;
      mv.cena(el.parentElement, function (p) { el.style.transform = "translate3d(0," + ((0.5 - p) * f * 100).toFixed(2) + "%,0)"; }, "visivel");
    });
  };

  /* ---------- vitrine com setas ---------- */
  mv.prateleira = function (el) {
    if (!el || el.__ok) return;
    el.__ok = true;
    var trilho = RL.$(".prateleira__trilho", el);
    var pas = RL.html('<div class="prateleira__pas"><button class="pa" type="button" aria-label="Anterior">' + RL.ui.icone("ant") + '</button><button class="pa" type="button" aria-label="Próximo">' + RL.ui.icone("prox") + "</button></div>");
    el.appendChild(pas);
    var ant = pas.children[0], prox = pas.children[1];
    function passo() {
      var item = trilho.children[0];
      var w = item ? item.getBoundingClientRect().width + 20 : 300;
      return Math.max(w, Math.floor((trilho.clientWidth * 0.8) / w) * w);
    }
    function estado() {
      ant.disabled = trilho.scrollLeft < 8;
      prox.disabled = trilho.scrollLeft + trilho.clientWidth > trilho.scrollWidth - 8;
      pas.hidden = trilho.scrollWidth <= trilho.clientWidth + 8;
    }
    ant.addEventListener("click", function () { trilho.scrollBy({ left: -passo(), behavior: RL.menosMovimento ? "auto" : "smooth" }); });
    prox.addEventListener("click", function () { trilho.scrollBy({ left: passo(), behavior: RL.menosMovimento ? "auto" : "smooth" }); });
    trilho.addEventListener("scroll", RL.debounce(estado, 50), { passive: true });
    window.addEventListener("resize", RL.debounce(estado, 120));
    estado();
    el.__estado = estado;
  };
  mv.prateleiras = function (raiz) { RL.$$(".prateleira", raiz).forEach(mv.prateleira); };

  /* ---------- carrossel do topo (passa sozinho, com barra de progresso no ponto ativo) ---------- */
  mv.carrossel = function (el, opts) {
    opts = opts || {};
    var slides = RL.$$(".slide", el);
    var pontos = RL.$(".hero__pontos", el);
    var botaoPausa = RL.$("[data-pausa]", el);
    var tempo = opts.tempo || 6500;
    var atual = 0, timer = null, inicio = 0, restante = tempo, pausado = RL.menosMovimento, sobre = false;
    pontos.innerHTML = slides.map(function (s, i) {
      return '<button type="button" class="hero__ponto" aria-label="Mostrar ' + (i + 1) + " de " + slides.length + '"><span></span></button>';
    }).join("");
    var bts = RL.$$(".hero__ponto", pontos);

    function mostrar(i, manual) {
      atual = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        s.classList.toggle("is-ativo", k === atual);
        s.setAttribute("aria-hidden", k === atual ? "false" : "true");
        RL.$$("a, button", s).forEach(function (a) { a.tabIndex = k === atual ? 0 : -1; });
      });
      el.setAttribute("data-tema", slides[atual].getAttribute("data-tema") || "claro");
      bts.forEach(function (b, k) {
        b.classList.toggle("is-ativo", k === atual);
        b.setAttribute("aria-current", k === atual ? "true" : "false");
        var barra = b.firstChild;
        barra.style.transition = "none";
        barra.style.width = "0%";
      });
      restante = tempo;
      if (manual) parar(true);
      rodar();
    }
    function rodar() {
      clearTimeout(timer);
      if (pausado || sobre) return;
      inicio = performance.now();
      var barra = bts[atual].firstChild;
      requestAnimationFrame(function () {
        barra.style.transition = "width " + restante + "ms linear";
        barra.style.width = "100%";
      });
      timer = setTimeout(function () { mostrar(atual + 1); }, restante);
    }
    function congelar() {
      clearTimeout(timer);
      var barra = bts[atual].firstChild;
      var w = barra.getBoundingClientRect().width / barra.parentElement.getBoundingClientRect().width;
      barra.style.transition = "none";
      barra.style.width = (w * 100).toFixed(1) + "%";
      restante = Math.max(400, tempo * (1 - w));
    }
    function parar(manual) {
      if (manual) { pausado = true; atualizarBotao(); }
    }
    function atualizarBotao() {
      if (!botaoPausa) return;
      botaoPausa.setAttribute("aria-label", pausado ? "Continuar" : "Pausar");
      botaoPausa.classList.toggle("is-pausado", pausado);
    }
    bts.forEach(function (b, k) { b.addEventListener("click", function () { if (k !== atual) mostrar(k, true); }); });
    RL.$$("[data-slide]", el).forEach(function (b) {
      b.addEventListener("click", function () { mostrar(atual + (b.getAttribute("data-slide") === "prox" ? 1 : -1), true); });
    });
    if (botaoPausa) botaoPausa.addEventListener("click", function () {
      pausado = !pausado;
      atualizarBotao();
      if (pausado) congelar(); else rodar();
    });
    el.addEventListener("mouseenter", function () { if (!RL.temHover) return; sobre = true; if (!pausado) congelar(); });
    el.addEventListener("mouseleave", function () { if (!RL.temHover) return; sobre = false; rodar(); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) { if (!pausado) congelar(); } else rodar(); });
    /* arrastar no celular */
    var x0 = null;
    el.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener("touchend", function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1), true);
      x0 = null;
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") mostrar(atual + 1, true);
      if (e.key === "ArrowLeft") mostrar(atual - 1, true);
    });
    atualizarBotao();
    mostrar(0);
  };
})();
