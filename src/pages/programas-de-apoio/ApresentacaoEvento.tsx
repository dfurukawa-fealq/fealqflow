import { useState } from 'react';
import { getPrograma } from '../../data/programasApoio';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { FormSubCard } from '../../components/form/FormSubCard';
import { Field } from '../../components/form/Field';
import { NormasPrograma } from '../../components/NormasPrograma';
import { ProgramaApoioSidebar } from '../../components/form/ProgramaApoioSidebar';

const programa = getPrograma('apresentacao-evento');

export function ApresentacaoEvento() {
  // Dados do Solicitante
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [instituicao, setInstituicao] = useState('ESALQ/USP');
  const [departamento, setDepartamento] = useState('');
  const [vinculo, setVinculo] = useState('Pós-Graduando');
  const [orientador, setOrientador] = useState('');

  // Dados do Evento
  const [nomeEvento, setNomeEvento] = useState('');
  const [abrangencia, setAbrangencia] = useState('Nacional');
  const [websiteEvento, setWebsiteEvento] = useState('');
  const [cidade, setCidade] = useState('');
  const [pais, setPais] = useState('Brasil');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [modalidade, setModalidade] = useState('Presencial');

  // Trabalho
  const [tituloTrabalho, setTituloTrabalho] = useState('');
  const [formatoApresentacao, setFormatoApresentacao] = useState('Comunicação Oral');
  const [coautores, setCoautores] = useState('');
  const [resumoTrabalho, setResumoTrabalho] = useState('');

  // Custos
  const [tipoAuxilio, setTipoAuxilio] = useState('Inscrição + Viagem');
  const [valorSolicitado, setValorSolicitado] = useState('');
  const [outrasFontes, setOutrasFontes] = useState('Não possui');

  const [submetido, setSubmetido] = useState(false);

  // Cálculo de percentual de preenchimento
  const camposObrigatorios = [
    nome,
    cpf,
    email,
    departamento,
    nomeEvento,
    cidade,
    dataInicio,
    dataFim,
    tituloTrabalho,
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
      titulo="Apoio para Apresentação em Evento"
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
              : 'Preencha os campos obrigatórios e anexe o comprovante de aceite no Kit.'
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
              Solicitação de Apoio Submetida com Sucesso!
            </h3>
            <p className="text-[14px] mt-xs text-green-800">
              O pedido de auxílio para o evento <strong>{nomeEvento || 'informado'}</strong> foi registrado com sucesso. A equipe da FEALQ analisará o pedido e a documentação enviada.
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

      {/* 1. DADOS DO PROPONENTE */}
      <FormSection
        numero={1}
        icone="person"
        titulo="Dados do Proponente / Solicitante"
      >
        <FormSubCard
          icone="badge"
          titulo="Identificação do Solicitante"
          subtitulo="Dados cadastrais institucionais"
          badge={
            <span className="text-[11px] px-xs py-0.5 rounded bg-primary/10 text-primary font-semibold">
              Proponente Titular
            </span>
          }
        >
          <Field
            label="Nome Completo"
            span={6}
            placeholder="Ex: João da Silva Santos"
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
            placeholder="usuario@usp.br"
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
            placeholder="Ex: Departamento de Entomologia"
            obrigatorio
            valor={departamento}
            onChange={setDepartamento}
          />
          <Field
            label="Vínculo com a Instituição"
            span={6}
            tipo="select"
            opcoes={['Docente', 'Pós-Doutorando', 'Doutorando', 'Mestrando', 'Graduando']}
            valor={vinculo}
            onChange={setVinculo}
          />
          <Field
            label="Docente Orientador / Supervisor"
            span={6}
            placeholder="Nome do orientador responsável"
            valor={orientador}
            onChange={setOrientador}
          />
        </FormSubCard>
      </FormSection>

      {/* 2. DADOS DO EVENTO */}
      <FormSection
        numero={2}
        icone="public"
        titulo="Dados do Evento & Localização"
      >
        <FormSubCard
          icone="event"
          titulo="Caracterização do Evento"
          subtitulo="Informe os dados oficiais do congresso ou simpósio"
        >
          <Field
            label="Nome do Evento/Congresso"
            span={8}
            placeholder="Ex: Simpósio Brasileiro de Agropecuária Sustentável"
            obrigatorio
            valor={nomeEvento}
            onChange={setNomeEvento}
          />
          <Field
            label="Abrangência"
            span={4}
            tipo="select"
            opcoes={['Nacional', 'Internacional']}
            valor={abrangencia}
            onChange={setAbrangencia}
          />
          <Field
            label="Website do Evento"
            span={8}
            tipo="url"
            placeholder="https://eventocientifico.org.br"
            valor={websiteEvento}
            onChange={setWebsiteEvento}
          />
          <Field
            label="Modalidade"
            span={4}
            tipo="select"
            opcoes={['Presencial', 'Online', 'Híbrido']}
            valor={modalidade}
            onChange={setModalidade}
          />
        </FormSubCard>

        <FormSubCard
          icone="location_on"
          titulo="Localização e Cronograma"
          subtitulo="Datas de realização e cidade sede"
        >
          <Field
            label="Cidade"
            span={6}
            placeholder="Ex: São Paulo, SP"
            obrigatorio
            valor={cidade}
            onChange={setCidade}
          />
          <Field
            label="País"
            span={6}
            placeholder="Ex: Brasil"
            valor={pais}
            onChange={setPais}
          />
          <Field
            label="Data de Início"
            span={6}
            tipo="date"
            obrigatorio
            valor={dataInicio}
            onChange={setDataInicio}
          />
          <Field
            label="Data de Término"
            span={6}
            tipo="date"
            obrigatorio
            valor={dataFim}
            onChange={setDataFim}
          />
        </FormSubCard>
      </FormSection>

      {/* 3. TRABALHO A SER APRESENTADO */}
      <FormSection
        numero={3}
        icone="mic"
        titulo="Trabalho Acadêmico / Científico"
      >
        <FormSubCard
          icone="article"
          titulo="Detalhamento do Trabalho Aceito"
          subtitulo="O aceite formal deve ser anexado no Kit de Documentação"
        >
          <Field
            label="Título do Trabalho Aceito"
            span={12}
            placeholder="Título exato conforme submissão no evento"
            obrigatorio
            valor={tituloTrabalho}
            onChange={setTituloTrabalho}
          />
          <Field
            label="Formato de Apresentação"
            span={6}
            tipo="select"
            opcoes={[
              'Comunicação Oral',
              'Pôster / Painel',
              'Mesa Redonda',
              'Palestra Convidada',
            ]}
            valor={formatoApresentacao}
            onChange={setFormatoApresentacao}
          />
          <Field
            label="Co-autores"
            span={6}
            placeholder="Ex: SILVA, J.; SOUZA, M.; OLIVEIRA, R."
            valor={coautores}
            onChange={setCoautores}
          />
          <div className="col-span-12">
            <div className="flex items-center justify-between mb-xs">
              <label className="block text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
                Resumo do Trabalho / Justificativa de Participação
              </label>
              <span className="text-[11px] text-on-surface-variant">
                Breve síntese dos resultados
              </span>
            </div>
            <textarea
              rows={3}
              value={resumoTrabalho}
              onChange={(e) => setResumoTrabalho(e.target.value)}
              placeholder="Descreva brevemente os objetivos da pesquisa apresentada e a relevância da participação no evento..."
              className="w-full p-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors resize-y leading-relaxed"
            />
          </div>
        </FormSubCard>
      </FormSection>

      {/* 4. CUSTOS & RECURSOS PLEITEADOS */}
      <FormSection
        numero={4}
        icone="payments"
        titulo="Recursos Solicitados & Custeio"
      >
        <FormSubCard
          icone="account_balance_wallet"
          titulo="Composição do Custo Estimado"
          subtitulo="Respeitar os limites de teto previstos no edital FEALQ"
          aviso={
            <span>
              *Teto Máximo previsto pelo edital: <strong>R$ 3.000,00</strong> para eventos nacionais e <strong>R$ 6.000,00</strong> para eventos internacionais no exterior.
            </span>
          }
        >
          <Field
            label="Tipo de Auxílio Solicitado"
            span={4}
            tipo="select"
            opcoes={[
              'Taxa de Inscrição no Evento',
              'Passagens Aéreas / Terrestres',
              'Hospedagem / Diárias',
              'Inscrição + Viagem',
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
              'Não possui',
              'Sim, FAPESP',
              'Sim, CAPES',
              'Sim, CNPq',
              'Sim, Programa de Pós',
            ]}
            valor={outrasFontes}
            onChange={setOutrasFontes}
          />
        </FormSubCard>
      </FormSection>
    </FormPageLayout>
  );
}
