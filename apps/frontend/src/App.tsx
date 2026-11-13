/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';

// Projetos
import {
  ProjetosPage,
  CadastroCoordenador,
  AberturaCurso,
  AberturaPublicacao,
  ProjetoPesquisa,
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
import { ProcessoRoute } from './contexts/ProcessoContext';
import { AdminProvider } from './contexts/AdminContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { RequireAdmin } from './components/auth/RequireAdmin';
import { RequireArea } from './components/auth/RequireArea';
import { RequireSessao } from './components/auth/RequireSessao';
import { AdminLogin } from './pages/admin/AdminLogin';
import { GestaoFormularios } from './pages/admin/GestaoFormularios';
import { GestaoDocumentos } from './pages/admin/GestaoDocumentos';
import { GestaoUsuarios } from './pages/admin/GestaoUsuarios';
import { GestaoUnidades } from './pages/admin/GestaoUnidades';
import { GestaoKits } from './pages/admin/GestaoKits';
import { GestaoKitDetalhe } from './pages/admin/GestaoKitDetalhe';
import { Home } from './pages/Home';

const AppRoutes = () => {
  const location = useLocation();
  const { usuario } = useUser();
  const rotaFormulario = /^\/projetos\/(form-|termo-lgpd|orientacoes-coordenador|ciencia-departamento)/.test(location.pathname)
    || /^\/programas-de-apoio\/apoio-/.test(location.pathname);
  const mostrarSidebar = Boolean(usuario) || !rotaFormulario;
  const alturaShellFormulario = rotaFormulario
    ? 'h-dvh overflow-hidden print:h-auto print:overflow-visible'
    : 'min-h-screen';
  const alturaConteudoFormulario = rotaFormulario
    ? 'h-full min-h-0 overflow-hidden print:h-auto print:overflow-visible'
    : 'min-h-screen';

  return (
    <div className={`flex ${alturaShellFormulario}`}>
      {mostrarSidebar && <div className="hidden lg:block print:hidden"><Sidebar /></div>}
      <div className={`flex ${alturaConteudoFormulario} min-w-0 flex-1 flex-col ${mostrarSidebar ? 'lg:ml-[240px]' : ''} print:ml-0`}>
        <Routes>

            {/* Default root routes to Programas de Apoio requests panel as specified */}
            <Route path="/" element={<Home />} />
            <Route path="/historico" element={<RequireSessao><HistoricoPendencias /></RequireSessao>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/formularios" element={<RequireAdmin><GestaoFormularios /></RequireAdmin>} />
            <Route path="/admin/documentos" element={<RequireAdmin><GestaoDocumentos /></RequireAdmin>} />
            <Route path="/admin/unidades" element={<RequireAdmin><GestaoUnidades /></RequireAdmin>} />
            <Route path="/admin/kits" element={<RequireAdmin><GestaoKits /></RequireAdmin>} />
            <Route path="/kit/novo" element={<RequireAdmin><GestaoKitDetalhe /></RequireAdmin>} />
            <Route path="/kit/:id" element={<RequireAdmin><GestaoKitDetalhe /></RequireAdmin>} />
            <Route path="/admin/usuarios" element={<RequireAdmin><GestaoUsuarios /></RequireAdmin>} />

            {/* Projetos Routes */}
            <Route path="/projetos/painel" element={<RequireSessao><RequireArea area="projeto"><PainelSolicitacoesProjetos /></RequireArea></RequireSessao>} />
            <Route path="/projetos/solicitacoes" element={<Navigate to="/projetos/painel" replace />} />
            <Route path="/projetos" element={<RequireArea area="projeto"><ProjetosPage /></RequireArea>} />
            <Route path="/projetos/form-coordenador" element={<ProcessoRoute><CadastroCoordenador /></ProcessoRoute>} />
            <Route path="/projetos/form-curso" element={<ProcessoRoute><AberturaCurso /></ProcessoRoute>} />
            <Route path="/projetos/form-evento" element={<ProcessoRoute><AberturaCurso /></ProcessoRoute>} />
            <Route path="/projetos/form-curso-evento" element={<ProcessoRoute><AberturaCurso /></ProcessoRoute>} />
            <Route path="/projetos/form-publicacao" element={<ProcessoRoute><AberturaPublicacao /></ProcessoRoute>} />
            <Route path="/projetos/form-pesquisa" element={<ProcessoRoute><ProjetoPesquisa /></ProcessoRoute>} />
            <Route path="/projetos/form-pesquisa-v2" element={<ProcessoRoute><ProjetoPesquisa /></ProcessoRoute>} />
            <Route path="/projetos/form-trabalho" element={<ProcessoRoute><PlanoTrabalho /></ProcessoRoute>} />
            <Route path="/projetos/form-patrocinador" element={<ProcessoRoute><CadastroPatrocinador /></ProcessoRoute>} />
            <Route path="/projetos/form-parceiro" element={<ProcessoRoute><CadastroParceiro /></ProcessoRoute>} />
            <Route path="/projetos/form-cotas" element={<ProcessoRoute><CotasPatrocinio /></ProcessoRoute>} />
            <Route path="/projetos/form-financiadora" element={<ProcessoRoute><CadastroFinanciadora /></ProcessoRoute>} />
            <Route path="/projetos/form-plano-recursos" element={<ProcessoRoute><PlanoAplicacaoRecursos /></ProcessoRoute>} />
            <Route path="/projetos/form-programa-epe" element={<ProcessoRoute><AberturaProgramaEPE /></ProcessoRoute>} />
            <Route path="/projetos/form-central" element={<ProcessoRoute><CentralMultiusuario /></ProcessoRoute>} />
            <Route path="/projetos/termo-lgpd" element={<ProcessoRoute><TermoLGPDConfidencialidade /></ProcessoRoute>} />
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
            <Route path="/programas-de-apoio/painel" element={<RequireSessao><RequireArea area="apoio"><PainelSolicitacoesApoio /></RequireArea></RequireSessao>} />
            <Route path="/programas-de-apoio/solicitacoes" element={<Navigate to="/programas-de-apoio/painel" replace />} />
            <Route path="/programas-de-apoio" element={<RequireArea area="apoio"><ProgramasApoioPage /></RequireArea>} />
            <Route path="/programas" element={<Navigate to="/programas-de-apoio" replace />} />
            <Route path="/programas-de-apoio/apoio-bolsa-pos" element={<ProcessoRoute><BolsaPosGraduacao /></ProcessoRoute>} />
            <Route path="/programas-de-apoio/apoio-bolsa-grad" element={<ProcessoRoute><BolsaGraduacao /></ProcessoRoute>} />
            <Route path="/programas-de-apoio/apoio-infra" element={<ProcessoRoute><ApoioInfraestrutura /></ProcessoRoute>} />
            <Route path="/programas-de-apoio/apoio-evento-trabalho" element={<ProcessoRoute><ApresentacaoEvento /></ProcessoRoute>} />
            <Route path="/programas-de-apoio/apoio-viagem" element={<ProcessoRoute><AuxilioViagem /></ProcessoRoute>} />
            <Route path="/programas-de-apoio/apoio-publicacao" element={<ProcessoRoute><AuxilioPublicacao /></ProcessoRoute>} />
            <Route path="/programas-de-apoio/apoio-comunidade" element={<ProcessoRoute><InteresseComunidade /></ProcessoRoute>} />
            <Route path="/programas-de-apoio/apoio-material-evento" element={<ProcessoRoute><MaterialEventos /></ProcessoRoute>} />
            <Route path="/programas-de-apoio/apoio-cultura" element={<ProcessoRoute><CulturaExtensao /></ProcessoRoute>} />

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
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <RastreabilidadeProvider>
        <AdminProvider>
          <UserProvider>
            <AppRoutes />
          </UserProvider>
        </AdminProvider>
      </RastreabilidadeProvider>
    </BrowserRouter>
  );
}
