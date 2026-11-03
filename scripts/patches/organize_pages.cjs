const fs = require('fs');
const path = require('path');

const srcPages = path.join(__dirname, '../../src/pages');
const projetosDir = path.join(srcPages, 'projetos');
const programasDir = path.join(srcPages, 'programas-de-apoio');

if (!fs.existsSync(projetosDir)) fs.mkdirSync(projetosDir, { recursive: true });
if (!fs.existsSync(programasDir)) fs.mkdirSync(programasDir, { recursive: true });

const projetosFiles = [
  'CadastroCoordenador.tsx',
  'AberturaCurso.tsx',
  'AberturaPublicacao.tsx',
  'ProjetoPesquisa.tsx',
  'ProjetoPesquisaV2.tsx',
  'PlanoTrabalho.tsx',
  'CadastroPatrocinador.tsx',
  'CadastroParceiro.tsx',
  'CotasPatrocinio.tsx',
  'CadastroFinanciadora.tsx',
  'PlanoAplicacaoRecursos.tsx',
  'PlanoAplicacaoRecursos_Calculos.tsx',
  'AberturaProgramaEPE.tsx',
  'CentralMultiusuario.tsx',
  'ProjetosPage.tsx'
];

const programasFiles = [
  'ProgramasApoioPage.tsx',
  'BolsaPosGraduacao.tsx',
  'BolsaGraduacao.tsx',
  'ApoioInfraestrutura.tsx',
  'ApresentacaoEvento.tsx',
  'AuxilioViagem.tsx',
  'AuxilioPublicacao.tsx',
  'InteresseComunidade.tsx',
  'MaterialEventos.tsx',
  'CulturaExtensao.tsx'
];

function moveAndFixImports(files, targetDir) {
  for (const file of files) {
    const oldPath = path.join(srcPages, file);
    const newPath = path.join(targetDir, file);
    if (fs.existsSync(oldPath)) {
      let content = fs.readFileSync(oldPath, 'utf8');
      
      // Fix imports: '../components/' -> '../../components/', etc.
      content = content.replace(/from '\.\.\/components\//g, "from '../../components/");
      content = content.replace(/from '\.\.\/data\//g, "from '../../data/");
      content = content.replace(/from '\.\.\/contexts\//g, "from '../../contexts/");
      content = content.replace(/from '\.\.\/types\//g, "from '../../types/");
      content = content.replace(/from "\.\.\/components\//g, 'from "../../components/');
      content = content.replace(/from "\.\.\/data\//g, 'from "../../data/');
      content = content.replace(/from "\.\.\/contexts\//g, 'from "../../contexts/');
      content = content.replace(/from "\.\.\/types\//g, 'from "../../types/');

      fs.writeFileSync(newPath, content, 'utf8');
      fs.unlinkSync(oldPath);
      console.log(`Moved ${file} -> ${path.relative(srcPages, newPath)}`);
    } else {
      console.log(`File ${file} not found in root pages dir or already moved.`);
    }
  }
}

moveAndFixImports(projetosFiles, projetosDir);
moveAndFixImports(programasFiles, programasDir);

console.log('Finished moving and updating imports.');
