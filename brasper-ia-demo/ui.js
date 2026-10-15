/* Utilidades compartidas: íconos, formatos, réplica de la plataforma Brasper, gráficos y tooltips. */
(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const nf = (n, d = 0) => Number(n).toLocaleString('es-PE', { minimumFractionDigits: d, maximumFractionDigits: d });
  const money = (n, sym = 'S/', d = 0) => `${sym} ${nf(n, d)}`;
  const ptbr = (n, d = 2) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ---------- Íconos (trazo 24x24) ---------- */
  const P = {
    line: 'M3 3v18h18M7 15l4-4 3 3 5-6',
    bars: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    users: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M22 19v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    clip: 'M9 3h6v3H9zM8 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2M9 12h6M9 16h4',
    file: 'M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7zM14 3v4h4M9 13h6M9 17h6',
    receipt: 'M5 3v18l2.5-1.5L10 21l2-1.5 2 1.5 2.5-1.5L19 21V3l-2.5 1.5L14 3l-2 1.5L10 3 7.5 4.5zM9 9h6M9 13h6',
    split: 'M6 3v6a6 6 0 0 0 6 6h0a6 6 0 0 1 6 6M18 3v6M6 21v-6',
    folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    swap: 'M7 7h13l-3-3M17 17H4l3 3',
    card: 'M3 6h18v12H3zM3 10h18',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 7 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 1.17 14H1a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 2.6 7a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 7 2.6V2.5a2 2 0 1 1 4 0',
    logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
    upload: 'M12 16V4M7 9l5-5 5 5M4 20h16',
    cloud: 'M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8zM12 12v6M9 15l3-3 3 3',
    plus: 'M12 5v14M5 12h14',
    down: 'M12 4v12M7 11l5 5 5-5M4 20h16',
    cal: 'M4 5h16v16H4zM4 9h16M8 3v4M16 3v4',
    x: 'M6 6l12 12M18 6L6 18',
    play: 'M7 4l13 8-13 8z',
    pause: 'M7 4h3v16H7zM14 4h3v16h-3z',
    bot: 'M12 2v3M5 8h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zM9 13v1M15 13v1M9 17h6',
    spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 3v4M17 5h4M5 17v4M3 19h4',
    route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 15V9a4 4 0 0 1 4-4h2M18 9v6a4 4 0 0 1-4 4h-2',
    coins: 'M9 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM15.9 10.1A6 6 0 1 1 10.1 15.9M7 6h3v4',
    scope: 'M3 17l6-6 4 4 8-8M15 7h6v6',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM20 17v4H6.5A2.5 2.5 0 0 1 4 18.5M8 7h8M8 11h6',
    drop: 'M12 2.7l5.7 5.6a8 8 0 1 1-11.4 0zM8 14a4 4 0 0 0 4 4',
    lens: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-6-6M7 10l2 2 4-4',
    db: 'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
    globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
    msg: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    back: 'M19 12H5M12 19l-7-7 7-7',
    zap: 'M13 2L3 14h9l-1 8 10-12h-9z',
    check: 'M20 6L9 17l-5-5',
    home: 'M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
    cursor: 'M4 3l16 7-7 2-2 7z',
    click: 'M9 9l5 12 1.8-5.2L21 14zM7.2 2.2L8 5M5.1 7.2L2.2 6.4M14 4.1L12 6M4.1 14l2-2',
    form: 'M4 4h16v16H4zM8 9h8M8 13h8M8 17h4',
    pdf: 'M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7zM14 3v4h4M9 15h1.5a1.5 1.5 0 0 0 0-3H9v5M14 12v5',
    eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    phone: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2',
    wallet: 'M20 7H5a2 2 0 0 1 0-4h13v4M3 5v14a2 2 0 0 0 2 2h15V7M16 14h.01',
    lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4'
  };
  const ic = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[name] || P.file}"/></svg>`;

  const flag = cur => cur === 'BRL'
    ? `<svg class="flag" viewBox="0 0 20 20" aria-label="Brasil"><circle cx="10" cy="10" r="10" fill="#1E9B4B"/><path d="M10 3.6L17 10l-7 6.4L3 10z" fill="#FFD13B"/><circle cx="10" cy="10" r="3.4" fill="#1F3F9A"/></svg>`
    : `<svg class="flag" viewBox="0 0 20 20" aria-label="Perú"><clipPath id="fpe"><circle cx="10" cy="10" r="10"/></clipPath><g clip-path="url(#fpe)"><rect width="20" height="20" fill="#fff"/><rect width="6.7" height="20" fill="#D91023"/><rect x="13.3" width="6.7" height="20" fill="#D91023"/></g></svg>`;

  /* ---------- Réplica de la plataforma actual de Brasper ---------- */
  function wordmark() {
    return `<span class="wordmark"><img src="logo-160.png" alt="Brasper"><span class="wm"><b>BrasPer</b><i>Transferencias</i></span></span>`;
  }
  function rail(active, extra = '') {
    const items = [['line', 'Inicio'], ['bars', 'Métricas'], ['users', 'Clientes', 'clientes'], ['clip', 'Transacciones', 'trans'], ['file', 'Contabilidad', 'contab'], ['receipt', 'Facturación'], ['file', 'Reportes'], ['split', 'Comisiones'], ['folder', 'Documentos'], ['swap', 'Tasas'], ['card', 'Cuentas']];
    return `<nav class="bp-rail" aria-label="Menú Brasper">${extra}${items.map(([i, t, k]) => `<button data-tip="${t}" ${k ? `data-page="${k}"` : ''} class="${k === active ? 'on' : ''}" aria-label="${t}">${ic(i)}</button>`).join('')}<hr>${ic('gear').replace('<svg', '<svg style="width:18px;height:18px;color:#C9D2FF;margin:8px 0"')}${ic('logout').replace('<svg', '<svg style="width:18px;height:18px;color:#C9D2FF;margin:8px 0"')}</nav>`;
  }
  function topbar(crumb) {
    return `<div class="bp-top">${wordmark()}<span class="crumb">${crumb}</span><span class="sp"></span>${ic('bell', 'bell')}<span class="avatar">B</span></div>`;
  }
  function filters(page) {
    const when = page === 'clientes'
      ? `<span class="seg"><span class="on">Esta semana</span><span>Todos</span></span>
      <span class="date-strong">Del 8 al 14 de octubre de 2026 <span class="today">hoy</span><small>Clientes nuevos · ${BD.MATCH.total} registros</small></span>`
      : `<span class="seg"><span class="on">Por día</span><span>Todas</span></span>
      <span class="date-strong">Miércoles, 14 de octubre de 2026 <span class="today">hoy</span><small>De 00:00 a 23:59 · 53 envíos</small></span>`;
    return `<div class="bp-filters">
      ${when}
      <span class="datein">${ic('cal').replace('<svg', '<svg style="width:13px;height:13px"')} 14/10/2026</span>
      <span style="flex:1"></span>
      <button class="btn" tabindex="-1">${ic('down')}${page === 'clientes' ? 'Exportar' : 'Exportar el día'}</button>
    </div>
    <div class="tags">${BD.TAGS.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    <div class="search">${ic('search')}${page === 'clientes' ? 'Buscar por nombre o documento' : 'Buscar por código'}</div>`;
  }
  const fmt2 = n => nf(n, 2);
  function transTable(rows) {
    return `<table class="bt"><thead><tr><th>#</th><th>Código</th><th>N° operación</th><th>Cliente</th><th>Razón social</th><th>Monto de envío</th><th>Cuenta destino</th><th>Monto a recibir</th><th>Tipo cambio</th><th>Estado</th><th>Envío (fecha/hora)</th><th>Comp. envío</th><th>Comp. pago</th></tr></thead><tbody>
    ${rows.map((r, i) => `<tr><td class="c">${i + 1}</td><td><span class="code">${flag(r.sendCur)}${r.code}</span></td><td>${r.op}</td><td class="strong">${r.client}</td><td>${r.company}</td><td class="r">${fmt2(r.send)} ${r.sendCur}</td><td>${r.account}</td><td class="r">${fmt2(r.receive)} ${r.receiveCur}</td><td class="r">${r.rate}</td><td><span class="st ok">Finalizada</span></td><td>${r.date}</td><td><span class="lnk">Abrir</span></td><td><span class="lnk">Abrir</span></td></tr>`).join('')}
    </tbody></table>`;
  }
  function contabTable(rows, withRpa) {
    const sym = r => (r.sendCur === 'BRL' ? 'R$' : 'S/');
    return `<table class="bt" id="contab"><thead><tr><th>Código</th><th>Fecha envío</th><th>Fecha de facturación</th><th>N° operación</th><th>Cliente</th><th>Tipo de documento</th><th>Documento</th><th>Cuenta destino</th><th>Razón social</th><th class="dk">Monto de envío</th><th class="dk">Monto a recibir</th><th>Tipo cambio</th><th>Descuento variable</th><th class="dk2">Comisión final interna</th><th class="dk2">Impuesto final interno</th><th class="gr">Venta final</th><th>PDF</th>${withRpa ? '<th class="rpacol">Comprobante · RPA</th>' : ''}</tr></thead><tbody>
    ${rows.map(r => `<tr data-code="${r.code}">
      <td data-k="code"><span class="code">${flag(r.sendCur)}${r.code}</span></td>
      <td data-k="date">${r.date.split(' ')[0]}</td>
      <td><span class="datein">${ic('cal').replace('<svg', '<svg style="width:12px;height:12px"')} dd/mm/aaaa</span></td>
      <td data-k="op">${r.op}</td>
      <td data-k="client" class="strong">${r.client}</td>
      <td data-k="docType" class="c">${r.docType}</td>
      <td data-k="doc">${r.doc}</td>
      <td data-k="account">${r.account}</td>
      <td data-k="company">${r.company}</td>
      <td data-k="send" class="hl1">${fmt2(r.send)}</td>
      <td data-k="receive" class="hl1">${fmt2(r.receive)} ${r.receiveCur}</td>
      <td data-k="rate" class="r">${r.rate}</td>
      <td data-k="discount" class="r">${fmt2(r.discount)}%</td>
      <td data-k="commission" class="r strong">${sym(r)} ${fmt2(r.commission)}</td>
      <td data-k="tax" class="r strong">${sym(r)} ${fmt2(r.tax)}</td>
      <td data-k="total" class="hl2">${sym(r)} ${fmt2(r.total)}</td>
      <td><button class="pdfb" tabindex="-1">${ic('down').replace('<svg', '<svg style="width:11px;height:11px;vertical-align:-1px"')} PDF</button></td>
      ${withRpa ? `<td class="c" data-k="rpa"><span class="st wait">Pendiente</span></td>` : ''}
    </tr>`).join('')}
    </tbody></table>`;
  }
  // Clientes nuevos de la semana. withRastro agrega la columna que llena el agente Rastro al unir cada cliente con su campaña.
  function clientesTable(rows, withRastro) {
    return `<table class="bt" id="clientes"><thead><tr><th>Cliente</th><th>Contacto</th><th>Etiqueta del vendedor</th>${withRastro ? '<th class="rcol">Origen · Rastro</th>' : ''}</tr></thead><tbody>
    ${rows.map(r => `<tr data-id="${r.id}">
      <td data-k="name"><b class="cn">${r.name}</b><small>${r.docType} · ${r.city} · ${r.reg}</small></td>
      <td data-k="contact"><span data-f="tel">${r.phone}</span><small data-f="email">${r.email}</small></td>
      <td data-k="tag">${r.tag ? `<span class="ctag">${r.tag}</span>` : '<span class="ctag none">Sin etiqueta</span>'}</td>
      ${withRastro ? '<td data-k="origin"><span class="og wait">Pendiente</span></td>' : ''}
    </tr>`).join('')}
    </tbody></table>`;
  }
  /* Pantalla completa de la plataforma actual. opts.page: 'contab' | 'trans' | 'clientes'; opts.railExtra: HTML extra en el menú */
  function brasperScreen(opts) {
    const page = opts.page || 'contab';
    const rows = BD.ACCOUNTING_TODAY;
    const title = { contab: 'Contabilidad', trans: 'Transacciones', clientes: 'Clientes' }[page];
    const group = page === 'clientes' ? 'CRM' : 'Operaciones';
    const table = page === 'contab' ? contabTable(rows, opts.withRpa) : page === 'clientes' ? clientesTable(BD.MATCH.clients, opts.withRastro) : transTable(rows);
    const pager = page === 'clientes' ? ['Página 1 de 2', `${BD.MATCH.total} resultados`] : ['Página 1 de 5', '53 resultados'];
    return `<div class="bp">
      ${topbar(`${group} &nbsp;›&nbsp; ${title}`)}
      <div class="bp-body">
        <aside class="bp-side">${rail(page, opts.railExtra || '')}</aside>
        <div class="bp-main">
          <div class="bp-head"><div><div class="eyebrow">${group}</div><h1>${title} <span class="live">En vivo</span></h1></div><span class="sp"></span>
            <button class="btn" tabindex="-1">${ic('upload')}Importar</button><button class="btn" tabindex="-1">${ic('cloud')}Importar simple</button><button class="btn primary" tabindex="-1">${ic('plus')}Crear</button></div>
          ${filters(page)}
          <div class="tbl-wrap">${table}</div>
          <div class="pager"><span>${pager[0]}</span><span>${pager[1]}</span></div>
        </div>
      </div>
    </div>`;
  }

  /* ---------- Animación compartida (RPA y Rastro) ---------- */
  // Espera que respeta la pausa y la velocidad de la demo (st = { speed, paused, gen }).
  // Si st.gen cambia (la escena se cerró o se reinició), la promesa nunca se resuelve y la animación en curso se detiene sola.
  const waiter = st => ms => new Promise(async res => {
    const g = st.gen; let t = 0;
    while (t < ms) { await sleep(40); if (st.gen !== g) return; if (!st.paused) t += 40 * st.speed; }
    res();
  });
  // Desplaza solo el contenedor indicado (nunca la ventana) para que el elemento quede visible
  function reveal(el, box) {
    if (!el || !box) return;
    const c = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    if (r.top < c.top + 50) box.scrollTop -= (c.top + 50 - r.top);
    else if (r.bottom > c.bottom - 24) box.scrollTop += (r.bottom - c.bottom + 24);
  }
  function revealX(el, box) {
    if (!el || !box) return;
    const c = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    if (r.left < c.left + 10 || r.right > c.right - 10) box.scrollLeft += (r.left - c.left) - c.width * 0.35;
  }
  // Un dato "vuela" de un elemento a otro. No anima si alguno de los dos está oculto (otra pestaña o escena cerrada).
  async function fly(fromEl, toEl, text, dur, speed = 1) {
    if (!fromEl || !toEl || !fromEl.getClientRects().length || !toEl.getClientRects().length) return;
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const p = document.createElement('div'); p.className = 'packet'; p.textContent = text; document.body.appendChild(p);
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x1 = b.left + Math.min(b.width / 2, 90), y1 = b.top + b.height / 2;
    const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 46;
    const k = (x, y, o, s) => ({ left: x + 'px', top: y + 'px', opacity: o, transform: `translate(-50%,-50%) scale(${s})` });
    try {
      const an = p.animate([k(x0, y0, 0, .7), k(x0 + (mx - x0) * .3, y0 + (my - y0) * .3, 1, .95), k(mx, my, 1, 1.05), k(x1, y1, 1, .95)], { duration: dur / speed, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'forwards' });
      await Promise.race([an.finished, sleep(dur / speed + 400)]);
    } catch (e) { /* animación cancelada */ }
    p.remove();
  }

  /* ---------- Tooltips ---------- */
  function initTips() {
    const tip = $('#tip');
    document.addEventListener('mousemove', e => {
      const t = e.target.closest && e.target.closest('[data-t]');
      if (!t) { tip.classList.remove('on'); return; }
      tip.innerHTML = t.getAttribute('data-t');
      tip.classList.add('on');
      const w = tip.offsetWidth, h = tip.offsetHeight;
      let x = e.clientX + 14, y = e.clientY + 14;
      if (x + w > innerWidth - 8) x = e.clientX - w - 14;
      if (y + h > innerHeight - 8) y = e.clientY - h - 14;
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    });
  }

  /* ---------- Gráficos SVG (escala única, etiquetas con tokens del tema) ---------- */
  const niceMax = v => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; };
  const ticks = (max, n = 4) => Array.from({ length: n + 1 }, (_, i) => max * i / n);

  // Barras horizontales: items {label, value, color, t (tooltip), right (texto a la derecha)}
  function barsH(items, o = {}) {
    const W = 560, lw = o.labelW || 190, rw = o.rightW || 70, rowH = o.rowH || 30, top = 6;
    const H = top + items.length * rowH + (o.ref ? 18 : 6);
    const max = o.max || niceMax(Math.max(...items.map(i => i.value), o.ref ? o.ref.value : 0));
    const x = v => lw + (W - lw - rw) * (v / max);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || 'Gráfico de barras')}">`;
    items.forEach((it, i) => {
      const y = top + i * rowH, bh = Math.min(16, rowH - 10);
      const w = Math.max(2, x(it.value) - lw);
      s += `<text x="${lw - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" style="fill:var(--a-ink-2)">${esc(it.label)}</text>`;
      s += `<rect x="${lw}" y="${y + (rowH - bh) / 2}" width="${W - lw - rw}" height="${bh}" rx="4" style="fill:var(--ch-track)"/>`;
      s += `<rect class="mk" x="${lw}" y="${y + (rowH - bh) / 2}" width="${w}" height="${bh}" rx="4" fill="${it.color || 'var(--c1)'}" data-t="${esc(it.t || it.label + ': ' + it.value)}"/>`;
      s += `<text class="val" x="${W - rw + 8}" y="${y + rowH / 2 + 4}">${esc(it.right != null ? it.right : it.value)}</text>`;
    });
    if (o.ref) {
      const rx = x(o.ref.value);
      s += `<line x1="${rx}" x2="${rx}" y1="${top - 2}" y2="${H - 14}" stroke="var(--a-ink-2)" stroke-dasharray="4 4" stroke-width="1.2"/><text x="${rx}" y="${H - 2}" text-anchor="middle" style="fill:var(--a-ink-2)">${esc(o.ref.label)}</text>`;
    }
    return s + '</svg>';
  }

  // Columnas apiladas: cats ['Ene',..], series [{key,label,color}], rows [{label, vals:{key:n}}]
  function colsStacked(rows, series, o = {}) {
    const W = 600, H = o.h || 240, L = 34, R = 8, T = 10, B = 26;
    const tot = rows.map(r => series.reduce((s, se) => s + (r.vals[se.key] || 0), 0));
    const max = niceMax(Math.max(...tot));
    const bw = (W - L - R) / rows.length;
    const y = v => T + (H - T - B) * (1 - v / max);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || 'Columnas apiladas')}">`;
    ticks(max).forEach(t => { s += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${nf(t)}</text>`; });
    rows.forEach((r, i) => {
      let acc = 0; const x0 = L + i * bw + bw * .18, w = bw * .64;
      series.forEach(se => {
        const v = r.vals[se.key] || 0; if (!v) return;
        const y1 = y(acc + v), y0 = y(acc);
        s += `<rect class="mk" x="${x0}" y="${y1 + 1}" width="${w}" height="${Math.max(0, y0 - y1 - 2)}" rx="2" fill="${se.color}" data-t="<b>${esc(r.label)}</b><br>${esc(se.label)}: ${nf(v)}"/>`;
        acc += v;
      });
      s += `<text x="${x0 + w / 2}" y="${H - 8}" text-anchor="middle">${esc(r.label)}</text>`;
      if (o.totals) s += `<text class="val" x="${x0 + w / 2}" y="${y(acc) - 5}" text-anchor="middle" style="font-size:10px">${nf(acc)}</text>`;
    });
    return s + '</svg>';
  }

  // Líneas con banda opcional: labels[], series [{label,color,values (null = hueco), dash}], band {lo[],hi[],color}
  function lines(labels, series, o = {}) {
    const W = 600, H = o.h || 250, L = 46, R = 14, T = 12, B = 26;
    const all = series.flatMap(s => s.values.filter(v => v != null)).concat(o.band ? o.band.hi.filter(v => v != null) : []).concat(o.refY ? [o.refY.value] : []);
    const max = o.max || niceMax(Math.max(...all) * 1.05);
    const x = i => L + (W - L - R) * (labels.length === 1 ? .5 : i / (labels.length - 1));
    const y = v => T + (H - T - B) * (1 - v / max);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || 'Gráfico de líneas')}">`;
    ticks(max).forEach(t => { s += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${o.yfmt ? o.yfmt(t) : nf(t)}</text>`; });
    labels.forEach((lb, i) => { if (!o.every || i % o.every === 0 || i === labels.length - 1) s += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${esc(lb)}</text>`; });
    if (o.shade) s += `<rect x="${x(o.shade.from) - 6}" y="${T}" width="${x(labels.length - 1) - x(o.shade.from) + 12}" height="${H - T - B}" fill="rgba(139,92,246,.06)" rx="8"/><text x="${x(o.shade.from) - 2}" y="${T + 12}" style="fill:#7C5CFF;font-size:10.5px;font-weight:600">${esc(o.shade.label)}</text>`;
    if (o.band) {
      const idx = o.band.lo.map((v, i) => (v != null ? i : null)).filter(i => i != null);
      const up = idx.map(i => `${x(i)},${y(o.band.hi[i])}`).join(' ');
      const dn = idx.slice().reverse().map(i => `${x(i)},${y(o.band.lo[i])}`).join(' ');
      s += `<polygon points="${up} ${dn}" fill="${o.band.color || 'rgba(155,107,245,.22)'}"/>`;
    }
    if (o.refY) s += `<line x1="${L}" x2="${W - R}" y1="${y(o.refY.value)}" y2="${y(o.refY.value)}" stroke="${o.refY.color || 'var(--a-bad)'}" stroke-dasharray="5 4" stroke-width="1.4"/><text x="${W - R}" y="${y(o.refY.value) - 6}" text-anchor="end" style="fill:${o.refY.color || 'var(--a-bad)'}">${esc(o.refY.label)}</text>`;
    if (o.refY2) s += `<line x1="${L}" x2="${W - R}" y1="${y(o.refY2.value)}" y2="${y(o.refY2.value)}" stroke="${o.refY2.color}" stroke-dasharray="5 4" stroke-width="1.4"/><text x="${W - R}" y="${y(o.refY2.value) - 6}" text-anchor="end" style="fill:${o.refY2.color}">${esc(o.refY2.label)}</text>`;
    series.forEach(se => {
      let d = '', pen = false;
      se.values.forEach((v, i) => { if (v == null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(i)},${y(v)} `; pen = true; });
      if (se.area) {
        const pts = se.values.map((v, i) => (v != null ? [x(i), y(v)] : null)).filter(Boolean);
        s += `<path d="M${pts[0][0]},${y(0)} ${pts.map(p => `L${p[0]},${p[1]}`).join(' ')} L${pts[pts.length - 1][0]},${y(0)} Z" fill="${se.color}" opacity=".14"/>`;
      }
      s += `<path d="${d}" fill="none" stroke="${se.color}" stroke-width="2" ${se.dash ? 'stroke-dasharray="6 5"' : ''} stroke-linejoin="round" stroke-linecap="round"/>`;
      se.values.forEach((v, i) => {
        if (v == null) return;
        const bad = o.badBelow != null && v < o.badBelow;
        const last = i === se.values.length - 1 || se.values[i + 1] == null;
        if (bad || last || se.dots) s += `<circle cx="${x(i)}" cy="${y(v)}" r="${bad ? 5 : 4}" fill="${bad ? 'var(--a-bad)' : se.color}" style="stroke:var(--ch-ring)" stroke-width="2"/>`;
        s += `<rect class="hit" x="${x(i) - 12}" y="${T}" width="24" height="${H - T - B}" data-t="<b>${esc(labels[i])}</b><br>${esc(se.label)}: ${o.yfmt ? o.yfmt(v) : nf(v)}"/>`;
      });
    });
    return s + '</svg>';
  }

  // Columnas agrupadas (dos series)
  function colsPair(labels, a, b, o = {}) {
    const W = 600, H = o.h || 220, L = 30, R = 8, T = 10, B = 24;
    const max = niceMax(Math.max(...a.values, ...b.values));
    const bw = (W - L - R) / labels.length, y = v => T + (H - T - B) * (1 - v / max);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || 'Columnas')}">`;
    ticks(max).forEach(t => { s += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${nf(t)}</text>`; });
    labels.forEach((lb, i) => {
      const x0 = L + i * bw + bw * .14, w = bw * .34;
      [[a, 0], [b, 1]].forEach(([se, k]) => {
        const v = se.values[i];
        s += `<rect class="mk" x="${x0 + k * (w + 2)}" y="${y(v)}" width="${w}" height="${y(0) - y(v)}" rx="3" fill="${se.color}" data-t="<b>${esc(lb)}:00</b><br>${esc(se.label)}: ${v}"/>`;
      });
      s += `<text x="${x0 + w + 1}" y="${H - 7}" text-anchor="middle">${esc(lb)}h</text>`;
    });
    return s + '</svg>';
  }

  const legend = items => `<div class="legend">${items.map(i => `<span><i class="${i.type || ''}" style="background:${i.color};border-color:${i.color}"></i>${esc(i.label)}</span>`).join('')}</div>`;

  window.UI = { $, $$, esc, sleep, nf, money, ptbr, ic, flag, brasperScreen, contabTable, initTips, barsH, colsStacked, lines, colsPair, legend, niceMax, waiter, reveal, revealX, fly };
})();
