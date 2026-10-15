/* Solución 2 · Entrada: la plataforma actual de Brasper con el acceso al ARM y el portal hacia el nuevo mundo. */
(function () {
  'use strict';
  const { $, $$, sleep, ic, brasperScreen } = UI;
  let page = 'trans';

  function render() {
    const el = $('#stage-web');
    const railExtra = `<button class="rail-ai" id="rail-ai" data-tip="Brasper ARM · IA" aria-label="Abrir Brasper ARM"><span class="orb"></span></button><hr>`;
    el.innerHTML = `<div id="web-bp">${brasperScreen({ page, railExtra })}</div>
      <button class="arm-float" id="arm-float" aria-label="Abrir Brasper ARM">
        <span class="arm-float-in"><span class="mascots">${['rastro', 'capital', 'caudal'].map(id => ARM.mascot(id, 44)).join('')}</span><span><b>Brasper ARM</b><small>6 agentes de IA te esperan</small></span><span class="go">Entrar ${ic('spark').replace('<svg', '<svg style="width:14px;height:14px"')}</span></span>
      </button>`;
    $$('#web-bp [data-page]').forEach(b => b.onclick = () => { page = b.dataset.page; render(); });
    $('#rail-ai').onclick = e => portal(e.currentTarget);
    $('#arm-float').onclick = e => portal(e.currentTarget);
  }

  // Estrellas que salen disparadas del centro: sensación de "viaje" hacia el ARM
  function warp(cv) {
    const ctx = cv.getContext('2d'); const dpr = devicePixelRatio || 1;
    const W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr;
    const cols = ['#00BCEB', '#5468FF', '#A855F7', '#EC4899', '#10B981', '#F59E0B'];
    const stars = Array.from({ length: 220 }, () => ({ a: Math.random() * Math.PI * 2, d: Math.random() * 40, v: 2 + Math.random() * 7, c: cols[Math.floor(Math.random() * cols.length)] }));
    let on = true, speed = 1;
    (function f() {
      if (!on) return;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * .45;
      stars.forEach(s => {
        s.d += s.v * speed * dpr; if (s.d > Math.max(W, H)) s.d = Math.random() * 30;
        const x = cx + Math.cos(s.a) * s.d, y = cy + Math.sin(s.a) * s.d, len = Math.min(60, s.d * .12) * speed;
        ctx.strokeStyle = s.c; ctx.globalAlpha = Math.min(1, s.d / 300); ctx.lineWidth = 2 * dpr; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(s.a) * len * dpr, y - Math.sin(s.a) * len * dpr); ctx.stroke();
      });
      ctx.globalAlpha = 1; speed = Math.max(.35, speed * .985);
      requestAnimationFrame(f);
    })();
    return () => { on = false; };
  }

  async function portal(from) {
    const r = from.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const ov = document.createElement('div');
    ov.className = 'boot';
    ov.innerHTML = `<canvas class="warp"></canvas><span class="ring"></span><span class="ring"></span><span class="ring"></span><span class="ring"></span><span class="ring"></span><span class="ring"></span>
      <div class="boot-in"><div class="boot-core"></div>
        <h2>Bienvenido a <em>Brasper ARM</em></h2><p>Del CRM manual a agentes que trabajan solos</p>
        <div class="boot-agents">${ARM.AG.map(a => `<div class="ba" style="--ac:${a.color}">${ARM.mascot(a.id, 84, true)}<b>${a.name}</b><small>${a.role}</small></div>`).join('')}</div></div>
      <div class="boot-skip">Clic para saltar</div>`;
    document.body.appendChild(ov);
    const stop = warp(ov.querySelector('canvas.warp'));
    ov.addEventListener('click', () => { ov.dataset.skip = '1'; });
    const st = ms => (ov.dataset.skip ? Promise.resolve() : sleep(ms));
    // la plataforma vieja se hunde hacia el botón mientras se abre el portal
    const old = $('#stage-web');
    old.animate([{ transform: 'none', filter: 'none' }, { transform: 'scale(.92)', filter: 'blur(6px) saturate(.4)' }], { duration: 700, fill: 'forwards', easing: 'ease-in' });
    await ov.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(160% at ${x}px ${y}px)` }], { duration: 900, easing: 'cubic-bezier(.7,0,.25,1)', fill: 'forwards' }).finished.catch(() => {});
    await st(250); ov.classList.add('s1');
    await st(500);
    for (const b of $$('.ba', ov)) { await st(140); b.classList.add('on'); }
    await st(900);
    old.getAnimations().forEach(a => a.cancel());
    APP.go('arm'); ARM.go('home');
    await ov.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.08)' }], { duration: 550, fill: 'forwards', easing: 'ease-out' }).finished.catch(() => {});
    stop(); ov.remove();
  }

  window.WEB = { render };
})();
