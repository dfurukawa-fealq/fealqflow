import { useState, useMemo, useEffect } from 'react';

// Estrutura de itens extraída da planilha original de orçamento FZEA
export const ESTRUTURA_DESPESAS = [
  {
    id: 'cat1',
    titulo: '1. Pagamento ao Docente (PF)',
    descricao: 'Coordenação, vice e aulas. Afeta cálculo de INSS (20%).',
    itens: [
      { id: '1.1', nome: '1.1 Coordenação' },
      { id: '1.2', nome: '1.2 Vice Coordenação' },
      { id: '1.3', nome: '1.3 Aula/palestra' },
    ]
  },
  {
    id: 'cat2',
    titulo: '2. Pessoal e Encargos (CLT)',
    descricao: 'Salário bruto, provisionamentos e outras despesas CLT.',
    itens: [
      { id: '2.1', nome: '2.1 Salário Bruto' },
      { id: '2.2', nome: '2.2 Encargos' },
      { id: '2.3', nome: '2.3 Provisionamento (Férias, 13º e Rescisão de Contrato)' },
      { id: '2.4', nome: '2.4 Outras despesas (Assistência médica/odontológica, VA e VT)' },
    ]
  },
  {
    id: 'cat3',
    titulo: '3. Material de Consumo',
    descricao: '',
    itens: [
      { id: '3.1', nome: '3.1 Livros' },
      { id: '3.2', nome: '3.2 Material de escritório' },
      { id: '3.3', nome: '3.3 Material de divulgação' },
      { id: '3.4', nome: '3.4 Brindes/Troféus' },
      { id: '3.5', nome: '3.5 Produtos para alimentação / coffee break' },
      { id: '3.6', nome: '3.6 Placas de homenagem' },
      { id: '3.7', nome: '3.7 Camisetas/Uniformes' },
      { id: '3.8', nome: '3.8 Material de consumo em geral' },
    ]
  },
  {
    id: 'cat4',
    titulo: '4. Serviços de Terceiros (PJ)',
    descricao: 'Soma de serviços terceirizados, exceto taxa bancária automática (item 4.34).',
    itens: [
      { id: '4.1', nome: '4.1 Serviços de transportes' },
      { id: '4.2', nome: '4.2 Serviços de alimentação' },
      { id: '4.3', nome: '4.3 Serviços de hospedagem' },
      { id: '4.4', nome: '4.4 Passagem Aérea (Nacional)' },
      { id: '4.5', nome: '4.5 Passagem Aérea (Internacional)' },
      { id: '4.7', nome: '4.7 Aula/palestra' },
      { id: '4.8', nome: '4.8 Assessoria técnica especializada' },
      { id: '4.9', nome: '4.9 Serviços gráficos' },
      { id: '4.10', nome: '4.10 Marketing' },
      { id: '4.11', nome: '4.11 Serviços de assessoria de comunicação' },
      { id: '4.12', nome: '4.12 Serviços de divulgação' },
      { id: '4.13', nome: '4.13 Captação de imagem' },
      { id: '4.14', nome: '4.14 Suporte técnico em recursos audiovisuais' },
      { id: '4.15', nome: '4.15 Gravação e edição de vídeos' },
      { id: '4.16', nome: '4.16 Servidores especializados na transmissão de aulas ao vivo' },
      { id: '4.17', nome: '4.17 Elaboração, implantação e manutenção do site' },
      { id: '4.18', nome: '4.18 Orientação na parte teórica, técnica ou estrutural' },
      { id: '4.19', nome: '4.19 Organização de exposição e feiras' },
      { id: '4.20', nome: '4.20 Locação de imóveis ou salas' },
      { id: '4.21', nome: '4.21 Assistência em elaboração técnica e materiais acadêmicos' },
      { id: '4.22', nome: '4.22 Cópias e impressões' },
      { id: '4.23', nome: '4.23 Elaboração de materiais didáticos' },
      { id: '4.24', nome: '4.24 Desenvolvimento de material téorico e prático' },
      { id: '4.25', nome: '4.25 Publicação de artigos' },
      { id: '4.26', nome: '4.26 Edição de jornais e revistas' },
      { id: '4.27', nome: '4.27 Edição de livros' },
      { id: '4.28', nome: '4.28 Revisão de texto' },
      { id: '4.29', nome: '4.29 Diagramação' },
      { id: '4.30', nome: '4.30 Design Gráfico' },
      { id: '4.31', nome: '4.31 ISBN e ficha catalográfica' },
      { id: '4.32', nome: '4.32 Contratação de Outros Serviços' },
      { id: '4.33', nome: '4.33 Despesas Bancárias (conversão cambial)' },
    ]
  },
  {
    id: 'cat5',
    titulo: '5. Despesas de Viagem (Reembolsáveis)',
    descricao: '',
    itens: [
      { id: '5.1', nome: '5.1 Despesa de viagem (km, combustível, estacionamento, pedágio, app)' },
      { id: '5.2', nome: '5.2 Despesas com alimentação' },
      { id: '5.4', nome: '5.4 Despesa de hospedagem' },
    ]
  },
  {
    id: 'cat6',
    titulo: '6. Aquisição de Equipamentos e Materiais Permanentes',
    descricao: 'Todos os equipamentos serão incorporados à USP.',
    itens: [
      { id: '6.1', nome: '6.1 Material Permanente Nacional' },
      { id: '6.2', nome: '6.2 Material Permanente Internacional' },
    ]
  },
  {
    id: 'cat7',
    titulo: '7. Reserva Técnica',
    descricao: 'Até 10% do Valor Previsto do Custeio Total.',
    itens: [
      { id: '7.1', nome: 'Valor Previsto para Reserva Técnica' },
    ]
  }
];

