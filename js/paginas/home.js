/* Home: destaques, categorias, vitrines, cores do 18 Pro Max, faixas de preço, pagamento e atendimento. */
(function () {
  "use strict";
  var RL = window.RL, cat = RL.catalogo, esc = RL.esc, mv = RL.movimento;

  RL.layout({ atual: "home" });

  function grupo(id) { return cat.grupos(function (s) { return s.produtoId + "--" + s.condicao === id; })[0] || null; }
  function precoTexto(g) {
    if (!g) return "";
    var varios = g.unidades > 1 && g.skus.some(function (s) { return s.preco !== g.aPartirDe; });
    return (varios ? "A partir de " : "") + "<b>" + RL.preco(g.aPartirDe) + "</b><small>" + RL.parcelas(g.aPartirDe) + "</small>";
  }

  /* ---------- destaques ---------- */
  function precosHero() {
    RL.$$("[data-preco-grupo]").forEach(function (el) {
      var g = grupo(el.getAttribute("data-preco-grupo"));
      el.innerHTML = precoTexto(g);
      el.hidden = !g;
    });
    var sem = cat.skus.filter(function (s) { return s.condicao === "seminovo" && s.preco; });
    var min = sem.length ? Math.min.apply(null, sem.map(function (s) { return s.preco; })) : null;
    var el = RL.$("[data-preco-seminovos]");
    el.innerHTML = min ? "A partir de <b>" + RL.preco(min) + "</b><small>" + RL.plural(sem.length, "seminovo", "seminovos") + " em estoque</small>" : "";
  }

  /* ---------- categorias ---------- */
  function chicletes() {
    var conta = function (f) { return cat.skus.filter(f).length; };
    var foto = function (id, cor) { var p = cat.produto(id); return p ? p.fotoDaCor(cor) : null; };
    var C = [
      ["iPhone", "categoria.html?c=iphone", foto("iphone-17-pro-max", "Laranja"), conta(function (s) { return s.familia === "iphone"; })],
      ["Seminovos", "categoria.html?cond=seminovo", foto("iphone-13", "Rosa"), conta(function (s) { return s.condicao === "seminovo"; })],
      ["Lacrados", "categoria.html?cond=lacrado", foto("iphone-18-pro-max", "Glacial"), conta(function (s) { return s.condicao === "lacrado"; })],
      ["iPad", "categoria.html?c=ipad", foto("ipad-11", "Azul"), conta(function (s) { return s.familia === "ipad"; })],
      ["Apple Watch", "categoria.html?c=watch", foto("apple-watch-ultra-1", "Prata"), conta(function (s) { return s.familia === "watch"; })],
      ["Mac", "categoria.html?c=mac", foto("macbook-neo", "Azul"), conta(function (s) { return s.familia === "mac"; })],
      ["Troca", "troca.html", null, null]
    ];
    RL.$("[data-chicletes]").innerHTML = C.filter(function (c) { return c[3] === null || c[3] > 0; }).map(function (c, i) {
      return '<a class="chiclete" href="' + c[1] + '" data-rev style="--i:' + i + '"><span class="chiclete__img">' +
        (c[2] ? '<img src="' + RL.foto(c[2], "p") + '" alt="" loading="lazy">' : RL.ui.icone("troca")) +
        "</span><span>" + c[0] + "</span><small>" + (c[3] === null ? "Avalie seu usado" : RL.plural(c[3], "aparelho", "aparelhos")) + "</small></a>";
    }).join("");
  }

  /* ---------- vitrines ---------- */
  function vitrines() {
    var V = {
      lacrado: cat.grupos(function (s) { return s.condicao === "lacrado"; }),
      seminovo: cat.grupos(function (s) { return s.condicao === "seminovo" && s.familia === "iphone"; }),
      outros: cat.grupos(function (s) { return s.familia !== "iphone"; })
    };
    Object.keys(V).forEach(function (k) {
      var el = RL.$('[data-vitrine="' + k + '"]');
      el.innerHTML = V[k].map(function (g, i) { return RL.ui.cartaoGrupo(g, { rev: true, i: Math.min(i, 4) }); }).join("");
      var pr = el.closest(".prateleira");
      if (pr.__estado) pr.__estado();
    });
  }

  /* ---------- cores do 18 Pro Max ---------- */
  var cena = { cores: [], atual: -1 };
  function cores18() {
    var p = cat.produto("iphone-18-pro-max");
    var sec = RL.$("[data-cores18]");
    var lac = p ? p.skus.filter(function (s) { return s.condicao === "lacrado"; }) : [];
    if (!lac.length) { sec.hidden = true; return; }
    sec.hidden = false;
    cena.p = p;
    cena.cores = p.cores.filter(function (c) { return lac.some(function (s) { return s.cor === c; }); });
    cena.precos = cena.cores.map(function (c) {
      return Math.min.apply(null, lac.filter(function (s) { return s.cor === c && s.preco; }).map(function (s) { return s.preco; }));
    });
    RL.$("[data-cores18-lista]").innerHTML = cena.cores.map(function (c, i) {
      return '<li><button type="button" data-i="' + i + '"><span class="cor" style="background:' + (p.coresHex[c] || "#ccc") + '"></span>' + esc(c) + "</button></li>";
    }).join("");
    RL.$("[data-cores18-fotos]").innerHTML = cena.cores.map(function (c, i) {
      return '<img src="' + RL.foto(p.fotoDaCor(c), "g") + '" alt="iPhone 18 Pro Max ' + esc(c) + '" loading="lazy" data-i="' + i + '">';
    }).join("");
    cena.atual = -1;
    mostrarCor(0);
  }
  function mostrarCor(i) {
    if (i === cena.atual || !cena.cores.length) return;
    cena.atual = i;
    var c = cena.cores[i];
    RL.$$("[data-cores18-lista] button").forEach(function (b, k) { b.classList.toggle("is-ativa", k === i); b.setAttribute("aria-pressed", k === i ? "true" : "false"); });
    RL.$$("[data-cores18-fotos] img").forEach(function (img, k) { img.classList.toggle("is-ativa", k === i); img.classList.toggle("is-antes", k < i); });
    RL.$("[data-cores18-preco]").innerHTML = "<b>" + RL.preco(cena.precos[i]) + "</b><small>" + RL.parcelas(cena.precos[i]) + "</small>";
    var cta = RL.$("[data-cores18-cta]");
    cta.textContent = "Comprar em " + c.toLowerCase();
    cta.href = RL.url("produto.html", { id: "iphone-18-pro-max", cond: "lacrado", cor: c });
  }
  function ligarCores18() {
    var sec = RL.$("[data-cores18]");
    var barra = RL.$("[data-cores18-barra]");
    sec.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cores18-lista] button");
      if (!b) return;
      var i = +b.getAttribute("data-i");
      if (RL.menosMovimento) { mostrarCor(i); return; }
      /* leva o scroll até o trecho daquela cor, para a cena continuar coerente */
      var r = sec.getBoundingClientRect();
      var topo = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--cab-h")) || 0;
      var curso = r.height - (window.innerHeight - topo);
      var alvo = window.scrollY + r.top - topo + curso * ((i + 0.5) / cena.cores.length);
      window.scrollTo({ top: alvo, behavior: "smooth" });
    });
    if (RL.menosMovimento) return;
    mv.cena(sec, function (p) {
      if (!cena.cores.length) return;
      barra.style.width = (p * 100).toFixed(2) + "%";
      mostrarCor(Math.min(cena.cores.length - 1, Math.floor(p * cena.cores.length * 0.999)));
    }, "presa");
  }

  /* ---------- faixas de preço ---------- */
  function faixas() {
    var F = [[0, 200000, "Até R$ 2.000"], [200000, 400000, "De R$ 2.000 a R$ 4.000"], [400000, 700000, "De R$ 4.000 a R$ 7.000"], [700000, null, "Acima de R$ 7.000"]];
    RL.$("[data-faixas]").innerHTML = F.map(function (f, i) {
      var skus = cat.skus.filter(function (s) { return s.familia === "iphone" && s.preco && s.preco >= f[0] && (f[1] == null || s.preco < f[1]); });
      if (!skus.length) return "";
      var melhor = skus.slice().sort(function (a, b) { return cat.produto(a.produtoId).ordem - cat.produto(b.produtoId).ordem; })[0];
      var url = RL.url("categoria.html", { c: "iphone", pmin: f[0] ? f[0] / 100 : null, pmax: f[1] ? f[1] / 100 : null });
      return '<a class="faixa" href="' + url + '" data-rev style="--i:' + i + '"><div><b>' + f[2] + "</b><span>" + RL.plural(skus.length, "iPhone", "iPhones") + "</span></div>" +
        '<span class="link">Ver aparelhos</span>' + (melhor.foto ? '<img src="' + RL.foto(melhor.foto, "p") + '" alt="" loading="lazy">' : "") + "</a>";
    }).join("");
  }

  /* ---------- pagamento e atendimento ---------- */
  function pagamento() {
    var ic = { cartao: "cartao", pix: "dinheiro", folha: "boleto", luz: "raio", inss: "pessoa" };
    RL.$("[data-pagar]").innerHTML = RL.config.pagamento.formas.map(function (f, i) {
      return '<a class="pagar__card" href="ajuda.html#pagamento" data-rev style="--i:' + i + '">' + RL.ui.icone(ic[f.id] || "cartao") + "<b>" + esc(f.nome) + "</b><span>" + esc(f.detalhe) + "</span></a>";
    }).join("");
  }
  function vendedores() {
    RL.$("[data-vendedores]").innerHTML = RL.config.vendedores.map(function (v, i) {
      return '<li class="vendedor" data-rev style="--i:' + i + '"><span class="vendedor__ini" aria-hidden="true">' + esc(v.nome.charAt(0)) + "</span><div><b>" + esc(v.nome) + "</b><span>" + RL.telefone(v.whatsapp) + "</span></div>" +
        '<a class="btn btn--p btn--linha" data-whats="Olá, ' + esc(v.nome) + '! Vim pelo site da RL iPhones e queria tirar uma dúvida." data-vendedor="' + esc(v.nome) + '" href="#">WhatsApp</a></li>';
    }).join("");
    RL.ui.ligarWhats(RL.$("[data-vendedores]"));
  }

  function tudo() {
    precosHero();
    chicletes();
    vitrines();
    cores18();
    faixas();
    mv.revelar(document);
  }

  tudo();
  pagamento();
  vendedores();
  RL.ui.ligarCartoes(document);
  mv.carrossel(RL.$("[data-hero]"));
  mv.prateleiras(document);
  ligarCores18();
  mv.revelar(document);
  RL.on("catalogo", function (d) { if (d.mudou) tudo(); });
})();
