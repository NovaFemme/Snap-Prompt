'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HOST = '127.0.0.1';
const DEFAULT_PORT = 5174;

let server = null;

function startApiServer({ userDataPath, port = DEFAULT_PORT, token }) {
  if (server) throw new Error('API server already running');

  const authToken = token || crypto.randomBytes(24).toString('hex');
  const DATA_FILE = path.join(userDataPath, 'snap-prompts.json');
  const CONFIGS_FILE = path.join(userDataPath, 'user-configs.json');

  const readJson = (file, fallback) => {
    try {
      if (!fs.existsSync(file)) return fallback;
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch (err) {
      console.error(`[api] cannot read ${path.basename(file)}:`, err.message);
      return fallback;
    }
  };

  const typeOf = (record) => (record.type || 'image').toLowerCase();

  const strip = (record, includeImage) => {
    if (includeImage) return record;
    const { image, ...rest } = record;
    return { ...rest, hasImage: Boolean(image) };
  };

  const send = (res, status, body) => {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload),
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '127.0.0.1',
    });
    res.end(payload);
  };

  const authorised = (req) => {
    const header = req.headers.authorization || '';
    const supplied = header.startsWith('Bearer ') ? header.slice(7) : '';
    const a = Buffer.from(supplied);
    const b = Buffer.from(authToken);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  };

  server = http.createServer((req, res) => {
    if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed' });
    if (!authorised(req)) return send(res, 401, { error: 'Unauthorized' });

    const parsed = new URL(req.url, `http://${HOST}:${port}`);
    const segments = parsed.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    const q = parsed.searchParams;

    // GET /api/health
    if (segments.length === 2 && segments[1] === 'health') {
      return send(res, 200, {
        status: 'ok',
        source: 'electron',
        libraryExists: fs.existsSync(DATA_FILE),
      });
    }

    // GET /api/config  and  /api/config/{key}
    if (segments[1] === 'config') {
      const configs = readJson(CONFIGS_FILE, {});
      if (segments.length === 2) return send(res, 200, configs);
      const key = decodeURIComponent(segments[2]).toLowerCase();
      if (!(key in configs)) return send(res, 404, { error: `No such key: ${key}` });
      return send(res, 200, { key, values: configs[key] });
    }

    if (segments[1] !== 'prompts') return send(res, 404, { error: 'Not found' });

    const all = readJson(DATA_FILE, []);

    // GET /api/prompts/{id}  and  /api/prompts/{id}/image
    if (segments.length >= 3) {
      const id = decodeURIComponent(segments[2]);
      const record = all.find((r) => String(r.id) === id);
      if (!record) return send(res, 404, { error: `No prompt with id ${id}` });

      if (segments[3] === 'image') {
        const uri = record.image || '';
        const match = /^data:(image\/[a-z+]+);base64,(.*)$/is.exec(uri);
        if (!match) return send(res, 404, { error: 'No image on this record' });
        const buffer = Buffer.from(match[2], 'base64');
        res.writeHead(200, { 'Content-Type': match[1], 'Content-Length': buffer.length });
        return res.end(buffer);
      }

      return send(res, 200, strip(record, q.get('include_image') === '1'));
    }

    // GET /api/prompts
    const wantType = (q.get('type') || '').toLowerCase();
    const favourite = q.get('favourite');
    const search = (q.get('q') || '').trim().toLowerCase();
    const limit = Math.min(parseInt(q.get('limit') || '100', 10) || 100, 500);
    const offset = Math.max(parseInt(q.get('offset') || '0', 10) || 0, 0);
    const includeImage = q.get('include_image') === '1';

    let rows = all;
    if (wantType) rows = rows.filter((r) => typeOf(r) === wantType);
    if (favourite === '1') rows = rows.filter((r) => r.favourite === true);
    if (favourite === '0') rows = rows.filter((r) => r.favourite !== true);
    if (search) {
      rows = rows.filter((r) =>
        [r.title, r.positive, r.prompt, r.tags, r.comment]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(search))
      );
    }

    rows.sort((a, b) => String(b.promptDate || '').localeCompare(String(a.promptDate || '')));

    return send(res, 200, {
      total: rows.length,
      limit,
      offset,
      items: rows.slice(offset, offset + limit).map((r) => strip(r, includeImage)),
    });
  });

  server.listen(port, HOST, () => {
    console.log(`[api] listening on http://${HOST}:${port}`);
  });

  server.on('error', (err) => {
    console.error('[api] failed to start:', err.message);
    server = null;
  });

  return {
    port,
    token: authToken,
    close: () => {
      if (server) server.close();
      server = null;
    },
  };
}

function stopApiServer() {
  if (server) {
    server.close();
    server = null;
  }
}

module.exports = { startApiServer, stopApiServer };
