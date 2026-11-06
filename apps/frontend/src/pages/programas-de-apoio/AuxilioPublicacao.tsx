import { useProcessoState } from '../../contexts/ProcessoContext';
import { useState } from 'react';
import { getPrograma } from '../../data/programasApoio';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { FormSubCard } from '../../components/form/FormSubCard';
import { Field } from '../../components/form/Field';
import { NormasPrograma } from '../../components/NormasPrograma';
import { ProgramaApoioSidebar } from '../../components/form/ProgramaApoioSidebar';

const programa = getPrograma('auxilio-publicacao');

export function AuxilioPublicacao() {
  // Solicitante
  const [nome, setNome] = useProcessoState('nome', '');
  const [cpf, setCpf] = useProcessoState('cpf', '');
  const [email, setEmail] = useProcessoState('email', '');
  const [instituicao, setInstituicao] = useProcessoState('instituicao', 'ESALQ/USP');
  const [departamento, setDepartamento] = useProcessoState('departamento', '');
  const [vinculo, setVinculo] = useProcessoState('vinculo', 'Docente');
  const [orientador, setOrientador] = useProcessoState('orientador', '');
  const [participacao, setParticipacao] = useProcessoState('participacao', '1º Autor');

  // Artigo e Revista
  const [tituloArtigo, setTituloArtigo] = useProcessoState('tituloArtigo', '');
  const [resumoArtigo, setResumoArtigo] = useProcessoState('resumoArtigo', '');
  const [revista, setRevista] = useProcessoState('revista', '');
  const [issn, setIssn] = useProcessoState('issn', '');
  const [impactFactor, setImpactFactor] = useProcessoState('impactFactor', '');
  const [citeScore, setCiteScore] = useProcessoState('citeScore', '');
  const [qualis, setQualis] = useProcessoState('qualis', 'A1');

  // Valores e APC
  const [moeda, setMoeda] = useProcessoState('moeda', 'USD ($)');
  const [valorApc, setValorApc] = useProcessoState('valorApc', '');
  const [valorSolicitado, setValorSolicitado] = useProcessoState('valorSolicitado', '');
  const [outrasFontes, setOutrasFontes] = useProcessoState('outrasFontes', 'Não');

  const [submetido, setSubmetido] = useState(false);

  // Cálculo de percentual de preenchimento
  const camposObrigatorios = [
    nome,
    cpf,
    email,
    departamento,
    tituloArtigo,
    revista,
    valorApc,
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
      titulo="Auxílio para Publicação de Artigo Científico"
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
              : 'Preencha os dados do artigo, periódico e anexe a carta de aceite no Kit.'
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
              Solicitação de Auxílio à Publicação Submetida!
            </h3>
            <p className="text-[14px] mt-xs text-green-800">
              O pedido referente ao artigo <strong>{tituloArtigo || 'informado'}</strong> na revista <strong>{revista || 'informada'}</strong> foi registrado com sucesso na FEALQ.
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

      {/* 1. DADOS DO SOLICITANTE */}
      <FormSection
        numero={1}
        icone="person"
        titulo="Dados do Autor Solicitante"
      >
        <FormSubCard
          icone="badge"
          titulo="Identificação do Autor"
          subtitulo="Dados acadêmicos do proponente"
          badge={
            <span className="text-[11px] px-xs py-0.5 rounded bg-primary/10 text-primary font-semibold">
              Autor Solicitante
            </span>
          }
        >
          <Field
            label="Nome Completo"
            span={6}
            placeholder="Ex: Prof. Dr. Carlos Eduardo"
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
            placeholder="autor@usp.br"
            obrigatorio
            valor={email}
            onChange={setEmail}
          />
          <Field
            label="Instituição"
            span={4}
            tipo="select"
            opcoes={['ESALQ/USP', 'FZEA/USP', 'CENA/USP', 'Outra Unidade USP']}
            valor={instituicao}
            onChange={setInstituicao}
          />
          <Field
            label="Departamento"
            span={4}
            placeholder="Ex: Departamento de Ciência do Solo"
            obrigatorio
            valor={departamento}
            onChange={setDepartamento}
          />
          <Field
            label="Vínculo Institucional"
            span={4}
            tipo="select"
            opcoes={['Docente', 'Pós-Doutorando', 'Doutorando', 'Mestrando']}
            valor={vinculo}
            onChange={setVinculo}
          />
          <Field
            label="Orientador (se pós-graduando)"
            span={6}
            placeholder="Nome do docente orientador"
            valor={orientador}
            onChange={setOrientador}
          />
          <Field
            label="Participação no Artigo"
            span={6}
            tipo="select"
            opcoes={['1º Autor', 'Autor Correspondente', 'Co-autor']}
            valor={participacao}
            onChange={setParticipacao}
          />
        </FormSubCard>
      </FormSection>

      {/* 2. DADOS DA PUBLICAÇÃO */}
      <FormSection
        numero={2}
        icone="article"
        titulo="Dados do Artigo & Periódico Científico"
      >
        <FormSubCard
          icone="menu_book"
          titulo="Artigo Científico Aceito"
          subtitulo="Artigo aceito para publicação formal"
        >
          <Field
            label="Título Completo do Artigo"
            span={12}
            placeholder="Insira o título exato conforme submetido e aceito na revista"
            obrigatorio
            valor={tituloArtigo}
            onChange={setTituloArtigo}
          />
          <div className="col-span-12">
            <div className="flex items-center justify-between mb-xs">
              <label className="block text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
                Resumo / Abstract
              </label>
              <span className="text-[11px] text-on-surface-variant">
                Síntese do artigo
              </span>
            </div>
            <textarea
              rows={3}
              value={resumoArtigo}
              onChange={(e) => setResumoArtigo(e.target.value)}
              placeholder="Cole aqui o resumo do artigo científico..."
              className="w-full p-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors resize-y leading-relaxed"
            />
          </div>
        </FormSubCard>

        <FormSubCard
          icone="newspaper"
          titulo="Revista / Periódico Internacional"
          subtitulo="Métricas e indexação da publicação"
        >
          <Field
            label="Nome da Revista / Periódico"
            span={6}
            placeholder="Ex: Journal of Agricultural Science"
            obrigatorio
            valor={revista}
            onChange={setRevista}
          />
          <Field
            label="ISSN"
            span={3}
            placeholder="Ex: 1234-5678"
            valor={issn}
            onChange={setIssn}
          />
          <Field
            label="Qualis CAPES"
            span={3}
            tipo="select"
            opcoes={['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4']}
            valor={qualis}
            onChange={setQualis}
          />
          <Field
            label="Impact Factor (JCR)"
            span={6}
            placeholder="Ex: 4.850"
            valor={impactFactor}
            onChange={setImpactFactor}
          />
          <Field
            label="CiteScore (Scopus)"
            span={6}
            placeholder="Ex: 6.20"
            valor={citeScore}
            onChange={setCiteScore}
          />
        </FormSubCard>
      </FormSection>

      {/* 3. TAXA DE PUBLICAÇÃO & CUSTEIO */}
      <FormSection
        numero={3}
        icone="payments"
        titulo="Detalhamento da Taxa de Publicação (APC)"
      >
        <FormSubCard
          icone="price_change"
          titulo="Valores & Fontes de Custeio"
          subtitulo="Valores da fatura e aporte solicitado à FEALQ"
          aviso={
            <span>
              *O teto do auxílio para publicação segue os critérios estabelecidos no edital FEALQ. É obrigatório anexar a <strong>Invoice / Fatura da Taxa de Publicação</strong> e a <strong>Carta de Aceite</strong> no Kit Documental.
            </span>
          }
        >
          <Field
            label="Moeda da Fatura"
            span={3}
            tipo="select"
            opcoes={['USD ($)', 'BRL (R$)', 'EUR (€)', 'GBP (£)']}
            valor={moeda}
            onChange={setMoeda}
          />
          <Field
            label="Valor da Taxa (APC) na Moeda"
            span={3}
            placeholder="Ex: 1500.00"
            obrigatorio
            valor={valorApc}
            onChange={setValorApc}
          />
          <Field
            label="Valor Solicitado à FEALQ (R$)"
            span={3}
            prefixo="R$"
            placeholder="0,00"
            obrigatorio
            valor={valorSolicitado}
            onChange={setValorSolicitado}
          />
          <Field
            label="Outras Fontes de Custeio?"
            span={3}
            tipo="select"
            opcoes={[
              'Não',
              'Sim, FAPESP',
              'Sim, CAPES',
              'Sim, CNPq',
              'Sim, Pró-Reitoria de Pesquisa USP',
              'Sim, Outras',
            ]}
            valor={outrasFontes}
            onChange={setOutrasFontes}
          />
        </FormSubCard>
      </FormSection>
    </FormPageLayout>
  );
}
