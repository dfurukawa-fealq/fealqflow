import { useProcessoState } from '../../../contexts/ProcessoContext';
import { FormSection } from '../FormSection';

export interface MembroEquipeProjeto {
  id: string;
  nome: string;
  vinculo: string;
  telefone: string;
  email: string;
}

interface EquipeTecnicaEditorProps {
  membros: MembroEquipeProjeto[];
  aoAlterar: (membros: MembroEquipeProjeto[]) => void;
}

export const EquipeTecnicaEditor = ({ membros, aoAlterar }: EquipeTecnicaEditorProps) => {
  const [novo, setNovo] = useProcessoState<MembroEquipeProjeto>('equipeTecnicaNovo', { id: '', nome: '', vinculo: '', telefone: '', email: '' });
  const atualizar = (campo: keyof MembroEquipeProjeto, valor: string) => setNovo((atual) => ({ ...atual, [campo]: valor }));
  const adicionar = () => {
    if (!novo.nome.trim()) return;
    aoAlterar([...membros, { ...novo, id: crypto.randomUUID() }]);
    setNovo({ id: '', nome: '', vinculo: '', telefone: '', email: '' });
  };
  const remover = (id: string) => aoAlterar(membros.filter((membro) => membro.id !== id));

  return <FormSection numero={3} icone="groups" titulo="Equipe Técnica e Comissão de Apoio">
    <div className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div><h3 className="text-sm font-bold text-on-surface">Equipe Técnica e Comissão de Apoio</h3><p className="text-xs text-on-surface-variant">Pesquisadores, pós-doutorandos, alunos e apoio administrativo vinculados.</p></div>
        <button type="button" onClick={adicionar} className="inline-flex items-center gap-1 rounded-lg border border-outline px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low"><span className="material-symbols-outlined text-[17px]">add</span>Adicionar Membro</button>
      </div>
      <p className="mb-3 rounded bg-surface-container-low px-2 py-1.5 text-xs text-on-surface-variant">Caso algum membro não tenha cadastro na FEALQ, solicite o preenchimento do Cadastro de equipe técnica/comissão de apoio no kit de documentação.</p>
      <div className="overflow-x-auto rounded-lg border border-outline-variant">
        <div className="grid min-w-[700px] grid-cols-[1.2fr_1.2fr_1fr_1.2fr_44px] gap-2 bg-surface-container-low px-2 py-1.5 text-xs font-bold text-on-surface-variant"><span>Nome</span><span>Departamento / Vínculo</span><span>Telefone</span><span>E-mail</span><span>Ação</span></div>
        <div className="grid min-w-[700px] grid-cols-[1.2fr_1.2fr_1fr_1.2fr_44px] gap-2 p-2"><input value={novo.nome} onChange={(e) => atualizar('nome', e.target.value)} placeholder="Nome completo" className="rounded border border-outline-variant px-2 py-1.5 text-xs" /><input value={novo.vinculo} onChange={(e) => atualizar('vinculo', e.target.value)} placeholder="Ex.: Doutorando, Engenharia" className="rounded border border-outline-variant px-2 py-1.5 text-xs" /><input value={novo.telefone} onChange={(e) => atualizar('telefone', e.target.value)} placeholder="(00) 00000-0000" className="rounded border border-outline-variant px-2 py-1.5 text-xs" /><input value={novo.email} onChange={(e) => atualizar('email', e.target.value)} placeholder="email@usp.br" className="rounded border border-outline-variant px-2 py-1.5 text-xs" /><span />{membros.map((membro) => <div key={membro.id} className="contents"><span className="px-2 py-1 text-xs">{membro.nome}</span><span className="px-2 py-1 text-xs">{membro.vinculo}</span><span className="px-2 py-1 text-xs">{membro.telefone}</span><span className="px-2 py-1 text-xs">{membro.email}</span><button type="button" onClick={() => remover(membro.id)} className="text-error" title="Remover"><span className="material-symbols-outlined text-[18px]">delete</span></button></div>)}</div>
      </div>
    </div>
  </FormSection>;
};
