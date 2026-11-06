import { useProcessoState } from '../../contexts/ProcessoContext';
import { useState } from 'react';
import { getPrograma } from '../../data/programasApoio';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { FormSubCard } from '../../components/form/FormSubCard';
import { Field } from '../../components/form/Field';
import { NormasPrograma } from '../../components/NormasPrograma';
import { ProgramaApoioSidebar } from '../../components/form/ProgramaApoioSidebar';

const programa = getPrograma('interesse-comunidade');

export function InteresseComunidade() {
  // Responsável
  const [nome, setNome] = useProcessoState('nome', '');
  const [cpf, setCpf] = useProcessoState('cpf', '');
  const [email, setEmail] = useProcessoState('email', '');
  const [telefone, setTelefone] = useProcessoState('telefone', '');
  const [departamento, setDepartamento] = useProcessoState('departamento', '');
  const [funcao, setFuncao] = useProcessoState('funcao', 'Coordenador do Projeto');

  // Ação Comunitária
  const [nomeAcao, setNomeAcao] = useProcessoState('nomeAcao', '');
  const [tema, setTema] = useProcessoState('tema', 'Sustentabilidade e Meio Ambiente');
  const [objetivo, setObjetivo] = useProcessoState('objetivo', '');
  const [bairro, setBairro] = useProcessoState('bairro', '');
  const [cidade, setCidade] = useProcessoState('cidade', 'Piracicaba, SP');
  const [publicoEstimado, setPublicoEstimado] = useProcessoState('publicoEstimado', '');

  // Parcerias e Orçamento
  const [parceiros, setParceiros] = useProcessoState('parceiros', '');
  const [valorSolicitado, setValorSolicitado] = useProcessoState('valorSolicitado', '');
  const [itensAdquirir, setItensAdquirir] = useProcessoState('itensAdquirir', '');

  const [submetido, setSubmetido] = useState(false);

  // Cálculo de percentual de preenchimento
  const camposObrigatorios = [
    nome,
    cpf,
    email,
    nomeAcao,
    objetivo,
    bairro,
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
      titulo="Projetos de Interesse da Comunidade"
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
              : 'Preencha os objetivos da ação comunitária e anexe a proposta no Kit.'
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
              Solicitação de Projeto Comunitário Submetida!
            </h3>
            <p className="text-[14px] mt-xs text-green-800">
              A proposta da ação <strong>{nomeAcao || 'informada'}</strong> para a comunidade de <strong>{bairro || 'informada'}</strong> foi recebida com sucesso pela FEALQ.
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

      {/* 1. DADOS DO RESPONSÁVEL */}
      <FormSection
        numero={1}
        icone="person"
        titulo="Responsável pela Ação Comunitária"
      >
        <FormSubCard
          icone="badge"
          titulo="Identificação do Responsável"
          subtitulo="Interlocutor do projeto junto à FEALQ"
          badge={
            <span className="text-[11px] px-xs py-0.5 rounded bg-primary/10 text-primary font-semibold">
              Responsável pelo Projeto
            </span>
          }
        >
          <Field
            label="Nome Completo"
            span={6}
            placeholder="Ex: Profa. Dra. Mariana Ferreira"
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
            label="E-mail de Contato"
            span={3}
            tipo="email"
            placeholder="responsavel@usp.br"
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
            label="Departamento / Setor Vinculado"
            span={4}
            placeholder="Ex: Departamento de Agroindústria"
            valor={departamento}
            onChange={setDepartamento}
          />
          <Field
            label="Função no Projeto"
            span={4}
            placeholder="Ex: Coordenador Geral"
            valor={funcao}
            onChange={setFuncao}
          />
        </FormSubCard>
      </FormSection>

      {/* 2. DADOS DO PROJETO COMUNITÁRIO */}
      <FormSection
        numero={2}
        icone="volunteer_activism"
        titulo="Caracterização do Projeto Comunitário"
      >
        <FormSubCard
          icone="diversity_3"
          titulo="Ação e Escopo Social"
          subtitulo="Natureza e objetivos sociais da intervenção"
        >
          <Field
            label="Nome do Projeto / Ação"
            span={8}
            placeholder="Ex: Horta Comunitária Educativa e Agroecológica"
            obrigatorio
            valor={nomeAcao}
            onChange={setNomeAcao}
          />
          <Field
            label="Tema Principal"
            span={4}
            tipo="select"
            opcoes={[
              'Sustentabilidade e Meio Ambiente',
              'Educação e Cidadania',
              'Segurança Alimentar e Nutricional',
              'Saúde e Bem-Estar',
              'Capacitação Profissional / Renda',
            ]}
            valor={tema}
            onChange={setTema}
          />
          <div className="col-span-12">
            <div className="flex items-center justify-between mb-xs">
              <label className="block text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
                Objetivo Principal & Impacto Esperado <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-on-surface-variant">
                Quais transformações positivas a comunidade receberá?
              </span>
            </div>
            <textarea
              rows={4}
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Descreva a finalidade da ação, métodos participativos e como a comunidade será mobilizada..."
              className="w-full p-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors resize-y leading-relaxed"
            />
          </div>
        </FormSubCard>

        <FormSubCard
          icone="location_on"
          titulo="Comunidade Atendida & Local de Realização"
          subtitulo="Público-alvo direto e território de atuação"
        >
          <Field
            label="Bairro / Comunidade"
            span={6}
            placeholder="Ex: Bairro São Mário"
            obrigatorio
            valor={bairro}
            onChange={setBairro}
          />
          <Field
            label="Cidade e UF"
            span={3}
            placeholder="Piracicaba, SP"
            valor={cidade}
            onChange={setCidade}
          />
          <Field
            label="Público Estimado (Pessoas)"
            span={3}
            tipo="number"
            placeholder="Ex: 150"
            valor={publicoEstimado}
            onChange={setPublicoEstimado}
          />
        </FormSubCard>
      </FormSection>

      {/* 3. PARCERIAS & RECURSOS */}
      <FormSection
        numero={3}
        icone="handshake"
        titulo="Parcerias Locais & Orçamento Solicitado"
      >
        <FormSubCard
          icone="account_balance_wallet"
          titulo="Apoio Financeiro Solicitado"
          subtitulo="Teto máximo de R$ 5.000,00 por apoio"
          aviso={
            <span>
              *O teto máximo deste programa é de <strong>R$ 5.000,00</strong>. Os recursos devem ser aplicados exclusivamente em materiais de consumo, sementes, mudas, ferramentas manuais e logística direta para a comunidade.
            </span>
          }
        >
          <Field
            label="Parceiros Locais (Associações de Bairro, ONGs, Escolas)"
            span={12}
            placeholder="Ex: Associação de Moradores do Bairro São Mário, Escola Municipal Prof. José"
            valor={parceiros}
            onChange={setParceiros}
          />
          <Field
            label="Valor do Apoio Solicitado (R$)"
            span={6}
            prefixo="R$"
            placeholder="0,00"
            obrigatorio
            valor={valorSolicitado}
            onChange={setValorSolicitado}
          />
          <Field
            label="Discriminação Resumida dos Itens a Adquirir"
            span={6}
            placeholder="Ex: Mudas, ferramentas para horta, sombrites e adubo orgânico"
            valor={itensAdquirir}
            onChange={setItensAdquirir}
          />
        </FormSubCard>
      </FormSection>
    </FormPageLayout>
  );
}
