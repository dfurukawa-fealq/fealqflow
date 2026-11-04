import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Footer } from '../components/Footer';

interface FormLayoutProps {
  title: string;
  code?: string;
  children: ReactNode;
  sidePanel?: ReactNode;
}

export const FormLayout = ({
  title,
  code,
  children,
  sidePanel,
}: FormLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <TopBar />
      <main className="flex-1 p-xl overflow-auto pb-32">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-md">
          <div className="flex justify-between items-end border-b border-outline-variant pb-2">
            <div>
              <div className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">
                Solicitação <span className="mx-1 text-outline-variant">/</span>{' '}
                {title}
              </div>
              <h2 className="text-xl font-bold text-primary">
                {code ? `${code} - ` : ''}
                {title}
              </h2>
            </div>
            <button className="h-8 px-4 border border-primary text-primary text-xs font-bold rounded flex items-center gap-2 hover:bg-primary/5">
              <span className="material-symbols-outlined text-sm">download</span>{' '}
              Baixar DOCX
            </button>
          </div>
          <div className="grid grid-cols-12 gap-xl">
            <div className={sidePanel ? 'col-span-8' : 'col-span-12'}>
              {children}
            </div>
            {sidePanel && (
              <div className="col-span-4 space-y-md">{sidePanel}</div>
            )}
          </div>
        </div>
      </main>
      <div className="fixed bottom-0 left-[240px] right-0 bg-surface border-t border-outline-variant p-md px-xl flex justify-between items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => navigate(-1)}
          className="px-6 h-10 border border-outline-variant text-sm font-medium rounded hover:bg-surface-container"
        >
          Cancelar
        </button>
        <div className="flex gap-4 items-center">
          <span className="text-[10px] text-on-surface-variant italic">
            Preencha todos os campos obrigatórios para enviar
          </span>
          <button
            className="px-8 h-10 bg-primary text-white text-sm font-bold rounded opacity-50 cursor-not-allowed"
            disabled
          >
            Enviar Solicitação
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};
