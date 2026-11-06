import { useProcessoState } from '../../contexts/ProcessoContext';
import { useState } from 'react';
import { getPrograma } from '../../data/programasApoio';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { FormSubCard } from '../../components/form/FormSubCard';
import { Field } from '../../components/form/Field';
import { NormasPrograma } from '../../components/NormasPrograma';
import { ProgramaApoioSidebar } from '../../components/form/ProgramaApoioSidebar';

const programa = getPrograma('material-eventos');

const ITENS_DISPONIVEIS = [
  { id: 'pastas', label: 'Pastas Personalizadas FEALQ', desc: 'Acabamento timbrado em papel cartão' },
  { id: 'blocos', label: 'Blocos de Anotação', desc: '50 folhas pautadas com logotipo institucional' },
  { id: 'crachas', label: 'Crachás e Cordões Personalizados', desc: 'Com presilha tipo jacaré ou cordão em fita' },
  { id: 'canetas', label: 'Canetas Ecológicas', desc: 'Corpo em kraft reciclado com carga esferográfica' },
  { id: 'banners', label: 'Banners / Faixas de Divulgação', desc: 'Suporte e impressão de comunicação visual' },
  { id: 'sacolas', label: 'Sacolas Ecológicas (Ecobags)', desc: 'Para distribuição de kits a congressistas' },
  { id: 'certificados', label: 'Folhas para Certificados', desc: 'Papel especial couchê com tarja institucional' },
  { id: 'outros', label: 'Outros Materiais Institucionais', desc: 'Sob consulta prévia ao setor de eventos' },
];

