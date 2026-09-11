const fs = require('fs');
let code = fs.readFileSync('scripts/patches/patch_generate_plan_a_exact.ts', 'utf8');

// 1. Add isAceite variable
code = code.replace("const isExterno = doc.tipo === 'externo';", 
  "const isExterno = doc.tipo === 'externo';\n          const isAceite = doc.tipo === 'aceite';");

// 2. Adjust actions for `aceite`
code = code.replace("${(!isGerado && !isExterno) ? `", 
  "${(!isGerado && !isExterno && !isAceite) ? `");

code = code.replace("<!-- Coluna 3: Ações -->", 
`<!-- Coluna 3: Ações -->
                \${isAceite ? \`
                  <div class="w-[40px] shrink-0 flex flex-col items-center justify-center gap-1 border-l border-outline-variant/30 py-1">
                    <button type="button" class="doc-btn-aceite text-primary-container hover:bg-surface-variant flex items-center justify-center w-7 h-7 rounded-full transition-colors shrink-0" title="Ler e Aceitar Regulamento" data-id="\${doc.id}">
                      <span class="material-symbols-outlined text-[18px] inline-block scale-[0.8] origin-center doc-icon-aceite">contract</span>
                    </button>
                  </div>
                \` : ''}`);

code = code.replace('<div class="doc-file-info hidden -ml-[26px]">', 
`
                  \${isAceite ? \`
                    <div class="doc-aceite-info hidden flex items-center gap-1 mt-1 text-secondary text-[10px] font-bold uppercase">
                      <span class="material-symbols-outlined text-[14px]">task_alt</span>
                      Termos Aceitos
                    </div>
                  \` : ''}
                  <div class="doc-file-info hidden -ml-[26px]">`);

// 3. Inject Modal HTML into the generated page
const modalHtml = `
      <!-- Modal Regulamento -->
      <div id="modal-regulamento" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div class="bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <div class="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between shrink-0 bg-surface">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary text-2xl">policy</span>
              <h2 class="text-xl font-bold text-on-surface">Regulamento de Apoios</h2>
            </div>
            <button id="modal-regulamento-close" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors" title="Fechar">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 lg:p-8 bg-surface-container-lowest text-on-surface text-sm leading-relaxed space-y-6">
            <div class="text-center space-y-2 mb-8">
              <h3 class="text-lg font-bold text-primary-container uppercase tracking-wide">
                Fundação de Estudos Agrários Luiz de Queiroz – FEALQ
              </h3>
              <p class="text-on-surface-variant font-medium">REG-C-003 • REVISÃO N.º: 05 • EFETIVAÇÃO: 30/01/2026</p>
            </div>
            <div class="prose prose-sm max-w-none prose-headings:text-primary-container prose-headings:font-bold prose-p:text-on-surface prose-li:text-on-surface">
              <p><strong>Art. 1°</strong> - Este Regulamento estabelece as normas para o Programa de Apoios com uso de recursos próprios da Fundação de Estudos Agrários Luiz de Queiroz – Fealq no exercício de seu compromisso social, voltados à sociedade com ênfase na comunidade acadêmica.</p>
              <p><strong>Art. 2º</strong> - A governança da Fundação está pautada nos princípios da equidade, transparência, responsabilidade institucional e socioambiental, integridade, conformidade legal e prestação de contas. Os relatórios de auditoria, demonstrações contábeis e documentos que atestam a regularidade da Fundação junto aos órgãos de controle, como o Ministério Público, estão disponíveis para consulta pública em nosso Portal da Transparência, acessível no site institucional da Fealq. Esse Regulamento reafirma o compromisso da Fundação com a ética, a integridade e a prestação de contas à sociedade.</p>
              <p><strong>Art. 3º</strong> - A página da internet da Fealq será o ambiente de divulgação da Política de Apoios, deste Regulamento, seus editais e cronogramas de participação.</p>
              <p><strong>Art. 4º</strong> - O orçamento anual será estabelecido pelo Conselho Curador, que definirá um valor limite (teto) para o exercício na reunião de aprovação do orçamento, preservando o capital da Fundação e a continuidade das suas atividades.</p>
              <p><strong>Art. 5º</strong> - A Diretoria deve apresentar a proposta dos montantes porcentuais para cada linha de apoio para a aprovação do Conselho Curador, juntamente com a proposta de orçamento do ano seguinte.</p>
              <p><strong>Art. 6º</strong> - A Diretoria estabelece neste Regulamento diretrizes e quesitos específicos para aplicação e operacionalização da Política de Apoios. A análise das propostas poderá ocorrer por meio da comissão de avaliação indicada pela Diretoria.</p>
              <h4 class="text-base mt-6 mb-3">Condições de Elegibilidade, Execução e Prestação de Contas</h4>
              <ul class="list-disc pl-5 space-y-2">
                <li>Todos os deferimentos deverão ser executados pela Diretoria da Fealq;</li>
                <li>Os pedidos aprovados devem ser executados e o recurso utilizado em prazo máximo de 120 dias da aprovação do pedido, salvo previsão em editais específicos.</li>
                <li>A prestação de contas deve ser realizada conforme prazo indicado ao requerente no resultado do deferimento, com o encaminhamento de comprovantes juntamente com relatório das atividades relacionadas.</li>
                <li>É vedado apoio destinado a pagamento de despesas de custeio ou recorrentes, como assinatura de linha telefônica, internet, plano de saúde, etc.</li>
                <li>É vedado o pagamento de despesas de contratação de pessoal pela Fundação, como CLT, estagiários, pessoa jurídica, pagamento para marketing, plataformas de divulgação e inscrições, tráfego pago, impressão de banner.</li>
                <li>É vedado o remanejamento de recursos aprovados entre diferentes modalidades de apoios. Os recursos deverão ser utilizados exclusivamente conforme a proposta originalmente submetida e aprovada.</li>
                <li>Será permitida a submissão de apenas uma proposta por solicitante em cada modalidade apoio.</li>
              </ul>
              <p class="mt-6"><strong>Art. 7º</strong> - A alçada para deferimento dos apoios é exclusiva da Diretoria. A Fundação poderá ainda destinar e executar os recursos isoladamente, em conjunto ou através de entidades parcerias e atender pedidos total ou parcialmente.</p>
              <p><strong>Art. 8º</strong> - A participação dos bolsistas em atividades do presente regulamento não criará vínculo empregatício de qualquer natureza e devem seguir diretrizes estabelecidas no Regulamento de Bolsa da Fealq.</p>
              <p><strong>Art. 9º</strong> – O Programa de Apoios está habilitado a estabelecer parcerias com instituições públicas ou privadas que desenvolvam ou apoiem iniciativas aderentes às linhas de apoio gerenciadas pela Fundação.</p>
              <div class="mt-8 p-4 bg-surface-container-low border border-outline-variant rounded-md text-xs text-on-surface-variant">
                Nota: Este documento é uma versão condensada dos Artigos Gerais. Para consultar os requisitos específicos de cada modalidade (Bolsas, Auxílios, Cultura e Extensão, Interesse Comunitário) e o anexo completo com períodos de submissão e análise, acesse a versão integral do Regulamento de Apoios no site institucional da FEALQ.
              </div>
            </div>
          </div>

          <div class="px-6 py-4 bg-surface border-t border-outline-variant/30 flex items-center justify-between shrink-0">
            <p class="text-xs text-on-surface-variant max-w-[60%]">
              Ao clicar em <strong>Li e Aceito</strong>, você declara estar ciente de todas as regras e condições estabelecidas neste regulamento, comprometendo-se a respeitá-las integralmente.
            </p>
            <div class="flex items-center gap-3">
              <button id="modal-regulamento-fechar" class="px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-variant rounded transition-colors">Fechar</button>
              <button id="modal-regulamento-aceitar" class="px-6 py-2 text-sm font-bold bg-primary text-on-primary hover:bg-primary/90 rounded transition-colors shadow-sm">Li e Aceito</button>
            </div>
          </div>
        </div>
      </div>
`;
code = code.replace("</body>", `${modalHtml}\n</body>`);

