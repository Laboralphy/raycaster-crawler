#!/usr/bin/env node
// Mini serveur HTTP statique, sans dépendance.
// Usage : node server.js [port]   (défaut : 8080)

const http = require('http');
const fs = require('fs');
const path = require('path');
const { generateLaby, GENERATORS } = require('./laby');

const ROOT = __dirname;
const PORT = Number(process.argv[2] || process.env.PORT || 8080);

// Seuls ces fichiers à la racine + tout le dossier resources/ sont servis.
const ROOT_FILES = new Set(['index.html', 'crawler.js', 'styles.css']);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(body);
}

// Générateur de labyrinthe. Le jeu l'appelle toujours à l'adresse de
// l'ancien script PHP : ?g=générateur&s=graine&o=options
const LABY_URL = '/dynamics/laby/laby.php';
// Valeur maximale d'une option : au-delà, la génération (synchrone)
// bloquerait le serveur. Le jeu n'utilise que des valeurs de 0 à 3.
const LABY_MAX_OPTION = 20;

function serveLaby(req, res) {
  const q = new URL(req.url, 'http://localhost').searchParams;
  const g = q.get('g') || '';
  const s = q.get('s') || '0';
  const o = q.get('o') || '';
  if (!GENERATORS.includes(g) || !/^-?\d+$/.test(s) || !/^(-[a-z]+\d+)*$/i.test(o) ||
      (o.match(/\d+/g) || []).some((n) => Number(n) > LABY_MAX_OPTION)) {
    return send(res, 400, 'Bad Request');
  }
  let sJSON;
  try {
    sJSON = generateLaby(g, s, o).renderJSON();
  } catch (e) {
    console.error(`[laby g=${g} s=${s} o=${o}]`, e);
    return send(res, 500, 'Laby generator failed');
  }
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
  res.end(req.method === 'HEAD' ? undefined : sJSON);
}

function isAllowed(rel) {
  return ROOT_FILES.has(rel) || rel.startsWith('resources' + path.sep);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, 'Method Not Allowed');
  }

  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return send(res, 400, 'Bad Request');
  }
  if (urlPath === '/') urlPath = '/index.html';
  if (urlPath === LABY_URL) {
    res.on('finish', () => console.log(`${res.statusCode} ${req.method} ${req.url}`));
    return serveLaby(req, res);
  }

  const filePath = path.resolve(ROOT, '.' + urlPath);
  const rel = path.relative(ROOT, filePath);
  if (rel.startsWith('..') || path.isAbsolute(rel) || !isAllowed(rel)) {
    return send(res, 404, 'Not Found');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not Found');

    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    const headers = {
      'Content-Type': type,
      'Content-Length': stat.size,
      'Last-Modified': stat.mtime.toUTCString(),
      'Cache-Control': 'no-cache',
    };

    if (req.headers['if-modified-since'] &&
        new Date(req.headers['if-modified-since']) >= new Date(stat.mtime.toUTCString())) {
      res.writeHead(304, headers);
      return res.end();
    }

    res.writeHead(200, headers);
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });

  res.on('finish', () => console.log(`${res.statusCode} ${req.method} ${req.url}`));
});

server.listen(PORT, () => {
  console.log(`Serveur statique sur http://localhost:${PORT}/`);
});
