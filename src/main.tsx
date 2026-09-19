import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { applyScanline, readScanline } from "./lib/scanline";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

// Antes do primeiro render: a pagina nunca aparece lisa para so depois
// ganhar a textura.
applyScanline(readScanline());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Service worker só em produção.
 *
 * Em dev ele brigaria com o HMR do Vite — o worker serviria do cache um módulo
 * que o servidor acabou de reescrever, e a página passaria a mostrar código
 * velho sem nenhum aviso.
 */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Sem service worker o site funciona igual, só não abre sem rede.
    });
  });
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
