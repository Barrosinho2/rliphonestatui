/*
 * Categoria / busca: filtros com contagem por opção (como em lojas grandes), ordenação,
 * chips dos filtros ativos e tudo guardado na URL (dá para mandar o link de uma busca pronta).
 */
(function () {
  "use strict";
  var RL = window.RL, cat = RL.catalogo, esc = RL.esc;

  var P = RL.params();
  var lista = function (k) { return (P.get(k) || "").split(",").filter(Boolean); };
  var F = {
    c: P.get("c") || "", cond: P.get("cond") || "", q: P.get("q") || "",
    modelo: lista("modelo"), arm: lista("arm"), cor: lista("cor"), garantia: lista("garantia"),
    bat: parseInt(P.get("bat"), 10) || 0,
    pmin: parseInt(P.get("pmin"), 10) || null, pmax: parseInt(P.get("pmax"), 10) || null,
    ordem: P.get("ordem") || "relevancia"
  };

  var FAM = { iphone: "iPhone", ipad: "iPad", watch: "Apple Watch", mac: "Mac" };
  var atual = F.cond === "lacrado" && !F.c ? "lacrados" : F.cond === "seminovo" && !F.c ? "seminovos" : F.c;
  RL.layout({ atual: atual, trilha: "Produtos" });

  /* ---------- filtro ---------- */
  function chaveTexto(s) { return RL.semAcento(String(s || "")).toLowerCase(); }
  function passa(s, ignorar) {
    if (F.c && s.familia !== F.c) return false;
    if (F.cond && ignorar !== "cond" && s.condicao !== F.cond) return false;
    if (F.q) {
      var alvo = chaveTexto([s.nome, s.cor, s.armazenamento, s.condicao, FAM[s.familia]].join(" "));
      if (!chaveTexto(F.q).split(/\s+/).every(function (t) { return alvo.indexOf(t) > -1; })) return false;
    }
    if (ignorar !== "modelo" && F.modelo.length && F.modelo.indexOf(s.produtoId) === -1) return false;
    if (ignorar !== "arm" && F.arm.length && F.arm.indexOf(s.armazenamento) === -1) return false;
    if (ignorar !== "cor" && F.cor.length && F.cor.indexOf(s.cor) === -1) return false;
    if (ignorar !== "garantia" && F.garantia.length && F.garantia.indexOf(String(s.garantia.meses == null ? "x" : s.garantia.meses)) === -1) return false;
    if (ignorar !== "bat" && F.bat && !(s.condicao === "lacrado" || (s.bateria && s.bateria >= F.bat))) return false;
    if (ignorar !== "preco" && F.pmin && (!s.preco || s.preco < F.pmin * 100)) return false;
    if (ignorar !== "preco" && F.pmax && (!s.preco || s.preco > F.pmax * 100)) return false;
    return true;
  }
  function filtrados(ignorar) { return cat.skus.filter(function (s) { return passa(s, ignorar); }); }

  /* ---------- título e trilha ---------- */
  function titulo() {
    if (F.q) return "Busca: “" + F.q + "”";
    var nome = F.c ? FAM[F.c] : "";
    if (F.cond) nome = nome ? nome + " " + (F.cond === "lacrado" ? "lacrado" : "seminovo") : (F.cond === "lacrado" ? "Lacrados" : "Seminovos");
    return nome || "Todos os produtos";
  }
  function cabecalho(n, nGrupos) {
    var t = titulo();
    document.title = t + " · RL iPhones";
    RL.$("[data-titulo]").textContent = t;
    RL.$("[data-conta]").textContent = RL.plural(n, "aparelho", "aparelhos") + " em " + RL.plural(nGrupos, "modelo", "modelos");
    var partes = ['<a href="index.html">Início</a>'];
    if (F.c) partes.push(F.cond || F.q ? '<a href="' + RL.url("categoria.html", { c: F.c }) + '">' + FAM[F.c] + "</a>" : '<span aria-current="page">' + FAM[F.c] + "</span>");
    if (F.cond && !F.q) partes.push('<span aria-current="page">' + (F.cond === "lacrado" ? "Lacrados" : "Seminovos") + "</span>");
    if (F.q) partes.push('<span aria-current="page">Busca</span>');
    if (partes.length === 1) partes.push('<span aria-current="page">Todos os produtos</span>');
    RL.$("[data-trilha]").innerHTML = partes.join(RL.ui.icone("seta"));
    /* atalhos: condição dentro da categoria */
    var base = cat.skus.filter(function (s) { return !F.c || s.familia === F.c; });
    var A = [["", "Todos"], ["lacrado", "Lacrados"], ["seminovo", "Seminovos"]].map(function (a) {
      var n2 = base.filter(function (s) { return !a[0] || s.condicao === a[0]; }).length;
      if (!n2) return "";
      return '<a class="pilula' + (F.cond === a[0] ? " is-ativa" : "") + '" href="' + RL.url("categoria.html", { c: F.c, cond: a[0], q: F.q }) + '">' + a[1] + " <small>" + n2 + "</small></a>";
    }).join("");
    var fams = !F.c && !F.q ? Object.keys(FAM).map(function (f) {
      var n3 = cat.skus.filter(function (s) { return s.familia === f && (!F.cond || s.condicao === F.cond); }).length;
      return n3 ? '<a class="pilula" href="' + RL.url("categoria.html", { c: f, cond: F.cond }) + '">' + FAM[f] + " <small>" + n3 + "</small></a>" : "";
    }).join("") : "";
    RL.$("[data-atalhos]").innerHTML = A + fams;
  }

  /* ---------- painel de filtros ---------- */
  function contar(ignorar, chave) {
    var m = {};
    filtrados(ignorar).forEach(function (s) { var k = chave(s); m[k] = (m[k] || 0) + 1; });
    return m;
  }
  function filtrosHTML() {
    var h = "";
    /* condição */
    var cc = contar("cond", function (s) { return s.condicao; });
    h += '<div class="filtro"><h3>Condição</h3><div class="filtro__lista">' + [["lacrado", "Lacrado"], ["seminovo", "Seminovo"]].map(function (o) {
      return '<label class="chk' + (cc[o[0]] ? "" : " is-zero") + '"><input type="checkbox" data-f="cond" value="' + o[0] + '"' + (F.cond === o[0] ? " checked" : "") + ">" + o[1] + "<small>" + (cc[o[0]] || 0) + "</small></label>";
    }).join("") + "</div></div>";
    /* modelo */
    var cm = contar("modelo", function (s) { return s.produtoId; });
    var modelos = cat.produtos.filter(function (p) { return cm[p.id] || F.modelo.indexOf(p.id) > -1; });
    if (modelos.length > 1 || F.modelo.length) {
      h += '<div class="filtro"><h3>Modelo</h3><div class="filtro__lista" data-modelos>' + modelos.map(function (p, i) {
        return '<label class="chk"' + (i > 7 && F.modelo.indexOf(p.id) === -1 ? " data-extra hidden" : "") + '><input type="checkbox" data-f="modelo" value="' + p.id + '"' + (F.modelo.indexOf(p.id) > -1 ? " checked" : "") + ">" + esc(p.nome) + "<small>" + (cm[p.id] || 0) + "</small></label>";
      }).join("") + "</div>" + (modelos.length > 8 ? '<button class="filtro__mais" type="button" data-mais>Mostrar todos os ' + modelos.length + " modelos</button>" : "") + "</div>";
    }
    /* armazenamento */
    var ca = contar("arm", function (s) { return s.armazenamento; });
    var arms = Object.keys(ca).concat(F.arm).filter(function (v, i, a) { return v && a.indexOf(v) === i; })
      .sort(function (a, b) { return valorArm(a) - valorArm(b); });
    if (arms.length) h += '<div class="filtro"><h3>Armazenamento</h3><div class="filtro__chips">' + arms.map(function (a) {
      return '<button type="button" class="pilula" data-f="arm" value="' + esc(a) + '" aria-pressed="' + (F.arm.indexOf(a) > -1) + '">' + esc(a) + "</button>";
    }).join("") + "</div></div>";
    /* cor */
    var cco = contar("cor", function (s) { return s.cor; });
    var hex = {};
    cat.skus.forEach(function (s) { if (!hex[s.cor]) hex[s.cor] = s.corHex; });
    var cores = Object.keys(cco).concat(F.cor).filter(function (v, i, a) { return v && a.indexOf(v) === i; }).sort();
    if (cores.length) h += '<div class="filtro"><h3>Cor</h3><div class="filtro__cores">' + cores.map(function (c) {
      return '<button type="button" class="filtro__cor" data-f="cor" value="' + esc(c) + '" aria-pressed="' + (F.cor.indexOf(c) > -1) + '"><span class="cor" style="background:' + (hex[c] || "#ccc") + '"></span>' + esc(c) + "</button>";
    }).join("") + "</div></div>";
    /* garantia */
    var cg = contar("garantia", function (s) { return String(s.garantia.meses == null ? "x" : s.garantia.meses); });
    var G = [["12", "1 ano"], ["3", "3 meses"], ["0", "Sem garantia"]].filter(function (g) { return cg[g[0]] || F.garantia.indexOf(g[0]) > -1; });
    if (G.length) h += '<div class="filtro"><h3>Garantia</h3><div class="filtro__lista">' + G.map(function (g) {
      return '<label class="chk"><input type="checkbox" data-f="garantia" value="' + g[0] + '"' + (F.garantia.indexOf(g[0]) > -1 ? " checked" : "") + ">" + g[1] + "<small>" + (cg[g[0]] || 0) + "</small></label>";
    }).join("") + "</div></div>";
    /* bateria */
    if (F.cond !== "lacrado") h += '<div class="filtro"><h3>Saúde da bateria</h3><div class="faixa-bat"><input type="range" min="70" max="100" step="5" value="' + (F.bat || 70) + '" data-f="bat" aria-label="Saúde mínima da bateria"><output data-bat-saida>' + (F.bat ? "A partir de " + F.bat + "%" : "Qualquer") + "</output></div></div>";
    /* preço */
    h += '<div class="filtro"><h3>Preço</h3><div class="precos"><label><span class="sr">Mínimo</span><input class="entrada" type="number" inputmode="numeric" min="0" step="100" placeholder="Mín. R$" data-f="pmin" value="' + (F.pmin || "") + '"></label>' +
      '<label><span class="sr">Máximo</span><input class="entrada" type="number" inputmode="numeric" min="0" step="100" placeholder="Máx. R$" data-f="pmax" value="' + (F.pmax || "") + '"></label></div></div>';
    return h;
  }
  function valorArm(a) { var m = /(\d+)\s*(GB|TB|mm)/i.exec(a || ""); return m ? parseInt(m[1], 10) * (/TB/i.test(m[2]) ? 1024 : 1) : 0; }

  /* ---------- chips dos filtros ativos ---------- */
  function chips() {
    var C = [];
    F.modelo.forEach(function (id) { var p = cat.produto(id); C.push(["modelo", id, p ? p.nome : id]); });
    F.arm.forEach(function (a) { C.push(["arm", a, a]); });
    F.cor.forEach(function (c) { C.push(["cor", c, c]); });
    F.garantia.forEach(function (g) { C.push(["garantia", g, { "12": "1 ano de garantia", "3": "3 meses de garantia", "0": "Sem garantia" }[g]]); });
    if (F.bat) C.push(["bat", "", "Bateria a partir de " + F.bat + "%"]);
    if (F.pmin) C.push(["pmin", "", "A partir de " + RL.preco(F.pmin * 100)]);
    if (F.pmax) C.push(["pmax", "", "Até " + RL.preco(F.pmax * 100)]);
    RL.$("[data-chips]").innerHTML = C.map(function (c) {
      return '<button type="button" class="chip-ativo" data-tira="' + c[0] + '" data-valor="' + esc(c[1]) + '">' + esc(c[2]) + RL.ui.icone("fechar") + "</button>";
    }).join("") + (C.length > 1 ? '<button type="button" class="chip-ativo chip-ativo--limpar" data-limpar>Limpar filtros</button>' : "");
    var n = C.length + (F.cond ? 1 : 0);
    RL.$("[data-n-filtros]").textContent = n ? " (" + n + ")" : "";
  }

  /* ---------- resultados ---------- */
  function ordenar(gs) {
    var o = F.ordem;
    return gs.sort(function (a, b) {
      if (o === "menor-preco") return (a.aPartirDe || 9e12) - (b.aPartirDe || 9e12);
      if (o === "maior-preco") return (b.aPartirDe || 0) - (a.aPartirDe || 0);
      if (o === "mais-novos") return b.produto.ano - a.produto.ano || a.produto.ordem - b.produto.ordem;
      if (o === "maior-bateria") return (b.condicao === "lacrado" ? 101 : b.melhorBateria) - (a.condicao === "lacrado" ? 101 : a.melhorBateria);
      return a.produto.ordem - b.produto.ordem || (a.condicao === "lacrado" ? -1 : 1);
    });
  }
  function desenhar() {
    var skus = filtrados();
    var gs = ordenar(cat.agrupar(skus));
    cabecalho(skus.length, gs.length);
    var params = {};
    if (F.cor.length === 1) params.cor = F.cor[0];
    if (F.arm.length === 1) params.arm = F.arm[0];
    RL.$("[data-grade]").innerHTML = gs.length ? gs.map(function (g, i) {
      return RL.ui.cartaoGrupo(g, { params: params }).replace('<article class="cartao"', '<article class="cartao" style="--i:' + Math.min(i, 12) + '"');
    }).join("") : '<div class="vazio">' + RL.ui.icone("busca") + "<h2>Nenhum aparelho com esses filtros.</h2><p>Tente tirar um filtro ou fale com um vendedor: o estoque muda todo dia.</p>" +
      '<div class="ctas"><button class="btn btn--cinza" type="button" data-limpar>Limpar filtros</button><a class="btn" data-whats="Olá! Procurei um aparelho no site e não encontrei. Vocês têm?" href="#">Perguntar no WhatsApp</a></div></div>';
    RL.ui.ligarWhats(RL.$("[data-grade]"));
    RL.$("[data-filtros-corpo]").innerHTML = filtrosHTML();
    chips();
    RL.$("[data-ver]").textContent = "Ver " + RL.plural(skus.length, "aparelho", "aparelhos");
    RL.$("[data-ordem]").value = F.ordem;
    history.replaceState(null, "", RL.url("categoria.html", {
      c: F.c, cond: F.cond, q: F.q, modelo: F.modelo.join(","), arm: F.arm.join(","), cor: F.cor.join(","),
      garantia: F.garantia.join(","), bat: F.bat || null, pmin: F.pmin, pmax: F.pmax, ordem: F.ordem === "relevancia" ? null : F.ordem
    }));
  }

  /* ---------- eventos ---------- */
  function alternar(arr, v) { var i = arr.indexOf(v); if (i > -1) arr.splice(i, 1); else arr.push(v); }
  var corpo = RL.$("[data-filtros-corpo]");
  corpo.addEventListener("change", function (e) {
    var el = e.target, f = el.getAttribute("data-f");
    if (!f) return;
    if (f === "cond") F.cond = el.checked ? el.value : "";
    else if (f === "modelo" || f === "garantia") alternar(F[f], el.value);
    else if (f === "bat") F.bat = +el.value > 70 ? +el.value : 0;
    else if (f === "pmin" || f === "pmax") F[f] = parseInt(el.value, 10) || null;
    desenhar();
  });
  corpo.addEventListener("input", function (e) {
    if (e.target.getAttribute("data-f") === "bat") {
      var v = +e.target.value;
      RL.$("[data-bat-saida]").textContent = v > 70 ? "A partir de " + v + "%" : "Qualquer";
    }
  });
  corpo.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-f]");
    if (b) { alternar(F[b.getAttribute("data-f")], b.value); desenhar(); return; }
    if (e.target.closest("[data-mais]")) {
      RL.$$("[data-extra]", corpo).forEach(function (l) { l.hidden = false; });
      e.target.closest("[data-mais]").remove();
    }
  });
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-tira]");
    if (t) {
      var k = t.getAttribute("data-tira"), v = t.getAttribute("data-valor");
      if (Array.isArray(F[k])) alternar(F[k], v); else F[k] = k === "bat" ? 0 : null;
      desenhar();
      return;
    }
    if (e.target.closest("[data-limpar]")) {
      F.modelo = []; F.arm = []; F.cor = []; F.garantia = []; F.bat = 0; F.pmin = null; F.pmax = null;
      desenhar();
    }
  });
  RL.$("[data-ordem]").addEventListener("change", function (e) { F.ordem = e.target.value; desenhar(); });

  /* filtros no celular */
  var painel = RL.$("[data-filtros]"), fundo = RL.$("[data-filtros-fundo]");
  RL.$("[data-ico-filtro]").outerHTML = RL.ui.icone("filtro");
  RL.$(".filtros__topo .gaveta__fechar").innerHTML = RL.ui.icone("fechar");
  function abrirFiltros(abrir) {
    painel.classList.toggle("is-aberto", abrir);
    fundo.classList.toggle("is-on", abrir);
    document.body.classList.toggle("trava", abrir);
  }
  RL.$("[data-abre-filtros]").addEventListener("click", function () { abrirFiltros(true); });
  RL.$$("[data-fecha-filtros]").forEach(function (b) { b.addEventListener("click", function () { abrirFiltros(false); }); });
  fundo.addEventListener("click", function () { abrirFiltros(false); });

  desenhar();
  RL.ui.ligarCartoes(document);
  RL.on("catalogo", function (d) { if (d.mudou) desenhar(); });
})();
