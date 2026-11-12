import { Link } from 'react-router-dom';
import { Footer } from '../../components/Footer';
import { PROGRAMAS_APOIO } from '../../data/programasApoio';
import { MeusRascunhos } from '../../components/form/MeusRascunhos';
import { useUser } from '../../contexts/UserContext';

export const ProgramasApoioPage = () => {
  const { usuario } = useUser();
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <main className="flex-1 p-xl">
        <div className="mb-lg flex justify-between items-end">
          <div>
            <h1 className="text-xl font-bold text-primary">
              Programa de Apoios FEALQ
            </h1>
            <p className="text-sm text-on-surface-variant">Ciclo 2024</p>
          </div>
          <div className="flex space-x-sm">
            <span className="bg-primary-container text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
              Apoio Institucional
            </span>
          </div>
        </div>
        <MeusRascunhos categoria="apoio" />
        <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden shadow-sm">
          {/* Header */}
          <div className="grid grid-cols-[56px_1fr_200px_110px_200px_160px] items-center px-md py-sm bg-surface-container border-b border-outline-variant text-[10px] font-bold text-on-surface-variant uppercase">
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
                className="grid grid-cols-[56px_1fr_200px_110px_200px_160px] items-center px-md min-h-[56px] border-b border-outline-variant hover:bg-surface-container-low transition-colors group last:border-0"
              >
                <div className="text-primary-container text-center flex justify-center">
                  <span className="material-symbols-outlined text-lg">
                    {item.icone}
                  </span>
                </div>
                <div className="text-sm font-medium truncate pr-sm">
                  <Link
                    to={item.path}
                    target={!usuario ? '_blank' : undefined}
                    rel={!usuario ? 'noopener noreferrer' : undefined}
                    className="hover:text-primary transition-colors hover:underline"
                  >
                    {item.titulo}
                  </Link>
                </div>
                <div className="text-xs text-on-surface-variant">
                  {item.linha}
                </div>
                <div className="text-xs text-on-surface-variant text-center">
                  {item.documentos.length} itens
                </div>
                <div className="text-xs font-mono text-right">{item.teto}</div>
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={item.path}
                    target={!usuario ? '_blank' : undefined}
                    rel={!usuario ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center justify-center bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded hover:opacity-90 transition-opacity"
                  >
                    Solicitar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
