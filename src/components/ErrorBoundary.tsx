import { Component, type ErrorInfo, type ReactNode } from "react";

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

    return (
      <div className="boundary-shell" role="alert">
        <div className="boundary-code" aria-hidden="true">
          !
        </div>
        <h1>Algo quebrou nesta tela</h1>
        <p>
          O resto do site continua funcionando. Se persistir, recarregue a
          página.
        </p>
        <pre className="boundary-detail">{error.message}</pre>
        <div className="boundary-actions">
          <button
            type="button"
            className="boundary-cta"
            onClick={() => this.setState({ error: null })}
          >
            Tentar de novo
          </button>
          <a href="/">Ir para a Pokédex</a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