// 4. Inject JS logic to handle the modal
const logicJs = `
      // Lógica do Modal de Aceite
      let currentAceiteId = null;
      let currentAceiteCard = null;
      const modalReg = document.getElementById('modal-regulamento');
      
      document.querySelectorAll('.doc-btn-aceite').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const card = e.target.closest('.doc-card');
          if (card.classList.contains('concluido')) {
            // Apenas visualizar
            document.getElementById('modal-regulamento-aceitar').classList.add('hidden');
          } else {
            // Precisa aceitar
            currentAceiteId = btn.getAttribute('data-id');
            currentAceiteCard = card;
            document.getElementById('modal-regulamento-aceitar').classList.remove('hidden');
          }
          modalReg.classList.remove('hidden');
        });
      });

      document.getElementById('modal-regulamento-close').addEventListener('click', () => modalReg.classList.add('hidden'));
      document.getElementById('modal-regulamento-fechar').addEventListener('click', () => modalReg.classList.add('hidden'));

      document.getElementById('modal-regulamento-aceitar').addEventListener('click', () => {
        if (currentAceiteCard) {
          const icon = currentAceiteCard.querySelector('.doc-icon');
          const aceiteInfo = currentAceiteCard.querySelector('.doc-aceite-info');
          const btnIcon = currentAceiteCard.querySelector('.doc-icon-aceite');
          
          aceiteInfo.classList.remove('hidden');
          currentAceiteCard.classList.add('concluido');
          currentAceiteCard.classList.remove('border-dashed');
          icon.innerText = 'check_circle';
          icon.classList.add('text-secondary');
          icon.classList.remove('text-outline');
          
          btnIcon.innerText = 'visibility';
          
          // atualiza barra
          const totalDocs = document.querySelectorAll('.doc-card').length;
          const concluidos = document.querySelectorAll('.doc-card.concluido').length;
          const bar = document.getElementById('kit-bar');
          const progresso = document.getElementById('kit-progresso');
          
          if (bar && progresso) {
            bar.style.width = \`\${(concluidos / totalDocs) * 100}%\`;
            progresso.innerText = \`\${concluidos}/\${totalDocs}\`;
          }
          
          verificarEnvio();
        }
        modalReg.classList.add('hidden');
      });
`;
code = code.replace("checkFormValido();", `checkFormValido();\n${logicJs}`);

fs.writeFileSync('scripts/patches/patch_generate_plan_a_exact.ts', code);
