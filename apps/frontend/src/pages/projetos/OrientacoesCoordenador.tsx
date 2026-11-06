import { useProcessoState } from '../../contexts/ProcessoContext';
import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { CertificacaoSidebarCard } from '../../components/form/CertificacaoSidebarCard';
import { useRastreabilidade } from '../../contexts/RastreabilidadeContext';
import { formatCPF } from '../../utils/formatters';
import { sanitizeInputText, sanitizeProtocolId, getSafeReturnUrl } from '../../utils/security';

interface OrientacaoItem {
  numero: number;
  titulo: string;
  resumo: string;
  textoCompleto: string;
  categoria: 'gestao' | 'financeiro' | 'pessoal' | 'prestacao';
}

const ORIENTACOES_OFICIAIS: OrientacaoItem[] = [
  {
    numero: 1,
    titulo: 'Natureza Jurídica e Vinculação Institucional USP/FEALQ',
    categoria: 'gestao',
    resumo: 'Atuação como fundação de apoio credenciada à USP conforme Lei Federal 8.958/94.',
    textoCompleto:
      'A Fundação de Estudos Agrários Luiz de Queiroz (FEALQ) é fundação privada sem fins lucrativos, devidamente credenciada junto aos Ministérios da Educação (MEC) e da Ciência, Tecnologia e Inovação (MCTI) como fundação de apoio à Universidade de São Paulo (USP). Toda a gestão rege-se pela Lei Federal nº 8.958/1994, Decreto nº 7.423/2010, Estatuto da FEALQ e normativas vigentes da USP.',
  },
  {
    numero: 2,
    titulo: 'Subordinação Estrita ao Plano de Aplicação de Recursos',
    categoria: 'financeiro',
    resumo: 'Nenhuma despesa pode ser executada sem prévia previsão no Plano de Aplicação aprovado.',
    textoCompleto:
      'Toda e qualquer despesa, desembolso, pagamento de serviços ou aquisição com recursos do projeto deve obrigatoriamente constar e respeitar os limites fixados no Plano de Aplicação de Recursos (CONV-PL-01) previamente aprovado. Despesas não contempladas ou sem saldo orçamentário suficiente na respectiva categoria serão sumariamente recusadas pelo setor de controladoria.',
  },
  {
    numero: 3,
    titulo: 'Gestão e Movimentação pelo Sistema Conveniar (Portal do Coordenador)',
    categoria: 'gestao',
    resumo: 'Todas as solicitações de compra, pagamento e relatórios ocorrem no Conveniar.',
    textoCompleto:
      'A gestão financeira, técnica e operacional do projeto dar-se-á com exclusividade por meio do Sistema Conveniar. É dever do coordenador manter suas credenciais em segurança e utilizar o Portal para solicitar compras, pagamentos, emissão de diárias, contratação de serviços e acompanhamento dos demonstrativos em tempo real.',
  },
  {
    numero: 4,
    titulo: 'Níveis de Acesso e Responsabilidades do Ordenador de Despesas',
    categoria: 'gestao',
    resumo: 'Nível 1 (Coordenador) autoriza e envia; Nível 2 (Delegado) apenas cadastra pedidos.',
    textoCompleto:
      'O Coordenador do Projeto detém privativamente o Nível de Acesso 1, constituindo-se no ordenador titular de despesas responsável legal pela veracidade e pertinência dos atos. Os delegados administrativos cadastrados possuem Nível de Acesso 2, com competência exclusiva para instruir pedidos, cabendo sempre ao Coordenador Nível 1 a conferência e autorização final para envio à FEALQ.',
  },
  {
    numero: 5,
    titulo: 'Regularidade Fiscal dos Documentos de Despesa',
    categoria: 'financeiro',
    resumo: 'Notas fiscais eletrônicas devem ser emitidas em nome da FEALQ com o número do projeto.',
    textoCompleto:
      'Os comprovantes fiscais (Notas Fiscais Eletrônicas, DANFEs, NFS-e) devem ser rigorosamente emitidos em nome da FUNDAÇÃO DE ESTUDOS AGRÁRIOS LUIZ DE QUEIROZ (CNPJ 45.433.109/0001-09), com a identificação legível do número do projeto no corpo do documento. Não serão aceitos comprovantes emitidos em nome particular do pesquisador, cupom não fiscal, recibos sem valor tributário ou documentos rasurados.',
  },
  {
    numero: 6,
    titulo: 'Antecedência Mínima para Solicitações e Desembolsos',
    categoria: 'financeiro',
    resumo: 'Prazos operacionais de 5 dias úteis para rotina e 15 a 30 dias para importação/licitação.',
    textoCompleto:
      'Para viabilizar a análise fiscal, tributária e conferência bancária, as solicitações de pagamento ou reembolso devem ser cadastradas no Conveniar com antecedência mínima de 5 (cinco) dias úteis antes do vencimento do boleto/fatura. Aquisições com importação direta, adiantamentos de eventos ou contratações complexas exigem antecedência mínima de 20 a 30 dias úteis.',
  },
  {
    numero: 7,
    titulo: 'Retribuição Pecuniária, Bolsas e Normas de Pessoal da USP',
    categoria: 'pessoal',
    resumo: 'Respeito estrito à CERT, autorização das instâncias acadêmicas e teto constitucional.',
    textoCompleto:
      'A concessão de retribuição pecuniária, pró-labore ou remuneração a docentes e servidores da USP deve atender às normas da Universidade (Resoluções CoPGr, CoEx, CERT), contar com prévia aprovação do Departamento e Congregação, e submeter-se estritamente ao teto remuneratório constitucional do funcionalismo público estadual.',
  },
  {
    numero: 8,
    titulo: 'Prestação de Serviços por Terceiros (PF e PJ) e Retenções Tributárias',
    categoria: 'pessoal',
    resumo: 'Aplicação obrigatória das alíquotas de INSS, ISSQN e IRRF conforme legislação.',
    textoCompleto:
      'A contratação de prestadores de serviços autônomos (Pessoa Física - RPA) acarretará as retenções de praxe (INSS autônomo de 11%, INSS patronal de 20% sobre o valor bruto e ISSQN/IRRF conforme tabelas municipais e federais). Contratações de Pessoas Jurídicas exigem verificação prévia de CNDs válidas e aplicação de retenções de tributos federais e municipais.',
  },
  {
    numero: 9,
    titulo: 'Diárias de Viagem, Transporte e Comprovação de Deslocamento',
    categoria: 'financeiro',
    resumo: 'Valores balizados pelas tabelas institucionais da FEALQ e USP com prestação de contas.',
    textoCompleto:
      'O pagamento de diárias para participação de palestrantes, docentes ou colaboradores em eventos e trabalhos de campo deve obedecer à tabela oficial vigente da FEALQ/USP. É obrigatória a apresentação do relatório de viagem assinado acompanhado de canhotos de embarque, recibos de pedágio ou comprovantes de presença dentro de até 5 dias após o retorno.',
  },
  {
    numero: 10,
    titulo: 'Patrimônio e Doação de Equipamentos e Bens Permanentes à USP',
    categoria: 'gestao',
    resumo: 'Bens adquiridos no projeto integram o patrimônio público da Universidade de São Paulo.',
    textoCompleto:
      'Todos os bens permanentes, equipamentos laboratoriais, instrumentos e acervos adquiridos com recursos de projetos administrados pela FEALQ serão tombados e transferidos ao patrimônio da Universidade de São Paulo (USP) ao final do projeto, mediante termo formal de doação e incorporação patrimonial junto à Unidade.',
  },
  {
    numero: 11,
    titulo: 'Arrecadação de Inscrições, Boletos e Cotas de Patrocínio',
    categoria: 'financeiro',
    resumo: 'Recebimentos devem ser processados exclusivamente pelos canais bancários oficiais da FEALQ.',
    textoCompleto:
      'É terminantemente vedado o recebimento de valores de inscrição de cursos/eventos ou aportes de patrocínio em contas bancárias pessoais de docentes ou terceiros. Toda arrecadação deve tramitar pelas contas oficiais da FEALQ via boleto registrado, PIX corporativo ou gateway de checkout autorizado (ex: Doity/FEALQ), garantindo transparência fiscal e contábil.',
  },
  {
    numero: 12,
    titulo: 'Remanejamento de Rubricas e Aditamentos Contratuais',
    categoria: 'financeiro',
    resumo: 'Alterações substanciais exigem justificativa técnica prévia e aditamento formal.',
    textoCompleto:
      'Remanejamentos entre categorias orçamentárias que ultrapassem os limites de tolerância fixados no termo de convênio necessitam de prévia justificativa técnica apresentada pelo coordenador e expressa anuência da FEALQ e, quando aplicável, do parceiro financiador ou comissão acadêmica.',
  },
  {
    numero: 13,
    titulo: 'Prestação de Contas Técnico-Financeira nos Prazos Normativos',
    categoria: 'prestacao',
    resumo: 'Obrigação indelegável da coordenação de entregar relatórios técnicos e financeiros.',
    textoCompleto:
      'O Coordenador é o responsável indelegável pela elaboração do Relatório Técnico Final de Atividades e aprovação da prestação de contas financeira perante a FEALQ e os órgãos convenentes, dentro do prazo máximo de 60 (sessenta) dias após o término de vigência do projeto. A inadimplência impede a aprovação de novas propostas na Fundação.',
  },
  {
    numero: 14,
    titulo: 'Destinação de Saldos Remanescentes e Fundo de Promoção Acadêmica (FPA)',
    categoria: 'financeiro',
    resumo: 'Aplicação das regras do FPA departamental e institucional da FEALQ ao encerramento.',
    textoCompleto:
      'Ao término do projeto e após a quitação integral de todos os compromissos assumidos, o saldo financeiro remanescente terá a destinação expressamente estabelecida no termo contratual/convênio ou, na sua omissão, será transferido aos Fundos de Promoção Acadêmica (FPA) da FEALQ e do Departamento/Unidade da USP de origem.',
  },
  {
    numero: 15,
    titulo: 'Medidas Cautelares, Suspensão Financeira e Responsabilização',
    categoria: 'gestao',
    resumo: 'Descumprimento das regras enseja bloqueio cautelar das movimentações financeiras.',
    textoCompleto:
      'A inobservância das normas legais, tributárias, atraso injustificado na prestação de contas ou constatação de irregularidades formais facultará à Diretoria da FEALQ a suspensão cautelar imediata de pagamentos e saques da conta do projeto até que a pendência seja saneada, sem prejuízo das providências administrativas e judiciais cabíveis.',
  },
];

