/* Genera el pitch de Brasper IA (IAthon 2026 · Ellenistas) como PowerPoint.
   Uso: npm run generar   →   escribe Brasper-IA-Pitch.pptx
   Las capturas y mascotas de assets/ salen de `npm run capturas`. */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const pptxgen = require('pptxgenjs');
const JSZip = require(require.resolve('jszip', { paths: [require.resolve('pptxgenjs')] }));

const ASSETS = path.join(__dirname, 'assets');
const DEMO = path.join(__dirname, '..', 'brasper-ia-demo');
const SALIDA = path.join(__dirname, 'Brasper-IA-Pitch.pptx');

/* ---------- Tema: colores de la marca Brasper ---------- */
const THEME = {
  name: 'Brasper IA',
  headFontFace: 'Arial',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '0B1233', lt1: 'FFFFFF', dk2: '4A5275', lt2: 'DCE3FF',
    accent1: '4A52D8', // índigo Brasper
    accent2: '0BB5D6', // cian Brasper
    accent3: 'F59E0B', // ámbar (Capital)
    accent4: '10B981', // verde (Caudal, lo que funciona)
    accent5: 'E23670', // frambuesa (lo manual, lo que duele)
    accent6: '8B5CF6', // violeta (Horizonte)
    hlink: '3446C4', folHlink: '6D28D9'
  }
};
const C = {
  text1: 'tx1', text2: 'tx2', background1: 'bg1', background2: 'bg2',
  accent1: 'accent1', accent2: 'accent2', accent3: 'accent3', accent4: 'accent4', accent5: 'accent5', accent6: 'accent6'
};
const HEX = THEME.colors;
const HEAD = '+mj-lt'; // fuente de títulos del tema

/* ---------- Íconos (los mismos trazos 24×24 de la demo) ---------- */
const P = {
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 15V9a4 4 0 0 1 4-4h2M18 9v6a4 4 0 0 1-4 4h-2',
  bot: 'M12 2v3M5 8h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zM9 13v1M15 13v1M9 17h6',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  check: 'M20 6L9 17l-5-5',
  file: 'M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7zM14 3v4h4M9 13h6M9 17h6',
  receipt: 'M5 3v18l2.5-1.5L10 21l2-1.5 2 1.5 2.5-1.5L19 21V3l-2.5 1.5L14 3l-2 1.5L10 3 7.5 4.5zM9 9h6M9 13h6',
  users: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M22 19v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  clip: 'M9 3h6v3H9zM8 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2M9 12h6M9 16h4',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5zM20 17v4H6.5A2.5 2.5 0 0 1 4 18.5M8 7h8M8 11h6',
  drop: 'M12 2.7l5.7 5.6a8 8 0 1 1-11.4 0zM8 14a4 4 0 0 0 4 4',
  lens: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-6-6M7 10l2 2 4-4',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
  msg: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  form: 'M4 4h16v16H4zM8 9h8M8 13h8M8 17h4',
  pdf: 'M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7zM14 3v4h4M9 15h1.5a1.5 1.5 0 0 0 0-3H9v5M14 12v5',
  swap: 'M7 7h13l-3-3M17 17H4l3 3',
  card: 'M3 6h18v12H3zM3 10h18',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 3v4M17 5h4M5 17v4M3 19h4',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
  keyboard: 'M2 6h20v12H2zM6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10',
  alert: 'M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
  trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  monitor: 'M3 4h18v12H3zM8 20h8M12 16v4',
  megaphone: 'M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1zM16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14'
};
// Degradados de las fichas de íconos
const G = {
  marca: ['00D3F2', '4A52D8'],
  dolor: ['FF7A9A', 'D61F5F'],
  ok: ['34D399', '059669'],
  arm: ['5468FF', 'A855F7']
};

