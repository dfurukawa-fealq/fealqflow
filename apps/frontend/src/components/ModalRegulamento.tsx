import React, { useState, useRef, useEffect } from 'react';

interface ModalRegulamentoProps {
  onClose: () => void;
  onAceitar: () => void;
  jaAceito?: boolean;
}

export const ModalRegulamento = ({ onClose, onAceitar, jaAceito }: ModalRegulamentoProps) => {
  const [canAccept, setCanAccept] = useState(jaAceito || false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (canAccept) return;
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 20) {
      setCanAccept(true);
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      const { clientHeight, scrollHeight } = contentRef.current;
      if (scrollHeight <= clientHeight) {
        setCanAccept(true);
      }
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between shrink-0 bg-surface">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">policy</span>
            <h2 className="text-xl font-bold text-on-surface">Regulamento de Apoios</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
            title="Fechar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 lg:p-8 bg-surface-container-lowest text-on-surface text-sm leading-relaxed space-y-6"
        >
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-lg font-bold text-primary-container uppercase tracking-wide">
              Fundação de Estudos Agrários Luiz de Queiroz – FEALQ
            </h3>
            <p className="text-on-surface-variant font-medium">REG-C-003 • REVISÃO N.º: 05 • EFETIVAÇÃO: 30/01/2026</p>
          </div>

          <div className="prose prose-sm max-w-none prose-headings:text-primary-container prose-headings:font-bold prose-p:text-on-surface prose-li:text-on-surface">
            <p>
              <strong>Art. 1°</strong> - Este Regulamento estabelece as normas para o Programa de Apoios com uso de recursos próprios da Fundação de Estudos Agrários Luiz de Queiroz – Fealq no exercício de seu compromisso social, voltados à sociedade com ênfase na comunidade acadêmica.
            </p>
            <p>
              <strong>Art. 2º</strong> - A governança da Fundação está pautada nos princípios da equidade, transparência, responsabilidade institucional e socioambiental, integridade, conformidade legal e prestação de contas. Os relatórios de auditoria, demonstrações contábeis e documentos que atestam a regularidade da Fundação junto aos órgãos de controle, como o Ministério Público, estão disponíveis para consulta pública em nosso Portal da Transparência, acessível no site institucional da Fealq. Esse Regulamento reafirma o compromisso da Fundação com a ética, a integridade e a prestação de contas à sociedade.
            </p>
            <p>
              <strong>Art. 3º</strong> - A página da internet da Fealq será o ambiente de divulgação da Política de Apoios, deste Regulamento, seus editais e cronogramas de participação.
            </p>
            <p>
              <strong>Art. 4º</strong> - O orçamento anual será estabelecido pelo Conselho Curador, que definirá um valor limite (teto) para o exercício na reunião de aprovação do orçamento, preservando o capital da Fundação e a continuidade das suas atividades.
            </p>
            <p>
              <strong>Art. 5º</strong> - A Diretoria deve apresentar a proposta dos montantes porcentuais para cada linha de apoio para a aprovação do Conselho Curador, juntamente com a proposta de orçamento do ano seguinte.
            </p>
            <p>
              <strong>Art. 6º</strong> - A Diretoria estabelece neste Regulamento diretrizes e quesitos específicos para aplicação e operacionalização da Política de Apoios. A análise das propostas poderá ocorrer por meio da comissão de avaliação indicada pela Diretoria.
            </p>
            
            <h4 className="text-base mt-6 mb-3">Condições de Elegibilidade, Execução e Prestação de Contas</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Todos os deferimentos deverão ser executados pela Diretoria da Fealq;</li>
              <li>Os pedidos aprovados devem ser executados e o recurso utilizado em prazo máximo de 120 dias da aprovação do pedido, salvo previsão em editais específicos.</li>
              <li>A prestação de contas deve ser realizada conforme prazo indicado ao requerente no resultado do deferimento, com o encaminhamento de comprovantes juntamente com relatório das atividades relacionadas.</li>
              <li>É vedado apoio destinado a pagamento de despesas de custeio ou recorrentes, como assinatura de linha telefônica, internet, plano de saúde, etc.</li>
              <li>É vedado o pagamento de despesas de contratação de pessoal pela Fundação, como CLT, estagiários, pessoa jurídica, pagamento para marketing, plataformas de divulgação e inscrições, tráfego pago, impressão de banner.</li>
              <li>É vedado o remanejamento de recursos aprovados entre diferentes modalidades de apoios. Os recursos deverão ser utilizados exclusivamente conforme a proposta originalmente submetida e aprovada.</li>
              <li>Será permitida a submissão de apenas uma proposta por solicitante em cada modalidade apoio.</li>
            </ul>

            <p className="mt-6">
              <strong>Art. 7º</strong> - A alçada para deferimento dos apoios é exclusiva da Diretoria. A Fundação poderá ainda destinar e executar os recursos isoladamente, em conjunto ou através de entidades parcerias e atender pedidos total ou parcialmente.
            </p>
            <p>
              <strong>Art. 8º</strong> - A participação dos bolsistas em atividades do presente regulamento não criará vínculo empregatício de qualquer natureza e devem seguir diretrizes estabelecidas no Regulamento de Bolsa da Fealq.
            </p>
            <p>
              <strong>Art. 9º</strong> – O Programa de Apoios está habilitado a estabelecer parcerias com instituições públicas ou privadas que desenvolvam ou apoiem iniciativas aderentes às linhas de apoio gerenciadas pela Fundação.
            </p>

            <div className="mt-8 p-4 bg-surface-container-low border border-outline-variant rounded-md text-xs text-on-surface-variant">
              Nota: Este documento é uma versão condensada dos Artigos Gerais. Para consultar os requisitos específicos de cada modalidade (Bolsas, Auxílios, Cultura e Extensão, Interesse Comunitário) e o anexo completo com períodos de submissão e análise, acesse a versão integral do Regulamento de Apoios no site institucional da FEALQ.
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-surface border-t border-outline-variant/30 flex items-center justify-between shrink-0">
          <p className="text-xs text-on-surface-variant max-w-[60%]">
            Ao clicar em <strong>Li e Aceito</strong>, você declara estar ciente de todas as regras e condições estabelecidas neste regulamento, comprometendo-se a respeitá-las integralmente.
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-variant rounded transition-colors"
            >
              Fechar
            </button>
            {!jaAceito && (
              <button 
                onClick={() => {
                  onAceitar();
                  onClose();
                }}
                disabled={!canAccept}
                className={`px-6 py-2 text-sm font-bold rounded transition-colors shadow-sm ${
                  canAccept 
                    ? 'bg-primary text-on-primary hover:bg-primary/90' 
                    : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-70'
                }`}
                title={!canAccept ? "Role até o final do documento para aceitar" : ""}
              >
                Li e Aceito
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
