/*
 * Cabeçalho, menus, busca, sacola lateral e rodapé.
 * As páginas têm <div id="cabecalho"></div> e <div id="rodape"></div>; RL.layout() monta os dois.
 */
(function () {
  "use strict";
  var RL = window.RL;
  var esc = RL.esc;
  var I = function (n) { return RL.ui.icone(n); };
  var cat = RL.catalogo;

  /* ---------- dados dos menus (saem do estoque do dia) ---------- */
  function gruposDe(fam, cond) {
    return cat.grupos(function (s) { return (!fam || s.familia === fam) && (!cond || s.condicao === cond); });
  }
  function faixasDe(fam) {
    var F = [[0, 200000, "Até R$ 2.000"], [200000, 400000, "R$ 2.000 a R$ 4.000"], [400000, 700000, "R$ 4.000 a R$ 7.000"], [700000, null, "Acima de R$ 7.000"]];
    return F.map(function (f) {
      var n = cat.skus.filter(function (s) { return (!fam || s.familia === fam) && s.preco && s.preco >= f[0] && (f[1] == null || s.preco < f[1]); }).length;
      return { rotulo: f[2], url: RL.url("categoria.html", { c: fam, pmin: f[0] ? f[0] / 100 : null, pmax: f[1] ? f[1] / 100 : null }), n: n };
    }).filter(function (f) { return f.n > 0; });
  }
  function linkModelo(g, comCond) {
    return '<a href="' + g.url + '">' + esc(g.produto.nome) + (comCond ? " " + (g.condicao === "lacrado" ? "lacrado" : "seminovo") : "") + "<small>" + RL.preco(g.aPartirDe) + "</small></a>";
  }
  function lista(itens) { return "<ul>" + itens.map(function (h, i) { return '<li style="--d:' + i + '">' + h + "</li>"; }).join("") + "</ul>"; }
  function destaque(g, titulo) {
    if (!g) return "";
    return '<a class="mega__destaque" href="' + g.url + '" style="--d:6">' + RL.ui.imagem(g.foto, g.produto.familia, g.produto.nome, "p") +
      "<b>" + esc(titulo || g.produto.nome) + "</b><span>" + (g.unidades > 1 ? "A partir de " : "") + RL.preco(g.aPartirDe) + "</span></a>";
  }

  function megas() {
    var lacIphone = gruposDe("iphone", "lacrado"), semIphone = gruposDe("iphone", "seminovo");
    var M = {};
    M.iphone = '<div class="wrap mega__grade">' +
      '<div class="mega__col mega__col--grande"><h2>Comprar iPhone</h2>' + lista([
        '<a href="categoria.html?c=iphone">Todos os iPhones</a>',
        '<a href="categoria.html?c=iphone&amp;cond=lacrado">Lacrados</a>',
        '<a href="categoria.html?c=iphone&amp;cond=seminovo">Seminovos</a>',
        '<a href="troca.html">Troque seu usado</a>']) + "</div>" +
      '<div class="mega__col"><h2>Lacrados</h2>' + lista(lacIphone.map(function (g) { return linkModelo(g); })) + "</div>" +
      '<div class="mega__col"><h2>Seminovos</h2>' + lista(semIphone.slice(0, 8).map(function (g) { return linkModelo(g); }).concat(['<a href="categoria.html?c=iphone&amp;cond=seminovo">Ver todos</a>'])) + "</div>" +
      '<div class="mega__col"><h2>Por preço</h2>' + lista(faixasDe("iphone").map(function (f) { return '<a href="' + f.url + '">' + f.rotulo + "<small>" + f.n + "</small></a>"; })) + "</div>" +
      destaque(lacIphone[0]) + "</div>";
    var semTodos = gruposDe(null, "seminovo");
    M.seminovos = '<div class="wrap mega__grade">' +
      '<div class="mega__col mega__col--grande"><h2>Seminovos</h2>' + lista([
        '<a href="categoria.html?cond=seminovo">Todos os seminovos</a>',
        '<a href="categoria.html?cond=seminovo&amp;garantia=12">Com 1 ano de garantia</a>',
        '<a href="categoria.html?cond=seminovo&amp;bat=90">Bateria acima de 90%</a>',
        '<a href="ajuda.html#bateria">Saúde da bateria</a>']) + "</div>" +
      '<div class="mega__col"><h2>iPhone</h2>' + lista(semIphone.slice(0, 9).map(function (g) { return linkModelo(g); })) + "</div>" +
      '<div class="mega__col"><h2>iPhone</h2>' + lista(semIphone.slice(9, 18).map(function (g) { return linkModelo(g); })) + "</div>" +
      '<div class="mega__col"><h2>iPad, Watch e Mac</h2>' + lista(semTodos.filter(function (g) { return g.produto.familia !== "iphone"; }).map(function (g) { return linkModelo(g); })) + "</div>" +
      destaque(semIphone[0], semIphone[0] ? semIphone[0].produto.nome + " seminovo" : "") + "</div>";
    [["ipad", "iPad"], ["watch", "Apple Watch"], ["mac", "Mac"]].forEach(function (f) {
      var gs = gruposDe(f[0]);
      M[f[0]] = '<div class="wrap mega__grade">' +
        '<div class="mega__col mega__col--grande"><h2>Comprar ' + f[1] + "</h2>" + lista(['<a href="categoria.html?c=' + f[0] + '">Todos</a>']
          .concat(gs.some(function (g) { return g.condicao === "lacrado"; }) ? ['<a href="categoria.html?c=' + f[0] + '&amp;cond=lacrado">Lacrados</a>'] : [])
          .concat(gs.some(function (g) { return g.condicao === "seminovo"; }) ? ['<a href="categoria.html?c=' + f[0] + '&amp;cond=seminovo">Seminovos</a>'] : [])) + "</div>" +
        '<div class="mega__col"><h2>Modelos</h2>' + lista(gs.map(function (g) { return linkModelo(g, true); })) + "</div>" +
        '<div class="mega__col"><h2>Ajuda</h2>' + lista(['<a href="ajuda.html#pagamento">Formas de pagamento</a>', '<a href="ajuda.html#garantia">Garantia</a>', '<a href="ajuda.html#contato">Fale com um vendedor</a>']) + "</div>" +
        "<div></div>" + destaque(gs[0]) + "</div>";
    });
    return M;
  }

  var CATS = [
    ["iphone", "iPhone", "categoria.html?c=iphone"],
    ["seminovos", "Seminovos", "categoria.html?cond=seminovo"],
    ["ipad", "iPad", "categoria.html?c=ipad"],
    ["watch", "Apple Watch", "categoria.html?c=watch"],
    ["mac", "Mac", "categoria.html?c=mac"],
    ["lacrados", "Lacrados", "categoria.html?cond=lacrado", true],
    ["troca", "Troca", "troca.html", true]
  ];

  /* ---------- HTML do cabeçalho ---------- */
  function cabecalhoHTML(atual) {
    var M = megas();
    var cats = CATS.map(function (c) {
      var temMega = !c[3] && M[c[0]];
      return '<li><a href="' + c[2] + '"' + (c[0] === atual ? ' class="is-atual"' : "") + (temMega ? ' data-mega="' + c[0] + '" aria-expanded="false" aria-haspopup="true"' : "") + ">" + c[1] + "</a></li>";
    }).join("") + '<li class="cab__cats-dir"><a href="ajuda.html"' + (atual === "ajuda" ? ' class="is-atual"' : "") + ">Ajuda</a></li>";
    var paineis = Object.keys(M).map(function (k) { return '<div class="mega" data-mega-painel="' + k + '">' + M[k] + "</div>"; }).join("");
    return (
      '<a class="pular" href="#conteudo">Pular para o conteúdo</a>' +
      '<div class="aviso-topo"><p>Até 18x no cartão, Pix, boleto com desconto em folha ou conta de luz. <a class="link" href="ajuda.html#pagamento">Formas de pagamento</a></p></div>' +
      '<header class="cab" id="cab">' +
      '<div class="wrap cab__linha">' +
      '<button class="cab__menu" type="button" aria-label="Abrir menu" aria-expanded="false" data-abre-menu>' + I("menu") + "</button>" +
      '<a class="cab__logo" href="index.html" aria-label="RL iPhones, página inicial"><img src="' + RL.img("rl-logo.png") + '" alt="" width="27" height="32"><span>RL iPhones</span></a>' +
      '<form class="busca" role="search" action="categoria.html" data-busca autocomplete="off">' +
      '<label class="busca__campo">' + I("busca") + '<span class="sr">Buscar na loja</span><input type="search" name="q" placeholder="Buscar iPhone, iPad, Apple Watch, Mac" aria-autocomplete="list" aria-controls="busca-res" enterkeyhint="search"></label>' +
      '<button type="button" class="busca__fechar-movel" data-fecha-busca>Cancelar</button>' +
      '<div class="busca__painel" id="busca-res" data-busca-painel></div></form>' +
      '<div class="cab__acoes">' +
      '<button class="cab__acao cab__acao--busca" type="button" data-abre-busca aria-label="Buscar">' + I("busca") + "</button>" +
      '<a class="cab__acao cab__acao--whats" href="ajuda.html#contato">' + I("conversa") + "<span><small>Atendimento</small><b>WhatsApp</b></span></a>" +
      '<a class="cab__acao" href="sacola.html" data-abre-sacola aria-label="Sacola">' + I("sacola") + '<span class="cab__qtd" data-qtd>0</span></a>' +
      "</div></div>" +
      '<nav class="cab__cats" aria-label="Categorias"><ul class="wrap cab__cats-lista">' + cats + "</ul>" + paineis + "</nav>" +
      "</header>" +
      '<div class="cortina" data-cortina></div>' +
      menuMovelHTML() +
      '<div class="gaveta-fundo" data-gaveta-fundo></div>' +
      '<aside class="gaveta" data-gaveta aria-label="Sacola" aria-hidden="true"><div class="gaveta__topo"><h2>Sacola</h2><button class="gaveta__fechar" type="button" data-fecha-gaveta aria-label="Fechar sacola">' + I("fechar") + "</button></div>" +
      '<div data-gaveta-aviso></div><div class="gaveta__corpo" data-gaveta-corpo></div><div class="gaveta__rodape" data-gaveta-rodape></div></aside>'
    );
  }

  function menuMovelHTML() {
    var subs = {
      iphone: { titulo: "iPhone", grupos: gruposDe("iphone"), todos: ["Todos os iPhones", "categoria.html?c=iphone"] },
      seminovos: { titulo: "Seminovos", grupos: gruposDe(null, "seminovo"), todos: ["Todos os seminovos", "categoria.html?cond=seminovo"] }
    };
    var grandes = [
      '<button type="button" data-sub="iphone">iPhone' + I("prox") + "</button>",
      '<button type="button" data-sub="seminovos">Seminovos' + I("prox") + "</button>",
      '<a href="categoria.html?c=ipad">iPad</a>', '<a href="categoria.html?c=watch">Apple Watch</a>', '<a href="categoria.html?c=mac">Mac</a>',
      '<a href="categoria.html?cond=lacrado">Lacrados</a>', '<a href="troca.html">Troca</a>'
    ];
    var paineisSub = Object.keys(subs).map(function (k) {
      var s = subs[k];
      return '<div class="menu-movel__sub" data-sub-painel="' + k + '" hidden><p class="menu-movel__sub-titulo">' + s.titulo + '</p><ul class="menu-movel__modelos">' +
        '<li><a href="' + s.todos[1] + '"><b>' + s.todos[0] + "</b></a></li>" +
        s.grupos.map(function (g) {
          return '<li><a href="' + g.url + '">' + RL.ui.imagem(g.foto, g.produto.familia, "", "p") + "<span>" + esc(g.produto.nome) + "<small>" + RL.ui.condicaoNome(g.condicao) + " · " + (g.unidades > 1 ? "a partir de " : "") + RL.preco(g.aPartirDe) + "</small></span></a></li>";
        }).join("") + "</ul></div>";
    }).join("");
    return '<div class="menu-movel" data-menu-movel aria-hidden="true"><div class="menu-movel__trilho">' +
      '<div class="menu-movel__painel"><ul class="menu-movel__grande">' + grandes.map(function (h, i) { return '<li style="--d:' + i + '">' + h + "</li>"; }).join("") + "</ul>" +
      '<div class="menu-movel__pequeno"><h3>Atendimento</h3><ul>' + RL.config.vendedores.map(function (v) {
        return '<li><a data-whats="Olá, ' + esc(v.nome) + '! Vim pelo site da RL iPhones." data-vendedor="' + esc(v.nome) + '" href="#">' + esc(v.nome) + " · " + RL.telefone(v.whatsapp) + "</a></li>";
      }).join("") + '<li><a href="ajuda.html">Central de ajuda</a></li></ul></div></div>' +
      '<div class="menu-movel__painel"><button type="button" class="menu-movel__voltar" data-volta-menu>' + I("ant") + "Voltar</button>" + paineisSub + "</div>" +
      "</div></div>";
  }

  /* ---------- comportamento ---------- */
  function ligarCabecalho(raiz) {
    var cab = RL.$("#cab");
    var cortina = RL.$("[data-cortina]");
    var grande = window.matchMedia("(min-width: 901px)");
    var aberto = null, tAbrir, tFechar;

    function medir() {
      var h = cab.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--cab-h", Math.round(h) + "px");
      document.documentElement.style.setProperty("--cab-movel", Math.round(RL.$(".cab__linha", cab).getBoundingClientRect().height) + "px");
    }
    medir();
    window.addEventListener("resize", RL.debounce(medir, 100));

    /* menu grande */
    function abrirMega(id) {
      clearTimeout(tFechar);
      if (aberto === id) return;
      RL.$$("[data-mega-painel]", cab).forEach(function (p) { p.classList.toggle("is-aberta", p.getAttribute("data-mega-painel") === id); });
      RL.$$("[data-mega]", cab).forEach(function (a) { a.setAttribute("aria-expanded", a.getAttribute("data-mega") === id ? "true" : "false"); });
      cab.classList.add("is-aberto");
      cortina.classList.add("is-on");
      aberto = id;
    }
    function fecharMega() {
      clearTimeout(tAbrir);
      if (!aberto) return;
      RL.$$("[data-mega-painel]", cab).forEach(function (p) { p.classList.remove("is-aberta"); });
      RL.$$("[data-mega]", cab).forEach(function (a) { a.setAttribute("aria-expanded", "false"); });
      cab.classList.remove("is-aberto");
      cortina.classList.remove("is-on");
      aberto = null;
    }
    RL.fecharMega = fecharMega;
    RL.$$("[data-mega]", cab).forEach(function (a) {
      a.addEventListener("mouseenter", function () {
        if (!grande.matches) return;
        clearTimeout(tAbrir); clearTimeout(tFechar);
        tAbrir = setTimeout(function () { abrirMega(a.getAttribute("data-mega")); }, aberto ? 0 : 160);
      });
      a.addEventListener("mouseleave", function () { clearTimeout(tAbrir); });
      a.addEventListener("focus", function () { if (grande.matches) abrirMega(a.getAttribute("data-mega")); });
    });
    RL.$$(".cab__cats-lista > li > a:not([data-mega])", cab).forEach(function (a) {
      a.addEventListener("mouseenter", function () { if (aberto) tFechar = setTimeout(fecharMega, 90); });
      a.addEventListener("focus", fecharMega);
    });
    RL.$(".cab__cats", cab).addEventListener("mouseleave", function () { tFechar = setTimeout(fecharMega, 160); });
    RL.$(".cab__cats", cab).addEventListener("mouseenter", function () { clearTimeout(tFechar); });
    RL.$(".cab__linha", cab).addEventListener("mouseenter", function () { if (aberto) tFechar = setTimeout(fecharMega, 120); });
    cortina.addEventListener("click", function () { fecharMega(); fecharBusca(); });

    /* busca */
    var form = RL.$("[data-busca]", cab), campo = RL.$("input", form), painel = RL.$("[data-busca-painel]", form);
    var foco = -1;
    function rapidas() {
      return "<h3>Buscas rápidas</h3>" + [
        ["iPhone lacrado", "categoria.html?c=iphone&cond=lacrado"], ["iPhone seminovo", "categoria.html?c=iphone&cond=seminovo"],
        ["Seminovos com 1 ano de garantia", "categoria.html?cond=seminovo&garantia=12"], ["Avaliar meu iPhone usado", "troca.html"], ["Formas de pagamento", "ajuda.html#pagamento"]
      ].map(function (l) { return '<a class="busca__item busca__item--link" href="' + l[1] + '">' + l[0] + "</a>"; }).join("");
    }
    function resultados() {
      var q = campo.value.trim();
      foco = -1;
      if (!q) { painel.innerHTML = rapidas(); return; }
      var ps = cat.buscar(q).slice(0, 6);
      painel.innerHTML = ps.length
        ? "<h3>Produtos</h3>" + ps.map(function (p) {
            return '<a class="busca__item" href="' + RL.url("produto.html", { id: p.id }) + '">' + RL.ui.imagem(p.foto, p.familia, "", "p") +
              "<span>" + esc(p.nome) + "<small>" + p.condicoes.map(RL.ui.condicaoNome).join(" e ") + " · " + (p.unidades > 1 ? "a partir de " : "") + RL.preco(p.aPartirDe) + "</small></span></a>";
          }).join("") + '<a class="busca__item busca__item--link" href="' + RL.url("categoria.html", { q: q }) + '">Ver todos os resultados para “' + esc(q) + "”</a>"
        : '<p class="busca__vazio">Nada encontrado para “' + esc(q) + '”. Tente pelo nome do modelo, como “13 Pro” ou “Watch”.</p>' + rapidas();
    }
    function abrirBusca() {
      fecharMega();
      form.classList.add("is-ativa");
      if (!grande.matches) { document.body.classList.add("busca-movel", "trava"); setTimeout(function () { campo.focus(); }, 30); }
      else cortina.classList.add("is-on");
      resultados();
    }
    function fecharBusca() {
      form.classList.remove("is-ativa");
      document.body.classList.remove("busca-movel");
      if (!document.body.classList.contains("menu-aberto")) document.body.classList.remove("trava");
      if (!aberto) cortina.classList.remove("is-on");
    }
    campo.addEventListener("focus", abrirBusca);
    campo.addEventListener("input", resultados);
    campo.addEventListener("keydown", function (e) {
      var itens = RL.$$(".busca__item", painel);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        foco = RL.clamp(foco + (e.key === "ArrowDown" ? 1 : -1), 0, itens.length - 1);
        itens.forEach(function (a, i) { a.classList.toggle("is-foco", i === foco); });
      } else if (e.key === "Enter" && foco > -1 && itens[foco]) { e.preventDefault(); location.href = itens[foco].href; }
      else if (e.key === "Escape") { campo.blur(); fecharBusca(); }
    });
    form.addEventListener("submit", function (e) { if (!campo.value.trim()) e.preventDefault(); });
    document.addEventListener("click", function (e) { if (form.classList.contains("is-ativa") && !form.contains(e.target) && !e.target.closest("[data-abre-busca]")) fecharBusca(); });
    RL.$("[data-abre-busca]", cab).addEventListener("click", abrirBusca);
    RL.$("[data-fecha-busca]", cab).addEventListener("click", fecharBusca);

    /* menu do celular */
    var mm = RL.$("[data-menu-movel]");
    var botaoMenu = RL.$("[data-abre-menu]", cab);
    function alternarMenu(abrir) {
      if (abrir) mm.style.paddingTop = Math.max(0, Math.round(cab.getBoundingClientRect().bottom)) + "px";
      document.body.classList.toggle("menu-aberto", abrir);
      document.body.classList.toggle("trava", abrir);
      botaoMenu.setAttribute("aria-expanded", abrir ? "true" : "false");
      botaoMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
      mm.setAttribute("aria-hidden", abrir ? "false" : "true");
      if (!abrir) mm.classList.remove("is-sub");
    }
    botaoMenu.addEventListener("click", function () { alternarMenu(!document.body.classList.contains("menu-aberto")); });
    RL.$$("[data-sub]", mm).forEach(function (b) {
      b.addEventListener("click", function () {
        RL.$$("[data-sub-painel]", mm).forEach(function (p) { p.hidden = p.getAttribute("data-sub-painel") !== b.getAttribute("data-sub"); });
        mm.classList.add("is-sub");
      });
    });
    RL.$("[data-volta-menu]", mm).addEventListener("click", function () { mm.classList.remove("is-sub"); });
    grande.addEventListener("change", function () { if (grande.matches) { alternarMenu(false); fecharBusca(); } else fecharMega(); });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      fecharMega(); fecharBusca(); fecharSacola();
      if (document.body.classList.contains("menu-aberto")) alternarMenu(false);
    });
  }

  /* ---------- sacola lateral ---------- */
  var gaveta, fundoGaveta, ultimoFoco;
  function desenharSacola(adicionado) {
    var linhas = RL.sacola.linhas();
    var corpo = RL.$("[data-gaveta-corpo]"), rodape = RL.$("[data-gaveta-rodape]"), aviso = RL.$("[data-gaveta-aviso]");
    aviso.innerHTML = adicionado ? '<p class="gaveta__aviso">' + I("okCirculo") + esc(adicionado.nome) + " foi para a sacola.</p>" : "";
    RL.$("h2", gaveta).textContent = "Sacola" + (linhas.length ? " (" + linhas.length + ")" : "");
    if (!linhas.length) {
      corpo.innerHTML = '<div class="gaveta__vazia">' + I("sacola") + "<b>Sua sacola está vazia.</b>Escolha um aparelho para começar.</div>";
      rodape.innerHTML = '<a class="btn btn--bloco" href="categoria.html?c=iphone">Ver iPhones</a>';
      return;
    }
    corpo.innerHTML = linhas.map(function (l) {
      var it = l.item;
      return '<div class="gaveta__item' + (l.disponivel ? "" : " is-vendido") + '">' + RL.ui.imagem(it.foto, (l.sku || {}).familia, it.nome, "p") +
        "<div><b>" + esc(it.nome) + "</b><span>" + RL.ui.condicaoNome(it.condicao) + " · " + esc(it.descricao) + '</span><button type="button" data-remove="' + esc(it.id) + '">Remover</button></div>' +
        "<em>" + (l.disponivel ? RL.preco(l.preco) : "Indisponível") + "</em></div>";
    }).join("");
    var total = RL.sacola.total();
    rodape.innerHTML = '<p class="gaveta__total"><span>Subtotal</span><span>' + RL.preco(total) + '</span></p><p class="gaveta__parc">' + RL.parcelas(total) + "</p>" +
      '<a class="btn btn--bloco" href="checkout.html">Finalizar compra</a><a class="btn btn--bloco btn--cinza" href="sacola.html">Ver sacola</a>';
  }
  function abrirSacola(adicionado) {
    if (RL.fecharMega) RL.fecharMega();
    ultimoFoco = document.activeElement;
    desenharSacola(adicionado);
    gaveta.classList.add("is-aberta");
    gaveta.setAttribute("aria-hidden", "false");
    fundoGaveta.classList.add("is-on");
    document.body.classList.add("trava");
    setTimeout(function () { RL.$("[data-fecha-gaveta]", gaveta).focus(); }, 60);
  }
  function fecharSacola() {
    if (!gaveta || !gaveta.classList.contains("is-aberta")) return;
    gaveta.classList.remove("is-aberta");
    gaveta.setAttribute("aria-hidden", "true");
    fundoGaveta.classList.remove("is-on");
    document.body.classList.remove("trava");
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  RL.abrirSacola = abrirSacola;
  RL.fecharSacola = fecharSacola;

  function ligarSacola() {
    gaveta = RL.$("[data-gaveta]");
    fundoGaveta = RL.$("[data-gaveta-fundo]");
    var qtd = RL.$("[data-qtd]");
    function contar(pulo) {
      var n = RL.sacola.quantidade();
      qtd.textContent = n;
      qtd.classList.toggle("is-on", n > 0);
      qtd.parentElement.setAttribute("aria-label", n ? "Sacola com " + RL.plural(n, "item", "itens") : "Sacola");
      if (pulo) { qtd.classList.remove("is-pulo"); void qtd.offsetWidth; qtd.classList.add("is-pulo"); }
    }
    contar(false);
    RL.$("[data-abre-sacola]").addEventListener("click", function (e) {
      if (document.body.classList.contains("pg-sacola") || document.body.classList.contains("pg-checkout")) return;
      e.preventDefault();
      abrirSacola();
    });
    RL.$("[data-fecha-gaveta]").addEventListener("click", fecharSacola);
    fundoGaveta.addEventListener("click", fecharSacola);
    gaveta.addEventListener("click", function (e) {
      var b = e.target.closest("[data-remove]");
      if (b) RL.sacola.remover(b.getAttribute("data-remove"));
    });
    RL.on("sacola", function (d) {
      contar(d.acao === "adicionar");
      if (gaveta.classList.contains("is-aberta")) desenharSacola();
    });
    RL.on("catalogo", function () { if (gaveta.classList.contains("is-aberta")) desenharSacola(); contar(false); });
  }

  /* ---------- rodapé ---------- */
  function rodapeHTML(trilha, semBeneficios) {
    var B = [
      ["cartao", "Até 18x no cartão", "Ou Pix, boleto com desconto em folha e conta de luz."],
      ["escudo", "Garantia de até 1 ano", "Lacrados com garantia Apple. Nos seminovos, a garantia vem em cada aparelho."],
      ["caminhao", "Entrega em Tatuí e região", "Ou retire na loja. O vendedor combina com você."],
      ["troca", "Seu usado na troca", "O valor do seu iPhone entra no pagamento do próximo."]
    ];
    var v = RL.config.vendedores;
    var col = function (t, links) { return "<div><h3>" + t + "</h3><ul>" + links.map(function (l) { return "<li>" + l + "</li>"; }).join("") + "</ul></div>"; };
    return (
      (semBeneficios ? "" : '<section class="wrap beneficios" aria-label="Vantagens">' + B.map(function (b, i) { return '<div class="beneficio" data-rev style="--i:' + i + '">' + I(b[0]) + "<p><b>" + b[1] + "</b><span>" + b[2] + "</span></p></div>"; }).join("") + "</section>") +
      '<footer class="rodape"><div class="wrap rodape__dentro">' +
      '<div class="rodape__notas">' +
      "<p>Preços e estoque conforme a tabela da própria loja. Cada seminovo é uma unidade única e pode ser vendido a qualquer momento.</p>" +
      "<p>Parcelamento em até 18x no cartão de crédito. Taxas e as condições de cada forma de pagamento são confirmadas pelo vendedor.</p>" +
      "<p>Lacrados com 1 ano de garantia Apple. Seminovos com a garantia informada em cada aparelho: 1 ano, 3 meses ou sem garantia.</p>" +
      "<p>Imagens ilustrativas. A saúde da bateria indica a capacidade atual da bateria em relação a quando o aparelho era novo.</p>" +
      "</div>" +
      (trilha ? '<nav class="rodape__trilha" aria-label="Você está em"><a href="index.html"><img src="' + RL.img("rl-logo.png") + '" alt="RL iPhones"></a>' + I("seta") + "<span>" + esc(trilha) + "</span></nav>" : "") +
      '<div class="rodape__colunas">' +
      col("Comprar", ['<a href="categoria.html?c=iphone&amp;cond=lacrado">iPhone lacrado</a>', '<a href="categoria.html?c=iphone&amp;cond=seminovo">iPhone seminovo</a>', '<a href="categoria.html?c=ipad">iPad</a>', '<a href="categoria.html?c=watch">Apple Watch</a>', '<a href="categoria.html?c=mac">Mac</a>', '<a href="categoria.html">Todos os produtos</a>']) +
      col("Ajuda", ['<a href="ajuda.html#como-comprar">Como comprar</a>', '<a href="ajuda.html#pagamento">Formas de pagamento</a>', '<a href="ajuda.html#entrega">Entrega e retirada</a>', '<a href="ajuda.html#garantia">Garantia</a>', '<a href="ajuda.html#bateria">Saúde da bateria</a>']) +
      col("Troca", ['<a href="troca.html">Avaliar meu usado</a>', '<a href="ajuda.html#troca">Como funciona a troca</a>']) +
      col("Atendimento", v.map(function (x) { return '<a data-whats="Olá, ' + esc(x.nome) + '! Vim pelo site da RL iPhones." data-vendedor="' + esc(x.nome) + '" href="#">' + esc(x.nome) + " · " + RL.telefone(x.whatsapp) + "</a>"; })) +
      col("RL iPhones", ['<a href="' + RL.config.loja.instagram + '" target="_blank" rel="noopener">Instagram ' + esc(RL.config.loja.instagramUsuario) + "</a>", '<a href="' + RL.config.loja.linktree + '" target="_blank" rel="noopener">Linktree</a>', "<span>" + esc(RL.config.loja.cidade) + "</span>"]) +
      "</div>" +
      '<div class="rodape__pagto"><b>Formas de pagamento</b><span>Cartão de crédito em até 18x</span><span>Pix</span><span>Dinheiro</span><span>Boleto com desconto em folha</span><span>Conta de energia</span></div>' +
      '<div class="rodape__legal"><p>A RL iPhones é uma loja independente, sem vínculo com a Apple Inc. Apple, iPhone, iPad, Apple Watch e Mac são marcas da Apple Inc., registradas nos EUA e em outros países.</p><p>© ' + new Date().getFullYear() + " RL iPhones · Tatuí/SP</p></div>" +
      "</div></footer>"
    );
  }

  /* ---------- montagem ---------- */
  RL.layout = function (opts) {
    opts = opts || {};
    var c = RL.$("#cabecalho");
    if (c) {
      if (opts.simples) {
        c.outerHTML = '<a class="pular" href="#conteudo">Pular para o conteúdo</a><header class="cab-simples"><div class="wrap"><a class="cab__logo" href="index.html" aria-label="RL iPhones, página inicial"><img src="' + RL.img("rl-logo.png") + '" alt="" width="27" height="32"><span>RL iPhones</span></a><a class="link" href="sacola.html">Voltar para a sacola</a></div></header>';
        document.documentElement.style.setProperty("--cab-h", "64px");
      } else {
        c.outerHTML = cabecalhoHTML(opts.atual);
        ligarCabecalho();
        ligarSacola();
      }
    }
    var r = RL.$("#rodape");
    if (r) r.outerHTML = rodapeHTML(opts.trilha, opts.semBeneficios);
    RL.ui.ligarWhats(document);
    RL.movimento.revelar(document);
  };

  /* Quando a planilha ao vivo traz mudanças, os menus são refeitos com o estoque novo. */
  RL.on("catalogo", function (d) {
    if (!d.mudou) return;
    var cab = RL.$("#cab");
    if (!cab) return;
    var M = megas();
    RL.$$("[data-mega-painel]", cab).forEach(function (p) { var k = p.getAttribute("data-mega-painel"); if (M[k]) p.innerHTML = M[k]; });
  });
})();
