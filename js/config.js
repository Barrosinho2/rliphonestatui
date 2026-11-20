/*
 * Configuração da loja. Tudo que muda de um cliente para outro fica aqui.
 */
window.RL_CONFIG = {
  loja: {
    nome: "RL iPhones",
    cidade: "Tatuí/SP",
    regiaoEntrega: "Tatuí e região",
    instagram: "https://www.instagram.com/rliphonestatui/",
    instagramUsuario: "@rliphonestatui",
    linktree: "https://linktr.ee/RL.iPhones"
  },

  /* Vendedores (WhatsApp no formato 55 + DDD + número). O primeiro é o padrão. */
  vendedores: [
    { nome: "Rafael", whatsapp: "5515981712735" },
    { nome: "Marcos", whatsapp: "5515988011932" },
    { nome: "Gabriel", whatsapp: "5515998203216" },
    { nome: "Hugo", whatsapp: "5515997418412" }
  ],

  /* Planilha de preços da loja. O site lê a aba ao vivo e usa data/estoque.js se ela não responder. */
  planilha: {
    id: "10g46rCZ7QXyoZ1pNbwRoLC42ohKKR1ywI2EdQb6yqE8",
    gid: "0",
    aoVivo: true,
    tempoLimiteMs: 6000
  },

  pagamento: {
    parcelasCartao: 18,
    /* Se a loja confirmar parcelamento sem juros, troque para true: o site passa a mostrar o valor da parcela. */
    semJuros: false,
    parcelasAposentado: 48,
    formas: [
      { id: "cartao", nome: "Cartão de crédito", detalhe: "Em até 18x." },
      { id: "pix", nome: "Pix ou dinheiro", detalhe: "Pagamento à vista." },
      { id: "folha", nome: "Boleto com desconto em folha", detalhe: "Para CLT com 21 anos ou mais e pelo menos 1 ano de carteira." },
      { id: "luz", nome: "Conta de energia", detalhe: "Para quem é titular da conta de luz." },
      { id: "inss", nome: "Aposentados e pensionistas", detalhe: "Em até 48x." }
    ]
  },

  entrega: [
    { id: "retirada", nome: "Retirar na loja", detalhe: "Em Tatuí. O vendedor combina o horário com você." },
    { id: "entrega", nome: "Receber em casa", detalhe: "Em Tatuí e região. O vendedor combina o dia com você." }
  ],

  /* Troca: opções do formulário de avaliação do usado. */
  troca: {
    modelos: ["iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone 17", "iPhone Air", "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16", "iPhone 16e", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14", "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13", "iPhone 13 mini", "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12", "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11", "Outro modelo"],
    armazenamentos: ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"],
    estados: [
      { id: "otimo", nome: "Sem marcas de uso", detalhe: "Tela e traseira inteiras, sem riscos visíveis." },
      { id: "bom", nome: "Marcas leves", detalhe: "Riscos pequenos que só aparecem de perto." },
      { id: "detalhe", nome: "Tela ou traseira com detalhe", detalhe: "Trinco, mancha ou peça já trocada." },
      { id: "defeito", nome: "Com defeito", detalhe: "Algo não funciona: Face ID, câmera, som ou outro." }
    ]
  },

  /*
   * Checkout. Hoje o pedido fecha no WhatsApp do vendedor.
   * Quando a loja tiver pagamento online, troque "whatsapp" pelo id do provedor
   * registrado em js/checkout.js (veja o exemplo no topo daquele arquivo).
   */
  checkout: {
    provedor: "whatsapp"
  }
};
