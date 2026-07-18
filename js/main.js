// [wild]lab — preloader boot sequence + reveal on scroll
(function () {
  var lines = [
    { p: '$', t: 'boot [wild]lab', ok: '' },
    { p: '>', t: 'loading kernel [wild]', ok: 'ok' },
    { p: '>', t: 'mounting /lab', ok: 'ok' },
    { p: '>', t: 'design.svc dev.svc automation.svc ai.svc', ok: 'ok' },
    { p: '>', t: 'caffeina', ok: 'ok' },
    { p: '$', t: 'init landing', ok: '_' }
  ];

  var pre = document.getElementById('preloader');
  var boot = document.getElementById('boot');
  var cursorLine = boot.querySelector('.cursor-line');
  var i = 0;

  var timer = setInterval(function () {
    var l = lines[i];
    var div = document.createElement('div');
    div.className = 'line';
    div.innerHTML =
      '<span class="prompt">' + l.p + '</span>' +
      '<span>' + l.t + (l.ok ? ' <span class="ok">' + l.ok + '</span>' : '') + '</span>';
    boot.insertBefore(div, cursorLine);
    i++;
    if (i >= lines.length) {
      clearInterval(timer);
      setTimeout(function () { pre.classList.add('hide'); }, 500);
      setTimeout(function () { pre.classList.add('gone'); initReveal(); }, 1300);
    }
  }, 280);

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  // Form contatti — invio AJAX senza lasciare la pagina
  var form = document.querySelector('.contact-form');
  if (form) {
    var btn = form.querySelector('button[type="submit"]');
    var status = document.createElement('div');
    status.className = 'form-status mono';
    form.appendChild(status);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      btn.disabled = true;
      btn.textContent = 'invio…';
      status.textContent = '';
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (r) {
        if (r.ok) {
          form.reset();
          showModal(true);
        } else {
          showModal(false);
        }
      }).catch(function () {
        showModal(false);
      }).finally(function () {
        btn.disabled = false;
        btn.textContent = 'invia →';
      });
    });

    // Modale di conferma
    var modal = document.createElement('div');
    modal.className = 'form-modal';
    modal.innerHTML =
      '<div class="form-modal-box mono">' +
      '<div class="form-modal-msg"></div>' +
      '<button type="button" class="form-modal-close">chiudi [x]</button>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector('.form-modal-close').addEventListener('click', function () {
      modal.classList.remove('open');
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.classList.remove('open');
    });
    function showModal(ok) {
      modal.querySelector('.form-modal-msg').innerHTML = ok
        ? '<span class="prompt">$</span> messaggio inviato <span class="ok">ok</span><br><span class="sub">Ti rispondo appena posso. Grazie!</span>'
        : '<span class="prompt">$</span> errore di invio<br><span class="sub">Riprova tra poco o scrivimi direttamente a marcpalm76@gmail.com</span>';
      modal.classList.add('open');
    }
  }
})();
