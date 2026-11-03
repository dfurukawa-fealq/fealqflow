/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ProjetosPage } from './pages/ProjetosPage';
import { ProgramasApoioPage } from './pages/ProgramasApoioPage';

import { CadastroCoordenador } from './pages/CadastroCoordenador';
import { AberturaCurso } from './pages/AberturaCurso';
import { AberturaPublicacao } from './pages/AberturaPublicacao';
import { ProjetoPesquisa } from './pages/ProjetoPesquisa';
import { ProjetoPesquisaV2 } from './pages/ProjetoPesquisaV2';
import { PlanoTrabalho } from './pages/PlanoTrabalho';
import { CadastroPatrocinador } from './pages/CadastroPatrocinador';
import { CadastroParceiro } from './pages/CadastroParceiro';
import { CotasPatrocinio } from './pages/CotasPatrocinio';
import { CadastroFinanciadora } from './pages/CadastroFinanciadora';
import { PlanoAplicacaoRecursos } from './pages/PlanoAplicacaoRecursos';
import { AuxilioViagem } from './pages/AuxilioViagem';
import { AuxilioPublicacao } from './pages/AuxilioPublicacao';
import { AberturaProgramaEPE } from './pages/AberturaProgramaEPE';
import { CentralMultiusuario } from './pages/CentralMultiusuario';
import { BolsaPosGraduacao } from './pages/BolsaPosGraduacao';
import { BolsaGraduacao } from './pages/BolsaGraduacao';
import { ApoioInfraestrutura } from './pages/ApoioInfraestrutura';
import { ApresentacaoEvento } from './pages/ApresentacaoEvento';
import { InteresseComunidade } from './pages/InteresseComunidade';
import { MaterialEventos } from './pages/MaterialEventos';
import { CulturaExtensao } from './pages/CulturaExtensao';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <div className="print:hidden"><Sidebar /></div>
        <div className="flex-1 ml-[240px] print:ml-0 flex flex-col min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projetos" element={<ProjetosPage />} />
            <Route path="/programas" element={<ProgramasApoioPage />} />
            <Route path="/historico" element={<Dashboard />} />

            {/* Forms mapped based on original static screens */}
            <Route path="/form-coordenador" element={<CadastroCoordenador />} />
            <Route path="/form-curso" element={<AberturaCurso />} />
            <Route path="/form-publicacao" element={<AberturaPublicacao />} />
            <Route path="/form-pesquisa" element={<ProjetoPesquisa />} />
            <Route path="/form-pesquisa-v2" element={<ProjetoPesquisaV2 />} />
            <Route path="/form-trabalho" element={<PlanoTrabalho />} />
            <Route path="/form-patrocinador" element={<CadastroPatrocinador />} />
            <Route path="/form-parceiro" element={<CadastroParceiro />} />
            <Route path="/form-cotas" element={<CotasPatrocinio />} />
            <Route path="/form-financiadora" element={<CadastroFinanciadora />} />
            <Route path="/form-plano-recursos" element={<PlanoAplicacaoRecursos />} />
            <Route path="/form-programa-epe" element={<AberturaProgramaEPE />} />
            <Route path="/form-central" element={<CentralMultiusuario />} />

            {/* Support Programs */}
            <Route path="/apoio-bolsa-pos" element={<BolsaPosGraduacao />} />
            <Route path="/apoio-bolsa-grad" element={<BolsaGraduacao />} />
            <Route path="/apoio-infra" element={<ApoioInfraestrutura />} />
            <Route path="/apoio-evento-trabalho" element={<ApresentacaoEvento />} />
            <Route path="/apoio-viagem" element={<AuxilioViagem />} />
            <Route path="/apoio-publicacao" element={<AuxilioPublicacao />} />
            <Route path="/apoio-comunidade" element={<InteresseComunidade />} />
            <Route path="/apoio-material-evento" element={<MaterialEventos />} />
            <Route path="/apoio-cultura" element={<CulturaExtensao />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
