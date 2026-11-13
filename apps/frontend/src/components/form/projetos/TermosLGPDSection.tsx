import { Link } from 'react-router-dom';
import { FormSection } from '../FormSection';
import { TermoSigiloCard } from './TermoSigiloCard';

interface TermosLGPDSectionProps { aceito: boolean; urlTermo: string; aoAbrirTermo: () => void; sigiloAceito?: boolean; aoAceitarSigilo?: () => void; numero?: number; }

export const TermosLGPDSection = ({ aceito, urlTermo, aoAbrirTermo, sigiloAceito = false, aoAceitarSigilo, numero = 7 }: TermosLGPDSectionProps) => (
  <FormSection numero={numero} icone="verified_user" titulo="Termos de LGPD e Confidencialidade">
    <div className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-low p-sm">
      <div className="flex items-start gap-sm border-b border-outline-variant pb-sm">
        <span className="material-symbols-outlined text-primary">security</span>
        <div className="min-w-0 flex-1">
          <strong className="text-[12px] text-on-surface">Termo de LGPD e Confidencialidade de Dados (FR 01 - PRO)</strong>
          <p className="mt-xs text-[10px] leading-relaxed text-on-surface-variant">O presente termo regulamenta o sigilo e a adequada proteção e tratamento de dados pessoais de alunos, palestrantes, comissão e parceiros do curso/evento ou projeto, sob coordenação do responsável, nos estritos termos da Lei nº 13.709/2018 (LGPD).</p>
        </div>
      </div>
      <div className="flex items-start gap-xs border-t border-outline-variant pt-sm text-[11px] font-semibold">
        <input type="checkbox" checked={aceito} readOnly onClick={aoAbrirTermo} aria-label="Abrir termo de LGPD e confidencialidade" className="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary" />
        <Link to={urlTermo} onClick={(evento) => { evento.preventDefault(); evento.stopPropagation(); aoAbrirTermo(); }} className="min-w-0 flex-1 text-primary underline underline-offset-2 hover:text-primary-container">Declaro ter lido e aceito integralmente o Termo de LGPD e Confidencialidade (FLAG OBRIGATÓRIA)</Link>
      </div>
    </div>
    {aoAceitarSigilo && <TermoSigiloCard aceito={sigiloAceito} aoAceitar={aoAceitarSigilo} />}
  </FormSection>
);
