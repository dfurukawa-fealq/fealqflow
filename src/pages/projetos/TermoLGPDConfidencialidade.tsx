import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { Field } from '../../components/form/Field';
import { useRastreabilidade } from '../../contexts/RastreabilidadeContext';

const formatarCpf = (valor: string) => {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);
  return numeros
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const formatarRg = (valor: string) => {
  const partes = valor.trim().split(/\s+/, 2);
  const numeros = (partes[0] || '').replace(/\D/g, '').slice(0, 9);
  const rgFormatado = numeros
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1})$/, '$1-$2');
  const orgaoEmissor = partes[1] ? ` ${partes[1].toUpperCase()}` : '';
  return `${rgFormatado}${orgaoEmissor}`.trim();
};

export const TermoLGPDConfidencialidade = () => {
  const [searchParams] = useSearchParams();
  const { protocolId, sessionId, marcarFormularioConcluido, statusFormulario } = useRastreabilidade();

  // Dados do coordenador e projeto (recebidos via query ou autopreenchidos)
  const [nomeCoordenador, setNomeCoordenador] = useState(
    searchParams.get('coordenador') || ''
  );
  const [cpf, setCpf] = useState(formatarCpf(searchParams.get('cpf') || ''));
  const [rg, setRg] = useState(formatarRg(searchParams.get('rg') || ''));
  const [departamento, setDepartamento] = useState(
    searchParams.get('departamento') || ''
  );
  const [tituloProjeto, setTituloProjeto] = useState(
    searchParams.get('projeto') || ''
  );
  const [email, setEmail] = useState(searchParams.get('email') || '');

  // Confirmação de Leitura
  const [leuTermo, setLeuTermo] = useState(false);
  const [confirmado, setConfirmado] = useState(statusFormulario('CERT-LGPD-01') === 'concluido');
  const [dataCertificacao, setDataCertificacao] = useState<string | null>(
    statusFormulario('CERT-LGPD-01') === 'concluido' ? new Date().toLocaleDateString('pt-BR') : null
  );
  const [horaCertificacao, setHoraCertificacao] = useState<string | null>(
    statusFormulario('CERT-LGPD-01') === 'concluido' ? new Date().toLocaleTimeString('pt-BR') : null
  );

  const codigoCertificacao = `FEALQ-LGPD-${protocolId}-${sessionId.slice(-6).toUpperCase()}`;

  const handleConfirmarLeitura = () => {
    if (!leuTermo) return;
    const agora = new Date();
    const dataStr = agora.toLocaleDateString('pt-BR');
    const horaStr = agora.toLocaleTimeString('pt-BR');
    setDataCertificacao(dataStr);
    setHoraCertificacao(horaStr);
    setConfirmado(true);

    marcarFormularioConcluido('CERT-LGPD-01', {
      termo: 'FR 01 – PRO - Rev. 05',
      nomeCoordenador,
      cpf,
      rg,
      departamento,
      tituloProjeto,
      email,
      codigoCertificacao,
      assinadoEm: agora.toISOString(),
      status: 'concluido',
    });
  };

  const protocoloUrlParam = searchParams.get('protocolo') || protocolId;
  const linkRetorno = `/projetos/form-curso?protocolo=${encodeURIComponent(protocoloUrlParam)}`;

  return (
    <FormPageLayout
      breadcrumb={['Área do Coordenador', 'Certificações', 'Termo de LGPD e Confidencialidade']}
      titulo="Termo de Compromisso e Confidencialidade de Dados (LGPD)"
      codigo="FR 01 – PRO - Rev. 05"
      badge="Obrigatório"
      acaoPrincipal="Concluir e Retornar ao Protocolo"
      acaoIcone="verified"
      podeEnviar={confirmado}
      aoSubmeter={() => {
        window.location.href = linkRetorno;
      }}
      sidebar={
        <div className="flex flex-col gap-lg">
          {/* Card de Status da Leitura */}
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-lg shadow-sm">
            <div className="flex items-center gap-xs mb-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">
                {confirmado ? 'verified' : 'pending_actions'}
              </span>
              <h3 className="text-[14px] font-bold text-on-surface">Status da Certificação</h3>
            </div>

            <div className={`p-sm rounded border mb-sm ${
              confirmado
                ? 'bg-green-50 border-green-400 text-green-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  {confirmado ? 'check_circle' : 'info'}
                </span>
                <span className="text-[12px] font-bold uppercase tracking-wide">
                  {confirmado ? 'Leitura Confirmada' : 'Leitura Obrigatória Pendente'}
                </span>
              </div>
              <p className="text-[11px] mt-1 leading-snug">
                {confirmado
                  ? `Termo certificado sob código ${codigoCertificacao}. Registrado e vinculado ao protocolo.`
                  : 'A leitura integral e o aceite formal deste termo são requisitos legais para a submissão do protocolo.'}
              </p>
            </div>

            <div className="text-[11px] text-on-surface-variant flex flex-col gap-1 border-t border-outline-variant/60 pt-2">
              <div className="flex justify-between">
                <span>Protocolo Vinculado:</span>
                <span className="font-mono font-bold text-primary">{protocolId}</span>
              </div>
              <div className="flex justify-between">
                <span>Versão do Modelo:</span>
                <span className="font-medium">Rev. 05 (FEALQ/USP)</span>
              </div>
              {confirmado && dataCertificacao && (
                <div className="flex justify-between text-green-800 font-medium">
                  <span>Carimbo:</span>
                  <span>{dataCertificacao} às {horaCertificacao}</span>
                </div>
              )}
            </div>

            <div className="mt-md pt-sm border-t border-outline-variant">
              <Link
                to={linkRetorno}
                className="w-full inline-flex items-center justify-center gap-1.5 px-md py-2 rounded bg-surface-container border border-outline text-on-surface text-[12px] font-semibold hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Retornar ao Protocolo Principal
              </Link>
            </div>
          </div>

          {/* Orientações Legais */}
          <div className="bg-surface-container-low border border-outline-variant rounded-lg p-lg text-[12px] text-on-surface-variant leading-relaxed">
            <h4 className="font-bold text-on-surface mb-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">gavel</span>
              Fundamentação Legal
            </h4>
            <p className="mb-2">
              Em consonância com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD), o coordenador é responsável pelo tratamento de dados pessoais obtidos durante a execução do projeto.
            </p>
            <p>
              Os dados coletados destinam-se exclusivamente à gestão acadêmica, técnica e contábil, sendo expressamente vedada sua cessão ou exploração comercial não autorizada.
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-lg">
        {/* Banner Institucional */}
        <div className="bg-gradient-to-r from-primary/10 via-primary-container/10 to-transparent p-md rounded-lg border border-primary/20 flex items-start gap-md">
          <div className="p-sm bg-primary/10 rounded-full shrink-0 text-primary">
            <span className="material-symbols-outlined text-[28px]">shield</span>
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-primary leading-tight">
              Termo de Compromisso, Sigilo e Confidencialidade de Dados
            </h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              Formulário oficial de autopreenchimento com vinculação direta ao protocolo. A leitura e o aceite eletrônico são indispensáveis para a formalização do projeto na FEALQ.
            </p>
          </div>
        </div>

        {/* 1. Identificação das Partes e Autopreenchimento */}
        <FormSection
          numero={1}
          icone="person"
          titulo="Identificação do Declarante e Projeto"
          acao={
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
              Autopreenchido
            </span>
          }
        >
          <p className="col-span-12 -mt-xs text-[12px] text-on-surface-variant">
            Dados autopreenchidos a partir do cadastro do coordenador e do protocolo de abertura.
          </p>
          <Field
            label="Nome Completo do Coordenador"
            span={6}
            tipo="text"
            valor={nomeCoordenador}
            onChange={(val) => setNomeCoordenador(val)}
            obrigatorio
          />
          <Field
            label="CPF"
            span={3}
            tipo="text"
            valor={cpf}
            onChange={(val) => setCpf(formatarCpf(val))}
            obrigatorio
          />
          <Field
            label="RG / Órgão Emissor"
            span={3}
            tipo="text"
            valor={rg}
            onChange={(val) => setRg(formatarRg(val))}
          />
          <Field
            label="Departamento / Unidade USP"
            span={6}
            tipo="text"
            valor={departamento}
            onChange={(val) => setDepartamento(val)}
            obrigatorio
          />
          <Field
            label="E-mail Institucional"
            span={6}
            tipo="email"
            valor={email}
            onChange={(val) => setEmail(val)}
            obrigatorio
          />
          <Field
            label="Título do Projeto / Curso / Evento"
            span={12}
            tipo="text"
            valor={tituloProjeto}
            onChange={(val) => setTituloProjeto(val)}
            obrigatorio
          />
        </FormSection>

        {/* 2. Texto Integral do Termo de Confidencialidade (FR 01 - PRO - Rev. 05) */}
        <FormSection
          numero={2}
          icone="article"
          titulo="Instrumento de Confidencialidade e LGPD (FR 01 - PRO - Rev. 05)"
          livre
        >
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg text-[13px] text-on-surface leading-relaxed max-h-[460px] overflow-y-auto space-y-4 shadow-inner pr-4">
            <div className="text-center font-bold pb-2 border-b border-outline-variant text-primary text-[14px]">
              FUNDAÇÃO DE ESTUDOS AGRÁRIOS LUIZ DE QUEIROZ – FEALQ
              <span className="block text-[11px] font-normal text-on-surface-variant">
                TERMO DE COMPROMISSO, CONFIDENCIALIDADE E TRATAMENTO DE DADOS PESSOAIS
              </span>
            </div>

            <p>
              Pelo presente instrumento particular, eu, <strong>{nomeCoordenador || 'Coordenador'}</strong>, portador(a) do RG nº <strong>{rg}</strong> e inscrito(a) no CPF sob o nº <strong>{cpf}</strong>, na qualidade de Coordenador(a) do projeto <strong>&quot;{tituloProjeto}&quot;</strong> (Protocolo FEALQ: <strong>{protocolId}</strong>), perante a <strong>FUNDAÇÃO DE ESTUDOS AGRÁRIOS LUIZ DE QUEIROZ – FEALQ</strong>, assumo formalmente o compromisso de cumprir com as diretrizes da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD) e as condições dispostas a seguir:
            </p>

            <div>
              <h5 className="font-bold text-primary mb-1">Cláusula 1ª – Do Objeto e Sigilo Irrestrito</h5>
              <p>
                O(A) Coordenador(a) obriga-se a manter sob o mais absoluto sigilo, não revelando, divulgando ou utilizando de forma indevida, direta ou indiretamente, quaisquer dados pessoais, informações confidenciais, técnicas, científicas, acadêmicas ou financeiras obtidas em decorrência do desenvolvimento do presente projeto, bem como dados de participantes, inscritos, discentes, docentes ou terceiros envolvidos.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-primary mb-1">Cláusula 2ª – Do Tratamento de Dados Pessoais e Finalidade Específica</h5>
              <p>
                O tratamento de dados pessoais realizado no âmbito do projeto dar-se-á estritamente para a finalidade legítima de execução, controle de presença, emissão de certificados, faturamento de taxas de inscrição, cumprimento de obrigações legais e regulatórias com a Universidade de São Paulo e agências fiscalizadoras, sendo expressamente vedado o uso para finalidades estranhas a este termo.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-primary mb-1">Cláusula 3ª – Das Medidas de Segurança Técnica e Administrativa</h5>
              <p>
                O(A) Coordenador(a) compromete-se a adotar e exigir de toda a sua equipe técnica as melhores práticas de segurança da informação, assegurando controles de acesso adequados, guarda segura de credenciais, armazenamento protegido em nuvem institucional e vedação de compartilhamento desautorizado de bancos de dados.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-primary mb-1">Cláusula 4ª – Da Notificação de Incidentes de Segurança</h5>
              <p>
                Qualquer evento adverso, suspeita de vazamento, perda, extravio, destruição indevida ou acesso não autorizado que envolva dados pessoais vinculados ao projeto deverá ser imediatamente comunicado por escrito ao Encarregado pelo Tratamento de Dados Pessoais (DPO) e à Diretoria da FEALQ, informando a natureza do incidente e as medidas de mitigação adotadas.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-primary mb-1">Cláusula 5ª – Da Retenção e Eliminação Segura dos Dados</h5>
              <p>
                Encerrado o projeto e concluída a prestação de contas perante a FEALQ e a USP, os dados pessoais que não demandem guarda por determinação legal ou regulatória deverão ser descartados de forma definitiva e segura, resguardadas eventuais solicitações dos titulares de dados amparadas na legislação vigente.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-primary mb-1">Cláusula 6ª – Da Responsabilidade Civil e Administrativa</h5>
              <p>
                O descumprimento injustificado de qualquer disposição constante deste termo sujeitará o declarante às cominações legais cabíveis, além de eventuais perdas e danos decorrentes de tratamento irregular ou negligente de dados, nos termos dos artigos 42 e seguintes da Lei nº 13.709/2018.
              </p>
            </div>
          </div>
        </FormSection>

        {/* 3. Confirmação de Leitura e Certificação Eletrônica */}
        <FormSection
          numero={3}
          icone="verified"
          titulo="Confirmação de Leitura Obrigatória e Aceite Formal"
          acao={
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary/10 text-secondary-dark">
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
                checked={leuTermo}
                disabled={confirmado}
                onChange={(e) => setLeuTermo(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-outline text-primary focus:ring-primary cursor-pointer"
              />
              <div className="flex-1">
                <span className="text-[13px] font-bold text-on-surface block leading-tight">
                  DECLARAÇÃO FORMAL DE LEITURA E CONCORDÂNCIA INTEGRAL (FLAG OBRIGATÓRIO)
                </span>
                <span className="text-[12px] text-on-surface-variant mt-1 block leading-relaxed">
                  Declaro sob as penas da lei que li integralmente, compreendi todas as 6 cláusulas acima e concordo de forma irrestrita com as exigências e obrigações fixadas no presente <strong>Termo de Compromisso e Confidencialidade de Dados (LGPD - FR 01 - PRO - Rev. 05)</strong>, outorgando plena validade jurídica a esta assinatura eletrônica.
                </span>
              </div>
            </label>

            {confirmado ? (
              <div className="mt-md pt-md border-t border-green-300 flex flex-col md:flex-row md:items-center justify-between gap-md">
                <div className="flex items-center gap-sm">
                  <div className="p-2 bg-green-600 text-white rounded-full">
                    <span className="material-symbols-outlined text-[24px]">verified_user</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-green-800 block">
                      Certificação de Leitura Concluída com Sucesso
                    </span>
                    <span className="text-[13px] font-semibold text-green-950 block">
                      Assinado por: {nomeCoordenador} (CPF: {cpf})
                    </span>
                    <span className="text-[11px] text-green-700 font-mono block">
                      Código de Autenticação: {codigoCertificacao} | Data: {dataCertificacao} às {horaCertificacao}
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
                  <span className="material-symbols-outlined text-[16px] text-primary">fingerprint</span>
                  <span>O clique registrará o hash de autenticação com o Protocolo {protocolId}.</span>
                </div>
                <button
                  type="button"
                  disabled={!leuTermo}
                  onClick={handleConfirmarLeitura}
                  className={`px-lg py-2.5 rounded font-semibold text-[13px] flex items-center gap-2 transition-all ${
                    leuTermo
                      ? 'bg-primary text-white hover:bg-primary-dark shadow-sm cursor-pointer'
                      : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Confirmar Leitura e Assinar Eletronicamente
                </button>
              </div>
            )}
          </div>
        </FormSection>
      </div>
    </FormPageLayout>
  );
};
