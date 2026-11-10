import { useState } from 'react';
import { useProcessoState } from '../../../contexts/ProcessoContext';
import { FormSection } from '../FormSection';
import { gerarIdLocal } from '../../../utils/id';

export interface MembroEquipeProjeto { id: string; nome: string; vinculo: string; telefone: string; email: string; }
interface EquipeTecnicaEditorProps { membros: MembroEquipeProjeto[]; aoAlterar: (membros: MembroEquipeProjeto[]) => void; numero?: number; }
const membroVazio = (): MembroEquipeProjeto => ({ id: '', nome: '', vinculo: '', telefone: '', email: '' });
const camposMembro: Array<keyof Omit<MembroEquipeProjeto, 'id'>> = ['nome', 'vinculo', 'telefone', 'email'];
const apenasDigitos = (valor: string) => valor.replace(/\D/g, '').slice(0, 11);
const formatarTelefone = (valor: string) => {
  const digitos = apenasDigitos(valor);
  if (digitos.length <= 2) return digitos ? `(${digitos}` : '';
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
};
const normalizarCampo = (campo: keyof MembroEquipeProjeto, valor: string) => campo === 'telefone' ? apenasDigitos(valor) : campo === 'nome' || campo === 'vinculo' ? valor.toLocaleUpperCase('pt-BR') : valor;

export const EquipeTecnicaEditor = ({ membros, aoAlterar, numero = 3 }: EquipeTecnicaEditorProps) => {
  const [novo, setNovo] = useProcessoState<MembroEquipeProjeto>('equipeTecnicaNovo', membroVazio);
  const [alterados, setAlterados] = useState<Set<string>>(new Set());
  const [mensagem, setMensagem] = useState('');
  const colunas = 'grid-cols-[minmax(120px,1.2fr)_minmax(130px,1.15fr)_minmax(100px,1fr)_minmax(130px,1.2fr)_48px]';

  const atualizarNovo = (campo: keyof MembroEquipeProjeto, valor: string) => setNovo((atual) => ({ ...atual, [campo]: normalizarCampo(campo, valor) }));
  const atualizarMembro = (id: string, campo: keyof MembroEquipeProjeto, valor: string) => {
    aoAlterar(membros.map((membro) => membro.id === id ? { ...membro, [campo]: normalizarCampo(campo, valor) } : membro));
    setAlterados((atuais) => new Set(atuais).add(id));
  };
  const salvarNovo = () => {
    if (!novo.nome.trim()) { setMensagem('Informe o nome do membro antes de salvar.'); return; }
    aoAlterar([...membros, { ...novo, id: gerarIdLocal() }]);
    setNovo(membroVazio());
    setMensagem('Membro adicionado com sucesso.');
  };
  const confirmarAlteracao = (id: string) => { setAlterados((atuais) => { const proximo = new Set(atuais); proximo.delete(id); return proximo; }); setMensagem('Alterações salvas com sucesso.'); };
  const remover = (id: string) => {
    aoAlterar(membros.filter((membro) => membro.id !== id));
    setAlterados((atuais) => { const proximo = new Set(atuais); proximo.delete(id); return proximo; });
    setMensagem('Membro removido.');
  };
  const campo = (membro: MembroEquipeProjeto, nome: keyof MembroEquipeProjeto, salvo: boolean) => <input
    value={nome === 'telefone' ? formatarTelefone(membro[nome]) : membro[nome]}
    onChange={(evento) => salvo ? atualizarMembro(membro.id, nome, evento.target.value) : atualizarNovo(nome, evento.target.value)}
    inputMode={nome === 'telefone' ? 'tel' : undefined}
    type={nome === 'email' ? 'email' : 'text'}
    placeholder={nome === 'nome' ? 'Nome completo' : nome === 'vinculo' ? 'Ex.: Doutorando' : nome === 'telefone' ? 'Telefone' : 'email@usp.br'}
    className={`min-w-0 w-full rounded border border-outline-variant px-2 py-1.5 text-xs ${nome === 'nome' || nome === 'vinculo' ? 'uppercase' : ''}`}
  />;

  return <FormSection numero={numero} icone="groups" titulo="Equipe Técnica e Comissão de Apoio">
    <div className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
      <div className="mb-3"><h3 className="text-sm font-bold text-on-surface">Equipe Técnica e Comissão de Apoio</h3><p className="text-xs text-on-surface-variant">Pesquisadores, pós-doutorandos, alunos e apoio administrativo vinculados.</p></div>
      {/* <p className="mb-3 rounded bg-surface-container-low px-2 py-1.5 text-xs text-on-surface-variant">Caso algum membro não tenha cadastro na FEALQ, solicite o preenchimento do Cadastro de equipe técnica/comissão de apoio no kit de documentação.</p>
      {mensagem && <p role="status" aria-live="polite" className="mb-2 text-xs font-semibold text-secondary">{mensagem}</p>} */}
      <div className="overflow-x-auto rounded-lg border border-outline-variant">
        <div className={`grid min-w-[620px] ${colunas} gap-2 bg-surface-container-low px-2 py-1.5 text-xs font-bold text-on-surface-variant`}><span>Nome</span><span>Departamento / Vínculo</span><span>Telefone</span><span>E-mail</span><span className="text-center">Ação</span></div>
        <div className={`grid min-w-[620px] ${colunas} items-center gap-2 border-b border-outline-variant p-2`}>
          {camposMembro.map((nome) => <span key={nome}>{campo(novo, nome, false)}</span>)}
          <button type="button" onClick={salvarNovo} disabled={!novo.nome.trim()} className="inline-flex h-8 w-8 items-center justify-center justify-self-center text-primary hover:text-primary/70 disabled:cursor-not-allowed disabled:opacity-35" title="Salvar novo membro" aria-label="Salvar novo membro"><span className="material-symbols-outlined text-[22px]">save</span></button>
        </div>
        {membros.map((membro) => <div key={membro.id} className={`grid min-w-[620px] ${colunas} items-center gap-2 border-b border-outline-variant/60 p-2 last:border-0 ${alterados.has(membro.id) ? 'bg-primary/5' : ''}`}>
          {camposMembro.map((nome) => <span key={nome}>{campo(membro, nome, true)}</span>)}
          {alterados.has(membro.id) ? <button type="button" onClick={() => confirmarAlteracao(membro.id)} className="inline-flex h-8 w-8 items-center justify-center justify-self-center text-primary hover:text-primary/70" title="Salvar alterações" aria-label={`Salvar alterações de ${membro.nome}`}><span className="material-symbols-outlined text-[22px]">save</span></button> : <button type="button" onClick={() => remover(membro.id)} className="inline-flex h-8 w-8 items-center justify-center justify-self-center text-error hover:text-error/70" title="Remover membro" aria-label={`Remover ${membro.nome}`}><span className="material-symbols-outlined text-[22px]">delete</span></button>}
        </div>)}
      </div>
    </div>
  </FormSection>;
};
