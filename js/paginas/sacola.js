/* Sacola: itens com o preço do dia, aviso de aparelho vendido ou preço alterado, resumo e ida ao checkout. */
(function () {
  "use strict";
  var RL = window.RL, ui = RL.ui, esc = RL.esc, cat = RL.catalogo;

  RL.layout({ trilha: "Sacola" });

  var garantias = function () {
    return '<ul class="resumo__seguro">' +
      "<li>" + ui.icone("escudo") + "<span>Cada aparelho mostra a garantia antes da compra.</span></li>" +
      "<li>" + ui.icone("conversa") + "<span>O vendedor confirma a disponibilidade pelo WhatsApp antes do pagamento.</span></li>" +
      "<li>" + ui.icone("caminhao") + "<span>Entrega em Tatuí e região ou retirada na loja.</span></li></ul>";
  };

  function itemHTML(l) {
    var it = l.item, s = l.sku;
    var det = s ? [ui.condicaoNome(s.condicao), cat.descricaoSku(s), s.garantia.texto].concat(s.obs ? [s.obs] : []) : [it.descricao];
    var aviso = !s ? "Esse aparelho saiu da tabela da loja. Ele pode ter sido vendido e não entra no pedido."
      : l.mudouPreco ? "O preço mudou de " + RL.preco(it.preco) + " para " + RL.preco(s.preco) + " desde que você adicionou." : "";
    var link = s ? RL.url("produto.html", { id: s.produtoId, sku: s.id }) : null;
    return '<article class="item" data-item="' + esc(it.id) + '">' +
      '<div class="item__img">' + ui.imagem(it.foto, s ? s.familia : "iphone", it.nome, "p") + "</div>" +
      "<div>" + (link ? '<a class="item__nome" href="' + link + '">' + esc(it.nome) + "</a>" : '<p class="item__nome">' + esc(it.nome) + "</p>") +
      '<p class="item__det">' + det.map(esc).join("<br>") + "</p>" + (aviso ? '<p class="item__aviso">' + aviso + "</p>" : "") +
      '<div class="item__acoes"><button type="button" data-remover="' + esc(it.id) + '">Remover</button>' + (link ? '<a href="' + link + '">Ver aparelho</a>' : "") + "</div></div>" +
      '<p class="item__preco">' + (s ? RL.preco(l.preco) + "<small>" + RL.parcelas(l.preco) + "</small>" : "Indisponível") + "</p></article>";
  }

  function desenhar() {
    var linhas = RL.sacola.linhas();
    var disp = linhas.filter(function (l) { return l.disponivel; });
    var total = RL.sacola.total();
    var vazia = !linhas.length;
    RL.$("[data-titulo]").textContent = vazia ? "Sua sacola está vazia." : "Sua sacola soma " + RL.preco(total) + ".";
    RL.$("[data-subtitulo]").textContent = vazia ? "Escolha um aparelho no estoque para começar." : RL.plural(disp.length, "aparelho disponível", "aparelhos disponíveis") + (disp.length < linhas.length ? ". Um ou mais aparelhos saíram da tabela." : ".");
    RL.$("[data-corpo]").hidden = vazia;
    RL.$("[data-sugestoes]").hidden = !vazia;
    if (vazia) {
      if (!RL.$("[data-sugestoes-lista]").children.length) {
        RL.$("[data-sugestoes-lista]").innerHTML = cat.grupos().slice(0, 10).map(function (g, i) { return ui.cartaoGrupo(g, { rev: true, i: Math.min(i, 4) }); }).join("");
        RL.movimento.prateleiras(RL.$("[data-sugestoes]"));
        RL.movimento.revelar(document);
      }
      RL.$("[data-subtitulo]").innerHTML = 'Escolha um aparelho no estoque para começar. <a class="link" href="categoria.html">Ver todos os produtos</a>';
      return;
    }
    RL.$("[data-itens]").innerHTML = linhas.map(itemHTML).join("");
    RL.$("[data-resumo]").innerHTML = "<h2>Resumo</h2>" +
      '<p class="resumo__linha"><span>Subtotal (' + RL.plural(disp.length, "item", "itens") + ")</span><span>" + RL.preco(total) + "</span></p>" +
      '<p class="resumo__linha"><span>Entrega</span><span>Combinada no checkout</span></p>' +
      '<p class="resumo__total"><span>Total</span><span>' + RL.preco(total) + '</span></p><p class="resumo__parc">' + RL.parcelas(total) + "</p>" +
      '<a class="btn btn--bloco' + (disp.length ? "" : " is-off") + '" href="checkout.html">Finalizar compra</a>' +
      '<a class="btn btn--bloco btn--cinza" href="categoria.html" style="margin-top:10px">Continuar comprando</a>' + garantias();
  }

  RL.$("[data-itens]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-remover]");
    if (!b) return;
    var art = b.closest(".item");
    art.classList.add("is-saindo");
    setTimeout(function () { RL.sacola.remover(b.getAttribute("data-remover")); }, RL.menosMovimento ? 0 : 320);
  });

  desenhar();
  RL.ui.ligarCartoes(document);
  RL.on("sacola", desenhar);
  RL.on("catalogo", function (d) { if (d.mudou) desenhar(); });
})();
