import fs from 'fs';
import path from 'path';
import { PROGRAMAS_APOIO, ProgramaApoio } from '../../src/data/programasApoio';

const formsSchema: Record<string, any[]> = {
  'bolsa-pos': [
    {
      numero: 1, icone: 'school', titulo: 'Dados do Bolsista',
      fields: [
        { label: 'Nome Completo do Aluno', span: 12, placeholder: 'Ex: João da Silva' },
        { label: 'CPF', span: 6, placeholder: '000.000.000-00' },
        { label: 'Nível', span: 6, type: 'select', opcoes: ['Mestrado', 'Doutorado', 'Pós-Doutorado'] },
        { label: 'Programa de Pós-Graduação (PPG)', span: 12, placeholder: 'Nome do PPG' }
      ]
    },
    {
      numero: 2, icone: 'schedule', titulo: 'Detalhes da Bolsa',
      fields: [
        { label: 'Projeto Vinculado', span: 12, placeholder: 'Projeto de pesquisa associado' },
        { label: 'Início da Bolsa', span: 6, type: 'month' },
        { label: 'Fim Previsto', span: 6, type: 'month' },
        { label: 'Valor Mensal Previsto (R$)', span: 12, prefixo: 'R$', placeholder: '0,00' }
      ]
    }
  ],
  'bolsa-graduacao': [
    {
      numero: 1, icone: 'school', titulo: 'Dados do Bolsista',
      fields: [
        { label: 'Nome Completo do Aluno', span: 12, placeholder: 'Ex: João da Silva' },
        { label: 'CPF', span: 6, placeholder: '000.000.000-00' },
        { label: 'Curso', span: 6, placeholder: 'Ex: Agronomia' },
        { label: 'Período/Semestre Atual', span: 6, type: 'select', opcoes: ['1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre', '5º Semestre', '6º Semestre', '7º Semestre', '8º Semestre', '9º Semestre', '10º Semestre'] },
        { label: 'Número USP / Matrícula', span: 6, placeholder: '0000000' }
      ]
    },
    {
      numero: 2, icone: 'schedule', titulo: 'Detalhes da Bolsa',
      fields: [
        { label: 'Título do Plano de Trabalho', span: 12 },
        { label: 'Projeto Guarda-Chuva (Se houver)', span: 12 },
        { label: 'Início da Bolsa', span: 6, type: 'month' },
        { label: 'Fim Previsto', span: 6, type: 'month' }
      ]
    }
  ],
  'infraestrutura': [
    {
      numero: 1, icone: 'domain', titulo: 'Dados da Infraestrutura',
      fields: [
        { label: 'Departamento / Unidade', span: 12 },
        { label: 'Descrição do Local Específico', span: 12 },
        { label: 'Tipo de Apoio', span: 12, type: 'select', opcoes: ['Reforma', 'Equipamento', 'Mobiliário', 'Outro'] },
        { label: 'Justificativa da Necessidade', span: 12, type: 'textarea' },
        { label: 'Valor Estimado (R$)', span: 12, prefixo: 'R$' }
      ]
    }
  ],
  'apresentacao-evento': [
    {
      numero: 1, icone: 'campaign', titulo: 'Dados do Evento',
      fields: [
        { label: 'Nome do Evento/Congresso', span: 12 },
        { label: 'Local do Evento (Cidade/País)', span: 12 },
        { label: 'Website do Evento', span: 12, type: 'url' },
        { label: 'Data de Início', span: 6, type: 'date' },
        { label: 'Data de Término', span: 6, type: 'date' }
      ]
    },
    {
      numero: 2, icone: 'article', titulo: 'Detalhes da Apresentação',
      fields: [
        { label: 'Título do Trabalho Aceito', span: 12 },
        { label: 'Formato de Apresentação', span: 6, type: 'select', opcoes: ['Pôster', 'Oral', 'Palestra', 'Outro'] },
        { label: 'Valor Solicitado (R$)', span: 6, prefixo: 'R$' }
      ]
    }
  ],
  'auxilio-viagem': [
    {
      numero: 1, icone: 'person', titulo: 'Dados do Solicitante',
      fields: [
        { label: 'Nome Completo', span: 12 },
        { label: 'CPF', span: 6 },
        { label: 'E-mail Institucional', span: 6, type: 'email' },
        { label: 'Vínculo', span: 6, type: 'select', opcoes: ['Docente', 'Pesquisador', 'Pós-Doutorando', 'Doutorando', 'Mestrando'] },
        { label: 'Departamento', span: 6 },
        { label: 'Orientador', span: 12 }
      ]
    },
    {
      numero: 2, icone: 'flight', titulo: 'Detalhes da Viagem',
      fields: [
        { label: 'País de Destino', span: 6 },
        { label: 'Cidade/Estado', span: 6 },
        { label: 'Data da Viagem', span: 12, type: 'date' },
        { label: 'Finalidade', span: 12, type: 'textarea' },
        { label: 'Tipo de Auxílio', span: 6, type: 'select', opcoes: ['Passagem Aérea', 'Passagem Terrestre', 'Hospedagem', 'Alimentação'] },
        { label: 'Valor Solicitado (R$)', span: 6, prefixo: 'R$' }
      ]
    }
  ],
  'auxilio-publicacao': [
    {
      numero: 1, icone: 'person', titulo: 'Dados do Solicitante',
      fields: [
        { label: 'Nome Completo', span: 12 },
        { label: 'CPF', span: 6 },
        { label: 'Instituição', span: 6 },
        { label: 'Departamento', span: 6 },
        { label: 'Vínculo', span: 6 },
        { label: 'Orientador (se aplicável)', span: 12 }
      ]
    },
    {
      numero: 2, icone: 'article', titulo: 'Detalhes da Publicação',
      fields: [
        { label: 'Participação no Artigo', span: 12, type: 'select', opcoes: ['Primeiro Autor', 'Autor Correspondente', 'Co-autor'] },
        { label: 'Título do Artigo', span: 12 },
        { label: 'Revista / Periódico', span: 12 },
        { label: 'Impact Factor', span: 6 },
        { label: 'CiteScore', span: 6 },
        { label: 'Moeda', span: 6, type: 'select', opcoes: ['BRL', 'USD', 'EUR', 'GBP'] },
        { label: 'Valor da Taxa (APC)', span: 6 },
        { label: 'Outras Fontes de Custeio?', span: 12, type: 'select', opcoes: ['Não', 'Sim'] }
      ]
    }
  ],
  'interesse-comunidade': [
    {
      numero: 1, icone: 'group', titulo: 'Dados da Ação',
      fields: [
        { label: 'Nome do Projeto/Ação', span: 12 },
        { label: 'Objetivo Principal', span: 12, type: 'textarea' },
        { label: 'Público-Alvo Estimado', span: 6 },
        { label: 'Valor do Apoio Solicitado (R$)', span: 6, prefixo: 'R$' },
        { label: 'Bairro / Comunidade', span: 12 },
        { label: 'Parceiros Locais (Associações, ONGs, etc)', span: 12, type: 'textarea' }
      ]
    }
  ],
  'material-eventos': [
    {
      numero: 1, icone: 'event', titulo: 'Dados do Evento',
      fields: [
        { label: 'Nome do Evento', span: 12 },
        { label: 'Público Estimado', span: 6 },
        { label: 'Data do Evento', span: 6, type: 'date' }
      ]
    },
    {
      numero: 2, icone: 'inventory_2', titulo: 'Materiais Solicitados',
      fields: [
        { label: 'Tipos de Materiais Necessários', span: 12, type: 'select', opcoes: ['Canetas/Blocos', 'Pastas', 'Brindes', 'Coffee-break'] },
        { label: 'Detalhes Adicionais (Quantidades específicas)', span: 12, type: 'textarea' }
      ]
    }
  ],
  'cultura-extensao': [
    {
      numero: 1, icone: 'public', titulo: 'Dados do Projeto',
      fields: [
        { label: 'Nome do Projeto/Grupo Cultural', span: 12 },
        { label: 'Área de Atuação', span: 6 },
        { label: 'Vinculação CCEx', span: 6, type: 'select', opcoes: ['Sim', 'Não'] },
        { label: 'Breve Descrição das Atividades', span: 12, type: 'textarea' }
      ]
    },
    {
      numero: 2, icone: 'payments', titulo: 'Recursos',
      fields: [
        { label: 'Para que os recursos serão destinados?', span: 12, type: 'textarea' },
        { label: 'Valor Solicitado (R$)', span: 6, prefixo: 'R$' }
      ]
    }
  ]
};

