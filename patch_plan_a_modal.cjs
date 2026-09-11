const fs = require('fs');

let code = fs.readFileSync('scripts/patches/patch_generate_plan_a_exact.ts', 'utf8');

if (!code.includes('isAberto') || !code.includes('Período de Submissão Encerrado')) {
  
  // Create a block of HTML and JS for Plan A
  const planAModalHtml = `
      <!-- Modal Bloqueio de Período -->
      <div id="modal-periodo" class="fixed inset-0 z-[100] hidden flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div class="bg-surface rounded-xl p-lg w-[90vw] sm:w-[440px] max-w-[440px] shadow-2xl flex flex-col gap-lg border border-outline-variant text-center">
          <div class="flex flex-col items-center gap-2 text-error font-bold text-[20px]">
            <span class="material-symbols-outlined text-[48px]">event_busy</span>
            Período de Submissão Encerrado
          </div>
          
          <div class="text-[14px] text-on-surface-variant flex flex-col gap-4">
            <p>
              Este formulário encontra-se <strong>fora do período de submissão</strong>.
            </p>
            
            <div class="bg-surface-container-low p-4 rounded-lg border border-outline-variant/50 text-left">
              <span class="font-bold text-primary-container text-[12px] uppercase tracking-wide block mb-2">
                Períodos Válidos:
              </span>
              <ul id="periodos-lista" class="list-disc pl-5 flex flex-col gap-1 text-[13px] text-on-surface font-medium">
                <!-- Válidos renderizados via JS -->
              </ul>
            </div>
          </div>

          <div class="flex justify-center pt-sm">
            <a href="programas.html" class="bg-primary text-on-primary px-xl h-[40px] rounded text-[14px] font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer w-full flex items-center justify-center">
              OK, Voltar para Programas
            </a>
          </div>
        </div>
      </div>
`;
  
  code = code.replace("<!-- Modal Regulamento -->", planAModalHtml + "\n      <!-- Modal Regulamento -->");

  // In the JS section, we need to inject the logic to check dates
  const planAJsLogic = `
      // Lógica de Bloqueio por Período
      const formatarData = (dataStr) => {
        if (!dataStr) return '';
        const partes = dataStr.split('-');
        if (partes.length !== 3) return dataStr;
        return \`\${partes[2]}/\${partes[1]}/\${partes[0]}\`;
      };
      
      const periodosSubmissao = \${JSON.stringify(programa.periodosSubmissao || [])};
      
      if (periodosSubmissao.length > 0) {
        const hoje = new Date().toISOString().split('T')[0];
        const isAberto = periodosSubmissao.some(p => hoje >= p.inicio && hoje <= p.fim);
        
        if (!isAberto) {
          const lista = document.getElementById('periodos-lista');
          periodosSubmissao.forEach(p => {
            const li = document.createElement('li');
            li.textContent = \`\${formatarData(p.inicio)} a \${formatarData(p.fim)}\`;
            lista.appendChild(li);
          });
          
          document.getElementById('modal-periodo').classList.remove('hidden');
          document.body.style.overflow = 'hidden';
          // Desabilita tudo
          document.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = true);
          document.querySelector('#modal-periodo a').style.pointerEvents = 'auto'; // Garante o link OK
        }
      }
`;
  
  code = code.replace("document.addEventListener('DOMContentLoaded', () => {", 
    "document.addEventListener('DOMContentLoaded', () => {\n" + planAJsLogic);

  fs.writeFileSync('scripts/patches/patch_generate_plan_a_exact.ts', code);
  console.log('Patched patch_generate_plan_a_exact.ts');
}
