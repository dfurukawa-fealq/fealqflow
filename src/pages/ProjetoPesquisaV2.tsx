import { ReactNode } from 'react';
import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field, CELULA_TABELA } from '../components/form/Field';
import { SubTitulo } from '../components/form/SubTitulo';
import { StatusCard } from '../components/form/StatusCard';

/* ------------------------------------------------------------------ *
 * Dados de exemplo — o formulário é estático, como os demais do
 * sistema. As linhas abaixo reproduzem o projeto-modelo da origem.
 * ------------------------------------------------------------------ */

const DELEGADOS = [
  {
    nome: 'Maria Silva',
    cpf: '123.456.789-00',
    telefone: '(11) 98765-4321',
    email: 'maria.silva@usp.br',
    nivel: 'Nível 1 - Ordenador',
  },
  {
    nome: 'Carlos Eduardo Santos',
    cpf: '987.654.321-11',
    telefone: '(19) 99123-4567',
    email: 'carlos.santos@usp.br',
    nivel: 'Nível 2 - Criador',
  },
];

const EQUIPE = [
  {
    nome: 'João Souza',
    departamento: 'Física Aplicada',
    telefone: '(11) 91234-5678',
    email: 'joao.souza@usp.br',
  },
  {
    nome: 'Dra. Ana Paula Mendes',
    departamento: 'Engenharia de Computação',
    telefone: '(19) 3429-8800',
    email: 'ana.mendes@usp.br',
  },
];

const ETAPAS = [
  {
    titulo: 'Planejamento Inicial e Especificação de Sensores',
    descricao:
      'Levantamento bibliográfico, aquisição de insumos de laboratório e calibração inicial dos componentes eletrônicos.',
    inicio: '2026-09-01',
    fim: '2026-12-31',
  },
  {
    titulo: 'Desenvolvimento do Firmware e Testes na Estação Experimental',
    descricao:
      'Programação de microcontroladores de baixíssimo consumo e instalação de 20 nós coletores nos campos de teste da ESALQ.',
    inicio: '2027-01-01',
    fim: '2027-08-31',
  },
  {
    titulo: 'Validação do Modelo Preditivo de Irrigação e Registro de Patente',
    descricao:
      'Consolidação das métricas de economia hídrica, elaboração dos relatórios técnicos e submissão da patente via AUSPIN.',
    inicio: '2027-09-01',
    fim: '2028-08-31',
  },
];

const PARCELAS = [
  { numero: '01', data: '2026-09-15', valor: 400000, contrapartida: 50000 },
  { numero: '02', data: '2027-03-15', valor: 240000, contrapartida: 25000 },
  { numero: '03', data: '2027-09-15', valor: 160000, contrapartida: 25000 },
];

const ASSINATURAS = [
  {
    cargo: 'Coordenador do Projeto',
    nome: 'Prof. Dr. João Silva',
    uspId: 'USP-884920',
    assinado: false,
  },
  {
    cargo: 'Chefe de Departamento',
    nome: 'Profa. Dra. Maria Souza',
    uspId: 'USP-440129',
    assinado: false,
  },
  {
    cargo: 'Diretor da Unidade',
    nome: 'Prof. Dr. Carlos Oliveira',
    uspId: 'USP-119302',
    assinado: false,
  },
];

/* ------------------------------------------------------------------ *
 * Taxas institucionais — alíquotas conforme o formulário de origem.
 * ------------------------------------------------------------------ */

const VALOR_TOTAL = 800000;
const ISENCAO_DEPARTAMENTO = false;

const TAXA_FEALQ = 0.1;
const TAXA_FZEA_DIRECAO = 0.0198;
const TAXA_FZEA_DEPTO = 0.0402;
const TAXA_REITORIA = 0.025;
const TAXA_ISS = 0.02;

const taxaFealq = VALOR_TOTAL * TAXA_FEALQ;
const taxaFzeaDirecao = VALOR_TOTAL * TAXA_FZEA_DIRECAO;
const taxaFzeaDepto = ISENCAO_DEPARTAMENTO ? 0 : VALOR_TOTAL * TAXA_FZEA_DEPTO;
const taxaFzeaTotal = taxaFzeaDirecao + taxaFzeaDepto;
const taxaReitoria = VALOR_TOTAL * TAXA_REITORIA;
const taxaIss = VALOR_TOTAL * TAXA_ISS;
const totalTaxas = taxaFealq + taxaFzeaTotal + taxaReitoria + taxaIss;
const valorLiquido = VALOR_TOTAL - totalTaxas;

