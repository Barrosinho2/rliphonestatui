/*
 * Catálogo: lê a planilha da loja e monta produtos e SKUs.
 *
 * Produto = um modelo (ex.: iPhone 16 Pro). SKU = um aparelho à venda,
 * com cor, armazenamento, condição, garantia, bateria e preço.
 * Seminovo é sempre uma unidade única; por isso cada linha da planilha vira um SKU.
 *
 * Essa é a mesma estrutura que uma plataforma de e-commerce usa (produto → variantes),
 * então dá para migrar para um gateway ou plataforma sem mudar as páginas.
 */
(function () {
  "use strict";
  var RL = window.RL;
  var MODELOS = window.RL_MODELOS || {};
  var APELIDOS = window.RL_APELIDOS || {};
  var CORES = window.RL_CORES || {};

  var FAMILIAS = [
    { id: "iphone", nome: "iPhone" },
    { id: "ipad", nome: "iPad" },
    { id: "watch", nome: "Apple Watch" },
    { id: "mac", nome: "Mac" }
  ];

  /* ---------- CSV ---------- */
  function lerCSV(texto) {
    var linhas = [], linha = [], campo = "", aspas = false;
    for (var i = 0; i < texto.length; i++) {
      var c = texto[i];
      if (aspas) {
        if (c === '"') {
          if (texto[i + 1] === '"') { campo += '"'; i++; } else aspas = false;
        } else campo += c;
      } else if (c === '"') aspas = true;
      else if (c === ",") { linha.push(campo); campo = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && texto[i + 1] === "\n") i++;
        linha.push(campo); linhas.push(linha); linha = []; campo = "";
      } else campo += c;
    }
    if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
    return linhas;
  }

  /* ---------- normalização ---------- */
  function chave(s) { return RL.semAcento(String(s || "").trim()).toLowerCase().replace(/\s+/g, " "); }

  function nomeBonito(nome) {
    return String(nome).trim().replace(/\s+/g, " ")
      .replace(/^iphone/i, "iPhone").replace(/^ipad/i, "iPad").replace(/macbook/i, "MacBook").replace(/^imac/i, "iMac");
  }

  function familiaDe(nome, secao) {
    if (secao === "ipad" || secao === "watch" || secao === "mac") return secao;
    var k = chave(nome);
    if (k.indexOf("ipad") === 0) return "ipad";
    if (k.indexOf("watch") > -1) return "watch";
    if (k.indexOf("mac") > -1) return "mac";
    return "iphone";
  }

  function modeloDe(nome, secao) {
    var k = chave(nome);
    var id = APELIDOS[k] || RL.slug(k);
    if (!MODELOS[id]) {
      MODELOS[id] = { nome: nomeBonito(nome), familia: familiaDe(nome, secao), ordem: 99, specs: {}, cores: {} };
    }
    return id;
  }

  function corBonita(cor) {
    var k = chave(cor);
    if (CORES[k]) return CORES[k];
    var t = String(cor).trim();
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  }

  function centavos(txt) {
    var n = String(txt || "").replace(/[^\d,]/g, "").replace(",", ".");
    if (!n) return null;
    return Math.round(parseFloat(n) * 100);
  }

  var OBS = {
    "tela com detalhe": "Tela com detalhe",
    "bateria trocada e trinco tela": "Bateria trocada e trinco na tela",
    "traseira trocada": "Traseira trocada"
  };

  function garantiaDe(txt) {
    var k = chave(txt);
    if (/1 ano/.test(k) && /apple/.test(k)) return { meses: 12, apple: true, texto: "1 ano de garantia Apple" };
    if (/1 ano/.test(k)) return { meses: 12, apple: false, texto: "1 ano de garantia" };
    if (/3 meses/.test(k)) return { meses: 3, apple: false, texto: "3 meses de garantia" };
    if (/garantia 0/.test(k)) return { meses: 0, apple: false, texto: "Sem garantia" };
    return { meses: null, apple: false, texto: "Garantia a combinar", obs: OBS[k] || (k ? corBonita(txt) : null) };
  }

  function armazenamentoDe(txt) {
    var m = String(txt || "").match(/(\d+)\s*(gb|tb|mm)/i);
    if (!m) return { texto: String(txt || "").trim(), valor: 0, unidade: "" };
    var u = m[2].toUpperCase() === "MM" ? "mm" : m[2].toUpperCase();
    return { texto: m[1] + " " + u, valor: parseInt(m[1], 10) * (u === "TB" ? 1024 : 1), unidade: u };
  }

  /* foto da cor; sem foto dessa cor, a primeira foto do modelo */
  function fotoDe(meta, cor) {
    var f = meta.fotos || {};
    if (f[cor]) return f[cor];
    var ks = Object.keys(f);
    return ks.length ? f[ks[0]] : null;
  }

  /* ---------- montagem ---------- */
  function montar(texto) {
    var linhas = lerCSV(texto);
    var secao = "seminovo";
    var skus = [], vistos = {};

    linhas.forEach(function (l) {
      var nome = (l[0] || "").trim();
      if (!nome || /^-+$/.test(nome)) return;
      var k = chave(nome);
      if (k.indexOf("modelos") === 0) {
        if (/lacrad/.test(k)) secao = "lacrado";
        else if (/ipad/.test(k)) secao = "ipad";
        else if (/watch/.test(k)) secao = "watch";
        else if (/mac/.test(k)) secao = "mac";
        else secao = "seminovo";
        return;
      }
      var preco = centavos(l[3]);
      var garantia = garantiaDe(l[4]);
      var bat = String(l[5] || "").trim();
      var bateria = /%/.test(bat) ? parseInt(bat, 10) : null;
      var ciclos = /ciclo/i.test(bat) ? parseInt(bat, 10) : null;

      var condicao;
      if (secao === "lacrado") condicao = "lacrado";
      else if (secao === "seminovo") condicao = "seminovo";
      else condicao = garantia.apple && bateria === 100 && !ciclos ? "lacrado" : "seminovo";

      var produtoId = modeloDe(nome, secao);
      var cor = corBonita(l[1] || "");
      var arm = armazenamentoDe(l[2]);
      /* Se a planilha ganhar uma coluna G com um código por aparelho, ele vira o id do SKU (estável para o e-commerce).
         Sem ela, o id sai dos próprios dados da linha. */
      var codigo = String(l[6] || "").trim();
      var base = codigo ? "rl-" + RL.slug(codigo) : "rl-" + RL.slug([produtoId, cor, arm.texto, condicao, bateria || ciclos || "", preco || ""].join(" "));
      vistos[base] = (vistos[base] || 0) + 1;
      var id = vistos[base] > 1 ? base + "-" + vistos[base] : base;

      skus.push({
        id: id,
        produtoId: produtoId,
        condicao: condicao,
        cor: cor,
        armazenamento: arm.texto,
        armazenamentoValor: arm.valor,
        unidade: arm.unidade,
        preco: preco,
        garantia: garantia,
        bateria: bateria,
        ciclos: ciclos,
        obs: garantia.obs || null,
        estoque: 1
      });
    });

    var porProduto = {};
    skus.forEach(function (s) {
      var meta = MODELOS[s.produtoId];
      s.nome = meta.nome;
      s.familia = meta.familia;
      s.corHex = (meta.cores && meta.cores[s.cor]) || "#C9C8C3";
      s.foto = fotoDe(meta, s.cor);
      (porProduto[s.produtoId] = porProduto[s.produtoId] || []).push(s);
    });

    var produtos = Object.keys(porProduto).map(function (id) {
      var meta = MODELOS[id], lista = porProduto[id];
      lista.sort(function (a, b) { return (a.preco || 9e12) - (b.preco || 9e12); });
      var precos = lista.map(function (s) { return s.preco; }).filter(Boolean);
      var uniq = function (arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); };
      var naFicha = Object.keys(meta.cores || {});
      var cores = uniq(lista.map(function (s) { return s.cor; })).sort(function (a, b) {
        var ia = naFicha.indexOf(a), ib = naFicha.indexOf(b);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });
      return {
        id: id,
        nome: meta.nome,
        familia: meta.familia,
        ordem: meta.ordem,
        resumo: meta.resumo || "",
        specs: meta.specs || {},
        coresHex: meta.cores || {},
        ano: meta.ano || 0,
        foto: fotoDe(meta, cores[0]),
        fotoDaCor: function (cor) { return fotoDe(meta, cor); },
        skus: lista,
        unidades: lista.length,
        aPartirDe: precos.length ? Math.min.apply(null, precos) : null,
        cores: cores,
        armazenamentos: uniq(lista.slice().sort(function (a, b) { return a.armazenamentoValor - b.armazenamentoValor; }).map(function (s) { return s.armazenamento; })),
        condicoes: uniq(lista.map(function (s) { return s.condicao; })),
        melhorBateria: Math.max.apply(null, lista.map(function (s) { return s.bateria || 0; })),
        garantiaMax: Math.max.apply(null, lista.map(function (s) { return s.garantia.meses || 0; }))
      };
    });
    produtos.sort(function (a, b) { return a.ordem - b.ordem || a.nome.localeCompare(b.nome); });

    return { produtos: produtos, skus: skus };
  }

  /* ---------- carregamento: planilha ao vivo, com cópia local de reserva ---------- */
  function urlPlanilha() {
    var p = RL.config.planilha;
    return "https://docs.google.com/spreadsheets/d/" + p.id + "/export?format=csv&gid=" + p.gid;
  }

  function buscarAoVivo() {
    var p = RL.config.planilha;
    if (!p.aoVivo || !window.fetch) return Promise.reject(new Error("desligado"));
    /* aberto direto do computador (file://) o Google bloqueia a leitura: usa a cópia local sem tentar */
    if (location.protocol === "file:") return Promise.reject(new Error("arquivo local"));
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, p.tempoLimiteMs);
    return fetch(urlPlanilha(), { signal: ctrl ? ctrl.signal : undefined, cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function (t) {
        clearTimeout(timer);
        if (t.indexOf("MODELOS") === -1) throw new Error("formato inesperado");
        return t;
      });
  }

  var cat = (RL.catalogo = {
    familias: FAMILIAS,
    produtos: [],
    skus: [],
    fonte: "copia",
    atualizadoEm: null,
    _porId: {},
    _skuPorId: {}
  });

  function aplicar(texto, fonte, quando) {
    var r = montar(texto);
    cat.produtos = r.produtos;
    cat.skus = r.skus;
    cat.fonte = fonte;
    cat.atualizadoEm = quando;
    cat._porId = {};
    cat._skuPorId = {};
    r.produtos.forEach(function (p) { cat._porId[p.id] = p; });
    r.skus.forEach(function (s) { cat._skuPorId[s.id] = s; });
  }

  var copia = window.RL_ESTOQUE;
  aplicar(copia.csv, "copia", new Date(copia.atualizadoEm));

  /* As páginas desenham com a cópia na hora e redesenham se a planilha trouxer mudanças. */
  cat.pronto = buscarAoVivo().then(function (texto) {
    var antes = cat.skus.map(function (s) { return s.id + s.preco; }).join("|");
    aplicar(texto, "ao-vivo", new Date());
    var depois = cat.skus.map(function (s) { return s.id + s.preco; }).join("|");
    RL.emit("catalogo", { mudou: antes !== depois });
    return cat;
  }).catch(function () {
    RL.emit("catalogo", { mudou: false });
    return cat;
  });

  /* ---------- consultas ---------- */
  cat.produto = function (id) { return cat._porId[id] || null; };
  cat.sku = function (id) { return cat._skuPorId[id] || null; };
  cat.daFamilia = function (fam) { return cat.produtos.filter(function (p) { return p.familia === fam; }); };
  cat.familia = function (id) { for (var i = 0; i < FAMILIAS.length; i++) if (FAMILIAS[i].id === id) return FAMILIAS[i]; return null; };
  cat.contagem = function (filtro) { return cat.skus.filter(filtro || function () { return true; }).length; };

  cat.buscar = function (q) {
    var k = chave(q);
    if (!k) return [];
    var termos = k.split(" ");
    return cat.produtos.filter(function (p) {
      var alvo = chave(p.nome + " " + p.cores.join(" ") + " " + p.condicoes.join(" ") + " " + p.armazenamentos.join(" ") + " " + (RL.catalogo.familia(p.familia) || {}).nome);
      return termos.every(function (t) { return alvo.indexOf(t) > -1; });
    });
  };

  /* Ordem de vitrine: lacrados novos primeiro, depois seminovos com 1 ano de garantia, do mais novo ao mais antigo. */
  cat.destaques = function (n) {
    var vistos = {};
    var lista = cat.skus.slice().sort(function (a, b) {
      var pa = cat.produto(a.produtoId), pb = cat.produto(b.produtoId);
      var ga = a.garantia.meses === 12 ? 0 : 1, gb = b.garantia.meses === 12 ? 0 : 1;
      return ga - gb || pa.ordem - pb.ordem || (b.bateria || 0) - (a.bateria || 0);
    });
    var um = lista.filter(function (s) { if (vistos[s.produtoId]) return false; vistos[s.produtoId] = 1; return true; });
    var resto = lista.filter(function (s) { return um.indexOf(s) === -1; });
    return um.concat(resto).slice(0, n || 12);
  };

  /* Grupo = modelo + condição (ex.: iPhone 13 seminovo). É o que aparece em cada cartão de produto. */
  cat.agrupar = function (skus) {
    var mapa = {}, ordem = [];
    skus.forEach(function (s) {
      var id = s.produtoId + "--" + s.condicao;
      if (!mapa[id]) { mapa[id] = { id: id, produto: cat.produto(s.produtoId), condicao: s.condicao, skus: [] }; ordem.push(id); }
      mapa[id].skus.push(s);
    });
    return ordem.map(function (id) {
      var g = mapa[id], p = g.produto;
      var precos = g.skus.map(function (s) { return s.preco; }).filter(Boolean);
      var cores = p.cores.filter(function (c) { return g.skus.some(function (s) { return s.cor === c; }); });
      g.aPartirDe = precos.length ? Math.min.apply(null, precos) : null;
      g.unidades = g.skus.length;
      g.cores = cores;
      g.armazenamentos = p.armazenamentos.filter(function (a) { return g.skus.some(function (s) { return s.armazenamento === a; }); });
      g.melhorBateria = Math.max.apply(null, g.skus.map(function (s) { return s.bateria || 0; }));
      g.garantiaMax = Math.max.apply(null, g.skus.map(function (s) { return s.garantia.meses || 0; }));
      g.foto = p.fotoDaCor(cores[0]);
      g.url = RL.url("produto.html", { id: p.id, cond: g.condicao });
      return g;
    }).sort(function (a, b) { return a.produto.ordem - b.produto.ordem || (a.condicao === "lacrado" ? -1 : 1); });
  };
  cat.grupos = function (filtro) { return cat.agrupar(cat.skus.filter(filtro || function () { return true; })); };

  cat.descricaoSku = function (s) {
    var partes = [s.cor, s.armazenamento];
    if (s.condicao === "seminovo" && s.bateria) partes.push("bateria " + s.bateria + "%");
    if (s.ciclos) partes.push(s.ciclos + " ciclos de bateria");
    return partes.filter(Boolean).join(" · ");
  };
})();
