/**
 * Mede a velocidade do emulador, em quadros **emulados** por segundo.
 *
 *   npm run dev          # noutro terminal, o servidor precisa estar de pe
 *   npm run bench
 *   npm run bench -- --rom "Unbound" --turbo 10
 *
 * Compara as duas pontas que importam:
 *
 * - `dev/teste-core.html`, o core sozinho num canvas, sem React e sem a
 *   Pokedex em volta. E o teto da maquina.
 * - `/jogar`, a pagina de verdade, com o turbo acionado como quem joga o
 *   aciona: um evento de tecla Espaco, passando por `shortcutFor` ->
 *   `setTurbo` -> `aplicarVelocidade`. Chamar `setFastForwardMultiplier` na
 *   mao mediria um caminho que ninguem percorre.
 *
 * A distancia entre as duas e o diagnostico: se a `/jogar` fica atras, o que
 * sobra esta sendo gasto pela pagina, nao pelo core.
 *
 * ### Por que Chrome headless e nao o navegador aberto
 *
 * O instrumento e o `keysReadCallback`, que o core dispara uma vez por quadro
 * emulado — ao contrario do `showFpsCounter`, que conta o laco de render e ja
 * levou duas analises a conclusoes erradas.
 *
 * E o laco do core anda por `requestAnimationFrame`, que o navegador congela em
 * aba escondida: numa aba que nao esta a vista a medida da **zero**, nao um
 * numero menor. Mexer em `setMainLoopTiming` nao contorna, porque os callbacks
 * do core sao proxados para a thread principal, que nao bombeia. Entao a
 * medicao precisa de uma aba de verdade, visivel — e um Chrome headless e
 * exatamente isso sem precisar de uma janela na frente de ninguem.
 *
 * Sem dependencia nenhuma: o CDP anda por WebSocket, que o Node traz desde a
 * 22. So o binario do Chrome e externo — `CHROME=/caminho/do/chrome` se o seu
 * nao estiver num dos lugares de sempre.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.BENCH_URL ?? "http://localhost:3000";
const PORTA_CDP = 9333;
/** Um GBA roda a 59,7275 quadros por segundo, nao a 60. Ver mgbaDefaults.ts. */
const QPS_NATIVO = 59.7275;

const args = process.argv.slice(2);
const opcao = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : padrao;
};
const romPedida = opcao("rom", "");
const amostras = Number(opcao("amostras", "3"));
/** Pontos da barra de velocidade a conferir: `--barras 2,5,10`. */
const barras = opcao("barras", "2,5,10")
  .split(",")
  .map((v) => Number(v.trim()))
  .filter((v) => Number.isInteger(v) && v >= 1);

const CAMINHOS_CHROME = [
  process.env.CHROME,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const media = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

async function esperar(url, tentativas = 60) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
    } catch {
      /* ainda subindo */
    }
    await sleep(250);
  }
  throw new Error(`sem resposta em ${url}`);
}

/** Uma sessao CDP: manda comando, espera a resposta com o mesmo id. */
function sessao(ws) {
  let id = 0;
  const pendentes = new Map();
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    const p = pendentes.get(msg.id);
    if (!p) return;
    pendentes.delete(msg.id);
    if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
    else p.resolve(msg.result);
  });
  const enviar = (method, params = {}) => {
    const atual = ++id;
    ws.send(JSON.stringify({ id: atual, method, params }));
    return new Promise((resolve, reject) =>
      pendentes.set(atual, { resolve, reject })
    );
  };
  return {
    enviar,
    fechar: () => ws.close(),
    async avaliar(expressao) {
      const r = await enviar("Runtime.evaluate", {
        expression: expressao,
        awaitPromise: true,
        returnByValue: true,
      });
      if (r.exceptionDetails) {
        throw new Error(
          r.exceptionDetails.exception?.description ??
            JSON.stringify(r.exceptionDetails)
        );
      }
      return r.result.value;
    },
  };
}

async function conectar(url) {
  const ws = new WebSocket(url);
  await new Promise((ok, erro) => {
    ws.addEventListener("open", ok, { once: true });
    ws.addEventListener("error", erro, { once: true });
  });
  return sessao(ws);
}

async function subirChrome() {
  const binario = CAMINHOS_CHROME.find((c) => existsSync(c));
  if (!binario) {
    console.error(
      "nao achei o Chrome. Aponte com CHROME=<caminho do executavel>."
    );
    process.exit(2);
  }
  const perfil = mkdtempSync(join(tmpdir(), "bench-emulador-"));
  const processo = spawn(
    binario,
    [
      "--headless=new",
      `--remote-debugging-port=${PORTA_CDP}`,
      `--user-data-dir=${perfil}`,
      "--no-first-run",
      "--no-default-browser-check",
      // A aba tem que continuar viva e desenhando: e do rAF dela que o laco
      // do core depende.
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--autoplay-policy=no-user-gesture-required",
      "--window-size=1600,1000",
      "about:blank",
    ],
    { stdio: "ignore" }
  );
  const versao = await esperar(`http://127.0.0.1:${PORTA_CDP}/json/version`);
  return { processo, wsNavegador: versao.webSocketDebuggerUrl };
}

