import { Field } from '../../form/Field';
import { FormSection } from '../../form/FormSection';
import { EnderecoField } from '../../form/EnderecoField';
import { InputSearchList } from '../../form/InputSearchList';
import { TIPOS_EVENTO } from '../../../data/listas';

type FormatoRealizacao = 'Presencial' | 'Online (Síncrono)' | 'Online (Assíncrono)' | 'Híbrido';
type Resposta = 'sim' | 'nao';

interface Props {
  numero?: number;
  titulo: string; aoAlterarTitulo: (valor: string) => void;
  edicao: string; aoAlterarEdicao: (valor: string) => void;
  tipoEvento: string; aoAlterarTipoEvento: (valor: string) => void;
  publicoAlvo: string; aoAlterarPublicoAlvo: (valor: string) => void;
  cargaHoraria: string; aoAlterarCargaHoraria: (valor: string) => void;
  dataInicio: string; aoAlterarDataInicio: (valor: string) => void;
  dataFim: string; aoAlterarDataFim: (valor: string) => void;
  horarioRealizacao: string; aoAlterarHorario: (valor: string) => void;
  numeroVagas: string; aoAlterarNumeroVagas: (valor: string) => void;
  formato: FormatoRealizacao; aoAlterarFormato: (valor: FormatoRealizacao) => void;
  localAuditorio: string; aoAlterarLocal: (valor: string) => void;
  utilizaDoity: Resposta; aoAlterarUtilizaDoity: (valor: Resposta) => void;
  objetoProjeto: string; aoAlterarObjetoProjeto: (valor: string) => void;
}

export function DadosProjetoCursoEventoSection(props: Props) {
  const online = props.formato !== 'Presencial';
  const presencial = props.formato === 'Presencial' || props.formato === 'Híbrido';

  return (
    <FormSection numero={props.numero ?? 2} icone="event" titulo="Dados do Projeto & Detalhamento Técnico">
      <Field label="Título do Curso/Evento" span={9} placeholder="Ex: Simpósio de Tecnologia Agrícola e Sustentabilidade" obrigatorio valor={props.titulo} onChange={props.aoAlterarTitulo} />
      <Field label="Edição" span={3} placeholder="Ex: 5ª Edição" valor={props.edicao} onChange={props.aoAlterarEdicao} />
      <InputSearchList label="Tipo de Evento" span={4} opcoes={TIPOS_EVENTO} placeholder="Digite ou selecione um tipo de evento" valor={props.tipoEvento} onChange={props.aoAlterarTipoEvento} hint="Espelha a classificação de eventos do SAP/FEALQ" />
      <Field label="Público-Alvo" span={5} placeholder="Estudantes, Pesquisadores, Profissionais do Setor" obrigatorio valor={props.publicoAlvo} onChange={props.aoAlterarPublicoAlvo} />
      <Field label="Carga Horária (h)" span={3} tipo="number" placeholder="Ex: 40" obrigatorio valor={props.cargaHoraria} onChange={props.aoAlterarCargaHoraria} />
      <Field label="Data de Início" span={3} tipo="date" valor={props.dataInicio} onChange={props.aoAlterarDataInicio} obrigatorio />
      <Field label="Data de Término" span={3} tipo="date" valor={props.dataFim} onChange={props.aoAlterarDataFim} obrigatorio />
      <Field label="Horário / Turno" span={3} placeholder="Ex: 08:00 às 18:00 (Integral)" valor={props.horarioRealizacao} onChange={props.aoAlterarHorario} />
      <Field label="Vaga(s) Estimada(s)" span={3} tipo="number" placeholder="Ex: 100" valor={props.numeroVagas} onChange={props.aoAlterarNumeroVagas} hint="Substitui a estimativa genérica de pessoas" />
      <div className="col-span-12">
        <Field label="Formato de Realização" span={12} tipo="select" opcoes={['Presencial', 'Online (Síncrono)', 'Online (Assíncrono)', 'Híbrido']} valor={props.formato} onChange={(valor) => props.aoAlterarFormato(valor as FormatoRealizacao)} />
      </div>
      {presencial && <>
        <Field label="Local / Auditório / Campus" span={12} placeholder="Ex: Auditório da Engenharia, Campus USP Piracicaba" valor={props.localAuditorio} onChange={props.aoAlterarLocal} />
        <EnderecoField prefixo="localRealizacao" />
      </>}
      {online && <div className="col-span-12 bg-blue-50/70 border border-blue-200 p-md rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <span className="text-[13px] font-bold text-blue-950 flex items-center gap-xs"><span className="material-symbols-outlined text-[18px] text-blue-700">hub</span>Utiliza a plataforma da Doity / FEALQ para transmissão e inscrições?</span>
          <span className="text-[12px] text-blue-800">A FEALQ possui integração direta com a plataforma Doity para emissão de certificados e checkout seguro.</span>
        </div>
        <div className="flex items-center gap-lg">
          <label className="flex items-center gap-xs cursor-pointer text-[13px] font-medium text-blue-950"><input type="radio" name="utilizaDoity" value="sim" checked={props.utilizaDoity === 'sim'} onChange={() => props.aoAlterarUtilizaDoity('sim')} className="w-4 h-4 text-primary accent-primary" />Sim, utilizará Doity/FEALQ</label>
          <label className="flex items-center gap-xs cursor-pointer text-[13px] font-medium text-blue-950"><input type="radio" name="utilizaDoity" value="nao" checked={props.utilizaDoity === 'nao'} onChange={() => props.aoAlterarUtilizaDoity('nao')} className="w-4 h-4 text-primary accent-primary" />Não (Outra plataforma)</label>
        </div>
      </div>}
      <div className="col-span-12">
        <div className="flex items-center justify-between mb-xs">
          <label className="block text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">Objetivo do Projeto <span className="text-red-500">*</span></label>
          <span className="text-[11px] text-on-surface-variant">Descreva detalhadamente o escopo acadêmico/técnico</span>
        </div>
        <textarea rows={4} value={props.objetoProjeto} onChange={(event) => props.aoAlterarObjetoProjeto(event.target.value)} placeholder="Descreva o propósito acadêmico, científico ou extensionista do curso/evento, metodologias aplicadas e resultados esperados..." className="w-full p-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors resize-y leading-relaxed" />
      </div>
    </FormSection>
  );
}