const totalParcelas = PARCELAS.reduce((acc, p) => acc + p.valor, 0);
const totalContrapartida = PARCELAS.reduce((acc, p) => acc + p.contrapartida, 0);
const percentualAlocado = (totalParcelas / VALOR_TOTAL) * 100;
const desembolsoFechado = Math.abs(totalParcelas - VALOR_TOTAL) < 0.01;

const moeda = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    v,
  );

/* ------------------------------------------------------------------ */

const BotaoAdicionar = ({ rotulo }: { rotulo: string }) => (
  <button className="h-[28px] px-sm bg-surface text-primary-container border border-outline-variant rounded flex items-center gap-xs hover:bg-surface-container-high text-[11px] font-bold uppercase tracking-wide shrink-0">
    <span className="material-symbols-outlined text-[16px]">add</span>
    {rotulo}
  </button>
);

const BotaoExcluir = () => (
  <button className="text-outline hover:text-error transition-colors">
    <span className="material-symbols-outlined text-[18px]">delete</span>
  </button>
);

const Tabela = ({
  colunas,
  larguraMinima,
  children,
}: {
  colunas: string[];
  larguraMinima?: string;
  children: ReactNode;
}) => (
  <div className="col-span-12 overflow-x-auto">
    <table
      className="w-full text-left border-collapse"
      style={larguraMinima ? { minWidth: larguraMinima } : undefined}
    >
      <thead>
        <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase">
          {colunas.map((c) => (
            <th key={c} className="p-sm">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="text-[13px]">{children}</tbody>
    </table>
  </div>
);

const LinhaTaxa = ({
  rotulo,
  valor,
  detalhe,
  destaque,
}: {
  rotulo: string;
  valor: number;
  detalhe?: string;
  destaque?: 'erro' | 'ok';
}) => (
  <div className="flex items-baseline justify-between gap-sm py-xs border-b border-surface-variant last:border-0">
    <div className="min-w-0">
      <span
        className={`text-[13px] ${
          destaque ? 'font-bold text-on-surface' : 'text-on-surface-variant'
        }`}
      >
        {rotulo}
      </span>
      {detalhe && (
        <p className="text-[10px] text-on-surface-variant mt-[2px]">{detalhe}</p>
      )}
    </div>
    <span
      className={`text-[13px] font-medium whitespace-nowrap ${
        destaque === 'erro'
          ? 'text-error font-bold'
          : destaque === 'ok'
            ? 'text-secondary font-bold'
            : 'text-on-surface'
      }`}
    >
      {moeda(valor)}
    </span>
  </div>
);

export const ProjetoPesquisaV2 = () => (
  <FormPageLayout
    breadcrumb={[
      'Área do Coordenador',
      'Protocolo de Abertura de Projeto de Pesquisa v2',
    ]}
    titulo="Protocolo de Abertura de Projeto de Pesquisa"
    codigo="CONV-FR-03-PRO-V2"
    badge="v2"
    acaoPrincipal="Finalizar e Enviar Mapeamento"
    sidebar={
      <StatusCard
        titulo="Status do Mapeamento"
        percentual={30}
        nota="Complete as sete seções para liberar a emissão do Termo de Abertura."
      />
    }
  >
    {/* ---------------------------------------------------------------- */}
    <FormSection numero={1} icone="badge" titulo="Informações Gerais do Projeto">
      <SubTitulo>Identificação Básica</SubTitulo>
      <Field
        label="Título do Projeto"
        tipo="textarea"
        placeholder="Digite o título completo e oficial do projeto conforme cadastrado no sistema USP..."
      />
      <Field
        label="Tipo / Classificação do Projeto"
        span={6}
        tipo="select"
        placeholder="Selecione a classificação institucional..."
        opcoes={[
          'Pesquisa Científica / Tecnológica',
          'Convênio Institucional / Parceria',
          'Extensão Universitária',
          'Assessoria Técnica Especializada',
        ]}
      />
      <Field
        label="Possui Convênio Cadastrado na USP?"
        span={6}
        tipo="radio"
        opcoes={['Sim, possui convênio', 'Não possui convênio']}
        padrao="Não possui convênio"
      />
      <Field
        label="Nº do Convênio USP"
        span={6}
        placeholder="Ex: CV-2026-0841"
        hint="Preencher apenas se houver convênio cadastrado na USP."
      />
      <Field
        label="Nº do Protocolo USP"
        span={6}
        placeholder="Ex: PRT-26-10492"
        hint="Preencher apenas se houver convênio cadastrado na USP."
      />

      <SubTitulo>Detalhamento Técnico (Referência: Plano de Trabalho)</SubTitulo>
      <Field
        label="Objeto do Projeto"
        tipo="textarea"
        placeholder="Descreva suscintamente o objeto central da parceria ou pesquisa..."
      />
      <Field
        label="Objetivo Geral"
        tipo="textarea"
        placeholder="Qual é o objetivo principal a ser atingido ao término do projeto?"
      />
      <Field
        label="Justificativa"
        tipo="textarea"
        placeholder="Justifique a relevância científica, acadêmica ou social da execução do projeto..."
      />
      <Field
        label="Resultados Esperados"
        tipo="textarea"
        placeholder="Relacione os produtos, patentes, formações de RH ou publicações previstas..."
      />

      <SubTitulo>Informações Adicionais (Opcional)</SubTitulo>
      <Field
        label="Observações"
        tipo="textarea"
        placeholder="Insira observações relevantes para a análise institucional..."
      />
    </FormSection>

    {/* ---------------------------------------------------------------- */}
    <FormSection numero={2} icone="group" titulo="Equipe do Projeto">
      <SubTitulo>Coordenador Responsável (Docente USP)</SubTitulo>
      <Field
        label="Nome Completo"
        span={6}
        placeholder="Ex: Prof. Dr. João Silva"
      />
      <Field label="CPF" span={6} placeholder="000.000.000-00" />
      <Field
        label="RG / Órgão Emissor"
        span={6}
        placeholder="Ex: 12.345.678-9 / SSP-SP"
      />
      <Field label="Nacionalidade" span={6} valor="Brasileira" />
      <Field
        label="E-mail Institucional (@usp.br)"
        span={6}
        tipo="email"
        placeholder="coordenador@usp.br"
      />
      <Field
        label="Telefone de Contato"
        span={6}
        tipo="tel"
        placeholder="(11) 3091-0000"
      />
      <Field
        label="Departamento USP"
        span={6}
        placeholder="Ex: Engenharia de Biossistemas"
      />
      <Field
        label="Cargo / Titulação Acadêmica"
        span={6}
        placeholder="Ex: Professor Titular MS-6"
      />

      <SubTitulo>
        Credenciamento CERT (Comissão de Regime de Trabalho)
      </SubTitulo>
      <Field label="Data de Início do Credenciamento" span={6} tipo="date" />
      <Field label="Data de Término do Credenciamento" span={6} tipo="date" />
      <Field
        label="Parecer / Despacho da CERT"
        tipo="textarea"
        placeholder="Informe o número da aprovação ou parecer conclusivo da CERT..."
      />

      <SubTitulo>Delegados de Gestão (Sistema Conveniar / USP)</SubTitulo>
      <p className="col-span-12 -mt-xs text-[11px] text-on-surface-variant">
        Pessoas com permissão para aprovar ou movimentar ordens financeiras.
      </p>
      <Tabela
        colunas={['Nome', 'CPF', 'Telefone', 'E-mail', 'Nível de Acesso', '']}
        larguraMinima="760px"
      >
        {DELEGADOS.map((d) => (
          <tr
            key={d.cpf}
            className="border-b border-outline-variant/50 hover:bg-surface/50"
          >
            <td className="p-sm">
              <input className={CELULA_TABELA} type="text" defaultValue={d.nome} />
            </td>
            <td className="p-sm">
              <input className={CELULA_TABELA} type="text" defaultValue={d.cpf} />
            </td>
            <td className="p-sm">
              <input
                className={CELULA_TABELA}
                type="tel"
                defaultValue={d.telefone}
              />
            </td>
            <td className="p-sm">
              <input
                className={CELULA_TABELA}
                type="email"
                defaultValue={d.email}
              />
            </td>
            <td className="p-sm">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-1.5 py-[2px] rounded bg-secondary-fixed text-on-secondary-fixed whitespace-nowrap">
                {d.nivel}
              </span>
            </td>
            <td className="p-sm text-center">
              <BotaoExcluir />
            </td>
          </tr>
        ))}
      </Tabela>
      <div className="col-span-12 flex justify-end">
        <BotaoAdicionar rotulo="Adicionar Delegado" />
      </div>

      <SubTitulo>Equipe Técnica e Pesquisadores</SubTitulo>
      <p className="col-span-12 -mt-xs text-[11px] text-on-surface-variant">
        Pesquisadores, pós-docs, alunos e apoio técnico vinculados ao projeto.
      </p>
      <Tabela
        colunas={['Nome', 'Departamento / Vínculo', 'Telefone', 'E-mail', '']}
        larguraMinima="700px"
      >
        {EQUIPE.map((m) => (
          <tr
            key={m.email}
            className="border-b border-outline-variant/50 hover:bg-surface/50"
          >
            <td className="p-sm">
              <input className={CELULA_TABELA} type="text" defaultValue={m.nome} />
            </td>
            <td className="p-sm">
              <input
                className={CELULA_TABELA}
                type="text"
                defaultValue={m.departamento}
              />
            </td>
            <td className="p-sm">
              <input
                className={CELULA_TABELA}
                type="tel"
                defaultValue={m.telefone}
              />
            </td>
            <td className="p-sm">
              <input
                className={CELULA_TABELA}
                type="email"
                defaultValue={m.email}
              />
            </td>
            <td className="p-sm text-center">
              <BotaoExcluir />
            </td>
          </tr>
        ))}
      </Tabela>
      <div className="col-span-12 flex justify-end">
        <BotaoAdicionar rotulo="Adicionar Membro" />
      </div>
    </FormSection>

    {/* ---------------------------------------------------------------- */}
    <FormSection
      numero={3}
      icone="domain"
      titulo="Parceiro de Negócios / Financiadora"
    >
      <SubTitulo>Identificação Cadastral do Parceiro</SubTitulo>
      <Field
        label="Tipo de Pessoa"
        tipo="radio"
        opcoes={[
          'Pessoa Jurídica (Empresa/Fundação/Órgão)',
          'Pessoa Física (Apoiador Individual)',
        ]}
        padrao="Pessoa Jurídica (Empresa/Fundação/Órgão)"
      />
      <Field
        label="Razão Social / Nome Completo"
        placeholder="Ex: Fundação de Amparo à Pesquisa S.A."
      />
      <Field
        label="CNPJ / CPF"
        span={6}
        placeholder="00.000.000/0001-00"
        hint="CNPJ para pessoa jurídica, CPF para pessoa física."
      />
      <Field
        label="Inscrição Estadual / Municipal / NIF Internacional"
        span={6}
        placeholder="Ex: 109.876.543.210 ou Isento"
      />
      <Field
        label="Website do Parceiro"
        span={6}
        tipo="url"
        placeholder="https://www.empresa.com.br"
      />
      <Field
        label="E-mail Institucional do Parceiro"
        span={6}
        tipo="email"
        placeholder="contato@empresa.com.br"
      />

      <SubTitulo>Endereço da Sede</SubTitulo>
      <Field label="CEP" span={3} placeholder="00000-000" />
      <Field
        label="Logradouro"
        span={6}
        placeholder="Av. Paulista, Alameda..."
      />
      <Field label="Número" span={3} placeholder="1000" />
      <Field
        label="Complemento"
        span={4}
        placeholder="Andar 12, Conjunto B"
      />
      <Field label="Bairro" span={4} placeholder="Bela Vista" />
      <Field label="Cidade" span={4} placeholder="São Paulo" />
      <Field label="Estado (UF)" span={3} placeholder="SP" />
      <Field label="País" span={3} placeholder="Brasil" />

      <SubTitulo>Responsável pelo Projeto</SubTitulo>
      <Field label="Nome Completo" span={3} />
      <Field label="Cargo / Função" span={3} />
      <Field label="E-mail" span={3} tipo="email" />
      <Field label="Telefone / Celular" span={3} tipo="tel" />

      <SubTitulo>Contato de Faturamento / Notas</SubTitulo>
      <Field label="Nome / Setor" span={3} />
      <Field label="Cargo" span={3} />
      <Field label="E-mail Financeiro" span={3} tipo="email" />
      <Field label="Telefone" span={3} tipo="tel" />

      <SubTitulo>Contato de Cobrança</SubTitulo>
      <Field label="Nome / Setor" span={3} />
      <Field label="Cargo" span={3} />
      <Field label="E-mail Cobrança" span={3} tipo="email" />
      <Field label="Telefone" span={3} tipo="tel" />

      <SubTitulo>Pedido de Compras</SubTitulo>
      <Field
        label="Será enviado pedido de compras oficial pelo parceiro?"
        tipo="checkbox"
        placeholder="Sim, o parceiro emitirá Ordem de Compra (PO)"
        hint="Marque se o parceiro emitirá Ordem de Compra (PO) vinculada aos aportes."
      />
    </FormSection>

    {/* ---------------------------------------------------------------- */}
    <FormSection
      numero={4}
      icone="calendar_month"
      titulo="Cronograma de Execução e Etapas"
    >
      <SubTitulo>Duração Total Prevista</SubTitulo>
      <Field
        label="Prazo Total em Meses"
        span={3}
        tipo="number"
        valor="24"
        hint="Equivale a 2,0 anos."
      />

      <SubTitulo>Fases do Projeto</SubTitulo>
      <p className="col-span-12 -mt-xs text-[11px] text-on-surface-variant">
        Cadastre as fases do plano de trabalho com descrição e período de
        vigência.
      </p>
      <Tabela
        colunas={[
          'Nº',
          'Título da Etapa',
          'Descrição das Atividades / Entregáveis',
          'Início',
          'Término',
          '',
        ]}
        larguraMinima="900px"
      >
        {ETAPAS.map((e, i) => (
          <tr
            key={e.titulo}
            className="border-b border-outline-variant/50 hover:bg-surface/50"
          >
            <td className="p-sm text-center text-on-surface-variant align-top pt-4">
              {i + 1}
            </td>
            <td className="p-sm align-top">
              <input
                className={CELULA_TABELA}
                type="text"
                defaultValue={e.titulo}
              />
            </td>
            <td className="p-sm align-top">
              <textarea
                className={`${CELULA_TABELA} h-auto py-xs resize-none`}
                rows={2}
                defaultValue={e.descricao}
              />
            </td>
            <td className="p-sm align-top">
              <input
                className={CELULA_TABELA}
                type="date"
                defaultValue={e.inicio}
              />
            </td>
            <td className="p-sm align-top">
              <input className={CELULA_TABELA} type="date" defaultValue={e.fim} />
            </td>
            <td className="p-sm text-center align-top pt-3">
              <BotaoExcluir />
            </td>
          </tr>
        ))}
      </Tabela>
      <div className="col-span-12 flex justify-end">
        <BotaoAdicionar rotulo="Adicionar Nova Etapa" />
      </div>
    </FormSection>

    {/* ---------------------------------------------------------------- */}
    <FormSection
      numero={5}
      icone="workspace_premium"
      titulo="Propriedade Intelectual (PI) e Patentes"
    >
      <SubTitulo>Previsão de Propriedade Intelectual</SubTitulo>
      <Field
        label="O projeto envolve a criação ou desenvolvimento de Propriedade Intelectual?"
        tipo="radio"
        opcoes={[
          'Sim, prevê criação de patentes, marcas ou software',
          'Não envolve Propriedade Intelectual',
        ]}
        padrao="Sim, prevê criação de patentes, marcas ou software"
      />
      <Field
        label="Percentual USP (%)"
        span={4}
        tipo="number"
        valor="50"
        hint="A soma com o percentual do parceiro deve fechar em 100%."
      />
      <Field
        label="Percentual Parceiro / Financiadora (%)"
        span={4}
        tipo="number"
        valor="50"
      />
      <Field
        label="Justificativa da Divisão de Titularidade"
        tipo="textarea"
        placeholder="Explique como a contribuição técnica e financeira de cada parte justifica a proporção acordada..."
      />

      <SubTitulo>Gestão do Registro e Exploração Comercial</SubTitulo>
      <Field
        label="Instituição Responsável pelo Registro"
        span={4}
        placeholder="Ex: Agência USP de Inovação (AUSPIN)"
        hint="Preencher apenas se o projeto envolver Propriedade Intelectual."
      />
      <Field
        label="Instituição Responsável pelos Custos"
        span={4}
        placeholder="Ex: Empresa Parceira S.A."
      />
      <Field
        label="Prioridade no Licenciamento Comercial"
        span={4}
        placeholder="Ex: Empresa Parceira S.A. (Prazo 12 meses)"
      />
    </FormSection>

    {/* ---------------------------------------------------------------- */}
    <FormSection
      numero={6}
      icone="payments"
      titulo="Plano Financeiro e Desembolso"
    >
      <SubTitulo>Valor Global do Projeto</SubTitulo>
      <Field
        label="Moeda do Projeto"
        span={4}
        tipo="select"
        opcoes={[
          'Real Brasileiro (BRL - R$)',
          'Dólar Americano (USD - $)',
          'Euro (EUR - €)',
        ]}
      />
      <Field
        label="Valor Total Geral (R$)"
        span={4}
        prefixo="R$"
        valor="800.000,00"
      />
      <Field
        label="Isenção Departamental"
        span={4}
        tipo="checkbox"
        placeholder="Departamento isenta a taxa de 4,02% que lhe cabe"
      />

      <SubTitulo>Taxas Institucionais (Cálculo Automático)</SubTitulo>
      <div className="col-span-12 bg-surface-container-low border border-outline-variant rounded p-md">
        <LinhaTaxa rotulo="Taxa FEALQ (10,0%)" valor={taxaFealq} />
        <LinhaTaxa
          rotulo="Taxa FZEA (6,0%)"
          valor={taxaFzeaTotal}
          detalhe={`Direção 1,98%: ${moeda(taxaFzeaDirecao)} · Depto 4,02%: ${moeda(taxaFzeaDepto)}`}
        />
        <LinhaTaxa rotulo="Taxa Reitoria USP (2,5%)" valor={taxaReitoria} />
        <LinhaTaxa rotulo="ISS (2,0%)" valor={taxaIss} />
        <LinhaTaxa
          rotulo="Total de Taxas Institucionais"
          valor={totalTaxas}
          destaque="erro"
        />
        <LinhaTaxa
          rotulo="Valor Líquido para a Pesquisa"
          valor={valorLiquido}
          destaque="ok"
        />
      </div>

      <SubTitulo>Cronograma de Desembolso / Parcelas</SubTitulo>
      <p className="col-span-12 -mt-xs text-[11px] text-on-surface-variant">
        Cadastre o aporte de recursos em parcelas sincronizadas com o plano de
        trabalho.
      </p>
      <Tabela
        colunas={[
          'Nº',
          'Data Prevista',
          'Valor (R$)',
          '% Total',
          'Contrapartida USP',
          '',
        ]}
        larguraMinima="760px"
      >
        {PARCELAS.map((p) => (
          <tr
            key={p.numero}
            className="border-b border-outline-variant/50 hover:bg-surface/50"
          >
            <td className="p-sm text-center text-on-surface-variant">
              {p.numero}
            </td>
            <td className="p-sm">
              <input
                className={CELULA_TABELA}
                type="date"
                defaultValue={p.data}
              />
            </td>
            <td className="p-sm">
              <input
                className={`${CELULA_TABELA} text-right`}
                type="number"
                defaultValue={p.valor}
              />
            </td>
            <td className="p-sm text-right text-on-surface-variant tabular-nums">
              {((p.valor / VALOR_TOTAL) * 100).toFixed(1)}%
            </td>
            <td className="p-sm">
              <input
                className={`${CELULA_TABELA} text-right`}
                type="number"
                defaultValue={p.contrapartida}
              />
            </td>
            <td className="p-sm text-center">
              <BotaoExcluir />
            </td>
          </tr>
        ))}
        <tr className="bg-surface-container-low border-t-2 border-outline-variant text-[11px] font-bold uppercase">
          <td className="p-sm text-right text-on-surface-variant" colSpan={2}>
            Total das Parcelas:
          </td>
          <td className="p-sm text-right text-primary text-[13px]">
            {moeda(totalParcelas)}
          </td>
          <td className="p-sm text-right text-primary text-[13px]">
            {percentualAlocado.toFixed(1)}%
          </td>
          <td className="p-sm text-right text-primary text-[13px]">
            {moeda(totalContrapartida)}
          </td>
          <td></td>
        </tr>
      </Tabela>

      <div
        className={`col-span-12 flex items-start gap-sm p-sm rounded border text-[12px] ${
          desembolsoFechado
            ? 'border-secondary/40 bg-secondary/10 text-on-surface'
            : 'border-error-container bg-error-container/40 text-on-error-container'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">
          {desembolsoFechado ? 'check_circle' : 'warning'}
        </span>
        <span>
          {desembolsoFechado
            ? 'Plano de desembolso perfeitamente balanceado (100% do valor alocado).'
            : `Diferença detectada: o valor total das parcelas (${moeda(totalParcelas)}) difere do Valor Total do Projeto (${moeda(VALOR_TOTAL)}). Ajuste os valores para fechar em 100%.`}
        </span>
      </div>

      <div className="col-span-12 flex justify-end">
        <BotaoAdicionar rotulo="Adicionar Parcela" />
      </div>
    </FormSection>

    {/* ---------------------------------------------------------------- */}
    <FormSection
      numero={7}
      icone="verified"
      titulo="Infraestrutura, Conformidade e Assinaturas"
    >
      <SubTitulo>Infraestrutura Física e Computacional</SubTitulo>
      <Field
        label="Necessita de adequação de espaço físico ou reforma de laboratório?"
        tipo="radio"
        opcoes={['Sim, necessita de adequação', 'Não necessita de alteração']}
        padrao="Não necessita de alteração"
      />
      <Field
        label="Descrição do Espaço e das Reformas Previstas"
        tipo="textarea"
        placeholder="Descreva o espaço e as reformas previstas..."
        hint="Preencher apenas em caso de necessidade de adequação."
      />
      <Field label="Recursos de Tecnologia da Informação Utilizados">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-xs">
          {[
            'Hardware / Equipamentos',
            'Licenças de Software',
            'Infra de Rede USP',
            'Servidores Cloud / Data Center',
          ].map((r) => (
            <label
              key={r}
              className="flex items-center gap-sm text-[13px] text-on-surface cursor-pointer"
            >
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-outline-variant text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
              />
              {r}
            </label>
          ))}
        </div>
      </Field>
      <Field
        label="Haverá contratação de pessoal no regime CLT via Fundação?"
        tipo="radio"
        opcoes={['Sim, haverá contratação CLT', 'Não haverá contratação CLT']}
        padrao="Não haverá contratação CLT"
      />

      <SubTitulo>Declarações Institucionais Obrigatórias</SubTitulo>
      <div className="col-span-12 flex flex-col gap-sm">
        {[
          'Declaro que o projeto observa rigorosamente as diretrizes do Comitê de Ética em Pesquisa (CEP/CEUA) da USP.',
          'Declaro ciência quanto à incidência e retenção automática das taxas institucionais estipuladas no Plano Financeiro.',
          'Comprometo-me com a apresentação tempestiva dos relatórios técnicos de execução e da prestação de contas.',
        ].map((texto) => (
          <label
            key={texto}
            className="flex items-start gap-sm p-sm rounded border border-outline-variant bg-surface-container-low text-[12px] text-on-surface cursor-pointer hover:border-primary-container transition-colors"
          >
            <input
              type="checkbox"
              defaultChecked
              className="mt-[2px] rounded border-outline-variant text-secondary focus:ring-secondary w-4 h-4 cursor-pointer shrink-0"
            />
            {texto}
          </label>
        ))}
      </div>

      <SubTitulo>
        Painel de Assinaturas Digitais (Sistema E-USP / ICP-Brasil)
      </SubTitulo>
      <p className="col-span-12 -mt-xs text-[11px] text-on-surface-variant">
        A validação digital dos signatários é registrada automaticamente após o
        envio do mapeamento.
      </p>
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-md">
        {ASSINATURAS.map((s) => (
          <div
            key={s.uspId}
            className="p-md border border-outline-variant border-dashed rounded bg-surface-container-lowest"
          >
            <div className="flex items-center gap-xs mb-xs">
              <span className="material-symbols-outlined text-[18px] text-outline">
                schedule
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                {s.cargo}
              </span>
            </div>
            <p className="text-[13px] font-medium text-on-surface">{s.nome}</p>
            <p className="text-[11px] text-on-surface-variant mt-[2px]">
              ID USP: {s.uspId}
            </p>
            <p className="text-[11px] text-on-surface-variant mt-xs italic">
              Pendente de Assinatura
            </p>
          </div>
        ))}
      </div>
    </FormSection>
  </FormPageLayout>
);
