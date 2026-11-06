import { useProcessoState } from '../../contexts/ProcessoContext';
import { useState } from 'react';
import { getPrograma } from '../../data/programasApoio';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { FormSubCard } from '../../components/form/FormSubCard';
import { Field } from '../../components/form/Field';
import { NormasPrograma } from '../../components/NormasPrograma';
import { ProgramaApoioSidebar } from '../../components/form/ProgramaApoioSidebar';

const programa = getPrograma('auxilio-viagem');

export function AuxilioViagem() {
  // Viajante
  const [nome, setNome] = useProcessoState('nome', '');
  const [cpf, setCpf] = useProcessoState('cpf', '');
  const [email, setEmail] = useProcessoState('email', '');
  const [telefone, setTelefone] = useProcessoState('telefone', '');
  const [instituicao, setInstituicao] = useProcessoState('instituicao', 'ESALQ/USP');
  const [departamento, setDepartamento] = useProcessoState('departamento', '');
  const [vinculo, setVinculo] = useProcessoState('vinculo', 'Mestrado');
  const [orientador, setOrientador] = useProcessoState('orientador', '');

  // Itinerário
  const [categoriaViagem, setCategoriaViagem] = useProcessoState('categoriaViagem', 'Nacional');
  const [paisDestino, setPaisDestino] = useProcessoState('paisDestino', 'Brasil');
  const [cidadeDestino, setCidadeDestino] = useProcessoState('cidadeDestino', '');
  const [localInstituicao, setLocalInstituicao] = useProcessoState('localInstituicao', '');
  const [dataIda, setDataIda] = useProcessoState('dataIda', '');
  const [dataRetorno, setDataRetorno] = useProcessoState('dataRetorno', '');

  // Finalidade
  const [finalidade, setFinalidade] = useProcessoState('finalidade', 'Pesquisa de Campo');
  const [justificativa, setJustificativa] = useProcessoState('justificativa', '');

  // Custos
  const [tipoAuxilio, setTipoAuxilio] = useProcessoState('tipoAuxilio', 'Misto (Passagem + Hospedagem)');
  const [valorSolicitado, setValorSolicitado] = useProcessoState('valorSolicitado', '');
  const [outrasFontes, setOutrasFontes] = useProcessoState('outrasFontes', 'Não');

  const [submetido, setSubmetido] = useState(false);

  // Cálculo de percentual de preenchimento
  const camposObrigatorios = [
    nome,
    cpf,
    email,
    departamento,
    cidadeDestino,
    dataIda,
    dataRetorno,
    justificativa,
    valorSolicitado,
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
      titulo="Solicitação de Auxílio Viagem"
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
              ? 'Todos os campos essenciais foram preenchidos.'
              : 'Preencha o roteiro de viagem, custos e anexe a carta de aceite/convite no Kit.'
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
              Solicitação de Auxílio Viagem Submetida!
            </h3>
            <p className="text-[14px] mt-xs text-green-800">
              O pedido de auxílio de viagem para <strong>{cidadeDestino || 'o destino informado'}</strong> foi registrado. A equipe da FEALQ analisará o cronograma e os orçamentos anexados.
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

      {/* 1. DADOS DO VIAJANTE */}
      <FormSection
        numero={1}
        icone="person"
        titulo="Dados do Viajante / Solicitante"
      >
        <FormSubCard
          icone="badge"
          titulo="Identificação do Viajante"
          subtitulo="Informações para emissão de bilhetes e prestação de contas"
          badge={
            <span className="text-[11px] px-xs py-0.5 rounded bg-primary/10 text-primary font-semibold">
              Beneficiário Direto
            </span>
          }
        >
          <Field
            label="Nome Completo"
            span={6}
            placeholder="Ex: João Silva Carvalho"
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
            placeholder="joao.silva@usp.br"
            obrigatorio
            valor={email}
            onChange={setEmail}
          />
          <Field
            label="Telefone / WhatsApp"
            span={3}
            placeholder="(19) 99999-9999"
            valor={telefone}
            onChange={setTelefone}
          />
          <Field
            label="Instituição"
            span={3}
            tipo="select"
            opcoes={['ESALQ/USP', 'FZEA/USP', 'CENA/USP', 'Outra Unidade USP']}
            valor={instituicao}
            onChange={setInstituicao}
          />
          <Field
            label="Departamento"
            span={6}
            placeholder="Ex: Departamento de Ciências Exatas"
            obrigatorio
            valor={departamento}
            onChange={setDepartamento}
          />
          <Field
            label="Vínculo Acadêmico"
            span={6}
            tipo="select"
            opcoes={['Graduação', 'Mestrado', 'Doutorado', 'Pós-Doutorado', 'Docente']}
            valor={vinculo}
            onChange={setVinculo}
          />
          <Field
            label="Docente Orientador / Supervisor"
            span={6}
            placeholder="Nome do Professor Orientador"
            valor={orientador}
            onChange={setOrientador}
          />
        </FormSubCard>
      </FormSection>

      {/* 2. DESTINO & ITINERÁRIO */}
      <FormSection
        numero={2}
        icone="flight_takeoff"
        titulo="Destino, Itinerário & Cronograma da Viagem"
      >
        <FormSubCard
          icone="map"
          titulo="Itinerário & Datas"
          subtitulo="Informe os locais exatos de deslocamento"
        >
          <Field
            label="Categoria da Viagem"
            span={4}
            tipo="select"
            opcoes={['Nacional', 'Internacional']}
            valor={categoriaViagem}
            onChange={setCategoriaViagem}
          />
          <Field
            label="País de Destino"
            span={4}
            placeholder="Ex: Brasil"
            valor={paisDestino}
            onChange={setPaisDestino}
          />
          <Field
            label="Cidade e Estado / Região"
            span={4}
            placeholder="Ex: Florianópolis, SC"
            obrigatorio
            valor={cidadeDestino}
            onChange={setCidadeDestino}
          />
          <Field
            label="Local / Instituição de Destino"
            span={4}
            placeholder="Ex: Universidade Federal de Santa Catarina (UFSC)"
            valor={localInstituicao}
            onChange={setLocalInstituicao}
          />
          <Field
            label="Data de Ida"
            span={4}
            tipo="date"
            obrigatorio
            valor={dataIda}
            onChange={setDataIda}
          />
          <Field
            label="Data de Retorno"
            span={4}
            tipo="date"
            obrigatorio
            valor={dataRetorno}
            onChange={setDataRetorno}
          />
        </FormSubCard>

        <FormSubCard
          icone="assignment"
          titulo="Objetivo & Plano de Atividades da Viagem"
          subtitulo="Justificativa da relevância acadêmica/científica"
        >
          <Field
            label="Finalidade Principal"
            span={12}
            tipo="select"
            opcoes={[
              'Pesquisa de Campo',
              'Reunião Científica / Técnica',
              'Coleta de Amostras e Dados',
              'Estágio em Laboratório Parceiro',
              'Outra Finalidade Acadêmica',
            ]}
            valor={finalidade}
            onChange={setFinalidade}
          />
          <div className="col-span-12">
            <div className="flex items-center justify-between mb-xs">
              <label className="block text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
                Justificativa Detalhada & Cronograma das Atividades <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-on-surface-variant">
                Descreva as atividades diárias ou por etapa
              </span>
            </div>
            <textarea
              rows={4}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Descreva detalhadamente o cronograma de trabalho, os contatos locais e a importância desta viagem para a pesquisa desenvolvida..."
              className="w-full p-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors resize-y leading-relaxed"
            />
          </div>
        </FormSubCard>
      </FormSection>

      {/* 3. ESTIMATIVA DE CUSTOS & CUSTEIO */}
      <FormSection
        numero={3}
        icone="payments"
        titulo="Estimativa de Gastos & Custeio Solicitado"
      >
        <FormSubCard
          icone="account_balance_wallet"
          titulo="Composição de Custos"
          subtitulo="Valores solicitados à FEALQ conforme teto do edital"
          aviso={
            <span>
              *Teto Máximo previsto pelo edital: <strong>R$ 3.000,00</strong> para viagens nacionais e <strong>R$ 6.000,00</strong> para viagens internacionais. É necessário anexar as cotações de passagens/hospedagem no Kit Documental.
            </span>
          }
        >
          <Field
            label="Tipo de Auxílio"
            span={4}
            tipo="select"
            opcoes={[
              'Passagem Aérea / Terrestre',
              'Hospedagem & Diárias',
              'Misto (Passagem + Hospedagem)',
            ]}
            valor={tipoAuxilio}
            onChange={setTipoAuxilio}
          />
          <Field
            label="Valor Solicitado (R$)"
            span={4}
            prefixo="R$"
            placeholder="0,00"
            obrigatorio
            valor={valorSolicitado}
            onChange={setValorSolicitado}
          />
          <Field
            label="Outras Fontes de Custeio?"
            span={4}
            tipo="select"
            opcoes={[
              'Não',
              'Sim, FAPESP',
              'Sim, CAPES',
              'Sim, CNPq',
              'Sim, Outras Fontes',
            ]}
            valor={outrasFontes}
            onChange={setOutrasFontes}
          />
        </FormSubCard>
      </FormSection>
    </FormPageLayout>
  );
}
