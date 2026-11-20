/*
 * Checkout em etapas (dados, entrega, pagamento, revisão), no padrão de loja online.
 * Ao finalizar, o pedido é montado por RL.checkout e entregue ao provedor configurado
 * (hoje o WhatsApp do vendedor; amanhã um gateway de pagamento).
 */
(function () {
  "use strict";
  var RL = window.RL, ui = RL.ui, esc = RL.esc, cfg = RL.config;

  RL.layout({ simples: true, semBeneficios: true, trilha: "Finalizar compra" });

  var d = Object.assign({ nome: "", telefone: "", email: "", entrega: "retirada", cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", pagamento: "cartao", parcelas: "1", troca: "", vendedor: "qualquer", observacao: "" }, RL.sacola.dados());
  var etapa = 1, feitas = {};

  function guardar() { RL.sacola.guardarDados(d); }
  function campo(nome, rotulo, extra, classe) {
    return '<label class="campo ' + (classe || "") + '"><span class="campo__rot">' + rotulo + '</span><input class="entrada" name="' + nome + '" value="' + esc(d[nome]) + '"' + (extra || "") + "></label>";
  }
  function escolha(nome, valor, rot, det, marcado) {
    return '<label class="escolha"><input type="radio" name="' + nome + '" value="' + valor + '"' + (marcado ? " checked" : "") + '><span class="escolha__caixa"><span><span class="escolha__nome">' + esc(rot) + '</span><span class="escolha__det">' + esc(det) + "</span></span></span></label>";
  }
  function mascaraTel(v) {
    var n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 2) return n;
    if (n.length <= 6) return "(" + n.slice(0, 2) + ") " + n.slice(2);
    if (n.length <= 10) return "(" + n.slice(0, 2) + ") " + n.slice(2, 6) + "-" + n.slice(6);
    return "(" + n.slice(0, 2) + ") " + n.slice(2, 7) + "-" + n.slice(7);
  }
  function mascaraCep(v) { var n = v.replace(/\D/g, "").slice(0, 8); return n.length > 5 ? n.slice(0, 5) + "-" + n.slice(5) : n; }

  /* ---------- conteúdo de cada etapa ---------- */
  var E = {};
  E[1] = {
    form: function () {
      return '<div class="campos">' + campo("nome", "Nome completo", ' autocomplete="name" required') +
        campo("telefone", "WhatsApp", ' type="tel" inputmode="tel" autocomplete="tel" placeholder="(15) 99999-9999" required', "c-3") +
        campo("email", "E-mail (opcional)", ' type="email" autocomplete="email" inputmode="email"', "c-3") + "</div>";
    },
    validar: function () {
      var e = [];
      if (d.nome.trim().length < 3) e.push("nome");
      if (d.telefone.replace(/\D/g, "").length < 10) e.push("telefone");
      if (d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) e.push("email");
      return e;
    },
    resumo: function () { return esc(d.nome) + "<br>" + esc(d.telefone) + (d.email ? "<br>" + esc(d.email) : ""); }
  };
  E[2] = {
    form: function () {
      var end = d.entrega === "entrega";
      return '<div class="escolhas escolhas--2">' + cfg.entrega.map(function (o) { return escolha("entrega", o.id, o.nome, o.detalhe, d.entrega === o.id); }).join("") + "</div>" +
        '<div class="endereco" data-endereco' + (end ? "" : " hidden") + '><div class="campos">' +
        '<label class="campo c-2"><span class="campo__rot">CEP</span><input class="entrada" name="cep" value="' + esc(d.cep) + '" inputmode="numeric" autocomplete="postal-code" placeholder="00000-000"><span class="campo__ajuda cep-status" data-cep-status></span></label>' +
        campo("rua", "Rua", ' autocomplete="address-line1"', "c-4") + campo("numero", "Número", ' inputmode="numeric"', "c-2 c-meio") + campo("complemento", "Complemento (opcional)", "", "c-4 c-meio") +
        campo("bairro", "Bairro", "", "c-3") + campo("cidade", "Cidade", ' autocomplete="address-level2"', "c-3") +
        '</div><p class="etapa__nota">A entrega é em Tatuí e região. O vendedor confirma o endereço e combina o dia com você.</p></div>';
    },
    validar: function () {
      if (d.entrega !== "entrega") return [];
      var e = [];
      ["rua", "numero", "bairro", "cidade"].forEach(function (k) { if (!String(d[k]).trim()) e.push(k); });
      if (d.cep && d.cep.replace(/\D/g, "").length !== 8) e.push("cep");
      return e;
    },
    resumo: function () {
      var o = RL.checkout.entrega(d.entrega);
      if (d.entrega !== "entrega") return esc(o.nome) + "<br>Em Tatuí, no horário combinado com o vendedor.";
      return esc(o.nome) + "<br>" + esc(d.rua + ", " + d.numero + (d.complemento ? " · " + d.complemento : "")) + "<br>" + esc(d.bairro + " · " + d.cidade + (d.cep ? " · " + d.cep : ""));
    }
  };
  E[3] = {
    form: function () {
      var total = RL.sacola.total();
      var opcoesParc = "";
      for (var i = 1; i <= cfg.pagamento.parcelasCartao; i++) opcoesParc += '<option value="' + i + '"' + (String(i) === String(d.parcelas) ? " selected" : "") + ">" + (i === 1 ? "À vista" : i + "x") + "</option>";
      var vend = '<option value="qualquer">Quem estiver livre</option>' + cfg.vendedores.map(function (v) { return '<option value="' + esc(v.nome) + '"' + (d.vendedor === v.nome ? " selected" : "") + ">" + esc(v.nome) + "</option>"; }).join("");
      return '<div class="escolhas">' + cfg.pagamento.formas.map(function (f) { return escolha("pagamento", f.id, f.nome, f.detalhe, d.pagamento === f.id); }).join("") + "</div>" +
        '<div class="campos" style="margin-top:18px">' +
        '<label class="campo c-3" data-parcelas' + (d.pagamento === "cartao" ? "" : " hidden") + '><span class="campo__rot">Parcelas no cartão</span><select class="entrada" name="parcelas">' + opcoesParc + '</select><span class="campo__ajuda">Taxas confirmadas pelo vendedor. Total de ' + RL.preco(total) + ".</span></label>" +
        '<label class="campo c-3"><span class="campo__rot">Falar com</span><select class="entrada" name="vendedor">' + vend + "</select></label>" +
        campo("troca", "Tem um usado para dar na troca? (opcional)", ' placeholder="Ex.: iPhone 13, 128 GB, bateria 84%"') +
        '<label class="campo"><span class="campo__rot">Observação (opcional)</span><textarea class="entrada" name="observacao" rows="2">' + esc(d.observacao) + "</textarea></label></div>";
    },
    validar: function () { return []; },
    resumo: function () {
      var f = RL.checkout.forma(d.pagamento);
      return esc(f.nome) + (d.pagamento === "cartao" ? " · " + (d.parcelas === "1" ? "à vista" : d.parcelas + "x") : "") +
        (d.troca ? "<br>Usado na troca: " + esc(d.troca) : "") + (d.vendedor !== "qualquer" ? "<br>Falar com " + esc(d.vendedor) : "");
    }
  };
  E[4] = {
    form: function () {
      return '<div class="revisao"><div><b>Seus dados</b>' + E[1].resumo() + "</div><div><b>Entrega</b>" + E[2].resumo() + "</div><div><b>Pagamento</b>" + E[3].resumo() + "</div></div>" +
        '<button class="btn btn--bloco" type="submit" style="margin-top:24px" data-finalizar>Finalizar pedido</button>' +
        '<p class="etapa__nota">Nada é cobrado pelo site. O pedido vai para o vendedor, que confirma a disponibilidade e combina o pagamento com você pelo WhatsApp.</p>';
    },
    validar: function () { return []; }
  };

  /* ---------- desenho ---------- */
  var form = RL.$("[data-form]");
  function desenhar(foco) {
    RL.$$("[data-etapa]", form).forEach(function (sec) {
      var n = +sec.getAttribute("data-etapa");
      var c = RL.$("[data-conteudo]", sec), topo = RL.$(".etapa__topo", sec);
      sec.classList.toggle("is-futura", n > etapa && !feitas[n]);
      var alt = RL.$("[data-alterar]", topo);
      if (alt) alt.remove();
      if (n === etapa) {
        c.className = "etapa__corpo";
        c.innerHTML = E[n].form() + (n < 4 ? '<button class="btn btn--continuar" type="button" data-continuar>Continuar</button>' : "");
      } else if (feitas[n] && n < 4) {
        c.className = "etapa__resumo";
        c.innerHTML = E[n].resumo();
        topo.insertAdjacentHTML("beforeend", '<button type="button" data-alterar="' + n + '">Alterar</button>');
      } else {
        c.className = "";
        c.innerHTML = "";
      }
    });
    RL.$$("[data-etapas] li").forEach(function (li, i) {
      li.classList.toggle("is-atual", i + 1 === etapa);
      li.classList.toggle("is-feita", !!feitas[i + 1] && i + 1 !== etapa);
    });
    resumo();
    if (foco) {
      var sec = RL.$('[data-etapa="' + etapa + '"]', form);
      var y = sec.getBoundingClientRect().top + window.scrollY - 100;
      if (Math.abs(window.scrollY - y) > 80) window.scrollTo({ top: y, behavior: RL.menosMovimento ? "auto" : "smooth" });
      var primeiro = RL.$("input:not([type=radio]), select", sec);
      if (primeiro && etapa === 1) setTimeout(function () { primeiro.focus({ preventScroll: true }); }, 300);
    }
  }
  function resumo() {
    var linhas = RL.sacola.linhas().filter(function (l) { return l.disponivel; });
    var total = RL.sacola.total();
    RL.$("[data-resumo]").innerHTML = "<h2>Seu pedido</h2>" +
      '<div class="resumo__itens">' + linhas.map(function (l) {
        var s = l.sku;
        return '<div class="resumo__item">' + ui.imagem(s.foto, s.familia, s.nome, "p") + "<span><b>" + esc(s.nome) + "</b>" + ui.condicaoNome(s.condicao) + " · " + esc(RL.catalogo.descricaoSku(s)) + "</span><em>" + RL.preco(s.preco) + "</em></div>";
      }).join("") + "</div>" +
      '<p class="resumo__linha"><span>Subtotal</span><span>' + RL.preco(total) + "</span></p>" +
      '<p class="resumo__linha"><span>Entrega</span><span>' + (d.entrega === "entrega" ? "Combinada com o vendedor" : "Retirada na loja") + "</span></p>" +
      '<p class="resumo__total"><span>Total</span><span>' + RL.preco(total) + '</span></p><p class="resumo__parc">' + RL.parcelas(total) + "</p>" +
      '<p class="etapa__nota"><a class="link" href="sacola.html">Editar sacola</a></p>';
  }

  function lerCampos(sec) {
    RL.$$("input, select, textarea", sec).forEach(function (el) {
      if (el.type === "radio") { if (el.checked) d[el.name] = el.value; }
      else if (el.name) d[el.name] = el.value;
    });
  }
  function marcarErros(sec, erros) {
    RL.$$(".entrada", sec).forEach(function (el) { el.classList.toggle("is-erro", erros.indexOf(el.name) > -1); });
    var p = RL.$(".is-erro", sec);
    if (p) p.focus();
  }

  form.addEventListener("click", function (e) {
    if (e.target.closest("[data-continuar]")) {
      var sec = RL.$('[data-etapa="' + etapa + '"]', form);
      lerCampos(sec);
      var erros = E[etapa].validar();
      if (erros.length) { marcarErros(sec, erros); ui.toast("Confira os campos marcados."); return; }
      guardar();
      feitas[etapa] = true;
      etapa = Math.min(4, etapa + 1);
      while (feitas[etapa] && etapa < 4) etapa++;
      desenhar(true);
      return;
    }
    var alt = e.target.closest("[data-alterar]");
    if (alt) { etapa = +alt.getAttribute("data-alterar"); desenhar(true); }
  });
  form.addEventListener("input", function (e) {
    var el = e.target;
    if (el.name === "telefone") el.value = mascaraTel(el.value);
    if (el.name === "cep") {
      el.value = mascaraCep(el.value);
      if (el.value.replace(/\D/g, "").length === 8) buscarCep(el.value.replace(/\D/g, ""));
    }
    if (el.classList.contains("is-erro") && el.value.trim()) el.classList.remove("is-erro");
  });
  form.addEventListener("change", function (e) {
    var el = e.target;
    if (el.name === "entrega") {
      d.entrega = el.value;
      RL.$("[data-endereco]", form).hidden = el.value !== "entrega";
      resumo();
    }
    if (el.name === "pagamento") { d.pagamento = el.value; RL.$("[data-parcelas]", form).hidden = el.value !== "cartao"; }
  });

  /* endereço pelo CEP (ViaCEP); se não responder, o cliente preenche à mão */
  var cepAtual = "";
  function buscarCep(cep) {
    if (cep === cepAtual || !window.fetch) return;
    cepAtual = cep;
    var st = RL.$("[data-cep-status]", form);
    st.textContent = "Buscando endereço…";
    fetch("https://viacep.com.br/ws/" + cep + "/json/").then(function (r) { return r.json(); }).then(function (j) {
      if (j.erro) { st.textContent = "CEP não encontrado. Preencha o endereço."; return; }
      var set = function (n, v) { var el = RL.$('[name="' + n + '"]', form); if (el && v && !el.value) { el.value = v; el.classList.remove("is-erro"); } };
      set("rua", j.logradouro); set("bairro", j.bairro); set("cidade", j.localidade ? j.localidade + (j.uf ? "/" + j.uf : "") : "");
      st.textContent = "Endereço encontrado.";
      var num = RL.$('[name="numero"]', form);
      if (num && !num.value) num.focus();
    }).catch(function () { st.textContent = "Não deu para buscar o CEP. Preencha o endereço."; });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var b = RL.$("[data-finalizar]", form);
    if (b) { b.disabled = true; b.textContent = "Enviando…"; }
    var dados = Object.assign({}, d, { troca: d.troca.trim() || null });
    RL.checkout.finalizar(dados).then(function (r) {
      RL.sacola.limpar();
      if (RL.config.checkout.provedor === "whatsapp") location.href = RL.url("pedido.html", { codigo: r.pedido.codigo });
      else RL.checkout.ir(r);
    }).catch(function () {
      if (b) { b.disabled = false; b.textContent = "Finalizar pedido"; }
      ui.toast("Sua sacola está vazia ou os aparelhos saíram do estoque.");
    });
  });

  function iniciar() {
    if (!RL.sacola.linhas().some(function (l) { return l.disponivel; })) {
      RL.$("[data-corpo]").innerHTML = '<div class="vazio" style="grid-column:1/-1">' + ui.icone("sacola") + "<h2>Sua sacola está vazia.</h2><p>Escolha um aparelho para finalizar a compra.</p>" +
        '<div class="ctas"><a class="btn" href="categoria.html">Ver produtos</a></div></div>';
      RL.$("[data-etapas]").hidden = true;
      return;
    }
    if (E[1].validar().length === 0 && d.nome) { feitas[1] = true; etapa = 2; }
    desenhar(false);
  }
  iniciar();
  RL.on("catalogo", function (x) { if (x.mudou) resumo(); });
})();
