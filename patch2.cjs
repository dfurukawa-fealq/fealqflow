const fs = require('fs');
let code = fs.readFileSync('src/components/KitDocumental.tsx', 'utf8');

if (!code.includes('ModalRegulamento')) {
  code = code.replace("import { useEnvio } from './form/EnvioContext';", 
    "import { useEnvio } from './form/EnvioContext';\nimport { ModalRegulamento } from './ModalRegulamento';");

  // In ItemDocumento:
  code = code.replace("const ItemDocumento = ({ doc, arquivo, onSelecionar, isConcluido }: ItemDocumentoProps) => {",
    "const ItemDocumento = ({ doc, arquivo, onSelecionar, isConcluido }: ItemDocumentoProps) => {\n  const [showRegulamento, setShowRegulamento] = useState(false);");

  // Ações for Aceite
  code = code.replace("{!gerado && doc.tipo !== 'externo' && (",
    "{!gerado && doc.tipo !== 'externo' && doc.tipo !== 'aceite' && (\n");

  code = code.replace("{/* Coluna 3: Ações (Modelo, Anexar/Remover) */}",
`{/* Coluna 3: Ações (Modelo, Anexar/Remover) */}
        {doc.tipo === 'aceite' && (
          <div className="w-[40px] shrink-0 flex flex-col items-center justify-center gap-1 border-l border-outline-variant/30 py-1">
            <button
              onClick={() => setShowRegulamento(true)}
              className="text-primary-container hover:bg-surface-variant flex items-center justify-center w-7 h-7 rounded-full transition-colors shrink-0"
              title={concluido ? 'Ver Regulamento' : 'Ler e Aceitar Regulamento'}
            >
              <span className="material-symbols-outlined text-[18px] inline-block scale-[0.8] origin-center">
                {concluido ? 'visibility' : 'contract'}
              </span>
            </button>
          </div>
        )}
        {doc.tipo === 'aceite' && showRegulamento && (
          <ModalRegulamento
            jaAceito={concluido}
            onClose={() => setShowRegulamento(false)}
            onAceitar={() => onSelecionar(new File(['aceito'], 'Aceite.txt', { type: 'text/plain' }))}
          />
        )}`);

  // Handle display of name when accepted
  code = code.replace("{arquivo && (\n            <div className=\"-ml-[26px]\">\n               <ArquivoSelecionado arquivo={arquivo} />\n            </div>\n          )}",
`{arquivo && doc.tipo !== 'aceite' && (
            <div className="-ml-[26px]">
               <ArquivoSelecionado arquivo={arquivo} />
            </div>
          )}
          {concluido && doc.tipo === 'aceite' && (
            <div className="flex items-center gap-1 mt-1 text-secondary text-[10px] font-bold uppercase">
              <span className="material-symbols-outlined text-[14px]">task_alt</span>
              Termos Aceitos
            </div>
          )}`);

  fs.writeFileSync('src/components/KitDocumental.tsx', code);
}
