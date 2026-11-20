# Site RL iPhones

Loja online da RL iPhones (Tatuí/SP) em HTML, CSS e JavaScript puros. Não precisa de build nem de instalação: abre direto no navegador e sobe em qualquer hospedagem estática (Vercel, Netlify).

## Páginas

| Arquivo | O que é |
|---|---|
| `index.html` | Início: carrossel de destaques, categorias, vitrines, cores do iPhone 18 Pro Max presas ao scroll, compra por preço, pagamento e atendimento |
| `categoria.html` | Lista de produtos e busca. Parâmetros: `c` (iphone, ipad, watch, mac), `cond` (lacrado, seminovo), `q` (busca), `modelo`, `arm`, `cor`, `garantia`, `bat`, `pmin`, `pmax`, `ordem`. Os filtros ficam no link |
| `produto.html?id=…` | Página de produto: galeria com zoom, condição, cor, armazenamento e o aparelho escolhido pela saúde da bateria |
| `sacola.html` | Sacola, com a sacola lateral disponível em todas as páginas |
| `checkout.html` | Finalizar compra em 4 etapas: dados, entrega (com busca de endereço pelo CEP), pagamento e revisão |
| `pedido.html` | Confirmação do pedido, com o botão que envia o pedido pronto ao vendedor pelo WhatsApp |
| `troca.html` | Avaliação do iPhone usado para dar na troca |
| `ajuda.html` | Central de ajuda: como comprar, pagamento, entrega, garantia, bateria, troca e contato |

## Como abrir

- **No computador:** dois cliques no `index.html`. O site usa a cópia da tabela salva em `data/estoque.js`.
- **Publicado (http/https):** o site lê a planilha da loja ao vivo toda vez que abre, e preço e estoque se atualizam sozinhos. Se a planilha não responder em 6 segundos, usa a cópia salva.

A leitura ao vivo não funciona aberta direto do arquivo (`file://`) porque o Google bloqueia esse acesso. Para testar no computador, rode na pasta do site `python -m http.server 8000` e abra `http://localhost:8000`.

## Estoque

A fonte é a planilha da loja (a mesma do Linktree). O id e a aba ficam em `js/config.js` → `planilha`.

- Cada linha é um aparelho. Colunas: modelo, cor, armazenamento, preço, garantia, bateria.
- As linhas que começam com "MODELOS" separam as seções (seminovos, lacrados, iPad, Watch, Mac).
- Garantia: "1 ano" vira 12 meses; "1 ano Apple" vira garantia Apple; "3 meses"; "Garantia 0" vira sem garantia. Outros textos ("Tela com detalhe", "Traseira trocada"…) aparecem como observação do aparelho.
- Bateria: "87%" é saúde da bateria; "60 ciclos" (Mac) é contagem de ciclos.
- iPad, Watch e Mac com garantia Apple e bateria 100% entram como lacrados.

**Modelo novo na planilha:** cadastre em `data/modelos.js` (nome, família, ordem, ano, especificações, cores e fotos). Se o nome escrito na planilha for diferente, inclua em `RL_APELIDOS`. Sem cadastro, o modelo aparece do mesmo jeito, com um ícone no lugar da foto.

**Atualizar a cópia de reserva:** na planilha, Arquivo → Fazer download → CSV. Cole o texto no campo `csv` de `data/estoque.js` e troque a data em `atualizadoEm`.

## Fotos dos aparelhos

Ficam em `assets/produtos/`, uma por modelo e cor, em dois tamanhos: `<nome>-g.webp` (1000 px, página do produto) e `<nome>-p.webp` (520 px, cartões e listas). O vínculo cor → foto está em `data/modelos.js` → `fotos`. São as fotos oficiais de produto da Apple, com fundo transparente.

Cor nova sem foto usa a foto da primeira cor do modelo. Para trocar por uma foto própria da loja, salve os dois tamanhos com o mesmo nome.

## Configuração (`js/config.js`)

- `vendedores`: nome e WhatsApp (55 + DDD + número). O primeiro é o padrão.
- `pagamento`: parcelas no cartão e formas de pagamento. Se a loja confirmar parcelamento sem juros, troque `semJuros` para `true` e o site passa a mostrar o valor da parcela.
- `entrega`: retirada e entrega.
- `troca`: modelos, armazenamentos e estados do formulário de troca.
- `checkout.provedor`: para onde o pedido vai (hoje, `"whatsapp"`).

