const fs = require('fs');
let code = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

if (!code.includes("LayoutProvider")) {
  code = "import { LayoutProvider } from '../contexts/LayoutContext';\n" + code;
  code = code.replace("{children}", "<LayoutProvider showSidebar={showSidebar}>{children}</LayoutProvider>");
  fs.writeFileSync('src/layouts/MainLayout.tsx', code);
  console.log("MainLayout patched");
}
