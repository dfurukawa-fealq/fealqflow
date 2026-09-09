const fs = require('fs');
let code = fs.readFileSync('src/components/form/FormPageLayout.tsx', 'utf8');

const badFooter = "className={`fixed bottom-0 right-0 z-30 flex items-center justify-between gap-md border-t border-outline-variant bg-surface-container-lowest p-md px-xl print:hidden ${showSidebar ? 'left-sidebar-width' : 'left-0'}` bg-surface-container-lowest border-t border-outline-variant p-md px-xl flex justify-between items-center gap-md z-30 print:hidden\">";
const goodFooter = "className={`fixed bottom-0 right-0 z-30 flex items-center justify-between gap-md border-t border-outline-variant bg-surface-container-lowest p-md px-xl print:hidden ${showSidebar ? 'left-sidebar-width' : 'left-0'}`}>";

if (code.includes(badFooter)) {
  code = code.replace(badFooter, goodFooter);
  fs.writeFileSync('src/components/form/FormPageLayout.tsx', code);
  console.log("Footer fixed");
}
