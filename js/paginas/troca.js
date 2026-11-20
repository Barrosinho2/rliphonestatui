/* Troca: avaliação do usado em blocos, resumo ao lado e envio da proposta pelo WhatsApp. */
(function () {
  "use strict";
  var RL = window.RL, ui = RL.ui, esc = RL.esc, T = RL.config.troca, cat = RL.catalogo;
  var CHAVE = "rl.troca.v2";

  RL.layout({ atual: "troca", trilha: "Troca" });

  var est = Object.assign({ modelo: "", arm: "", bateria: null, semBateria: false, estado: "", interesse: "", nome: "", vendedor: "qualquer" }, RL.store.get(CHAVE, {}));
  function guardar() { RL.store.set(CHAVE, est); }

  /* as fotos do topo se aproximam conforme a página rola */
  var imgs = RL.$$("[data-troca-img] img");
  if (!RL.menosMovimento) RL.movimento.cena(RL.$(".troca-topo"), function (p) {
    var t = RL.clamp(p * 1.6, 0, 1);
    imgs[0].style.transform = "translate(" + (t * 14).toFixed(1) + "%, -46%) rotate(" + (-6 + t * 4).toFixed(2) + "deg)";
    imgs[1].style.transform = "translate(" + (-t * 14).toFixed(1) + "%, -54%) rotate(" + (6 - t * 4).toFixed(2) + "deg)";
  }, "visivel");

  function interesses() { return cat.daFamilia("iphone").map(function (p) { return p.nome; }); }

  function blocos() {
    var vend = '<option value="qualquer">Quem estiver livre</option>' + RL.config.vendedores.map(function (v) { return '<option value="' + esc(v.nome) + '"' + (est.vendedor === v.nome ? " selected" : "") + ">" + esc(v.nome) + "</option>"; }).join("");
    var b = est.semBateria ? 0 : est.bateria || 0;
    return (
      '<div class="bloco" data-bloco="modelo"><h2>Modelo</h2><label class="campo"><span class="sr">Modelo</span><select class="entrada" name="modelo"><option value="">Escolha o modelo do seu iPhone</option>' +
      T.modelos.map(function (m) { return "<option" + (est.modelo === m ? " selected" : "") + ">" + esc(m) + "</option>"; }).join("") +
      '</select></label><p class="ajuda-inline">Não sabe o modelo? No iPhone, abra Ajustes &gt; Geral &gt; Sobre.</p></div>' +
      '<div class="bloco" data-bloco="arm"><h2>Armazenamento</h2><div class="opcoes-grade">' + T.armazenamentos.map(function (a) {
        return '<button type="button" class="opcao-p" data-arm="' + esc(a) + '" aria-pressed="' + (est.arm === a) + '"><b>' + esc(a) + "</b></button>";
      }).join("") + "</div></div>" +
      '<div class="bloco" data-bloco="bateria"><h2>Saúde da bateria <small>opcional</small></h2>' +
      '<div class="bat-ctrl' + (est.semBateria ? " is-off" : "") + (b ? "" : " is-vazio") + '"><span class="bat' + (b ? " bat--" + ui.nivelBateria(b) : "") + '" data-bat-icone><span class="bat__corpo"><span class="bat__nivel" style="width:' + b + '%"></span></span></span>' +
      '<input type="range" name="bateria" min="50" max="100" step="1" value="' + (est.bateria || 85) + '" aria-label="Saúde da bateria em porcentagem"' + (est.semBateria ? " disabled" : "") + '><output data-bat-saida>' + (est.semBateria ? "?" : b ? b + "%" : "Arraste") + "</output></div>" +
      '<label class="checagem"><input type="checkbox" name="semBateria"' + (est.semBateria ? " checked" : "") + '>Não sei ou aparece “Serviço”</label>' +
      '<p class="ajuda-inline">Para ver: Ajustes &gt; Bateria &gt; Saúde e Carregamento da Bateria.</p></div>' +
      '<div class="bloco" data-bloco="estado"><h2>Como ele está?</h2><div class="escolhas escolhas--2">' + T.estados.map(function (e) {
        return '<label class="escolha"><input type="radio" name="estado" value="' + esc(e.nome) + '"' + (est.estado === e.nome ? " checked" : "") + '><span class="escolha__caixa"><span><span class="escolha__nome">' + esc(e.nome) + '</span><span class="escolha__det">' + esc(e.detalhe) + "</span></span></span></label>";
      }).join("") + "</div></div>" +
      '<div class="bloco" data-bloco="interesse"><h2>O que você quer levar? <small>opcional</small></h2><label class="campo"><span class="sr">Aparelho de interesse</span><select class="entrada" name="interesse"><option value="">Ainda não sei</option>' +
      interesses().map(function (n) { return "<option" + (est.interesse === n ? " selected" : "") + ">" + esc(n) + "</option>"; }).join("") + "</select></label></div>" +
      '<div class="bloco" data-bloco="contato"><h2>Contato</h2><div class="campos"><label class="campo c-3"><span class="campo__rot">Seu nome</span><input class="entrada" name="nome" autocomplete="name" value="' + esc(est.nome) + '"></label>' +
      '<label class="campo c-3"><span class="campo__rot">Falar com</span><select class="entrada" name="vendedor">' + vend + "</select></label></div></div>"
    );
  }

  function linhas() {
    return [["Modelo", est.modelo], ["Armazenamento", est.arm], ["Bateria", est.semBateria ? "Não informada" : est.bateria ? est.bateria + "%" : ""], ["Estado", est.estado], ["Quer levar", est.interesse]];
  }
  function lado() {
    var l = linhas(), feitos = l.filter(function (x) { return x[1]; }).length;
    var prod = est.interesse && cat.produtos.filter(function (p) { return p.nome === est.interesse; })[0];
    RL.$("[data-lado]").innerHTML = "<h2>Seu usado</h2>" +
      '<div class="troca-progresso" aria-hidden="true"><span style="width:' + Math.round(feitos / l.length * 100) + '%"></span></div>' +
      '<dl class="troca-resumo">' + l.map(function (x) { return '<div class="' + (x[1] ? "is-ok" : "") + '"><dt>' + x[0] + "</dt><dd>" + (x[1] ? esc(x[1]) : "Falta escolher") + "</dd></div>"; }).join("") + "</dl>" +
      (prod ? '<p class="etapa__nota">O ' + esc(prod.nome) + " está na loja a partir de <b>" + RL.preco(prod.aPartirDe) + '</b>. <a class="link" href="' + RL.url("produto.html", { id: prod.id }) + '">Ver aparelhos</a></p>' : "") +
      '<button class="btn btn--bloco" type="button" data-enviar>Pedir proposta pelo WhatsApp</button>' +
      '<p class="etapa__nota">A proposta é feita pelo vendedor. O valor final é combinado quando ele vê o aparelho.</p>';
  }

  function texto() {
    var l = ["Olá! Quero avaliar meu iPhone para dar na troca.", ""];
    linhas().forEach(function (x) { if (x[1]) l.push(x[0] + ": " + x[1]); });
    if (est.nome) l.push("Nome: " + est.nome);
    l.push("", "Qual seria a proposta?");
    return l.join("\n");
  }
  function faltando() { var f = []; if (!est.modelo) f.push("modelo"); if (!est.arm) f.push("arm"); if (!est.estado) f.push("estado"); return f; }

  var form = RL.$("[data-form]");
  function atualizarBateria() {
    var b = est.semBateria ? 0 : est.bateria || 0;
    var ic = RL.$("[data-bat-icone]", form);
    ic.className = "bat" + (b ? " bat--" + ui.nivelBateria(b) : "");
    RL.$(".bat__nivel", ic).style.width = b + "%";
    RL.$("[data-bat-saida]", form).textContent = est.semBateria ? "?" : b ? b + "%" : "Arraste";
    RL.$(".bat-ctrl", form).classList.toggle("is-vazio", !b && !est.semBateria);
    RL.$(".bat-ctrl", form).classList.toggle("is-off", est.semBateria);
    RL.$('[name="bateria"]', form).disabled = est.semBateria;
  }
  form.addEventListener("click", function (e) {
    var b = e.target.closest("[data-arm]");
    if (!b) return;
    est.arm = b.getAttribute("data-arm");
    RL.$$("[data-arm]", form).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    b.closest(".bloco").classList.remove("is-erro");
    guardar(); lado();
  });
  form.addEventListener("input", function (e) {
    var el = e.target;
    if (el.name === "bateria") { est.bateria = parseInt(el.value, 10); atualizarBateria(); }
    else if (el.name === "nome") est.nome = el.value;
    else return;
    guardar(); lado();
  });
  form.addEventListener("change", function (e) {
    var el = e.target;
    if (el.name === "semBateria") { est.semBateria = el.checked; atualizarBateria(); }
    else if (el.name && el.name !== "bateria" && el.name !== "nome") { est[el.name] = el.value; var bl = el.closest(".bloco"); if (bl) bl.classList.remove("is-erro"); }
    guardar(); lado();
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest("[data-enviar]")) return;
    var f = faltando();
    if (f.length) {
      f.forEach(function (k) { RL.$('[data-bloco="' + k + '"]', form).classList.add("is-erro"); });
      RL.$('[data-bloco="' + f[0] + '"]', form).scrollIntoView({ behavior: RL.menosMovimento ? "auto" : "smooth", block: "center" });
      ui.toast("Escolha o modelo, o armazenamento e como ele está.");
      return;
    }
    RL.checkout.ir({ url: RL.whats(texto(), est.vendedor === "qualquer" ? null : est.vendedor), novaAba: true });
  });

  RL.$("[data-blocos]").innerHTML = blocos();
  lado();
  RL.movimento.revelar(document);
  RL.on("catalogo", function (d) { if (d.mudou) { RL.$("[data-blocos]").innerHTML = blocos(); lado(); } });
})();