const getSpanClass = (span: number) => {
  const map: Record<number, string> = {
    6: 'md:col-span-6',
    12: 'md:col-span-12',
  };
  return map[span] || 'md:col-span-12';
};

const renderField = (field: any) => {
  const id = field.label.replace(/\s+/g, '-').toLowerCase();
  const type = field.type || 'text';
  const placeholder = field.placeholder || '';
  
  let control = '';
  
  let inputType = type;
  let maskAttr = '';
  let dataAttr = '';
  let rightIcon = '';
  
  if (field.label.toLowerCase() === 'cpf') {
    maskAttr = 'data-mask="cpf"';
    inputType = 'text';
    dataAttr = 'inputmode="numeric" maxlength="14"';
  } else if (type === 'date' || type === 'month') {
    maskAttr = 'data-mask="date"';
    inputType = 'text';
    dataAttr = `inputmode="numeric" data-date-mode="${type}" maxlength="${type === 'month' ? '7' : '10'}" placeholder="${type === 'month' ? 'MM/AAAA' : 'DD/MM/AAAA'}"`;
    rightIcon = `
      <button type="button" tabindex="-1" class="absolute right-2 top-[50%] translate-y-[-50%] text-on-surface-variant hover:text-primary transition-colors p-1 flex items-center justify-center rounded">
        <span class="material-symbols-outlined text-[18px]">calendar_today</span>
      </button>
    `;
  } else if (field.prefixo === 'R$') {
    maskAttr = 'data-mask="currency"';
    inputType = 'text';
    dataAttr = 'inputmode="numeric" placeholder="0,00"';
  }

  if (type === 'textarea') {
    control = `<textarea id="${id}" class="w-full h-auto min-h-[80px] p-sm resize-y px-sm py-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors" placeholder="${placeholder}"></textarea>`;
  } else if (type === 'select') {
    control = `
      <select id="${id}" class="w-full h-[36px] px-sm py-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors">
        ${placeholder ? `<option value="">${placeholder}</option>` : ''}
        ${(field.opcoes || []).map((o: string) => `<option value="${o}">${o}</option>`).join('')}
      </select>
    `;
  } else if (field.prefixo) {
    control = `
      <div class="flex relative">
        <span class="inline-flex items-center px-sm h-[36px] rounded-l border border-r-0 border-outline-variant bg-surface-container-low text-on-surface-variant text-[12px] font-bold">
          ${field.prefixo}
        </span>
        <input id="${id}" type="${inputType}" ${maskAttr} ${dataAttr} placeholder="${placeholder || '0,00'}" class="w-full h-[36px] px-sm py-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors rounded-l-none" />
      </div>
    `;
  } else {
    control = `
      <div class="relative w-full">
        <input id="${id}" type="${inputType}" ${maskAttr} ${dataAttr} placeholder="${placeholder}" class="w-full h-[36px] px-sm py-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-colors ${rightIcon ? 'pr-9' : ''}" />
        ${rightIcon}
      </div>
    `;
  }

  return `
    <div class="col-span-12 ${getSpanClass(field.span || 12)}">
      <label class="block mb-xs text-on-surface-variant text-[11px] font-bold uppercase tracking-wide" for="${id}">
        ${field.label}
      </label>
      ${control}
    </div>
  `;
};

