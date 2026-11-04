import { useState } from 'react';
import { getPrograma } from '../../data/programasApoio';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { FormSubCard } from '../../components/form/FormSubCard';
import { Field } from '../../components/form/Field';
import { NormasPrograma } from '../../components/NormasPrograma';
import { ProgramaApoioSidebar } from '../../components/form/ProgramaApoioSidebar';

const programa = getPrograma('bolsa-graduacao');

export function BolsaGraduacao() {
  // Aluno
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [numUsp, setNumUsp] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [curso, setCurso] = useState('');
  const [semestre, setSemestre] = useState('5º Semestre');

  // Orientador
  const [orientador, setOrientador] = useState('');
  const [orientadorCpf, setOrientadorCpf] = useState('');
  const [orientadorEmail, setOrientadorEmail] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [projetoGuardaChuva, setProjetoGuardaChuva] = useState('');

  // Plano
  const [tituloPlano, setTituloPlano] = useState('');
  const [resumoPlano, setResumoPlano] = useState('');
  const [inicioBolsa, setInicioBolsa] = useState('');
  const [fimBolsa, setFimBolsa] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('20h semanais');

  const [submetido, setSubmetido] = useState(false);

  // Cálculo de percentual de preenchimento
  const camposObrigatorios = [
    nome,
    cpf,
    numUsp,
    email,
    curso,
    orientador,
    departamento,
    tituloPlano,
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
      titulo="Bolsa Graduação (Iniciação Científica)"
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
              : 'Preencha os dados do bolsista, orientador e anexe os históricos no Kit.'
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
              Solicitação de Bolsa Graduação Submetida com Sucesso!
            </h3>
            <p className="text-[14px] mt-xs text-green-800">
              O pedido de concessão de bolsa para o aluno <strong>{nome || 'informado'}</strong> sob orientação de <strong>{orientador || 'docente informado'}</strong> foi recebido pela FEALQ.
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

      {/* 1. DADOS DO BOLSISTA */}
      <FormSection
        numero={1}
        icone="school"
        titulo="Dados do Bolsista de Iniciação Científica"
      >
        <FormSubCard
          icone="badge"
          titulo="Identificação do Aluno"
          subtitulo="Dados acadêmicos de graduação"
          badge={
            <span className="text-[11px] px-xs py-0.5 rounded bg-primary/10 text-primary font-semibold">
              Bolsista IC
            </span>
          }
        >
          <Field
            label="Nome Completo do Aluno"
            span={6}
            placeholder="Ex: Maria Oliveira Santos"
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
            label="Número USP / Matrícula"
            span={3}
            placeholder="12345678"
            obrigatorio
            valor={numUsp}
            onChange={setNumUsp}
          />
          <Field
            label="E-mail do Aluno"
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
            label="Período / Semestre"
            span={3}
            tipo="select"
            opcoes={[
              '1º Semestre',
              '2º Semestre',
              '3º Semestre',
              '4º Semestre',
              '5º Semestre',
              '6º Semestre',
              '7º Semestre',
              '8º Semestre',
              '9º Semestre',
              '10º Semestre',
            ]}
            valor={semestre}
            onChange={setSemestre}
          />
          <Field
            label="Curso de Graduação"
            span={12}
            placeholder="Ex: Engenharia Agronômica - ESALQ/USP"
            obrigatorio
            valor={curso}
            onChange={setCurso}
          />
        </FormSubCard>
      </FormSection>

      {/* 2. DOCENTE ORIENTADOR */}
      <FormSection
        numero={2}
        icone="person_celebrate"
        titulo="Docente Orientador & Laboratório"
      >
        <FormSubCard
          icone="supervisor_account"
          titulo="Orientação Acadêmica"
          subtitulo="Dados do orientador responsável pela pesquisa"
        >
          <Field
            label="Nome do Orientador"
            span={6}
            placeholder="Ex: Prof. Dr. Roberto Mendes"
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
            span={6}
            placeholder="Ex: Departamento de Fitopatologia e Nematologia"
            obrigatorio
            valor={departamento}
            onChange={setDepartamento}
          />
          <Field
            label="Projeto Guarda-Chuva (se houver)"
            span={6}
            placeholder="Nome do projeto de pesquisa principal financiado"
            valor={projetoGuardaChuva}
            onChange={setProjetoGuardaChuva}
          />
        </FormSubCard>
      </FormSection>

      {/* 3. PLANO DE TRABALHO */}
      <FormSection
        numero={3}
        icone="assignment"
        titulo="Plano de Trabalho & Cronograma"
      >
        <FormSubCard
          icone="description"
          titulo="Plano de Iniciação Científica"
          subtitulo="Escopo da pesquisa a ser executada pelo bolsista"
        >
          <Field
            label="Título do Plano de Trabalho"
            span={12}
            placeholder="Título da pesquisa do aluno"
            obrigatorio
            valor={tituloPlano}
            onChange={setTituloPlano}
          />
          <div className="col-span-12">
            <div className="flex items-center justify-between mb-xs">
              <label className="block text-on-surface-variant text-[11px] font-bold uppercase tracking-wide">
                Resumo dos Objetivos & Metodologia
              </label>
              <span className="text-[11px] text-on-surface-variant">
                Breve síntese das atividades
              </span>
            </div>
            <textarea
              rows={3}
              value={resumoPlano}
              onChange={(e) => setResumoPlano(e.target.value)}
              placeholder="Descreva resumidamente os objetivos da pesquisa, métodos a serem aplicados e resultados esperados..."
              className="w-full p-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors resize-y leading-relaxed"
            />
          </div>
        </FormSubCard>

        <FormSubCard
          icone="schedule"
          titulo="Vigência & Regime de Dedicação"
          subtitulo="Prazos regimentais e compatibilidade com horários de aula"
          aviso={
            <span>
              *O valor mensal do auxílio segue a tabela oficial de bolsas da FEALQ. É vedado o acúmulo de bolsas semelhantes conforme regulamento.
            </span>
          }
        >
          <Field
            label="Início da Bolsa"
            span={4}
            tipo="month"
            obrigatorio
            valor={inicioBolsa}
            onChange={setInicioBolsa}
          />
          <Field
            label="Fim Previsto"
            span={4}
            tipo="month"
            obrigatorio
            valor={fimBolsa}
            onChange={setFimBolsa}
          />
          <Field
            label="Regime Semanal"
            span={4}
            tipo="select"
            opcoes={['12h semanais', '20h semanais', 'Dedicação sem vínculo empregatício']}
            valor={cargaHoraria}
            onChange={setCargaHoraria}
          />
        </FormSubCard>
      </FormSection>
    </FormPageLayout>
  );
}
