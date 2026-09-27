import { Component, type ErrorInfo, type ReactNode } from "react";
import { getLang, tr } from "../i18n/lang";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Impede que um erro de render derrube o app inteiro.
 *
 * Precisa ser classe: nao existe equivalente em hook para
 * getDerivedStateFromError / componentDidCatch.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Erro de render capturado:", error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    // Classe não usa hook: lê o idioma direto. O App re-renderiza na troca.
    const t = (pt: string, en: string) => tr(getLang(), pt, en);

    return (
      <div className="boundary-shell" role="alert">
        <div className="boundary-code" aria-hidden="true">
          !
        </div>
        <h1>{t("Algo quebrou nesta tela", "Something broke on this screen")}</h1>
        <p>
          {t(
            "O resto do site continua funcionando. Se persistir, recarregue a página.",
            "The rest of the site still works. If it keeps happening, reload the page."
          )}
        </p>
        <pre className="boundary-detail">{error.message}</pre>
        <div className="boundary-actions">
          <button
            type="button"
            className="boundary-cta"
            onClick={() => this.setState({ error: null })}
          >
            {t("Tentar de novo", "Try again")}
          </button>
          <a href="/">{t("Ir para a Pokédex", "Go to the Pokédex")}</a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
