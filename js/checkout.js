/*
 * Checkout desacoplado.
 *
 * A página de checkout chama RL.checkout.finalizar(dados). O pedido é montado num
 * formato pronto para um gateway e entregue ao provedor configurado em js/config.js
 * (checkout.provedor). Hoje o provedor é o WhatsApp do vendedor.
 *
 * Para cobrar online, registre um provedor com a mesma assinatura:
 *
 *   RL.checkout.registrar("pagamentoOnline", {
 *     nome: "Pagamento online",
 *     iniciar: function (pedido) {
 *       // Envie o pedido para o seu backend (ex.: função serverless em /api/pedidos).
 *       // O backend confere os preços na planilha, reserva os aparelhos, cria a cobrança
 *       // no gateway e devolve a URL de pagamento.
 *       return fetch("/api/pedidos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pedido) })
 *         .then(function (r) { return r.json(); })
 *         .then(function (r) { return { url: r.urlPagamento, novaAba: false }; });
 *     }
 *   });
 *
 * e troque checkout.provedor para "pagamentoOnline" em js/config.js.
 */
(function () {
  "use strict";
  var RL = window.RL;
  var provedores = {};

  function codigo() {
    var d = new Date();
    var p = function (n) { return String(n).padStart(2, "0"); };
    return "RL-" + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  }
  function forma(id) { return RL.config.pagamento.formas.filter(function (f) { return f.id === id; })[0] || null; }
  function entrega(id) { return RL.config.entrega.filter(function (e) { return e.id === id; })[0] || null; }

  /* Pedido no formato que um gateway recebe (preços em centavos). */
  function montarPedido(dados) {
    var linhas = (dados.itens || RL.sacola.linhas()).filter(function (l) { return l.disponivel !== false && l.sku; });
    var itens = linhas.map(function (l) {
      var s = l.sku;
      return {
        sku: s.id, produto: s.produtoId, nome: s.nome, descricao: RL.catalogo.descricaoSku(s),
        condicao: s.condicao, garantia: s.garantia.texto, observacao: s.obs || null,
        quantidade: 1, precoCentavos: s.preco
      };
    });
    return {
      codigo: codigo(),
      criadoEm: new Date().toISOString(),
      moeda: "BRL",
      itens: itens,
      totalCentavos: itens.reduce(function (t, i) { return t + (i.precoCentavos || 0); }, 0),
      cliente: { nome: (dados.nome || "").trim(), telefone: (dados.telefone || "").trim(), email: (dados.email || "").trim() },
      entrega: {
        tipo: dados.entrega || "retirada",
        endereco: dados.entrega === "entrega" ? {
          cep: dados.cep || "", rua: dados.rua || "", numero: dados.numero || "", complemento: dados.complemento || "",
          bairro: dados.bairro || "", cidade: dados.cidade || ""
        } : null
      },
      pagamento: { forma: dados.pagamento || "cartao", parcelas: dados.pagamento === "cartao" ? parseInt(dados.parcelas, 10) || 1 : null },
      troca: dados.troca || null,
      vendedor: dados.vendedor && dados.vendedor !== "qualquer" ? dados.vendedor : null,
      observacao: (dados.observacao || "").trim()
    };
  }

  function textoWhatsApp(p) {
    var l = [];
    l.push("Olá" + (p.vendedor ? ", " + p.vendedor : "") + "! Fiz um pedido pelo site.");
    l.push("");
    l.push("*Pedido " + p.codigo + "*");
    p.itens.forEach(function (i) {
      var extra = [i.condicao === "lacrado" ? "lacrado" : "seminovo", i.garantia, i.observacao].filter(Boolean).join(", ");
      l.push("• " + i.nome + " · " + i.descricao + " (" + extra + "): " + RL.preco(i.precoCentavos));
    });
    l.push("*Total: " + RL.preco(p.totalCentavos) + "*");
    l.push("");
    var f = forma(p.pagamento.forma);
    l.push("Pagamento: " + (f ? f.nome : "a combinar") + (p.pagamento.parcelas ? " em " + p.pagamento.parcelas + "x" : ""));
    var e = entrega(p.entrega.tipo);
    l.push("Entrega: " + (e ? e.nome : "a combinar"));
    if (p.entrega.endereco) {
      var a = p.entrega.endereco;
      l.push("Endereço: " + [a.rua + (a.numero ? ", " + a.numero : ""), a.complemento, a.bairro, a.cidade, a.cep].filter(Boolean).join(" · "));
    }
    if (p.troca) l.push("Usado na troca: " + p.troca);
    if (p.cliente.nome) l.push("Nome: " + p.cliente.nome);
    if (p.cliente.telefone) l.push("Telefone: " + p.cliente.telefone);
    if (p.cliente.email) l.push("E-mail: " + p.cliente.email);
    if (p.observacao) l.push("Observação: " + p.observacao);
    l.push("");
    l.push("Pode confirmar a disponibilidade?");
    return l.join("\n");
  }

  var checkout = (RL.checkout = {});
  checkout.registrar = function (id, provedor) { provedores[id] = provedor; };
  checkout.montarPedido = montarPedido;
  checkout.textoWhatsApp = textoWhatsApp;
  checkout.forma = forma;
  checkout.entrega = entrega;

  checkout.registrar("whatsapp", {
    nome: "WhatsApp",
    iniciar: function (pedido) {
      return Promise.resolve({ url: RL.whats(textoWhatsApp(pedido), pedido.vendedor), novaAba: true });
    }
  });

  /* Monta o pedido, guarda como último pedido e entrega ao provedor. */
  checkout.finalizar = function (dados) {
    var pedido = montarPedido(dados);
    if (!pedido.itens.length) return Promise.reject(new Error("sacola vazia"));
    var prov = provedores[RL.config.checkout.provedor] || provedores.whatsapp;
    return prov.iniciar(pedido).then(function (r) {
      var res = Object.assign({ pedido: pedido }, r);
      RL.store.set("rl.ultimoPedido", { pedido: pedido, url: r.url });
      RL.emit("pedido", res);
      return res;
    });
  };

  /* Leva o cliente ao destino do provedor. Se o navegador bloquear a nova aba, abre na mesma. */
  checkout.ir = function (r) {
    if (!r || !r.url) return;
    if (!r.novaAba) { location.href = r.url; return; }
    var aba = window.open(r.url, "_blank");
    if (aba) { try { aba.opener = null; } catch (e) { /* outra origem */ } }
    else location.href = r.url;
  };
})();
