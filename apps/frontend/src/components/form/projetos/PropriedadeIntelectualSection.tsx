import { FormSection } from '../FormSection';
import { Field } from '../Field';

interface PropriedadeIntelectualSectionProps {
  envolvePropriedade: boolean;
  aoAlterarEnvolvimento: (valor: boolean) => void;
  percentualUSP: string;
  percentualParceiro: string;
  aoAlterarPercentualUSP: (valor: string) => void;
  aoAlterarPercentualParceiro: (valor: string) => void;
}

export const PropriedadeIntelectualSection = ({ envolvePropriedade, aoAlterarEnvolvimento, percentualUSP, percentualParceiro, aoAlterarPercentualUSP, aoAlterarPercentualParceiro }: PropriedadeIntelectualSectionProps) => (
  <FormSection numero={3} icone="workspace_premium" titulo="Propriedade Intelectual (PI) e Patentes">
    <div className="col-span-12 min-w-0">
      <h3 className="mb-3 text-sm font-semibold text-on-surface">Previsão de Propriedade Intelectual</h3>
      <p className="mb-3 break-words text-[12px] font-bold uppercase text-on-surface-variant">O projeto envolve a criação ou desenvolvimento de propriedade intelectual?</p>
      <div className="flex min-w-0 flex-col gap-sm sm:flex-row sm:flex-wrap sm:gap-lg">
        <label className="flex min-w-0 flex-wrap cursor-pointer items-start gap-xs text-[13px] text-on-surface"><input type="radio" name="envolvePropriedade" checked={envolvePropriedade} onChange={() => aoAlterarEnvolvimento(true)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />Sim, prevê criação de patentes, marcas ou software</label>
        <label className="flex min-w-0 flex-wrap cursor-pointer items-start gap-xs text-[13px] text-on-surface"><input type="radio" name="envolvePropriedade" checked={!envolvePropriedade} onChange={() => aoAlterarEnvolvimento(false)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />Não envolve Propriedade Intelectual</label>
      </div>
    </div>
    {envolvePropriedade && <>
      <Field label="Percentual USP (%)" span={6} tipo="number" valor={percentualUSP} onChange={aoAlterarPercentualUSP} hint="A soma com o percentual do parceiro deve fechar em 100%." />
      <Field label="Percentual Parceiro / Financiadora (%)" span={6} tipo="number" valor={percentualParceiro} onChange={aoAlterarPercentualParceiro} />
      <Field label="Justificativa da Divisão de Titularidade" tipo="textarea" placeholder="Explique como a contribuição técnica e financeira de cada parte justifica a proporção acordada..." />
      <div className="col-span-12"><h3 className="text-sm font-semibold text-on-surface">Gestão do Registro e Exploração Comercial</h3></div>
      <Field label="Instituição Responsável pelo Registro" span={4} placeholder="Ex.: Agência USP de Inovação (AUSPIN)" hint="Preencher apenas se o projeto envolver Propriedade Intelectual." />
      <Field label="Instituição Responsável pelos Custos" span={4} placeholder="Ex.: Empresa Parceira S.A." />
      <Field label="Prioridade no Licenciamento Comercial" span={4} placeholder="Ex.: Empresa Parceira S.A. (Prazo 12 meses)" />
    </>}
  </FormSection>
);
