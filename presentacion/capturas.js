/* Toma las capturas de la demo (frontend) que usa el pitch y exporta las mascotas de los agentes.
   Levanta su propio servidor estático, así que no hace falta tener otro corriendo.
   Uso: npm run capturas   →   escribe en assets/ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DEMO = path.resolve(__dirname, '..', 'frontend');
const OUT = path.join(__dirname, 'assets');
const VIEW = { width: 1440, height: 810 };
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };

function servir() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || '_preview.html';
    const file = path.resolve(DEMO, rel);
    if (!file.startsWith(DEMO + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(ok => server.listen(0, '127.0.0.1', () => ok(server)));
}

const foto = (page, nombre) => page.screenshot({ path: path.join(OUT, nombre + '.jpg'), type: 'jpeg', quality: 84 }).then(() => console.log('  ✓', nombre));
const esperar = (page, fn, arg, timeout = 120000) => page.waitForFunction(fn, arg, { timeout });

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await servir();
  const base = `http://127.0.0.1:${server.address().port}/_preview.html`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.error('  ! error en la página:', e.message));
  await page.goto(base, { waitUntil: 'networkidle' });

  console.log('RPA');
  // La demo abre en el ARM (pestaña 1): primero se pasa a la pestaña del RPA
  await page.click('.ptab[data-go="rpa"]');
  await page.click('#launcher');
  await page.waitForSelector('#rpa-root.active');
  await page.waitForTimeout(1600);
  await page.click('#run-btn');
  // Segunda operación (PxB → KeyFácil) a medio llenar, con un dato en vuelo
  await esperar(page, () => document.querySelector('#k-done').textContent.startsWith('1/'));
  await esperar(page, () => document.querySelector('#bview .kf') && document.querySelectorAll('#bview input.filled').length >= 9 && document.querySelector('.packet'));
  await foto(page, 'rpa-trabajando');

  // PxB-001529 no cuadra y se aparta para revisión humana
  await esperar(page, () => document.querySelector('#rules .rule.bad') && document.querySelector('#toast.show.bad'));
  await page.waitForTimeout(500);
  await foto(page, 'rpa-revision');

  await page.click('#spd-seg button[data-s="5"]');
  await esperar(page, () => /Reiniciar demo/.test(document.querySelector('#run-btn').textContent), null, 300000);
  await page.waitForTimeout(900);
  await foto(page, 'rpa-final');

  console.log('ARM');
  await page.click('.ptab[data-go="web"]');
  await page.waitForSelector('#arm-float');
  await page.waitForTimeout(400);
  await foto(page, 'web-dashboard');
  await page.click('#arm-float');
  await esperar(page, () => document.querySelectorAll('.boot .ba.on').length === 6, null, 20000);
  await page.waitForTimeout(250);
  await foto(page, 'portal');
  await esperar(page, () => !document.querySelector('.boot') && document.querySelector('#stage-arm.on'), null, 20000);
  await page.waitForTimeout(1200);
  await foto(page, 'arm-centro');

  await page.click('.sug[data-cq="1"]');
  await page.waitForTimeout(1500);
  await page.evaluate(() => { const r = document.querySelector('.ask').getBoundingClientRect(); window.scrollBy(0, r.top - 70); });
  await page.waitForTimeout(400);
  await foto(page, 'arm-copiloto');

  async function agente(id, q, nombre) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.click(`.arm-rail [data-view="${id}"]`);
    await page.waitForSelector('#chat-sugs');
    await page.click(`#chat-sugs .sug[data-q="${q}"]`);
    await esperar(page, () => !document.querySelector('#msgs .thinking'), null, 10000);
    await page.waitForTimeout(700);
    await page.evaluate(() => { const r = document.querySelector('.work').getBoundingClientRect(); window.scrollBy(0, r.top - 70); });
    await page.waitForTimeout(300);
    await foto(page, nombre);
  }
  await agente('capital', 0, 'arm-capital');
  await agente('caudal', 1, 'arm-caudal');
  await agente('lupa', 2, 'arm-lupa');

  console.log('Mascotas');
  const svgs = await page.evaluate(() => ARM.AG.map(a => ({ id: a.id, svg: ARM.mascot(a.id, 480) })));
  const pm = await ctx.newPage();
  await pm.setContent(`<html><body style="margin:0;background:transparent">${svgs.map(s => `<div id="m-${s.id}" style="display:inline-block">${s.svg}</div>`).join('')}</body></html>`);
  for (const s of svgs) {
    await pm.locator(`#m-${s.id} svg`).screenshot({ path: path.join(OUT, `mascota-${s.id}.png`), omitBackground: true });
    console.log('  ✓ mascota-' + s.id);
  }

  await browser.close();
  server.close();
})().catch(e => { console.error(e); process.exit(1); });
