import { useProcessoState } from '../../../contexts/ProcessoContext';
import { UNIDADES_USP } from '../../../data/listas';
import { FormSection } from '../FormSection';
import { Field } from '../Field';
import { InputSearchList } from '../InputSearchList';

export const CoordenadorResponsavelSection = ({ numero = 3 }: { numero?: number }) => {
  const [nome, setNome] = useProcessoState('coordNome', '');
  const [cpf, setCpf] = useProcessoState('coordCpf', '');
  const [telefone, setTelefone] = useProcessoState('coordTelefone', '');
  const [email, setEmail] = useProcessoState('coordEmail', '');
  const [departamento, setDepartamento] = useProcessoState('coordDepto', '');
  const [unidade, setUnidade] = useProcessoState('coordUnidade', '');
  return <FormSection numero={numero} icone="person" titulo="Coordenador Responsável">
    <div className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-low p-md">
      <div className="mb-sm flex items-center justify-between"><h3 className="flex items-center gap-xs text-sm font-bold text-on-surface"><span className="material-symbols-outlined">person</span>Coordenador Responsável</h3><span className="rounded bg-primary/10 px-sm py-xs text-[10px] font-semibold text-primary">Acesso Nível 1 Automático</span></div>
      <p className="mb-sm rounded border border-amber-300 bg-amber-50 px-sm py-xs text-[11px] text-amber-800">Caso não tenha cadastro como coordenador na FEALQ, preencher o <strong>CADASTRO DE COORDENADOR</strong> no kit de documentação.</p>
      <div className="grid grid-cols-12 gap-sm">
        <Field label="Nome Completo do Coordenador" span={6} placeholder="Ex.: Prof. Dr. João Silva" obrigatorio valor={nome} onChange={setNome} />
        <Field label="CPF" span={3} mascara="cpf" placeholder="000.000.000-00" obrigatorio valor={cpf} onChange={setCpf} />
        <Field label="Telefone / Contato" span={3} mascara="telefone" placeholder="(19) 3429-0000" valor={telefone} onChange={setTelefone} />
        <Field label="E-mail Institucional" span={6} tipo="email" placeholder="coordenador@usp.br" obrigatorio valor={email} onChange={setEmail} hint="Preferencialmente e-mail institucional @usp.br" />
        <div className="col-span-12 grid grid-cols-12 gap-sm">
          <Field label="Departamento / Instituição" span={6} placeholder="Ex.: Engenharia de Biossistemas" valor={departamento} onChange={setDepartamento} />
          <InputSearchList label="Unidade" span={6} opcoes={UNIDADES_USP} placeholder="Digite ou selecione uma unidade" valor={unidade} onChange={setUnidade} />
        </div>
      </div>
    </div>
  </FormSection>;
};
