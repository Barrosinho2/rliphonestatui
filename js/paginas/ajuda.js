/* Central de ajuda: assuntos com marcação do trecho visível. */
(function () {
  "use strict";
  var RL = window.RL, ui = RL.ui, esc = RL.esc;

  RL.layout({ atual: "ajuda", trilha: "Central de ajuda" });

  var ic = { cartao: "cartao", pix: "dinheiro", folha: "boleto", luz: "raio", inss: "pessoa" };
  RL.$("[data-formas]").innerHTML = RL.config.pagamento.formas.map(function (f) {
    return '<div class="forma">' + ui.icone(ic[f.id]) + "<p><b>" + esc(f.nome) + "</b><span>" + esc(f.detalhe) + "</span></p></div>";
  }).join("");
  RL.$("[data-vendedores]").innerHTML = RL.config.vendedores.map(function (v) {
    return '<li class="vendedor"><span class="vendedor__ini" aria-hidden="true">' + esc(v.nome.charAt(0)) + "</span><div><b>" + esc(v.nome) + "</b><span>" + RL.telefone(v.whatsapp) + "</span></div>" +
      '<a class="btn btn--p btn--linha" data-whats="Olá, ' + esc(v.nome) + '! Vim pelo site da RL iPhones e queria tirar uma dúvida." data-vendedor="' + esc(v.nome) + '" href="#">WhatsApp</a></li>';
  }).join("");
  var ig = RL.$("[data-instagram]");
  ig.href = RL.config.loja.instagram;
  ig.textContent = RL.config.loja.instagramUsuario;
  ui.ligarWhats(document);

  /* marca no menu o assunto que está na tela */
  var links = RL.$$("[data-ajuda-nav] a");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("is-atual", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    RL.$$(".ajuda__conteudo section").forEach(function (s) { io.observe(s); });
  }
})();