async function abrirAba(wsNavegador, url) {
  const navegador = await conectar(wsNavegador);
  const { targetId } = await navegador.enviar("Target.createTarget", { url });
  navegador.fechar();
  const alvos = await esperar(`http://127.0.0.1:${PORTA_CDP}/json/list`);
  const alvo = alvos.find((t) => t.id === targetId);
  if (!alvo) throw new Error(`nao consegui abrir ${url}`);
  const aba = await conectar(alvo.webSocketDebuggerUrl);
  await esperarContexto(aba);
  return aba;
}

/**
 * Espera a aba ter contexto de execucao.
 *
 * `Target.createTarget` responde assim que o alvo existe, mas o contexto de JS
 * so nasce quando o documento comeca a carregar. Avaliar antes disso devolve
 * `-32000 Cannot find default execution context` e derrubava o bench inteiro
 * antes de medir nada.
 */
async function esperarContexto(aba, limiteMs = 20000) {
  const ate = Date.now() + limiteMs;
  let ultimo;
  while (Date.now() < ate) {
    try {
      if ((await aba.avaliar("1+1")) === 2) return;
    } catch (erro) {
      ultimo = erro;
    }
    await sleep(200);
  }
  throw new Error(
    `a aba nao ganhou contexto de execucao em ${limiteMs} ms` +
      (ultimo ? ` — ultimo erro: ${ultimo.message}` : "")
  );
}

/**
 * Instala o contador de quadros emulados na aba.
 *
 * `addCoreCallbacks` mescla: passar so o `keysReadCallback` nao derruba os
 * outros que a pagina registrou, entao a `/jogar` continua medindo a si mesma
 * inteira, com o backup de save e o resto no lugar.
 */
const CONTADOR = (core) => `
  (() => {
    const core = ${core};
    if (!core) return false;
    window.__q = 0;
    core.addCoreCallbacks({ keysReadCallback: () => { window.__q++; } });
    window.__contar = async (ms, assentar = 900) => {
      await new Promise(r => setTimeout(r, assentar));
      const antes = window.__q, t = performance.now();
      await new Promise(r => setTimeout(r, ms));
      return (window.__q - antes) / ((performance.now() - t) / 1000);
    };
    return true;
  })()
`;

async function medirIsolada(wsNavegador, turbo) {
  const aba = await abrirAba(wsNavegador, `${BASE}/dev/teste-core.html`);
  try {
    for (let i = 0; i < 60 && !(await aba.avaliar(CONTADOR("window.__core__"))); i++) {
      await sleep(500);
    }
    // `#estado` so recebe o nome depois do `loadGame`. Medir antes disso mede
    // a pagina parada, e foi assim que o "normal" saiu a 0,80x uma vez.
    let rom = "";
    for (let i = 0; i < 60 && !rom; i++) {
      await sleep(500);
      rom = await aba.avaliar(`
        (() => {
          const texto = document.getElementById("estado").textContent ?? "";
          return /\\.(gb|gbc|gba)$/i.test(texto) ? texto : "";
        })()
      `);
    }
    if (!rom) throw new Error("a pagina isolada nao carregou nenhuma ROM");
    // A mesma folga que a /jogar ganha: o boot do jogo e a parte mais pesada.
    await sleep(8000);
    const normal = await aba.avaliar(`window.__contar(2500)`);
    const acelerado = [];
    for (let i = 0; i < amostras; i++) {
      await aba.avaliar(`window.__core__.setFastForwardMultiplier(${turbo})`);
      acelerado.push(await aba.avaliar(`window.__contar(2500)`));
      await aba.avaliar(`window.__core__.setFastForwardMultiplier(1)`);
      await sleep(1200);
    }
    return { rom, normal, acelerado };
  } finally {
    aba.fechar();
  }
}

