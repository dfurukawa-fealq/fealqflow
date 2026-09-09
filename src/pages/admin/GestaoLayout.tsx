import React, { ReactNode, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';

interface GestaoLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export const GestaoLayout = ({ title, description, children }: GestaoLayoutProps) => {
  const { resetToDefaults } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmSync = () => {
    resetToDefaults();
    setIsModalOpen(false);
  };

  return (
    <div className="p-xl max-w-7xl mx-auto w-full relative">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">{title}</h1>
          <p className="text-on-surface-variant">
            {description}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors font-medium text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">sync</span>
          Sincronizar Base Oficial
        </button>
      </div>
      <div>
        {children}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl w-[450px] min-w-[300px] p-6 shadow-xl border border-outline-variant animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center gap-3 text-error mb-4">
              <span className="material-symbols-outlined text-[32px]">warning</span>
              <h2 className="text-xl font-bold text-on-surface m-0">Atenção!</h2>
            </div>
            <p className="text-on-surface-variant mb-6 text-base leading-relaxed break-words w-full">
              Isso irá <strong>resetar todos os formulários e movimentações atuais</strong> e recriar os dados com base no mapeamento oficial. Você tem certeza que deseja continuar?
            </p>
            <div className="flex justify-end gap-3 w-full shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-on-surface font-semibold hover:bg-surface-variant/50 rounded-lg transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSync}
                className="px-5 py-2.5 bg-error text-white font-semibold rounded-lg hover:bg-error/90 transition-colors shadow-sm whitespace-nowrap"
              >
                Sim, sincronizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
