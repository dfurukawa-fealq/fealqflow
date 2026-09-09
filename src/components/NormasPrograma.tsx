import { ProgramaApoio } from '../data/programasApoio';
import { FormSection } from './form/FormSection';

/**
 * Seção 0 do formulário: normas do edital e teto do programa.
 * Abre recolhida — o teto fica visível no cabeçalho mesmo assim.
 */
export const NormasPrograma = ({ programa }: { programa: ProgramaApoio }) => (
  <FormSection
    numero={0}
    icone="gavel"
    titulo="Normas do Edital"
    colapsavel
    livre
    acao={
      <span className="text-[12px] text-on-surface-variant whitespace-nowrap">
        Teto:{' '}
        <strong className="text-primary font-bold">{programa.teto}</strong>
      </span>
    }
  >
    <p className="text-[13px] leading-relaxed text-on-surface-variant">
      {programa.normas}
    </p>
  </FormSection>
);
