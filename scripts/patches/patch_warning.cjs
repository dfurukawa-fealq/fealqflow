const fs = require('fs');

// 1. Remove from TopBar
let topbarCode = fs.readFileSync('src/components/TopBar.tsx', 'utf8');
const oldWarning = `      {/* 2. Centro (Alerta Centralizado Integrado) */}
      <div className="flex items-center justify-center gap-2 bg-[#F17C58] text-white text-xs px-3 h-[26px] rounded-md shadow-xs whitespace-nowrap">
        <span className="material-symbols-outlined text-[16px]">warning</span>
        <span>
          <strong>Trava de Envio Ativa:</strong> O sistema bloqueia envios incompletos. Regularize as pendências abaixo.
        </span>
      </div>`;
topbarCode = topbarCode.replace(oldWarning, '');
fs.writeFileSync('src/components/TopBar.tsx', topbarCode);

// 2. Add to FormPageLayout
let layoutCode = fs.readFileSync('src/components/form/FormPageLayout.tsx', 'utf8');

const targetStr = `          <div className="flex items-center gap-sm">
            {botoesAcoes}`;

const newWarningStr = `          {/* Alerta de Trava de Envio movido para o footer */}
          {!liberado && (
            <div className="flex items-center justify-center gap-2 bg-[#F17C58] text-white text-xs px-3 h-[26px] rounded-md shadow-xs whitespace-nowrap">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>
                <strong>Trava de Envio Ativa:</strong> O sistema bloqueia envios incompletos. Regularize as pendências.
              </span>
            </div>
          )}

          <div className="flex items-center gap-sm">
            {botoesAcoes}`;

if (layoutCode.includes(targetStr)) {
  layoutCode = layoutCode.replace(targetStr, newWarningStr);
  fs.writeFileSync('src/components/form/FormPageLayout.tsx', layoutCode);
  console.log('Warning moved to footer successfully');
} else {
  console.log('Target string not found in FormPageLayout');
}
