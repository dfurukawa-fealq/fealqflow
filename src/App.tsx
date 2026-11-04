/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';

// Projetos
import {
  ProjetosPage,
  CadastroCoordenador,
  AberturaCurso,
  AberturaPublicacao,
  ProjetoPesquisa,
  ProjetoPesquisaV2,
  PlanoTrabalho,
  CadastroPatrocinador,
  CadastroParceiro,
  CotasPatrocinio,
  CadastroFinanciadora,
  PlanoAplicacaoRecursos,
  AberturaProgramaEPE,
  CentralMultiusuario,
  TermoLGPDConfidencialidade,
  OrientacoesCoordenador,
  CienciaConcordanciaDepto,
  PainelSolicitacoesProjetos,
} from './pages/projetos';

// Programas de Apoio
import {
  ProgramasApoioPage,
  BolsaPosGraduacao,
  BolsaGraduacao,
  ApoioInfraestrutura,
  ApresentacaoEvento,
  AuxilioViagem,
  AuxilioPublicacao,
  InteresseComunidade,
  MaterialEventos,
  CulturaExtensao,
  PainelSolicitacoesApoio,
} from './pages/programas-de-apoio';

import { HistoricoPendencias } from './pages/HistoricoPendencias';
import { RastreabilidadeProvider } from './contexts/RastreabilidadeContext';

