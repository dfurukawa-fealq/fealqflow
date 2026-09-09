const fs = require('fs');

const code = `import { useNavigate } from 'react-router-dom';
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md md:gap-lg">
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
`;

fs.writeFileSync('src/pages/ProgramasApoioPage.tsx', code);
console.log('ProgramasApoioPage updated successfully.');
