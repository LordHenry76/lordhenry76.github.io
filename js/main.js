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

// Pong — wildlab arcade
(function () {
  var overlay = document.getElementById('pong-overlay');
  var canvas = document.getElementById('pong-canvas');
  var link = document.getElementById('pong-link');
  var closeBtn = document.getElementById('pong-close');
  if (!overlay || !canvas || !link) return;
  var ctx = canvas.getContext('2d');
  var W = 720, H = 480, PH = 72, PW = 10, R = 6;
  var g, raf, keys = {};

  function serve() {
    if (g.over) { g.ps = 0; g.as = 0; g.over = false; }
    g.bx = W / 2; g.by = H / 2;
    g.vx = 5 * (Math.random() < 0.5 ? 1 : -1);
    g.vy = Math.random() * 5 - 2.5;
    g.running = true; g.msg = '';
  }
  function clampY(y) { return Math.max(PH / 2, Math.min(H - PH / 2, y)); }

  function loop() {
    if (keys['ArrowUp']) g.py -= 7;
    if (keys['ArrowDown']) g.py += 7;
    g.py = clampY(g.py);
    if (g.running) {
      g.bx += g.vx; g.by += g.vy;
      if (g.by < R || g.by > H - R) { g.vy *= -1; g.by = Math.max(R, Math.min(H - R, g.by)); }
      if (g.vx < 0 && g.bx - R < 24 + PW && g.bx - R > 14 && Math.abs(g.by - g.py) < PH / 2 + R) { g.vx = Math.min(11, -g.vx * 1.06); g.vy += (g.by - g.py) * 0.12; }
      if (g.vx > 0 && g.bx + R > W - 24 - PW && g.bx + R < W - 14 && Math.abs(g.by - g.ay) < PH / 2 + R) { g.vx = Math.max(-11, -g.vx * 1.06); g.vy += (g.by - g.ay) * 0.12; }
      g.ay = clampY(g.ay + Math.max(-4.4, Math.min(4.4, (g.by - g.ay) * 0.085)));
      if (g.bx < -R) { g.as++; g.running = false; g.over = g.as >= 5; g.msg = g.over ? 'game over — spazio per rigiocare' : 'punto al lab — spazio per servire'; }
      if (g.bx > W + R) { g.ps++; g.running = false; g.over = g.ps >= 5; g.msg = g.over ? 'hai vinto! — spazio per rigiocare' : 'punto per te — spazio per servire'; }
    }
    ctx.fillStyle = '#0A0A0A'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(250,250,247,0.25)'; ctx.setLineDash([8, 10]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#FAFAF7';
    ctx.fillRect(24, g.py - PH / 2, PW, PH);
    ctx.fillRect(W - 24 - PW, g.ay - PH / 2, PW, PH);
    ctx.font = '700 46px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(250,250,247,0.5)';
    ctx.fillText(g.ps, W / 2 - 60, 62); ctx.fillText(g.as, W / 2 + 60, 62);
    if (g.msg) { ctx.font = '13px "JetBrains Mono", monospace'; ctx.fillStyle = '#D94E15'; ctx.fillText(g.msg, W / 2, H - 40); }
    if (g.running || g.msg === '') { ctx.fillStyle = '#D94E15'; ctx.fillRect(g.bx - R, g.by - R, R * 2, R * 2); }
    raf = requestAnimationFrame(loop);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ') e.preventDefault();
    if (e.key === ' ' && !g.running) serve();
    keys[e.key] = true;
  }
  function onKeyUp(e) { keys[e.key] = false; }
  function onPointer(e) {
    var r = canvas.getBoundingClientRect();
    g.py = clampY((e.clientY - r.top) / r.height * H);
  }
  function onTap() { if (!g.running) serve(); }

  function open() {
    g = { py: H / 2, ay: H / 2, bx: W / 2, by: H / 2, vx: 0, vy: 0, ps: 0, as: 0, running: false, over: false, msg: 'premi spazio per servire' };
    keys = {};
    overlay.hidden = false;
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointermove', onPointer);
    canvas.addEventListener('pointerdown', onPointer);
    canvas.addEventListener('click', onTap);
    loop();
  }
  function close() {
    cancelAnimationFrame(raf);
    overlay.hidden = true;
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    canvas.removeEventListener('pointermove', onPointer);
    canvas.removeEventListener('pointerdown', onPointer);
    canvas.removeEventListener('click', onTap);
  }
  link.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
})();

