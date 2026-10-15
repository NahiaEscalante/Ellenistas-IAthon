/* Sirve la demo (carpeta frontend/) en http://localhost:PORT sin instalar nada.
   El puerto sale de la variable PORT o del archivo .env (ver .env.example); por defecto, 8765.
   Uso: npm start */
const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const DEMO = path.join(RAIZ, 'frontend');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.md': 'text/markdown; charset=utf-8' };

// Lee .env si existe, sin depender de librerías externas
const env = path.join(RAIZ, '.env');
if (fs.existsSync(env)) {
  for (const linea of fs.readFileSync(env, 'utf8').split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}
const PORT = Number(process.env.PORT) || 8765;

http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || '_preview.html';
  const archivo = path.resolve(DEMO, rel);
  if (!archivo.startsWith(DEMO + path.sep) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) {
    res.writeHead(404); res.end('No encontrado'); return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(archivo)] || 'application/octet-stream' });
  fs.createReadStream(archivo).pipe(res);
}).listen(PORT, () => console.log(`Demo de Brasper IA en http://localhost:${PORT}`));
