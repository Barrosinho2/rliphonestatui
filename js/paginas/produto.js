/*
 * Página de produto: galeria com zoom, condição, cor, armazenamento e o aparelho escolhido
 * pela saúde da bateria. Cada combinação aponta para um SKU real da planilha.
 */
(function () {
  "use strict";
  var RL = window.RL, cat = RL.catalogo, esc = RL.esc, ui = RL.ui;

  var P = RL.params();
  var skuParam = P.get("sku") ? cat.sku(P.get("sku")) : null;
  var prod = cat.produto(P.get("id") || (skuParam ? skuParam.produtoId : ""));
  var FAM = { iphone: "iPhone", ipad: "iPad", watch: "Apple Watch", mac: "Mac" };
  RL.layout({ atual: prod ? (prod.familia === "iphone" && P.get("cond") === "seminovo" ? "seminovos" : prod.familia) : "", trilha: prod ? prod.nome : "Produto" });

  var est = { cond: null, cor: null, arm: null, sku: null, vista: 0 };

  /* ---------- seleção ---------- */
  function daCond(c) { return prod.skus.filter(function (s) { return s.condicao === (c || est.cond); }); }
  function filtrar(o) {
    return prod.skus.filter(function (s) {
      return (!o.cond || s.condicao === o.cond) && (!o.cor || s.cor === o.cor) && (!o.arm || s.armazenamento === o.arm);
    });
  }
  function minimo(l) { var p = l.map(function (s) { return s.preco; }).filter(Boolean); return p.length ? Math.min.apply(null, p) : null; }
  function melhor(l) { return l.slice().sort(function (a, b) { return (a.preco || 9e12) - (b.preco || 9e12) || (b.bateria || 0) - (a.bateria || 0); })[0] || null; }
  function sku() { return est.sku ? cat.sku(est.sku) : null; }
  function uniq(a) { return a.filter(function (v, i) { return v && a.indexOf(v) === i; }); }
  function valorArm(a) { var m = /(\d+)\s*(GB|TB|mm)/i.exec(a || ""); return m ? parseInt(m[1], 10) * (/TB/i.test(m[2]) ? 1024 : 1) : 0; }

  function resolver() {
    if (prod.condicoes.indexOf(est.cond) === -1) est.cond = prod.condicoes.indexOf("lacrado") > -1 ? "lacrado" : prod.condicoes[0];
    var cores = prod.cores.filter(function (c) { return daCond().some(function (s) { return s.cor === c; }); });
    if (cores.indexOf(est.cor) === -1) est.cor = cores[0];
    var naCor = filtrar({ cond: est.cond, cor: est.cor });
    if (!naCor.some(function (s) { return s.armazenamento === est.arm; })) est.arm = melhor(naCor).armazenamento;
    var unid = filtrar({ cond: est.cond, cor: est.cor, arm: est.arm });
    if (!unid.some(function (s) { return s.id === est.sku; })) est.sku = melhor(unid).id;
  }

  /* ---------- blocos de escolha ---------- */
  function blocoCond() {
    if (prod.condicoes.length < 2) return "";
    return "<h2>Condição</h2><div class=\"opcoes-grade\">" + ["lacrado", "seminovo"].filter(function (c) { return prod.condicoes.indexOf(c) > -1; }).map(function (c) {
      return '<button type="button" class="opcao-p" data-cond="' + c + '" aria-pressed="' + (est.cond === c) + '"><b>' + ui.condicaoNome(c) + "</b><span>A partir de " + RL.preco(minimo(daCond(c))) + "</span></button>";
    }).join("") + "</div>";
  }
  function blocoCor() {
    var cores = prod.cores.filter(function (c) { return daCond().some(function (s) { return s.cor === c; }); });
    return "<h2><span>Cor: <b>" + esc(est.cor) + "</b></span></h2><div class=\"amostras\">" + cores.map(function (c) {
      return '<button type="button" class="amostra" style="background:' + (prod.coresHex[c] || "#ccc") + '" data-cor="' + esc(c) + '" aria-pressed="' + (est.cor === c) + '" aria-label="' + esc(c) + '" title="' + esc(c) + '"></button>';
    }).join("") + "</div>";
  }
  function blocoArm() {
    var arms = uniq(daCond().map(function (s) { return s.armazenamento; })).sort(function (a, b) { return valorArm(a) - valorArm(b); });
    var titulo = prod.familia === "watch" ? "Tamanho da caixa" : "Armazenamento";
    return "<h2>" + titulo + "</h2><div class=\"opcoes-grade\">" + arms.map(function (a) {
      var l = filtrar({ cond: est.cond, cor: est.cor, arm: a });
      return '<button type="button" class="opcao-p" data-arm="' + esc(a) + '" aria-pressed="' + (est.arm === a) + '"' + (l.length ? "" : " disabled") + "><b>" + esc(a) + "</b><span>" +
        (l.length ? (l.length > 1 && l.some(function (s) { return s.preco !== minimo(l); }) ? "A partir de " : "") + RL.preco(minimo(l)) : "Indisponível nesta cor") + "</span></button>";
    }).join("") + "</div>";
  }
  function nomeUnidade(s) {
    if (s.condicao === "lacrado") return "<b>Lacrado</b>";
    if (s.bateria) return ui.bat(s.bateria, "Bateria " + s.bateria + "%");
    if (s.ciclos) return "<b>" + s.ciclos + " ciclos de bateria</b>";
    return "<b>Bateria a confirmar</b>";
  }
  function blocoUnidade() {
    var unid = filtrar({ cond: est.cond, cor: est.cor, arm: est.arm })
      .sort(function (a, b) { return (b.bateria || 0) - (a.bateria || 0) || (a.preco || 0) - (b.preco || 0); });
    if (est.cond === "lacrado" && unid.length < 2) return "";
    return '<h2><span>' + (unid.length > 1 ? "Escolha o aparelho" : "Aparelho") + '</span><a class="link" href="#detalhes" data-ir-aba="garantia">Saúde da bateria</a></h2><div class="unidades" role="radiogroup">' + unid.map(function (s) {
      return '<label class="escolha unidade"><input type="radio" name="sku" value="' + s.id + '"' + (est.sku === s.id ? " checked" : "") + '><span class="escolha__caixa"><span>' + nomeUnidade(s) +
        '<span class="escolha__det">' + esc(s.garantia.texto) + "</span>" + (s.obs ? '<span class="unidade__aviso">' + esc(s.obs) + "</span>" : "") + '</span><span class="escolha__lado"><b>' + RL.preco(s.preco) + "</b></span></span></label>";
    }).join("") + "</div>";
  }

  /* ---------- galeria ---------- */
  var VISTAS = [
    { nome: "Frente e verso", z: 1, ox: "50%", oy: "50%" },
    { nome: "Câmeras", z: 2.1, ox: "18%", oy: "16%" },
    { nome: "Tela", z: 1.7, ox: "84%", oy: "34%" }
  ];
  var palco = RL.$("[data-palco]"), areaImg = RL.$("[data-galeria-img]"), vistas = RL.$("[data-vistas]");
  function vistasValidas() { return prod.familia === "iphone" && sku() && sku().foto ? VISTAS : VISTAS.slice(0, 1); }
  function desenharGaleria(troca) {
    var s = sku(), foto = s ? s.foto : prod.foto;
    var alt = prod.nome + " " + (est.cor || "");
    var atual = RL.$("img", areaImg);
    var src = foto ? RL.foto(foto, "g") : "";
    if (!foto) { areaImg.innerHTML = ui.imagem(null, prod.familia, alt); vistas.innerHTML = ""; return; }
    if (!atual) {
      areaImg.innerHTML = '<img src="' + src + '" alt="' + esc(alt) + '" decoding="async">';
    } else if (atual.getAttribute("src") !== src) {
      var pre = new Image();
      pre.onload = function () {
        atual.classList.add("is-saindo");
        setTimeout(function () { atual.src = src; atual.alt = alt; atual.classList.remove("is-saindo"); aplicarVista(); }, troca ? 180 : 0);
      };
      pre.src = src;
    }
    var vs = vistasValidas();
    if (est.vista >= vs.length) est.vista = 0;
    vistas.innerHTML = vs.length > 1 ? vs.map(function (v, i) {
      return '<button type="button" class="vista" role="tab" aria-selected="' + (est.vista === i) + '" data-vista="' + i + '" aria-label="' + v.nome + '" style="--z:' + v.z + ";--ox:" + v.ox + ";--oy:" + v.oy + '"><img src="' + RL.foto(foto, "p") + '" alt=""></button>';
    }).join("") : "";
    aplicarVista();
  }
  function aplicarVista() {
    var img = RL.$("img", areaImg);
    if (!img || palco.classList.contains("is-zoom")) return;
    var v = vistasValidas()[est.vista] || VISTAS[0];
    img.style.transformOrigin = v.ox + " " + v.oy;
    img.style.transform = v.z > 1 ? "scale(" + v.z + ")" : "";
  }
  vistas.addEventListener("click", function (e) {
    var b = e.target.closest("[data-vista]");
    if (!b) return;
    est.vista = +b.getAttribute("data-vista");
    RL.$$("[data-vista]", vistas).forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
    aplicarVista();
  });
  if (RL.temHover) {
    palco.addEventListener("mousemove", function (e) {
      var img = RL.$("img", areaImg);
      if (!img) return;
      var r = palco.getBoundingClientRect();
      palco.classList.add("is-zoom");
      img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100).toFixed(1) + "% " + ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%";
      img.style.transform = "scale(2)";
    });
    palco.addEventListener("mouseleave", function () { palco.classList.remove("is-zoom"); aplicarVista(); });
  } else {
    RL.$("[data-dica]").hidden = true;
  }

  /* ---------- textos ---------- */
  function fraseSpecs() {
    var s = prod.specs, partes = [];
    if (s.tela) partes.push("tela de " + s.tela);
    if (s.chip) partes.push("chip " + s.chip);
    if (s.camera) partes.push(s.camera.charAt(0).toLowerCase() + s.camera.slice(1));
    if (s.biometria) partes.push(s.biometria);
    if (s.conector) partes.push("conector " + s.conector);
    if (s.caixa) partes.push("caixa de " + s.caixa);
    if (!partes.length) return "";
    var ult = partes.pop();
    return (partes.length ? partes.join(", ") + " e " + ult : ult) + ".";
  }
  function painelVisao() {
    var s = prod.specs;
    var D = [["iphone", s.tela, "Tela"], ["chip", s.chip, "Chip"], ["camera", s.camera && s.camera.replace(/^Sistema de câmera |^Câmera /, "").replace(/^./, function (c) { return c.toUpperCase(); }), "Câmera"], ["raio", s.conector, "Conector"], ["escudo", s.biometria, "Desbloqueio"], ["watch", s.caixa, "Caixa"]]
      .filter(function (d) { return d[1]; });
    var frase = fraseSpecs();
    return '<p class="visao__texto"><b>' + esc(prod.nome) + ".</b> " + (frase ? esc(frase.charAt(0).toUpperCase() + frase.slice(1)) : "Fale com um vendedor para saber a configuração completa.") + "</p>" +
      (D.length ? '<div class="destaques">' + D.map(function (d, i) { return '<div class="destaque" data-rev style="--i:' + i + '">' + ui.icone(d[0]) + "<b>" + esc(d[1]) + "</b><span>" + d[2] + "</span></div>"; }).join("") + "</div>" : "");
  }
  function painelSpecs() {
    var s = sku(), sp = prod.specs;
    var L = [["Modelo", prod.nome], ["Tela", sp.tela], ["Chip", sp.chip], ["Câmera traseira", sp.camera], ["Conector", sp.conector], ["Desbloqueio", sp.biometria], ["Caixa", sp.caixa]];
    if (s) {
      L.push(["Condição", ui.condicaoNome(s.condicao)], ["Cor", s.cor], [prod.familia === "watch" ? "Tamanho" : "Armazenamento", s.armazenamento]);
      if (s.condicao === "seminovo") L.push(["Saúde da bateria", s.bateria ? s.bateria + "%" : s.ciclos ? s.ciclos + " ciclos" : "A confirmar com o vendedor"]);
      L.push(["Garantia", s.garantia.texto]);
      if (s.obs) L.push(["Observação", s.obs]);
    }
    return '<dl class="specs">' + L.filter(function (l) { return l[1]; }).map(function (l) { return "<div><dt>" + l[0] + "</dt><dd>" + esc(l[1]) + "</dd></div>"; }).join("") + "</dl>" +
      '<p class="specs-nota">Especificações de referência do modelo. Confirme detalhes do aparelho escolhido com o vendedor.</p>';
  }
  function painelGarantia() {
    return '<div class="texto-ajuda">' +
      "<h3>Lacrado</h3><p>Aparelho novo, na caixa lacrada, com 1 ano de garantia Apple.</p>" +
      "<h3>Seminovo</h3><p>Aparelho usado. Antes de comprar você vê a saúde da bateria e a garantia daquele aparelho: 1 ano, 3 meses ou sem garantia, conforme a tabela da loja. Detalhes como tela ou traseira trocada aparecem no anúncio.</p>" +
      "<h3>Saúde da bateria</h3><p>É a capacidade atual da bateria em relação a quando o aparelho era novo. 100% é como nova. No iPhone, ela aparece em Ajustes &gt; Bateria &gt; Saúde e Carregamento da Bateria.</p>" +
      '<h3>Cada seminovo é único</h3><p>Ao finalizar o pedido, o vendedor confirma se o aparelho continua disponível antes do pagamento.</p></div>';
  }
  function painelPagamento() {
    var ic = { cartao: "cartao", pix: "dinheiro", folha: "boleto", luz: "raio", inss: "pessoa" };
    return '<div class="formas">' + RL.config.pagamento.formas.map(function (f) { return '<div class="forma">' + ui.icone(ic[f.id]) + "<p><b>" + esc(f.nome) + "</b><span>" + esc(f.detalhe) + "</span></p></div>"; }).join("") +
      '</div><p class="specs-nota">Taxas e condições de cada forma de pagamento são confirmadas pelo vendedor.</p>';
  }

  /* ---------- desenho ---------- */
  function desenhar(troca) {
    resolver();
    var s = sku();
    var grupoUnid = daCond().length;
    RL.$("[data-selos]").innerHTML = '<span class="selo' + (est.cond === "lacrado" ? " selo--lacrado" : "") + '">' + ui.condicaoNome(est.cond) + '</span><span class="selo selo--estoque">Em estoque</span>' + (grupoUnid === 1 ? '<span class="selo">Última unidade</span>' : "");
    RL.$("[data-titulo]").textContent = prod.nome + " " + est.arm + " " + est.cor;
    var sub = [ui.condicaoNome(s.condicao)];
    if (s.condicao === "seminovo") sub.push(s.bateria ? "bateria " + s.bateria + "%" : s.ciclos ? s.ciclos + " ciclos de bateria" : "bateria a confirmar");
    sub.push(s.garantia.texto.charAt(0).toLowerCase() + s.garantia.texto.slice(1));
    RL.$("[data-compra-sub]").textContent = sub.join(" · ");
    RL.$("[data-preco]").innerHTML = "<b>" + RL.preco(s.preco) + "</b><span>" + RL.parcelas(s.preco) + "</span>";
    RL.$('[data-bloco="cond"]').innerHTML = blocoCond();
    RL.$('[data-bloco="cor"]').innerHTML = blocoCor();
    RL.$('[data-bloco="arm"]').innerHTML = blocoArm();
    RL.$('[data-bloco="unidade"]').innerHTML = blocoUnidade();
    desenharGaleria(troca);
    botoes();
    RL.$("[data-info]").innerHTML = [
      ["caminhao", "Receba em casa", "Em Tatuí e região. O vendedor combina o dia com você."],
      ["loja", "Retire na loja", "Em Tatuí, no horário combinado com o vendedor."],
      ["escudo", "Garantia", s.garantia.texto + "."],
      ["troca", "Seu usado na troca", 'Avalie seu iPhone e use o valor nesta compra. <a href="troca.html">Avaliar meu iPhone</a>']
    ].map(function (i) { return "<li>" + ui.icone(i[0]) + "<p><b>" + i[1] + "</b>" + i[2] + "</p></li>"; }).join("");
    var w = RL.$("[data-whats-produto]");
    w.href = RL.whats("Olá! Tenho interesse no " + prod.nome + " " + ui.condicaoNome(s.condicao).toLowerCase() + " (" + cat.descricaoSku(s) + ", " + RL.preco(s.preco) + "). Ainda está disponível?");
    w.target = "_blank"; w.rel = "noopener";
    RL.$('[data-painel="specs"]').innerHTML = painelSpecs();
    barra();
    document.title = prod.nome + " " + ui.condicaoNome(est.cond).toLowerCase() + " · RL iPhones";
    history.replaceState(null, "", RL.url("produto.html", { id: prod.id, cond: est.cond, cor: est.cor, arm: est.arm, sku: est.sku }));
  }

  function botoes() {
    var s = sku(), na = s && RL.sacola.tem(s.id);
    var b = RL.$("[data-add]");
    b.classList.toggle("is-na-sacola", !!na);
    b.innerHTML = na ? ui.icone("ok") + "Na sacola · Ver sacola" : "Adicionar à sacola";
    RL.$("[data-barra-add]").textContent = na ? "Ver sacola" : "Adicionar à sacola";
  }
  function barra() {
    var s = sku();
    RL.$("[data-barra-nome]").textContent = prod.nome;
    RL.$("[data-barra-det]").textContent = [ui.condicaoNome(s.condicao), s.armazenamento, s.cor].join(" · ");
    RL.$("[data-barra-preco]").textContent = RL.preco(s.preco);
    var img = RL.$("[data-barra-img]");
    if (s.foto) { img.src = RL.foto(s.foto, "p"); img.hidden = false; } else img.hidden = true;
  }

  function adicionar(irParaCheckout) {
    var s = sku();
    if (!s) return;
    if (RL.sacola.tem(s.id)) { if (irParaCheckout) location.href = "checkout.html"; else RL.abrirSacola(); return; }
    var r = RL.sacola.adicionar(s.id);
    if (!r.ok) { ui.toast("Esse aparelho acabou de sair do estoque. Escolha outro."); return; }
    botoes();
    if (irParaCheckout) { location.href = "checkout.html"; return; }
    RL.abrirSacola(s);
  }

  /* ---------- eventos ---------- */
  RL.$("[data-produto]").addEventListener("click", function (e) {
    var t;
    if ((t = e.target.closest("[data-cond]"))) { est.cond = t.getAttribute("data-cond"); est.sku = null; desenhar(true); }
    else if ((t = e.target.closest("[data-cor]"))) { if (t.getAttribute("data-cor") !== est.cor) { est.cor = t.getAttribute("data-cor"); est.sku = null; desenhar(true); } }
    else if ((t = e.target.closest("[data-arm]"))) { est.arm = t.getAttribute("data-arm"); est.sku = null; desenhar(true); }
    else if ((t = e.target.closest("[data-ir-aba]"))) { e.preventDefault(); abrirAba(t.getAttribute("data-ir-aba"), true); }
  });
  RL.$("[data-produto]").addEventListener("change", function (e) {
    if (e.target.name === "sku") { est.sku = e.target.value; desenhar(false); }
  });
  RL.$("[data-add]").addEventListener("click", function () { adicionar(false); });
  RL.$("[data-comprar]").addEventListener("click", function () { adicionar(true); });
  RL.$("[data-barra-add]").addEventListener("click", function () { adicionar(false); });
  RL.on("sacola", botoes);

  /* abas */
  var moverMarca;
  function abrirAba(id, rolar) {
    RL.$$("[data-painel]").forEach(function (p) { p.hidden = p.getAttribute("data-painel") !== id; });
    RL.$$("[data-abas] [role=tab]").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-aba") === id ? "true" : "false"); });
    if (moverMarca) moverMarca();
    RL.movimento.revelar(document);
    if (rolar) RL.$(".pdp__detalhes").scrollIntoView({ behavior: RL.menosMovimento ? "auto" : "smooth" });
  }

  /* barra fixa quando os botões saem da tela */
  function ligarBarra() {
    var barraEl = RL.$("[data-barra]"), acoes = RL.$("[data-acoes]");
    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (ents) {
      var e = ents[0];
      var on = !e.isIntersecting && e.boundingClientRect.top < 0;
      barraEl.classList.toggle("is-on", on);
      barraEl.setAttribute("aria-hidden", on ? "false" : "true");
    }, { rootMargin: "-100px 0px 0px 0px" }).observe(acoes);
  }

  function relacionados() {
    var gs = cat.grupos(function (s) { return s.familia === prod.familia && s.produtoId !== prod.id; })
      .sort(function (a, b) { return Math.abs(a.produto.ordem - prod.ordem) - Math.abs(b.produto.ordem - prod.ordem); }).slice(0, 10);
    var sec = RL.$("[data-relacionados-secao]");
    sec.hidden = !gs.length;
    RL.$("[data-relacionados]").innerHTML = gs.map(function (g, i) { return ui.cartaoGrupo(g, { rev: true, i: Math.min(i, 4) }); }).join("");
  }

  function dadosEstruturados() {
    var precos = prod.skus.map(function (s) { return s.preco; }).filter(Boolean);
    var ld = document.getElementById("ld-produto") || document.head.appendChild(Object.assign(document.createElement("script"), { id: "ld-produto", type: "application/ld+json" }));
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "Product", name: prod.nome, brand: { "@type": "Brand", name: "Apple" },
      image: prod.foto ? [RL.foto(prod.foto, "g")] : undefined,
      offers: {
        "@type": "AggregateOffer", priceCurrency: "BRL", lowPrice: Math.min.apply(null, precos) / 100, highPrice: Math.max.apply(null, precos) / 100,
        offerCount: prod.unidades, availability: "https://schema.org/InStock",
        itemCondition: prod.condicoes.length === 1 && prod.condicoes[0] === "lacrado" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
        seller: { "@type": "Organization", name: "RL iPhones" }
      }
    });
  }

  /* ---------- início ---------- */
  function semProduto() {
    RL.$("[data-produto]").outerHTML = '<div class="wrap vazio">' + ui.icone("busca") + "<h2>Esse aparelho não está mais no estoque.</h2><p>Ele pode ter sido vendido. Veja os parecidos ou pergunte a um vendedor.</p>" +
      '<div class="ctas"><a class="btn" href="categoria.html">Ver o estoque</a><a class="btn btn--cinza" data-whats="Olá! Procurei um aparelho no site e ele não aparece mais. Vocês ainda têm?" href="#">Perguntar no WhatsApp</a></div></div>';
    RL.$(".pdp__detalhes").hidden = true;
    RL.$("[data-relacionados-secao]").hidden = true;
    RL.$("[data-trilha]").innerHTML = '<a href="index.html">Início</a>' + ui.icone("seta") + '<span aria-current="page">Produto</span>';
    RL.ui.ligarWhats(document);
  }

  function iniciar() {
    if (!prod) { semProduto(); return; }
    if (skuParam && skuParam.produtoId === prod.id) { est.cond = skuParam.condicao; est.cor = skuParam.cor; est.arm = skuParam.armazenamento; est.sku = skuParam.id; }
    else { est.cond = P.get("cond"); est.cor = P.get("cor"); est.arm = P.get("arm"); }
    RL.$("[data-trilha]").innerHTML = ['<a href="index.html">Início</a>', '<a href="' + RL.url("categoria.html", { c: prod.familia }) + '">' + FAM[prod.familia] + "</a>", '<span aria-current="page">' + esc(prod.nome) + "</span>"].join(ui.icone("seta"));
    RL.$('[data-painel="visao"]').innerHTML = painelVisao();
    RL.$('[data-painel="garantia"]').innerHTML = painelGarantia();
    RL.$('[data-painel="pagamento"]').innerHTML = painelPagamento();
    RL.$(".pdp__detalhes").id = "detalhes";
    desenhar(false);
    relacionados();
    dadosEstruturados();
    moverMarca = ui.abas(RL.$("[data-abas]"), function (id) { abrirAba(id, false); });
    ligarBarra();
    RL.ui.ligarCartoes(document);
    RL.movimento.prateleiras(document);
    RL.movimento.revelar(document);
  }
  iniciar();

  RL.on("catalogo", function (d) {
    if (!d.mudou || !prod) return;
    var id = prod.id;
    prod = cat.produto(id);
    if (!prod) { semProduto(); return; }
    if (est.sku && !cat.sku(est.sku)) est.sku = null;
    desenhar(false);
    relacionados();
  });
})();
