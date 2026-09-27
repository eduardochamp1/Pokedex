import { useEffect, useState, useSyncExternalStore } from "react";

function subscribeOnline(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

/**
 * Faixa de "sem conexão". O service worker já serve o app offline; faltava a
 * página dizer por que uma ficha nunca aberta não carrega.
 */
export const OfflineBanner = () => {
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  );
  if (online) return null;
  return (
    <div className="offline-banner" role="status">
      Sem conexão — o que você já abriu continua funcionando. O que for novo da
      PokéAPI espera a rede voltar.
    </div>
  );
};

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * O navegador avisa que dá para instalar com `beforeinstallprompt` — cedo, às
 * vezes antes de a navbar montar. Então o evento é guardado já no carregamento
 * deste módulo, e o botão só lê.
 */
let adiado: InstallPromptEvent | null = null;
const ouvintes = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    adiado = e as InstallPromptEvent;
    ouvintes.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    adiado = null;
    ouvintes.forEach((l) => l());
  });
}

/** Só aparece onde o navegador oferece instalar (Chrome, Edge, Android). */
export const InstallButton = () => {
  const [, forcar] = useState(0);
  useEffect(() => {
    const l = () => forcar((n) => n + 1);
    ouvintes.add(l);
    return () => {
      ouvintes.delete(l);
    };
  }, []);

  if (!adiado) return null;
  return (
    <button
      type="button"
      className="nav-install"
      onClick={async () => {
        const e = adiado;
        if (!e) return;
        await e.prompt();
        await e.userChoice;
        // O evento só serve uma vez, aceito ou não.
        adiado = null;
        ouvintes.forEach((l) => l());
      }}
      title="Instalar a Pokédex como app"
    >
      Instalar
    </button>
  );
};
