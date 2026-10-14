
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PUERTO = Number(process.argv[2]) || 8000;
const RAIZ = __dirname;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jfif': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const servidor = http.createServer((peticion, respuesta) => {
  const urlPedida = decodeURIComponent((peticion.url || '/').split('?')[0]);
  const relativa = urlPedida === '/' ? '/blocka.html' : urlPedida;
  const destino = path.join(RAIZ, relativa);

  if (!destino.startsWith(RAIZ)) {
    respuesta.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    respuesta.end('403 - Ruta fuera del proyecto');
    return;
  }

  fs.readFile(destino, (error, contenido) => {
    if (error) {
      respuesta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      respuesta.end(`404 - No se encontró: ${relativa}`);
      return;
    }

    const extension = path.extname(destino).toLowerCase();
    respuesta.writeHead(200, {
      'Content-Type': TIPOS[extension] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    respuesta.end(contenido);
  });
});

servidor.listen(PUERTO, () => {
  console.log(`Sirviendo ${RAIZ}`);
  console.log(`Entrá a:  http://localhost:${PUERTO}/blocka.html`);
  console.log('Para cortar el servidor: Ctrl + C');
});