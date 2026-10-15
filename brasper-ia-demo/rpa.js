/* Solución 2 · RPA de facturación: lee la vista Contabilidad de Brasper y llena KeyFácil (Perú → Brasil) u Omie (Brasil → Perú). */
(function () {
  'use strict';
  const { $, $$, esc, sleep, nf, ptbr, ic, brasperScreen } = UI;
  const ROWS = BD.ACCOUNTING_TODAY;

  const S = {
    active: false, running: false, paused: false, speed: 2, layout: 'A',
    learned: { kf: 'A', om: 'A' }, platform: 'kf', rendered: null,
    done: {}, results: {}, times: [], boleta: 4872, nfse: 1285, page: 'contab'
  };
  const wait = UI.waiter(S);
  const fly = (fromEl, toEl, text, dur) => UI.fly(fromEl, toEl, text, dur, S.speed);
  const reveal = UI.reveal;
  const revealX = el => UI.revealX(el, $('#rpa-bp .tbl-wrap'));

  /* ---------- Esquemas de formularios ---------- */
  const docName = t => ({ DNI: 'DNI', CE: 'Carnet de extranjería', CPF: 'CPF', RUC: 'RUC' }[t] || t);
  const KF = {
    name: 'KeyFácil', fav: '#F2435A', favTxt: 'K', addr: 'keyfacil · Ventas › Nuevo comprobante electrónico',
    fields: {
      emisor: { a: 'Empresa emisora', b: 'Emisor', src: 'company', v: r => r.company },
      tipo: { a: 'Tipo de comprobante', b: 'Documento a emitir', src: 'rule', v: r => (r.docType === 'RUC' ? 'Factura electrónica (01)' : 'Boleta de venta (03)') },
      serie: { a: 'Serie', b: 'Serie', src: 'rule', v: r => (r.docType === 'RUC' ? 'F001' : 'B001') },
      fecha: { a: 'Fecha de emisión', b: 'Emisión', src: 'date', v: r => r.date.split(' ')[0] },
      moneda: { a: 'Moneda', b: 'Moneda', src: 'rule', v: () => 'Soles (PEN)' },
      dtipo: { a: 'Tipo de documento', b: 'Tipo doc. adquirente', src: 'docType', v: r => docName(r.docType) },
      doc: { a: 'N° de documento', b: 'Doc. de identidad', src: 'doc', v: r => r.doc },
      cliente: { a: 'Cliente / Razón social', b: 'Adquirente', src: 'client', v: r => r.client },
      email: { a: 'Correo del cliente', b: 'E-mail de envío', src: 'client', v: r => r.email },
      desc: { a: 'Descripción del ítem', b: 'Concepto', src: 'rule', v: r => `Comisión transferencia internacional ${r.code}` },
      valor: { a: 'Valor unitario (sin IGV)', b: 'Importe gravado', src: 'commission', v: r => r.commission.toFixed(2) },
      igv: { a: 'IGV 18 %', b: 'IGV', src: 'tax', v: r => r.tax.toFixed(2) },
      total: { a: 'Importe total', b: 'Total a pagar', src: 'total', v: r => r.total.toFixed(2) },
      x_code: { a: 'Código de operación', b: 'Ref. Brasper', src: 'code', v: r => r.code },
      x_op: { a: 'N° de operación', b: 'N° operación bancaria', src: 'op', v: r => r.op },
      x_send: { a: 'Monto enviado', b: 'Importe enviado', src: 'send', v: r => `${r.send.toFixed(2)} ${r.sendCur}` },
      x_recv: { a: 'Monto a recibir', b: 'Importe a recibir', src: 'receive', v: r => `${r.receive.toFixed(2)} ${r.receiveCur}` },
      x_tc: { a: 'Tipo de cambio', b: 'T. C.', src: 'rate', v: r => String(r.rate) }
    },
    A: { title: 'Nuevo comprobante', btnPos: 'bottom', btn: 'Emitir', sections: [
      ['Comprobante', 'c3', ['emisor:w2', 'tipo', 'serie', 'fecha', 'moneda']],
      ['Cliente', '', ['dtipo', 'doc', 'cliente:w2', 'email:w2']],
      ['Detalle', 'c3', ['desc:w2', 'valor', 'igv', 'total']],
      ['Datos adicionales', 'c3', ['x_code', 'x_op', 'x_tc', 'x_send', 'x_recv']]] },
    B: { title: 'Emisión rápida', btnPos: 'top', btn: 'Generar comprobante', sections: [
      ['Adquirente', '', ['cliente:w2', 'doc', 'dtipo', 'email:w2']],
      ['Información adicional', '', ['x_send', 'x_recv', 'x_tc', 'x_op', 'x_code']],
      ['Concepto e importes', 'c3', ['total', 'igv', 'valor', 'desc:w2']],
      ['Datos del comprobante', '', ['moneda', 'fecha', 'serie', 'tipo', 'emisor:w2']]] }
  };
  const OM = {
    name: 'Omie', fav: '#14B8A6', favTxt: 'o', addr: 'omie · Serviços › Nova Ordem de Serviço',
    fields: {
      empresa: { a: 'Empresa', b: 'Empresa emissora', src: 'company', v: r => r.company },
      tipo: { a: 'Documento', b: 'Tipo de nota', src: 'rule', v: () => 'NFS-e (serviço)' },
      cpf: { a: 'CPF / Doc. estrangeiro', b: 'Documento do tomador', src: 'doc', v: r => r.doc },
      nome: { a: 'Nome / Razão social', b: 'Tomador do serviço', src: 'client', v: r => r.client },
      email: { a: 'E-mail', b: 'E-mail para envio da NF', src: 'client', v: r => r.email },
      servico: { a: 'Serviço', b: 'Descrição do serviço', src: 'rule', v: () => 'Intermediação de câmbio · remessa' },
      data: { a: 'Data de emissão', b: 'Emissão', src: 'date', v: r => r.date.split(' ')[0] },
      valor: { a: 'Valor do serviço (R$)', b: 'Valor líquido', src: 'commission', v: r => ptbr(r.commission) },
      imp: { a: 'Impostos (R$)', b: 'Tributos', src: 'tax', v: r => ptbr(r.tax) },
      total: { a: 'Valor total (R$)', b: 'Total da NF', src: 'total', v: r => ptbr(r.total) },
      d_code: { a: 'Código Brasper', b: 'Referência', src: 'code', v: r => r.code },
      d_op: { a: 'Nº da operação', b: 'Nº operação', src: 'op', v: r => r.op },
      d_env: { a: 'Valor enviado', b: 'Valor remetido', src: 'send', v: r => `${ptbr(r.send)} ${r.sendCur}` },
      d_rec: { a: 'Valor a receber', b: 'Valor creditado', src: 'receive', v: r => `${ptbr(r.receive)} ${r.receiveCur}` },
      d_taxa: { a: 'Taxa de câmbio', b: 'Câmbio', src: 'rate', v: r => ptbr(r.rate, 3) }
    },
    A: { title: 'Nova Ordem de Serviço', btnPos: 'bottom', btn: 'Faturar', sections: [
      ['Cliente', '', ['cpf', 'empresa', 'nome:w2', 'email:w2']],
      ['Serviço', 'c3', ['tipo', 'servico:w2', 'data', 'valor', 'imp', 'total']],
      ['Dados adicionais da NF', 'c3', ['d_code', 'd_op', 'd_taxa', 'd_env', 'd_rec']]] },
    B: { title: 'OS · faturamento direto', btnPos: 'top', btn: 'Faturar OS', sections: [
      ['Dados adicionais', '', ['d_rec', 'd_env', 'd_taxa', 'd_op', 'd_code']],
      ['Valores', 'c3', ['total', 'imp', 'valor', 'servico:w2', 'tipo']],
      ['Tomador', 'c1', ['email', 'nome', 'cpf', 'empresa', 'data']]] }
  };
  const PLAT = { kf: KF, om: OM };
  // Qué columna de Contabilidad alimenta cada dato extraído (panel del robot)
  const EXTRACT = [
    ['code', 'Código'], ['date', 'Fecha envío'], ['op', 'N° operación'], ['client', 'Cliente'], ['docType', 'Tipo doc.'], ['doc', 'Documento'],
    ['company', 'Razón social'], ['send', 'Monto envío'], ['receive', 'Monto a recibir'], ['rate', 'Tipo cambio'], ['commission', 'Comisión interna'], ['tax', 'Impuesto interno'], ['total', 'Venta final']
  ];
  const showVal = (r, k) => ({ send: `${r.send.toFixed(2)} ${r.sendCur}`, receive: `${r.receive.toFixed(2)} ${r.receiveCur}`, date: r.date.split(' ')[0] }[k] || String(r[k]));

  /* ---------- Render ---------- */
  function render() {
    const el = $('#stage-rpa');
    el.innerHTML = `
      <div class="rpa" id="rpa-root">
        <div class="col-bp" id="rpa-bp">${brasperScreen({ page: S.page, withRpa: S.active })}</div>
        <aside class="col-bot" aria-label="Programa RPA">
          <div class="win-bar"><span class="dots"><i></i><i></i><i></i></span>Brasper RPA Agent</div>
          <div class="bot-head"><div class="bot-face" id="bot-face">${ic('bot').replace('<svg', '<svg style="width:24px;height:24px"')}</div>
            <div><b>Agente RPA de facturación</b><div class="bot-state" id="bot-state"><span class="led"></span><span>Listo para facturar 11 operaciones</span></div></div></div>
          <div class="bot-ctrl">
            <button class="run-btn" id="run-btn">${ic('play').replace('<svg', '<svg style="width:15px;height:15px"')}Iniciar facturación automática</button>
            <div class="ctl-row"><span>Diseño de la plataforma destino</span><span class="dseg" id="lay-seg"><button data-l="A" class="on">Actual</button><button data-l="B">Rediseñada</button></span></div>
            <div class="ctl-row"><span>Velocidad de la demo</span><span class="dseg" id="spd-seg"><button data-s="1">Lento</button><button data-s="2" class="on">Normal</button><button data-s="5">Turbo</button></span></div>
          </div>
          <div class="bot-kpis"><div><b id="k-done">0/11</b><span>comprobantes</span></div><div><b id="k-time">—</b><span>por comprobante</span></div><div><b id="k-save">0 min</b><span>ahorrados hoy</span></div></div>
          <div class="bot-scroll">
            <div class="bsec"><h4>Operación en curso</h4><div class="cur-op" id="cur-op"><b>—</b><div class="rt">Esperando inicio</div></div></div>
            <div class="bsec"><h4>Datos leídos del dashboard</h4><div class="fields" id="fields">${EXTRACT.map(([k, l]) => `<div class="fld" data-k="${k}"><span>${l}</span><code>—</code></div>`).join('')}</div></div>
            <div class="bsec"><h4>Reglas antes de emitir</h4><div class="rules" id="rules"><div class="rule"><i>·</i>Se evalúan con cada operación</div></div></div>
            <div class="bsec"><h4>Cola de hoy <span id="q-count">11</span></h4><div class="queue" id="queue">${ROWS.map(r => `<div class="q" data-code="${r.code}"><code>${r.code}</code><span class="dest">${r.sendCur === 'PEN' ? 'KeyFácil' : 'Omie'}</span><span class="s">En cola</span></div>`).join('')}</div></div>
            <div class="bsec"><h4>Bitácora</h4><div class="log" id="log"><p><span class="t">23:59:58</span> Agente iniciado. Sin acceso a base de datos: trabaja sobre la interfaz.</p></div></div>
          </div>
        </aside>
        <div class="col-target">
          <div class="target-hint">${ic('route').replace('<svg', '<svg style="width:15px;height:15px"')}<span>Perú → Brasil se emite en <b>KeyFácil</b> · Brasil → Perú en <b>Omie</b></span></div>
          <div class="browser" id="browser">
            <div class="bchrome"><span class="dots"><i></i><i></i><i></i></span><div class="btabs">
              <button class="btab on" data-p="kf" tabindex="-1"><span class="fav" style="background:${KF.fav}">${KF.favTxt}</span>KeyFácil</button>
              <button class="btab" data-p="om" tabindex="-1"><span class="fav" style="background:${OM.fav}">${OM.favTxt}</span>Omie</button></div></div>
            <div class="baddr">${ic('globe').replace('<svg', '<svg style="width:13px;height:13px"')}<span class="pill" id="addr">${KF.addr}</span></div>
            <div class="bview" id="bview"></div>
            <div class="toast" id="toast"></div>
            <span class="sim-mark">Simulación de la plataforma</span>
          </div>
        </div>
      </div>
      ${S.active ? '' : `<button class="launcher" id="launcher"><span class="bot-ic">${ic('bot').replace('<svg', '<svg style="width:24px;height:24px"')}</span><span><b>Brasper RPA</b><small>Programa externo · listo para conectarse</small></span><span class="go">Activar RPA</span></button>`}`;
    if (S.active) $("#rpa-root").classList.add('active');
    renderForm();
    bind();
  }

  function renderForm(fresh = true) {
    const p = PLAT[S.platform], L = p[S.layout];
    const fieldHtml = spec => {
      const [k, w] = spec.split(':'); const f = p.fields[k];
      return `<div class="ff ${w || ''}"><label for="f-${k}">${S.layout === 'A' ? f.a : f.b}</label><input id="f-${k}" data-f="${k}" readonly tabindex="-1" autocomplete="off"></div>`;
    };
    const btn = `<button class="${S.platform === 'kf' ? 'kf-btn' : 'om-btn'}" id="emit-btn" tabindex="-1">${L.btn}</button>`;
    const body = `<div class="frm">${L.sections.map(([t, g, fs]) => `<div class="fsec"><h5>${t}</h5><div class="fgrid ${g}">${fs.map(fieldHtml).join('')}</div></div>`).join('')}
      ${L.btnPos === 'bottom' ? `<div class="frm-foot"><button class="btn" tabindex="-1" style="font-size:12px;padding:8px 12px">${S.platform === 'kf' ? 'Cancelar' : 'Cancelar'}</button>${btn}</div>` : ''}</div>`;
    const head = `<div class="kf-title"><h3 style="${S.platform === 'om' ? 'color:#0D2A36' : ''}">${L.title}</h3>${L.btnPos === 'top' ? btn : ''}</div>`;
    const html = S.platform === 'kf'
      ? `<div class="kf"><div class="kf-top"><span class="kf-logo"><i>K</i>KEYFÁCIL</span><span class="sp"></span><small>BRASPER 21 S.A.C. · INGENITECH S.A.C.</small></div><div class="kf-body">${head}${body}</div></div>`
      : `<div class="om"><div class="om-top"><span class="om-logo">omie</span><span class="sp"></span><small>Brasper 21 Corretora · São Paulo</small></div><div class="om-sub"><span><b>Serviços</b></span><span>Ordens de Serviço</span><span>NFS-e</span><span>Clientes</span></div><div class="kf-body">${head}${body}</div></div>`;
    const bv = $('#bview');
    bv.innerHTML = html + `<svg class="vcursor" id="vcursor" viewBox="0 0 24 24"><path d="M4 2l15 8.5-6.5 1.6L9.8 19z" fill="#0B1233" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
    $('#addr').textContent = p.addr;
    $$('.btab').forEach(b => b.classList.toggle('on', b.dataset.p === S.platform));
    S.rendered = S.platform + S.layout;
  }

  function bind() {
    const l = $('#launcher');
    if (l) l.onclick = activate;
    $$('#rpa-bp [data-page]').forEach(b => b.onclick = () => { if (S.running) return; S.page = b.dataset.page; $('#rpa-bp').innerHTML = brasperScreen({ page: S.page, withRpa: S.active }); restoreRowStates(); bind(); });
    const rb = $('#run-btn'); if (rb) rb.onclick = onRun;
    $$('#lay-seg button').forEach(b => b.onclick = () => {
      S.layout = b.dataset.l; $$('#lay-seg button').forEach(x => x.classList.toggle('on', x === b));
      log(S.layout === 'B' ? `<span class="warn">Atención: ${PLAT[S.platform].name} cambió su diseño.</span> El agente lo notará al llenar.` : 'La plataforma volvió a su diseño original.');
      if (!S.running) { renderForm(); flashBrowser(); }
    });
    $$('#spd-seg button').forEach(b => b.onclick = () => { S.speed = +b.dataset.s; $$('#spd-seg button').forEach(x => x.classList.toggle('on', x === b)); });
  }
  function flashBrowser() { const b = $('#browser'); b.animate([{ boxShadow: '0 0 0 3px #F5B544' }, { boxShadow: '0 10px 30px rgba(20,30,70,.16)' }], { duration: 900 }); }

  async function activate() {
    S.active = true; S.page = 'contab';
    const l = $('#launcher'); if (l) { l.querySelector('small').textContent = 'Conectando con el dashboard…'; l.querySelector('.go').innerHTML = '<span class="spinner" style="border-color:rgba(11,18,48,.25);border-top-color:#0B1230"></span>'; }
    await sleep(700);
    render();
    // barrido visual: la plataforma tradicional "se actualiza"
    const sweep = document.createElement('div');
    sweep.style.cssText = 'position:fixed;inset:50px 0 0 0;z-index:60;pointer-events:none;background:linear-gradient(100deg,transparent 0%,rgba(43,228,255,.0) 35%,rgba(43,228,255,.35) 50%,rgba(74,82,216,.0) 65%,transparent 100%);background-size:250% 100%;';
    document.body.appendChild(sweep);
    await sweep.animate([{ backgroundPosition: '120% 0' }, { backgroundPosition: '-60% 0' }], { duration: 1100, easing: 'ease-in-out' }).finished;
    sweep.remove();
    $$('#contab th.rpacol, #contab td[data-k="rpa"]').forEach(c => c.animate([{ background: '#9FF3FF' }, { background: '' }], { duration: 1400 }));
    log('<span class="ai">Conectado.</span> Leí la vista Contabilidad: 11 operaciones de hoy sin comprobante.');
  }

  /* ---------- Utilidades de la animación ---------- */
  function log(html) {
    const lg = $('#log'); if (!lg) return;
    const t = new Date(); const ts = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
    lg.insertAdjacentHTML('beforeend', `<p><span class="t">${ts}</span> ${html}</p>`);
    lg.scrollTop = lg.scrollHeight;
  }
  function setState(txt, cls) { const s = $('#bot-state'); s.className = 'bot-state ' + (cls || ''); s.querySelector('span:last-child').textContent = txt; }
  function rowEl(code) { return $(`#contab tr[data-code="${code}"]`); }
  function cell(code, k) { const tr = rowEl(code); return tr && tr.querySelector(`td[data-k="${k}"]`); }
  function setQueue(code, txt, cls) { const q = $(`#queue .q[data-code="${code}"] .s`); if (q) { q.textContent = txt; q.className = 's ' + (cls || ''); } }
  function setRpaCell(code, html) { const c = cell(code, 'rpa'); if (c) c.innerHTML = html; }
  function restoreRowStates() { Object.entries(S.results).forEach(([code, html]) => setRpaCell(code, html)); }

  function moveCursor(target) {
    const cur = $('#vcursor'), bv = $('#bview'); if (!cur || !target) return;
    const r = target.getBoundingClientRect(), br = bv.getBoundingClientRect();
    cur.style.left = (r.left - br.left + bv.scrollLeft + Math.min(r.width * .5, 60)) + 'px';
    cur.style.top = (r.top - br.top + bv.scrollTop + r.height * .55) + 'px';
  }
  async function typeInto(input, text) {
    input.classList.add('focus');
    const step = Math.max(1, Math.ceil(text.length / 14));
    for (let i = step; i < text.length + step; i += step) { input.value = text.slice(0, i); await wait(20); }
    input.value = text; input.classList.remove('focus'); input.classList.add('filled');
  }
  function toast(html, cls = '') { const t = $('#toast'); t.className = 'toast ' + cls; t.innerHTML = html; requestAnimationFrame(() => t.classList.add('show')); }
  function hideToast() { $('#toast').classList.remove('show'); }

  async function visionScan(p) {
    const bv = $('#bview'), br = bv.getBoundingClientRect();
    log(`<span class="warn">El diseño de ${p.name} no coincide con el que conocía.</span>`);
    log('<span class="ai">Visión IA:</span> reconociendo campos por su etiqueta y contexto…');
    setState('Reconociendo la nueva pantalla…', 'run');
    bv.scrollTop = 0;
    const line = document.createElement('div'); line.className = 'scanline'; bv.appendChild(line);
    const boxes = [];
    const inputs = $$('#bview input[data-f]');
    for (const inp of inputs) {
      const r = inp.closest('.ff').getBoundingClientRect();
      const box = document.createElement('div'); box.className = 'vbox';
      box.style.cssText = `left:${r.left - br.left + bv.scrollLeft - 3}px;top:${r.top - br.top + bv.scrollTop - 2}px;width:${r.width + 6}px;height:${r.height + 4}px`;
      const conf = (0.93 + BD.rnd() * 0.06).toFixed(2);
      box.innerHTML = `<span>${inp.dataset.f} · ${conf}</span>`;
      bv.appendChild(box); boxes.push(box);
      await wait(70);
    }
    const btn = $('#emit-btn'); const rb = btn.getBoundingClientRect();
    const bb = document.createElement('div'); bb.className = 'vbox'; bb.style.cssText = `left:${rb.left - br.left + bv.scrollLeft - 4}px;top:${rb.top - br.top + bv.scrollTop - 3}px;width:${rb.width + 8}px;height:${rb.height + 6}px;border-color:#F5B544;background:rgba(245,181,68,.12)`;
    bb.innerHTML = `<span style="background:#F5B544">botón emitir · 0.99</span>`; bv.appendChild(bb); boxes.push(bb);
    await wait(900);
    log(`<span class="ai">Listo:</span> ${inputs.length} campos reubicados y el botón "${p[S.layout].btn}" ${p[S.layout].btnPos === 'top' ? 'ahora arriba' : 'abajo'}. Sigo sin intervención humana.`);
    log('<span class="warn">Aviso enviado a soporte:</span> la pantalla cambió (no se detuvo el proceso).');
    await wait(500);
    boxes.forEach(b => b.remove()); line.remove();
    S.learned[S.platform] = S.layout;
  }

  /* ---------- Proceso de una operación ---------- */
  async function processRow(r) {
    const t0 = performance.now();
    const isP = r.sendCur === 'PEN';
    const plat = isP ? 'kf' : 'om', p = PLAT[plat];
    setQueue(r.code, 'Leyendo', 'run');
    $('#cur-op').innerHTML = `<b>${r.code}</b><div class="rt">${isP ? 'Perú → Brasil' : 'Brasil → Perú'} · destino <b style="font-family:var(--f-body);font-size:12px">${p.name}</b></div>`;
    setRpaCell(r.code, '<span class="st run">Leyendo…</span>');
    $$('#fields .fld').forEach(f => { f.className = 'fld'; f.querySelector('code').textContent = '—'; });
    $('#rules').innerHTML = '';

    // 1) Leer la fila del dashboard
    setState(`Leyendo ${r.code} en Contabilidad`, 'run');
    const tr = rowEl(r.code);
    $$('#contab tr.reading').forEach(x => x.classList.remove('reading'));
    if (tr) { tr.classList.add('reading'); $('#rpa-bp .tbl-wrap').scrollLeft = 0; reveal(tr, $('#rpa-bp')); }
    await wait(350);
    const flights = [];
    for (let i = 0; i < EXTRACT.length; i++) {
      const [k] = EXTRACT[i];
      const c = cell(r.code, k), f = $(`#fields .fld[data-k="${k}"]`);
      revealX(c);
      if (c) { c.classList.remove('grab'); void c.offsetWidth; c.classList.add('grab'); }
      flights.push(fly(c, f, showVal(r, k), 700).then(() => { f.classList.add('got'); f.querySelector('code').textContent = showVal(r, k); }));
      await wait(70);
    }
    await Promise.all(flights);
    log(`Leí ${r.code}: ${esc(r.client)} · ${r.docType} ${r.doc} · venta final ${isP ? 'S/' : 'R$'} ${r.total.toFixed(2)}`);

    // 2) Reglas de negocio
    setState('Validando reglas antes de emitir', 'run');
    const expected = Math.round((r.commission + r.tax) * 100) / 100;
    const rules = [
      [true, `Comprobante: ${isP ? (r.docType === 'RUC' ? 'factura (RUC)' : `boleta (${r.docType})`) : 'NFS-e de servicio'}`],
      [true, `Destino: ${p.name} por la ruta ${isP ? 'PxB' : 'BxP'}`],
      [Math.abs(r.tax - r.commission * 0.18) < 0.02, `IGV = 18 % de la comisión (${(r.commission * 0.18).toFixed(2)})`],
      [Math.abs(expected - r.total) < 0.02, `Venta final = comisión + impuesto (${expected.toFixed(2)})`],
      [true, 'La operación no tiene comprobante previo']
    ];
    let ok = true;
    for (const [pass, txt] of rules) {
      $('#rules').insertAdjacentHTML('beforeend', `<div class="rule ${pass ? 'ok' : 'bad'}"><i>${pass ? '✓' : '!'}</i>${txt}</div>`);
      if (!pass) ok = false;
      await wait(220);
    }
    if (!ok) {
      log(`<span class="bad">No emití ${r.code}:</span> la venta final dice ${r.total.toFixed(2)} y comisión + impuesto suman ${expected.toFixed(2)}. Va a revisión de contabilidad.`);
      setQueue(r.code, 'Revisión', 'bad');
      const html = '<span class="st warn" title="Venta final no cuadra">Revisión humana</span>';
      S.results[r.code] = html; setRpaCell(r.code, html);
      if (tr) tr.classList.remove('reading');
      toast(`${ic('eye').replace('<svg', '<svg style="width:15px;height:15px"')} ${r.code} apartada: los montos no cuadran`, 'bad');
      await wait(1600); hideToast();
      S.done[r.code] = 'review';
      return;
    }

    // 3) Abrir la plataforma correcta
    if (S.platform !== plat || S.rendered !== plat + S.layout) {
      setState(`Abriendo ${p.name}`, 'run');
      S.platform = plat; $('#bview').style.opacity = .35; await wait(300); renderForm(); $('#bview').style.opacity = 1; await wait(200);
    } else renderForm();
    if (S.learned[plat] !== S.layout) await visionScan(p);
    if (plat === 'om') log('Formato pt-BR aplicado a montos (ej. 10.54 → 10,54).');

    // 4) Llenar campo por campo
    setState(`Llenando ${p.name}`, 'run');
    const order = p[S.layout].sections.flatMap(s => s[2].map(x => x.split(':')[0]));
    // primero las reglas (no vienen de una celda), luego los datos en el orden visual de la pantalla
    const ruleKeys = order.filter(k => p.fields[k].src === 'rule');
    const dataKeys = order.filter(k => p.fields[k].src !== 'rule');
    for (const k of ruleKeys) {
      const inp = $(`#bview input[data-f="${k}"]`); reveal(inp, $('#bview')); moveCursor(inp);
      await wait(160); await typeInto(inp, p.fields[k].v(r));
    }
    for (const k of dataKeys) {
      const f = p.fields[k], inp = $(`#bview input[data-f="${k}"]`);
      reveal(inp, $('#bview'));
      const from = $(`#fields .fld[data-k="${f.src}"]`);
      moveCursor(inp);
      await fly(from, inp, f.v(r), 500);
      await typeInto(inp, f.v(r));
      if (from) from.classList.add('put');
    }

    // 5) Emitir
    const btn = $('#emit-btn'); reveal(btn, $('#bview')); moveCursor(btn);
    await wait(450);
    $('#vcursor').classList.add('press'); btn.classList.add('btn-press'); await wait(160); btn.classList.remove('btn-press'); $('#vcursor').classList.remove('press');
    setState('Emitiendo comprobante', 'run');
    toast(`<span class="spinner"></span> ${plat === 'kf' ? 'Enviando a SUNAT…' : 'Transmitindo à Prefeitura…'}`, 'info');
    await wait(900);
    const num = plat === 'kf' ? `B001-${String(S.boleta++).padStart(8, '0')}` : `NFS-e ${String(S.nfse++).padStart(6, '0')}`;
    toast(`${ic('check').replace('<svg', '<svg style="width:15px;height:15px"')} ${plat === 'kf' ? `Boleta ${num} aceptada por SUNAT` : `${num} autorizada`}`);
    log(`<span class="ok">Emitido ${num}</span> para ${r.code} en ${p.name}.`);

    // 6) Validar el PDF con IA y escribir el resultado en Brasper
    await wait(500);
    setState('Validando el PDF con IA', 'run');
    const nChecks = 9;
    $('#rules').insertAdjacentHTML('beforeend', `<div class="rule ok"><i>✓</i>PDF leído por IA: ${nChecks}/${nChecks} campos coinciden con el dashboard</div>`);
    log(`<span class="ai">PDF validado:</span> cliente, documento, montos, IGV y número coinciden.`);
    await wait(300);
    const back = cell(r.code, 'rpa'); revealX(back);
    await fly($('#toast'), back, num, 650);
    const html = `<span class="st ok">${num}</span>`;
    S.results[r.code] = html; setRpaCell(r.code, html);
    if (back) back.animate([{ background: '#C9F7DA' }, { background: '' }], { duration: 1200 });
    setQueue(r.code, 'Emitido', 'ok');
    hideToast();
    if (tr) tr.classList.remove('reading');
    S.done[r.code] = 'ok';
    const secs = (performance.now() - t0) / 1000;
    S.times.push(secs);
    updateKpis();
  }

  function updateKpis() {
    const n = Object.values(S.done).filter(v => v === 'ok').length;
    $('#k-done').textContent = `${n}/${ROWS.length}`;
    if (S.times.length) {
      const avg = S.times.reduce((a, b) => a + b, 0) / S.times.length;
      $('#k-time').textContent = `${Math.round(avg)} s`;
      $('#k-save').textContent = `${nf(n * (5.5 - avg / 60), 0)} min`;
    }
  }

  async function onRun() {
    const btn = $('#run-btn');
    if (S.running) { S.paused = !S.paused; btn.innerHTML = S.paused ? `${ic('play').replace('<svg', '<svg style="width:15px;height:15px"')}Continuar` : `${ic('pause').replace('<svg', '<svg style="width:15px;height:15px"')}Pausar`; setState(S.paused ? 'En pausa' : 'Trabajando', S.paused ? '' : 'run'); return; }
    if (Object.keys(S.done).length === ROWS.length) { resetRun(); return; }
    if (!S.active) await activate();
    if (S.page !== 'contab') { S.page = 'contab'; $('#rpa-bp').innerHTML = brasperScreen({ page: 'contab', withRpa: true }); restoreRowStates(); bind(); }
    S.running = true; $('#bot-face').classList.add('busy');
    btn.innerHTML = `${ic('pause').replace('<svg', '<svg style="width:15px;height:15px"')}Pausar`;
    log('<span class="ai">Inicio de facturación automática</span> de las operaciones de hoy.');
    for (const r of ROWS) { if (S.done[r.code]) continue; await processRow(r); await wait(250); }
    S.running = false; $('#bot-face').classList.remove('busy');
    const ok = Object.values(S.done).filter(v => v === 'ok').length, rev = Object.values(S.done).filter(v => v === 'review').length;
    setState(`Terminado: ${ok} emitidos, ${rev} en revisión`, 'done');
    $('#cur-op').innerHTML = `<b>Listo</b><div class="rt">${ok} comprobantes emitidos y validados · ${rev} apartado para revisión humana</div>`;
    log(`<span class="ok">Fin del lote.</span> Contabilidad solo revisa ${rev} caso con el motivo explicado.`);
    btn.innerHTML = `${ic('play').replace('<svg', '<svg style="width:15px;height:15px"')}Reiniciar demo`;
  }
  function resetRun() {
    Object.assign(S, { done: {}, results: {}, times: [], boleta: 4872, nfse: 1285, learned: { kf: 'A', om: 'A' }, platform: 'kf', paused: false });
    render();
  }

  window.RPA = { render };
})();