export function MaterialEventos() {
  // Solicitante
  const [nome, setNome] = useProcessoState('nome', '');
  const [cpf, setCpf] = useProcessoState('cpf', '');
  const [email, setEmail] = useProcessoState('email', '');
  const [telefone, setTelefone] = useProcessoState('telefone', '');
  const [departamento, setDepartamento] = useProcessoState('departamento', '');
  const [entidade, setEntidade] = useProcessoState('entidade', 'Centro Acadêmico / Comissão Organizadora');

  // Evento
  const [nomeEvento, setNomeEvento] = useProcessoState('nomeEvento', '');
  const [tipoEvento, setTipoEvento] = useProcessoState('tipoEvento', 'Semana Acadêmica');
  const [dataEvento, setDataEvento] = useProcessoState('dataEvento', '');
  const [localEvento, setLocalEvento] = useProcessoState('localEvento', '');
  const [publicoEstimado, setPublicoEstimado] = useProcessoState('publicoEstimado', '');

  // Materiais Selecionados
  const [materiaisSelecionados, setMateriaisSelecionados] = useProcessoState<string[]>('materiaisSelecionados', [
    'pastas',
    'blocos',
    'canetas',
  ]);
  const [detalhesQuantidades, setDetalhesQuantidades] = useProcessoState('detalhesQuantidades', '');
  const [dataRetirada, setDataRetirada] = useProcessoState('dataRetirada', '');

  const [submetido, setSubmetido] = useState(false);

  const toggleMaterial = (id: string) => {
    setMateriaisSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Cálculo de percentual de preenchimento
  const camposObrigatorios = [
    nome,
    cpf,
    email,
    departamento,
    nomeEvento,
    dataEvento,
    publicoEstimado,
    detalhesQuantidades,
  ];
  const preenchidos = camposObrigatorios.filter((v) => v.trim() !== '').length;
  const percentual = Math.round((preenchidos / camposObrigatorios.length) * 100);

  const handleSubmit = () => {
    setSubmetido(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <FormPageLayout
      breadcrumb={['Programa de Apoios', programa.titulo]}
      titulo="Material de Apoio para Eventos Acadêmicos"
      codigo={programa.codigo}
      badge="Formulário Digital"
      acaoPrincipal="Submeter Pedido"
      aoSubmeter={handleSubmit}
      sidebar={
        <ProgramaApoioSidebar
          documentos={programa.documentos}
          percentual={percentual}
          statusNota={
            percentual >= 100
              ? 'Todos os campos obrigatórios foram preenchidos.'
              : 'Selecione os materiais, especifique as quantidades e anexe a programação no Kit.'
          }
        />
      }
    >
      {/* Mensagem de sucesso ao submeter */}
      {submetido && (
        <div className="p-lg bg-green-50 border-2 border-green-500 rounded-xl text-green-900 flex items-start gap-md animate-fadeIn">
          <span className="material-symbols-outlined text-[32px] text-green-600 mt-1">
            task_alt
          </span>
          <div>
            <h3 className="font-bold text-[18px] text-green-950">
              Solicitação de Material de Evento Submetida!
            </h3>
            <p className="text-[14px] mt-xs text-green-800">
              O pedido de fornecimento de materiais para o evento <strong>{nomeEvento || 'informado'}</strong> foi registrado. O setor de suprimentos da FEALQ avaliará os estoques disponíveis.
            </p>
            <div className="mt-md flex gap-sm">
              <button
                type="button"
                onClick={() => setSubmetido(false)}
                className="px-md py-xs bg-white border border-green-300 text-green-800 rounded text-[13px] font-medium hover:bg-green-100 transition-colors"
              >
                Voltar à Edição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Normas do Edital */}
      <NormasPrograma programa={programa} />

      {/* 1. DADOS DO ORGANIZADOR */}
      <FormSection
        numero={1}
        icone="person"
        titulo="Comissão Organizadora / Responsável pelo Evento"
      >
        <FormSubCard
          icone="badge"
          titulo="Identificação do Responsável"
          subtitulo="Dados do docente ou estudante líder da comissão"
          badge={
            <span className="text-[11px] px-xs py-0.5 rounded bg-primary/10 text-primary font-semibold">
              Comissão Organizadora
            </span>
          }
        >
          <Field
            label="Nome Completo do Responsável"
            span={6}
            placeholder="Ex: Lucas Gabriel Moreira"
            obrigatorio
            valor={nome}
            onChange={setNome}
          />
          <Field
            label="CPF"
            span={3}
            placeholder="000.000.000-00"
            obrigatorio
            valor={cpf}
            onChange={setCpf}
          />
          <Field
            label="E-mail Institucional"
            span={3}
            tipo="email"
            placeholder="organizador@usp.br"
            obrigatorio
            valor={email}
            onChange={setEmail}
          />
          <Field
            label="Telefone / WhatsApp"
            span={4}
            placeholder="(19) 99999-9999"
            valor={telefone}
            onChange={setTelefone}
          />
          <Field
            label="Departamento / Instituto"
            span={4}
            placeholder="Ex: Departamento de Zootecnia"
            obrigatorio
            valor={departamento}
            onChange={setDepartamento}
          />
          <Field
            label="Entidade Solicitante"
            span={4}
            placeholder="Ex: Centro Acadêmico Luiz de Queiroz (CALQ)"
            valor={entidade}
            onChange={setEntidade}
          />
        </FormSubCard>
      </FormSection>

      {/* 2. DADOS DO EVENTO */}
      <FormSection
        numero={2}
        icone="event"
        titulo="Dados do Evento Acadêmico"
      >
        <FormSubCard
          icone="calendar_today"
          titulo="Caracterização do Evento"
          subtitulo="Informações para dimensionamento dos materiais"
        >
          <Field
            label="Nome do Evento"
            span={8}
            placeholder="Ex: 34ª Semana de Estudos Agronômicos de Piracicaba"
            obrigatorio
            valor={nomeEvento}
            onChange={setNomeEvento}
          />
          <Field
            label="Tipo de Evento"
            span={4}
            tipo="select"
            opcoes={[
              'Semana Acadêmica',
              'Jornada Científica / Discente',
              'Simpósio Temático',
              'Workshop ou Treinamento',
              'Encontro de Pós-Graduação',
              'Outro Evento Universitário',
            ]}
            valor={tipoEvento}
            onChange={setTipoEvento}
          />
          <Field
            label="Data de Realização do Evento"
            span={4}
            tipo="date"
            obrigatorio
            valor={dataEvento}
            onChange={setDataEvento}
          />
          <Field
            label="Local no Campus / Auditório"
            span={4}
            placeholder="Ex: Anfiteatro da Engenharia"
            valor={localEvento}
            onChange={setLocalEvento}
          />
          <Field
            label="Público Estimado (Participantes)"
            span={4}
            tipo="number"
            placeholder="Ex: 250"
            obrigatorio
            valor={publicoEstimado}
            onChange={setPublicoEstimado}
          />
        </FormSubCard>
      </FormSection>

      {/* 3. ESPECIFICAÇÃO DOS MATERIAIS */}
      <FormSection
        numero={3}
        icone="inventory_2"
        titulo="Especificação dos Materiais Solicitados"
      >
        <FormSubCard
          icone="checklist"
          titulo="Seleção de Itens Oficiais FEALQ"
          subtitulo="Selecione os materiais que necessita para o evento"
        >
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-sm">
            {ITENS_DISPONIVEIS.map((item) => {
              const selecionado = materiaisSelecionados.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleMaterial(item.id)}
                  className={`p-sm border rounded-lg cursor-pointer transition-all flex items-start gap-sm ${
                    selecionado
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-outline-variant bg-surface-container-lowest hover:border-primary/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selecionado}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer accent-primary"
                  />
                  <div>
                    <h5 className="font-semibold text-[13px] text-on-surface">
                      {item.label}
                    </h5>
                    <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </FormSubCard>

        <FormSubCard
          icone="format_list_numbered"
          titulo="Quantidades Solicitadas & Prazo para Retirada"
          subtitulo="Discrimine as quantidades exatas de cada item selecionado"
          aviso={
            <span>
              *O fornecimento dos materiais está sujeito à conferência do estoque institucional no almoxarifado da FEALQ. A retirada deve ser agendada com pelo menos <strong>5 dias úteis de antecedência</strong> do início do evento.
            </span>
          }
        >
          <div className="col-span-12">
            <div className="flex items-center justify-between mb-xs">
              <label className="block text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
                Quantidades Específicas por Material <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-on-surface-variant">
                Ex: 200 pastas, 200 blocos, 200 canetas, 2 banners
              </span>
            </div>
            <textarea
              rows={3}
              value={detalhesQuantidades}
              onChange={(e) => setDetalhesQuantidades(e.target.value)}
              placeholder="Ex: 250 Pastas personalizadas, 250 Blocos de anotações, 250 Canetas, 2 Banners verticais com suporte (2x1m)..."
              className="w-full p-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors resize-y leading-relaxed"
            />
          </div>
          <Field
            label="Data Desejada para Retirada na FEALQ"
            span={6}
            tipo="date"
            valor={dataRetirada}
            onChange={setDataRetirada}
            hint="Sugerido: no mínimo 5 dias antes do evento"
          />
        </FormSubCard>
      </FormSection>
    </FormPageLayout>
  );
}
