import { useEffect, useState } from "react";
import type { TrainerEntry } from "../lib/trainerLog";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  cardContent,
  cardFileName,
  drawTrainerCard,
  type CardTheme,
} from "../lib/trainerCardImage";
import { pixelSpriteUrl } from "../lib/sprites";
import { useLang, tr } from "../i18n/lang";

function carregar(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** As cores e a fonte do tema atual, para o PNG sair com a cara do site. */
function temaAtual(): CardTheme {
  const css = getComputedStyle(document.documentElement);
  const v = (nome: string, padrao: string) => css.getPropertyValue(nome).trim() || padrao;
  return {
    paper: v("--paper", "#f4efe1"),
    ink: v("--paper-ink", "#2b2620"),
    accent: v("--accent", "#7a9a01"),
    font: v("--font-display", "sans-serif"),
  };
}

/**
 * Gera o cartão de treinador como PNG: prévia, baixar e — onde o navegador
 * compartilha arquivos — compartilhar.
 */
const TrainerCardShare = ({ entry }: { entry: TrainerEntry }) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const [png, setPng] = useState<{ url: string; blob: Blob } | null>(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // A URL do blob vive enquanto a prévia estiver na tela.
  useEffect(() => () => {
    if (png) URL.revokeObjectURL(png.url);
  }, [png]);

  const gerar = async () => {
    setGerando(true);
    setErro(null);
    try {
      const conteudo = cardContent(entry, lang);
      await document.fonts?.ready;
      const sprites = await Promise.all(conteudo.team.map((m) => carregar(pixelSpriteUrl(m.national))));
      const canvas = document.createElement("canvas");
      canvas.width = CARD_WIDTH;
      canvas.height = CARD_HEIGHT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas");
      drawTrainerCard(ctx, conteudo, sprites, temaAtual(), lang);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
      if (!blob) throw new Error("png");
      setPng({ url: URL.createObjectURL(blob), blob });
    } catch {
      setErro(t("Não deu para gerar a imagem neste navegador.", "Couldn't make the image in this browser."));
    } finally {
      setGerando(false);
    }
  };

  const arquivo = png ? new File([png.blob], cardFileName(entry), { type: "image/png" }) : null;
  const podeCompartilhar = Boolean(arquivo && navigator.canShare?.({ files: [arquivo] }));

  return (
    <div className="trainer-compartilhar">
      <button type="button" onClick={() => void gerar()} disabled={gerando}>
        {gerando ? t("Gerando…", "Making…") : png ? t("Gerar de novo", "Make again") : t("Imagem do cartão", "Card image")}
      </button>
      {erro && <p className="trainer-sub" role="alert">{erro}</p>}
      {png && (
        <figure className="trainer-compartilhar-previa">
          <img src={png.url} alt={t(`Cartão de treinador de ${entry.playerName}`, `${entry.playerName}'s trainer card`)} width={CARD_WIDTH / 2} height={CARD_HEIGHT / 2} />
          <figcaption>
            <a href={png.url} download={cardFileName(entry)}>
              {t("Baixar PNG", "Download PNG")}
            </a>
            {podeCompartilhar && arquivo && (
              <button type="button" onClick={() => void navigator.share({ files: [arquivo] }).catch(() => undefined)}>
                {t("Compartilhar", "Share")}
              </button>
            )}
          </figcaption>
        </figure>
      )}
    </div>
  );
};

export default TrainerCardShare;