// Snake — wildlab arcade
(function () {
  var overlay = document.getElementById('snake-overlay');
  var canvas = document.getElementById('snake-canvas');
  var link = document.getElementById('snake-link');
  var closeBtn = document.getElementById('snake-close');
  if (!overlay || !canvas || !link) return;
  var ctx = canvas.getContext('2d');
  var W = 720, H = 480, C = 24, COLS = 30, ROWS = 20;
  var g, timer, touch = null;

  function placeFood() {
    var f;
    do { f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
    while (g.snake.some(function (s) { return s.x === f.x && s.y === f.y; }));
    g.food = f;
  }
  function start() {
    g.snake = [{x:14,y:10},{x:13,y:10},{x:12,y:10}];
    g.dir = {x:1,y:0}; g.next = {x:1,y:0};
    g.score = 0; g.over = false; g.msg = ''; g.running = true;
    placeFood(); schedule();
  }
  function schedule() {
    clearInterval(timer);
    var speed = Math.max(60, 130 - Math.floor(g.score / 5) * 10);
    timer = setInterval(step, speed);
  }
  function step() {
    g.dir = g.next;
    var head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || g.snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
      g.running = false; g.over = true;
      g.msg = 'game over — ' + g.score + ' punti — spazio per rigiocare';
      if (g.score > g.best) { g.best = g.score; try { localStorage.setItem('wildlab-snake-best', String(g.best)); } catch (e) {} }
      clearInterval(timer); draw(); return;
    }
    g.snake.unshift(head);
    if (g.food && head.x === g.food.x && head.y === g.food.y) {
      g.score++; placeFood();
      if (g.score % 5 === 0) schedule();
    } else g.snake.pop();
    draw();
  }
  function draw() {
    ctx.fillStyle = '#0A0A0A'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(250,250,247,0.05)'; ctx.lineWidth = 1;
    var x, y;
    for (x = C; x < W; x += C) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (y = C; y < H; y += C) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    if (g.food) { ctx.fillStyle = '#D94E15'; ctx.fillRect(g.food.x * C + 4, g.food.y * C + 4, C - 8, C - 8); }
    g.snake.forEach(function (s, i) {
      ctx.fillStyle = i === 0 ? '#FAFAF7' : 'rgba(250,250,247,0.75)';
      ctx.fillRect(s.x * C + 2, s.y * C + 2, C - 4, C - 4);
    });
    ctx.font = '13px "JetBrains Mono", monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(250,250,247,0.5)';
    ctx.fillText('score ' + g.score + '   best ' + g.best, 12, 22);
    if (g.msg) { ctx.font = '13px "JetBrains Mono", monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#D94E15'; ctx.fillText(g.msg, W / 2, H / 2 + 60); }
  }
  function turn(d) {
    if (d.x === -g.dir.x && d.y === -g.dir.y) return;
    g.next = d;
  }
  function onKeyDown(e) {
    if (e.key === 'Escape') { close(); return; }
    var dirs = { ArrowUp: {x:0,y:-1}, ArrowDown: {x:0,y:1}, ArrowLeft: {x:-1,y:0}, ArrowRight: {x:1,y:0} };
    if (dirs[e.key] || e.key === ' ') e.preventDefault();
    if (e.key === ' ' && !g.running) { start(); return; }
    if (dirs[e.key] && g.running) turn(dirs[e.key]);
  }
  function onDown(e) { touch = { x: e.clientX, y: e.clientY }; if (!g.running) start(); }
  function onMove(e) {
    if (!touch || !g.running) return;
    var dx = e.clientX - touch.x, dy = e.clientY - touch.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    turn(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
    touch = { x: e.clientX, y: e.clientY };
  }
  function onUp() { touch = null; }

  function open() {
    g = { snake: [{x:14,y:10},{x:13,y:10},{x:12,y:10}], dir: {x:1,y:0}, next: {x:1,y:0}, food: null, score: 0, best: 0, running: false, over: false, msg: 'premi spazio per iniziare' };
    try { g.best = parseInt(localStorage.getItem('wildlab-snake-best') || '0', 10) || 0; } catch (e) {}
    overlay.hidden = false;
    window.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    draw();
  }
  function close() {
    clearInterval(timer);
    overlay.hidden = true;
    window.removeEventListener('keydown', onKeyDown);
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
  }
  link.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
})();


// Cookie consent — GA parte solo dopo "accetta"
(function () {
  var KEY = 'wl-cookie-consent';
  var banner = document.getElementById('cookie-banner');
  if (!banner) return;
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  function apply(choice) {
    try { localStorage.setItem(KEY, choice); } catch (e) {}
    banner.hidden = true;
    if (choice === 'yes' && window.wlLoadGA) window.wlLoadGA();
  }
  if (stored === 'yes') {
    if (window.wlLoadGA) window.wlLoadGA();
  } else if (stored !== 'no') {
    // Mostra il banner solo dopo che il preloader è sparito
    var pre = document.getElementById('preloader');
    var wait = setInterval(function () {
      if (!pre || pre.classList.contains('gone')) {
        clearInterval(wait);
        setTimeout(function () { banner.hidden = false; }, 600);
      }
    }, 200);
  }
  document.getElementById('cookie-accept').addEventListener('click', function () { apply('yes'); });
  document.getElementById('cookie-reject').addEventListener('click', function () { apply('no'); });
  var prefs = document.getElementById('cookie-prefs');
  if (prefs) prefs.addEventListener('click', function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    banner.hidden = false;
  });
})();