const renderSection = (section: any) => {
  return `
    <section class="bg-surface-container-lowest border border-outline-variant rounded shadow-sm p-lg mb-lg">
      <div class="flex items-center justify-between gap-sm mb-md pb-xs border-b border-surface-variant">
        <div class="flex items-center gap-sm min-w-0">
          <span class="material-symbols-outlined text-primary-container">
            ${section.icone}
          </span>
          <h2 class="text-[16px] font-semibold text-primary-container">
            ${section.numero !== undefined ? section.numero + '. ' : ''}${section.titulo}
          </h2>
        </div>
      </div>
      <div class="grid grid-cols-12 gap-md">
        ${section.fields.map(renderField).join('')}
      </div>
    </section>
  `;
};

const renderKitDocumental = (programa: ProgramaApoio) => {
  return `
    <section class="bg-surface-container-low border border-outline-variant rounded shadow-sm p-lg">
      <div class="flex items-center justify-between gap-sm mb-md pb-xs border-b border-surface-variant">
        <div class="flex items-center gap-sm min-w-0">
          <span class="material-symbols-outlined text-primary-container">attach_file</span>
          <h2 class="text-[16px] font-semibold text-primary-container">Kit de Documentos</h2>
        </div>
        <span class="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-xs py-[2px] rounded uppercase whitespace-nowrap" id="kit-progresso">
          0/${programa.documentos.length}
        </span>
      </div>
      
      <div class="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden mb-md">
        <div class="bg-secondary h-full transition-all w-0" id="kit-bar"></div>
      </div>
      
      <div class="flex flex-col gap-sm">
        ${programa.documentos.map(doc => {
          const isGerado = doc.tipo === 'gerado';
          const isExterno = doc.tipo === 'externo';
          const isAceite = doc.tipo === 'aceite';
          const detalhe = [doc.descricao, doc.condicao].filter(Boolean).join(' ');
          
          let actionHtml = '';
          let iconHtml = '';
          let labelClass = 'text-[13px] text-on-surface-variant doc-label';
          
          if (isGerado) {
            actionHtml = '<span class="text-[#F17C58] text-[10px] font-bold uppercase shrink-0">Pendente</span>';
            iconHtml = '<span class="material-symbols-outlined text-[18px] text-outline doc-icon">radio_button_unchecked</span>';
          } else if (isExterno) {
            actionHtml = '<span class="text-on-surface-variant text-[10px] font-bold uppercase shrink-0">Externo</span>';
            iconHtml = '<span class="material-symbols-outlined text-[18px] text-outline doc-icon">forward_to_inbox</span>';
          } else {
            iconHtml = '<span class="material-symbols-outlined text-[18px] text-outline doc-icon">radio_button_unchecked</span>';
            actionHtml = '';
          }

          return `
            <div data-tipo="${doc.tipo}" class="doc-card bg-surface-container-lowest border rounded transition-colors ${isGerado ? 'border-outline-variant doc-card concluido' : 'border-outline-variant border-dashed doc-card'}">
              <div class="flex items-stretch min-h-[72px]">
                <!-- Coluna 1: Status / Ícone -->
                <div class="w-[32px] shrink-0 flex flex-col items-center justify-center border-r border-outline-variant/30">
                  ${iconHtml}
                </div>

                <!-- Coluna 2: Conteúdo Central -->
                <div class="flex-1 flex flex-col justify-center py-xs px-sm min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <span class="${labelClass}">${doc.label}</span>
                    ${actionHtml}
                  </div>

                  
                  ${isAceite ? `
                    <div class="doc-aceite-info hidden flex items-center gap-1 mt-1 text-secondary text-[10px] font-bold uppercase">
                      <span class="material-symbols-outlined text-[14px]">task_alt</span>
                      Termos Aceitos
                    </div>
                  ` : ''}
                  <div class="doc-file-info hidden -ml-[26px]">
                    <p class="flex items-center gap-xs mt-xs pl-[26px] text-[11px] text-on-surface-variant min-w-0">
                      <span class="material-symbols-outlined text-[14px] inline-block scale-[0.8] origin-center shrink-0 text-primary-container">description</span>
                      <span class="truncate">
                        Anexado: 
                        <a href="#" target="_blank" rel="noreferrer" class="text-primary-container font-semibold hover:underline doc-filename-link" title="Visualizar arquivo">
                          Tipo: <span class="doc-file-ext"></span> - Tam: <span class="doc-file-size"></span>
                        </a>
                      </span>
                    </p>
                  </div>

                  ${detalhe ? `<p class="text-[10px] text-on-surface-variant mt-0.5 leading-tight pr-2">${detalhe}</p>` : ''}
                  ${doc.acaoEmail ? `
                    <a href="mailto:${doc.acaoEmail.email}" class="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-primary hover:text-primary-container transition-colors w-fit">
                      <span class="material-symbols-outlined text-[14px]">mail</span>
                      ${doc.acaoEmail.label}
                    </a>
                  ` : ''}
                  ${!doc.obrigatorio ? `
                    <span class="inline-block mt-1 w-fit text-[9px] font-bold uppercase tracking-wide px-1.5 py-[1px] rounded bg-surface-variant text-on-surface-variant">
                      Condicional
                    </span>
                  ` : ''}
                </div>

                <!-- Coluna 3: Ações -->
                ${isAceite ? `
                  <div class="w-[40px] shrink-0 flex flex-col items-center justify-center gap-1 border-l border-outline-variant/30 py-1">
                    <button type="button" class="doc-btn-aceite text-primary-container hover:bg-surface-variant flex items-center justify-center w-7 h-7 rounded-full transition-colors shrink-0" title="Ler e Aceitar Regulamento" data-id="${doc.id}">
                      <span class="material-symbols-outlined text-[18px] inline-block scale-[0.8] origin-center doc-icon-aceite">contract</span>
                    </button>
                  </div>
                ` : ''}
                ${(!isGerado && !isExterno && !isAceite) ? `
                  <div class="w-[40px] shrink-0 flex flex-col items-center justify-between border-l border-outline-variant/30 py-1">
                    
                    <div class="flex flex-col items-center">
                      <div class="flex items-center shrink-0 doc-upload-container">
                        <div class="relative cursor-pointer w-7 h-7">
                          <input type="file" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer doc-upload z-10" data-id="${doc.id}" title="Anexar arquivo" accept=".pdf,.png,.jpg,.jpeg">
                          <span class="material-symbols-outlined text-[14px] inline-block scale-[0.8] origin-center text-primary-container hover:bg-surface-variant flex items-center justify-center w-7 h-7 rounded-full transition-colors absolute inset-0">attach_file</span>
                        </div>
                      </div>

                      <div class="flex items-center shrink-0 doc-remove-container hidden">
                        <button type="button" class="doc-remove text-error hover:bg-error-container/20 flex items-center justify-center w-7 h-7 rounded-full transition-colors shrink-0" title="Remover anexo">
                          <span class="material-symbols-outlined text-[14px] inline-block scale-[0.8] origin-center">delete</span>
                        </button>
                      </div>
                    </div>

                    ${doc.url_template ? `
                      <a href="${doc.url_template}" target="_blank" rel="noreferrer" class="text-primary-container hover:bg-surface-variant flex items-center justify-center w-7 h-7 rounded-full transition-colors shrink-0" title="Baixar Modelo">
                        <span class="material-symbols-outlined text-[14px] inline-block scale-[0.8] origin-center">file_download</span>
                      </a>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <p class="text-[10px] text-on-surface-variant mt-sm leading-tight">
        Anexe os documentos obrigatórios para liberar o envio da solicitação. ${programa.documentos.length} documentos previstos.
      </p>
    </section>
  `;
};

const generateHtml = (programa: ProgramaApoio) => {
  const sections = formsSchema[programa.id] || [];
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${programa.titulo} - FEALQ</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#004F71',
            secondary: '#00A3A1',
            background: '#F8FAFC',
            surface: '#FFFFFF',
            'outline-variant': '#E2E8F0',
            'on-surface': '#0F172A',
            'on-surface-variant': '#475569',
            'surface-container-lowest': '#FFFFFF',
            'surface-container-low': '#F8FAFC',
            'primary-container': '#004F71',
            'secondary-fixed': '#00A3A1',
            'on-secondary-fixed': '#FFFFFF',
            'on-secondary': '#FFFFFF',
          },
          spacing: {
            'xs': '4px',
            'sm': '8px',
            'md': '16px',
            'lg': '24px',
            'xl': '32px',
          }
        }
      }
    }
  </script>
</head>
<body class="bg-background text-on-surface min-h-screen flex flex-col font-sans">
  
  <div class="print:hidden">
    <header class="bg-surface border-b border-outline-variant h-[56px] flex justify-between items-center px-4 sticky top-0 z-30">
      <div class="flex-1"></div>
      <div class="flex-1 text-[16px] font-bold text-primary truncate text-center flex items-center justify-center">
        FealqFlow - Portal de Formulários
      </div>
      <div class="flex-1"></div>
    </header>
  </div>

  <!-- Aumentamos o pb-[80px] para pb-[120px] para garantir que o rodape nunca fique em cima do conteúdo -->
  <main class="flex-1 w-full max-w-[1200px] mx-auto px-md md:px-xl pt-md md:pt-lg pb-[120px] print:pb-0 print:px-0">
    <div class="mb-lg border-b border-outline-variant pb-sm">
      <div class="flex items-center gap-xs text-on-surface-variant text-[12px] mb-xs print:hidden">
        <span class="material-symbols-outlined text-[14px]">home</span>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        <span class="text-on-surface-variant">Programa de Apoios</span>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        <span class="text-primary font-bold">${programa.titulo}</span>
      </div>
      <h1 class="text-[20px] text-on-surface font-bold flex items-center flex-wrap gap-sm">
        ${programa.titulo}
        <span class="text-on-surface-variant text-[12px] font-normal">(${programa.codigo})</span>
      </h1>
    </div>

    <form id="formulario_${programa.id.replace(/-/g, '_')}" class="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start print:block">
      
      <!-- Coluna Esquerda: Formulário -->
      <div class="flex flex-col gap-lg print:col-span-12 print:block lg:col-span-8">
        
        <!-- 0. Normas do Edital -->
        <section class="bg-surface-container-lowest border border-outline-variant rounded shadow-sm p-lg">
          <button type="button" id="btn-normas-${programa.id}" class="w-full flex items-center justify-between gap-sm text-left pb-xs border-b border-surface-variant">
            <div class="flex items-center gap-sm min-w-0">
              <span class="material-symbols-outlined text-primary-container">gavel</span>
              <h2 class="text-[16px] font-semibold text-primary-container">0. Normas do Edital</h2>
            </div>
            <div class="flex items-center gap-sm shrink-0">
              <span class="text-[12px] text-on-surface-variant whitespace-nowrap">
                Teto: <strong class="text-primary font-bold">${programa.teto}</strong>
              </span>
              <span id="icon-normas-${programa.id}" class="material-symbols-outlined text-[20px] text-on-surface-variant transition-transform">
                expand_more
              </span>
            </div>
          </button>
          
          <!-- Oculto por padrão (hidden) igual ao React -->
          <div id="content-normas-${programa.id}" class="hidden mt-md">
            <p class="text-[13px] leading-relaxed text-on-surface-variant">
              ${programa.normas}
            </p>
          </div>
        </section>

        <!-- Sessões Específicas do Formulário -->
        ${sections.map(renderSection).join('')}
      </div>

      <!-- Coluna Direita: Kit Documental -->
      <div class="lg:col-span-4 flex flex-col gap-lg print:hidden">
        ${renderKitDocumental(programa)}
      </div>

    </form>
  </main>

  <footer class="fixed bottom-0 right-0 z-30 border-t border-outline-variant bg-surface-container-lowest print:hidden left-0">
    <div class="w-full max-w-[1200px] mx-auto px-md md:px-xl py-sm md:py-md flex justify-between items-center gap-sm md:gap-md">
      <div class="flex items-center">
        <button type="button" class="px-sm md:px-lg h-[36px] rounded border border-transparent text-on-surface text-[13px] hover:bg-surface-container-low transition-colors whitespace-nowrap">
          Cancelar
        </button>
      </div>

      <div class="flex-1 flex justify-center items-center gap-md px-md">
        <div id="footer-warning" class="hidden lg:flex items-center justify-center gap-2 bg-[#F17C58] text-white text-xs px-3 h-[26px] rounded-md shadow-xs whitespace-nowrap animate-pulse">
          <span class="material-symbols-outlined text-[16px]">warning</span>
          <span>
            <strong>Trava de Envio Ativa:</strong> O sistema bloqueia envios incompletos. Regularize as pendências.
          </span>
        </div>
      </div>

      <div class="flex items-center gap-sm">
        <button type="button" class="px-sm md:px-lg h-[36px] rounded border border-outline-variant text-on-surface-variant text-[13px] hover:bg-surface-container-low transition-colors whitespace-nowrap">
          <span class="hidden sm:inline">Salvar Rascunho</span>
          <span class="sm:hidden">Salvar</span>
        </button>

        <button type="submit" form="formulario_${programa.id.replace(/-/g, '_')}" id="submit-btn" class="px-sm md:px-lg h-[36px] rounded text-[13px] font-medium flex items-center gap-xs transition-colors whitespace-nowrap bg-surface-container-highest text-[#F17C58] cursor-not-allowed">
          <span class="hidden sm:inline">Submeter Pedido</span>
          <span class="sm:hidden">Bloqueado</span>
          <span class="material-symbols-outlined text-[18px]">warning</span>
        </button>
      </div>
    </div>
  </footer>

  <script>
    document.addEventListener('DOMContentLoaded', () => {

      // Lógica de Bloqueio por Período
      const formatarData = (dataStr) => {
        if (!dataStr) return '';
        const partes = dataStr.split('-');
        if (partes.length !== 3) return dataStr;
        return partes[2] + '/' + partes[1] + '/' + partes[0];
      };
      
      const periodosSubmissao = ${JSON.stringify(programa.periodosSubmissao || [])};
      
      if (periodosSubmissao.length > 0) {
        const hoje = new Date().toISOString().split('T')[0];
        const isAberto = periodosSubmissao.some(p => hoje >= p.inicio && hoje <= p.fim);
        
        if (!isAberto) {
          const lista = document.getElementById('periodos-lista');
          periodosSubmissao.forEach(p => {
            const li = document.createElement('li');
            li.textContent = formatarData(p.inicio) + ' a ' + formatarData(p.fim);
            lista.appendChild(li);
          });
          
          document.getElementById('modal-periodo').classList.remove('hidden');
          document.body.style.overflow = 'hidden';
          // Desabilita tudo
          document.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = true);
          document.querySelector('#modal-periodo a').style.pointerEvents = 'auto'; // Garante o link OK
        }
      }

      // Toggle Normas do Edital
      const btnNormas = document.getElementById('btn-normas-${programa.id}');
      const iconNormas = document.getElementById('icon-normas-${programa.id}');
      const contentNormas = document.getElementById('content-normas-${programa.id}');
      
      btnNormas.addEventListener('click', () => {
        const isHidden = contentNormas.classList.contains('hidden');
        if (isHidden) {
          contentNormas.classList.remove('hidden');
          iconNormas.classList.add('rotate-180');
          btnNormas.classList.add('mb-md');
        } else {
          contentNormas.classList.add('hidden');
          iconNormas.classList.remove('rotate-180');
          btnNormas.classList.remove('mb-md');
        }
      });

      // Lógica Kit Documental
      const form = document.getElementById('formulario_${programa.id.replace(/-/g, '_')}');
      const uploads = document.querySelectorAll('.doc-upload');
      const submitBtn = document.getElementById('submit-btn');
      const footerWarning = document.getElementById('footer-warning');
      const kitProgresso = document.getElementById('kit-progresso');
      const kitBar = document.getElementById('kit-bar');
      
      const totalDocs = ${programa.documentos.length};
      
      const updateKitStatus = () => {
        let concluidos = 0;
        let pendencias = 0;
        
        // Check form validity
        const form = document.querySelector('form');
        const formValido = form ? form.checkValidity() : true;
        
        document.querySelectorAll('.doc-card').forEach(card => {
          if (card.dataset.tipo === 'gerado') {
             if (formValido) {
                concluidos++;
                card.classList.add('border-outline-variant');
                card.classList.remove('border-dashed', 'hover:border-primary-container');
                card.querySelector('.doc-icon').innerText = 'check_circle';
                card.querySelector('.doc-icon').classList.replace('text-outline', 'text-secondary');
                card.querySelector('.doc-label').classList.replace('text-on-surface-variant', 'text-on-surface');
                card.querySelector('.doc-label').classList.add('font-medium');
                const actionSpan = card.querySelector('div > span:last-child');
                if (actionSpan) {
                  actionSpan.innerText = 'Concluído';
                  actionSpan.className = 'text-secondary text-[11px] font-bold uppercase shrink-0';
                }
             } else {
                pendencias++;
                card.classList.remove('border-outline-variant');
                card.classList.add('border-outline-variant', 'border-dashed', 'hover:border-primary-container');
                card.querySelector('.doc-icon').innerText = 'radio_button_unchecked';
                card.querySelector('.doc-icon').classList.replace('text-secondary', 'text-outline');
                card.querySelector('.doc-label').classList.replace('text-on-surface', 'text-on-surface-variant');
                card.querySelector('.doc-label').classList.remove('font-medium');
                const actionSpan = card.querySelector('div > span:last-child');
                if (actionSpan) {
                  actionSpan.innerText = 'Pendente';
                  actionSpan.className = 'text-[#F17C58] text-[11px] font-bold uppercase shrink-0';
                }
             }
          } else if (card.classList.contains('concluido')) {
            concluidos++;
          } else {
             if (card.innerHTML.includes('required') || card.innerHTML.includes('Anexar')) {
               pendencias++;
             }
          }
        });
        
        const progresso = (concluidos / totalDocs) * 100;
        kitProgresso.innerText = concluidos + '/' + totalDocs;
        kitBar.style.width = progresso + '%';
        
        if (pendencias === 0) {
          submitBtn.className = "px-sm md:px-lg h-[36px] rounded text-[13px] font-medium flex items-center gap-xs transition-colors whitespace-nowrap bg-secondary text-on-secondary hover:opacity-90";
          submitBtn.querySelector('.hidden.sm\\\\:inline').innerText = "Submeter Pedido";
          submitBtn.querySelector('.sm\\\\:hidden').innerText = "Enviar";
          submitBtn.querySelector('.material-symbols-outlined').innerText = "send";
          footerWarning.classList.replace('lg:flex', 'hidden');
        } else {
          submitBtn.className = "px-sm md:px-lg h-[36px] rounded text-[13px] font-medium flex items-center gap-xs transition-colors whitespace-nowrap bg-surface-container-highest text-[#F17C58] cursor-not-allowed";
          submitBtn.querySelector('.hidden.sm\\\\:inline').innerText = "Submeter Pedido";
          submitBtn.querySelector('.sm\\\\:hidden').innerText = "Bloqueado";
          submitBtn.querySelector('.material-symbols-outlined').innerText = "warning";
          footerWarning.classList.replace('hidden', 'lg:flex');
        }
      };

      uploads.forEach(input => {
        input.addEventListener('change', (e) => {
          const card = e.target.closest('.doc-card');
          const fileInfo = card.querySelector('.doc-file-info');
          const fileExt = card.querySelector('.doc-file-ext');
          const fileSize = card.querySelector('.doc-file-size');
          const fileLink = card.querySelector('.doc-filename-link');
          const icon = card.querySelector('.doc-icon');
          const label = card.querySelector('.doc-label');
          const uploadContainer = card.querySelector('.doc-upload-container');
          const removeContainer = card.querySelector('.doc-remove-container');
          
          if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const ext = file.name.split('.').pop()?.toLowerCase() || 'arquivo';
            const size = file.size < 1024 * 1024 
              ? Math.round(file.size / 1024) + ' KB' 
              : (file.size / (1024 * 1024)).toFixed(1).replace('.', ',') + ' MB';
              
            fileExt.innerText = ext;
            fileSize.innerText = size;
            fileLink.title = 'Visualizar ' + file.name;
            
            // Note: In a static HTML page without a dev server, createObjectURL works perfectly until refresh
            fileLink.href = URL.createObjectURL(file);
            
            fileInfo.classList.remove('hidden');
            if(uploadContainer) uploadContainer.classList.add('hidden');
            if(removeContainer) removeContainer.classList.remove('hidden');
            
            card.classList.add('concluido');
            card.classList.remove('border-dashed');
            icon.innerText = 'check_circle';
            icon.classList.replace('text-outline', 'text-secondary');
            label.classList.replace('text-on-surface-variant', 'text-on-surface');
            label.classList.add('font-medium');
          }
          updateKitStatus();
        });
      });

      document.querySelectorAll('.doc-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const card = e.target.closest('.doc-card');
          const input = card.querySelector('.doc-upload');
          const fileInfo = card.querySelector('.doc-file-info');
          const icon = card.querySelector('.doc-icon');
          const label = card.querySelector('.doc-label');
          const uploadContainer = card.querySelector('.doc-upload-container');
          const removeContainer = card.querySelector('.doc-remove-container');
          
          input.value = '';
          fileInfo.classList.add('hidden');
          if(uploadContainer) uploadContainer.classList.remove('hidden');
          if(removeContainer) removeContainer.classList.add('hidden');
          
          card.classList.remove('concluido');
          card.classList.add('border-dashed');
          icon.innerText = 'radio_button_unchecked';
          icon.classList.replace('text-secondary', 'text-outline');
          label.classList.replace('text-on-surface', 'text-on-surface-variant');
          label.classList.remove('font-medium');
          updateKitStatus();
        });
      });

      document.querySelector("form")?.addEventListener("input", updateKitStatus);
      document.querySelector("form")?.addEventListener("change", updateKitStatus);
      updateKitStatus(); // Initial call
      
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const allUploaded = Array.from(uploads).every(u => u.files.length > 0);
        if (!allUploaded) {
          alert('A trava de envio está ativa. Anexe todos os documentos.');
          return;
        }
        
        const textSpan = submitBtn.querySelector('.hidden.sm\\\\:inline');
        textSpan.innerText = 'Enviando...';
        submitBtn.style.opacity = '0.7';
        
        setTimeout(() => {
          alert('✅ Solicitação enviada com sucesso!');
          textSpan.innerText = 'Submeter Pedido';
          submitBtn.style.opacity = '1';
          this.reset();
          document.querySelectorAll('.doc-remove').forEach(b => b.click());
        }, 1000);
      });
    });

      // Máscaras de Input
      const formatCPF = (v) => {
        const d = v.replace(/\\D/g, '').slice(0, 11);
        if (d.length <= 3) return d;
        if (d.length <= 6) return d.slice(0,3) + '.' + d.slice(3);
        if (d.length <= 9) return d.slice(0,3) + '.' + d.slice(3,6) + '.' + d.slice(6);
        return d.slice(0,3) + '.' + d.slice(3,6) + '.' + d.slice(6,9) + '-' + d.slice(9);
      };
      
      const formatCurrency = (v) => {
        const d = v.replace(/\\D/g, '');
        if (!d) return '';
        const n = parseInt(d, 10) / 100;
        return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
      };
      
      const formatDate = (v, isMonth) => {
        const d = v.replace(/\\D/g, '');
        if (!d) return '';
        if (isMonth) {
          const m = d.slice(0,6);
          if (m.length <= 2) return m;
          return m.slice(0,2) + '/' + m.slice(2);
        } else {
          const m = d.slice(0,8);
          if (m.length <= 2) return m;
          if (m.length <= 4) return m.slice(0,2) + '/' + m.slice(2);
          return m.slice(0,2) + '/' + m.slice(2,4) + '/' + m.slice(4);
        }
      };

      document.querySelectorAll('[data-mask]').forEach(el => {
        el.addEventListener('input', (e) => {
          const mask = el.getAttribute('data-mask');
          const isMonth = el.getAttribute('data-date-mode') === 'month';
          
          if (mask === 'cpf') {
            e.target.value = formatCPF(e.target.value);
          } else if (mask === 'currency' || mask === 'numeric') {
            e.target.value = formatCurrency(e.target.value);
          } else if (mask === 'date') {
            e.target.value = formatDate(e.target.value, isMonth);
          }
          updateKitStatus();
        });
      });
      
    });
  </script>

      
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

          <div id="modal-regulamento-content" class="flex-1 overflow-y-auto p-6 lg:p-8 bg-surface-container-lowest text-on-surface text-sm leading-relaxed space-y-6">
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
              <button id="modal-regulamento-aceitar" disabled class="px-6 py-2 text-sm font-bold bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-70 rounded transition-colors shadow-sm">Li e Aceito</button>
            </div>
          </div>
        </div>
      </div>

</body>
</html>`;
}

PROGRAMAS_APOIO.forEach(programa => {
  const fileName = `${programa.id}.html`;
  const filePath = path.join('public/src', fileName);
  fs.writeFileSync(filePath, generateHtml(programa));
  console.log(`Generated exact clone with toggle and spacing fixes for ${filePath}`);
});
console.log('All exact forms generated successfully.');
