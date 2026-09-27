import { setLang, useLang } from "../i18n/lang";

/**
 * PT | EN. Dois botões com `aria-pressed` em vez de um que alterna: fica claro
 * qual está valendo, e o leitor de tela anuncia os dois.
 */
const LangToggle = () => {
  const lang = useLang();
  return (
    <div className="lang-toggle" role="group" aria-label={lang === "en" ? "Language" : "Idioma"}>
      <button type="button" aria-pressed={lang === "pt"} onClick={() => setLang("pt")} lang="pt-BR">
        PT
      </button>
      <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} lang="en">
        EN
      </button>
    </div>
  );
};

export default LangToggle;
