/*
 * Service worker da Pokédex.
 *
 * Escrito à mão de propósito: o projeto não tem dependência pesada nenhuma, e
 * o que precisamos aqui cabe em um arquivo — não vale trazer Workbox e um
 * passo de build para isso.
 *
 * A Pokédex é quase toda local: 1.342 sprites, 36 de item e toda a lore vivem
 * no próprio bundle. O que falta para funcionar sem rede é guardar a casca do
 * app e as respostas da PokéAPI já vistas.
 *
 * Três caches separados, para poder limpar um sem derrubar os outros:
 *  - SHELL: o HTML de entrada, servido para qualquer rota (é uma SPA)
 *  - STATIC: JS, CSS, sprites, fontes, o core do emulador
 *  - API: respostas da PokéAPI
 */
const VERSION = "v1";
const SHELL = `pokedex-shell-${VERSION}`;
const STATIC = `pokedex-static-${VERSION}`;
const API = `pokedex-api-${VERSION}`;
const NOSSOS = [SHELL, STATIC, API];

const SHELL_URL = "/index.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.add(SHELL_URL))
      // Assumir o controle já na primeira visita, sem esperar a aba fechar.
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name.startsWith("pokedex-") && !NOSSOS.includes(name))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

/**
 * Guarda a resposta e devolve ela. Só 200 opaco-livre entra no cache: resposta
 * de erro cacheada vira um erro permanente que ninguém entende depois.
 */
async function guardar(cacheName, request, response) {
  if (response && response.ok && response.type !== "opaque") {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

/**
 * Devolve o cache na hora e atualiza por trás.
 *
 * É a política certa aqui: sprites e dados da PokéAPI praticamente não mudam,
 * então esperar a rede a cada visita seria pagar latência por nada — mas a
 * revalidação garante que uma correção chega na visita seguinte.
 */
async function cacheERevalida(event, cacheName) {
  const { request } = event;
  const cache = await caches.open(cacheName);
  const cacheado = await cache.match(request);

  const naRede = fetch(request)
    .then((response) => guardar(cacheName, request, response))
    .catch(() => undefined);

  if (cacheado) {
    // `waitUntil` mantém o worker vivo até a revalidação terminar. Sem isso o
    // navegador pode encerrá-lo assim que respondemos do cache, e a
    // atualização nunca chega a ser gravada — o cache congelaria na primeira
    // versão vista.
    event.waitUntil(naRede);
    return cacheado;
  }
  const response = await naRede;
  if (response) return response;
  throw new Error("sem rede e sem cache");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Navegação: é uma SPA com BrowserRouter, então qualquer rota resolve para o
  // mesmo HTML. Rede primeiro, para pegar um deploy novo; casca do cache
  // quando não há rede — é isso que faz /lore abrir offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => guardar(SHELL, SHELL_URL, response))
        .catch(async () => {
          const cache = await caches.open(SHELL);
          const casca = await cache.match(SHELL_URL);
          return casca ?? Response.error();
        })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheERevalida(event, STATIC));
    return;
  }

  if (url.hostname === "pokeapi.co" || url.hostname.endsWith(".pokeapi.co")) {
    event.respondWith(cacheERevalida(event, API));
    return;
  }

  // Qualquer outra origem (artwork da PokéAPI em raw.githubusercontent, fontes)
  // segue direto para a rede: não sabemos o bastante sobre elas para guardar.
});
