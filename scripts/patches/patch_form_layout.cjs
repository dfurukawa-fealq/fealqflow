const fs = require('fs');
let code = fs.readFileSync('src/components/form/FormPageLayout.tsx', 'utf8');

if (!code.includes("useLayout")) {
  code = "import { useLayout } from '../../contexts/LayoutContext';\n" + code;
  code = code.replace("const navigate = useNavigate();", "const navigate = useNavigate();\n  const { showSidebar } = useLayout();");
  code = code.replace("className=\"fixed bottom-0 left-sidebar-width right-0", "className={`fixed bottom-0 right-0 z-30 flex items-center justify-between gap-md border-t border-outline-variant bg-surface-container-lowest p-md px-xl print:hidden ${showSidebar ? 'left-sidebar-width' : 'left-0'}`");
  // Also we need to replace the exact old className if it matches exactly. Let's do it manually if it doesn't match exactly.
  fs.writeFileSync('src/components/form/FormPageLayout.tsx', code);
  console.log("FormPageLayout patched");
}
