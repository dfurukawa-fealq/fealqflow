import { ProgramaApoio } from '../data/programasApoio';
import { FormSection } from './form/FormSection';

/**
 * Seção 0 do formulário: normas do edital e teto do programa.
 * Abre recolhida — o teto fica visível no cabeçalho com destaque visual.
 */
export const NormasPrograma = ({ programa }: { programa: ProgramaApoio }) => (
  <FormSection
    numero={0}
    icone="gavel"
    titulo="Normas do Edital & Critérios do Programa"
    colapsavel
    aberto={false}
    livre
    acao={
      <span className="text-[12px] bg-primary/10 text-primary font-semibold px-sm py-0.5 rounded-full whitespace-nowrap border border-primary/20">
        Teto: <strong className="font-bold">{programa.teto}</strong>
      </span>
    }
  >
    <div className="bg-surface-container-low/50 border border-outline-variant/60 rounded-lg p-md text-[13px] leading-relaxed text-on-surface-variant">
      {programa.normas}
    </div>
  </FormSection>
);

