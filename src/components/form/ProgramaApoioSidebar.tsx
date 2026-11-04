import { ReactNode } from 'react';
import { DocumentoExigido } from '../../data/programasApoio';
import { KitDocumental } from '../KitDocumental';
import { StatusCard } from './StatusCard';

interface ProgramaApoioSidebarProps {
  documentos: DocumentoExigido[];
  percentual: number;
  statusNota?: string;
  avisoPersonalizado?: string;
  destaque?: ReactNode;
}

/**
 * Sidebar padronizada para os formulários de Programas de Apoio FEALQ,
 * espelhando exatamente a composição visual dos formulários de Projetos:
 * 1. StatusCard de progresso
 * 2. KitDocumental com acaoNoCard e contorno dinâmico
 * 3. Banner explicativo de tramitação FEALQ
 */
export const ProgramaApoioSidebar = ({
  documentos,
  percentual,
  statusNota,
  avisoPersonalizado,
  destaque,
}: ProgramaApoioSidebarProps) => {
  const notaPadrao =
    percentual >= 100
      ? 'Todos os campos obrigatórios e documentos mínimos foram preenchidos.'
      : 'Preencha os dados do proponente, detalhes do pedido e anexe os documentos no kit.';

  const avisoPadrao =
    avisoPersonalizado ||
    'Assim que completamente preenchido, clique em submeter. Toda a documentação e comprovantes anexados serão conferidos pela equipe técnica da FEALQ. Em caso de dúvidas ou necessidade de correção, retornaremos com orientações pelo e-mail institucional informado.';

  return (
    <div className="flex flex-col gap-md sticky top-6">
      <StatusCard
        titulo="STATUS DA SOLICITAÇÃO"
        rotulo="Preenchimento"
        percentual={percentual}
        nota={statusNota || notaPadrao}
      />

      {destaque}

      <KitDocumental
        documentos={documentos}
        titulo="Kit de Documentação"
        acaoNoCard
      />

      <div className="p-md bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[12px] leading-relaxed">
        <div className="flex items-center gap-xs font-semibold mb-xs text-amber-950">
          <span className="material-symbols-outlined text-[18px]">info</span>
          Informação Importante
        </div>
        {avisoPadrao}
      </div>
    </div>
  );
};