/* ---------- Imágenes generadas ---------- */
const b64 = (buf, mime) => `${mime};base64,${buf.toString('base64')}`;
const cacheFichas = {};
async function ficha(icono, grad = G.marca) {
  const k = icono + grad.join('');
  if (!cacheFichas[k]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${grad[0]}"/><stop offset="1" stop-color="#${grad[1]}"/></linearGradient></defs><rect width="256" height="256" rx="68" fill="url(#g)"/><g transform="translate(56 56) scale(6)" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${P[icono]}"/></g></svg>`;
    cacheFichas[k] = b64(await sharp(Buffer.from(svg)).png().toBuffer(), 'image/png');
  }
  return cacheFichas[k];
}
async function fondoOscuro(espejo) {
  const [a, b] = espejo ? [['0.88', '0.1'], ['0.08', '0.95']] : [['0.12', '0.08'], ['0.92', '0.95']];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><defs>
    <radialGradient id="a" cx="${a[0]}" cy="${a[1]}" r="0.6"><stop offset="0" stop-color="#00D3F2" stop-opacity="0.30"/><stop offset="1" stop-color="#00D3F2" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="${b[0]}" cy="${b[1]}" r="0.7"><stop offset="0" stop-color="#4A52D8" stop-opacity="0.62"/><stop offset="1" stop-color="#4A52D8" stop-opacity="0"/></radialGradient>
    <radialGradient id="c" cx="0.7" cy="0.25" r="0.45"><stop offset="0" stop-color="#A855F7" stop-opacity="0.20"/><stop offset="1" stop-color="#A855F7" stop-opacity="0"/></radialGradient>
    <pattern id="d" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#FFFFFF" fill-opacity="0.07"/></pattern></defs>
    <rect width="1920" height="1080" fill="#0B1233"/><rect width="1920" height="1080" fill="url(#a)"/><rect width="1920" height="1080" fill="url(#b)"/><rect width="1920" height="1080" fill="url(#c)"/><rect width="1920" height="1080" fill="url(#d)"/></svg>`;
  return b64(await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toBuffer(), 'image/jpeg');
}
const archivo = (f, mime) => b64(fs.readFileSync(f), mime);
const captura = f => archivo(path.join(ASSETS, f + '.jpg'), 'image/jpeg');
const mascota = id => archivo(path.join(ASSETS, `mascota-${id}.png`), 'image/png');
// Recorte de una captura (coordenadas en píxeles de la imagen de 2880 × 1620)
async function recorte(f, left, top, width, height) {
  const buf = await sharp(path.join(ASSETS, f + '.jpg')).extract({ left, top, width, height }).jpeg({ quality: 88 }).toBuffer();
  return { data: b64(buf, 'image/jpeg'), ratio: width / height };
}

/* ---------- Presentación ---------- */
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 × 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'Brasper IA · Pitch IAthon 2026';
pres.author = 'Equipo Ellenistas';
pres.company = 'Ellenistas';
pres.subject = 'RPA de facturación y ARM con agentes IA para Brasper';

const W = 13.333, M = 0.6, CW = W - 2 * M;
const sombra = () => ({ type: 'outer', color: HEX.dk1, opacity: 0.12, blur: 10, offset: 2, angle: 90 });
const bordeSuave = () => ({ color: C.text2, transparency: 82, width: 0.75 });

function texto(s, t, o) { s.addText(t, Object.assign({ isTextBox: true, margin: 0, fontSize: 14, color: C.text1, valign: 'top' }, o)); }
function tarjeta(s, x, y, w, h, o = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: o.r != null ? o.r : 0.14,
    fill: o.fill || { color: C.background1 },
    line: o.line || (o.fill ? { type: 'none' } : bordeSuave()),
    shadow: o.sinSombra || o.fill ? undefined : sombra(),
    objectName: o.name
  });
}
const tinte = (color, transparency = 91) => ({ color, transparency });
function numero(s, n, x, y, d, o = {}) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: o.fill || C.accent1 }, line: o.borde ? { color: C.background1, width: 2 } : { type: 'none' }, objectName: o.name || `Número ${n}` });
  texto(s, String(n), { x, y, w: d, h: d, align: 'center', valign: 'middle', bold: true, fontSize: o.fontSize || Math.round(d * 32), color: o.color || C.background1, fontFace: HEAD });
}
function flecha(s, x1, y1, x2, y2, o = {}) {
  s.addShape(pres.shapes.LINE, { x: x1, y: y1, w: x2 - x1, h: y2 - y1, line: { color: o.color || C.text2, width: o.width || 1.75, transparency: o.transparency || 0, dashType: o.dash ? 'dash' : 'solid', endArrowType: o.sinPunta ? undefined : 'triangle' }, objectName: o.name });
}
async function icono(s, nombre, grad, x, y, d) { s.addImage({ data: await ficha(nombre, grad), x, y, w: d, h: d, altText: '', objectName: `Ícono ${nombre}` }); }
function imagenConMarco(s, data, x, y, w, h, nombre) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.background1 }, line: bordeSuave(), shadow: sombra(), objectName: `Marco ${nombre}` });
  s.addImage({ data, x, y, w, h, altText: nombre, objectName: nombre });
}
function etiqueta(s, t, x, y, w, o = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.36, rectRadius: 0.18, fill: o.fill || tinte(C.accent1, 86), line: { type: 'none' }, objectName: `Etiqueta ${t}` });
  texto(s, t, { x, y, w, h: 0.36, align: 'center', valign: 'middle', fontSize: 12, bold: true, color: o.color || C.text1, charSpacing: 1 });
}

const AGENTES = [
  { id: 'rastro', nombre: 'Rastro', rol: 'Trazabilidad', color: C.accent2, txt: 'Une cada anuncio con el cliente y sus operaciones.' },
  { id: 'capital', nombre: 'Capital', rol: 'Finanzas', color: C.accent3, txt: 'Mide ROI, ROAS y CAC sobre la comisión real.' },
  { id: 'horizonte', nombre: 'Horizonte', rol: 'Predicción', color: C.accent6, txt: 'Recomienda cuánto invertir, cuándo y dónde.' },
  { id: 'bitacora', nombre: 'Bitácora', rol: 'Registro', color: C.accent1, txt: 'Guarda cada cotización, cierre o no.' },
  { id: 'caudal', nombre: 'Caudal', rol: 'Liquidez', color: C.accent4, txt: 'Vigila los saldos cada hora y alerta a tiempo.' },
  { id: 'lupa', nombre: 'Lupa', rol: 'Calidad de leads', color: C.accent5, txt: 'Descubre por qué no cierran los leads.' }
];

async function construir() {
  const logo = archivo(path.join(DEMO, 'brasper-logo.png'), 'image/png');
  const [fondoA, fondoB] = [await fondoOscuro(false), await fondoOscuro(true)];

  /* ---------- Diseños (layouts) ---------- */
  const marcaOscura = () => [
    { image: { x: M, y: 0.55, w: 0.5, h: 0.5, data: logo } },
    { text: { text: 'Brasper × Ellenistas', options: { x: 1.22, y: 0.55, w: 5, h: 0.5, margin: 0, valign: 'middle', fontSize: 16, bold: true, color: C.background1 } } }
  ];
  // pptxgenjs modifica las opciones al usarlas: cada diseño necesita objetos nuevos
  const kickerOscuro = () => ({ placeholder: { options: { name: 'kicker', type: 'body', x: M, y: 2.0, w: 7.3, h: 0.4, margin: 0, align: 'left', valign: 'top', fontSize: 14, bold: true, color: C.accent2, charSpacing: 3 }, text: '' } });
  pres.defineSlideMaster({
    title: 'PORTADA', background: { data: fondoA },
    objects: [...marcaOscura(), kickerOscuro(),
      { placeholder: { options: { name: 'title', type: 'title', x: M, y: 2.45, w: 7.3, h: 1.35, margin: 0, align: 'left', valign: 'top', fontSize: 60, bold: true, color: C.background1 }, text: '' } },
      { placeholder: { options: { name: 'body', type: 'body', x: M, y: 3.95, w: 6.8, h: 1.6, margin: 0, align: 'left', valign: 'top', fontSize: 20, color: C.background2, lineSpacingMultiple: 1.1 }, text: '' } }]
  });
  pres.defineSlideMaster({
    title: 'CIERRE', background: { data: fondoA },
    objects: [...marcaOscura(), kickerOscuro(),
      { placeholder: { options: { name: 'title', type: 'title', x: M, y: 2.45, w: 7.3, h: 2.4, margin: 0, align: 'left', valign: 'top', fontSize: 40, bold: true, color: C.background1 }, text: '' } },
      { placeholder: { options: { name: 'body', type: 'body', x: M, y: 5.1, w: 7.3, h: 0.8, margin: 0, align: 'left', valign: 'top', fontSize: 18, color: C.background2 }, text: '' } }]
  });
  pres.defineSlideMaster({
    title: 'SECCION', background: { data: fondoB },
    objects: [...marcaOscura(),
      { placeholder: { options: { name: 'kicker', type: 'body', x: M, y: 2.0, w: 5.8, h: 0.4, margin: 0, align: 'left', valign: 'top', fontSize: 14, bold: true, color: C.accent2, charSpacing: 3 }, text: '' } },
      { placeholder: { options: { name: 'title', type: 'title', x: M, y: 2.45, w: 5.8, h: 1.75, margin: 0, align: 'left', valign: 'top', fontSize: 48, bold: true, color: C.background1 }, text: '' } },
      { placeholder: { options: { name: 'body', type: 'body', x: M, y: 4.45, w: 5.4, h: 1.0, margin: 0, align: 'left', valign: 'top', fontSize: 18, color: C.background2 }, text: '' } }]
  });
  pres.defineSlideMaster({
    title: 'CONTENIDO', background: { color: HEX.lt1 },
    objects: [
      { image: { x: M, y: 6.98, w: 0.24, h: 0.24, data: logo } },
      { text: { text: 'Brasper IA · Ellenistas · IAthon 2026', options: { x: 0.92, y: 6.96, w: 5, h: 0.28, margin: 0, valign: 'middle', fontSize: 10, color: C.text2 } } },
      { placeholder: { options: { name: 'kicker', type: 'body', x: M, y: 0.45, w: 10, h: 0.3, margin: 0, align: 'left', valign: 'top', fontSize: 12, bold: true, color: C.accent1, charSpacing: 2 }, text: '' } },
      { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.76, w: CW, h: 0.75, margin: 0, align: 'left', valign: 'top', fontSize: 32, bold: true, color: C.text1 }, text: '' } }
    ],
    slideNumber: { x: W - M - 0.6, y: 6.96, w: 0.6, h: 0.28, margin: 0, fontSize: 10, color: HEX.dk2, align: 'right', valign: 'middle' }
  });

  const SECCIONES = [];
  function lamina(layout, seccion, kicker, titulo, cuerpo) {
    if (!SECCIONES.includes(seccion)) { pres.addSection({ title: seccion }); SECCIONES.push(seccion); }
    const s = pres.addSlide({ masterName: layout, sectionTitle: seccion });
    if (kicker) s.addText(kicker, { placeholder: 'kicker' });
    if (titulo) s.addText(titulo, { placeholder: 'title' });
    if (cuerpo) s.addText(cuerpo, { placeholder: 'body' });
    return s;
  }
  function mascotas(s, xs, ys, w) {
    AGENTES.forEach((a, i) => s.addImage({ data: mascota(a.id), x: xs[i % 3], y: ys[Math.floor(i / 3)] + (i % 3 === 1 ? 0.4 : 0), w, h: w * 1.1, altText: `Mascota de ${a.nombre}`, objectName: `Mascota ${a.nombre}` }));
  }

  /* ===== 1 · Portada ===== */
  let s = lamina('PORTADA', 'Apertura', 'IATHON 2026 · PITCH', 'Brasper IA',
    'Del tipeo manual a agentes que trabajan solos: un robot que factura y seis agentes que convierten datos en decisiones.');
  mascotas(s, [8.15, 9.75, 11.35], [1.35, 3.85], 1.45);
  texto(s, 'Equipo Ellenistas · Octubre 2026', { x: M, y: 6.6, w: 6, h: 0.35, fontSize: 13, color: C.background2 });
  s.addNotes(`(≈20 s) Buenas tardes. Somos el equipo Ellenistas y les presentamos Brasper IA.
Traemos dos soluciones para que Brasper deje de depender del tipeo manual: un robot que factura solo y seis agentes de IA que convierten los datos que Brasper ya tiene en decisiones. Al final lo van a ver funcionando.`);

  /* ===== 2 · Contexto ===== */
  s = lamina('CONTENIDO', 'Apertura', 'CONTEXTO', 'Brasper mueve remesas entre Perú y Brasil');
  const stats = [['~60', 'operaciones al día hoy'], ['1000', 'operaciones al día: la meta'], ['3', 'vendedores cierran cada venta por WhatsApp'], ['2', 'empresas emiten comprobantes en Perú']];
  const sw = (CW - 3 * 0.3) / 4;
  stats.forEach(([n, l], i) => {
    const x = M + i * (sw + 0.3);
    tarjeta(s, x, 1.85, sw, 1.95, { name: `Dato ${n}` });
    texto(s, n, { x: x + 0.3, y: 2.1, w: sw - 0.6, h: 0.8, fontSize: 44, bold: true, color: C.accent1, fontFace: HEAD, valign: 'middle' });
    texto(s, l, { x: x + 0.3, y: 2.95, w: sw - 0.6, h: 0.7, fontSize: 14, color: C.text2 });
  });
  const rutas = [
    ['Perú → Brasil · PxB', 'KeyFácil', 'El cliente envía soles y el beneficiario recibe reales. El comprobante (boleta o factura) se emite en KeyFácil.'],
    ['Brasil → Perú · BxP', 'Omie', 'El cliente envía reales y el beneficiario recibe soles. La nota fiscal de servicio (NFS-e) se emite en Omie.']
  ];
  const rw = (CW - 0.3) / 2;
  for (const [i, [t, plat, d]] of rutas.entries()) {
    const x = M + i * (rw + 0.3);
    tarjeta(s, x, 4.1, rw, 2.5, { name: `Ruta ${t}` });
    await icono(s, 'route', G.marca, x + 0.35, 4.45, 0.7);
    texto(s, t, { x: x + 1.25, y: 4.45, w: rw - 3.0, h: 0.7, fontSize: 20, bold: true, valign: 'middle', fontFace: HEAD });
    etiqueta(s, plat, x + rw - 1.6, 4.62, 1.25);
    texto(s, d, { x: x + 0.35, y: 5.4, w: rw - 0.7, h: 1.0, fontSize: 15, color: C.text2, lineSpacingMultiple: 1.05 });
  }
  s.addNotes(`(≈40 s) Brasper hace remesas y cambio de divisas entre Perú y Brasil, en los dos sentidos. Hoy procesa unas 60 operaciones al día y su meta es llegar a 1000.
Las ventas se cierran por WhatsApp con 3 vendedores, y cada operación queda registrada en un dashboard propio.
Un detalle clave para lo que viene: según el sentido de la remesa, el comprobante se emite en una plataforma distinta. Perú → Brasil se factura en KeyFácil y Brasil → Perú en Omie.`);

  /* ===== 3 · Tipeo doble ===== */
  s = lamina('CONTENIDO', 'El problema', 'EL PROBLEMA', 'Cada operación se tipea dos veces');
  const nodos = [['msg', 'WhatsApp', 'Chat con el cliente'], ['grid', 'Dashboard', 'Registro de la operación'], ['receipt', 'KeyFácil u Omie', 'Emite el comprobante'], ['send', 'Cliente', 'Recibe el PDF']];
  const nw = 2.25, ng = (CW - 4 * nw) / 3;
  for (const [i, [ic, t, d]] of nodos.entries()) {
    const x = M + i * (nw + ng);
    tarjeta(s, x, 1.95, nw, 1.75, { name: `Sistema ${t}` });
    await icono(s, ic, G.marca, x + 0.25, 2.2, 0.6);
    texto(s, t, { x: x + 0.25, y: 2.92, w: nw - 0.4, h: 0.38, fontSize: 17, bold: true, fontFace: HEAD });
    texto(s, d, { x: x + 0.25, y: 3.3, w: nw - 0.4, h: 0.32, fontSize: 13, color: C.text2 });
  }
  const dolores = [['keyboard', 'Tipeo 1', 'Los 3 vendedores copian el chat al dashboard.'], ['keyboard', 'Tipeo 2', 'Contabilidad copia lo mismo en KeyFácil u Omie.'], ['eye', 'Revisión', 'Un equipo compara lo tipeado, operación por operación.']];
  for (const [i, [ic, t, d]] of dolores.entries()) {
    const gx = M + i * (nw + ng) + nw, cx = gx + ng / 2;
    flecha(s, gx + 0.1, 2.825, gx + ng - 0.1, 2.825, { color: C.accent5, width: 2.25, name: `Flecha ${t}` });
    flecha(s, cx, 2.9, cx, 4.15, { color: C.accent5, width: 1.25, dash: true, sinPunta: true, name: `Conector ${t}` });
    const x = cx - 1.5;
    tarjeta(s, x, 4.15, 3.0, 1.75, { fill: tinte(C.accent5, 91), name: `Paso manual ${t}` });
    await icono(s, ic, G.dolor, x + 0.25, 4.38, 0.5);
    texto(s, t, { x: x + 0.9, y: 4.38, w: 1.9, h: 0.5, fontSize: 17, bold: true, valign: 'middle', fontFace: HEAD });
    texto(s, d, { x: x + 0.25, y: 5.02, w: 2.55, h: 0.75, fontSize: 14 });
  }
  texto(s, 'Son más de 7 pasos y varias pantallas por operación. Entre estos sistemas no hay ninguna conexión: el puente son personas.', { x: M, y: 6.2, w: CW, h: 0.5, fontSize: 15, color: C.text2 });
  s.addNotes(`(≈45 s) Así viaja hoy una operación. El cliente cierra la venta por WhatsApp; los 3 vendedores copian a mano nombre, DNI, cuentas, montos y tipo de cambio al dashboard. Ese es el primer tipeo.
Después, contabilidad abre el dashboard y vuelve a copiar los mismos datos en KeyFácil u Omie. Segundo tipeo.
Y como copiar a mano genera errores, hay un equipo que revisa que todo coincida. Entre estos sistemas no hay ninguna conexión: el puente son personas.`);

  /* ===== 4 · Días y escala ===== */
  s = lamina('CONTENIDO', 'El problema', 'EL PROBLEMA', 'El comprobante tarda días, no minutos');
  const tiempos = [
    ['ANTES', tinte(C.accent5, 85), 'Semanas', 'Entre 1 y 1,5 semanas. En el peor caso, quien operó el 1 de octubre recibió su boleta el 16.'],
    ['HOY', tinte(C.accent3, 80), '2–3 días', 'La mejora vino de sumar 2 o 3 personas a contabilidad, no de automatizar.'],
    ['LA META', tinte(C.accent4, 80), 'Minutos', 'Que el comprobante salga apenas se cierra la operación.']
  ];
  const tw = 3.55, tg = (CW - 3 * tw) / 2;
  tiempos.forEach(([k, fill, n, d], i) => {
    const x = M + i * (tw + tg);
    tarjeta(s, x, 1.85, tw, 2.6, { name: `Tiempo ${k}` });
    etiqueta(s, k, x + 0.35, 2.15, 1.3, { fill });
    texto(s, n, { x: x + 0.35, y: 2.6, w: tw - 0.7, h: 0.75, fontSize: 40, bold: true, fontFace: HEAD, valign: 'middle' });
    texto(s, d, { x: x + 0.35, y: 3.42, w: tw - 0.7, h: 0.9, fontSize: 14, color: C.text2 });
    if (i < 2) flecha(s, x + tw + 0.12, 3.15, x + tw + tg - 0.12, 3.15, { name: `Flecha tiempo ${i + 1}` });
  });
  tarjeta(s, M, 4.75, CW, 1.85, { fill: { color: C.text1 }, name: 'Banda de escala' });
  texto(s, '60 → 1000', { x: M + 0.45, y: 4.75, w: 3.7, h: 1.85, fontSize: 44, bold: true, color: C.background1, fontFace: HEAD, valign: 'middle' });
  texto(s, 'operaciones al día es la meta. Si cada comprobante necesita alguien que lo tipee y alguien que lo revise, crecer 16 veces obliga a contratar al mismo ritmo.',
    { x: M + 4.4, y: 4.75, w: CW - 4.85, h: 1.85, fontSize: 17, color: C.background1, valign: 'middle', lineSpacingMultiple: 1.05 });
  s.addNotes(`(≈40 s) El resultado son días de espera. En su peor momento, los comprobantes tardaban entre una semana y semana y media: un cliente que operó el 1 de octubre recibió su boleta el 16.
Hoy tardan 2 o 3 días, pero no porque algo se haya automatizado: sumaron 2 o 3 personas a contabilidad. Y ellos mismos dicen que sigue siendo mucho.
El problema de fondo es la escala: con la meta de 1000 operaciones al día, este modelo obliga a contratar al mismo ritmo que crecen.`);

  /* ===== 5 · Paga tres veces ===== */
  s = lamina('CONTENIDO', 'El problema', 'EL PROBLEMA', 'Brasper paga tres veces por cada comprobante');
  const pagos = [['card', 'La suscripción', 'KeyFácil y Omie se pagan cada mes, haya muchas o pocas operaciones.'], ['keyboard', 'La persona que tipea', 'Pasa los datos del dashboard a la plataforma, uno por uno.'], ['eye', 'La persona que revisa', 'Confirma que nombre, DNI/RUC, montos y N° de operación coincidan.']];
  const pw = (CW - 2 * 0.3) / 3;
  for (const [i, [ic, t, d]] of pagos.entries()) {
    const x = M + i * (pw + 0.3);
    tarjeta(s, x, 1.85, pw, 3.1, { name: `Pago ${i + 1}` });
    await icono(s, ic, G.dolor, x + 0.35, 2.2, 0.75);
    texto(s, `0${i + 1}`, { x: x + pw - 1.0, y: 2.2, w: 0.65, h: 0.45, fontSize: 18, bold: true, color: C.accent5, align: 'right', fontFace: HEAD });
    texto(s, t, { x: x + 0.35, y: 3.2, w: pw - 0.7, h: 0.5, fontSize: 20, bold: true, fontFace: HEAD });
    texto(s, d, { x: x + 0.35, y: 3.75, w: pw - 0.7, h: 1.0, fontSize: 15, color: C.text2, lineSpacingMultiple: 1.05 });
  }
  tarjeta(s, M, 5.25, CW, 1.35, { fill: tinte(C.accent1, 91), name: 'Idea clave' });
  await icono(s, 'spark', G.marca, M + 0.35, 5.6, 0.65);
  texto(s, 'Si los datos pasan solos de un sistema a otro, desaparece el error de tipeo y, con él, la revisión manual.', { x: M + 1.3, y: 5.25, w: CW - 1.7, h: 1.35, fontSize: 19, bold: true, valign: 'middle' });
  s.addNotes(`(≈35 s) Si lo miramos como costo, Brasper paga tres veces por cada comprobante. Paga la suscripción a KeyFácil y Omie. Paga a la persona que tipea los datos. Y paga a la persona que revisa que no se hayan tipeado mal.
Esa revisión no le agrega nada al cliente: existe solo para corregir un error que crea el propio proceso manual. Si los datos pasan solos de un sistema a otro, desaparece el error y, con él, la revisión.`);

  /* ===== 6 · Marketing y caja ===== */
  s = lamina('CONTENIDO', 'El problema', 'EL PROBLEMA · CAMPAÑAS Y CAJA', 'Las campañas y la caja también se manejan a mano');
  const manuales = [
    ['route', 'No se sabe qué anuncio trajo a cada cliente', 'El origen se marca con etiquetas a mano, como «Campaña 22/08/2026».'],
    ['drop', 'La liquidez se revisa en un Excel cada hora', 'Saldos en soles, reales y dólares, repartidos en varios bancos y sin alertas.'],
    ['book', 'Solo se registran las ventas que cierran', 'Las cotizaciones que no se concretan se pierden, y con ellas el seguimiento.'],
    ['lens', 'Muchos leads creen que Brasper presta dinero', 'El texto de algunos anuncios atrae a quien busca un crédito, no una remesa.']
  ];
  const mw = (CW - 0.3) / 2;
  for (const [i, [ic, t, d]] of manuales.entries()) {
    const x = M + (i % 2) * (mw + 0.3), y = 1.85 + Math.floor(i / 2) * 2.4;
    tarjeta(s, x, y, mw, 2.1, { name: `Problema ${i + 1}` });
    await icono(s, ic, G.dolor, x + 0.35, y + 0.35, 0.7);
    texto(s, t, { x: x + 1.3, y: y + 0.3, w: mw - 1.65, h: 0.8, fontSize: 18, bold: true, valign: 'middle', fontFace: HEAD });
    texto(s, d, { x: x + 1.3, y: y + 1.15, w: mw - 1.65, h: 0.8, fontSize: 15, color: C.text2 });
  }
  s.addNotes(`(≈35 s) En las reuniones con Brasper vimos que el tipeo no se limita a la facturación.
Brasper invierte en campañas de Meta, WhatsApp y TikTok, pero no sabe qué anuncio trajo a cada cliente: lo marca con etiquetas a mano. La liquidez de soles, reales y dólares se revisa en un Excel cada hora. Solo se registran las ventas que cierran, así que se pierde a quién hacerle seguimiento. Y muchos leads llegan creyendo que Brasper presta dinero.
Los datos para responder todo esto ya existen; nadie los está uniendo.`);

  /* ===== 7 · Restricciones ===== */
  s = lamina('CONTENIDO', 'El problema', 'LAS REGLAS DEL JUEGO', 'La solución no podía tocar su base de datos');
  tarjeta(s, M, 1.85, 5.35, 4.75, { fill: { color: C.text1 }, name: 'Cita de Brasper' });
  texto(s, '“', { x: M + 0.45, y: 2.0, w: 1.5, h: 1.3, fontSize: 110, bold: true, color: C.accent2, fontFace: HEAD });
  texto(s, 'Nuestra API son las personas.', { x: M + 0.45, y: 3.25, w: 4.45, h: 1.6, fontSize: 34, bold: true, color: C.background1, fontFace: HEAD });
  texto(s, 'Brasper, cuando le pedimos acceso a su base de datos y a su API.', { x: M + 0.45, y: 5.15, w: 4.45, h: 0.9, fontSize: 15, color: C.background2 });
  const reglas = [['lock', 'Solo la interfaz', 'Sin acceso a la base de datos ni a la API: hay que trabajar sobre las mismas pantallas que usa el equipo.'], ['shield', 'IA local', 'DNI, cuentas y montos no pueden salir hacia servicios de IA externos.'], ['users', 'Supervisión humana', 'El reglamento de IA (D.S. 115-2025-PCM) la exige, y en finanzas la transparencia algorítmica ya aplica.']];
  for (const [i, [ic, t, d]] of reglas.entries()) {
    const x = 6.25, y = 1.85 + i * 1.65, w = W - M - x;
    tarjeta(s, x, y, w, 1.45, { name: `Regla ${t}` });
    await icono(s, ic, G.marca, x + 0.3, y + 0.4, 0.65);
    texto(s, t, { x: x + 1.2, y: y + 0.22, w: w - 1.5, h: 0.4, fontSize: 17, bold: true, fontFace: HEAD });
    texto(s, d, { x: x + 1.2, y: y + 0.64, w: w - 1.5, h: 0.7, fontSize: 14, color: C.text2 });
  }
  s.addNotes(`(≈35 s) Antes de diseñar, Brasper nos puso una regla clara. Cuando pedimos acceso a su base de datos o a su API, la respuesta fue: «Nuestra API son las personas». Son datos sensibles y no los van a abrir.
Así que la solución tenía que trabajar sobre la interfaz, igual que lo hace el equipo. Además, los datos de clientes no pueden salir hacia servicios de IA externos, y el reglamento peruano de IA exige supervisión humana. Todo lo que van a ver respeta esas tres reglas.`);

  /* ===== 8 · Dos soluciones ===== */
  s = lamina('CONTENIDO', 'La solución', 'LA SOLUCIÓN', 'Dos soluciones, un mismo objetivo: cero tipeo');
  const imgRpa = await recorte('rpa-final', 1190, 140, 1690, 735);
  const imgArm = await recorte('arm-centro', 300, 150, 2580, 1122);
  const sols = [
    [imgRpa, 'bot', G.marca, 'Solución 1 · RPA de facturación', 'Un robot lee el dashboard, llena KeyFácil u Omie, emite el comprobante y valida el PDF con IA.', 'Elimina el tipeo y la revisión de cada operación'],
    [imgArm, 'spark', G.arm, 'Solución 2 · ARM con agentes IA', 'ARM (Agentic Relationship Management): seis agentes y un Copiloto unen campañas, clientes, operaciones y caja.', 'Convierte los datos que ya existen en decisiones']
  ];
  const cw2 = (CW - 0.3) / 2;
  for (const [i, [img, ic, gr, t, d, r]] of sols.entries()) {
    const x = M + i * (cw2 + 0.3);
    tarjeta(s, x, 1.85, cw2, 4.8, { name: t });
    s.addImage({ data: img.data, x: x + 0.2, y: 2.05, w: cw2 - 0.4, h: (cw2 - 0.4) / img.ratio, altText: t, objectName: `Captura ${t}` });
    await icono(s, ic, gr, x + 0.3, 4.6, 0.6);
    texto(s, t, { x: x + 1.05, y: 4.6, w: cw2 - 1.3, h: 0.6, fontSize: 19, bold: true, valign: 'middle', fontFace: HEAD });
    texto(s, d, { x: x + 0.3, y: 5.32, w: cw2 - 0.6, h: 0.75, fontSize: 15, color: C.text2 });
    await icono(s, 'check', G.ok, x + 0.3, 6.15, 0.32);
    texto(s, r, { x: x + 0.75, y: 6.15, w: cw2 - 1.0, h: 0.32, fontSize: 14, bold: true, valign: 'middle' });
  }
  s.addNotes(`(≈30 s) Nuestra propuesta son dos soluciones con un mismo objetivo: que nadie tenga que tipear.
La primera es un RPA de facturación: un robot que hace el trabajo de contabilidad sobre las mismas pantallas, sin tocar la base de datos.
La segunda es un ARM, Agentic Relationship Management: seis agentes de IA y un Copiloto que unen campañas, clientes, operaciones y caja para responder las preguntas de gerencia.`);

  /* ===== 9 · Flujo del RPA ===== */
  s = lamina('CONTENIDO', 'La solución', 'SOLUCIÓN 1 · RPA DE FACTURACIÓN', 'El robot factura como lo haría el contador');
  const pasos = [
    ['file', 'Lee la fila', 'Toma 13 datos de la vista Contabilidad del dashboard.'],
    ['check', 'Valida reglas', 'Boleta o factura, IGV de 18 % y que la venta final cuadre.'],
    ['route', 'Elige destino', 'Perú → Brasil va a KeyFácil; Brasil → Perú, a Omie.'],
    ['form', 'Llena y emite', 'Completa el formulario campo por campo y pulsa Emitir.'],
    ['pdf', 'Valida el PDF', 'La IA lee el comprobante y lo compara con el dashboard.'],
    ['clip', 'Registra', 'Escribe el número del comprobante en el dashboard.']
  ];
  const fw = (CW - 5 * 0.25) / 6;
  for (const [i, [ic, t, d]] of pasos.entries()) {
    const x = M + i * (fw + 0.25);
    await icono(s, ic, G.marca, x, 2.0, 0.9);
    numero(s, i + 1, x + 0.7, 1.85, 0.36, { borde: true, fontSize: 12 });
    if (i < 5) flecha(s, x + 1.02, 2.45, x + fw + 0.25 - 0.12, 2.45, { transparency: 40, name: `Flecha paso ${i + 1}` });
    texto(s, t, { x, y: 3.15, w: fw, h: 0.42, fontSize: 17, bold: true, fontFace: HEAD });
    texto(s, d, { x, y: 3.65, w: fw - 0.05, h: 1.5, fontSize: 15, color: C.text2, lineSpacingMultiple: 1.05 });
  }
  tarjeta(s, M, 5.35, CW, 1.25, { fill: tinte(C.accent4, 89), name: 'Resultado de la demo' });
  await icono(s, 'check', G.ok, M + 0.35, 5.67, 0.6);
  texto(s, [
    { text: 'En la demo: 10 de 11 comprobantes emitidos y validados sin que nadie toque el teclado. ', options: { bold: true } },
    { text: 'El que no cuadraba quedó apartado, con su motivo.' }
  ], { x: M + 1.2, y: 5.35, w: CW - 1.55, h: 1.25, fontSize: 17, valign: 'middle' });
  s.addNotes(`(≈45 s) El robot hace exactamente lo que hoy hace una persona de contabilidad, pero sin cansarse ni equivocarse.
Lee la fila de la operación en la vista Contabilidad: 13 datos. Valida las reglas: si corresponde boleta o factura, que el IGV sea el 18 % y que la venta final cuadre. Elige la plataforma según el sentido de la remesa. Llena el formulario campo por campo y emite. Después, la IA lee el PDF y lo compara con el dashboard. Y por último deja el número del comprobante en el dashboard, para que todos vean qué está facturado.`);

  /* ===== 10 · Robustez ===== */
  s = lamina('CONTENIDO', 'La solución', 'SOLUCIÓN 1 · RPA DE FACTURACIÓN', 'Si algo no cuadra, el robot no emite: lo aparta');
  tarjeta(s, M, 1.85, 5.5, 4.8, { name: 'Caso PxB-001529' });
  texto(s, 'PxB-001529', { x: M + 0.4, y: 2.15, w: 4.7, h: 0.45, fontSize: 22, bold: true, fontFace: HEAD });
  texto(s, 'Perú → Brasil · boleta · caso de la demo', { x: M + 0.4, y: 2.62, w: 4.7, h: 0.32, fontSize: 13, color: C.text2 });
  const filas = [['Comisión final interna', 'S/ 5.08'], ['Impuesto (IGV 18 %)', 'S/ 0.91'], ['Comisión + impuesto', 'S/ 5.99'], ['Venta final en el dashboard', 'S/ 14.14']];
  filas.forEach(([l, v], i) => {
    const y = 3.15 + i * 0.55, ultima = i === filas.length - 1;
    texto(s, l, { x: M + 0.4, y, w: 3.2, h: 0.5, fontSize: 15, color: C.text2, valign: 'middle', bold: i >= 2 });
    texto(s, v, { x: M + 3.5, y, w: 1.6, h: 0.5, fontSize: 17, bold: true, align: 'right', valign: 'middle', color: ultima ? C.accent5 : C.text1 });
    if (!ultima) s.addShape(pres.shapes.LINE, { x: M + 0.4, y: y + 0.52, w: 4.7, h: 0, line: { color: C.text2, transparency: 80, width: 0.75 }, objectName: `Separador ${i + 1}` });
  });
  tarjeta(s, M + 0.3, 5.5, 4.9, 0.85, { fill: tinte(C.accent5, 89), r: 0.12, name: 'Decisión del robot' });
  await icono(s, 'alert', G.dolor, M + 0.5, 5.67, 0.5);
  texto(s, 'No emite: pasa a revisión humana con el motivo.', { x: M + 1.15, y: 5.5, w: 3.95, h: 0.85, fontSize: 14, bold: true, valign: 'middle' });
  const garantias = [['monitor', 'Trabaja sobre la interfaz', 'Lee el dashboard como un usuario más: no necesita acceso a la base de datos.'], ['eye', 'Visión IA si la pantalla cambia', 'Si KeyFácil u Omie cambian de diseño, reconoce los campos por su etiqueta, sigue y avisa a soporte.'], ['check', 'Nunca factura dos veces', 'Antes de emitir confirma que la operación no tenga comprobante.']];
  for (const [i, [ic, t, d]] of garantias.entries()) {
    const x = 6.4, y = 1.85 + i * 1.675, w = W - M - x;
    tarjeta(s, x, y, w, 1.45, { name: `Garantía ${t}` });
    await icono(s, ic, G.marca, x + 0.3, y + 0.4, 0.65);
    texto(s, t, { x: x + 1.2, y: y + 0.22, w: w - 1.5, h: 0.4, fontSize: 17, bold: true, fontFace: HEAD });
    texto(s, d, { x: x + 1.2, y: y + 0.64, w: w - 1.5, h: 0.7, fontSize: 14, color: C.text2 });
  }
  s.addNotes(`(≈40 s) Lo importante de un robot no es cuando todo sale bien, sino qué hace cuando algo falla.
Este es un caso real de la demo: la operación PxB-001529 tiene una comisión de 5.08 y un IGV de 0.91, que suman 5.99. Pero la venta final del dashboard dice 14.14. El robot no la emite: la aparta para revisión humana y explica por qué. Contabilidad ya no revisa todo; solo las excepciones.
Además, como trabaja sobre la interfaz, si KeyFácil u Omie cambian de diseño, la visión IA reconoce los campos por su etiqueta y sigue. Y nunca factura dos veces la misma operación.`);

  /* ===== 11 · Agentes ===== */
  s = lamina('CONTENIDO', 'La solución', 'SOLUCIÓN 2 · ARM CON AGENTES IA', 'Seis agentes y un Copiloto que los coordina');
  tarjeta(s, M, 1.85, 3.35, 4.8, { fill: { color: C.text1 }, name: 'Copiloto' });
  await icono(s, 'spark', G.arm, M + 0.35, 2.2, 0.75);
  texto(s, 'Copiloto', { x: M + 0.35, y: 3.1, w: 2.7, h: 0.5, fontSize: 24, bold: true, color: C.background1, fontFace: HEAD });
  texto(s, 'Recibe preguntas de gerencia en lenguaje natural, coordina a los agentes y responde con evidencia.', { x: M + 0.35, y: 3.7, w: 2.7, h: 1.45, fontSize: 15, color: C.background2, lineSpacingMultiple: 1.05 });
  texto(s, [
    { text: '«¿Qué campaña apago y cuál escalo?»', options: { breakLine: true } },
    { text: '«¿Necesito reales mañana?»' }
  ], { x: M + 0.35, y: 5.3, w: 2.7, h: 1.1, fontSize: 14, italic: true, color: C.accent2, paraSpaceAfter: 6 });
  const gx0 = M + 3.35 + 0.3, gw = (W - M - gx0 - 2 * 0.25) / 3, gh = (4.8 - 0.25) / 2;
  AGENTES.forEach((a, i) => {
    const x = gx0 + (i % 3) * (gw + 0.25), y = 1.85 + Math.floor(i / 3) * (gh + 0.25);
    tarjeta(s, x, y, gw, gh, { fill: tinte(a.color, 89), name: `Agente ${a.nombre}` });
    s.addImage({ data: mascota(a.id), x: x + 0.2, y: y + 0.2, w: 0.85, h: 0.935, altText: `Mascota de ${a.nombre}`, objectName: `Mascota ${a.nombre}` });
    texto(s, a.nombre, { x: x + 1.2, y: y + 0.3, w: gw - 1.35, h: 0.42, fontSize: 19, bold: true, fontFace: HEAD });
    texto(s, a.rol, { x: x + 1.2, y: y + 0.74, w: gw - 1.35, h: 0.32, fontSize: 13, color: C.text2 });
    texto(s, a.txt, { x: x + 0.22, y: y + 1.3, w: gw - 0.44, h: 0.8, fontSize: 14 });
  });
  s.addNotes(`(≈45 s) La segunda solución es el ARM. Son seis agentes, cada uno con una tarea concreta, y un Copiloto que los coordina.
Rastro une cada anuncio con el cliente que trajo y sus operaciones. Capital mide ROI, ROAS y CAC sobre la comisión real, no sobre el monto enviado. Horizonte recomienda cuánto invertir, cuándo y dónde. Bitácora guarda cada cotización, cierre o no. Caudal reemplaza el Excel de saldos y alerta a tiempo. Y Lupa descubre por qué no cierran los leads.
Gerencia no tiene que saber a qué agente preguntarle: le pregunta al Copiloto en lenguaje natural.`);

  /* ===== 12 · Atribución ===== */
  s = lamina('CONTENIDO', 'La solución', 'SOLUCIÓN 2 · ARM CON AGENTES IA', 'Cada cliente queda unido a la campaña que lo trajo');
  const cadena = [['megaphone', 'Anuncio', 'Redes y WhatsApp'], ['globe', 'Visita a la web', 'UTM e ID de clic'], ['user', 'Registro', 'DNI o CPF del cliente'], ['swap', 'Operaciones', 'Comisión de cada envío'], ['trend', 'ROAS y CAC', 'Por campaña y canal']];
  const kw = (CW - 4 * 0.32) / 5;
  for (const [i, [ic, t, d]] of cadena.entries()) {
    const x = M + i * (kw + 0.32);
    tarjeta(s, x, 1.85, kw, 1.45, { name: `Eslabón ${t}` });
    await icono(s, ic, i === 4 ? G.ok : G.marca, x + 0.2, 2.02, 0.45);
    texto(s, t, { x: x + 0.2, y: 2.55, w: kw - 0.35, h: 0.32, fontSize: 15, bold: true });
    texto(s, d, { x: x + 0.2, y: 2.88, w: kw - 0.35, h: 0.36, fontSize: 13, color: C.text2 });
    if (i < 4) flecha(s, x + kw + 0.04, 2.575, x + kw + 0.28, 2.575, { width: 1.5, name: `Flecha eslabón ${i + 1}` });
  }
  const cab = { bold: true, color: C.background1, fill: { color: C.text1 }, fontSize: 13 };
  const fila = (a, b, c) => [{ text: a, options: { bold: true } }, { text: b }, { text: c }];
  s.addTable([
    [{ text: 'Canal', options: cab }, { text: 'Qué entrega', options: cab }, { text: 'Cómo se une al cliente', options: cab }],
    fila('Meta', 'Totales por anuncio + fbclid', 'Web → registro (DNI o CPF)'),
    fila('WhatsApp', 'ctwa_clid + teléfono', 'Hash del teléfono'),
    fila('Formularios Meta', 'Nombre, teléfono y email', 'Hash del email o teléfono'),
    fila('TikTok', 'Totales + ttclid', 'Web → registro'),
    fila('Eventos', 'QR con UTM o cupón', 'Cupón usado en la operación')
  ], { x: M, y: 3.55, w: 7.75, colW: [1.9, 2.85, 3.0], rowH: 0.45, fontSize: 14, color: C.text1, valign: 'middle', margin: [0, 0.12, 0, 0.12], border: { type: 'solid', pt: 0.75, color: 'D5DBEA' }, fill: { color: C.background1 }, objectName: 'Tabla de canales' });
  const nx = M + 7.75 + 0.3, nw2 = W - M - nx;
  tarjeta(s, nx, 3.55, nw2, 2.7, { fill: tinte(C.accent1, 91), name: 'Privacidad' });
  await icono(s, 'shield', G.marca, nx + 0.3, 3.85, 0.55);
  texto(s, 'Privacidad primero', { x: nx + 1.0, y: 3.85, w: nw2 - 1.2, h: 0.55, fontSize: 16, bold: true, valign: 'middle', fontFace: HEAD });
  texto(s, 'Meta y TikTok no dicen quién hizo clic. El cruce se hace en la web de Brasper, después de que la persona acepta las cookies (Ley 29733 y LGPD).', { x: nx + 0.3, y: 4.55, w: nw2 - 0.6, h: 1.55, fontSize: 14 });
  texto(s, 'Con ese cruce, cada sol invertido en anuncios se compara con la comisión real que dejó el cliente.', { x: M, y: 6.38, w: CW, h: 0.35, fontSize: 14, color: C.text2 });
  s.addNotes(`(≈40 s) ¿Cómo sabe Rastro qué cliente vino de qué anuncio? Meta y TikTok solo entregan totales: gasto, clics, edad, región. No dicen quién hizo clic.
El cruce lo hacemos en la web de Brasper: cuando la persona llega desde un anuncio guardamos los UTM y el ID de clic, lo amarramos a su registro con DNI o CPF y después a cada operación. Así se calcula el ROAS y el CAC reales por campaña. En WhatsApp y en los formularios el cruce es por el teléfono o el email cifrados.
Todo pasa solo después de que la persona acepta las cookies, como piden la Ley 29733 y la LGPD de Brasil.`);

  /* ===== 13 · Demo ===== */
  s = lamina('SECCION', 'Demo', 'DEMO', 'Veámoslo funcionando', 'Datos simulados con la estructura real del dashboard de Brasper.');
  const guion = [['RPA de facturación', 'El robot factura las 11 operaciones del día en KeyFácil y Omie.'], ['La pantalla cambia', 'Rediseñamos la plataforma a mitad del lote y el robot sigue.'], ['ARM con agentes IA', 'Del dashboard al ARM: los agentes y el Copiloto responden.']];
  guion.forEach(([t, d], i) => {
    const x = 6.9, y = 1.95 + i * 1.5, w = W - M - x;
    tarjeta(s, x, y, w, 1.25, { fill: { color: C.background1, transparency: 90 }, line: { color: C.background1, transparency: 75, width: 0.75 }, name: `Paso de la demo ${i + 1}` });
    numero(s, i + 1, x + 0.3, y + 0.32, 0.6, { fill: C.accent2, color: C.text1, fontSize: 18 });
    texto(s, t, { x: x + 1.15, y: y + 0.2, w: w - 1.4, h: 0.4, fontSize: 18, bold: true, color: C.background1, fontFace: HEAD });
    texto(s, d, { x: x + 1.15, y: y + 0.62, w: w - 1.4, h: 0.5, fontSize: 14, color: C.background2 });
  });
  s.addNotes(`(Demo en vivo, ≈3 min)
Antes de presentar: en la carpeta brasper-ia-demo, ejecutar «python3 -m http.server 8765» y abrir http://localhost:8765/_preview.html. Dejarlo abierto en otra pestaña.

1. Pestaña «RPA de facturación»: clic en «Activar RPA» y luego en «Iniciar facturación automática». Narrar cómo lee la fila, valida las reglas y llena KeyFácil (Perú → Brasil) u Omie (Brasil → Perú).
2. A mitad del lote, cambiar «Diseño de la plataforma destino» a «Rediseñada». Mostrar la visión IA reconociendo los campos. Señalar que PxB-001529 queda en «Revisión humana». Pasar a «Turbo» para terminar: 10 emitidos, 1 en revisión.
3. Pestaña «ARM con agentes IA»: clic en «Brasper ARM · Entrar». Mostrar el centro de mando. En el Copiloto, usar la sugerencia «¿Qué campaña apago y cuál escalo?». Abrir a Lupa y pulsar «¿Cómo cambio el mensaje?».

Consejo: usar las preguntas sugeridas. Una pregunta escrita a mano puede ir al agente equivocado.
Si la demo en vivo falla, seguir con las cuatro láminas siguientes, que muestran los mismos momentos.`);

  /* ===== 14 · Demo: RPA trabajando ===== */
  s = lamina('CONTENIDO', 'Demo', 'DEMO · SOLUCIÓN 1', 'El robot lee el dashboard y llena KeyFácil');
  const iw = 8.75, ih = iw * 1620 / 2880, ix = M, iy = 1.85;
  imagenConMarco(s, captura('rpa-trabajando'), ix, iy, iw, ih, 'Captura del RPA llenando KeyFácil');
  [[0.21, 0.62], [0.515, 0.33], [0.8, 0.33]].forEach(([fx, fy], i) => numero(s, i + 1, ix + fx * iw - 0.25, iy + fy * ih - 0.25, 0.5, { borde: true, fontSize: 16, name: `Marcador ${i + 1}` }));
  const partes = [['Dashboard de Brasper', 'La vista Contabilidad, tal como la usa el equipo.'], ['Agente RPA', 'Lee 13 datos por operación, valida las reglas y deja una bitácora.'], ['KeyFácil u Omie', 'Llena el formulario campo por campo, emite y valida el PDF.']];
  partes.forEach(([t, d], i) => {
    const x = ix + iw + 0.35, y = 1.95 + i * 1.6, w = W - M - x;
    numero(s, i + 1, x, y, 0.45, { fontSize: 15 });
    texto(s, t, { x: x + 0.6, y, w: w - 0.6, h: 0.45, fontSize: 16, bold: true, valign: 'middle', fontFace: HEAD });
    texto(s, d, { x: x + 0.6, y: y + 0.52, w: w - 0.6, h: 0.95, fontSize: 14, color: C.text2 });
  });
  s.addNotes(`(Respaldo de la demo, ≈30 s) A la izquierda está el dashboard de Brasper, en la vista Contabilidad. Al centro, el agente RPA: muestra qué operación procesa, los 13 datos que leyó y las reglas que validó. A la derecha, KeyFácil: el robot lo llena campo por campo con los datos del dashboard, emite y valida el PDF. La columna nueva del dashboard va mostrando el número de cada comprobante emitido.`);

  /* ===== 15 · Demo: visión y resultado ===== */
  s = lamina('CONTENIDO', 'Demo', 'DEMO · SOLUCIÓN 1', 'El robot se adapta y separa lo que no cuadra');
  const imgVision = await recorte('rpa-vision', 1200, 140, 1680, 1120);
  const imgFinal = await recorte('rpa-final', 130, 115, 1656, 1104);
  const dupla = [[imgVision, 'VISIÓN IA', 'Omie cambió de diseño a mitad del lote. ', 'La visión IA reubica cada campo, con su nivel de confianza, y el robot sigue.'], [imgFinal, 'RESULTADO', '10 de 11 emitidos y validados. ', 'PxB-001529 queda en «Revisión humana» porque sus montos no cuadran.']];
  dupla.forEach(([img, k, b, d], i) => {
    const x = M + i * (cw2 + 0.3), h = cw2 / img.ratio;
    imagenConMarco(s, img.data, x, 1.85, cw2, h, `Captura ${k}`);
    texto(s, [{ text: b, options: { bold: true } }, { text: d }], { x, y: 1.85 + h + 0.2, w: cw2, h: 0.75, fontSize: 15 });
  });
  s.addNotes(`(Respaldo de la demo, ≈30 s) A mitad del lote cambiamos el diseño de Omie, como si la plataforma se actualizara. El robot no se rompe: la visión IA reconoce cada campo por su etiqueta, con su nivel de confianza, y sigue trabajando. Al final, 10 de las 11 operaciones quedan emitidas y validadas. La PxB-001529 queda en «Revisión humana» porque sus montos no cuadran: contabilidad solo revisa ese caso.`);

  /* ===== 16 · Demo: portal al ARM ===== */
  s = lamina('CONTENIDO', 'Demo', 'DEMO · SOLUCIÓN 2', 'Del dashboard actual al ARM, con un clic');
  const viaje = [['web-dashboard', 'El dashboard de siempre', 'Se suma un acceso al ARM sin cambiar cómo trabaja el equipo.'], ['portal', 'El portal', 'Un clic y los seis agentes se presentan.'], ['arm-centro', 'El centro de mando', 'El Copiloto al centro y cada agente con lo que está haciendo ahora.']];
  viaje.forEach(([f, t, d], i) => {
    const x = M + i * (pw + 0.3), h = pw * 1620 / 2880;
    imagenConMarco(s, captura(f), x, 1.85, pw, h, `Captura ${t}`);
    numero(s, i + 1, x, 1.85 + h + 0.3, 0.42, { fontSize: 14 });
    texto(s, t, { x: x + 0.55, y: 1.85 + h + 0.3, w: pw - 0.55, h: 0.42, fontSize: 17, bold: true, valign: 'middle', fontFace: HEAD });
    texto(s, d, { x, y: 1.85 + h + 0.85, w: pw, h: 0.9, fontSize: 14, color: C.text2 });
  });
  tarjeta(s, M, 5.85, CW, 0.8, { fill: tinte(C.accent1, 91), r: 0.12, name: 'Idea clave ARM' });
  await icono(s, 'spark', G.arm, M + 0.25, 6.0, 0.5);
  texto(s, 'El ARM no reemplaza el dashboard: se suma a él como un botón más.', { x: M + 0.95, y: 5.85, w: CW - 1.2, h: 0.8, fontSize: 17, bold: true, valign: 'middle' });
  s.addNotes(`(Respaldo de la demo, ≈25 s) El ARM no reemplaza el dashboard: se suma como un botón más. Un clic abre el portal, donde se presentan los seis agentes, y llegamos al centro de mando: el Copiloto al centro y cada agente mostrando en qué está trabajando.`);

  /* ===== 17 · Demo: respuestas ===== */
  s = lamina('CONTENIDO', 'Demo', 'DEMO · SOLUCIÓN 2', 'Cada respuesta llega con su evidencia');
  const imgCop = await recorte('arm-copiloto', 450, 120, 2400, 1412);
  const imgLupa = await recorte('arm-lupa', 475, 240, 2348, 1380);
  const resp = [[imgCop, 'Copiloto: «¿Qué campaña apago y cuál escalo?» ', 'Coordina a Capital, Lupa y Horizonte y responde con el ROAS de cada campaña.'], [imgLupa, 'Lupa: «¿Cómo cambio el mensaje?» ', 'Propone un anuncio que aclara que Brasper no presta dinero.']];
  resp.forEach(([img, b, d], i) => {
    const x = M + i * (cw2 + 0.3), h = cw2 / img.ratio;
    imagenConMarco(s, img.data, x, 1.85, cw2, h, `Captura ${b.trim()}`);
    texto(s, [{ text: b, options: { bold: true } }, { text: d }], { x, y: 1.85 + h + 0.2, w: cw2, h: 0.75, fontSize: 15 });
  });
  texto(s, 'Cifras simuladas para la demo.', { x: M, y: 6.5, w: 5, h: 0.3, fontSize: 11, color: C.text2 });
  s.addNotes(`(Respaldo de la demo, ≈30 s) Gerencia pregunta en lenguaje natural. A «¿Qué campaña apago y cuál escalo?», el Copiloto coordina a Capital, Lupa y Horizonte y responde con el ROAS de cada campaña. A Lupa le preguntamos cómo cambiar el mensaje: propone un anuncio que habla de familia y tasa, y aclara que no es un préstamo. Las cifras de la demo son simuladas, pero siguen la estructura real de la base de Brasper.`);

  /* ===== 18 · Impacto ===== */
  s = lamina('CONTENIDO', 'Impacto', 'IMPACTO', 'Lo que cambia para Brasper');
  const cambios = [
    ['Comprobante', '2–3 días después', 'Minutos después de cerrar la operación'],
    ['Tipeo', 'Dos veces por operación', 'Ninguno'],
    ['Revisión', 'Cada operación', 'Solo las excepciones, con su motivo'],
    ['Crecer a 1000 al día', 'Contratar más personas', 'El mismo equipo'],
    ['Campañas', 'Etiquetas a mano', 'Cada cliente unido a su anuncio'],
    ['Liquidez', 'Excel cada hora', 'Alertas automáticas y un plan de acción']
  ];
  const cbx = 3.8, cbw = 3.95, ccx = 8.45, ccw = W - M - ccx;
  texto(s, 'HOY', { x: cbx, y: 1.85, w: cbw, h: 0.32, fontSize: 12, bold: true, color: C.accent5, charSpacing: 2 });
  texto(s, 'CON BRASPER IA', { x: ccx, y: 1.85, w: ccw, h: 0.32, fontSize: 12, bold: true, color: C.accent1, charSpacing: 2 });
  cambios.forEach(([l, a, b], i) => {
    const y = 2.3 + i * 0.7;
    texto(s, l, { x: M, y, w: 3.0, h: 0.6, fontSize: 16, bold: true, valign: 'middle', fontFace: HEAD });
    tarjeta(s, cbx, y, cbw, 0.6, { fill: tinte(C.accent5, 92), r: 0.1, name: `Hoy ${l}` });
    texto(s, a, { x: cbx + 0.2, y, w: cbw - 0.4, h: 0.6, fontSize: 15, valign: 'middle' });
    flecha(s, cbx + cbw + 0.15, y + 0.3, ccx - 0.15, y + 0.3, { width: 1.5, name: `Flecha ${l}` });
    tarjeta(s, ccx, y, ccw, 0.6, { fill: tinte(C.accent4, 88), r: 0.1, name: `Con Brasper IA ${l}` });
    texto(s, b, { x: ccx + 0.2, y, w: ccw - 0.4, h: 0.6, fontSize: 15, bold: true, valign: 'middle' });
  });
  s.addNotes(`(≈40 s) En resumen, esto es lo que cambia. El comprobante pasa de 2 o 3 días a minutos después de cerrar la operación. El tipeo desaparece. La revisión ya no es de cada operación, sino solo de las excepciones, con su motivo. Brasper puede crecer hacia 1000 operaciones al día con el mismo equipo. Y en la parte comercial, cada cliente queda unido al anuncio que lo trajo, y la liquidez se vigila sola, con alertas y un plan de acción.`);

  /* ===== 19 · Próximos pasos ===== */
  s = lamina('CONTENIDO', 'Impacto', 'PRÓXIMOS PASOS', 'Cómo lo llevamos a producción');
  const fases = [
    ['FASE 1', 'Piloto Perú → Brasil', ['El robot factura desde el dashboard actual', 'La IA valida cada PDF', 'Panel de excepciones y auditoría']],
    ['FASE 2', 'Adiós a KeyFácil', ['Emisión directa por API ante SUNAT', 'Omie se queda: el robot lo llena por su API', 'El PDF llega solo al cliente']],
    ['FASE 3', 'ARM con datos reales', ['Captura de UTM e IDs de clic en la web', 'Rastro, Caudal y Bitácora en vivo', 'Copiloto para gerencia']]
  ];
  s.addShape(pres.shapes.LINE, { x: M + 0.45, y: 2.12, w: CW - 0.9, h: 0, line: { color: C.accent1, width: 2, transparency: 60 }, objectName: 'Línea de tiempo' });
  fases.forEach(([k, t, items], i) => {
    const x = M + i * (pw + 0.3);
    s.addShape(pres.shapes.OVAL, { x: x + 0.27, y: 1.94, w: 0.36, h: 0.36, fill: { color: C.accent1 }, line: { color: C.background1, width: 2.5 }, objectName: `Hito ${k}` });
    tarjeta(s, x, 2.5, pw, 3.3, { name: `${k} ${t}` });
    texto(s, k, { x: x + 0.3, y: 2.78, w: pw - 0.6, h: 0.3, fontSize: 12, bold: true, color: C.accent1, charSpacing: 2 });
    texto(s, t, { x: x + 0.3, y: 3.1, w: pw - 0.6, h: 0.5, fontSize: 20, bold: true, fontFace: HEAD });
    texto(s, items.map((it, j) => ({ text: it, options: { bullet: { indent: 14 }, breakLine: j < items.length - 1 } })), { x: x + 0.3, y: 3.75, w: pw - 0.6, h: 1.85, fontSize: 14, paraSpaceAfter: 8 });
  });
  tarjeta(s, M, 6.05, CW, 0.65, { fill: tinte(C.accent1, 91), r: 0.12, name: 'Siempre' });
  await icono(s, 'shield', G.marca, M + 0.25, 6.165, 0.42);
  texto(s, [{ text: 'En todas las fases: ', options: { bold: true } }, { text: 'supervisión humana (D.S. 115-2025-PCM), IA local y consentimiento de datos (Ley 29733).' }], { x: M + 0.85, y: 6.05, w: CW - 1.1, h: 0.65, fontSize: 14, valign: 'middle' });
  s.addNotes(`(≈40 s) Proponemos llevarlo a producción en tres fases.
Primero, un piloto en la ruta Perú → Brasil, que es el alcance acordado: el robot factura desde el dashboard actual, la IA valida cada PDF y contabilidad ve las excepciones en un panel.
Segundo, cumplir el pedido de Brasper de dejar KeyFácil: emisión directa por API ante SUNAT, aprovechando el módulo que su equipo de TI ya está construyendo, y Omie se mantiene para Brasil, llenado por su API.
Tercero, el ARM con datos reales: capturar UTM e IDs de clic en la web y poner en marcha a Rastro, Caudal y Bitácora.
En todas las fases hay supervisión humana, IA local y consentimiento de datos.`);

  /* ===== 20 · Cierre ===== */
  s = lamina('CIERRE', 'Cierre', 'GRACIAS', 'Que nadie tenga que tocar una operación entre el dashboard y el cliente', 'Brasper IA · Equipo Ellenistas · IAthon 2026');
  mascotas(s, [8.45, 9.95, 11.45], [1.5, 3.95], 1.3);
  s.addNotes(`(≈15 s) Ese es nuestro objetivo: que nadie tenga que tocar una operación entre el registro en el dashboard y la entrega del comprobante al cliente. Y que los datos que Brasper ya tiene trabajen para gerencia. Muchas gracias; quedamos atentos a sus preguntas.`);
}

/* ---------- Tema de colores dentro del .pptx ---------- */
async function aplicarTema(archivoPptx) {
  const zip = await JSZip.loadAsync(fs.readFileSync(archivoPptx));
  const parte = 'ppt/theme/theme1.xml';
  const slots = ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
  const esquema = `<a:clrScheme name="${THEME.name}">` + slots.map(k => `<a:${k}><a:srgbClr val="${THEME.colors[k]}"/></a:${k}>`).join('') + '</a:clrScheme>';
  const xml = (await zip.file(parte).async('string'))
    .replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, () => esquema)
    .replace(/(<a:(?:theme|fontScheme)\b[^>]*?\bname=")[^"]*"/g, (_, cabeza) => `${cabeza}${THEME.name}"`);
  if (!xml.includes(esquema)) throw new Error('No se encontró el esquema de colores en ' + parte);
  zip.file(parte, xml);
  // Un color de tema pasado a una opción que solo acepta hex queda como srgbClr inválido: detenerse aquí
  for (const nombre of Object.keys(zip.files).filter(n => n.endsWith('.xml'))) {
    const malos = [...(await zip.file(nombre).async('string')).matchAll(/<a:srgbClr val="([^"]*)"/g)].map(m => m[1]).filter(v => !/^[0-9A-Fa-f]{6}$/.test(v));
    if (malos.length) throw new Error(`${nombre} tiene colores inválidos: ${[...new Set(malos)].join(', ')}`);
  }
  fs.writeFileSync(archivoPptx, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

(async () => {
  await construir();
  await pres.writeFile({ fileName: SALIDA });
  await aplicarTema(SALIDA);
  console.log('Listo:', path.relative(process.cwd(), SALIDA), `(${(fs.statSync(SALIDA).size / 1e6).toFixed(1)} MB)`);
})().catch(e => { console.error(e); process.exit(1); });
