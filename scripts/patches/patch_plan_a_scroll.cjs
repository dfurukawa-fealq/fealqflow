const fs = require('fs');
let code = fs.readFileSync('scripts/patches/patch_generate_plan_a_exact.ts', 'utf8');

// Update content div to have an ID
code = code.replace(
  '<div class="flex-1 overflow-y-auto p-6 lg:p-8 bg-surface-container-lowest text-on-surface text-sm leading-relaxed space-y-6">',
  '<div id="modal-regulamento-content" class="flex-1 overflow-y-auto p-6 lg:p-8 bg-surface-container-lowest text-on-surface text-sm leading-relaxed space-y-6">'
);

// Update accept button to be disabled by default
code = code.replace(
  '<button id="modal-regulamento-aceitar" class="px-6 py-2 text-sm font-bold bg-primary text-on-primary hover:bg-primary/90 rounded transition-colors shadow-sm">Li e Aceito</button>',
  '<button id="modal-regulamento-aceitar" disabled class="px-6 py-2 text-sm font-bold bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-70 rounded transition-colors shadow-sm">Li e Aceito</button>'
);

// Add scroll listener in JS
const newLogic = `
      const modalContent = document.getElementById('modal-regulamento-content');
      const btnAceitar = document.getElementById('modal-regulamento-aceitar');
      let canAccept = false;
      
      const checkScroll = () => {
        if (canAccept) return;
        if (modalContent.scrollHeight - modalContent.scrollTop - modalContent.clientHeight < 20) {
          canAccept = true;
          btnAceitar.disabled = false;
          btnAceitar.className = "px-6 py-2 text-sm font-bold bg-primary text-on-primary hover:bg-primary/90 rounded transition-colors shadow-sm";
        }
      };

      modalContent.addEventListener('scroll', checkScroll);
`;

code = code.replace("const modalReg = document.getElementById('modal-regulamento');", 
  "const modalReg = document.getElementById('modal-regulamento');\n" + newLogic);

// Add logic to trigger check on open (in case content is short)
code = code.replace("currentAceiteId = btn.getAttribute('data-id');", 
  "currentAceiteId = btn.getAttribute('data-id');\n            canAccept = false;\n            btnAceitar.disabled = true;\n            btnAceitar.className = \"px-6 py-2 text-sm font-bold bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-70 rounded transition-colors shadow-sm\";\n            setTimeout(checkScroll, 100);");

fs.writeFileSync('scripts/patches/patch_generate_plan_a_exact.ts', code);
