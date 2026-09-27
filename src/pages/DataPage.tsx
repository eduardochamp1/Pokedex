import { useMemo, useState } from "react";
import {
  applyBackup,
  backupFileName,
  collectBackup,
  parseBackup,
  summarize,
  type Backup,
  type BackupSummary,
} from "../lib/backup";
import { useLang, tr, localeOf } from "../i18n/lang";
import "../styles/trainer.css";
import "../styles/data.css";

/** O `localStorage` pode não existir (modo privado restrito). */
function armazenamento(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const Resumo = ({ r }: { r: BackupSummary }) => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  return (
    <ul className="dados-resumo">
      <li>
        <strong>{r.favorites}</strong> {t("favoritos", "favorites")}
      </li>
      <li>
        <strong>{r.trainerCards}</strong> {t("fichas de treinador", "trainer cards")}
      </li>
      <li>
        <strong>{r.playerDexes}</strong> {t("Pokédex de jogo", "game Pokédexes")}
      </li>
      <li>
        <strong>{r.other}</strong> {t("preferências e recordes", "preferences and records")}
      </li>
    </ul>
  );
};

/**
 * Seus dados: o que o site guarda neste navegador, para levar a outro
 * aparelho num arquivo — sem conta e sem servidor.
 */
const DataPage = () => {
  const lang = useLang();
  const t = (pt: string, en: string) => tr(lang, pt, en);
  const s = armazenamento();
  const atual = useMemo(() => (s ? collectBackup(s) : null), [s]);
  const [vindo, setVindo] = useState<{ nome: string; backup: Backup } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const exportar = () => {
    if (!s) return;
    const b = collectBackup(s);
    const url = URL.createObjectURL(new Blob([JSON.stringify(b, null, 1)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = backupFileName();
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const ler = async (f: File | undefined) => {
    setErro(null);
    setVindo(null);
    if (!f) return;
    const b = parseBackup(await f.text());
    if (!b) {
      setErro(t("Este arquivo não é um backup de dados deste site.", "This file isn't a data backup from this site."));
      return;
    }
    setVindo({ nome: f.name, backup: b });
  };

  const importar = () => {
    if (!s || !vindo) return;
    applyBackup(s, vindo.backup);
    // Os stores leem o localStorage ao carregar: recarregar é o jeito honesto
    // de todas as páginas verem os dados novos.
    window.location.reload();
  };

  if (!s || !atual) {
    return (
      <div className="trainer-shell">
        <h1>{t("Seus dados", "Your data")}</h1>
        <p className="trainer-vazio">
          {t("Este navegador não deixa o site guardar dados (modo privado?).", "This browser doesn't let the site store data (private mode?).")}
        </p>
      </div>
    );
  }

  return (
    <div className="trainer-shell">
      <header className="trainer-header">
        <h1>{t("Seus dados", "Your data")}</h1>
      </header>
      <p className="trainer-sub">
        {t(
          "Tudo fica neste navegador — não há conta nem servidor. Para usar em outro aparelho, exporte aqui e importe o arquivo lá. Os saves do emulador não entram: eles têm o próprio backup em Jogar.",
          "Everything lives in this browser — no account, no server. To use it on another device, export here and import the file there. Emulator saves aren't included: they have their own backup in Play."
        )}
      </p>

      <section className="dados-bloco" aria-labelledby="dados-exportar">
        <h2 id="dados-exportar">{t("Neste navegador", "In this browser")}</h2>
        <Resumo r={summarize(atual.data)} />
        <button type="button" onClick={exportar}>
          {t("Exportar para arquivo", "Export to file")}
        </button>
      </section>

      <section className="dados-bloco" aria-labelledby="dados-importar">
        <h2 id="dados-importar">{t("Trazer de outro aparelho", "Bring from another device")}</h2>
        <label className="dados-arquivo">
          {t("Arquivo exportado (.json)", "Exported file (.json)")}
          <input type="file" accept=".json,application/json" onChange={(e) => void ler(e.target.files?.[0])} />
        </label>
        {erro && (
          <p className="dados-erro" role="alert">
            {erro}
          </p>
        )}
        {vindo && (
          <div className="dados-confirmar">
            <p>
              {vindo.nome} ·{" "}
              {t("exportado em", "exported on")}{" "}
              {new Date(vindo.backup.exportedAt).toLocaleString(localeOf(lang))}
            </p>
            <Resumo r={summarize(vindo.backup.data)} />
            <p className="trainer-sub">
              {t(
                "Importar substitui os dados deste navegador pelos do arquivo. Se quiser guardar os daqui, exporte antes.",
                "Importing replaces this browser's data with the file's. If you want to keep the ones here, export first."
              )}
            </p>
            <div className="dados-acoes">
              <button type="button" className="dados-perigo" onClick={importar}>
                {t("Substituir e recarregar", "Replace and reload")}
              </button>
              <button type="button" onClick={() => setVindo(null)}>
                {t("Cancelar", "Cancel")}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default DataPage;
