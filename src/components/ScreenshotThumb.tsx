import { useEffect, useRef, useState } from "react";

interface Props {
  fileName: string;
  /** Lê o PNG do FS do core e devolve uma `data:` URL. Chamado uma vez só. */
  read: (fileName: string) => string | undefined;
}

/**
 * Miniatura de captura que só é lida quando entra na tela.
 *
 * Converter PNG em `data:` URL passa por `btoa` e produz uma string de dezenas
 * de kB por imagem. Com uma dúzia de capturas isso é inofensivo; com centenas,
 * materializar todas de uma vez seria megabytes de string viva sem ninguém
 * olhando. O `IntersectionObserver` lê só o que aparece, e uma vez só.
 *
 * Sem `IntersectionObserver` — navegador antigo, ou ambiente de teste — lê na
 * montagem: degradar para o comportamento simples é melhor do que não mostrar.
 */
const ScreenshotThumb = ({ fileName, read }: Props) => {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (url) return;
    const host = hostRef.current;
    if (!host) return;
    if (typeof IntersectionObserver === "undefined") {
      setUrl(read(fileName));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setUrl(read(fileName));
          observer.disconnect();
        }
      },
      { rootMargin: "120px" }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [fileName, read, url]);

  return (
    <div ref={hostRef} className="play-shot-thumb">
      {url ? (
        <img src={url} alt="" loading="lazy" decoding="async" />
      ) : (
        <span className="play-shot-placeholder" aria-hidden="true" />
      )}
    </div>
  );
};

export default ScreenshotThumb;
