/* ARM · Agentic Relationship Management. Seis agentes con mascota propia sobre la data de Brasper + campañas. */
(function () {
  'use strict';
  const { $, $$, esc, sleep, nf, money, ic, barsH, colsStacked, lines, colsPair, legend } = UI;
  const B = BD;
  const S = { view: 'home' };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

  /* ---------- Cálculos ---------- */
  const C = B.CAMPAIGNS, T = B.totals;
  const chName = k => B.CH[k].short;
  const paidCh = ['meta', 'wa', 'tiktok'];
  const byCh = paidCh.map(k => { const cs = C.filter(c => c.ch === k); const sp = cs.reduce((s, c) => s + c.spend, 0), cl = cs.reduce((s, c) => s + c.newClients, 0), rev = cs.reduce((s, c) => s + c.revenue, 0); return { k, spend: sp, clients: cl, revenue: rev, cac: sp / cl, roas: rev / sp }; });
  const newTotal = B.MONTHLY.reduce((s, m) => s + Object.values(m.byCh).reduce((a, b) => a + b, 0), 0);
  const paidShare = B.MONTHLY.reduce((s, m) => s + paidCh.reduce((a, k) => a + m.byCh[k], 0), 0) / newTotal;
  const sorted = C.slice().sort((a, b) => b.roas - a.roas);
  const best = sorted[0], worst = sorted[sorted.length - 1];
  const breakeven = B.COHORT.findIndex(p => p.value != null && p.value >= T.cac);
  const starClient = C.find(c => c.id === 'C08').clients.slice().sort((a, b) => b.ops.length - a.ops.length)[0];
  const fmtD = d => `${d.getDate()} ${B.MONTHS[d.getMonth()].toLowerCase()}`;
  const matchedPct = Math.round(C.reduce((s, c) => s + c.matched * c.newClients, 0) / T.clients);
  const quotesQ = B.QUOTES_HOURLY.reduce((s, x) => s + x.q, 0), quotesC = B.QUOTES_HOURLY.reduce((s, x) => s + x.c, 0);

  /* ---------- Agentes ---------- */
  const AG = [
    { id: 'rastro', name: 'Rastro', role: 'Trazabilidad', color: '#06B6D4', lt: '#67E8F9', dk: '#0E7490', icon: 'route',
      tag: 'Sigo a cada cliente del anuncio a su operación.',
      live: ['Uniendo clics con registros', 'Leyendo ctwa_clid de WhatsApp', 'Atribuyendo 339 operaciones'],
      pipe: ['Captura el clic', 'Une el registro', 'Cruza operaciones', 'Atribuye ingreso'],
      chips: ['Meta Ads', 'WhatsApp', 'Web · UTM', 'user.user', 'transactions'],
      hello: `Soy <b>Rastro</b>. Ya identifico el origen del <span class="hl">${matchedPct} %</span> de los clientes de campaña, sin etiquetas a mano.`,
      qs: [{ q: '¿De dónde vienen los clientes?', k: ['donde', 'vienen', 'origen', 'canal'] }, { q: 'Recorrido de un cliente', k: ['recorrido', 'journey', 'viaje'] }, { q: 'Campañas con operaciones reales', k: ['campañas', 'operaciones', 'reales'] }, { q: 'Ver el match en vivo', k: ['match', 'en vivo', 'cómo unes', 'como unes', 'cruce', 'cruzas', 'fbclid', 'utm', 'simular'], view: 'match' }] },
    { id: 'capital', name: 'Capital', role: 'Finanzas', color: '#F59E0B', lt: '#FCD34D', dk: '#B45309', icon: 'coins',
      tag: 'Cada sol invertido convertido en ROI, ROAS y CAC.',
      live: ['Recalculando ROAS de hoy', 'Convirtiendo BRL a PEN', 'Actualizando CAC por canal'],
      pipe: ['Junta el gasto', 'Suma comisiones', 'Calcula ROAS · ROI', 'Proyecta valor'],
      chips: ['Meta / TikTok', 'finance.expenses', 'commission_result', 'fx_month_rates'],
      hello: `Soy <b>Capital</b>. Mido lo que de verdad gana Brasper: la <span class="hl">comisión</span>, no el monto enviado.`,
      qs: [{ q: 'ROAS y ROI por campaña', k: ['roas', 'roi', 'retorno'] }, { q: '¿Qué canal tiene el CAC más bajo?', k: ['cac', 'canal', 'costo'] }, { q: '¿Las campañas pierden plata?', k: ['pierden', 'plata', 'rentable', 'valor'] }] },
    { id: 'horizonte', name: 'Horizonte', role: 'Predicción', color: '#8B5CF6', lt: '#C4B5FD', dk: '#6D28D9', icon: 'scope',
      tag: 'Te digo cuánto invertir, cuándo y dónde.',
      live: ['Pronosticando Navidad', 'Comparando ciudades por edad', 'Leyendo calendario PE · BR'],
      pipe: ['Lee el histórico', 'Detecta temporadas', 'Pronostica', 'Reparte presupuesto'],
      chips: ['Histórico 2026', 'Calendario PE · BR', 'Edad y región', 'Cohortes'],
      hello: `Soy <b>Horizonte</b>. Para diciembre recomiendo <span class="hl">S/ 1,850 – 2,450</span>.`,
      qs: [{ q: '¿Cuánto invierto en diciembre?', k: ['diciembre', 'invertir', 'navidad', 'presupuesto'] }, { q: 'Próximas fechas clave', k: ['fechas', 'calendario', 'temporada'] }, { q: '¿Conviene entrar a Brasilia?', k: ['brasilia', 'ciudad', 'expandir', 'edad'] }] },
    { id: 'bitacora', name: 'Bitácora', role: 'Registro', color: '#3B82F6', lt: '#93C5FD', dk: '#1D4ED8', icon: 'book',
      tag: 'Registro cada cotización, cierre o no.',
      live: ['Guardando cotización Q-164', 'Creando PxB-001535', 'Marcando seguimientos'],
      pipe: ['Lee la calculadora', 'Guarda la cotización', 'Crea la transferencia', 'Prioriza seguimiento'],
      chips: ['Calculadora web', 'Comprobantes', 'transactions', 'tags'],
      hello: `Soy <b>Bitácora</b>. Hoy guardé <span class="hl">${quotesQ} cotizaciones</span>, no solo las ${quotesC} que cerraron.`,
      qs: [{ q: 'Cotizaciones y cierres de hoy', k: ['cotizaciones', 'hoy', 'cerraron'] }, { q: '¿A quién le hago seguimiento?', k: ['seguimiento', 'quién', 'llamar'] }, { q: '¿Qué registraste hoy?', k: ['registraste', 'registro', 'guardaste'] }] },
    { id: 'caudal', name: 'Caudal', role: 'Liquidez', color: '#10B981', lt: '#6EE7B7', dk: '#047857', icon: 'drop',
      tag: 'Vigilo soles, dólares y reales cada hora.',
      live: ['Leyendo 7 cuentas', 'Reales bajo el límite', 'Proyectando cierre de caja'],
      pipe: ['Lee saldos', 'Compara límites', 'Alerta a tiempo', 'Propone campaña'],
      chips: ['BCP', 'BBVA', 'Interbank', 'Itaú', 'Banco do Brasil', 'Nubank'],
      hello: `Soy <b>Caudal</b>. <span class="hl" style="color:var(--a-bad)">Los reales están bajo el límite</span> desde las 16:00. Ya tengo un plan.`,
      qs: [{ q: '¿Cómo están los saldos?', k: ['saldos', 'ahora', 'reales', 'liquidez'] }, { q: '¿Lanzo una campaña mañana?', k: ['mañana', 'campaña', 'lanzar'] }, { q: 'Saldos por banco', k: ['banco', 'cuentas'] }] },
    { id: 'lupa', name: 'Lupa', role: 'Calidad de leads', color: '#EC4899', lt: '#F9A8D4', dk: '#BE185D', icon: 'lens',
      tag: 'Descubro por qué no cierran y qué cambiar.',
      live: ['Clasificando 412 chats', 'Detectando confusión con préstamos', 'Comparando 5 anuncios'],
      pipe: ['Lee los chats', 'Clasifica motivos', 'Encuentra la causa', 'Propone el mensaje'],
      chips: ['Chats', 'Formularios Meta', 'Texto de anuncios'],
      hello: `Soy <b>Lupa</b>. El <span class="hl">40 %</span> de los leads cree que Brasper presta dinero. Se arregla con el mensaje.`,
      qs: [{ q: '¿Por qué no cierran los leads?', k: ['por qué', 'cierran', 'motivo', 'leads'] }, { q: '¿Qué anuncio confunde más?', k: ['préstamo', 'prestamo', 'anuncio', 'confunde'] }, { q: '¿Cómo cambio el mensaje?', k: ['mensaje', 'cambiar', 'texto'] }] }
  ];
  const byId = Object.fromEntries(AG.map(a => [a.id, a]));

  /* ---------- Mascotas (robots SVG personalizados por rol) ---------- */
  let uid = 0;
  function mascot(id, size, wave) {
    const a = byId[id]; const g = 'm' + (++uid); const { color: c, lt, dk } = a;
    const eyeRound = (cx, r = 5.5) => `<g class="m-eye"><ellipse cx="${cx}" cy="46" rx="${r}" ry="${r + 1}" fill="${lt}"/><circle cx="${cx + 2}" cy="${44 - r / 4}" r="${r / 3}" fill="#fff"/></g>`;
    const eyes = {
      rastro: `<rect class="m-eye" x="42" y="43" width="13" height="6.5" rx="3.2" fill="${lt}"/><rect class="m-eye" x="65" y="43" width="13" height="6.5" rx="3.2" fill="${lt}"/>`,
      capital: `<path class="m-eye" d="M43 49 q6 -9 12 0" stroke="${lt}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path class="m-eye" d="M65 49 q6 -9 12 0" stroke="${lt}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
      horizonte: eyeRound(49, 6.5) + eyeRound(71, 6.5),
      bitacora: `<circle class="m-eye" cx="49" cy="46" r="3.6" fill="${lt}"/><circle class="m-eye" cx="71" cy="46" r="3.6" fill="${lt}"/>`,
      caudal: eyeRound(49) + eyeRound(71),
      lupa: eyeRound(49, 4) + eyeRound(71, 7.5)
    }[id];
    const tip = {
      rastro: `<path class="m-ant" d="M60 0 a6.5 6.5 0 0 1 6.5 6.5 c0 5 -6.5 10.5 -6.5 10.5 s-6.5 -5.5 -6.5 -10.5 A6.5 6.5 0 0 1 60 0z" fill="${c}"/><circle cx="60" cy="6.5" r="2.4" fill="#fff"/>`,
      capital: `<circle class="m-ant" cx="60" cy="7" r="6" fill="#FCD34D" stroke="#D97706" stroke-width="2"/>`,
      horizonte: `<path class="m-ant" d="M60 0 l2.2 5 5.3.5 -4 3.6 1.2 5.2 -4.7 -2.8 -4.7 2.8 1.2 -5.2 -4 -3.6 5.3 -.5z" fill="${c}"/>`,
      bitacora: `<circle class="m-ant" cx="60" cy="7" r="5.5" fill="${c}"/>`,
      caudal: `<path class="m-ant" d="M60 0 C60 0 66 7.5 66 11 a6 6 0 0 1 -12 0 C54 7.5 60 0 60 0z" fill="${c}"/>`,
      lupa: `<circle class="m-ant" cx="60" cy="7" r="5" fill="#fff" stroke="${c}" stroke-width="3"/>`
    }[id];
    const screen = {
      rastro: `<polyline points="47,101 54,92 61,98 68,89 73,94" fill="none" stroke="${lt}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="47" cy="101" r="2.2" fill="${lt}"/><circle class="m-screen-blink" cx="73" cy="94" r="2.6" fill="#fff"/>`,
      capital: [0, 1, 2, 3].map(i => `<rect x="${47 + i * 7.5}" y="${102 - 5 - i * 3.5}" width="5" height="${5 + i * 3.5}" rx="1.2" fill="${lt}" opacity="${.6 + i * .13}"/>`).join(''),
      horizonte: `<path d="M46 98 q5 -8 10 0 t10 0" fill="none" stroke="${lt}" stroke-width="2.2"/><path d="M66 98 q4 -7 8 0" fill="none" stroke="#fff" stroke-width="2.2" stroke-dasharray="2.5 2.5" class="m-screen-blink"/>`,
      bitacora: `<rect x="47" y="89" width="22" height="2.6" rx="1.3" fill="${lt}"/><rect x="47" y="94.5" width="16" height="2.6" rx="1.3" fill="${lt}" opacity=".8"/><rect x="47" y="100" width="19" height="2.6" rx="1.3" fill="${lt}" opacity=".65"/><rect class="m-screen-blink" x="68" y="99.5" width="2.6" height="3.6" fill="#fff"/>`,
      caudal: `<clipPath id="${g}c"><rect x="43" y="84" width="34" height="22" rx="7"/></clipPath><g clip-path="url(#${g}c)"><path class="m-liq" d="M40 96 q5 -3 10 0 t10 0 t10 0 t10 0 V110 H40z" fill="${lt}"/></g>`,
      lupa: `<circle cx="60" cy="95" r="8" fill="none" stroke="${lt}" stroke-width="1.4" opacity=".7"/><circle cx="60" cy="95" r="4" fill="none" stroke="${lt}" stroke-width="1.4"/><circle class="m-screen-blink" cx="64" cy="92" r="1.8" fill="#FF6B8A"/>`
    }[id];
    const hand = {
      capital: `<circle cx="92" cy="111" r="9" fill="#FCD34D" stroke="#D97706" stroke-width="2"/><text x="92" y="114" text-anchor="middle" font-family="Sora, sans-serif" font-size="8" font-weight="800" fill="#92400E">S/</text>`,
      horizonte: `<rect x="89" y="114" width="16" height="5" rx="2" fill="${dk}"/><circle cx="97" cy="103" r="11" fill="url(#${g}o)"/><circle cx="93" cy="99" r="2.8" fill="#fff" opacity=".9"/>`,
      bitacora: `<g transform="rotate(-35 92 108)"><rect x="89" y="96" width="6" height="22" rx="1.5" fill="#FBBF24"/><rect x="89" y="96" width="6" height="4" rx="1.5" fill="#F472B6"/><path d="M89 118 l3 6 3 -6z" fill="#334155"/></g>`,
      lupa: `<line x1="94" y1="104" x2="88" y2="116" stroke="${dk}" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="92" r="12" fill="rgba(255,255,255,.55)" stroke="${dk}" stroke-width="4"/><path d="M94 88 a7 7 0 0 1 6 -4" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    }[id] || '';
    const front = {
      rastro: `<path d="M23 44 Q23 11 60 11 Q97 11 97 44" fill="none" stroke="${dk}" stroke-width="4" stroke-linecap="round"/><path d="M24 54 q1 14 15 13" fill="none" stroke="${dk}" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="67" r="3.2" fill="${c}"/>`,
      capital: `<path d="M60 76 L49 71 L49 81 Z M60 76 L71 71 L71 81 Z" fill="${dk}"/><circle cx="60" cy="76" r="3" fill="${c}"/>`,
      bitacora: `<circle cx="49" cy="46" r="9.5" fill="rgba(255,255,255,.08)" stroke="${dk}" stroke-width="2.6"/><circle cx="71" cy="46" r="9.5" fill="rgba(255,255,255,.08)" stroke="${dk}" stroke-width="2.6"/><path d="M58.5 45 q1.5 -2 3 0" stroke="${dk}" stroke-width="2.4" fill="none"/>`
    }[id] || '';
    return `<svg class="mascot ${wave ? 'wave' : ''}" viewBox="0 0 120 132" width="${size}" height="${Math.round(size * 1.1)}" role="img" aria-label="Mascota de ${a.name}">
      <defs><linearGradient id="${g}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lt}"/><stop offset="1" stop-color="${c}"/></linearGradient>
      <linearGradient id="${g}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E6EAFA"/></linearGradient>
      <radialGradient id="${g}v" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#2B3275"/><stop offset="1" stop-color="#0C1137"/></radialGradient>
      <radialGradient id="${g}o" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="${lt}"/><stop offset="1" stop-color="${c}"/></radialGradient></defs>
      <ellipse class="m-shadow" cx="60" cy="126" rx="27" ry="4.5" fill="rgba(40,50,120,.16)"/>
      <g class="m-bob">
        <line x1="60" y1="21" x2="60" y2="12" stroke="${dk}" stroke-width="3" stroke-linecap="round"/>${tip}
        <rect x="22" y="80" width="13" height="28" rx="6.5" fill="url(#${g}b)"/>
        <rect x="31" y="73" width="58" height="46" rx="19" fill="url(#${g}b)"/>
        <rect x="31.5" y="73.5" width="57" height="45" rx="18.5" fill="none" stroke="rgba(255,255,255,.55)"/>
        <rect x="43" y="84" width="34" height="22" rx="7" fill="#0C1137"/>${screen}
        <g class="m-arm-r"><rect x="85" y="80" width="13" height="28" rx="6.5" fill="url(#${g}b)"/>${hand}</g>
        <rect x="52" y="66" width="16" height="9" rx="3" fill="${dk}"/>
        <rect x="19" y="36" width="9" height="20" rx="4.5" fill="${c}"/><rect x="92" y="36" width="9" height="20" rx="4.5" fill="${c}"/>
        <rect x="26" y="20" width="68" height="52" rx="24" fill="url(#${g}h)" stroke="rgba(110,120,200,.25)"/>
        <rect x="34" y="30" width="52" height="32" rx="15" fill="url(#${g}v)"/>${eyes}
        <ellipse cx="38" cy="66" rx="4" ry="2" fill="${lt}" opacity=".55"/><ellipse cx="82" cy="66" rx="4" ry="2" fill="${lt}" opacity=".55"/>
        ${front}
      </g></svg>`;
  }

  /* ---------- Respuestas cortas + evidencia ---------- */
  const A = {
    rastro: [
      () => ({ think: ['Leyendo registros y etiquetas', 'Uniendo clics de Meta y WhatsApp'],
        text: `${nf(newTotal)} clientes nuevos en 2026. Solo <span class="hl">${Math.round(paidShare * 100)} %</span> vino de campañas, pero ahora cada uno tiene su anuncio comprobado.`,
        title: 'Clientes nuevos por origen', tag: 'ene – oct',
        viz: legend(Object.values(B.CH).map(c => ({ label: c.short, color: c.color }))) + colsStacked(B.MONTHLY.map(m => ({ label: m.label, vals: m.byCh })), Object.values(B.CH).map(c => ({ key: c.key, label: c.short, color: c.color })), { totals: true, aria: 'Clientes nuevos por canal y mes' }) }),
      () => { const cl = starClient, camp = C.find(c => c.id === cl.campaign);
        const steps = [
          { w: fmtD(new Date(cl.first.getTime() - 9e7)), ic: 'eye', b: 'Ve el anuncio', s: camp.name },
          { w: fmtD(new Date(cl.first.getTime() - 8.6e7)), ic: 'click', b: 'Hace clic', s: '<code>ctwa_clid</code> capturado' },
          { w: fmtD(cl.first), ic: 'form', b: 'Se registra', s: `${cl.docType} vinculado al clic` }
        ].concat(cl.ops.slice(0, 4).map((o, i) => ({ w: fmtD(o.date), ic: 'swap', b: i ? 'Vuelve a enviar' : 'Primera operación', s: `${o.code} · comisión S/ ${nf(o.commission, 2)}` })));
        if (cl.ops.length > 4) steps.push({ w: 'hoy', ic: 'check', b: `+${cl.ops.length - 4} operaciones`, s: 'Cliente recurrente' });
        return { think: ['Reconstruyendo el recorrido'],
          text: `<b>${esc(cl.name.split(' ').slice(0, 2).join(' '))}</b> llegó por ${camp.name}: <b>${cl.ops.length} operaciones</b> y <span class="hl">${money(cl.revenue, 'S/', 2)}</span> en comisión. Ya pagó ${nf(cl.revenue / camp.cacReal, 1)} veces lo que costó.`,
          title: 'Recorrido de un cliente', tag: 'nombre ficticio',
          viz: `<div class="journey">${steps.map(s => `<div class="jstep"><span class="when">${s.w}</span><span class="dot">${ic(s.ic)}</span><div class="what"><b>${s.b}</b><span>${s.s}</span></div></div>`).join('')}</div>` }; },
      () => ({ think: ['Sumando operaciones por campaña'],
        text: `Las 13 campañas ordenadas por la comisión que dejaron sus clientes.`,
        title: 'Campañas con operaciones reales', tag: 'por cliente',
        viz: `<div class="dt-wrap"><table class="dtable"><thead><tr><th>Campaña</th><th>Canal</th><th class="r">Clientes</th><th class="r">Operaciones</th><th class="r">Comisión</th><th class="r">Identificados</th></tr></thead><tbody>${C.slice().sort((a, b) => b.revenue - a.revenue).map(c => `<tr><td><b>${c.name}</b></td><td>${chName(c.ch)}</td><td class="r">${c.newClients}</td><td class="r">${c.ops}</td><td class="r"><b>${money(c.revenue)}</b></td><td class="r">${c.matched} %</td></tr>`).join('')}</tbody></table></div>` })
    ],
    capital: [
      () => ({ think: ['Leyendo gasto por campaña', 'Sumando comisiones atribuidas'],
        text: `ROAS del año: <b>${nf(T.roas, 2)}x</b>. La mejor, <b>${best.name}</b>, llega a <span class="hl">${nf(best.roas, 2)}x</span>; la peor, ${nf(worst.roas, 2)}x.`,
        title: 'ROAS por campaña', tag: 'comisión ÷ gasto',
        viz: barsH(sorted.map(c => ({ label: c.name, value: c.roas, color: c.roas >= 1 ? '#F59E0B' : '#FCD9A0', right: nf(c.roas, 2) + 'x', t: `<b>${esc(c.name)}</b><br>Gasto ${money(c.spend)} · Comisión ${money(c.revenue)}<br>ROI ${nf(c.roi, 0)} % · CAC ${money(c.cacReal)}` })), { ref: { value: 1, label: 'equilibrio 1x' }, labelW: 210, rowH: 27, aria: 'ROAS por campaña' }) }),
      () => ({ think: ['Agrupando por canal'],
        text: `<b>WhatsApp São Paulo</b> trae el cliente más barato: <span class="hl">${money(byCh.find(x => x.k === 'wa').cac)}</span>.`,
        title: 'CAC por canal', tag: 'gasto ÷ clientes nuevos',
        viz: barsH(byCh.slice().sort((a, b) => a.cac - b.cac).map(x => ({ label: B.CH[x.k].short, value: Math.round(x.cac), color: B.CH[x.k].color, right: money(x.cac), t: `<b>${B.CH[x.k].short}</b><br>${x.clients} clientes · ROAS ${nf(x.roas, 2)}x` })), { labelW: 120, aria: 'CAC por canal' }) +
          `<div class="kstrip" style="grid-template-columns:repeat(3,minmax(0,1fr))">${byCh.map(x => `<div><span>${B.CH[x.k].short}</span><b>${nf(x.roas, 2)}x</b><small>ROAS</small></div>`).join('')}</div>` }),
      () => ({ think: ['Armando cohortes'],
        text: `No. Un cliente recupera su costo (<b>${money(T.cac)}</b>) al <span class="hl">mes ${breakeven + 1}</span>, porque las remesas se repiten.`,
        title: 'Valor acumulado por cliente', tag: 'cohortes 2026',
        viz: legend([{ label: 'Comisión acumulada', color: '#F59E0B', type: 'line' }, { label: 'CAC', color: '#E11D48', type: 'dash' }]) +
          lines(B.COHORT.map(p => `Mes ${p.k + 1}`), [{ label: 'Comisión acumulada', color: '#F59E0B', values: B.COHORT.map(p => p.value), area: true, dots: true }], { refY: { value: T.cac, label: `CAC ${money(T.cac)}`, color: '#E11D48' }, yfmt: v => 'S/ ' + nf(v), aria: 'Valor acumulado por cliente frente al CAC' }) })
    ],
    horizonte: [
      () => { const labels = B.MONTHLY.map(m => m.label).concat(['Nov', 'Dic']); const spend = B.MONTHLY.map(m => Math.round(m.spend)); const rev = B.MONTHLY.map(m => Math.round(m.revenue));
        return { think: ['Leyendo el histórico', 'Aplicando estacionalidad navideña'],
          text: `Invierte <span class="hl">S/ 2,150</span> en diciembre: 55 % WhatsApp São Paulo, 30 % Meta Lima, 15 % prueba en Brasilia. Espero 31–38 clientes nuevos.`,
          title: 'Gasto y comisión con pronóstico', tag: 'nov – dic',
          viz: legend([{ label: 'Gasto', color: '#8B5CF6', type: 'line' }, { label: 'Comisión', color: '#06B6D4', type: 'line' }, { label: 'Pronóstico', color: '#8B5CF6', type: 'dash' }]) +
            lines(labels, [
              { label: 'Gasto', color: '#8B5CF6', values: spend.concat([null, null]) },
              { label: 'Gasto recomendado', color: '#A78BFA', values: Array(9).fill(null).concat([spend[9] * 2.05, 1450, 2150]), dash: true },
              { label: 'Comisión', color: '#06B6D4', values: rev.concat([null, null]) },
              { label: 'Comisión esperada', color: '#22D3EE', values: Array(9).fill(null).concat([rev[9] * 2, 1950, 2600]), dash: true }
            ], { band: { lo: Array(10).fill(null).concat([1250, 1850]), hi: Array(10).fill(null).concat([1650, 2450]), color: 'rgba(139,92,246,.16)' }, shade: { from: 10, label: 'pronóstico' }, yfmt: v => 'S/ ' + nf(v), aria: 'Gasto e ingreso mensual con pronóstico' }) }; },
      () => ({ think: ['Cruzando calendario con ventas'],
        text: 'La fecha más fuerte es <b>Navidad</b>, en ambas rutas.',
        title: 'Próximas fechas clave', tag: 'PE · BR',
        viz: `<div class="dt-wrap"><table class="dtable"><thead><tr><th>Fecha</th><th>Ocasión</th><th>Ruta</th><th class="r">Demanda</th><th>Prioridad</th></tr></thead><tbody>${B.SEASONS.map(s => { const p = parseInt(s.lift.replace(/\D/g, ''), 10); const pr = p >= 80 ? ['bad', 'Alta'] : p >= 30 ? ['warn', 'Media'] : ['info', 'Baja']; return `<tr><td><b>${s.date}</b></td><td>${s.name}</td><td>${s.dir}</td><td class="r"><b>${s.lift}</b></td><td><span class="pillv ${pr[0]}">${pr[1]}</span></td></tr>`; }).join('')}</tbody></table></div>` }),
      () => { const max = Math.max(...B.HEAT.flat());
        return { think: ['Leyendo edad y región de Meta'],
          text: `Sí, como prueba: Brasilia de 25 a 44 años convertiría <span class="hl">6.8–7.4 %</span>. Empieza con S/ 300.`,
          title: 'Conversión estimada', tag: 'región × edad',
          viz: `<div class="dt-wrap"><table class="heat"><thead><tr><th></th>${B.AGES.map(a => `<th>${a}</th>`).join('')}</tr></thead><tbody>${B.REGIONS.map((r, i) => `<tr><th class="rh">${r}${r === 'Brasilia' ? ' <span class="pillv info">nuevo</span>' : ''}</th>${B.HEAT[i].map((v, j) => { const a = v / max; return `<td style="background:rgba(139,92,246,${(.1 + a * .8).toFixed(2)});color:${a > .5 ? '#fff' : 'var(--a-ink-2)'}" data-t="<b>${r} · ${B.AGES[j]}</b><br>${nf(v, 1)} %">${nf(v, 1)}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>` }; }
    ],
    bitacora: [
      () => ({ think: ['Contando cotizaciones', 'Cruzando con depósitos'],
        text: `<b>${quotesQ} cotizaciones</b>, <b>${quotesC} cerradas</b>. Las otras <span class="hl">${quotesQ - quotesC}</span> quedaron guardadas con su motivo.`,
        title: 'Cotizaciones por hora', tag: 'hoy',
        viz: legend([{ label: 'Cotizaciones', color: '#93C5FD' }, { label: 'Cerradas', color: '#1D4ED8' }]) + colsPair(B.QUOTES_HOURLY.map(x => x.h), { label: 'Cotizaciones', color: '#93C5FD', values: B.QUOTES_HOURLY.map(x => x.q) }, { label: 'Cerradas', color: '#1D4ED8', values: B.QUOTES_HOURLY.map(x => x.c) }, { aria: 'Cotizaciones y cierres por hora' }) }),
      () => ({ think: ['Ordenando por probabilidad de cierre'],
        text: 'Estas 5 personas primero.',
        title: 'Seguimiento sugerido', tag: 'nombres ficticios',
        viz: `<div class="dt-wrap"><table class="dtable"><thead><tr><th>Cliente</th><th>Cotización</th><th>Origen</th><th class="r">Puntaje</th><th>Acción</th></tr></thead><tbody>${B.FOLLOW_UP.map(f => `<tr><td><b>${f.name}</b></td><td>${f.quote}</td><td>${f.origin}</td><td class="r"><span class="pillv ${f.score >= 80 ? 'good' : f.score >= 50 ? 'warn' : 'bad'}">${f.score}</span></td><td style="white-space:normal;min-width:170px">${f.action}</td></tr>`).join('')}</tbody></table></div>` }),
      () => ({ think: ['Leyendo mi registro de hoy'],
        text: 'Escrito en la base de Brasper, sin tipeo.',
        title: 'Registros automáticos', tag: 'transaction.transactions',
        viz: `<div class="log">${[
          ['18:24', 'ai', 'Cotización Q-164 · S/ 950 → R$ 1,343 · TikTok'],
          ['18:21', 'ok', 'PxB-001535 creada desde comprobante · verification'],
          ['18:19', '', 'Etiqueta "Seguimiento" → Thiago Martins'],
          ['18:12', 'ai', 'Cotización Q-161 · abandonó en el depósito'],
          ['18:09', 'ok', 'BxP-002062 creada · BCP (PEN) · verification'],
          ['18:02', 'warn', 'Q-158 buscaba préstamo · no se prioriza'],
          ['17:55', 'ok', 'Cliente nuevo · CPF verificado · campaña SP']
        ].map(([t, c, m]) => `<p><span class="t">${t}</span> <span class="${c}">${m}</span></p>`).join('')}</div>` })
    ],
    caudal: [
      () => ({ think: ['Leyendo saldos de las 18:00'],
        text: `Reales: <span class="hl" style="color:var(--a-bad)">R$ 24,900</span>, bajo el límite de R$ 30,000. Alerta roja.`,
        title: 'Saldo en reales', tag: 'hoy, por hora',
        viz: legend([{ label: 'Saldo BRL', color: '#10B981', type: 'line' }, { label: 'Límite inferior', color: '#E11D48', type: 'dash' }]) +
          lines(B.HOURS, [{ label: 'Saldo BRL', color: '#10B981', values: B.LIQ.BRL.series, area: true, dots: true }], { refY: { value: B.LIQ.BRL.lci, label: 'Límite R$ 30 mil', color: '#E11D48' }, badBelow: B.LIQ.BRL.lci, max: 100000, yfmt: v => 'R$ ' + nf(v / 1000) + ' mil', aria: 'Saldo de reales por hora' }) +
          `<div class="kstrip" style="grid-template-columns:repeat(3,minmax(0,1fr))">${['PEN', 'USD', 'BRL'].map(k => { const L = B.LIQ[k], v = L.series[L.series.length - 1], bad = v < L.lci; return `<div><span>${k}</span><b>${L.symbol} ${nf(v)}</b><small class="${bad ? 'down' : 'up'}">${bad ? 'Bajo el límite' : 'En rango'}</small></div>`; }).join('')}</div>` }),
      () => ({ think: ['Proyectando 4 días', 'Pidiendo campaña a Horizonte'],
        text: `Sí: <span class="hl">S/ 320</span> en WhatsApp São Paulo por 3 días repone unos R$ 38,000.`,
        title: 'Con campaña vs. sin campaña', tag: 'proyección',
        viz: legend([{ label: 'Con campaña', color: '#10B981', type: 'line' }, { label: 'Sin campaña', color: '#E11D48', type: 'dash' }]) +
          lines(['Hoy', 'Jue', 'Vie', 'Sáb', 'Lun'], [{ label: 'Con campaña', color: '#10B981', values: [24900, 31800, 44600, 55200, 62800], dots: true }, { label: 'Sin campaña', color: '#E11D48', values: [24900, 18200, 9100, 7400, 6900], dash: true, dots: true }], { refY: { value: 30000, label: 'Límite', color: '#8A92BC' }, max: 80000, yfmt: v => 'R$ ' + nf(v / 1000) + ' mil', aria: 'Proyección de reales con y sin campaña' }) +
          `<div class="answer-card" style="grid-template-columns:auto minmax(0,1fr) auto;align-items:center">${mascot('caudal', 44)}<div><b style="font-family:var(--f-display)">Cambia tus reales a soles</b><div style="font-size:12.5px;color:var(--a-muted)">WhatsApp · São Paulo · 3 días · tasa 0.668</div></div><button class="sug" style="background:var(--grad);color:#fff;border:0;font-weight:700">Aprobar</button></div>` }),
      () => ({ think: ['Leyendo cuentas'],
        text: 'Nubank PJ es la cuenta más baja.',
        title: 'Saldos por banco', tag: '18:00',
        viz: `<div class="dt-wrap"><table class="dtable"><thead><tr><th>Banco</th><th>Moneda</th><th class="r">Saldo</th><th>Estado</th></tr></thead><tbody>${B.BANKS.map(b => { const low = b.cur === 'BRL' && b.bal < 10000; return `<tr><td><b>${b.bank}</b></td><td>${b.cur}</td><td class="r">${{ PEN: 'S/', BRL: 'R$', USD: 'US$' }[b.cur]} ${nf(b.bal)}</td><td><span class="pillv ${low ? 'bad' : 'good'}">${low ? 'Bajo' : 'Normal'}</span></td></tr>`; }).join('')}</tbody></table></div>` })
    ],
    lupa: [
      () => ({ think: ['Clasificando 412 chats'],
        text: `De cada 100 leads, <span class="hl">40</span> buscaban un préstamo y solo <b>8</b> cerraron.`,
        title: 'Por qué no cierran', tag: 'últimos 30 días',
        viz: barsH(B.LEAD_REASONS.map((r, i) => ({ label: r.k, value: r.v, color: ['#EC4899', '#F9A8D4', '#F59E0B', '#10B981', '#A5ABCB'][i], right: r.v + ' %' })), { max: 50, labelW: 220, aria: 'Motivos de no cierre' }) }),
      () => ({ think: ['Midiendo confusión por anuncio'],
        text: `<b>"Dinero rápido a Brasil"</b>: <span class="hl">58 %</span> buscaba un crédito.`,
        title: 'Confusión con préstamos', tag: 'por anuncio',
        viz: barsH(B.AD_CONFUSION.map(a => ({ label: a.ad, value: a.v, color: a.v > 40 ? '#EC4899' : a.v > 15 ? '#F59E0B' : '#10B981', right: a.v + ' %', t: `<b>${esc(a.ad)}</b><br>${esc(a.camp)}` })), { max: 60, labelW: 220, aria: 'Confusión con préstamos por anuncio' }) }),
      () => ({ think: ['Reescribiendo el anuncio'],
        text: 'Habla de <b>familia y tasa</b>, y aclara que no es un préstamo.',
        title: 'Antes y después', tag: 'sugerencia',
        viz: `<div class="cmp"><div class="adcard bad"><span class="lbl" style="color:var(--a-bad)">Hoy · 58 % confusión</span><div class="mock">Dinero rápido a Brasil. Sin trámites.</div></div><div class="adcard"><span class="lbl" style="color:var(--a-ok)">Propuesto · ~12 %</span><div class="mock">Envía a tu familia en Brasil con mejor tasa. Transferencias, no préstamos.</div></div></div>
          <div class="kstrip" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div><span>Confusión</span><b>58 → 12 %</b></div><div><span>Cierre</span><b>8 → 15 %</b></div><div><span>CAC</span><b>S/ 160 → 85</b></div></div>` })
    ]
  };

  /* ---------- Copiloto ---------- */
  const COPILOT = [
    { q: 'Resumen de la semana', who: ['capital', 'rastro', 'caudal', 'lupa'], k: ['resumen', 'semana', 'gerencia'],
      text: () => `<ul><li><b>Capital:</b> ROAS ${nf(T.roas, 2)}x · CAC ${money(T.cac)}.</li><li><b>Rastro:</b> ${T.clients} clientes de campaña identificados.</li><li><b>Caudal:</b> reales en alerta roja.</li><li><b>Lupa:</b> pausar "Dinero rápido a Brasil".</li></ul>` },
    { q: '¿Qué campaña apago y cuál escalo?', who: ['capital', 'lupa', 'horizonte'], k: ['apago', 'escalo', 'pausar', 'apagar'],
      text: () => `Apaga <b>${worst.name}</b> (${nf(worst.roas, 2)}x). Escala <b>${best.name}</b> (${nf(best.roas, 2)}x).`,
      viz: () => barsH([sorted[0], sorted[1], sorted[2], sorted[sorted.length - 2], sorted[sorted.length - 1]].map(c => ({ label: c.name, value: c.roas, color: c.roas >= 1 ? '#F59E0B' : '#EC4899', right: nf(c.roas, 2) + 'x' })), { ref: { value: 1, label: 'equilibrio 1x' }, labelW: 210, aria: 'Mejores y peores campañas' }) },
    { q: '¿Cuánto invierto en diciembre?', who: ['horizonte', 'capital'], route: ['horizonte', 0], k: [] },
    { q: '¿Necesito reales mañana?', who: ['caudal', 'horizonte'], route: ['caudal', 1], k: ['reales', 'liquidez', 'mañana'] }
  ];
  const kpiCells = () => `<div><span>Inversión 2026</span><b>${money(T.spend)}</b><small>13 campañas</small></div>
      <div><span>Comisión atribuida</span><b>${money(T.revenue)}</b><small>sin IGV</small></div>
      <div><span>ROAS</span><b>${nf(T.roas, 2)}x</b><small class="up">sube con la recurrencia</small></div>
      <div><span>CAC</span><b>${money(T.cac)}</b><small>por cliente nuevo</small></div>
      <div><span>Clientes atribuidos</span><b>${T.clients}</b><small>${T.ops} operaciones</small></div>`;

  /* ---------- Vistas ---------- */
  const aurora = '<div class="aurora" aria-hidden="true"><i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="b4"></i><div class="dots"></div><div class="floor"></div></div>';
  function shell(inner) {
    return `<div class="arm">${aurora}
      <div class="arm-top">
        <div class="arm-logo"><img src="logo-160.png" alt=""><b>Brasper <em>ARM</em></b></div>
        <span class="sp"></span>
        <span class="agents-on"><i></i>6 agentes activos</span>
        <button class="back-btn" id="arm-back">${ic('back').replace('<svg', '<svg style="width:14px;height:14px"')}Dashboard</button>
      </div>
      <div class="arm-body">
        <nav class="arm-rail" aria-label="ARM">
          <button class="rail-btn ${S.view === 'home' ? 'on' : ''}" data-view="home">${ic('grid')}Centro de mando</button>
          <div class="grp">Agentes</div>
          ${AG.map(a => `<button class="rail-btn ${S.view === a.id ? 'on' : ''}" data-view="${a.id}">${mascot(a.id, 30)}${a.name}</button>`).join('')}
          <div class="grp">Sistema</div>
          <button class="rail-btn ${S.view === 'arch' ? 'on' : ''}" data-view="arch">${ic('db')}Cómo funciona</button>
        </nav>
        <div class="arm-main" id="arm-main">${inner}</div>
      </div></div>`;
  }

  function homeView() {
    const pos = [[50, 15], [82, 33], [82, 69], [50, 86], [18, 69], [18, 33]];
    return `
      <div class="hello rise"><h2>Tus agentes ya <em>trabajaron hoy</em></h2><p>${T.ops} operaciones · 13 campañas · ${T.clients} clientes atribuidos</p></div>
      <div class="const rise" id="const" style="--d:.08s">
        <canvas class="links" id="const-cv"></canvas>
        <div class="core"><canvas id="core-cv" width="328" height="328"></canvas><div><b>Copiloto</b><small>orquesta a los 6</small></div></div>
        ${AG.map((a, i) => `<button class="anode" data-view="${a.id}" style="left:${pos[i][0]}%;top:${pos[i][1]}%;--ac:${a.color}">
          ${mascot(a.id, 84)}<b>${a.name}</b><span class="role">${a.role}</span>
          <span class="live2"><i></i><span data-live="${a.id}">${a.live[0]}</span></span></button>`).join('')}
      </div>
      <div class="srcs rise" style="--d:.14s">${['Meta Ads', 'WhatsApp', 'TikTok', 'Web Brasper', 'Base com_iathon', 'Bancos', 'RPA'].map(s => `<span><i></i>${s}</span>`).join('')}</div>
      <div class="ask glass rise" style="--d:.2s">
        <div class="ask-row">${ic('spark').replace('<svg', '<svg style="width:20px;height:20px;color:#5468FF;flex:none"')}<input id="cop-in" placeholder="Pregúntale al Copiloto…" aria-label="Pregunta al Copiloto"><button id="cop-go">Preguntar</button></div>
        <div class="sugs">${COPILOT.map((c, i) => `<button class="sug" data-cq="${i}">${c.q}</button>`).join('')}</div>
        <div id="cop-out"></div>
      </div>
      <div class="kstrip rise" style="--d:.26s">${kpiCells()}</div>
      <div class="hello rise" style="--d:.3s"><h2 style="font-size:22px">Hallazgos de hoy</h2></div>
      <div class="finds rise" style="--d:.34s">${[
        ['caudal', 'crit', 'Alerta', 'Reales bajo el límite. Plan listo.'],
        ['lupa', 'warn', 'Revisar', '"Dinero rápido" atrae préstamos: 58 %.'],
        ['capital', 'good', 'Bien', `${best.name}: ROAS ${nf(best.roas, 2)}x.`],
        ['horizonte', 'info', 'Plan', 'Diciembre: S/ 1,850 – 2,450.'],
        ['bitacora', 'info', 'Registro', `${quotesQ - quotesC} cotizaciones sin cierre guardadas.`],
        ['rastro', 'good', 'Origen', `${matchedPct} % de clientes de campaña identificados. Mira el match en vivo.`, 'match']
      ].map(([id, sev, sl, txt, view]) => { const a = byId[id]; return `<button class="find" data-view="${view || id}" style="--ac:${a.color}">${mascot(id, 50)}<div class="who"><b>${a.name}</b><span class="sev ${sev}">${sl}</span></div><p>${txt}</p></button>`; }).join('')}</div>`;
  }

  function agentView(a) {
    return `
      <div class="ag-hero rise" style="--ac:${a.color}">
        ${mascot(a.id, 168, true)}
        <div><div class="ag-role">Agente de ${a.role}</div><h2 class="ag-name">${a.name}</h2><p class="ag-tag">${a.tag}</p>
          <span class="ag-live"><i></i><span data-live="${a.id}">${a.live[0]}</span></span></div>
        <div class="pipe">${a.pipe.map((p, i) => `${i ? '<span class="arr"></span>' : ''}<span class="pstep"><span class="n">${i + 1}</span>${p}</span>`).join('')}</div>
        <div class="chips"><span class="lbl">Lee</span>${a.chips.map(c => `<span class="c">${c}</span>`).join('')}</div>
      </div>
      <div class="work rise" style="--ac:${a.color};--d:.1s">
        <div class="chat">
          <div class="chat-h">${mascot(a.id, 26)}Habla con ${a.name}</div>
          <div class="msgs" id="msgs"></div>
          <div class="chat-sugs" id="chat-sugs">${a.qs.map((q, i) => `<button class="sug${q.view ? ' sug-go' : ''}" data-q="${i}"><span class="ad" style="background:${a.color}"></span>${q.q}${q.view ? ' →' : ''}</button>`).join('')}</div>
          <form class="chat-in" id="chat-form"><input id="chat-in" placeholder="Pregúntale a ${a.name}…" aria-label="Pregunta a ${a.name}"><button type="submit" aria-label="Enviar">${ic('send').replace('<svg', '<svg style="width:15px;height:15px"')}</button></form>
        </div>
        <div class="evid" id="evid"></div>
      </div>`;
  }

  const botMsg = (a, html) => `<div class="msg bot fade-in" style="--ac:${a.color}">${mascot(a.id, 34)}<div class="bub">${html}</div></div>`;
  function renderEvid(a, r) {
    const ev = $('#evid'); if (!ev) return;
    ev.innerHTML = `<div class="evid-h fade-in"><h3>${r.title}</h3><span class="tag2">${r.tag}</span></div><div class="fade-in" style="display:grid;gap:12px">${r.viz}</div>${r.note ? `<div class="note">${r.note}</div>` : ''}`;
    if (r.after) r.after(ev);
  }
  async function ask(a, idx, typed) {
    const msgs = $('#msgs'); if (!msgs) return;
    msgs.insertAdjacentHTML('beforeend', `<div class="msg me fade-in">${esc(typed || a.qs[idx].q)}</div>`);
    if (idx == null) { msgs.insertAdjacentHTML('beforeend', botMsg(a, 'En la demo respondo las preguntas sugeridas.')); msgs.scrollTop = msgs.scrollHeight; return; }
    // Algunas preguntas abren una escena en pantalla completa en vez de responder en el chat
    if (a.qs[idx].view) {
      msgs.insertAdjacentHTML('beforeend', botMsg(a, 'Te muestro cómo uno cada señal con un cliente, paso a paso.'));
      msgs.scrollTop = msgs.scrollHeight;
      await sleep(700); go(a.qs[idx].view); return;
    }
    const r = A[a.id][idx](); const id = 'th' + Date.now();
    msgs.insertAdjacentHTML('beforeend', botMsg(a, `<div class="thinking" id="${id}">${r.think.map(t => `<p>${t}…</p>`).join('')}</div>`));
    msgs.scrollTop = msgs.scrollHeight;
    for (const p of $$(`#${id} p`)) { await sleep(420); p.classList.add('ok'); }
    await sleep(180);
    const th = $('#' + id); if (!th) return;
    th.closest('.bub').innerHTML = r.text;
    msgs.scrollTop = msgs.scrollHeight;
    renderEvid(a, r);
  }
  function route(a, text) { const t = text.toLowerCase(); let bi = null, sc = 0; a.qs.forEach((q, i) => { const s = q.k.filter(k => t.includes(k)).length; if (s > sc) { sc = s; bi = i; } }); return bi; }

  // Match en vivo de Rastro: pantalla completa, sin la barra de agentes, para que entren las tres columnas
  function matchShell() {
    return `<div class="arm arm-full">${aurora}
      <div class="arm-top">
        <div class="arm-logo"><img src="logo-160.png" alt=""><b>Brasper <em>ARM</em></b></div>
        <span class="crumb2">${mascot('rastro', 26)}Rastro · Match en vivo</span>
        <span class="sp"></span>
        <span class="agents-on"><i></i>6 agentes activos</span>
        <button class="back-btn" id="mx-back">${ic('back').replace('<svg', '<svg style="width:14px;height:14px"')}Volver a Rastro</button>
      </div>
      <div class="mx" id="mx"></div></div>`;
  }

  function go(view) { S.view = view; render(); window.scrollTo(0, 0); }
  function render() {
    const el = $('#stage-arm'); const a = byId[S.view];
    if (S.view === 'match') {
      el.innerHTML = matchShell();
      $('#mx-back').onclick = () => go('rastro');
      MATCH.mount($('#mx'), { capital: () => go('capital') });
      return;
    }
    el.innerHTML = shell(S.view === 'home' ? homeView() : S.view === 'arch' ? archView() : agentView(a));
    $$('#stage-arm [data-view]').forEach(b => b.onclick = () => go(b.dataset.view));
    $('#arm-back').onclick = () => APP.go('web');
    if (S.view === 'home') bindHome();
    else if (a) {
      $('#msgs').innerHTML = botMsg(a, a.hello);
      renderEvid(a, A[a.id][0]());
      $$('#chat-sugs .sug').forEach(b => b.onclick = () => ask(a, +b.dataset.q));
      $('#chat-form').onsubmit = e => { e.preventDefault(); const v = $('#chat-in').value.trim(); if (!v) return; $('#chat-in').value = ''; ask(a, route(a, v), v); };
    }
  }
  function bindHome() {
    drawConst();
    $$('.sug[data-cq]').forEach(b => b.onclick = () => copilot(COPILOT[+b.dataset.cq]));
    const goAsk = () => { const raw = $('#cop-in').value.trim(), v = raw.toLowerCase(); if (!v) return; let pick = COPILOT.find(c => c.k.some(k => v.includes(k))); if (!pick) for (const ag of AG) { const i = route(ag, v); if (i != null) { pick = { q: raw, who: [ag.id], route: [ag.id, i] }; break; } } copilot(pick || { q: raw, who: [], text: () => 'En la demo respondo las preguntas sugeridas.' }); $('#cop-in').value = ''; };
    $('#cop-go').onclick = goAsk;
    $('#cop-in').onkeydown = e => { if (e.key === 'Enter') goAsk(); };
  }
  async function copilot(c) {
    const out = $('#cop-out'); const who = c.who.map(id => byId[id]);
    const pills = who.map(x => `<span class="pillv" style="background:${hexA(x.color, .14)};color:${x.dk}">${x.name}</span>`).join('');
    out.innerHTML = `<div class="answer-card fade-in"><b>${esc(c.q)}</b><div style="display:flex;gap:4px">${who.map(x => mascot(x.id, 44, true)).join('')}</div><div class="thinking"><p>Coordinando a ${who.length} agentes…</p></div></div>`;
    await sleep(1000);
    if (c.route) { const [id, i] = c.route; const r = A[id][i]();
      out.innerHTML = `<div class="answer-card fade-in"><div style="display:flex;gap:6px;flex-wrap:wrap">${pills}</div><div style="font-size:14px;line-height:1.55">${r.text}</div><div>${r.viz}</div><button class="sug" data-view="${id}" style="justify-self:start">Abrir a ${byId[id].name} →</button></div>`;
    } else out.innerHTML = `<div class="answer-card fade-in"><div style="display:flex;gap:6px;flex-wrap:wrap">${pills}</div><div style="font-size:14px;line-height:1.55">${c.text()}</div>${c.viz ? `<div>${c.viz()}</div>` : ''}</div>`;
    $$('#cop-out [data-view]').forEach(b => b.onclick = () => go(b.dataset.view));
  }

  // Constelación: enlaces con partículas + órbitas dentro del Copiloto
  let raf = 0;
  function drawConst() {
    const box = $('#const'), cv = $('#const-cv'), core = $('#core-cv'); if (!box || !cv) return;
    cancelAnimationFrame(raf);
    const nodes = $$('.anode', box);
    const parts = Array.from({ length: 42 }, (_, i) => ({ n: i % nodes.length, p: Math.random(), s: .1 + Math.random() * .2, out: Math.random() < .5 }));
    const tick = ts => {
      if (!cv.isConnected) return;
      const t = reduce ? 1 : ts / 1000;
      const r = box.getBoundingClientRect(), dpr = devicePixelRatio || 1;
      if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
      const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, r.width, r.height);
      const cx = r.width / 2, cy = r.height / 2;
      const pts = nodes.map(n => { const b = n.getBoundingClientRect(); return [b.left - r.left + b.width / 2, b.top - r.top + b.height / 2, n.style.getPropertyValue('--ac').trim()]; });
      pts.forEach(([x, y, col]) => { const g = c.createLinearGradient(cx, cy, x, y); g.addColorStop(0, 'rgba(84,104,255,.45)'); g.addColorStop(1, hexA(col, .7)); c.strokeStyle = g; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(x, y); c.stroke(); });
      c.setLineDash([4, 7]); c.strokeStyle = 'rgba(84,104,255,.18)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(cx, cy, r.width * .34, r.height * .36, 0, 0, 7); c.stroke(); c.setLineDash([]);
      parts.forEach(pt => { if (!reduce) pt.p = (pt.p + pt.s * .016) % 1; const [x, y, col] = pts[pt.n]; const k = pt.out ? pt.p : 1 - pt.p; c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 10; c.beginPath(); c.arc(cx + (x - cx) * k, cy + (y - cy) * k, 3, 0, 7); c.fill(); c.shadowBlur = 0; });
      if (core) { const k = core.getContext('2d'), w = core.width; k.clearRect(0, 0, w, w); [0, 1, 2].forEach(i => { const rot = t * .5 + i * 1.05; k.strokeStyle = 'rgba(255,255,255,.45)'; k.lineWidth = 2; k.beginPath(); k.ellipse(w / 2, w / 2, w * .4, w * .14, rot, 0, 7); k.stroke(); const an = t * (1.2 + i * .3) + i * 2, ex = Math.cos(an) * w * .4, ey = Math.sin(an) * w * .14; k.fillStyle = '#fff'; k.beginPath(); k.arc(w / 2 + ex * Math.cos(rot) - ey * Math.sin(rot), w / 2 + ex * Math.sin(rot) + ey * Math.cos(rot), 5, 0, 7); k.fill(); }); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
  setInterval(() => { $$('[data-live]').forEach(el => { const a = byId[el.dataset.live]; if (!a) return; el.textContent = a.live[(a.live.indexOf(el.textContent) + 1) % a.live.length]; }); }, 3200);

  /* ---------- Cómo funciona ---------- */
  function archView() {
    const col = (title, nodes) => `<div class="flow-col"><h4>${title}</h4>${nodes.map(n => `<div class="node ${n[2] ? 'ac' : ''}" style="${n[2] ? `--ac:${n[2]}` : ''}">${n[0]}<small>${n[1]}</small></div>`).join('')}</div>`;
    return `
      <div class="hello rise"><h2>Cómo <em>funciona</em></h2><p>El ARM convierte datos en decisiones. El RPA elimina el tipeo.</p></div>
      <div class="arch rise" style="--d:.1s">
        <h3>Solución 1 · ARM con agentes</h3>
        <div class="flow">
          ${col('Fuentes', [['Meta Ads API', 'gasto, clics, edad, región'], ['WhatsApp', 'referral · ctwa_clid'], ['TikTok', 'reporte + ttclid'], ['Web Brasper', 'UTM · fbclid · calculadora'], ['Bancos', 'saldos por hora']])}
          ${col('Unión por cliente', [['touchpoints', 'campaña, anuncio, click_id'], ['customer_attribution', 'primer y último toque'], ['com_iathon', 'user.user · transactions']])}
          ${col('Agentes', AG.map(a => [a.name, a.role, a.color]))}
          ${col('Gerencia', [['Centro de mando', 'hallazgos del día'], ['Copiloto', 'preguntas libres', '#5468FF'], ['Aprobación humana', 'D.S. 115-2025-PCM']])}
        </div>
        <div class="answer-card"><b style="font-family:var(--f-display)">Cómo se une campaña y cliente</b>
          <div class="dt-wrap"><table class="dtable"><thead><tr><th>Canal</th><th>Qué entrega</th><th>Cómo se une</th></tr></thead><tbody>
            <tr><td><b>Meta</b></td><td>Totales por anuncio + <code>fbclid</code></td><td>Web → registro (DNI/CPF)</td></tr>
            <tr><td><b>WhatsApp</b></td><td><code>ctwa_clid</code> + teléfono</td><td>Hash del teléfono</td></tr>
            <tr><td><b>Formularios Meta</b></td><td>Nombre, teléfono, email</td><td>Hash de email o teléfono</td></tr>
            <tr><td><b>TikTok</b></td><td>Totales + <code>ttclid</code></td><td>Web → registro</td></tr>
            <tr><td><b>Eventos</b></td><td>QR con UTM o cupón</td><td><code>transaction.coupons</code></td></tr>
          </tbody></table></div>
        </div>
        <h3>Solución 2 · RPA de facturación</h3>
        <div class="flow">
          ${col('Origen', [['Dashboard Brasper', 'vista Contabilidad'], ['Sin acceso a la base', 'trabaja sobre la interfaz']])}
          ${col('Agente RPA', [['Lee la fila', 'como el contador'], ['Valida reglas', 'boleta/factura, IGV'], ['Llena y emite', 'campo por campo']])}
          ${col('Emisión', [['KeyFácil', 'Perú → Brasil'], ['Omie', 'Brasil → Perú']])}
          ${col('Control', [['Registra', 'número del comprobante en el dashboard'], ['Excepciones', 'a revisión humana']])}
        </div>
      </div>`;
  }
  function renderArch() {
    $('#stage-arch').innerHTML = `<div class="arm">${aurora}<div class="arm-top"><div class="arm-logo"><img src="logo-160.png" alt=""><b>Brasper <em>IA</em></b></div></div><div class="arm-main" style="max-width:1400px;margin:0 auto;width:100%;padding-left:28px">${archView()}</div></div>`;
  }

  window.ARM = { render, renderArch, go, AG, mascot };
})();