## E-commerce: como ligar o pagamento online

O lado do navegador já é o de uma loja online:

- **Catálogo** (`js/catalogo.js`): produto (modelo) → SKUs (cada aparelho), preços em centavos.
- **Sacola** (`js/sacola.js`): guardada no navegador e conferida com o estoque do dia (avisa se o aparelho saiu da tabela ou mudou de preço).
- **Checkout** (`checkout.html` + `js/checkout.js`): coleta dados, endereço e pagamento e monta o pedido:

```json
{
  "codigo": "RL-261120-K3QZ",
  "criadoEm": "2026-11-20T14:24:33.583Z",
  "moeda": "BRL",
  "itens": [{ "sku": "rl-…", "produto": "iphone-15", "nome": "iPhone 15", "descricao": "Verde · 128 GB · bateria 90%", "condicao": "seminovo", "garantia": "1 ano de garantia", "quantidade": 1, "precoCentavos": 299900 }],
  "totalCentavos": 299900,
  "cliente": { "nome": "…", "telefone": "…", "email": "…" },
  "entrega": { "tipo": "entrega", "endereco": { "cep": "…", "rua": "…", "numero": "…", "complemento": "", "bairro": "…", "cidade": "…" } },
  "pagamento": { "forma": "cartao", "parcelas": 10 },
  "troca": null,
  "vendedor": null,
  "observacao": ""
}
```

Para cobrar online:

1. **Backend.** Crie uma função (por exemplo `api/pedidos.js` na Vercel) que recebe o pedido, **confere os preços na planilha** (nunca confie no preço que vem do navegador), cria a cobrança no gateway escolhido (Mercado Pago, Pagar.me, Stripe) e devolve a URL de pagamento.
2. **Provedor.** Registre o provedor em `js/checkout.js`. O exemplo está no topo do arquivo.
3. **Ligar.** Troque `checkout.provedor` em `js/config.js` pelo id do provedor novo. O checkout passa a mandar o cliente para o pagamento em vez da página de confirmação.
4. **Reserva do aparelho.** Cada seminovo é único: o backend precisa marcar o aparelho como reservado ou vendido (coluna de status na planilha ou banco de dados) para não vender o mesmo aparelho duas vezes.
5. **Código fixo por aparelho.** Hoje o id de cada aparelho sai dos dados da linha e muda se o preço mudar. Crie a coluna G na planilha com um código por aparelho: o site passa a usar esse código como id automaticamente.

## Estrutura

```
index.html, categoria.html, produto.html, sacola.html, checkout.html, pedido.html, troca.html, ajuda.html
css/   fontes.css (Inter embutida), base.css (cores, tipografia, botões, formulários),
       layout.css (cabeçalho, menus, busca, sacola lateral, rodapé),
       componentes.css (cartões, vitrines, selos, abas), paginas.css
js/    config.js, core.js, catalogo.js, sacola.js, checkout.js, ui.js, movimento.js, layout.js
js/paginas/   um arquivo por página
data/  modelos.js (cadastro dos modelos), estoque.js (cópia da planilha)
assets/produtos/   fotos dos aparelhos
assets/img/        logo, ícones e foto da loja
```

O cabeçalho, os menus e o rodapé são montados por `js/layout.js` a partir do estoque: os menus de iPhone, Seminovos, iPad, Watch e Mac mostram só o que tem na tabela, com o preço de cada modelo.

A tipografia usa a fonte do sistema da Apple (SF) em iPhone e Mac e a Inter nos outros aparelhos. O movimento fica em `js/movimento.js` e respeita a opção do sistema de reduzir movimento.

## Observações

- As fotos dos aparelhos são as fotos oficiais de produto da Apple. Revendas costumam usá-las; se a loja preferir, troque por fotos próprias com os mesmos nomes de arquivo.
- O rodapé informa que a RL é uma loja independente, sem vínculo com a Apple.
- As especificações em `data/modelos.js` são de referência. Vale a loja revisar, principalmente nos modelos mais novos.
- Endereço e horário da loja não aparecem no site porque os dados encontrados estavam desatualizados. Quando a loja confirmar, dá para incluir na central de ajuda e no rodapé.
