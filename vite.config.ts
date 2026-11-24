import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// A single app shell plus Vite's content-hashed local assets, including the bundled programme.
function offlineShell(): Plugin {
  return {
    name: 'weight-and-rings-offline',
    apply: 'build',
    enforce: 'post',
    generateBundle: {
      order: 'post',
      handler(_, bundle) {
        // Vite copies public files separately from the emitted bundle.
        const publicFiles = ['favicon.svg', 'assets/app-icon.svg', 'assets/app-icon.png'];
        const redirect = readFileSync(new URL('./public/404.html', import.meta.url), 'utf8');
        const sessions: { id: string }[] = JSON.parse(readFileSync(new URL('./src/data/chiSessions.json', import.meta.url), 'utf8'));
        const routes = ['today', 'vessel', 'rings', 'pause', 'saved', 'list'];
        for (const { id } of sessions) {
          routes.push('rings/' + id);
          for (let year = 2023; year <= 2027; year++) routes.push('rings/' + id + '/' + year);
        }
        const files = [...new Set([...Object.keys(bundle), ...publicFiles])].sort();
        for (const route of routes) {
          this.emitFile({ type: 'asset', fileName: route + '/index.html', source: redirect });
        }
        const source = `
const scope = self.registration.scope;
const prefix = 'weight-and-rings:' + scope + ':';
const name = prefix + '__BUILD_VERSION__';
const files = ${JSON.stringify(files)}.map(file => file === 'index.html' ? scope : new URL(file, scope).href);
const routes = new Set(${JSON.stringify(routes)});
self.addEventListener('install', event => {
  event.waitUntil(caches.open(name).then(cache => cache.addAll(files)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(prefix) && key !== name) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const relative = url.origin + url.pathname;
  if (req.mode === 'navigate' && relative.startsWith(scope)) {
    const path = relative.slice(scope.length).replace(/(?:[/]?index[.]html|[/])$/, '');
    if (routes.has(path)) {
      event.respondWith(Response.redirect(scope + url.search + '#/' + path, 302));
      return;
    }
    if (path !== '') return;
    event.respondWith((async () => {
      // An open app may still have yesterday's shell cached. Use the current
      // shell on an online navigation and fall back to the precache offline.
      try { return await fetch(req, { cache: 'no-cache' }); }
      catch {
        const cached = await caches.match(scope, { cacheName: name, ignoreVary: true });
        return cached ? new Response(cached.body, { status: cached.status, headers: cached.headers }) : Response.error();
      }
    })());
    return;
  }
  if (!files.includes(req.url)) return;
  // These same-origin files are immutable within this build. Module requests
  // may carry an Origin header that the installation request did not send.
  event.respondWith(caches.open(name).then(async cache => (await cache.match(req, { ignoreVary: true })) || fetch(req)));
});
`;
        const html = bundle['index.html'];
        const hash = createHash('sha256').update(source);
        if (html.type === 'asset') hash.update(html.source);
        for (const icon of publicFiles) hash.update(readFileSync(new URL('./public/' + icon, import.meta.url)));
        const version = hash.digest('hex').slice(0, 16);
        this.emitFile({ type: 'asset', fileName: 'sw.js', source: source.replace('__BUILD_VERSION__', version) });
      },
    },
  };
}
export default defineConfig({
  // Hash routes share one shell. Relative assets support both a root domain
  // and the trailing-slash project URL used by GitHub Pages.
  base: './',
  plugins: [react(), tailwindcss(), offlineShell()],
});