export type TipoProjetoFPA = 'cursos' | 'evento' | 'isento';

export const PERFIS_FPA = {
  cursos: { label: 'FZEA - Cursos', fealq: 10, depto: 4.02, fzea: 1.98, pref: 2, inss: 20, issqn: 5 },
  evento: { label: 'FZEA - Eventos', fealq: 10, depto: 4.02, fzea: 1.98, pref: 2, inss: 20, issqn: 5 },
  isento: { label: 'FZEA - Isento', fealq: 10, depto: 0, fzea: 0, pref: 0, inss: 20, issqn: 5 },
};

// Tipagem dos valores de entrada do formulário
export interface PlanoAplicacaoValores {
  tipoProjetoFPA: TipoProjetoFPA;
  receitaInscricao: number;
  receitaPatrocinio: number;
  despesasDetalhes: Record<string, number>;
  fpaPrefPercent: number;
}

// Tipagem do retorno do Hook com resultados e funções de atualização
export interface PlanoAplicacaoCalculosResult {
  valores: PlanoAplicacaoValores;
  setters: {
    setTipoProjetoFPA: (v: TipoProjetoFPA) => void;
    setReceitaInscricao: (v: number) => void;
    setReceitaPatrocinio: (v: number) => void;
    setDespesaDetalhe: (id: string, v: number) => void;
    setFpaPrefPercent: (v: number) => void;
  };
  
  // Taxas Atuais do FPA
  fpaFealqPercent: number;
  fpaDeptoPercent: number;
  fpaFzeaPercent: number;
  impostoInssPercent: number;
  impostoIssqnPercent: number;

  // Subtotais de Categoria
  cat1: number;
  cat2: number;
  cat3: number;
  cat4: number;
  cat5: number;
  cat6: number;
  cat7: number;

  
  // Totais Calculados
  receitaTotal: number;
  taxaBancaria: number;
  fpaFealq: number;
  fpaDepto: number;
  fpaFzea: number;
  fpaPref: number;
  fpaTotal: number;
  inss: number;
  issqn: number;
  impostoTotal: number;
  custoOperacional: number;
  custoTotal: number;
  saldoPrevisto: number;
  
