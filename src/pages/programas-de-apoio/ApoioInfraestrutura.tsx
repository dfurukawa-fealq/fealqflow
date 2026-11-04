import { useState } from 'react';
import { getPrograma } from '../../data/programasApoio';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { FormSubCard } from '../../components/form/FormSubCard';
import { Field } from '../../components/form/Field';
import { NormasPrograma } from '../../components/NormasPrograma';
import { ProgramaApoioSidebar } from '../../components/form/ProgramaApoioSidebar';

const programa = getPrograma('infraestrutura');

export function ApoioInfraestrutura() {
  // Responsável
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [instituicao, setInstituicao] = useState('ESALQ/USP');
  const [departamento, setDepartamento] = useState('');

  // Local
  const [laboratorio, setLaboratorio] = useState('');
  const [predioBloco, setPredioBloco] = useState('');
  const [salaLocal, setSalaLocal] = useState('');
  const [usuariosBeneficiados, setUsuariosBeneficiados] = useState('');

  // Detalhes da Demanda
  const [tipoApoio, setTipoApoio] = useState('Compra de Equipamento de Grande Porte');
  const [justificativa, setJustificativa] = useState('');

  // Orçamento
  const [valorEstimado, setValorEstimado] = useState('');
  const [fornecedorPrincipal, setFornecedorPrincipal] = useState('');

  const [submetido, setSubmetido] = useState(false);

  // Cálculo de percentual de preenchimento
  const camposObrigatorios = [
    nome,
    cpf,
    email,
    departamento,
    laboratorio,
    salaLocal,
    justificativa,
    valorEstimado,
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
      titulo="Apoio a Infraestrutura e Laboratórios"
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
              : 'Preencha os dados do laboratório, escopo e anexe os orçamentos no Kit.'
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
              Solicitação de Apoio a Infraestrutura Submetida!
            </h3>
            <p className="text-[14px] mt-xs text-green-800">
              O pedido de melhoria para o espaço <strong>{laboratorio || 'informado'}</strong> foi registrado com sucesso. A comissão técnica da FEALQ analisará a solicitação e os orçamentos anexados.
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
        titulo="Responsável pela Solicitação"
      >
        <FormSubCard
          icone="badge"
          titulo="Docente / Responsável Técnico"
          subtitulo="Dados do coordenador do laboratório ou docente solicitante"
          badge={
            <span className="text-[11px] px-xs py-0.5 rounded bg-primary/10 text-primary font-semibold">
              Responsável Técnico
            </span>
          }
        >
          <Field
            label="Nome Completo"
            span={6}
            placeholder="Ex: Prof. Dr. Fernando Almeida"
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
            placeholder="docente@usp.br"
            obrigatorio
            valor={email}
            onChange={setEmail}
          />
          <Field
            label="Telefone / Ramal"
            span={4}
            placeholder="(19) 3429-4100"
            valor={telefone}
            onChange={setTelefone}
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
            placeholder="Ex: Departamento de Genética"
            obrigatorio
            valor={departamento}
            onChange={setDepartamento}
          />
        </FormSubCard>
      </FormSection>

      {/* 2. LOCAL DA MELHORIA */}
      <FormSection
        numero={2}
        icone="domain"
        titulo="Local da Melhoria & Espaço Físico"
      >
        <FormSubCard
          icone="location_on"
          titulo="Identificação do Espaço Físico"
          subtitulo="Localização exata onde será aplicada a melhoria"
        >
          <Field
            label="Laboratório / Setor"
            span={6}
            placeholder="Ex: Laboratório de Biologia Molecular"
            obrigatorio
            valor={laboratorio}
            onChange={setLaboratorio}
          />
          <Field
            label="Prédio / Bloco"
            span={3}
            placeholder="Ex: Prédio Central, Ala Sul"
            valor={predioBloco}
            onChange={setPredioBloco}
          />
          <Field
            label="Sala / Local Específico"
            span={3}
            placeholder="Ex: Sala 102"
            obrigatorio
            valor={salaLocal}
            onChange={setSalaLocal}
          />
          <Field
            label="Estimativa de Usuários Beneficiados"
            span={12}
            placeholder="Ex: Cerca de 45 pós-graduandos, 6 docentes e 20 alunos de IC"
            valor={usuariosBeneficiados}
            onChange={setUsuariosBeneficiados}
          />
        </FormSubCard>
      </FormSection>

      {/* 3. DETALHES DO PEDIDO */}
      <FormSection
        numero={3}
        icone="handyman"
        titulo="Detalhes do Pedido & Justificativa Técnica"
      >
        <FormSubCard
          icone="description"
          titulo="Escopo da Demanda"
          subtitulo="Especificação das obras, reparos ou aquisições necessárias"
        >
          <Field
            label="Tipo de Apoio"
            span={12}
            tipo="select"
            opcoes={[
              'Compra de Equipamento de Grande Porte',
              'Reforma Estrutural e Adequação',
              'Manutenção Especializada de Equipamentos',
              'Adequação de Infraestrutura Elétrica / Segurança',
            ]}
            valor={tipoApoio}
            onChange={setTipoApoio}
          />
          <div className="col-span-12">
            <div className="flex items-center justify-between mb-xs">
              <label className="block text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
                Justificativa da Necessidade e Impacto Científico <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-on-surface-variant">
                Detalhe a urgência e os projetos impactados
              </span>
            </div>
            <textarea
              rows={4}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Explique por que esta infraestrutura é necessária, quais pesquisas estão sendo prejudicadas pela falta dela e quais benefícios diretos trará..."
              className="w-full p-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors resize-y leading-relaxed"
            />
          </div>
        </FormSubCard>
      </FormSection>

      {/* 4. ORÇAMENTO & ESTIMATIVA */}
      <FormSection
        numero={4}
        icone="payments"
        titulo="Estimativa Orçamentária"
      >
        <FormSubCard
          icone="attach_money"
          titulo="Valores & Propostas Comerciais"
          subtitulo="Teto máximo de R$ 20.000,00 por solicitação"
          aviso={
            <span>
              *O teto máximo para este programa é de <strong>R$ 20.000,00</strong>. É mandatório anexar <strong>3 orçamentos comparativos de fornecedores distintos</strong> no Kit de Documentação ao lado.
            </span>
          }
        >
          <Field
            label="Valor Estimado Total (R$)"
            span={6}
            prefixo="R$"
            placeholder="0,00"
            obrigatorio
            valor={valorEstimado}
            onChange={setValorEstimado}
          />
          <Field
            label="Fornecedor Principal / Empresa Vencedora"
            span={6}
            placeholder="Nome da empresa com menor orçamento"
            valor={fornecedorPrincipal}
            onChange={setFornecedorPrincipal}
          />
        </FormSubCard>
      </FormSection>
    </FormPageLayout>
  );
}
