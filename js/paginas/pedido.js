/* Confirmação: mostra o pedido criado e o botão para enviá-lo ao vendedor pelo WhatsApp. */
(function () {
  "use strict";
  var RL = window.RL, ui = RL.ui, esc = RL.esc;

  RL.layout({ trilha: "Pedido" });

  var ultimo = RL.store.get("rl.ultimoPedido", null);
  var codigo = RL.params().get("codigo");
  var el = RL.$("[data-pedido]");

  if (!ultimo || (codigo && ultimo.pedido.codigo !== codigo)) {
    el.innerHTML = '<div class="vazio">' + ui.icone("sacola") + "<h2>Não encontramos esse pedido neste aparelho.</h2><p>Se você já enviou o pedido pelo WhatsApp, é só continuar a conversa com o vendedor.</p>" +
      '<div class="ctas"><a class="btn" href="index.html">Voltar para a loja</a></div></div>';
    return;
  }

  var p = ultimo.pedido;
  var forma = RL.checkout.forma(p.pagamento.forma), ent = RL.checkout.entrega(p.entrega.tipo);
  var end = p.entrega.endereco;
  el.innerHTML =
    '<svg class="pedido__ok" viewBox="0 0 52 52" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg>' +
    '<h1 class="t-1">Pedido criado.</h1><p class="pedido__codigo">Código <b>' + esc(p.codigo) + "</b></p>" +
    '<p class="t-intro">Falta enviar para o vendedor. Ele confirma se os aparelhos continuam disponíveis e combina o pagamento e a entrega com você.</p>' +
    '<div class="pedido__acoes"><a class="btn btn--bloco" href="' + esc(ultimo.url) + '" target="_blank" rel="noopener">' + ui.icone("conversa") + "Enviar pedido pelo WhatsApp</a>" +
    '<a class="btn btn--bloco btn--cinza" href="index.html">Continuar comprando</a></div>' +
    '<div class="pedido__caixa"><h2>Resumo</h2><div class="resumo__itens">' + p.itens.map(function (i) {
      var s = RL.catalogo.sku(i.sku);
      return '<div class="resumo__item">' + ui.imagem(s ? s.foto : null, s ? s.familia : "iphone", i.nome, "p") + "<span><b>" + esc(i.nome) + "</b>" + ui.condicaoNome(i.condicao) + " · " + esc(i.descricao) + "</span><em>" + RL.preco(i.precoCentavos) + "</em></div>";
    }).join("") + "</div>" +
    '<p class="resumo__total"><span>Total</span><span>' + RL.preco(p.totalCentavos) + "</span></p>" +
    '<div class="revisao" style="margin-top:18px"><div><b>Pagamento</b>' + esc(forma ? forma.nome : "A combinar") + (p.pagamento.parcelas ? " · " + (p.pagamento.parcelas === 1 ? "à vista" : p.pagamento.parcelas + "x") : "") + "</div>" +
    "<div><b>Entrega</b>" + esc(ent ? ent.nome : "A combinar") + (end ? "<br>" + esc(end.rua + ", " + end.numero + " · " + end.bairro + " · " + end.cidade) : "") + "</div>" +
    "<div><b>Contato</b>" + esc(p.cliente.nome) + "<br>" + esc(p.cliente.telefone) + "</div></div></div>" +
    '<div class="pedido__caixa"><h2>Próximos passos</h2><ol class="passos">' +
    "<li>Envie o pedido pelo WhatsApp com o botão acima. A mensagem já vai pronta.</li>" +
    "<li>O vendedor confirma a disponibilidade dos aparelhos e as condições do pagamento.</li>" +
    "<li>Você paga e recebe em casa ou retira na loja, como combinar com o vendedor.</li></ol></div>";
})();
