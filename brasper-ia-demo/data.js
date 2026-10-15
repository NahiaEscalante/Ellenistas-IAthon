/* Data simulada para la demo Brasper (IAthon 2026 · Ellenistas).
   Estructura basada en el diccionario com_iathon (transaction.transactions, user.user,
   transaction.tags, coin.commission, finance.expenses) y en lo conversado en la reunión del 14/10/2026.
   Todos los nombres y documentos son ficticios. */
(function () {
  'use strict';

  // PRNG con semilla para que la demo siempre muestre los mismos números
  let seed = 20261014;
  function rnd() {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const between = (a, b) => a + (b - a) * rnd();
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const r2 = n => Math.round(n * 100) / 100;

  const TODAY = new Date(2026, 9, 14, 18, 30);
  const DAY = 86400000;
  const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  /* ---------- Hoy en Contabilidad (lo que lee el RPA) ----------
     Montos tomados de la captura real del dashboard; clientes y documentos anonimizados. */
  const ACCOUNTING_TODAY = [
    { code: 'BxP-002061', date: '14/10/2026 18:18', op: 'E18236120261014', client: 'Paulo Henrique da Costa', docType: 'CE', doc: '6184205', email: 'paulo.costa@gmail.com', account: 'Yape (PEN)', company: 'Brasper 21 Corretora', send: 411.00, sendCur: 'BRL', receive: 260.00, receiveCur: 'PEN', rate: 0.665, discount: 45, commission: 10.54, tax: 1.90, total: 12.44 },
    { code: 'PxB-001534', date: '14/10/2026 16:33', op: '04061938', client: 'Edwin Ramos Mallma', docType: 'DNI', doc: '45871236', email: 'edwin.ramos@hotmail.com', account: 'Bradesco (BRL)', company: 'INGENITECH S.A.C.', send: 400.00, sendCur: 'PEN', receive: 550.00, receiveCur: 'BRL', rate: 1.485, discount: 45, commission: 7.46, tax: 1.34, total: 8.80 },
    { code: 'BxP-002060', date: '14/10/2026 18:09', op: 'E18189547202610', client: 'Rafael de Souza Lima', docType: 'CPF', doc: '418.227.093-51', email: 'rafa.souzalima@gmail.com', account: 'BCP (PEN)', company: 'Brasper 21 Corretora', send: 419.00, sendCur: 'BRL', receive: 265.00, receiveCur: 'PEN', rate: 0.665, discount: 45, commission: 10.74, tax: 1.93, total: 12.68 },
    { code: 'PxB-001533', date: '14/10/2026 16:19', op: '0917357', client: 'Karina López Fiestas', docType: 'DNI', doc: '76735214', email: 'karina.lopezf@gmail.com', account: 'Banco do Brasil (BRL)', company: 'BRASPER 21 S.A.C.', send: 100.00, sendCur: 'PEN', receive: 136.00, receiveCur: 'BRL', rate: 1.43, discount: 40, commission: 2.54, tax: 0.46, total: 3.00 },
    { code: 'PxB-001529', date: '14/10/2026 15:52', op: '0884410', client: 'Rosa Quispe Mamani', docType: 'DNI', doc: '42190375', email: 'rosa.quispe@yahoo.com', account: 'Itaú (BRL)', company: 'BRASPER 21 S.A.C.', send: 250.00, sendCur: 'PEN', receive: 342.50, receiveCur: 'BRL', rate: 1.37, discount: 45, commission: 5.08, tax: 0.91, total: 14.14 },
    { code: 'BxP-002059', date: '14/10/2026 17:12', op: 'E16501555202610', client: 'Mariela Pérez Díaz', docType: 'CPF', doc: '701.334.582-10', email: 'mariela.pd@gmail.com', account: 'Yape (PEN)', company: 'Brasper 21 Corretora', send: 949.00, sendCur: 'BRL', receive: 600.00, receiveCur: 'PEN', rate: 0.665, discount: 45, commission: 19.91, tax: 3.58, total: 23.49 },
    { code: 'PxB-001531', date: '14/10/2026 16:18', op: '0635485', client: 'Débora Chipana Huerta', docType: 'DNI', doc: '49042871', email: 'debora.chipana@gmail.com', account: 'Nubank (BRL)', company: 'BRASPER 21 S.A.C.', send: 1080.00, sendCur: 'PEN', receive: 1500.00, receiveCur: 'BRL', rate: 1.485, discount: 50, commission: 13.73, tax: 2.47, total: 16.20 },
    { code: 'PxB-001532', date: '14/10/2026 16:18', op: '17788291', client: 'Jorge Vela Lozano', docType: 'DNI', doc: '42219087', email: 'jorge.vela@outlook.com', account: 'Banco do Brasil (BRL)', company: 'INGENITECH S.A.C.', send: 146.00, sendCur: 'PEN', receive: 200.00, receiveCur: 'BRL', rate: 1.40, discount: 40, commission: 3.71, tax: 0.67, total: 4.38 },
    { code: 'BxP-002058', date: '14/10/2026 16:48', op: 'E16501555202609', client: 'Mariela Pérez Díaz', docType: 'CPF', doc: '701.334.582-10', email: 'mariela.pd@gmail.com', account: 'Interbank (PEN)', company: 'Brasper 21 Corretora', send: 490.00, sendCur: 'BRL', receive: 310.00, receiveCur: 'PEN', rate: 0.658, discount: 45, commission: 12.56, tax: 2.26, total: 14.82 },
    { code: 'PxB-001530', date: '14/10/2026 16:05', op: '08081769', client: 'Johnny Williams Delgado', docType: 'DNI', doc: '43837105', email: 'jwilliams.d@gmail.com', account: 'Nubank (BRL)', company: 'INGENITECH S.A.C.', send: 300.00, sendCur: 'PEN', receive: 413.00, receiveCur: 'BRL', rate: 1.42, discount: 45, commission: 6.99, tax: 1.26, total: 8.25 },
    { code: 'BxP-002057', date: '14/10/2026 15:40', op: 'E18236120261013', client: 'León Tobías Herrera', docType: 'CPF', doc: '063.906.867-73', email: 'leon.tobias@gmail.com', account: 'Yape (PEN)', company: 'Brasper 21 Corretora', send: 410.00, sendCur: 'BRL', receive: 250.00, receiveCur: 'PEN', rate: 0.658, discount: 45, commission: 10.51, tax: 1.89, total: 12.40 }
  ];
  // Etiquetas comerciales reales del dashboard (transaction.tags)
  const TAGS = ['Cliente nuevo general', 'Cliente nuevo Referido', 'Campaña 22/08/2026', 'Seguimiento', 'VIP', 'Cliente Nuevo Formulario'];

  /* ---------- Campañas 2026 ---------- */
  const CH = {
    meta: { key: 'meta', label: 'Meta (Facebook / Instagram)', short: 'Meta Ads', color: '#4C7DFF' },
    wa: { key: 'wa', label: 'WhatsApp (Click-to-WhatsApp)', short: 'WhatsApp', color: '#5FA80F' },
    tiktok: { key: 'tiktok', label: 'TikTok Ads', short: 'TikTok', color: '#E8559F' },
    events: { key: 'events', label: 'Eventos y comunidad brasileña', short: 'Eventos', color: '#C98200' },
    referral: { key: 'referral', label: 'Referidos', short: 'Referidos', color: '#9B6BF5' },
    organic: { key: 'organic', label: 'Web orgánica y grupos de Facebook', short: 'Orgánico', color: '#0B97B3' }
  };

  const d = (m, day) => new Date(2026, m - 1, day);
  const CAMPAIGNS = [
    { id: 'C01', name: 'Año Nuevo · Envía a Brasil', ch: 'meta', place: 'Feed + Stories', dir: 'PxB', geo: 'Lima', start: d(1, 5), end: d(1, 25), spend: 520, cac: 92, freq: .5, ticket: 640, churn: .1, trigger: 'Estacional', close: .07 },
    { id: 'C02', name: 'Siempre activa · Remesas SP', ch: 'wa', place: 'Click-to-WhatsApp', dir: 'BxP', geo: 'São Paulo', start: d(1, 2), end: d(10, 14), spend: 2600, cac: 68, freq: .8, ticket: 520, churn: .07, trigger: 'Siempre activa', close: .08 },
    { id: 'C03', name: 'Carnaval · Envía a Brasil', ch: 'meta', place: 'Reels', dir: 'PxB', geo: 'Lima', start: d(2, 2), end: d(2, 18), spend: 560, cac: 96, freq: .45, ticket: 620, churn: .12, trigger: 'Estacional', close: .06 },
    { id: 'C04', name: 'Alerta reales · BRL→PEN', ch: 'wa', place: 'Click-to-WhatsApp', dir: 'BxP', geo: 'São Paulo', start: d(3, 9), end: d(3, 15), spend: 380, cac: 58, freq: .72, ticket: 540, churn: .09, trigger: 'Liquidez', close: .1 },
    { id: 'C05', name: 'Semana Santa · Familia', ch: 'meta', place: 'Feed', dir: 'PxB', geo: 'Lima', start: d(3, 28), end: d(4, 6), spend: 480, cac: 104, freq: .42, ticket: 560, churn: .13, trigger: 'Estacional', close: .06 },
    { id: 'C06', name: 'Día de la Madre', ch: 'meta', place: 'Feed + Stories', dir: 'PxB', geo: 'Lima y São Paulo', start: d(5, 1), end: d(5, 10), spend: 640, cac: 98, freq: .45, ticket: 580, churn: .13, trigger: 'Estacional', close: .07 },
    { id: 'C07', name: 'Festa Junina', ch: 'meta', place: 'Reels', dir: 'BxP', geo: 'São Paulo', start: d(6, 5), end: d(6, 24), spend: 820, cac: 86, freq: .6, ticket: 500, churn: .1, trigger: 'Estacional', close: .07 },
    { id: 'C08', name: 'Fiestas Patrias · 28 de julio', ch: 'wa', place: 'Click-to-WhatsApp', dir: 'BxP', geo: 'São Paulo', start: d(7, 10), end: d(7, 28), spend: 1000, cac: 56, freq: .85, ticket: 640, churn: .06, trigger: 'Estacional', close: .1 },
    { id: 'C09', name: 'Campaña 22/08/2026', ch: 'wa', place: 'Click-to-WhatsApp', dir: 'BxP', geo: 'São Paulo', start: d(8, 22), end: d(8, 31), spend: 520, cac: 74, freq: .65, ticket: 480, churn: .09, trigger: 'Liquidez', close: .08 },
    { id: 'C10', name: 'Formulario cliente nuevo', ch: 'meta', place: 'Lead Ads (formulario)', dir: 'PxB', geo: 'Lima', start: d(8, 15), end: d(9, 15), spend: 480, cac: 160, freq: .35, ticket: 420, churn: .2, trigger: 'Captación', close: .035 },
    { id: 'C11', name: '7 de Setembro · Independência', ch: 'meta', place: 'Reels + Stories', dir: 'PxB', geo: 'Lima', start: d(8, 28), end: d(9, 8), spend: 950, cac: 84, freq: .55, ticket: 720, churn: .11, trigger: 'Estacional', close: .08 },
    { id: 'C12', name: 'TikTok · Envía en minutos', ch: 'tiktok', place: 'For You', dir: 'PxB', geo: 'Lima', start: d(9, 15), end: d(10, 10), spend: 500, cac: 210, freq: .3, ticket: 380, churn: .25, trigger: 'Prueba', close: .03 },
    { id: 'C13', name: 'Alerta soles · PEN→BRL', ch: 'meta', place: 'Feed', dir: 'PxB', geo: 'Lima', start: d(10, 6), end: d(10, 12), spend: 380, cac: 84, freq: .45, ticket: 660, churn: .12, trigger: 'Liquidez', close: .07 }
  ];

  const PE_FIRST = ['Lucía', 'Carlos', 'María Fernanda', 'José Luis', 'Rosa', 'Miguel', 'Ana Sofía', 'Jorge', 'Patricia', 'Luis Alberto', 'Carmen', 'Diego', 'Milagros', 'Renato', 'Gabriela', 'Óscar', 'Yesenia', 'Juan Carlos', 'Rocío', 'Kevin'];
  const PE_LAST = ['Quispe', 'Huamán', 'Paredes', 'Rojas', 'Mamani', 'Flores', 'Chávez', 'Torres', 'Ramírez', 'Vargas', 'Castillo', 'Mendoza', 'Salazar', 'Gutiérrez', 'Córdova', 'Espinoza', 'Ccori', 'Villanueva'];
  const BR_FIRST = ['Ana Clara', 'João Pedro', 'Mariana', 'Lucas', 'Beatriz', 'Gabriel', 'Larissa', 'Rafael', 'Camila', 'Thiago', 'Fernanda', 'Mateus', 'Juliana', 'Felipe', 'Letícia', 'Bruno'];
  const BR_LAST = ['Souza', 'Oliveira', 'Santos', 'Almeida', 'Ferreira', 'Costa', 'Ribeiro', 'Carvalho', 'Gomes', 'Martins', 'Araújo', 'Barbosa', 'Rocha', 'Lima'];
  const MATCH_BY_CH = { meta: ['fbclid + registro', 'fbclid + registro', 'Hash de email (CAPI)'], wa: ['ctwa_clid + teléfono', 'ctwa_clid + teléfono', 'Hash de teléfono'], tiktok: ['ttclid + registro', 'Hash de teléfono'] };

  let codePxB = 1200, codeBxP = 1640;
  const CLIENTS = [];
  CAMPAIGNS.forEach(c => {
    const n = Math.max(2, Math.round(c.spend / c.cac));
    c.clients = [];
    for (let i = 0; i < n; i++) {
      // Quien envía PxB suele ser brasileño en Lima; quien envía BxP, peruano en São Paulo
      const brasileno = c.dir === 'PxB' ? rnd() < .7 : rnd() < .25;
      const name = brasileno ? `${pick(BR_FIRST)} ${pick(BR_LAST)} ${pick(BR_LAST)}` : `${pick(PE_FIRST)} ${pick(PE_LAST)} ${pick(PE_LAST)}`;
      const age = Math.round(between(21, 58));
      const span = Math.max(1, (Math.min(c.end, TODAY) - c.start) / DAY);
      const first = new Date(c.start.getTime() + rnd() * span * DAY + between(0, 4) * DAY);
      if (first > TODAY) first.setTime(TODAY.getTime() - DAY);
      const cl = {
        id: 'U' + String(CLIENTS.length + 1).padStart(4, '0'), name,
        docType: brasileno ? (c.dir === 'PxB' ? 'CE' : 'CPF') : 'DNI',
        city: c.geo.includes('São') ? 'São Paulo' : (c.geo.includes('y') ? pick(['Lima', 'São Paulo']) : 'Lima'),
        age, gender: rnd() < .52 ? 'F' : 'M', campaign: c.id, ch: c.ch,
        match: pick(MATCH_BY_CH[c.ch]), device: rnd() < .86 ? 'Móvil' : 'Escritorio',
        first, ops: []
      };
      // Operaciones: la primera al registrarse, luego recurrencia mensual con abandono
      let t = first.getTime(), alive = true, k = 0;
      while (t <= TODAY.getTime() && alive) {
        if (k === 0 || rnd() < c.freq) {
          const amt = c.ticket * between(.45, 1.75);
          const pct = c.dir === 'PxB' ? between(.038, .052) : between(.035, .05);
          const isP = c.dir === 'PxB';
          cl.ops.push({
            code: isP ? 'PxB-00' + (codePxB++) : 'BxP-00' + (codeBxP++),
            date: new Date(t), dir: c.dir,
            origin: r2(isP ? amt : amt / 0.662), originCur: isP ? 'PEN' : 'BRL',
            commission: r2(amt * pct)
          });
        }
        k++;
        t += between(24, 36) * DAY;
        if (k > 0 && rnd() < c.churn) alive = false;
      }
      cl.revenue = r2(cl.ops.reduce((s, o) => s + o.commission, 0));
      cl.sent = r2(cl.ops.reduce((s, o) => s + (o.originCur === 'PEN' ? o.origin : o.origin * 0.662), 0));
      c.clients.push(cl);
      CLIENTS.push(cl);
    }
    // Embudo de la plataforma (agregado, como lo entrega la API de Meta / TikTok)
    c.newClients = c.clients.length;
    c.leads = Math.round(c.newClients / c.close);
    c.clicks = Math.round(c.leads / between(.09, .14));
    c.impressions = Math.round(c.clicks / between(.009, .015));
    c.reach = Math.round(c.impressions / between(1.6, 2.3));
    c.cpm = r2(c.spend / c.impressions * 1000);
    c.cpc = r2(c.spend / c.clicks);
    c.ctr = r2(c.clicks / c.impressions * 100);
    c.registrations = Math.round(c.newClients * between(1.6, 2.4));
    c.ops = c.clients.reduce((s, x) => s + x.ops.length, 0);
    c.revenue = r2(c.clients.reduce((s, x) => s + x.revenue, 0));
    c.sent = r2(c.clients.reduce((s, x) => s + x.sent, 0));
    c.roas = r2(c.revenue / c.spend);
    c.roi = r2((c.revenue - c.spend) / c.spend * 100);
    c.cacReal = r2(c.spend / c.newClients);
    c.matched = Math.round(between(.82, .95) * 100);
  });

  /* ---------- Series mensuales ---------- */
  function spendInMonth(c, m) {
    const ms = new Date(2026, m, 1), me = new Date(2026, m + 1, 1);
    const end = new Date(Math.min(c.end.getTime() + DAY, TODAY.getTime()));
    const total = (end - c.start) / DAY;
    const a = Math.max(ms, c.start), b = Math.min(me, end);
    return b > a ? c.spend * ((b - a) / DAY) / total : 0;
  }
  const MONTHLY = [];
  for (let m = 0; m < 10; m++) {
    const spend = CAMPAIGNS.reduce((s, c) => s + spendInMonth(c, m), 0);
    const revenue = CLIENTS.reduce((s, cl) => s + cl.ops.filter(o => o.date.getMonth() === m).reduce((a, o) => a + o.commission, 0), 0);
    const byCh = {};
    Object.keys(CH).forEach(k => (byCh[k] = 0));
    CLIENTS.forEach(cl => { if (cl.first.getMonth() === m) byCh[cl.ch]++; });
    // Clientes nuevos que no vienen de campañas (la mayoría, según Jesús)
    const season = [1, 1.1, .95, .9, 1.05, 1.15, 1.3, 1, 1.25, .55][m];
    byCh.events = Math.round(between(30, 38) * season);
    byCh.referral = Math.round(between(17, 23) * season);
    byCh.organic = Math.round(between(9, 14) * season);
    MONTHLY.push({ m, label: MONTHS[m], spend: r2(spend), revenue: r2(revenue), byCh });
  }

  /* ---------- Curva de valor por cliente (cohorte) ---------- */
  const COHORT = [];
  for (let k = 0; k <= 8; k++) {
    const eligible = CLIENTS.filter(cl => (TODAY - cl.first) / DAY >= k * 30);
    const val = eligible.reduce((s, cl) => s + cl.ops.filter(o => (o.date - cl.first) / DAY < (k + 1) * 30).reduce((a, o) => a + o.commission, 0), 0);
    COHORT.push({ k, value: eligible.length ? r2(val / eligible.length) : null, n: eligible.length });
  }

  /* ---------- Liquidez de hoy (reemplaza el Excel horario) ---------- */
  const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const LIQ = {
    BRL: { lci: 30000, lcs: 95000, series: [71800, 66400, 61900, 55200, 49800, 44100, 37600, 33900, 28700, 26400, 24900], symbol: 'R$' },
    PEN: { lci: 50000, lcs: 160000, series: [96400, 101200, 108900, 104300, 112800, 118400, 121600, 127900, 131200, 134800, 138500], symbol: 'S/' },
    USD: { lci: 8000, lcs: 30000, series: [14200, 14200, 13900, 13900, 13600, 13600, 13100, 13100, 12800, 12800, 12800], symbol: 'US$' }
  };
  const BANKS = [
    { bank: 'BCP Empresas', cur: 'PEN', bal: 61200 }, { bank: 'BBVA Corporativo', cur: 'PEN', bal: 42800 },
    { bank: 'Interbank', cur: 'PEN', bal: 34500 }, { bank: 'BBVA Corporativo', cur: 'USD', bal: 12800 },
    { bank: 'Itaú', cur: 'BRL', bal: 11300 }, { bank: 'Banco do Brasil', cur: 'BRL', bal: 8900 }, { bank: 'Nubank PJ', cur: 'BRL', bal: 4700 }
  ];

  /* ---------- Cotizaciones de hoy (Agente de Registro) ---------- */
  const QUOTES_HOURLY = [
    { h: '08', q: 6, c: 3 }, { h: '09', q: 11, c: 6 }, { h: '10', q: 17, c: 8 }, { h: '11', q: 19, c: 9 }, { h: '12', q: 14, c: 6 },
    { h: '13', q: 12, c: 5 }, { h: '14', q: 15, c: 7 }, { h: '15', q: 18, c: 8 }, { h: '16', q: 20, c: 9 }, { h: '17', q: 16, c: 6 }, { h: '18', q: 16, c: 4 }
  ];
  const FOLLOW_UP = [
    { name: 'Thiago Martins Rocha', quote: 'R$ 1.250 → S/', origin: 'WhatsApp · Siempre activa SP', step: 'Cotizó 3 veces, no depositó', score: 91, action: 'Ofrecer tasa preferente de cliente frecuente' },
    { name: 'Milagros Salazar Ccori', quote: 'S/ 2.400 → R$', origin: 'Meta · Alerta soles', step: 'Registró cuenta destino', score: 86, action: 'Recordar que la tasa vence a las 19:00' },
    { name: 'Larissa Gomes Lima', quote: 'R$ 680 → S/', origin: 'Referido', step: 'Abandonó en el depósito', score: 78, action: 'Enviar guía de depósito PIX' },
    { name: 'Renato Vargas Torres', quote: 'S/ 950 → R$', origin: 'TikTok · Envía en minutos', step: 'Preguntó por préstamo', score: 22, action: 'No priorizar: buscaba un crédito' },
    { name: 'Fernanda Araújo Costa', quote: 'R$ 3.100 → S/', origin: 'Eventos · Embajada', step: 'Cotizó y comparó tasa', score: 74, action: 'Llamar: monto alto, cliente de evento' }
  ];

  /* ---------- Calidad de leads ---------- */
  const LEAD_REASONS = [
    { k: 'Pensó que era un préstamo', v: 40 }, { k: 'Solo hizo clic, sin respuesta', v: 24 },
    { k: 'No aceptó la tasa', v: 20 }, { k: 'Cerró operación', v: 8 }, { k: 'Otros (horario, documentos)', v: 8 }
  ];
  const AD_CONFUSION = [
    { ad: '"Dinero rápido a Brasil"', camp: 'Formulario cliente nuevo', v: 58 },
    { ad: '"Sin trámites ni bancos"', camp: 'TikTok · Envía en minutos', v: 49 },
    { ad: '"Envía a tu familia hoy"', camp: 'Día de la Madre', v: 22 },
    { ad: '"Tasa preferente Perú–Brasil"', camp: '7 de Setembro', v: 12 },
    { ad: '"Cambia tus reales a soles"', camp: 'Fiestas Patrias · 28 de julio', v: 9 }
  ];

  /* ---------- Forecast y calendario ---------- */
  const SEASONS = [
    { date: '31 oct', name: 'Día de la Canción Criolla', where: 'PE', lift: '+10 %', dir: 'BxP' },
    { date: '27 nov', name: 'Black Friday', where: 'PE · BR', lift: '+35 %', dir: 'Ambos' },
    { date: '25 dic', name: 'Navidad', where: 'PE · BR', lift: '+120 %', dir: 'Ambos' },
    { date: '1 ene', name: 'Año Nuevo', where: 'PE · BR', lift: '+40 %', dir: 'PxB' },
    { date: '9 feb', name: 'Carnaval', where: 'BR', lift: '+25 %', dir: 'PxB' },
    { date: '28 jul', name: 'Fiestas Patrias', where: 'PE', lift: '+80 %', dir: 'BxP' }
  ];
  const REGIONS = ['São Paulo', 'Lima', 'Rio de Janeiro', 'Brasilia', 'Arequipa', 'Curitiba'];
  const AGES = ['18–24', '25–34', '35–44', '45–54', '55+'];
  const HEAT = [
    [4.1, 9.8, 11.2, 8.4, 5.1],
    [3.2, 7.9, 8.8, 6.9, 4.4],
    [2.1, 5.6, 6.3, 4.8, 2.9],
    [2.6, 6.8, 7.4, 5.2, 3.0],
    [1.4, 3.9, 4.6, 3.7, 2.2],
    [1.1, 3.2, 3.8, 2.9, 1.6]
  ];

  /* ---------- Comisión operativa por tramos (coin.commission, simulada) ---------- */
  const COMMISSION_TIERS = {
    PxB: [{ max: 200, pct: 6.5 }, { max: 500, pct: 5.2 }, { max: 1500, pct: 4.4 }, { max: Infinity, pct: 3.6 }],
    BxP: [{ max: 300, pct: 6.0 }, { max: 800, pct: 4.9 }, { max: 2000, pct: 4.1 }, { max: Infinity, pct: 3.4 }]
  };
  const RATES = { PxB: 1.485, BxP: 0.665 };

  const totals = {
    spend: r2(CAMPAIGNS.reduce((s, c) => s + c.spend, 0)),
    revenue: r2(CAMPAIGNS.reduce((s, c) => s + c.revenue, 0)),
    clients: CLIENTS.length,
    ops: CLIENTS.reduce((s, c) => s + c.ops.length, 0),
    sent: r2(CLIENTS.reduce((s, c) => s + c.sent, 0))
  };
  totals.roas = r2(totals.revenue / totals.spend);
  totals.roi = r2((totals.revenue - totals.spend) / totals.spend * 100);
  totals.cac = r2(totals.spend / totals.clients);

  window.BD = {
    TODAY, MONTHS, ACCOUNTING_TODAY, TAGS, CH, CAMPAIGNS, CLIENTS, MONTHLY, COHORT,
    HOURS, LIQ, BANKS, QUOTES_HOURLY, FOLLOW_UP, LEAD_REASONS, AD_CONFUSION,
    SEASONS, REGIONS, AGES, HEAT, COMMISSION_TIERS, RATES, totals, rnd
  };
})();
