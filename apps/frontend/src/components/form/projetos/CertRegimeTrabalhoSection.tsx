import { FormSection } from '../FormSection';
import { Field } from '../Field';

type RegimeTrabalho = 'RTP' | 'RTC' | 'RDIDP';

interface CertRegimeTrabalhoSectionProps {
  regime: RegimeTrabalho;
  numeroCert: string;
  validadeCert: string;
  aoAlterarRegime: (valor: RegimeTrabalho) => void;
  aoAlterarNumeroCert: (valor: string) => void;
  aoAlterarValidadeCert: (valor: string) => void;
}

export const CertRegimeTrabalhoSection = ({
  regime,
  numeroCert,
  validadeCert,
  aoAlterarRegime,
  aoAlterarNumeroCert,
  aoAlterarValidadeCert,
}: CertRegimeTrabalhoSectionProps) => (
  <FormSection numero={2} icone="badge" titulo="Informações do Docente USP">
    <div className="col-span-12 overflow-hidden rounded border border-outline-variant">
      <div className="border-b border-outline-variant px-sm py-xs text-[13px] font-bold text-on-surface">
        Para docentes USP
      </div>

      <div className="border-b border-outline-variant px-sm py-xs">
        <p className="mb-xs text-[11px] font-bold uppercase text-on-surface-variant">
          Regime de trabalho:
        </p>
        <div className="flex flex-nowrap justify-between gap-md whitespace-nowrap px-md text-[13px] text-on-surface">
          {(['RTP', 'RTC', 'RDIDP'] as RegimeTrabalho[]).map((opcao) => (
            <label key={opcao} className="flex items-center gap-xs">
              <input
                type="radio"
                name="regimeTrabalho"
                value={opcao}
                checked={regime === opcao}
                onChange={() => aoAlterarRegime(opcao)}
                className="h-4 w-4 accent-primary"
              />
              {opcao}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-x-md bg-primary/10 px-sm py-xs">
        <Field label="CERT Nº" span={6} valor={numeroCert} onChange={aoAlterarNumeroCert} />
        <Field label="Validade" span={6} tipo="date" valor={validadeCert} onChange={aoAlterarValidadeCert} />
      </div>
    </div>
  </FormSection>
);
