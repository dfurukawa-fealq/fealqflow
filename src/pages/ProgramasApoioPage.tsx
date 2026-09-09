import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { PROGRAMAS_APOIO } from '../data/programasApoio';

export const ProgramasApoioPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-surface">
      <main className="flex-1 w-full max-w-[1200px] mx-auto p-md md:p-xl">
        <div className="mb-lg flex flex-col md:flex-row md:justify-between md:items-end gap-sm">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-primary">
              Programa de Apoios FEALQ
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">Ciclo 2024</p>
          </div>
          <div className="flex">
            <span className="bg-primary-container text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
              Apoio Institucional
            </span>
          </div>
        </div>

        {/* ========================================= */}
        {/* DESKTOP VIEW: Tabela com todas as colunas */}
        {/* ========================================= */}
        <div className="hidden lg:block bg-surface-container-lowest border border-outline-variant rounded overflow-hidden shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-[56px_1fr_180px_110px_240px_160px] items-center px-md py-sm bg-surface-container border-b border-outline-variant text-[10px] font-bold text-on-surface-variant uppercase">
            <div></div>
            <div>Edital/Formulário</div>
            <div>Linha de Apoio</div>
            <div className="text-center">Documentos</div>
            <div className="text-right">Teto (R$)</div>
            <div></div>
          </div>
          {/* Body */}
          <div className="flex flex-col">
            {PROGRAMAS_APOIO.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[56px_1fr_180px_110px_240px_160px] items-center px-md min-h-[56px] border-b border-outline-variant hover:bg-surface-container-low transition-colors group last:border-0"
              >
                <div className="text-primary-container text-center flex justify-center">
                  <span className="material-symbols-outlined text-lg">
                    {item.icone}
                  </span>
                </div>
                <div className="text-sm font-medium truncate pr-sm">
                  {item.titulo}
                </div>
                <div className="text-xs text-on-surface-variant">
                  {item.linha}
                </div>
                <div className="text-xs text-on-surface-variant text-center">
                  {item.documentos.length} itens
                </div>
                <div className="text-xs font-mono text-right whitespace-nowrap">{item.teto}</div>
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigate(item.path)}
                    className="bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded"
                  >
                    Solicitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================== */}
        {/* MOBILE/TABLET VIEW: Card List otimizado e ágil*/}
        {/* ============================================== */}
        <div className="grid lg:hidden grid-cols-1 md:grid-cols-2 gap-md">
          {PROGRAMAS_APOIO.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex items-center text-left bg-surface-container-lowest border border-outline-variant rounded-lg p-md hover:border-secondary hover:shadow-md transition-all group focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary mr-md group-hover:bg-secondary group-hover:text-white transition-colors shrink-0">
                <span className="material-symbols-outlined text-2xl">
                  {item.icone}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-bold text-on-surface truncate group-hover:text-secondary transition-colors">
                  {item.titulo}
                </h3>
                <p className="text-xs text-on-surface-variant truncate mt-0.5">
                  {item.linha}
                </p>
              </div>
              <div className="text-outline-variant group-hover:text-secondary transition-colors shrink-0 ml-sm">
                <span className="material-symbols-outlined text-xl">
                  arrow_forward
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};
