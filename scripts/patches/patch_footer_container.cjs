const fs = require('fs');
let code = fs.readFileSync('src/components/form/FormPageLayout.tsx', 'utf8');

const oldFooterStart = `<footer className={\`fixed bottom-0 right-0 z-30 flex items-center justify-between gap-md border-t border-outline-variant bg-surface-container-lowest p-md px-xl print:hidden \${showSidebar ? 'left-sidebar-width' : 'left-0'}\`}>`;

const newFooterStart = `<footer className={\`fixed bottom-0 right-0 z-30 border-t border-outline-variant bg-surface-container-lowest print:hidden \${showSidebar ? 'left-sidebar-width' : 'left-0'}\`}>
          <div className="w-full max-w-[1200px] mx-auto px-xl py-md flex justify-between items-center gap-md">`;

const oldFooterEnd = `        </footer>`;
const newFooterEnd = `          </div>
        </footer>`;

if (code.includes(oldFooterStart)) {
  code = code.replace(oldFooterStart, newFooterStart);
  code = code.replace(oldFooterEnd, newFooterEnd);
  fs.writeFileSync('src/components/form/FormPageLayout.tsx', code);
  console.log("Footer container fixed");
} else {
  console.log("oldFooterStart not found");
}