  // Validações
  saldoZerado: boolean;
  reservaValida: boolean;
  podeEnviar: boolean;
}

// Utilitário de formatação de moeda
export const formatMoney = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Hook principal de cálculos e validações do Plano de Aplicação de Recursos
export function usePlanoAplicacaoCalculos(): PlanoAplicacaoCalculosResult {
  // --- STATE ---
  const [tipoProjetoFPA, setTipoProjetoFPA] = useState<TipoProjetoFPA>('cursos');
  // 1. Receitas
  const [receitaInscricao, setReceitaInscricao] = useState<number>(0);
  const [receitaPatrocinio, setReceitaPatrocinio] = useState<number>(0);

  // 2. Despesas (Linhas Detalhadas)
  const [despesasDetalhes, setDespesasDetalhes] = useState<Record<string, number>>({});
  const setDespesaDetalhe = (id: string, valor: number) => {
    setDespesasDetalhes(prev => ({ ...prev, [id]: valor }));
  };

  // Helper para somar itens por prefixo (ex: "1." pega "1.1", "1.2")
  const getCatTotal = (prefix: string) => {
    return Object.entries(despesasDetalhes)
      .filter(([key]) => key.startsWith(prefix))
      .reduce((sum, [, val]) => sum + (val || 0), 0);
  };

  const cat1 = getCatTotal('1.');
  const cat2 = getCatTotal('2.');
  const cat3 = getCatTotal('3.');
  const cat4 = getCatTotal('4.');
  const cat5 = getCatTotal('5.');
  const cat6 = getCatTotal('6.');
  const cat7 = getCatTotal('7.');

  // Taxa variável prefeitura (ex: 2.0 = 2%)
  const [fpaPrefPercent, setFpaPrefPercent] = useState<number>(2.0);

  // Efeito para ajustar a prefeitura caso o perfil mude
  useEffect(() => {
    setFpaPrefPercent(PERFIS_FPA[tipoProjetoFPA].pref);
  }, [tipoProjetoFPA]);

  const fpaFealqPercent = PERFIS_FPA[tipoProjetoFPA].fealq;
  const fpaDeptoPercent = PERFIS_FPA[tipoProjetoFPA].depto;
  const fpaFzeaPercent = PERFIS_FPA[tipoProjetoFPA].fzea;
  const impostoInssPercent = PERFIS_FPA[tipoProjetoFPA].inss;
  const impostoIssqnPercent = PERFIS_FPA[tipoProjetoFPA].issqn;

  // --- DERIVED STATE / CALCULATIONS (REGRAS DE NEGÓCIO) ---

  // Receita Total: Soma de todas as fontes de arrecadação do projeto (Inscrições pagas via plataforma + Patrocínios/Repasses diretos).
  const receitaTotal = useMemo(() => receitaInscricao + receitaPatrocinio, [receitaInscricao, receitaPatrocinio]);

  // --- TAXAS ADMINISTRATIVAS E BANCÁRIAS ---
  
  // Taxa Bancária (Item 4.34): Custa 3,99% incidindo APENAS sobre a Previsão de Receita de Inscrição (referente a taxas de boleto/cartão da plataforma).
  const taxaBancaria = useMemo(() => receitaInscricao * 0.0399, [receitaInscricao]);
  
  // FPA (Fundo de Pesquisa e Administração): Taxas institucionais retidas automaticamente.
  // Regra: Todas as taxas do FPA são calculadas sempre sobre a Receita TOTAL (Inscrição + Patrocínio).
  const fpaFealq = useMemo(() => receitaTotal * (fpaFealqPercent / 100), [receitaTotal, fpaFealqPercent]);
  const fpaDepto = useMemo(() => receitaTotal * (fpaDeptoPercent / 100), [receitaTotal, fpaDeptoPercent]);
  const fpaFzea = useMemo(() => receitaTotal * (fpaFzeaPercent / 100), [receitaTotal, fpaFzeaPercent]);
  const fpaPref = useMemo(() => receitaTotal * (fpaPrefPercent / 100), [receitaTotal, fpaPrefPercent]); // Percentual variável para a Prefeitura do Campus
  
  // FPA Total: Soma das retenções administrativas
  const fpaTotal = useMemo(() => fpaFealq + fpaDepto + fpaFzea + fpaPref, [fpaFealq, fpaDepto, fpaFzea, fpaPref]);

  // --- IMPOSTOS ---
  
  // INSS Patronal (Item 11.1): Calculado EXCLUSIVAMENTE sobre o total da Categoria 1 (Pagamento ao docente - PF).
  const inss = useMemo(() => cat1 * (impostoInssPercent / 100), [cat1, impostoInssPercent]);
  
  // I.S.S.Q.N. (Item 11.2): Calculado sobre a Receita TOTAL.
  const issqn = useMemo(() => receitaTotal * (impostoIssqnPercent / 100), [receitaTotal, impostoIssqnPercent]);
  
  // Imposto Total: Soma das retenções tributárias
  const impostoTotal = useMemo(() => inss + issqn, [inss, issqn]);

  // --- TOTALIZADORES ---
  
  // Custo Operacional: Soma de todas as Despesas Diretas (Categorias 1 a 7) + a Taxa Bancária (que entra como Categoria 4 - Serviço de Terceiros).
  const custoOperacional = useMemo(() => 
    cat1 + cat2 + cat3 + cat4 + taxaBancaria + cat5 + cat6 + cat7, 
  [cat1, cat2, cat3, cat4, taxaBancaria, cat5, cat6, cat7]);

  // Valor Previsto do Custeio (Saídas): Soma do Custo Operacional + Total de FPA + Total de Impostos.
  const custoTotal = useMemo(() => custoOperacional + fpaTotal + impostoTotal, [custoOperacional, fpaTotal, impostoTotal]);

  // Saldo Previsto: Diferença entre a Arrecadação (Receita Total) e o Custeio (Custo Total).
  // Regra Crítica: O projeto precisa ter equilíbrio contábil perfeito (Saldo Previsto = 0,00).
  const saldoPrevisto = useMemo(() => receitaTotal - custoTotal, [receitaTotal, custoTotal]);
  
  // --- VALIDAÇÕES DE NEGÓCIO ---
  
  // Saldo Zerado: Tolerância de 1 centavo (0.01) para absorver resíduos da matemática de ponto flutuante do JavaScript (ex: 0.000000001).
  const saldoZerado = Math.abs(saldoPrevisto) < 0.01;
  
  // Reserva Técnica (Categoria 7): O valor informado não pode ultrapassar 10% do Valor Previsto do Custeio Total (custoTotal).
  const reservaValida = cat7 <= (custoTotal * 0.10);
  
  // Liberação do Formulário: O sistema SÓ permite salvar se o saldo for zero e a reserva estiver dentro do limite de 10%.
  const podeEnviar = saldoZerado && reservaValida;

  return {
    valores: {
      tipoProjetoFPA,
      receitaInscricao,
      receitaPatrocinio,
      despesasDetalhes,
      fpaPrefPercent
    },
    setters: {
      setTipoProjetoFPA,
      setReceitaInscricao,
      setReceitaPatrocinio,
      setDespesaDetalhe,
      setFpaPrefPercent
    },
    fpaFealqPercent,
    fpaDeptoPercent,
    fpaFzeaPercent,
    impostoInssPercent,
    impostoIssqnPercent,
    cat1,
    cat2,
    cat3,
    cat4,
    cat5,
    cat6,
    cat7,
    receitaTotal,
    taxaBancaria,
    fpaFealq,
    fpaDepto,
    fpaFzea,
    fpaPref,
    fpaTotal,
    inss,
    issqn,
    impostoTotal,
    custoOperacional,
    custoTotal,
    saldoPrevisto,
    saldoZerado,
    reservaValida,
    podeEnviar
  };
}
