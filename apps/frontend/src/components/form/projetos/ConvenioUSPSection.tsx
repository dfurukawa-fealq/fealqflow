import { FormSection } from '../FormSection';
import { Field } from '../Field';

interface ConvenioUSPSectionProps {
  possuiConvenio: boolean;
  aoAlterar: (possuiConvenio: boolean) => void;
  numeroConvenio?: string;
  numeroProtocolo?: string;
  aoAlterarNumeroConvenio?: (valor: string) => void;
  aoAlterarNumeroProtocolo?: (valor: string) => void;
}

export const ConvenioUSPSection = ({ possuiConvenio, aoAlterar, numeroConvenio = '', numeroProtocolo = '', aoAlterarNumeroConvenio, aoAlterarNumeroProtocolo }: ConvenioUSPSectionProps) => (
  <FormSection numero={1} icone="description" titulo="Informações sobre o Projeto & Convênio USP">
    <div className="col-span-12 flex flex-col justify-between gap-md rounded-lg border border-outline-variant/60 bg-surface-container-low p-md md:flex-row md:items-center">
      <div>
        <span className="block text-[13px] font-bold text-on-surface">Possui Convênio Cadastrado na USP?</span>
        <span className="text-[12px] text-on-surface-variant">Essa definição adapta automaticamente os anexos exigidos no Kit Documental.</span>
      </div>
      <div className="flex items-center gap-lg">
        <label className="flex cursor-pointer items-center gap-xs text-[13px] font-semibold text-on-surface"><input type="radio" name="possuiConvenioPesquisa" checked={possuiConvenio} onChange={() => aoAlterar(true)} className="h-4 w-4 accent-primary" />SIM</label>
        <label className="flex cursor-pointer items-center gap-xs text-[13px] font-semibold text-on-surface"><input type="radio" name="possuiConvenioPesquisa" checked={!possuiConvenio} onChange={() => aoAlterar(false)} className="h-4 w-4 accent-primary" />NÃO</label>
      </div>
    </div>
    {possuiConvenio && <>
      <Field label="Nº do Convênio USP" span={6} valor={numeroConvenio} onChange={aoAlterarNumeroConvenio} placeholder="Ex.: 2024/00123-USP" hint="Preencher apenas se houver convênio cadastrado na USP." />
      <Field label="Nº do Processo USP" span={6} valor={numeroProtocolo} onChange={aoAlterarNumeroProtocolo} placeholder="Ex.: 23.1.00000.11.2" hint="Preencher apenas se houver convênio cadastrado na USP." />
    </>}
  </FormSection>
);