async function medirJogar(wsNavegador) {
  const aba = await abrirAba(wsNavegador, `${BASE}/jogar`);
  try {
    // A biblioteca da pasta roms/ so aparece depois que o core monta o FS.
    let clicou = "";
    for (let i = 0; i < 60 && !clicou; i++) {
      await sleep(500);
      clicou = await aba.avaliar(`
        (() => {
          const botoes = [...document.querySelectorAll(".play-rom-list button")];
          const alvo = ${JSON.stringify(romPedida)}
            ? botoes.find(b => b.textContent.includes(${JSON.stringify(romPedida)}))
            : botoes[0];
          if (!alvo) return "";
          alvo.click();
          return alvo.querySelector(".play-rom-name")?.textContent ?? "carregada";
        })()
      `);
    }
    if (!clicou) throw new Error("nenhuma ROM na biblioteca — ponha uma em roms/");
    for (let i = 0; i < 90; i++) {
      await sleep(500);
      if (await aba.avaliar(`!!document.querySelector(".play-now strong")`)) break;
    }
    // Um pouco de folga: o boot do jogo e a parte mais pesada, e medir em cima
    // dele mede o boot, nao o jogo.
    await sleep(8000);
    if (!(await aba.avaliar(CONTADOR("window.__mgbaCore__")))) {
      throw new Error("o core nao esta exposto — o bench precisa de `npm run dev`");
    }
    await aba.avaliar(`
      window.__espaco = (tipo) => window.dispatchEvent(new KeyboardEvent(tipo, {
        key: " ", code: "Space", keyCode: 32, bubbles: true, cancelable: true,
      }));
    `);
    const normal = await aba.avaliar(`window.__contar(2500)`);
    const acelerado = [];
    for (let i = 0; i < amostras; i++) {
      await aba.avaliar(`window.__espaco("keydown")`);
      acelerado.push(await aba.avaliar(`window.__contar(2500)`));
      await aba.avaliar(`window.__espaco("keyup")`);
      await sleep(1200);
    }
    const rotulo = await aba.avaliar(
      `document.querySelector(".play-turbo")?.textContent ?? ""`
    );

    // A barra, arrastada como quem joga a arrasta: o valor vai pelo setter
    // nativo mais um evento de input, que e o que o React escuta. Pedir ao
    // hook na mao mediria um caminho que ninguem percorre.
    await aba.avaliar(`
      window.__barra = (v) => {
        const campo = [...document.querySelectorAll(".play-speed input")][0];
        if (!campo) throw new Error("barra de velocidade nao esta na tela");
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, "value"
        ).set;
        setter.call(campo, String(v));
        campo.dispatchEvent(new Event("input", { bubbles: true }));
      };
    `);
    const naBarra = [];
    for (const v of barras) {
      await aba.avaliar(`window.__barra(${v})`);
      // O mesmo assentamento que o turbo ganha: medir logo depois de pedir
      // contamina a leitura com o degrau.
      await sleep(1200);
      naBarra.push({ pedido: v, qps: await aba.avaliar(`window.__contar(2500)`) });
    }
    await aba.avaliar(`window.__barra(1)`);

    return {
      rom: clicou,
      normal,
      acelerado,
      naBarra,
      voltouAoNormal: !rotulo.startsWith("Turbo"),
    };
  } finally {
    aba.fechar();
  }
}

const vezes = (qps) => `${(qps / QPS_NATIVO).toFixed(2)}×`;

function linha(nome, r) {
  const pior = Math.min(...r.acelerado);
  console.log(
    `  ${nome.padEnd(22)} normal ${vezes(r.normal).padStart(6)}` +
      `   turbo ${vezes(media(r.acelerado)).padStart(6)}` +
      `   pior ${vezes(pior).padStart(6)}` +
      `   (${r.acelerado.map((q) => (q / QPS_NATIVO).toFixed(2)).join(" ")})`
  );
}

if (typeof WebSocket !== "function") {
  console.error("este bench precisa de Node 22 ou mais novo (WebSocket global).");
  process.exit(2);
}
try {
  await fetch(`${BASE}/jogar`);
} catch {
  console.error(`nada respondendo em ${BASE} — suba o servidor com \`npm run dev\`.`);
  process.exit(2);
}

// O multiplicador do turbo e do codigo: pedir outro aqui mediria uma
// configuracao que nao e a que as pessoas usam.
const fonte = await (await fetch(`${BASE}/src/emulator/shortcuts.ts`)).text();
const doCodigo = Number(fonte.match(/TURBO_MULTIPLIER\s*=\s*(\d+)/)?.[1]);
const turbo = Number(opcao("turbo", doCodigo || 10));

const { processo, wsNavegador } = await subirChrome();
try {
  console.log(`turbo de ${turbo}× · ${amostras} amostras · ${BASE}\n`);
  const isolada = await medirIsolada(wsNavegador, turbo);
  const jogar = await medirJogar(wsNavegador);
  console.log(`ROM: ${isolada.rom}\n`);
  linha("dev/teste-core.html", isolada);
  linha("/jogar", jogar);

  const perda = 1 - media(jogar.acelerado) / media(isolada.acelerado);
  console.log(
    `\n  A /jogar entrega ${(100 - perda * 100).toFixed(0)}% do que o core` +
      ` entrega sozinho.`
  );

  if (jogar.naBarra?.length) {
    console.log("\n  Barra de velocidade, arrastada pela própria UI:\n");
    for (const p of jogar.naBarra) {
      const medido = p.qps / QPS_NATIVO;
      // O teto e da maquina: acima dele o core entrega o que consegue, e isso
      // nao e defeito da barra. So marcamos quando fica MUITO abaixo do pedido.
      const honrado = medido >= p.pedido * 0.8;
      console.log(
        `    pediu ${String(p.pedido).padStart(2)}×` +
          `   entregou ${vezes(p.qps).padStart(6)}` +
          `   ${honrado ? "ok" : "abaixo do pedido (teto da máquina?)"}`
      );
    }
  }
  if (perda > 0.15) {
    console.log(
      "  Faltando mais de ~15%, ha algo na PlayPage comendo o orcamento de" +
        " quadro — foi assim que o log do core apareceu."
    );
  }
  if (!jogar.voltouAoNormal) {
    console.log("  ATENCAO: o turbo nao voltou ao normal ao soltar a tecla.");
  }
} finally {
  processo.kill();
}
