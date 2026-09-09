const fs = require('fs');

let layoutCode = fs.readFileSync('src/components/form/FormPageLayout.tsx', 'utf8');

const regex = /<div className="flex items-center gap-sm">\s*\{botoesAcoes\}/;

const newWarningStr = `{/* Alerta de Trava de Envio movido para o footer */}
          {!liberado && (
            <div className="flex items-center justify-center gap-2 bg-[#F17C58] text-white text-xs px-3 h-[26px] rounded-md shadow-xs whitespace-nowrap mx-auto animate-pulse">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>
                <strong>Trava de Envio Ativa:</strong> O sistema bloqueia envios incompletos. Regularize as pendências abaixo.
              </span>
            </div>
          )}

          <div className="flex items-center gap-sm">
            {botoesAcoes}`;

if (regex.test(layoutCode)) {
  layoutCode = layoutCode.replace(regex, newWarningStr);
  fs.writeFileSync('src/components/form/FormPageLayout.tsx', layoutCode);
  console.log('Warning moved to footer successfully');
} else {
  console.log('Still not found with regex');
}
