import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Exceção capturada na interface:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-md">
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-xl max-w-lg w-full shadow-lg text-center">
            <div className="w-14 h-14 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto mb-md">
              <span className="material-symbols-outlined text-[32px]">error</span>
            </div>

            <h1 className="text-[18px] font-bold text-on-surface mb-xs">
              Ocorreu um erro inesperado
            </h1>

            <p className="text-[13px] text-on-surface-variant mb-lg leading-relaxed">
              O Portal de Formulários encontrou uma inconsistência ao renderizar este módulo. Seus dados em preenchimento salvos no protocolo não foram perdidos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-sm mb-md">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-lg py-2.5 bg-primary text-white text-[13px] font-semibold rounded hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Recarregar Página
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-lg py-2.5 bg-surface-container border border-outline text-on-surface text-[13px] font-semibold rounded hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">home</span>
                Voltar ao Início
              </button>
            </div>

            {/* Detalhes Técnicos Expansíveis (seguros para suporte) */}
            <div className="pt-sm border-t border-outline-variant/60 text-left">
              <button
                type="button"
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="text-[11px] text-on-surface-variant hover:text-primary flex items-center gap-1 font-medium mx-auto"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {this.state.showDetails ? 'expand_less' : 'expand_more'}
                </span>
                {this.state.showDetails ? 'Ocultar Detalhes Técnicos' : 'Ver Detalhes Técnicos'}
              </button>

              {this.state.showDetails && this.state.error && (
                <div className="mt-sm p-sm bg-surface-container-lowest rounded border border-outline-variant text-[10px] font-mono text-red-900 overflow-x-auto max-h-40">
                  <p className="font-bold">{this.state.error.name}: {this.state.error.message}</p>
                  {this.state.error.stack && (
                    <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
