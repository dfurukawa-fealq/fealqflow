import { useProcessoState } from '../../contexts/ProcessoContext';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { Field } from '../../components/form/Field';
import { CertificacaoSidebarCard } from '../../components/form/CertificacaoSidebarCard';
import { useRastreabilidade } from '../../contexts/RastreabilidadeContext';
import { formatCPF, formatRG } from '../../utils/formatters';
import { sanitizeInputText, sanitizeProtocolId, getSafeReturnUrl } from '../../utils/security';
import { AutoPreencherButton } from '../../components/form/AutoPreencherButton';
import { safeGetItem } from '../../utils/safeStorage';
import { capturarProcessoPai } from '../../utils/processoPai';
import { lerTextoProcesso } from '../../utils/camposProcesso';

interface DadosProcessoPai { dados_json?: { campos?: Record<string, unknown> }; }

const textoSalvo = (dados: Record<string, unknown> | undefined, chave: string): string =>
  typeof dados?.[chave] === 'string' ? (dados[chave] as string) : '';

const dataSalva = (valor: string, tipo: 'data' | 'hora'): string | null => {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;
  return tipo === 'data' ? data.toLocaleDateString('pt-BR') : data.toLocaleTimeString('pt-BR');
};

export const TermoLGPDConfidencialidade = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { protocolId, sessionId, marcarFormularioConcluido, statusFormulario, formulariosVinculados } = useRastreabilidade();
  const dadosCertificacao = formulariosVinculados['CERT-LGPD-01']?.dadosVinculados;
  const certificacaoConcluida = statusFormulario('CERT-LGPD-01') === 'concluido';
  const assinaturaSalva = textoSalvo(dadosCertificacao, 'assinadoEm');

  // Os dados vêm do próprio termo salvo ou da consulta ao processo pai vinculado.
  // Parâmetros de URL não são uma fonte de dados pessoais do declarante.
  const [nomeCoordenador, setNomeCoordenador] = useProcessoState('nomeCoordenador', textoSalvo(dadosCertificacao, 'nomeCoordenador'));
  const [cpf, setCpf] = useProcessoState('cpf', textoSalvo(dadosCertificacao, 'cpf'));
  const [rg, setRg] = useProcessoState('rg', textoSalvo(dadosCertificacao, 'rg'));
  const [departamento, setDepartamento] = useProcessoState('departamento', textoSalvo(dadosCertificacao, 'departamento'));
  const [tituloProjeto, setTituloProjeto] = useProcessoState('tituloProjeto', textoSalvo(dadosCertificacao, 'tituloProjeto'));
  const [email, setEmail] = useProcessoState('email', textoSalvo(dadosCertificacao, 'email'));
  const [mensagemAutoPreenchimento, setMensagemAutoPreenchimento] = useState('');
  const [toast, setToast] = useState('');
  const [camposProcessoPai, setCamposProcessoPai] = useState<Record<string, unknown>>({});
  const [carregandoDadosPai, setCarregandoDadosPai] = useState(false);
  const [erroDadosPai, setErroDadosPai] = useState('');

  useEffect(() => {
    const processoPai = capturarProcessoPai(searchParams);
    if (!processoPai || !/^[0-9a-f-]{36}$/i.test(processoPai)) {
      setErroDadosPai('Este termo foi aberto sem vínculo com o processo pai. Retorne ao protocolo e abra o termo pelo botão correspondente.');
      return;
    }
    const token = safeGetItem(`@Fealq:processo:${processoPai}`);
    if (!token) {
      setErroDadosPai('Não foi possível localizar a chave local do protocolo pai. Reabra o termo a partir do protocolo neste navegador.');
      return;
    }
    let ativo = true;
    setCarregandoDadosPai(true);
    setErroDadosPai('');
    fetch(`/api/processos/${encodeURIComponent(processoPai)}`, { credentials: 'same-origin', headers: { 'x-processo-token': token } })
      .then(async (resposta) => {
        if (!resposta.ok) throw new Error('Não foi possível consultar o formulário pai.');
        return resposta.json() as Promise<DadosProcessoPai>;
      })
      .then((pai) => { if (ativo) setCamposProcessoPai(pai.dados_json?.campos || {}); })
      .catch((falha: unknown) => {
        if (ativo) {
          setCamposProcessoPai({});
          setErroDadosPai(falha instanceof Error ? falha.message : 'Não foi possível carregar os dados do processo pai.');
        }
      })
      .finally(() => { if (ativo) setCarregandoDadosPai(false); });
    return () => { ativo = false; };
  }, [searchParams]);

  const preencherAutomaticamente = () => {
    const lerCampoPai = (...nomes: string[]) => {
      return lerTextoProcesso(camposProcessoPai, ...nomes);
    };
    const valores = {
      nome: sanitizeInputText(lerCampoPai('coordNome', 'Nome Completo do Coordenador')),
      cpf: formatCPF(lerCampoPai('coordCpf', 'CPF')),
      rg: formatRG(lerCampoPai('coordRg', 'RG / Órgão Emissor')),
      departamento: sanitizeInputText(lerCampoPai('coordDepto', 'Departamento / Instituição', 'Departamento / Unidade USP')),
      titulo: sanitizeInputText(lerCampoPai(
        'titulo',
        'tituloProjeto',
        'Título',
        'Título do Projeto',
        'Título do Curso/Evento',
        'Título do Projeto / Curso / Evento',
      )),
      email: sanitizeInputText(lerCampoPai('coordEmail', 'E-mail Institucional')),
    };
    let preenchidos = 0;
    if (!nomeCoordenador.trim() && valores.nome) { setNomeCoordenador(valores.nome); preenchidos += 1; }
    if (!cpf.trim() && valores.cpf) { setCpf(valores.cpf); preenchidos += 1; }
    if (!rg.trim() && valores.rg) { setRg(valores.rg); preenchidos += 1; }
    if (!departamento.trim() && valores.departamento) { setDepartamento(valores.departamento); preenchidos += 1; }
    if (!tituloProjeto.trim() && valores.titulo) { setTituloProjeto(valores.titulo); preenchidos += 1; }
    if (!email.trim() && valores.email) { setEmail(valores.email); preenchidos += 1; }
    setMensagemAutoPreenchimento(preenchidos > 0
      ? `${preenchidos} campo(s) preenchido(s) com dados do formulário principal.`
      : 'Não há novos dados disponíveis ou os campos já estão preenchidos.');
  };

  // Confirmação de Leitura
  // Restaura campos ausentes no acesso de revisao a partir dos dados atuais do processo pai.
  useEffect(() => {
    if (!certificacaoConcluida || carregandoDadosPai || !Object.keys(camposProcessoPai).length) return;
    const lerCampoPai = (...nomes: string[]) => lerTextoProcesso(camposProcessoPai, ...nomes);
    const valoresPai = {
      nome: sanitizeInputText(lerCampoPai('coordNome', 'Nome Completo do Coordenador')),
      cpf: formatCPF(lerCampoPai('coordCpf', 'CPF')),
      rg: formatRG(lerCampoPai('coordRg', 'RG / Órgão Emissor')),
      departamento: sanitizeInputText(lerCampoPai('coordDepto', 'Departamento / Instituição', 'Departamento / Unidade USP')),
      email: sanitizeInputText(lerCampoPai('coordEmail', 'E-mail Institucional')),
      titulo: sanitizeInputText(lerCampoPai('titulo', 'tituloProjeto', 'Título', 'Título do Projeto', 'Título do Curso/Evento', 'Título do Projeto / Curso / Evento')),
    };
    if (!nomeCoordenador && valoresPai.nome) setNomeCoordenador(valoresPai.nome);
    if (!cpf && valoresPai.cpf) setCpf(valoresPai.cpf);
    if (!rg && valoresPai.rg) setRg(valoresPai.rg);
    if (!departamento && valoresPai.departamento) setDepartamento(valoresPai.departamento);
    if (!email && valoresPai.email) setEmail(valoresPai.email);
    if (!tituloProjeto && valoresPai.titulo) setTituloProjeto(valoresPai.titulo);
  }, [certificacaoConcluida, carregandoDadosPai, camposProcessoPai, nomeCoordenador, cpf, rg, departamento, email, tituloProjeto, setNomeCoordenador, setCpf, setRg, setDepartamento, setEmail, setTituloProjeto]);

  const [leuTermo, setLeuTermo] = useProcessoState('leuTermo', certificacaoConcluida);
  const [confirmado, setConfirmado] = useProcessoState('confirmado', certificacaoConcluida);
  const [dataCertificacao, setDataCertificacao] = useProcessoState<string | null>('dataCertificacao',
    dataSalva(assinaturaSalva, 'data')
  );
  const [horaCertificacao, setHoraCertificacao] = useProcessoState<string | null>('horaCertificacao',
    dataSalva(assinaturaSalva, 'hora')
  );
  const instrumentoRef = useRef<HTMLDivElement>(null);

  const codigoCertificacao = `FEALQ-LGPD-${protocolId}-${sessionId.slice(-6).toUpperCase()}`;

  const camposIdentificacaoValidos = [nomeCoordenador, cpf, departamento, email, tituloProjeto].every((valor) => valor.trim().length > 0);
  const validarIdentificacao = () => {
    if (camposIdentificacaoValidos) return true;
    setMensagemAutoPreenchimento('Preencha Nome, CPF, Departamento, E-mail e Título do Projeto antes de continuar.');
    return false;
  };

  const mostrarToastIdentificacao = () => {
    setToast('Necessário preencher os dados de Identificação');
    window.setTimeout(() => setToast(''), 3500);
  };

  const imprimirInstrumento = () => {
    const conteudo = instrumentoRef.current?.innerHTML;
    if (!conteudo) return;
    const frame = document.createElement('iframe');
    frame.setAttribute('title', 'Impressão do instrumento de confidencialidade');
    frame.style.position = 'fixed';
    frame.style.width = '1px';
    frame.style.height = '1px';
    frame.style.opacity = '0';
    frame.style.pointerEvents = 'none';
    frame.srcdoc = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Instrumento de Confidencialidade e LGPD</title><style>body{font-family:Arial,sans-serif;color:#111;line-height:1.55;margin:32px}h1{text-align:center;font-size:18px;border-bottom:1px solid #999;padding-bottom:12px}h2,h3,h4,h5{color:#123b57;margin-top:22px}p{font-size:12px}strong{font-weight:700}@media print{body{margin:18mm}}</style></head><body><h1>Instrumento de Confidencialidade e LGPD</h1>${conteudo}</body></html>`;
    frame.onload = () => {
      const janela = frame.contentWindow;
      if (!janela) return;
      janela.focus();
      janela.print();
      window.setTimeout(() => frame.remove(), 1000);
    };
    document.body.appendChild(frame);
  };

  const handleConfirmarLeitura = () => {
    if (!validarIdentificacao() || !leuTermo) return;
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

  const rawProtocolo = searchParams.get('protocolo');
  const protocoloUrlParam = rawProtocolo ? sanitizeProtocolId(rawProtocolo) : protocolId;
  const rotaSolicitada = searchParams.get('rota_retorno');
  const rotaRetorno = rotaSolicitada === '/projetos/form-pesquisa-v2' || rotaSolicitada === '/projetos/form-pesquisa'
    ? rotaSolicitada
    : rotaSolicitada === '/projetos/form-curso-evento' || rotaSolicitada === '/projetos/form-curso'
      ? rotaSolicitada
    : searchParams.get('retorno') === 'pesquisa' ? '/projetos/form-pesquisa' : '/projetos/form-curso';
  const processoPai = capturarProcessoPai(searchParams);
  const linkRetorno = getSafeReturnUrl(`${rotaRetorno}?protocolo=${encodeURIComponent(protocoloUrlParam)}${processoPai ? `&processo=${encodeURIComponent(processoPai)}` : ''}`);

  return (
    <FormPageLayout
      breadcrumb={['Área do Coordenador', 'Certificações', 'Termo de LGPD e Confidencialidade']}
      titulo="Termo de Compromisso e Confidencialidade de Dados (LGPD)"
      codigo="PRJ-LGP-005"
      badge="Obrigatório"
      acaoPrincipal={processoPai ? 'Concluir e Retornar ao Protocolo' : 'Concluir'}
      acaoIcone="verified"
      mostrarRascunho={!processoPai}
      permitirEnvioSemProcesso={Boolean(processoPai)}
      podeEnviar={confirmado}
      aoSubmeter={() => {
        navigate(linkRetorno);
      }}
      sidebar={
        <CertificacaoSidebarCard
          titulo="Status da Certificação"
          confirmado={confirmado}
          statusLabelConfirmado="Leitura Confirmada"
          statusLabelPendente="Leitura Obrigatória Pendente"
          mensagemConfirmado={`Termo certificado sob código ${codigoCertificacao}. Registrado e vinculado ao protocolo.`}
          mensagemPendente="A leitura integral e o aceite formal deste termo são requisitos legais para a submissão do protocolo."
          protocoloId={protocolId}
          carimboData={dataCertificacao}
          carimboHora={horaCertificacao}
          linkRetorno={linkRetorno}
          metaItems={[
            { label: 'Versão do Modelo', valor: 'Rev. 05 (FEALQ/USP)' },
          ]}
        >
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
        </CertificacaoSidebarCard>
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
          acao={<AutoPreencherButton onClick={preencherAutomaticamente} disabled={carregandoDadosPai || confirmado} />}
        >
          <p className="col-span-12 -mt-xs text-[12px] text-on-surface-variant">
            Dados autopreenchidos a partir do cadastro do coordenador e do protocolo de abertura.
          </p>
          {erroDadosPai && <p role="alert" className="col-span-12 -mt-xs text-[11px] font-semibold text-error">{erroDadosPai}</p>}
          {mensagemAutoPreenchimento && <p role="status" className="col-span-12 -mt-xs text-[11px] font-semibold text-secondary">{mensagemAutoPreenchimento}</p>}
          <Field
            label="Nome Completo do Coordenador"
            span={6}
            tipo="text"
            valor={nomeCoordenador}
            onChange={(val) => setNomeCoordenador(val)}
            disabled={confirmado}
            obrigatorio
          />
          <Field
            label="CPF"
            span={3}
            tipo="text"
            valor={cpf}
            onChange={(val) => setCpf(formatCPF(val))}
            disabled={confirmado}
            obrigatorio
          />
          <Field
            label="RG / Órgão Emissor"
            span={3}
            tipo="text"
            valor={rg}
            onChange={(val) => setRg(formatRG(val))}
            disabled={confirmado}
          />
          <Field
            label="Departamento / Unidade USP"
            span={6}
            tipo="text"
            valor={departamento}
            onChange={(val) => setDepartamento(val)}
            disabled={confirmado}
            obrigatorio
          />
          <Field
            label="E-mail Institucional"
            span={6}
            tipo="email"
            valor={email}
            onChange={(val) => setEmail(val)}
            disabled={confirmado}
            obrigatorio
          />
          <Field
            label="Título do Projeto / Curso / Evento"
            span={12}
            tipo="text"
            valor={tituloProjeto}
            onChange={(val) => setTituloProjeto(val)}
            disabled={confirmado}
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
          <div ref={instrumentoRef} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg text-[13px] text-on-surface leading-relaxed max-h-[460px] overflow-y-auto space-y-4 shadow-inner pr-4">
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
                onChange={(e) => {
                  if (e.target.checked) {
                    if (validarIdentificacao()) setLeuTermo(true);
                    else mostrarToastIdentificacao();
                  } else setLeuTermo(false);
                }}
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
                    onClick={imprimirInstrumento}
                    className="px-md py-2 text-[12px] font-medium border border-green-600 text-green-800 rounded bg-white hover:bg-green-50 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    Imprimir Comprovante
                  </button>
                  {processoPai && <Link
                    to={linkRetorno}
                    className="px-md py-2 text-[12px] font-semibold text-white bg-green-700 rounded hover:bg-green-800 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Voltar ao Protocolo
                  </Link>}
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
                  disabled={!leuTermo || !camposIdentificacaoValidos}
                  onClick={handleConfirmarLeitura}
                  className={`px-lg py-2.5 rounded font-semibold text-[13px] flex items-center gap-2 transition-all ${
                    leuTermo && camposIdentificacaoValidos
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
      {toast && <div role="status" aria-live="assertive" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-error px-4 py-3 text-sm font-semibold text-white shadow-lg">{toast}</div>}
    </FormPageLayout>
  );
};
