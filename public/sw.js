/*
 * Service worker da Pokédex.
 *
 * Escrito à mão de propósito: o projeto não tem dependência pesada nenhuma, e
 * o que precisamos aqui cabe em um arquivo — não vale trazer Workbox para isso.
 *
 * No build, `vite-plugin-sw.ts` troca os dois marcadores abaixo pela versão e
 * pela lista de arquivos do bundle. É isso que deixa o app inteiro disponível
 * offline depois da primeira visita — inclusive rotas nunca abertas e o core
 * do emulador (as ROMs e os saves já ficam no IndexedDB).
 *
 * Três caches, para poder limpar um sem derrubar os outros:
 *  - BUILD: o bundle desta versão (JS, CSS, wasm, HTML). Nomes com hash, então
 *    cache primeiro; o de um deploy anterior é apagado ao ativar.
 *  - RUNTIME: o resto da mesma origem, sobretudo os 1.342 sprites (4,4 MB).
 *    Sem versão: um deploy não joga fora o que a pessoa já baixou.
 *  - API: respostas da PokéAPI, com teto de entradas.
 */
const VERSION = "__SW_VERSION__";
const PRECACHE = /*__SW_PRECACHE__*/ [];

const BUILD = `pokedex-build-${VERSION}`;
const RUNTIME = "pokedex-runtime-v1";
const API = "pokedex-api-v1";
const NOSSOS = [BUILD, RUNTIME, API];

const SHELL_URL = "/index.html";

/**
 * Teto do cache da PokéAPI. A ficha de um pokémon tem 100–300 KB (a lista de
 * golpes é grande); sem teto, quem navega muito enche o disco sem saber. Com
 * 400 entradas fica na casa de dezenas de MB, e o que sai é o mais antigo.
 */
const MAX_API = 400;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(BUILD);
      // Um por um e sem abortar: um arquivo que falhe não pode impedir o
      // worker de instalar — ele só fica de fora do offline.
      await Promise.allSettled(PRECACHE.map((url) => cache.add(url)));
      // Assumir o controle já na primeira visita, sem esperar a aba fechar.
      await self.skipWaiting();
    })()
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
 * Guarda a resposta e devolve ela. Só 200 não opaco entra no cache: resposta
 * de erro cacheada vira um erro permanente que ninguém entende depois.
 */
async function guardar(cacheName, request, response) {
  if (response && response.ok && response.type !== "opaque") {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    if (cacheName === API) await aparar(cache);
  }
  return response;
}

/**
 * Tira as entradas mais antigas acima do teto. `keys()` vem em ordem de
 * inserção, e regravar uma entrada a manda para o fim — então o que sai é o
 * que não foi visto há mais tempo.
 */
async function aparar(cache) {
  const keys = await cache.keys();
  const sobra = keys.length - MAX_API;
  for (let i = 0; i < sobra; i++) await cache.delete(keys[i]);
}

/**
 * Devolve o cache na hora e atualiza por trás.
 *
 * É a política certa para sprites e PokéAPI: praticamente não mudam, então
 * esperar a rede a cada visita seria pagar latência por nada — mas a
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
    // atualização nunca chega a ser gravada.
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

  // Pastas locais de dev/preview (ROMs e saves do disco): nunca pelo cache. Um
  // save devolvido do cache é o progresso de antes da última gravação, e uma
  // ROM de 32 MB não tem por que ser duplicada aqui.
  if (url.origin === self.location.origin && url.pathname.startsWith("/local-")) return;

  // Navegação: é uma SPA, então qualquer rota resolve para o mesmo HTML. Rede
  // primeiro, para pegar um deploy novo; o HTML do cache quando não há rede.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => guardar(BUILD, SHELL_URL, response))
        .catch(async () => {
          const cache = await caches.open(BUILD);
          return (
            (await cache.match(SHELL_URL, { ignoreVary: true })) ??
            (await cache.match("/", { ignoreVary: true })) ??
            Response.error()
          );
        })
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        // Arquivo do build: nome com hash, nunca muda — cache primeiro, sem
        // revalidar. `ignoreVary` é obrigatório: o servidor responde com
        // `Vary: Origin`, o pré-cache gravou a entrada com um pedido sem Origin, e
        // o Vite pede o CSS de rota com `crossorigin` — com Origin. Medido: sem
        // isto o match falhava e a rota caía offline com o arquivo no cache.
        const doBuild = await caches.open(BUILD).then((c) => c.match(request, { ignoreVary: true }));
        return doBuild ?? cacheERevalida(event, RUNTIME);
      })()
    );
    return;
  }

  if (url.hostname === "pokeapi.co" || url.hostname.endsWith(".pokeapi.co")) {
    event.respondWith(cacheERevalida(event, API));
    return;
  }

  // Qualquer outra origem (artwork em raw.githubusercontent, fontes) segue
  // direto para a rede: não sabemos o bastante sobre elas para guardar.
});
