import { useProcessoState } from '../../contexts/ProcessoContext';
import { useState } from 'react';
import { getPrograma } from '../../data/programasApoio';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { FormSubCard } from '../../components/form/FormSubCard';
import { Field } from '../../components/form/Field';
import { NormasPrograma } from '../../components/NormasPrograma';
import { ProgramaApoioSidebar } from '../../components/form/ProgramaApoioSidebar';

const programa = getPrograma('cultura-extensao');

export function CulturaExtensao() {
  // Proponente
  const [nome, setNome] = useProcessoState('nome', '');
  const [cpf, setCpf] = useProcessoState('cpf', '');
  const [email, setEmail] = useProcessoState('email', '');
  const [telefone, setTelefone] = useProcessoState('telefone', '');
  const [instituicao, setInstituicao] = useProcessoState('instituicao', 'ESALQ/USP');
  const [departamento, setDepartamento] = useProcessoState('departamento', '');
  const [vinculo, setVinculo] = useProcessoState('vinculo', 'Docente');

  // Projeto Cultural
  const [nomeProjeto, setNomeProjeto] = useProcessoState('nomeProjeto', '');
  const [areaAtuacao, setAreaAtuacao] = useProcessoState('areaAtuacao', 'Música');
  const [vinculacaoCcex, setVinculacaoCcex] = useProcessoState('vinculacaoCcex', 'Sim, formalmente vinculado');
  const [numeroIntegrantes, setNumeroIntegrantes] = useProcessoState('numeroIntegrantes', '');
  const [descricaoAtividades, setDescricaoAtividades] = useProcessoState('descricaoAtividades', '');
  const [publicoEstimado, setPublicoEstimado] = useProcessoState('publicoEstimado', '');

  // Recursos
  const [finalidadeRecursos, setFinalidadeRecursos] = useProcessoState('finalidadeRecursos', '');
  const [valorSolicitado, setValorSolicitado] = useProcessoState('valorSolicitado', '');

  const [submetido, setSubmetido] = useState(false);

  // Cálculo de percentual de preenchimento
  const camposObrigatorios = [
    nome,
    cpf,
    email,
    departamento,
    nomeProjeto,
    descricaoAtividades,
    finalidadeRecursos,
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
      titulo="Projetos de Cultura e Extensão Universitária"
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
              : 'Preencha o projeto cultural, justificativa e anexe o plano no Kit.'
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
              Solicitação de Apoio Cultural Submetida!
            </h3>
            <p className="text-[14px] mt-xs text-green-800">
              O projeto cultural <strong>{nomeProjeto || 'informado'}</strong> foi cadastrado para análise pela FEALQ.
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
        titulo="Proponente / Coordenador da Ação"
      >
        <FormSubCard
          icone="badge"
          titulo="Identificação do Coordenador"
          subtitulo="Responsável pela gestão da iniciativa cultural"
          badge={
            <span className="text-[11px] px-xs py-0.5 rounded bg-primary/10 text-primary font-semibold">
              Coordenador da Ação
            </span>
          }
        >
          <Field
            label="Nome Completo"
            span={6}
            placeholder="Ex: Prof. Dr. Rodrigo Alves"
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
            placeholder="coordenador@usp.br"
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
            span={3}
            placeholder="Ex: Departamento de Economia"
            obrigatorio
            valor={departamento}
            onChange={setDepartamento}
          />
          <Field
            label="Vínculo Institucional"
            span={3}
            tipo="select"
            opcoes={['Docente', 'Servidor Técnico-Administrativo', 'Aluno']}
            valor={vinculo}
            onChange={setVinculo}
          />
        </FormSubCard>
      </FormSection>

      {/* 2. DADOS DA INICIATIVA CULTURAL */}
      <FormSection
        numero={2}
        icone="palette"
        titulo="Identificação da Iniciativa Cultural"
      >
        <FormSubCard
          icone="groups"
          titulo="Dados do Projeto Cultural"
          subtitulo="Grupo artístico ou projeto de extensão"
        >
          <Field
            label="Nome do Projeto / Grupo Cultural"
            span={8}
            placeholder="Ex: Coral Luiz de Queiroz"
            obrigatorio
            valor={nomeProjeto}
            onChange={setNomeProjeto}
          />
          <Field
            label="Área de Atuação"
            span={4}
            tipo="select"
            opcoes={[
              'Música',
              'Teatro / Artes Cênicas',
              'Artes Visuais / Fotografia',
              'Literatura / Poesia',
              'Patrimônio Histórico e Memória',
              'Outros',
            ]}
            valor={areaAtuacao}
            onChange={setAreaAtuacao}
          />
          <Field
            label="Vinculação Formal à CCEx"
            span={6}
            tipo="select"
            opcoes={[
              'Sim, formalmente vinculado',
              'Não, iniciativa independente',
              'Em processo de vinculação',
            ]}
            valor={vinculacaoCcex}
            onChange={setVinculacaoCcex}
          />
          <Field
            label="Número Estimado de Integrantes"
            span={3}
            placeholder="Ex: 35 membros"
            valor={numeroIntegrantes}
            onChange={setNumeroIntegrantes}
          />
          <Field
            label="Público Beneficiado Estimado"
            span={3}
            placeholder="Ex: 500 pessoas"
            valor={publicoEstimado}
            onChange={setPublicoEstimado}
          />
        </FormSubCard>

        <FormSubCard
          icone="description"
          titulo="Ementa & Impacto Comunitário"
          subtitulo="Descrição das apresentações e atividades abertas à comunidade"
        >
          <div className="col-span-12">
            <div className="flex items-center justify-between mb-xs">
              <label className="block text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
                Breve Descrição das Atividades Culturais <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-on-surface-variant">
                Histórico e plano de ensaios/apresentações
              </span>
            </div>
            <textarea
              rows={4}
              value={descricaoAtividades}
              onChange={(e) => setDescricaoAtividades(e.target.value)}
              placeholder="Descreva o que o grupo realiza, calendário previsto de ensaios e apresentações abertas à comunidade no campus e na cidade..."
              className="w-full p-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors resize-y leading-relaxed"
            />
          </div>
        </FormSubCard>
      </FormSection>

      {/* 3. RECURSOS SOLICITADOS */}
      <FormSection
        numero={3}
        icone="payments"
        titulo="Plano de Aplicação dos Recursos"
      >
        <FormSubCard
          icone="account_balance_wallet"
          titulo="Destinação dos Recursos"
          subtitulo="Teto máximo de R$ 3.000,00 por apoio"
          aviso={
            <span>
              *O teto máximo deste programa é de <strong>R$ 3.000,00</strong>. Os recursos destinam-se a figurinos, materiais de oficina, reparo/aquisição de instrumentos e logística de apresentações.
            </span>
          }
        >
          <div className="col-span-12">
            <div className="flex items-center justify-between mb-xs">
              <label className="block text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
                Para que os recursos serão destinados? <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-on-surface-variant">
                Discrimine itens e fornecedores previstos
              </span>
            </div>
            <textarea
              rows={3}
              value={finalidadeRecursos}
              onChange={(e) => setFinalidadeRecursos(e.target.value)}
              placeholder="Ex: Compra de partituras e estantes, manutenção de instrumentos de sopro e contratação de transporte para apresentação regional..."
              className="w-full p-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors resize-y leading-relaxed"
            />
          </div>
          <Field
            label="Valor Solicitado (R$)"
            span={6}
            prefixo="R$"
            placeholder="0,00"
            obrigatorio
            valor={valorSolicitado}
            onChange={setValorSolicitado}
          />
        </FormSubCard>
      </FormSection>
    </FormPageLayout>
  );
}
