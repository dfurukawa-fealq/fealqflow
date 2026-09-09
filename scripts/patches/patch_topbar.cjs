const fs = require('fs');
let code = fs.readFileSync('src/components/form/FormPageLayout.tsx', 'utf8');

code = code.replace('<TopBar />', '<TopBar title={showSidebar ? "" : "FealqFlow - Portal de Formulários"} />');
fs.writeFileSync('src/components/form/FormPageLayout.tsx', code);
