import { useState } from 'react';
import { ConfirmacaoModal } from '../../ConfirmacaoModal';

interface TermoSigiloCardProps { aceito: boolean; aoAceitar: () => void; }

export const TermoSigiloCard = ({ aceito, aoAceitar }: TermoSigiloCardProps) => {
const [modalAberto, setModalAberto] = useState(false);
return <>
<div className="col-span-12 mt-sm w-full rounded-lg border border-outline-variant bg-surface-container-low p-md">
    <div className="flex items-start gap-sm border-b border-outline-variant pb-sm">
        <span className="material-symbols-outlined text-primary">
            lock
        </span>
            <div className="min-w-0 flex-1">
                <strong className="text-[13px] text-on-surface">
                    Termo de Sigilo e Confidencialidade
                </strong>
                <p className="mt-xs text-[11px] leading-relaxed text-on-surface-variant">
                    Compromisso de preservação do sigilo de informações técnicas, científicas, comerciais e financeiras relacionadas ao projeto.
                </p>
            </div>
    </div>
    <div className="space-y-sm py-sm text-[12px] leading-relaxed text-on-surface-variant">
        <p>
            Na qualidade de coordenador(a) do projeto identificado neste protocolo, comprometo-me a preservar o sigilo das informações técnicas, científicas, comerciais, financeiras e demais informações que sejam confidenciais por sua natureza, identificação ou pelo instrumento jurídico aplicável, às quais tenha acesso em razão do projeto, utilizando-as somente para as finalidades autorizadas.
            Comprometo-me a não divulgar, reproduzir ou compartilhar informações protegidas sem a autorização exigida, a orientar os integrantes da equipe sobre os deveres pertinentes e a comunicar à FEALQ eventuais incidentes ou divulgações indevidas de que tenha conhecimento.
            O dever de sigilo não abrange informações comprovadamente públicas sem violação deste compromisso, legitimamente recebidas de fonte autorizada sem obrigação de sigilo ou divulgadas por imposição legal, ressalvados os procedimentos cabíveis para proteção das informações.
            O compromisso vigorará durante a execução do projeto e por cinco anos após seu encerramento, salvo prazo ou condição específica prevista no instrumento jurídico aplicável ou na legislação.
            A divulgação científica, o tratamento de dados pessoais e a propriedade intelectual observarão as regras pertinentes.
        </p>
    </div>
    <label className="flex items-start gap-xs border-t border-outline-variant pt-sm text-[12px] font-semibold"><input type="checkbox" checked={aceito} disabled={aceito} onChange={() => { if (!aceito) setModalAberto(true); }} className="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary disabled:opacity-100" />
        <span>
            {aceito ? 'Ciência registrada. Este aceite não pode ser revogado.' : 'Declaro que li e assumo os compromissos estabelecidos no Termo de Sigilo e Confidencialidade.'}
        </span>
    </label>
</div>
{modalAberto && !aceito && <ConfirmacaoModal
    titulo="Confirmar aceite"
    mensagem="O aceite do Termo de Sigilo e Confidencialidade será registrado neste processo e não poderá ser revogado posteriormente."
    icone="verified_user"
    textoConfirmar="Confirmar aceite"
    variante="principal"
    onCancelar={() => setModalAberto(false)}
    onConfirmar={() => { aoAceitar(); setModalAberto(false); }}
/>}
</>;
};
