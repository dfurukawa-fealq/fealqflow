import { useState } from 'react';
import { getPrograma } from '../../data/programasApoio';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { FormSubCard } from '../../components/form/FormSubCard';
import { Field } from '../../components/form/Field';
import { NormasPrograma } from '../../components/NormasPrograma';
import { ProgramaApoioSidebar } from '../../components/form/ProgramaApoioSidebar';

const programa = getPrograma('bolsa-pos');

export function BolsaPosGraduacao() {
  // Aluno
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [numUsp, setNumUsp] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nivel, setNivel] = useState('Mestrado');
  const [ppg, setPpg] = useState('');
  const [anoIngresso, setAnoIngresso] = useState('2024');

  // Orientador
  const [orientador, setOrientador] = useState('');
  const [orientadorCpf, setOrientadorCpf] = useState('');
  const [orientadorEmail, setOrientadorEmail] = useState('');
  const [departamento, setDepartamento] = useState('');

  // Pesquisa e Vigência
  const [tituloPesquisa, setTituloPesquisa] = useState('');
  const [resumoPesquisa, setResumoPesquisa] = useState('');
  const [finalidadeConcessao, setFinalidadeConcessao] = useState('Início de Curso (Até 3 meses)');
  const [inicioBolsa, setInicioBolsa] = useState('');
  const [fimBolsa, setFimBolsa] = useState('');
  const [valorMensal, setValorMensal] = useState('');

  const [submetido, setSubmetido] = useState(false);

  // Cálculo de percentual de preenchimento
  const camposObrigatorios = [
    nome,
    cpf,
    numUsp,
    email,
    ppg,
    orientador,
    departamento,
    tituloPesquisa,
    inicioBolsa,
    fimBolsa,
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
      titulo="Bolsa Acadêmica - Pós-graduação"
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
              : 'Preencha os dados do pós-graduando e anexe a justificativa e declarações no Kit.'
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
              Solicitação de Bolsa Pós-Graduação Submetida!
            </h3>
            <p className="text-[14px] mt-xs text-green-800">
              O pedido do pós-graduando <strong>{nome || 'informado'}</strong> ({nivel}) sob orientação de <strong>{orientador || 'docente informado'}</strong> foi registrado. A comissão de bolsas da FEALQ analisará a solicitação.
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

      {/* 1. DADOS DO PÓS-GRADUANDO */}
      <FormSection
        numero={1}
        icone="school"
        titulo="Dados do Pós-Graduando"
      >
        <FormSubCard
          icone="badge"
          titulo="Identificação do Aluno de Pós-Graduação"
          subtitulo="Dados acadêmicos do bolsista"
          badge={
            <span className="text-[11px] px-xs py-0.5 rounded bg-primary/10 text-primary font-semibold">
              Bolsista Pós-Graduação
            </span>
          }
        >
          <Field
            label="Nome Completo do Aluno"
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
            label="RG"
            span={3}
            placeholder="00.000.000-0 SSP/SP"
            valor={rg}
            onChange={setRg}
          />
          <Field
            label="Número USP"
            span={3}
            placeholder="12345678"
            obrigatorio
            valor={numUsp}
            onChange={setNumUsp}
          />
          <Field
            label="E-mail"
            span={3}
            tipo="email"
            placeholder="aluno@usp.br"
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
            label="Nível Acadêmico"
            span={3}
            tipo="select"
            opcoes={['Mestrado', 'Doutorado', 'Pós-Doutorado']}
            valor={nivel}
            onChange={setNivel}
          />
          <Field
            label="Programa de Pós-Graduação (PPG)"
            span={8}
            placeholder="Ex: PPG em Ciência Animal e Pastagens"
            obrigatorio
            valor={ppg}
            onChange={setPpg}
          />
          <Field
            label="Ano de Ingresso"
            span={4}
            placeholder="Ex: 2024"
            valor={anoIngresso}
            onChange={setAnoIngresso}
          />
        </FormSubCard>
      </FormSection>

      {/* 2. DOCENTE ORIENTADOR */}
      <FormSection
        numero={2}
        icone="person_celebrate"
        titulo="Docente Orientador & Departamento"
      >
        <FormSubCard
          icone="supervisor_account"
          titulo="Orientador Responsável"
          subtitulo="Informações institucionais da orientação"
        >
          <Field
            label="Nome do Orientador"
            span={6}
            placeholder="Ex: Profa. Dra. Ana Maria Barbosa"
            obrigatorio
            valor={orientador}
            onChange={setOrientador}
          />
          <Field
            label="CPF do Orientador"
            span={3}
            placeholder="000.000.000-00"
            valor={orientadorCpf}
            onChange={setOrientadorCpf}
          />
          <Field
            label="E-mail do Orientador"
            span={3}
            tipo="email"
            placeholder="orientador@usp.br"
            valor={orientadorEmail}
            onChange={setOrientadorEmail}
          />
          <Field
            label="Departamento / Unidade"
            span={12}
            placeholder="Ex: Departamento de Zootecnia - ESALQ/USP"
            obrigatorio
            valor={departamento}
            onChange={setDepartamento}
          />
        </FormSubCard>
      </FormSection>

      {/* 3. PROJETO DE PESQUISA & VIGÊNCIA */}
      <FormSection
        numero={3}
        icone="assignment"
        titulo="Projeto de Pesquisa & Vigência da Bolsa"
      >
        <FormSubCard
          icone="description"
          titulo="Dissertação / Tese Vinculada"
          subtitulo="Escopo da pesquisa apoiada"
        >
          <Field
            label="Título do Projeto de Pesquisa"
            span={12}
            placeholder="Título completo da dissertação ou tese em desenvolvimento"
            obrigatorio
            valor={tituloPesquisa}
            onChange={setTituloPesquisa}
          />
          <div className="col-span-12">
            <div className="flex items-center justify-between mb-xs">
              <label className="block text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
                Resumo do Projeto & Justificativa do Recurso
              </label>
              <span className="text-[11px] text-on-surface-variant">
                Máximo 1 página
              </span>
            </div>
            <textarea
              rows={3}
              value={resumoPesquisa}
              onChange={(e) => setResumoPesquisa(e.target.value)}
              placeholder="Descreva o estágio atual da pesquisa e justifique o momento de necessidade da bolsa de incentivo..."
              className="w-full p-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors resize-y leading-relaxed"
            />
          </div>
        </FormSubCard>

        <FormSubCard
          icone="schedule"
          titulo="Critérios do Edital & Vigência"
          subtitulo="Concedida por até 3 meses no início ou final dos cursos"
          aviso={
            <span>
              *Conforme o edital FEALQ, esta modalidade é concedida por <strong>até três meses</strong> (início ou final de curso) e <strong>é vedada a prorrogação</strong> ou acúmulo de bolsas semelhantes. Requer encaminhamento pela DVATCOM/seção competente.
            </span>
          }
        >
          <Field
            label="Finalidade da Concessão"
            span={6}
            tipo="select"
            opcoes={[
              'Início de Curso (Até 3 meses)',
              'Finalização de Curso / Tese (Até 3 meses)',
            ]}
            valor={finalidadeConcessao}
            onChange={setFinalidadeConcessao}
          />
          <Field
            label="Valor Mensal Previsto (R$)"
            span={6}
            prefixo="R$"
            placeholder="Conforme Tabela de Bolsas"
            valor={valorMensal}
            onChange={setValorMensal}
          />
          <Field
            label="Início da Bolsa"
            span={6}
            tipo="month"
            obrigatorio
            valor={inicioBolsa}
            onChange={setInicioBolsa}
          />
          <Field
            label="Fim Previsto (Máx 3 meses)"
            span={6}
            tipo="month"
            obrigatorio
            valor={fimBolsa}
            onChange={setFimBolsa}
          />
        </FormSubCard>
      </FormSection>
    </FormPageLayout>
  );
}
