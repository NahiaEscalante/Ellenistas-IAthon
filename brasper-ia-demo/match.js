/* Rastro · Match en vivo: une cada señal de campaña (clic, chat, formulario o cupón) con un cliente del dashboard.
   Es el mismo patrón del RPA con el flujo al revés: campañas → Rastro → dashboard de Brasper. */
(function () {
  'use strict';
  const { $$, esc, sleep, nf, ic, brasperScreen } = UI;
  const M = BD.MATCH, CH = BD.CH;

  const S = { speed: 2, paused: false, running: false, done: false, gen: 0, clock: 0, ok: 0, rev: 0, com: 0, cards: {} };
  const wait = UI.waiter(S);
  const fly = (fromEl, toEl, text, dur) => UI.fly(fromEl, toEl, text, dur, S.speed);
  let root = null, opts = {};

  // Llaves que puede traer una señal y pasos de la cascada, de la llave más segura a la menos segura
  const KEYS = [['click', 'ID de clic'], ['tel', 'Teléfono'], ['email', 'Correo'], ['coupon', 'Cupón'], ['ad', 'Anuncio'], ['time', 'Hora']];
  const CASC = [
    ['click', 'ID de clic → touchpoint → registro', 'touchpoints · user.user'],
    ['tel', 'Hash del teléfono', 'user.user · teléfono'],
    ['email', 'Hash del correo', 'user.user · correo'],
    ['coupon', 'Cupón o QR de evento', 'transaction.coupons'],
    ['ai', 'IA: nombre, ciudad, hora y monto', 'IA local · umbral 0.85']
  ];
  const NA = { click: 'la señal no trae ID de clic', tel: 'la señal no trae teléfono', email: 'la señal no trae correo', coupon: 'la señal no trae cupón', ai: 'no hace falta' };
  const MARK = { ok: '✓', no: '✕', na: '–', pend: '…', review: '?', lupa: '!', skip: '·' };
  const campOf = id => M.camps.find(c => c.id === id);
  const clientOf = id => M.clients.find(c => c.id === id);
  const firstNames = name => name.split(' ').slice(0, 2).join(' ');

  /* ---------- Render ---------- */
  function mount(el, o) {
    root = el; opts = o || {};
    S.gen++;
    Object.assign(S, { paused: false, running: false, done: false, clock: 0, ok: 0, rev: 0, com: 0, cards: {} });
    M.camps.forEach(c => (S.cards[c.id] = { ok: 0, com: 0, notes: [] }));
    root.innerHTML = srcCol() + botCol() + dashCol();
    bind();
    log(`Leo ${M.signals.length} señales de campaña (${M.range}) y los clientes nuevos del dashboard.`);
    log('<span class="ai">Comparo solo hashes SHA-256:</span> los datos personales no salen de Brasper.');
  }

  function srcCol() {
    const campCard = c => `<div class="mx-camp" data-c="${c.id}" style="--cc:${CH[c.ch].color}">
        <span class="pf"><i></i>${c.platform}</span><b title="${esc(c.name)}">${c.name}</b>
        <span class="m">${c.note || `Gasto S/ ${nf(c.spend)} · ${nf(c.clicks)} clics`}</span>
        <span class="lock">${ic('lock')}${c.note ? 'Cupón en el QR, sin datos personales' : 'Solo totales, sin nombres'}</span>
        <span class="res">Clientes unidos: —</span></div>`;
    const bits = arr => arr.map(([k, t]) => `<span data-k="${k}">${esc(t)}</span>`).join(' · ');
    const sigRow = s => `<div class="mx-sig" data-s="${s.id}" style="--cc:${CH[s.ch].color}">
        <span class="when" data-k="time">${s.day}<br>${s.hr}</span>
        <div class="sg"><span class="who"><i></i>${CH[s.ch].short} · ${s.via}</span><span class="k1">${bits(s.k1)}</span><span class="k2">${bits(s.k2)}</span></div>
        <span class="st2">En cola</span></div>`;
    return `<section class="mx-src" aria-label="Campañas y señales">
      <div class="mx-chrome"><span class="dots"><i></i><i></i><i></i></span><b>Campañas y señales</b><span class="apis">Meta · TikTok · WhatsApp · web</span></div>
      <div class="mx-src-body" id="mx-src">
        <div class="bsec"><h4>Campañas de la semana <span>${M.range}</span></h4><div class="mx-camps">${M.camps.map(campCard).join('')}</div></div>
        <div class="bsec"><h4>Señales por persona <span>${M.signals.length} por unir</span></h4><div class="mx-sigs">${M.signals.map(sigRow).join('')}</div></div>
      </div></section>`;
  }

  const cascHtml = () => CASC.map(([k, t, src], i) => `<div class="cs" data-k="${k}"><i>${i + 1}</i><span>${t}</span><small>${src}</small></div>`).join('');
  function botCol() {
    return `<section class="mx-bot" aria-label="Rastro">
      <div class="mx-head">${ARM.mascot('rastro', 58)}<div><b>Rastro</b><div class="mx-state" id="mx-state" aria-live="polite"><span class="led"></span><span>Listo para unir ${M.signals.length} señales</span></div></div></div>
      <div class="mx-ctrl">
        <button class="mx-run" id="mx-run">${ic('play')}Iniciar match</button>
        <div class="mx-row"><span>Velocidad</span><span class="lseg" id="mx-spd"><button data-s="1">Lento</button><button data-s="2" class="on">Normal</button><button data-s="5">Turbo</button></span></div>
      </div>
      <div class="mx-kpis"><div><b id="mx-k-ok">0</b><span>unidos</span></div><div><b id="mx-k-rev">0</b><span>por confirmar</span></div><div><b id="mx-k-com">S/ 0</b><span>comisión atribuida</span></div></div>
      <div class="mx-scroll" id="mx-scroll">
        <div class="bsec"><h4>Señal en curso</h4><div class="mx-cur" id="mx-cur"><b>—</b><div>Esperando inicio</div></div></div>
        <div class="bsec"><h4>Llaves de la señal</h4><div class="mx-keys">${KEYS.map(([k, l]) => `<div class="mx-key" data-k="${k}"><span>${l}</span><code>—</code></div>`).join('')}</div></div>
        <div class="bsec"><h4>Cascada de match <span>seguro → probable</span></h4><div class="mx-casc" id="mx-casc">${cascHtml()}</div></div>
        <div class="bsec"><h4>Bitácora</h4><div class="log" id="mx-log"></div></div>
      </div></section>`;
  }

  function dashCol() {
    return `<section class="mx-right" aria-label="Dashboard de Brasper">
      <div class="mx-dash" id="mx-dash">${brasperScreen({ page: 'clientes', withRastro: true })}</div>
      <div class="toast" id="mx-toast"></div><span class="sim-mark">Simulación del dashboard</span></section>`;
  }

  function bind() {
    q('#mx-run').onclick = onRun;
    $$('#mx-spd button', root).forEach(b => b.onclick = () => { S.speed = +b.dataset.s; $$('#mx-spd button', root).forEach(x => x.classList.toggle('on', x === b)); });
  }

  /* ---------- Utilidades ---------- */
  const q = s => root && root.querySelector(s);
  const row = id => q(`#clientes tr[data-id="${id}"]`);
  const sigEl = id => q(`.mx-sig[data-s="${id}"]`);
  const card = id => q(`.mx-camp[data-c="${id}"]`);
  const dash = () => q('#mx-dash');
  const wrap = () => q('#mx-dash .tbl-wrap');

  // La bitácora usa el reloj de la demo (14 oct, 18:30) y no la hora del visor
  function log(html) {
    const lg = q('#mx-log'); if (!lg) return;
    const s = S.clock; S.clock += 3;
    const ts = `18:${String(30 + Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    lg.insertAdjacentHTML('beforeend', `<p><span class="t">${ts}</span> ${html}</p>`);
    lg.scrollTop = lg.scrollHeight;
  }
  function setState(txt, cls) { const s = q('#mx-state'); if (!s) return; s.className = 'mx-state ' + (cls || ''); s.lastElementChild.textContent = txt; }
  function setSig(s, txt, cls) { const e = sigEl(s.id); if (e) { const p = e.querySelector('.st2'); p.textContent = txt; p.className = 'st2 ' + (cls || ''); } }
  function toast(html, cls) { const t = q('#mx-toast'); if (!t) return; t.className = 'toast ' + (cls || ''); t.innerHTML = html; requestAnimationFrame(() => t.classList.add('show')); }
  function hideToast() { const t = q('#mx-toast'); if (t) t.classList.remove('show'); }
  async function typeText(el, text) {
    const step = Math.max(1, Math.ceil(text.length / 12));
    for (let i = step; i < text.length + step; i += step) { el.textContent = text.slice(0, i); await wait(24); }
    el.textContent = text;
  }
  function setStep(k, st, note) {
    const e = q(`.cs[data-k="${k}"]`); if (!e) return null;
    e.className = 'cs ' + st;
    e.querySelector('i').textContent = st === 'run' ? '' : (MARK[st] || '');
    if (note) { let n = e.querySelector('.note'); if (!n) { n = document.createElement('span'); n.className = 'note'; e.appendChild(n); } n.textContent = note; }
    return e;
  }
  function resetPanel() {
    $$('.mx-key', root).forEach(k => { k.className = 'mx-key'; k.querySelector('code').textContent = '—'; });
    q('#mx-casc').innerHTML = cascHtml();
    $$('#clientes tr.hit, #clientes tr.cand', root).forEach(r => r.classList.remove('hit', 'cand'));
    $$('#clientes .hitk', root).forEach(x => x.classList.remove('hitk'));
  }
  function renderCard(id) {
    const c = S.cards[id], e = card(id); if (!e) return;
    e.querySelector('.res').innerHTML = `Clientes unidos: <b>${c.ok}</b>${c.ok ? ` · S/ ${nf(c.com, 2)}` : ''}${c.notes.length ? `<small>${c.notes.join(' · ')}</small>` : ''}`;
    e.animate([{ boxShadow: `0 0 0 4px ${CH[campOf(id).ch].color}55` }, { boxShadow: '0 0 0 0 transparent' }], { duration: 900 });
  }
  function updateKpis() {
    q('#mx-k-ok').textContent = S.ok;
    q('#mx-k-rev').textContent = S.rev;
    q('#mx-k-com').textContent = `S/ ${nf(S.com, 2)}`;
  }
  const origin = id => { const r = row(id); return r && r.querySelector('td[data-k="origin"]'); };

  /* ---------- Proceso de una señal ---------- */
  async function readKeys(s) {
    const se = sigEl(s.id), flights = [];
    const keys = Object.assign({}, s.keys, { time: `${s.day} ${s.hr}` });
    for (const [k] of KEYS) {
      const kv = keys[k]; if (!kv) continue;
      const shown = Array.isArray(kv) ? kv[0] : kv, ke = q(`.mx-key[data-k="${k}"]`);
      const from = se.querySelector(`[data-k="${k}"]`) || se;
      flights.push(fly(from, ke, shown, 760).then(() => { ke.classList.add('got'); ke.querySelector('code').textContent = shown; }));
      await wait(110);
    }
    await Promise.all(flights);
    // Teléfono y correo se normalizan y se comparan como SHA-256: nunca en claro
    for (const k of ['tel', 'email']) {
      if (!Array.isArray(keys[k])) continue;
      await wait(380);
      const ke = q(`.mx-key[data-k="${k}"]`); ke.classList.add('hash');
      await typeText(ke.querySelector('code'), keys[k][1]);
    }
  }

  // Lo que se ve en el dashboard mientras Rastro busca con cada llave
  async function search(s, k, st) {
    if (k === 'tel' || k === 'email') {
      const cells = $$('#clientes td[data-k="contact"]', root);
      UI.revealX(cells[0], wrap());
      cells.forEach((c, i) => { c.style.setProperty('--i', i); c.classList.remove('scan'); void c.offsetWidth; c.classList.add('scan'); });
      await wait(1200);
      cells.forEach(c => c.classList.remove('scan'));
    } else if (k === 'ai') await aiCheck(s, st);
    else await wait(800);
    if (st !== 'ok') return;
    const r = row(s.client); if (!r) return;
    r.classList.add('hit'); UI.reveal(r, dash());
    const hk = k === 'tel' || k === 'email' ? r.querySelector(`[data-f="${k}"]`) : r.querySelector('.cn');
    if (hk) hk.classList.add('hitk');
  }

  async function aiCheck(s, st) {
    const step = q('.cs[data-k="ai"]');
    for (const [l, t] of s.ai || []) {
      step.insertAdjacentHTML('beforeend', `<span class="ail fade-in"><b>${l}:</b> ${esc(t)}</span>`);
      if (l === 'Nombre' && s.client) { const r = row(s.client); if (r) { r.classList.add('cand'); UI.reveal(r, dash()); } }
      UI.reveal(step.lastElementChild, q('#mx-scroll'));
      await wait(480);
    }
    if (st !== 'review') return;
    step.insertAdjacentHTML('beforeend', `<span class="conf"><span class="bar"><i></i><u></u></span><small><span>confianza <b>${nf(s.conf, 2)}</b></span><span>umbral 0.85</span></small></span>`);
    const bar = step.querySelector('.conf .bar i');
    UI.reveal(step.lastElementChild, q('#mx-scroll'));
    void bar.offsetWidth; bar.style.width = (s.conf * 100) + '%';
    await wait(1300);
  }

  async function attach(s, via) {
    const cl = clientOf(s.client), camp = campOf(s.camp), r = row(s.client), oc = origin(s.client);
    setState('Escribiendo el origen en el dashboard', 'run');
    UI.revealX(oc, wrap()); UI.reveal(r, dash());
    await fly(q(`.cs[data-k="${via}"]`), oc, camp.short, 700);
    oc.innerHTML = `<span class="og" style="--cc:${CH[s.ch].color}">${camp.short}<small>${CH[s.ch].short} · ${s.key} · ${s.conf}</small></span>`;
    oc.animate([{ background: '#C9F7DA' }, { background: '' }], { duration: 1200 });
    const tag = r.querySelector('td[data-k="tag"]');
    if (s.fix) {
      tag.innerHTML = `<span class="ctag fixed">${esc(cl.tag)}</span><small>corregida por Rastro</small>`;
      log(`<span class="warn">Corregí la etiqueta</span> de ${esc(firstNames(cl.name))}: el vendedor puso "${esc(cl.tag)}", pero llegó por un anuncio de WhatsApp.`);
      toast(`${ic('check')} Etiqueta corregida: llegó por ${CH[s.ch].short} · ${camp.short}`, 'info');
      await wait(2000); hideToast();
    } else if (s.confirm) {
      tag.innerHTML = `<span class="ctag ok">✓ ${esc(cl.tag)}</span>`;
      log(`La etiqueta del vendedor coincide. Le sumo la campaña y el anuncio.`);
    }
    // Cruza sus operaciones en transactions y suma la comisión a la campaña
    setState('Cruzando sus operaciones', 'run');
    await wait(300);
    await fly(oc, card(s.camp).querySelector('.res'), `+S/ ${nf(cl.com, 2)}`, 800);
    const c = S.cards[s.camp]; c.ok++; c.com += cl.com; S.ok++; S.com += cl.com;
    renderCard(s.camp); updateKpis();
    setSig(s, 'Unida', 'ok');
    log(`<span class="ok">Unida</span> a ${esc(firstNames(cl.name))} por ${s.key} (confianza ${s.conf}): ${cl.ops} operación, S/ ${nf(cl.com, 2)} de comisión.`);
  }

  async function review(s) {
    const cl = clientOf(s.client), oc = origin(s.client);
    UI.revealX(oc, wrap());
    await fly(q('.cs[data-k="ai"]'), oc, 'Por confirmar', 650);
    oc.innerHTML = `<span class="og rev">Por confirmar<small>IA · ${nf(s.conf, 2)}</small></span>`;
    S.rev++; S.cards[s.camp].notes.push('1 por confirmar'); renderCard(s.camp); updateKpis();
    setSig(s, 'Por confirmar', 'warn');
    log(`<span class="ai">IA:</span> "${esc(s.alias)}" se parece a ${esc(cl.name)} (${nf(s.conf, 2)}). No llega a 0.85: lo dejo para revisión humana.`);
    toast(`${ic('eye')} ${esc(firstNames(cl.name))} pasa a revisión humana · ${nf(s.conf, 2)} &lt; 0.85`, 'warn');
    await wait(2000); hideToast();
  }

  async function toLupa(s) {
    setSig(s, '→ Lupa', 'lupa');
    S.cards[s.camp].notes.push('1 buscaba un préstamo'); renderCard(s.camp);
    log(`<span class="warn">Aviso a Lupa:</span> el clic de ${CH[s.ch].short} terminó en un chat que pedía un préstamo. No es cliente.`);
    toast(`${ARM.mascot('lupa', 22)} Aviso a Lupa: el clic de ${CH[s.ch].short} buscaba un préstamo`, 'lupa');
    await wait(2000); hideToast();
  }

  async function processSignal(s, i) {
    const se = sigEl(s.id), cd = card(s.camp), camp = campOf(s.camp);
    resetPanel();
    $$('.mx-sig.reading', root).forEach(x => x.classList.remove('reading'));
    se.classList.add('reading'); UI.reveal(se, q('#mx-src'));
    cd.classList.add('on');
    setSig(s, 'Leyendo', 'run');
    q('#mx-cur').innerHTML = `<b>${esc(s.k1[0][1])}</b><div>${CH[s.ch].short} · ${s.via} · ${camp.short}</div>`;
    setState(`Leyendo la señal ${i + 1} de ${M.signals.length}`, 'run');
    await wait(600);
    await readKeys(s);

    // Cascada: prueba cada llave en orden y se detiene en la primera que resuelve
    setState('Buscando al cliente en el dashboard', 'run');
    let res = null;
    for (const [k] of CASC) {
      if (res) { setStep(k, 'skip', 'no hace falta'); continue; }
      const [st, note] = s.casc[k] || ['na', NA[k]];
      const e = setStep(k, 'run'); UI.reveal(e, q('#mx-scroll'));
      if (st === 'na') { await wait(300); setStep(k, 'na', note); continue; }
      await search(s, k, st);
      setStep(k, st, note);
      if (st === 'ok' || st === 'review' || st === 'lupa') res = { k, st };
      await wait(420);
    }

    if (!res) {
      setSig(s, 'En espera', 'wait');
      S.cards[s.camp].notes.push('1 en espera'); renderCard(s.camp);
      log('Touchpoint guardado. Si esa persona se registra antes del 19 oct, la uno a la campaña.');
      await wait(700);
    } else if (res.st === 'ok') await attach(s, res.k);
    else if (res.st === 'review') await review(s);
    else await toLupa(s);
    cd.classList.remove('on'); se.classList.remove('reading');
  }

  // Al final, los clientes sin ninguna señal quedan como orgánicos o referidos: no se inventa atribución
  async function sweep() {
    setState('Revisando clientes sin señal', 'run');
    const left = M.clients.filter(c => { const oc = origin(c.id); return oc && oc.querySelector('.og.wait'); });
    for (const c of left) {
      const oc = origin(c.id); UI.revealX(oc, wrap()); UI.reveal(row(c.id), dash());
      oc.innerHTML = `<span class="og none">Sin señal<small>${c.none || 'orgánico'}</small></span>`;
      oc.animate([{ background: '#EEF1F8' }, { background: '' }], { duration: 900 });
      await wait(500);
    }
    log(`No invento atribución: ${left.length} clientes llegaron sin señal de campaña y quedan como orgánico o referido.`);
  }

  async function onRun() {
    const btn = q('#mx-run');
    if (S.running) {
      S.paused = !S.paused;
      btn.innerHTML = S.paused ? `${ic('play')}Continuar` : `${ic('pause')}Pausar`;
      setState(S.paused ? 'En pausa' : 'Trabajando', S.paused ? '' : 'run');
      return;
    }
    if (S.done) { mount(root, opts); return; }
    S.running = true;
    btn.innerHTML = `${ic('pause')}Pausar`;
    const face = q('.mx-head .mascot'); if (face) face.classList.add('wave');
    log('<span class="ai">Inicio del match</span> de la semana.');
    for (let i = 0; i < M.signals.length; i++) { await processSignal(M.signals[i], i); await wait(500); }
    await sweep();
    finish();
  }

  function finish() {
    S.running = false; S.done = true;
    resetPanel();
    $$('.mx-sig.reading', root).forEach(x => x.classList.remove('reading'));
    const face = q('.mx-head .mascot'); if (face) face.classList.remove('wave');
    setState('Terminado', 'done');
    q('#mx-scroll').scrollTop = 0;
    if (wrap()) wrap().scrollLeft = 0;
    q('#mx-cur').innerHTML = `<b>Listo</b><div>${M.signals.length} señales: ${S.ok} unidas, ${S.rev} por confirmar, 1 en espera y 1 derivada a Lupa. La comisión atribuida ya está en Capital.</div>
      <button class="mx-cta" id="mx-capital">Ver ROAS en Capital ${ic('back').replace('<svg', '<svg style="transform:rotate(180deg)"')}</button>`;
    q('#mx-capital').onclick = () => opts.capital && opts.capital();
    q('#mx-run').innerHTML = `${ic('play')}Reiniciar`;
    log(`<span class="ok">Fin.</span> S/ ${nf(S.com, 2)} de comisión atribuida a sus campañas, sin etiquetas a mano.`);
    toast(`${ic('check')} ${S.ok} clientes unidos a su campaña · S/ ${nf(S.com, 2)}`);
    sleep(2200).then(hideToast);
  }

  window.MATCH = { mount };
})();
