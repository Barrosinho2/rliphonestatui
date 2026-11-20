/*
 * Sacola (carrinho). Guarda os aparelhos escolhidos no navegador e confere com o
 * estoque do dia sempre que a página abre: se um aparelho saiu da tabela ou mudou
 * de preço, a sacola mostra isso antes do pedido.
 */
(function () {
  "use strict";
  var RL = window.RL;
  var CHAVE = "rl.sacola.v2";

  function ler() { return RL.store.get(CHAVE, { itens: [], dados: {} }); }
  function gravar(d) { RL.store.set(CHAVE, d); }

  var sacola = (RL.sacola = {});

  sacola.itens = function () { return ler().itens; };
  sacola.tem = function (id) { return ler().itens.some(function (i) { return i.id === id; }); };
  sacola.quantidade = function () { return ler().itens.length; };

  /* Cada aparelho é único (seminovo) ou vendido um por pedido (lacrado): quantidade sempre 1. */
  sacola.adicionar = function (id) {
    var sku = RL.catalogo.sku(id);
    if (!sku) return { ok: false, motivo: "indisponivel" };
    var d = ler();
    if (d.itens.some(function (i) { return i.id === id; })) return { ok: true, jaEstava: true, sku: sku };
    d.itens.push({
      id: id, produtoId: sku.produtoId, nome: sku.nome, condicao: sku.condicao,
      descricao: RL.catalogo.descricaoSku(sku), preco: sku.preco, foto: sku.foto, em: Date.now()
    });
    gravar(d);
    RL.emit("sacola", { acao: "adicionar", id: id });
    return { ok: true, jaEstava: false, sku: sku };
  };

  sacola.remover = function (id) {
    var d = ler();
    d.itens = d.itens.filter(function (i) { return i.id !== id; });
    gravar(d);
    RL.emit("sacola", { acao: "remover", id: id });
  };

  sacola.limpar = function () {
    var d = ler();
    d.itens = [];
    gravar(d);
    RL.emit("sacola", { acao: "limpar" });
  };

  /* Itens com o preço e a disponibilidade de hoje. */
  sacola.linhas = function () {
    return ler().itens.map(function (i) {
      var sku = RL.catalogo.sku(i.id);
      return { item: i, sku: sku, disponivel: !!sku, preco: sku ? sku.preco : i.preco, mudouPreco: !!sku && sku.preco !== i.preco };
    });
  };
  sacola.total = function () {
    return sacola.linhas().filter(function (l) { return l.disponivel; }).reduce(function (t, l) { return t + (l.preco || 0); }, 0);
  };

  /* Dados do checkout (nome, entrega, pagamento) ficam guardados para a próxima visita. */
  sacola.dados = function () { return ler().dados || {}; };
  sacola.guardarDados = function (novos) {
    var d = ler();
    d.dados = Object.assign({}, d.dados, novos);
    gravar(d);
  };

  window.addEventListener("storage", function (e) { if (e.key === CHAVE) RL.emit("sacola", { acao: "sincronizar" }); });
})();