export default function App() {
  return (
    <BrowserRouter>
      <RastreabilidadeProvider>
        <div className="flex min-h-screen">
          <div className="hidden lg:block print:hidden">
            <Sidebar />
          </div>
          <div className="flex-1 lg:ml-[240px] print:ml-0 flex flex-col min-h-screen min-w-0">
            <Routes>
            {/* Default root routes to Programas de Apoio requests panel as specified */}
            <Route path="/" element={<PainelSolicitacoesApoio />} />
            <Route path="/historico" element={<HistoricoPendencias />} />

            {/* Projetos Routes */}
            <Route path="/projetos/painel" element={<PainelSolicitacoesProjetos />} />
            <Route path="/projetos/solicitacoes" element={<Navigate to="/projetos/painel" replace />} />
            <Route path="/projetos" element={<ProjetosPage />} />
            <Route path="/projetos/form-coordenador" element={<CadastroCoordenador />} />
            <Route path="/projetos/form-curso" element={<AberturaCurso />} />
            <Route path="/projetos/form-evento" element={<AberturaCurso />} />
            <Route path="/projetos/form-curso-evento" element={<AberturaCurso />} />
            <Route path="/projetos/form-publicacao" element={<AberturaPublicacao />} />
            <Route path="/projetos/form-pesquisa" element={<ProjetoPesquisa />} />
            <Route path="/projetos/form-pesquisa-v2" element={<ProjetoPesquisaV2 />} />
            <Route path="/projetos/form-trabalho" element={<PlanoTrabalho />} />
            <Route path="/projetos/form-patrocinador" element={<CadastroPatrocinador />} />
            <Route path="/projetos/form-parceiro" element={<CadastroParceiro />} />
            <Route path="/projetos/form-cotas" element={<CotasPatrocinio />} />
            <Route path="/projetos/form-financiadora" element={<CadastroFinanciadora />} />
            <Route path="/projetos/form-plano-recursos" element={<PlanoAplicacaoRecursos />} />
            <Route path="/projetos/form-programa-epe" element={<AberturaProgramaEPE />} />
            <Route path="/projetos/form-central" element={<CentralMultiusuario />} />
            <Route path="/projetos/termo-lgpd" element={<TermoLGPDConfidencialidade />} />
            <Route path="/projetos/orientacoes-coordenador" element={<OrientacoesCoordenador />} />
            <Route path="/projetos/ciencia-departamento" element={<CienciaConcordanciaDepto />} />

            {/* Certificações direct and legacy aliases */}
            <Route path="/certificacoes/termo-lgpd" element={<Navigate to="/projetos/termo-lgpd" replace />} />
            <Route path="/certificacoes/orientacoes-coordenador" element={<Navigate to="/projetos/orientacoes-coordenador" replace />} />
            <Route path="/certificacoes/ciencia-departamento" element={<Navigate to="/projetos/ciencia-departamento" replace />} />
            <Route path="/form-termo-lgpd" element={<Navigate to="/projetos/termo-lgpd" replace />} />
            <Route path="/form-orientacoes-coordenador" element={<Navigate to="/projetos/orientacoes-coordenador" replace />} />
            <Route path="/form-ciencia-departamento" element={<Navigate to="/projetos/ciencia-departamento" replace />} />

            {/* Legacy compatibility for direct /form-* */}
            <Route path="/form-coordenador" element={<Navigate to="/projetos/form-coordenador" replace />} />
            <Route path="/form-curso" element={<Navigate to="/projetos/form-curso" replace />} />
            <Route path="/form-publicacao" element={<Navigate to="/projetos/form-publicacao" replace />} />
            <Route path="/form-pesquisa" element={<Navigate to="/projetos/form-pesquisa" replace />} />
            <Route path="/form-pesquisa-v2" element={<Navigate to="/projetos/form-pesquisa-v2" replace />} />
            <Route path="/form-trabalho" element={<Navigate to="/projetos/form-trabalho" replace />} />
            <Route path="/form-patrocinador" element={<Navigate to="/projetos/form-patrocinador" replace />} />
            <Route path="/form-parceiro" element={<Navigate to="/projetos/form-parceiro" replace />} />
            <Route path="/form-cotas" element={<Navigate to="/projetos/form-cotas" replace />} />
            <Route path="/form-financiadora" element={<Navigate to="/projetos/form-financiadora" replace />} />
            <Route path="/form-plano-recursos" element={<Navigate to="/projetos/form-plano-recursos" replace />} />
            <Route path="/form-programa-epe" element={<Navigate to="/projetos/form-programa-epe" replace />} />
            <Route path="/form-central" element={<Navigate to="/projetos/form-central" replace />} />

            {/* Programas de Apoio Routes */}
            <Route path="/programas-de-apoio/painel" element={<PainelSolicitacoesApoio />} />
            <Route path="/programas-de-apoio/solicitacoes" element={<Navigate to="/programas-de-apoio/painel" replace />} />
            <Route path="/programas-de-apoio" element={<ProgramasApoioPage />} />
            <Route path="/programas" element={<Navigate to="/programas-de-apoio" replace />} />
            <Route path="/programas-de-apoio/apoio-bolsa-pos" element={<BolsaPosGraduacao />} />
            <Route path="/programas-de-apoio/apoio-bolsa-grad" element={<BolsaGraduacao />} />
            <Route path="/programas-de-apoio/apoio-infra" element={<ApoioInfraestrutura />} />
            <Route path="/programas-de-apoio/apoio-evento-trabalho" element={<ApresentacaoEvento />} />
            <Route path="/programas-de-apoio/apoio-viagem" element={<AuxilioViagem />} />
            <Route path="/programas-de-apoio/apoio-publicacao" element={<AuxilioPublicacao />} />
            <Route path="/programas-de-apoio/apoio-comunidade" element={<InteresseComunidade />} />
            <Route path="/programas-de-apoio/apoio-material-evento" element={<MaterialEventos />} />
            <Route path="/programas-de-apoio/apoio-cultura" element={<CulturaExtensao />} />

            {/* Legacy compatibility for direct /apoio-* */}
            <Route path="/apoio-bolsa-pos" element={<Navigate to="/programas-de-apoio/apoio-bolsa-pos" replace />} />
            <Route path="/apoio-bolsa-grad" element={<Navigate to="/programas-de-apoio/apoio-bolsa-grad" replace />} />
            <Route path="/apoio-infra" element={<Navigate to="/programas-de-apoio/apoio-infra" replace />} />
            <Route path="/apoio-evento-trabalho" element={<Navigate to="/programas-de-apoio/apoio-evento-trabalho" replace />} />
            <Route path="/apoio-viagem" element={<Navigate to="/programas-de-apoio/apoio-viagem" replace />} />
            <Route path="/apoio-publicacao" element={<Navigate to="/programas-de-apoio/apoio-publicacao" replace />} />
            <Route path="/apoio-comunidade" element={<Navigate to="/programas-de-apoio/apoio-comunidade" replace />} />
            <Route path="/apoio-material-evento" element={<Navigate to="/programas-de-apoio/apoio-material-evento" replace />} />
            <Route path="/apoio-cultura" element={<Navigate to="/programas-de-apoio/apoio-cultura" replace />} />
          </Routes>
        </div>
      </div>
      </RastreabilidadeProvider>
    </BrowserRouter>
  );
}
