import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getSafeReturnUrl } from '../../utils/security';

export interface MetaItem {
  label: string;
  valor: ReactNode;
  destaque?: boolean;
}

export interface CertificacaoSidebarCardProps {
  titulo: string;
  icone?: string;
  confirmado: boolean;
  statusLabelConfirmado?: string;
  statusLabelPendente?: string;
  mensagemConfirmado: string;
  mensagemPendente: string;
  protocoloId: string;
  metaItems?: MetaItem[];
  carimboData?: string | null;
  carimboHora?: string | null;
  linkRetorno: string;
  textoBotaoRetorno?: string;
  children?: ReactNode;
}

export const CertificacaoSidebarCard: React.FC<CertificacaoSidebarCardProps> = ({
  titulo,
  icone = 'verified',
  confirmado,
  statusLabelConfirmado = 'Certificação Concluída',
  statusLabelPendente = 'Certificação Pendente',
  mensagemConfirmado,
  mensagemPendente,
  protocoloId,
  metaItems = [],
  carimboData,
  carimboHora,
  linkRetorno,
  textoBotaoRetorno = 'Retornar ao Protocolo Principal',
  children,
}) => {
  const safeLink = getSafeReturnUrl(linkRetorno);

  return (
    <div className="flex flex-col gap-lg">
      <div className="bg-surface-container-low border border-outline-variant rounded-lg p-lg shadow-sm">
        <div className="flex items-center gap-xs mb-sm">
          <span className="material-symbols-outlined text-primary text-[20px]">
            {confirmado ? 'verified' : icone}
          </span>
          <h3 className="text-[14px] font-bold text-on-surface">{titulo}</h3>
        </div>

        <div
          className={`p-sm rounded border mb-sm ${
            confirmado
              ? 'bg-green-50 border-green-400 text-green-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              {confirmado ? 'check_circle' : 'pending_actions'}
            </span>
            <span className="text-[12px] font-bold uppercase tracking-wide">
              {confirmado ? statusLabelConfirmado : statusLabelPendente}
            </span>
          </div>
          <p className="text-[11px] mt-1 leading-snug">
            {confirmado ? mensagemConfirmado : mensagemPendente}
          </p>
        </div>

        <div className="text-[11px] text-on-surface-variant flex flex-col gap-1 border-t border-outline-variant/60 pt-2">
          <div className="flex justify-between">
            <span>Protocolo Vinculado:</span>
            <span className="font-mono font-bold text-primary">{protocoloId}</span>
          </div>

          {metaItems.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{item.label}:</span>
              <span className={item.destaque ? 'font-bold text-primary' : 'font-medium'}>
                {item.valor}
              </span>
            </div>
          ))}

          {confirmado && carimboData && (
            <div className="flex justify-between text-green-800 font-medium">
              <span>Carimbo Oficial:</span>
              <span>
                {carimboData} {carimboHora ? `às ${carimboHora}` : ''}
              </span>
            </div>
          )}
        </div>

        <div className="mt-md pt-sm border-t border-outline-variant">
          <Link
            to={safeLink}
            className="w-full inline-flex items-center justify-center gap-1.5 px-md py-2 rounded bg-surface-container border border-outline text-on-surface text-[12px] font-semibold hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            {textoBotaoRetorno}
          </Link>
        </div>
      </div>

      {children}
    </div>
  );
};