export const OrientacoesCoordenador = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { protocolId, sessionId, marcarFormularioConcluido, statusFormulario } = useRastreabilidade();

  const [nomeCoordenador] = useProcessoState('nomeCoordenador',
    sanitizeInputText(searchParams.get('coordenador')) || ''
  );
  const [cpf] = useProcessoState('cpf', formatCPF(searchParams.get('cpf') || ''));

  // Controle de itens expandidos no accordion
  const [expanded, setExpanded] = useProcessoState<Record<number, boolean>>('expanded', { 1: true, 2: true });
  const [itensLidos, setItensLidos] = useProcessoState<Record<number, boolean>>('itensLidos', {});

  // Confirmação de Leitura
  const [leuTodasOrientacoes, setLeuTodasOrientacoes] = useProcessoState('leuTodasOrientacoes', false);
  const [confirmado, setConfirmado] = useProcessoState('confirmado', statusFormulario('CERT-ORIENT-01') === 'concluido');
  const [dataCertificacao, setDataCertificacao] = useProcessoState<string | null>('dataCertificacao',
    statusFormulario('CERT-ORIENT-01') === 'concluido' ? new Date().toLocaleDateString('pt-BR') : null
  );
  const [horaCertificacao, setHoraCertificacao] = useProcessoState<string | null>('horaCertificacao',
    statusFormulario('CERT-ORIENT-01') === 'concluido' ? new Date().toLocaleTimeString('pt-BR') : null
  );

  const codigoCertificacao = `FEALQ-ORIENT-${protocolId}-${sessionId.slice(-6).toUpperCase()}`;

  const toggleExpand = (num: number) => {
    setExpanded((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const toggleLido = (num: number) => {
    setItensLidos((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const marcarTodosComoLidos = () => {
    const todos: Record<number, boolean> = {};
    ORIENTACOES_OFICIAIS.forEach((item) => {
      todos[item.numero] = true;
    });
    setItensLidos(todos);
    setLeuTodasOrientacoes(true);
  };

  const totalLidos = Object.values(itensLidos).filter(Boolean).length;
  const percentualLido = Math.round((totalLidos / ORIENTACOES_OFICIAIS.length) * 100);

  const handleConfirmarLeitura = () => {
    if (!leuTodasOrientacoes) return;
    const agora = new Date();
    const dataStr = agora.toLocaleDateString('pt-BR');
    const horaStr = agora.toLocaleTimeString('pt-BR');
    setDataCertificacao(dataStr);
    setHoraCertificacao(horaStr);
    setConfirmado(true);

    marcarFormularioConcluido('CERT-ORIENT-01', {
      modelo: 'Orientações ao Coordenador FEALQ (15 Cláusulas)',
      nomeCoordenador,
      cpf,
      codigoCertificacao,
      assinadoEm: agora.toISOString(),
      itensLidosTotal: totalLidos,
      status: 'concluido',
    });
  };

  const rawProtocolo = searchParams.get('protocolo');
  const protocoloUrlParam = rawProtocolo ? sanitizeProtocolId(rawProtocolo) : protocolId;
  const processoPai = searchParams.get('processo_pai');
  const linkRetorno = getSafeReturnUrl(`/projetos/form-curso?protocolo=${encodeURIComponent(protocoloUrlParam)}${processoPai ? `&processo=${encodeURIComponent(processoPai)}` : ''}`);

  return (
    <FormPageLayout
      breadcrumb={['Área do Coordenador', 'Certificações', 'Orientações ao Coordenador FEALQ']}
      titulo="Orientações ao Coordenador de Projetos e Eventos"
      codigo="ORI-COORD-01 / REV-03"
      badge="Leitura Obrigatória"
      acaoPrincipal="Concluir e Retornar ao Protocolo"
      acaoIcone="verified"
      podeEnviar={confirmado}
      aoSubmeter={() => {
        navigate(linkRetorno);
      }}
      sidebar={
        <CertificacaoSidebarCard
          titulo="Progresso da Leitura"
          icone="fact_check"
          confirmado={confirmado}
          statusLabelConfirmado="Certificação Concluída"
          statusLabelPendente={`${totalLidos}/15 Itens Marcados (${percentualLido}%)`}
          mensagemConfirmado={`Orientações certificadas sob código ${codigoCertificacao}. Vinculado ao protocolo.`}
          mensagemPendente="A leitura de todas as 15 diretrizes é obrigatória para certificar o coordenador."
          protocoloId={protocolId}
          carimboData={dataCertificacao}
          carimboHora={horaCertificacao}
          linkRetorno={linkRetorno}
          metaItems={[
            { label: 'Total de Orientações', valor: '15 Diretrizes Institucionais' },
            {
              label: 'Progresso',
              valor: (
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-surface-variant/40 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${confirmado ? 'bg-green-600' : 'bg-primary'}`}
                      style={{ width: `${percentualLido}%` }}
                    />
                  </div>
                  <span>{percentualLido}%</span>
                </div>
              ),
            },
          ]}
        >
          {/* Ação rápida para marcar todos */}
          {!confirmado && (
            <button
              type="button"
              onClick={marcarTodosComoLidos}
              className="w-full inline-flex items-center justify-center gap-1.5 px-md py-2 rounded bg-surface-container-low border border-primary/30 text-primary text-[12px] font-semibold hover:bg-primary/5 transition-colors -mt-md"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              Marcar Todos os 15 Itens como Lidos
            </button>
          )}

          {/* Destaque Importante */}
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-lg text-[12px] text-on-surface-variant leading-relaxed">
            <h4 className="font-bold text-on-surface mb-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">info</span>
              Compromisso Institucional
            </h4>
            <p>
              O cumprimento rigoroso destas diretrizes assegura a regularidade perante o Tribunal de Contas, a Reitoria da USP e a Receita Federal, resguardando o Coordenador contra glosas financeiras ou devoluções de recursos.
            </p>
          </div>
        </CertificacaoSidebarCard>
      }
    >
      <div className="flex flex-col gap-lg">
        {/* Banner Informativo */}
        <div className="bg-gradient-to-r from-secondary/15 via-primary/5 to-transparent p-md rounded-lg border border-secondary/30 flex items-start gap-md">
          <div className="p-sm bg-secondary/20 rounded-full shrink-0 text-secondary-dark">
            <span className="material-symbols-outlined text-[28px]">menu_book</span>
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-primary leading-tight">
              15 Orientações Normativas e Operacionais ao Coordenador FEALQ
            </h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              Guia oficial para ordenadores de despesas e gestores acadêmicos. Leia as orientações abaixo e registre a confirmação de leitura obrigatória para validar o protocolo de abertura.
            </p>
          </div>
        </div>

        {/* 1. Lista Interativa das 15 Orientações Oficiais */}
        <FormSection
          numero={1}
          icone="format_list_numbered"
          titulo="Diretrizes Oficiais de Gestão Financeira e Acadêmica"
          livre
        >
          <div className="flex flex-col gap-sm">
            {ORIENTACOES_OFICIAIS.map((item) => {
              const isExpanded = expanded[item.numero];
              const isLido = itensLidos[item.numero];

              return (
                <div
                  key={item.numero}
                  className={`border rounded-lg transition-all ${
                    isLido
                      ? 'bg-surface-container-lowest border-outline-variant'
                      : 'bg-surface-container-low border-primary/20'
                  }`}
                >
                  <div className="p-md flex items-start justify-between gap-md cursor-pointer select-none" onClick={() => toggleExpand(item.numero)}>
                    <div className="flex items-start gap-sm flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLido(item.numero);
                        }}
                        className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center transition-colors shrink-0 ${
                          isLido
                            ? 'bg-green-600 text-white'
                            : 'border border-outline text-outline hover:border-primary hover:text-primary'
                        }`}
                        title={isLido ? 'Item marcado como lido' : 'Marcar como lido'}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isLido ? 'check' : 'radio_button_unchecked'}
                        </span>
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded font-mono">
                            Item {item.numero.toString().padStart(2, '0')}
                          </span>
                          <span className="text-[14px] font-bold text-on-surface">
                            {item.titulo}
                          </span>
                        </div>
                        <p className="text-[12px] text-on-surface-variant mt-1 leading-snug">
                          {item.resumo}
                        </p>
                      </div>
                    </div>

                    <span className="material-symbols-outlined text-outline-variant hover:text-on-surface text-[20px] shrink-0 mt-1">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="px-md pb-md pt-sm border-t border-outline-variant/40 bg-surface-container-lowest/60 text-[13px] text-on-surface leading-relaxed pl-[46px]">
                      <p>{item.textoCompleto}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </FormSection>

        {/* 2. Confirmação de Leitura e Certificação Eletrônica */}
        <FormSection
          numero={2}
          icone="verified"
          titulo="Confirmação Formal de Leitura e Ciência"
          acao={
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
              Obrigatório
            </span>
          }
          livre
        >
          <div className={`p-lg rounded-lg border transition-all ${
            confirmado
              ? 'bg-green-50/60 border-green-500/80'
              : 'bg-surface-container-low border-outline-variant'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={leuTodasOrientacoes}
                disabled={confirmado}
                onChange={(e) => setLeuTodasOrientacoes(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-outline text-primary focus:ring-primary cursor-pointer"
              />
              <div className="flex-1">
                <span className="text-[13px] font-bold text-on-surface block leading-tight">
                  DECLARAÇÃO FORMAL DE LEITURA E CIÊNCIA DAS 15 ORIENTAÇÕES AO COORDENADOR
                </span>
                <span className="text-[12px] text-on-surface-variant mt-1 block leading-relaxed">
                  Declaro que li, compreendi integralmente e comprometo-me a observar e fazer cumprir as <strong>15 Orientações ao Coordenador da FEALQ</strong> em todas as fases de planejamento, execução, arrecadação, pagamentos e prestação de contas do projeto vinculado ao Protocolo <strong>{protocolId}</strong>.
                </span>
              </div>
            </label>

            {confirmado ? (
              <div className="mt-md pt-md border-t border-green-300 flex flex-col md:flex-row md:items-center justify-between gap-md">
                <div className="flex items-center gap-sm">
                  <div className="p-2 bg-green-600 text-white rounded-full">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-green-800 block">
                      Ciência Registrada e Vinculada ao Protocolo
                    </span>
                    <span className="text-[13px] font-semibold text-green-950 block">
                      Coordenador: {nomeCoordenador} (CPF: {cpf})
                    </span>
                    <span className="text-[11px] text-green-700 font-mono block">
                      Autenticação: {codigoCertificacao} | Data: {dataCertificacao} às {horaCertificacao}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-xs">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-md py-2 text-[12px] font-medium border border-green-600 text-green-800 rounded bg-white hover:bg-green-50 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    Imprimir Termo
                  </button>
                  <Link
                    to={linkRetorno}
                    className="px-md py-2 text-[12px] font-semibold text-white bg-green-700 rounded hover:bg-green-800 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Voltar ao Protocolo
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-md pt-md border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-md">
                <div className="text-[11px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">security</span>
                  <span>O registro eletrônico fica gravado na trilha de auditoria do protocolo {protocolId}.</span>
                </div>
                <button
                  type="button"
                  disabled={!leuTodasOrientacoes}
                  onClick={handleConfirmarLeitura}
                  className={`px-lg py-2.5 rounded font-semibold text-[13px] flex items-center gap-2 transition-all ${
                    leuTodasOrientacoes
                      ? 'bg-primary text-white hover:bg-primary-dark shadow-sm cursor-pointer'
                      : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Confirmar Leitura e Ciência das 15 Orientações
                </button>
              </div>
            )}
          </div>
        </FormSection>
      </div>
    </FormPageLayout>
  );
};
