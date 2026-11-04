import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { Field } from '../../components/form/Field';
import { CertificacaoSidebarCard } from '../../components/form/CertificacaoSidebarCard';
import { useRastreabilidade } from '../../contexts/RastreabilidadeContext';
import { sanitizeInputText, sanitizeProtocolId, getSafeReturnUrl } from '../../utils/security';

export const CienciaConcordanciaDepto = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { protocolId, sessionId, marcarFormularioConcluido, statusFormulario } = useRastreabilidade();

  // Dados do Departamento e Aprovação
  const [deptoNome, setDeptoNome] = useState(
    sanitizeInputText(searchParams.get('depto')) || ''
  );
  const [modalidadeAprovacao, setModalidadeAprovacao] = useState<'conselho' | 'ad_referendum'>('conselho');
  const [dataConselho, setDataConselho] = useState('');
  const [isentaTaxa, setIsentaTaxa] = useState<'sim' | 'nao'>('nao');
  const [observacoes, setObservacoes] = useState('');

  // Declarante / Assinador
  const [nomeDeclarante] = useState(
    sanitizeInputText(searchParams.get('declarante') || searchParams.get('coordenador')) || ''
  );
  const [cargoDeclarante] = useState('Chefe de Departamento / Coordenador em Representação');

  // Confirmação de Leitura e Ciência
  const [declaracaoVerdade, setDeclaracaoVerdade] = useState(false);
  const [confirmado, setConfirmado] = useState(statusFormulario('CERT-DEPTO-01') === 'concluido');
  const [dataCertificacao, setDataCertificacao] = useState<string | null>(
    statusFormulario('CERT-DEPTO-01') === 'concluido' ? new Date().toLocaleDateString('pt-BR') : null
  );
  const [horaCertificacao, setHoraCertificacao] = useState<string | null>(
    statusFormulario('CERT-DEPTO-01') === 'concluido' ? new Date().toLocaleTimeString('pt-BR') : null
  );

  const codigoCertificacao = `FEALQ-DEPTO-${protocolId}-${sessionId.slice(-6).toUpperCase()}`;

  const handleConfirmar = () => {
    if (!declaracaoVerdade || !deptoNome.trim()) return;
    if (modalidadeAprovacao === 'conselho' && !dataConselho) return;

    const agora = new Date();
    const dataStr = agora.toLocaleDateString('pt-BR');
    const horaStr = agora.toLocaleTimeString('pt-BR');
    setDataCertificacao(dataStr);
    setHoraCertificacao(horaStr);
    setConfirmado(true);

    marcarFormularioConcluido('CERT-DEPTO-01', {
      modelo: 'Ciência e Concordância do Departamento (USP)',
      deptoNome,
      modalidadeAprovacao,
      dataConselho: modalidadeAprovacao === 'conselho' ? dataConselho : null,
      isentaTaxa,
      observacoes,
      nomeDeclarante,
      cargoDeclarante,
      codigoCertificacao,
      assinadoEm: agora.toISOString(),
      status: 'concluido',
    });
  };

  const rawProtocolo = searchParams.get('protocolo');
  const protocoloUrlParam = rawProtocolo ? sanitizeProtocolId(rawProtocolo) : protocolId;
  const linkRetorno = getSafeReturnUrl(`/projetos/form-curso?protocolo=${encodeURIComponent(protocoloUrlParam)}`);

  const podeConfirmar =
    declaracaoVerdade &&
    deptoNome.trim().length > 3 &&
    (modalidadeAprovacao === 'ad_referendum' || dataConselho.trim().length > 0);

  return (
    <FormPageLayout
      breadcrumb={['Área do Coordenador', 'Certificações', 'Ciência e Concordância do Departamento']}
      titulo="Ciência e Concordância do Departamento (USP)"
      codigo="CONV-DP-01-USP"
      badge="USP Obrigatório"
      acaoPrincipal="Concluir e Retornar ao Protocolo"
      acaoIcone="verified"
      podeEnviar={confirmado}
      aoSubmeter={() => {
        navigate(linkRetorno);
      }}
      sidebar={
        <CertificacaoSidebarCard
          titulo="Deliberação Departamental"
          icone="domain"
          confirmado={confirmado}
          statusLabelConfirmado="Ciência Concluída"
          statusLabelPendente="Aguardando Ciência"
          mensagemConfirmado={`Deliberação registrada sob o selo ${codigoCertificacao}.`}
          mensagemPendente="Necessário preencher o departamento e atestar a modalidade de aprovação para liberar a submissão."
          protocoloId={protocolId}
          carimboData={dataCertificacao}
          carimboHora={horaCertificacao}
          linkRetorno={linkRetorno}
          metaItems={[
            {
              label: 'Modalidade',
              valor: modalidadeAprovacao === 'conselho' ? 'Conselho do Depto.' : 'Ad Referendum',
            },
            {
              label: 'Isenção de Taxa',
              valor: isentaTaxa.toUpperCase(),
            },
          ]}
        >

          {/* Destaque das Normas USP */}
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-lg text-[12px] text-on-surface-variant leading-relaxed">
            <h4 className="font-bold text-on-surface mb-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">account_balance</span>
              Competência Departamental
            </h4>
            <p className="mb-2">
              Ao Departamento compete a verificação das normas legais vigentes na USP e no Brasil, relacionadas com o objeto do curso/evento e a carga horária dos docentes envolvidos.
            </p>
            <p>
              Caso haja isenção da taxa departamental em prol do evento, a deliberação formal constará dos registros do FPA da FEALQ.
            </p>
          </div>
        </CertificacaoSidebarCard>
      }
    >
      <div className="flex flex-col gap-lg">
        {/* Banner Institucional USP */}
        <div className="bg-gradient-to-r from-primary/10 via-surface-container-low to-transparent p-md rounded-lg border border-primary/20 flex items-start gap-md">
          <div className="p-sm bg-primary/10 rounded-full shrink-0 text-primary">
            <span className="material-symbols-outlined text-[28px]">account_balance</span>
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-primary leading-tight flex items-center gap-2">
              6. Ciência e Concordância do Departamento (USP)
            </h2>
            <span className="inline-block mt-1 text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
              INCLUÍDO EM TODOS OS PROJETOS DE CURSOS E EVENTOS COM DOCENTES USP
            </span>
            <p className="text-[12px] text-on-surface-variant mt-1.5">
              Instrumento institucional de ciência e anuência da chefia e colegiado departamental para validação do projeto perante a FEALQ e a Universidade.
            </p>
          </div>
        </div>

        {/* 1. Inserir Respectivo Departamento / Unidade */}
        <FormSection
          numero={1}
          icone="domain"
          titulo="Departamento / Unidade Acadêmica da USP"
          livre
        >
          <div className="flex flex-col gap-sm">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              INSERIR RESPECTIVO DEPARTAMENTO / UNIDADE *
            </label>
            <input
              type="text"
              value={deptoNome}
              onChange={(e) => setDeptoNome(e.target.value)}
              placeholder="Ex: Departamento de Engenharia de Alimentos - FZEA/USP"
              className="w-full px-sm py-2 rounded border border-outline bg-surface text-on-surface text-[13px] focus:outline-none focus:border-primary"
              required
            />
            <div className="flex items-center gap-2 flex-wrap text-[11px] text-on-surface-variant">
              <span>Sugestões rápidas:</span>
              <button
                type="button"
                onClick={() => setDeptoNome('Departamento de Engenharia de Alimentos - FZEA/USP')}
                className="px-2 py-0.5 rounded border border-outline-variant hover:bg-surface-variant transition-colors"
              >
                FZEA/USP - Alimentos
              </button>
              <button
                type="button"
                onClick={() => setDeptoNome('Departamento de Agroindústria, Alimentos e Nutrição - ESALQ/USP')}
                className="px-2 py-0.5 rounded border border-outline-variant hover:bg-surface-variant transition-colors"
              >
                ESALQ/USP - Alimentos
              </button>
              <button
                type="button"
                onClick={() => setDeptoNome('Departamento de Ciência do Solo - ESALQ/USP')}
                className="px-2 py-0.5 rounded border border-outline-variant hover:bg-surface-variant transition-colors"
              >
                ESALQ/USP - Solos
              </button>
              <button
                type="button"
                onClick={() => setDeptoNome('Departamento de Zootecnia - FZEA/USP')}
                className="px-2 py-0.5 rounded border border-outline-variant hover:bg-surface-variant transition-colors"
              >
                FZEA/USP - Zootecnia
              </button>
            </div>
          </div>
        </FormSection>

        {/* 2. Modalidade de Aprovação do Departamento */}
        <FormSection
          numero={2}
          icone="how_to_reg"
          titulo="Modalidade de Aprovação do Departamento"
          livre
        >
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-lg space-y-md">
            <h4 className="text-[13px] font-bold text-on-surface uppercase tracking-wide">
              Modalidade de Aprovação do Departamento:
            </h4>

            {/* Opção 1: Aprovado pelo Conselho */}
            <div
              onClick={() => setModalidadeAprovacao('conselho')}
              className={`p-md rounded-lg border cursor-pointer transition-all ${
                modalidadeAprovacao === 'conselho'
                  ? 'bg-surface-container-lowest border-primary shadow-xs'
                  : 'bg-surface-container-lowest/50 border-outline-variant/60 hover:border-outline'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="modalidadeAprovacao"
                  value="conselho"
                  checked={modalidadeAprovacao === 'conselho'}
                  onChange={() => setModalidadeAprovacao('conselho')}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-[13px] text-on-surface leading-relaxed block">
                    Este Projeto, inclusive a participação do Coordenador e/ou Docentes deste Departamento, foi <strong>aprovado pelo Conselho do Departamento</strong>. Ao Departamento compete a verificação das normas legais vigentes na USP e no Brasil, relacionadas com o objeto deste evento.
                  </span>

                  {modalidadeAprovacao === 'conselho' && (
                    <div className="mt-md pt-sm border-t border-outline-variant/40 max-w-xs">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                        DATA DA REUNIÃO DO CONSELHO *
                      </label>
                      <input
                        type="date"
                        value={dataConselho}
                        onChange={(e) => setDataConselho(e.target.value)}
                        className="w-full px-sm py-1.5 rounded border border-outline bg-surface text-on-surface text-[13px] focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Opção 2: Ad Referendum */}
            <div
              onClick={() => setModalidadeAprovacao('ad_referendum')}
              className={`p-md rounded-lg border cursor-pointer transition-all ${
                modalidadeAprovacao === 'ad_referendum'
                  ? 'bg-surface-container-lowest border-primary shadow-xs'
                  : 'bg-surface-container-lowest/50 border-outline-variant/60 hover:border-outline'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="modalidadeAprovacao"
                  value="ad_referendum"
                  checked={modalidadeAprovacao === 'ad_referendum'}
                  onChange={() => setModalidadeAprovacao('ad_referendum')}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-[13px] text-on-surface leading-relaxed block">
                    Aprovo este Evento, inclusive a participação do Coordenador e demais Docentes deste Departamento, <strong>&quot;ad referendum&quot;</strong> do Conselho de Departamento, para início de sua tramitação.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </FormSection>

        {/* 3. Isenção da Taxa Departamental */}
        <FormSection
          numero={3}
          icone="payments"
          titulo="Isenção de Taxa Departamental"
          livre
        >
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-lg flex flex-col sm:flex-row sm:items-center justify-between gap-md">
            <div>
              <span className="text-[13px] font-bold text-on-surface block">
                O Departamento referido isenta da taxa que lhe cabe em prol do evento?
              </span>
              <span className="text-[11px] text-on-surface-variant block mt-0.5">
                Caso isente, o valor correspondente ao percentual do departamento é reinvestido no custeio direto do evento.
              </span>
            </div>

            <div className="flex items-center gap-lg shrink-0 bg-surface-container-lowest px-md py-2 rounded-lg border border-outline-variant">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[13px] text-on-surface select-none">
                <input
                  type="radio"
                  name="isentaTaxa"
                  value="sim"
                  checked={isentaTaxa === 'sim'}
                  onChange={() => setIsentaTaxa('sim')}
                  className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                />
                SIM
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[13px] text-on-surface select-none">
                <input
                  type="radio"
                  name="isentaTaxa"
                  value="nao"
                  checked={isentaTaxa === 'nao'}
                  onChange={() => setIsentaTaxa('nao')}
                  className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                />
                NÃO
              </label>
            </div>
          </div>

          <div className="mt-md">
            <Field
              label="Observações / Justificativas Departamentais (Opcional)"
              span={12}
              tipo="textarea"
              valor={observacoes}
              onChange={(val) => setObservacoes(val)}
              placeholder="Informações adicionais, menção a processos no Sistema USP ou ofícios vinculados..."
            />
          </div>
        </FormSection>

        {/* 4. Confirmação de Leitura e Certificação Eletrônica */}
        <FormSection
          numero={4}
          icone="verified"
          titulo="Confirmação de Ciência e Deliberação"
          acao={
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
              Validação
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
                checked={declaracaoVerdade}
                disabled={confirmado}
                onChange={(e) => setDeclaracaoVerdade(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-outline text-primary focus:ring-primary cursor-pointer"
              />
              <div className="flex-1">
                <span className="text-[13px] font-bold text-on-surface block leading-tight">
                  DECLARAÇÃO FORMAL DE CIÊNCIA E DELIBERAÇÃO DEPARTAMENTAL
                </span>
                <span className="text-[12px] text-on-surface-variant mt-1 block leading-relaxed">
                  Declaro e certifico sob fé pública que as informações acima relativas ao <strong>{deptoNome || 'Departamento'}</strong>, sua modalidade de aprovação e deliberação sobre a taxa departamental são fidedignas e correspondem à ata do Conselho ou ato ad referendum da Chefia para com o Protocolo <strong>{protocolId}</strong>.
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
                      Ciência Departamental Registrada com Sucesso
                    </span>
                    <span className="text-[13px] font-semibold text-green-950 block">
                      Responsável: {nomeDeclarante} ({cargoDeclarante})
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
                    Imprimir Comprovante
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
                  <span className="material-symbols-outlined text-[16px] text-primary">domain_verification</span>
                  <span>A deliberação será atrelada aos demonstrativos fiscais e FPA do protocolo {protocolId}.</span>
                </div>
                <button
                  type="button"
                  disabled={!podeConfirmar}
                  onClick={handleConfirmar}
                  className={`px-lg py-2.5 rounded font-semibold text-[13px] flex items-center gap-2 transition-all ${
                    podeConfirmar
                      ? 'bg-primary text-white hover:bg-primary-dark shadow-sm cursor-pointer'
                      : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Confirmar Deliberação Departamental
                </button>
              </div>
            )}
          </div>
        </FormSection>
      </div>
    </FormPageLayout>
  );
};
