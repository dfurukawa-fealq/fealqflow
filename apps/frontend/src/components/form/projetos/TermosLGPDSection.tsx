import { Link } from 'react-router-dom';
import { FormSection } from '../FormSection';

interface TermosLGPDSectionProps {
  aceito: boolean;
  urlTermo: string;
  aoAbrirTermo: () => void;
}

export const TermosLGPDSection = ({ aceito, urlTermo, aoAbrirTermo }: TermosLGPDSectionProps) => (
  <FormSection numero={7} icone="verified_user" titulo="Termos de LGPD, Confidencialidade & Orientações">
    <div className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-low p-sm">
      <div className="flex items-start gap-sm border-b border-outline-variant pb-sm">
        <span className="material-symbols-outlined text-primary">security</span>
        <div className="min-w-0 flex-1">
          <strong className="text-[12px] text-on-surface">Termo de LGPD e Confidencialidade de Dados (FR 01 - PRO)</strong>
          <p className="mt-xs text-[10px] leading-relaxed text-on-surface-variant">O presente termo regulamenta o sigilo e a adequada proteção e tratamento de dados pessoais de alunos, palestrantes, comissão e parceiros do curso/evento ou projeto, sob coordenação do responsável, nos estritos termos da Lei nº 13.709/2018 (LGPD).</p>
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-sm pt-sm text-[11px] font-semibold">
        <Link to={urlTermo} target="_blank" rel="noopener noreferrer" onClick={aoAbrirTermo} className="min-w-0 flex-1 text-primary underline underline-offset-2 hover:text-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Declaro ter lido e aceito integralmente o Termo de LGPD e Confidencialidade (FLAG OBRIGATÓRIA)
        </Link>
        <span className={`shrink-0 rounded-full border px-sm py-xs text-[10px] ${aceito ? 'border-secondary/40 bg-secondary/10 text-secondary' : 'border-amber-400 bg-amber-50 text-amber-700'}`}>{aceito ? 'Aceite registrado' : 'Assinatura pendente'}</span>
      </div>
    </div>
  </FormSection>
);