// Hero light particles — streaks drifting across the screen
(function () {
  var canvas = document.getElementById('hero-particles');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ctx = canvas.getContext('2d');
  var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#D94E15';
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w = 0, h = 0, parts = [];

  function rgb(hex) {
    var m = hex.replace('#', '');
    if (m.length === 3) m = m[0]+m[0]+m[1]+m[1]+m[2]+m[2];
    var n = parseInt(m, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  var ac = rgb(accent);
  var lanes = [], bursts = [];

  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var laneCount = Math.round(Math.min(14, Math.max(6, h / 26)));
    lanes = [];
    for (var i = 0; i < laneCount; i++) {
      var y = (i + 0.5) / laneCount * h + (Math.random() - 0.5) * 8;
      lanes.push({ y: y, r: spawn(1, y, true), l: spawn(-1, y, true) });
    }
    bursts = [];
  }
  function spawn(dir, y, anywhere) {
    var speed = 0.4 + Math.random() * 1.5;
    return {
      dir: dir,
      x: anywhere ? Math.random() * w : (dir > 0 ? -20 - Math.random() * 140 : w + 20 + Math.random() * 140),
      y: y,
      vx: speed,
      len: 10 + Math.random() * 46,
      r: 0.5 + Math.random() * 1.3,
      a: 0.14 + Math.random() * 0.45,
      white: Math.random() > 0.5,
      tw: Math.random() * Math.PI * 2
    };
  }
  function drawParticle(p) {
    p.tw += 0.045;
    var flick = 0.6 + 0.4 * Math.sin(p.tw);
    var col = p.white ? [255, 255, 255] : ac;
    var alpha = p.a * flick;
    var tail = p.x - p.dir * p.len;
    var grad = ctx.createLinearGradient(tail, p.y, p.x, p.y);
    grad.addColorStop(0, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0)');
    grad.addColorStop(1, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + alpha + ')');
    ctx.strokeStyle = grad;
    ctx.lineWidth = p.r;
    ctx.beginPath();
    ctx.moveTo(tail, p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + alpha + ')';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  function addBurst(x, y) {
    bursts.push({ x: x, y: y, life: 0, max: 26 + Math.random() * 10, size: 16 + Math.random() * 14 });
  }
  function drawBursts() {
    for (var i = bursts.length - 1; i >= 0; i--) {
      var b = bursts[i];
      b.life++;
      var t = b.life / b.max;
      if (t >= 1) { bursts.splice(i, 1); continue; }
      var ease = 1 - Math.pow(1 - t, 2);
      var rad = b.size * (0.3 + ease * 1.6);
      var a = (1 - t) * 0.9;
      // core glow
      var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, rad);
      g.addColorStop(0, 'rgba(255,255,255,' + a + ')');
      g.addColorStop(0.35, 'rgba(' + ac[0] + ',' + ac[1] + ',' + ac[2] + ',' + (a * 0.7) + ')');
      g.addColorStop(1, 'rgba(' + ac[0] + ',' + ac[1] + ',' + ac[2] + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, rad, 0, Math.PI * 2);
      ctx.fill();
      // expanding ring
      ctx.strokeStyle = 'rgba(255,255,255,' + (a * 0.6) + ')';
      ctx.lineWidth = 1.2 * (1 - t);
      ctx.beginPath();
      ctx.arc(b.x, b.y, rad * 1.05, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < lanes.length; i++) {
      var ln = lanes[i], r = ln.r, l = ln.l;
      r.x += r.vx; l.x -= l.vx;
      drawParticle(r);
      drawParticle(l);
      // collision: rightward head meets leftward head
      if (r.x >= l.x && (r.x - r.vx) < (l.x + l.vx) + 1) {
        addBurst((r.x + l.x) / 2, ln.y);
        ln.r = spawn(1, ln.y, false);
        ln.l = spawn(-1, ln.y, false);
      } else {
        if (r.x - r.len > w + 40) ln.r = spawn(1, ln.y, false);
        if (l.x + l.len < -40) ln.l = spawn(-1, ln.y, false);
      }
    }
    drawBursts();
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
  resize();
  requestAnimationFrame(frame);
})();

// Ritratto sezione chi — pixellato di default, si rivela originale al mouse over
(function () {
  var wrap = document.querySelector('.ritratto-wrap');
  if (!wrap) return;
  var img = wrap.querySelector('.ritratto');
  var cv = wrap.querySelector('.ritratto-px');
  if (!img || !cv) return;
  var ctx = cv.getContext('2d');

  function render() {
    var w = img.clientWidth, h = img.clientHeight;
    if (!w || !h || !img.naturalWidth) return;
    cv.width = w; cv.height = h;
    var block = Math.max(6, Math.round(w / 28)); // dimensione "pixel"
    var sw = Math.max(1, Math.round(w / block));
    var sh = Math.max(1, Math.round(h / block));
    // ridimensiona in piccolo mantenendo il cover
    var ar = img.naturalWidth / img.naturalHeight, tar = w / h, sx, sy, sWi, sHe;
    if (ar > tar) { sHe = img.naturalHeight; sWi = sHe * tar; sx = (img.naturalWidth - sWi) / 2; sy = 0; }
    else { sWi = img.naturalWidth; sHe = sWi / tar; sx = 0; sy = (img.naturalHeight - sHe) / 2; }
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, sx, sy, sWi, sHe, 0, 0, sw, sh);
    // riscala in grande senza smoothing → effetto pixel
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cv, 0, 0, sw, sh, 0, 0, w, h);
  }
  if (img.complete && img.naturalWidth) render();
  else img.addEventListener('load', render);
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(render, 200); });

  // Touch / no-hover: rivela quando entra nello schermo + tap per alternare
  var noHover = window.matchMedia && window.matchMedia('(hover: none)').matches;
  if (noHover) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) wrap.classList.add('revealed'); });
      }, { threshold: 0.6 });
      io.observe(wrap);
    } else {
      wrap.classList.add('revealed');
    }
    wrap.addEventListener('click', function () { wrap.classList.toggle('revealed'); });
  }
})();
