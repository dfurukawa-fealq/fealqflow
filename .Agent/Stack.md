# 🏛️ FealqFlow Architecture & Project Rules

This document serves as the central architectural reference and rulebook for the FealqFlow project (Portal de Formulários da FEALQ). Any AI agent or developer working on this codebase MUST adhere to the standards, structures, and guidelines defined below.

## 🛠️ Tech Stack

*   **Framework**: React 18+ via Vite (SPA - Single Page Application)
*   **Language**: TypeScript (Strict mode)
*   **Styling**: Tailwind CSS (Utility-first)
*   **Routing**: React Router DOM (v6+)
*   **Icons**: Material Symbols Outlined (via Google Fonts `<span className="material-symbols-outlined">`)

## 📁 Directory Structure

The project follows a modular and feature-centric directory organization:

```text
/
├── public/                 # Static assets (images, fonts, global index.html)
├── scripts/
│   └── patches/            # Temporary AI scripts (.cjs, .js) for bulk operations
├── src/
│   ├── components/         # Reusable global UI components (TopBar, Footer, Sidebar, KitDocumental)
│   │   └── form/           # Standardized Form elements (FormPageLayout, FormSection, Field)
│   ├── contexts/           # Global React Contexts (AdminContext, LayoutContext, EnvioContext)
│   ├── data/               # Static mock data and configuration objects (e.g., programasApoio.ts)
│   ├── layouts/            # Page layout wrappers (MainLayout)
│   ├── pages/              # Route-level components (Screens/Pages)
│   │   └── admin/          # Screens specific to the administrative painel
│   ├── types/              # Global TypeScript interfaces and types
│   ├── App.tsx             # Application entry point & React Router definition
│   ├── index.css           # Global Tailwind CSS entry point
│   └── main.tsx            # Vite/React DOM mount point
```

## 🧩 Architectural Patterns & Core Components

### 1. Layout Management (`LayoutContext` & `MainLayout`)
The application possesses two distinct structural states controlled by nested routing in `App.tsx`:
*   **With Sidebar** (`LayoutWithSidebar`): Used for Dashboards, Admin Panels, and internal navigation.
*   **Without Sidebar** (`LayoutWithoutSidebar`): Used for Form Filling pages (Programas, Apoios) e public facing interfaces to maximize screen space.

### 2. Standardized Form Engine (`FormPageLayout`)
All form pages MUST be wrapped in the `FormPageLayout` component. This component centrally handles:
*   Global header/titles and Breadcrumbs.
*   Detection of Sidebar presence to adapt its fixed footer (`bottom-0`).
*   Sticky footer with "Cancelar", "Salvar Rascunho" and "Submeter Pedido" actions.
*   Display of validation warnings (e.g., "Trava de Envio Ativa") strictly centered inside the footer.
*   Layout grids integrating the Form area (8 columns) and Kit Documental (4 columns).

### 3. Component Design
*   Use purely Functional Components with React Hooks.
*   Keep components small and single-responsibility. 
*   Form sections are built using the reusable `FormSection` wrapper and `Field` component to maintain visual consistency (labels, borders, paddings).

## ⚠️ Core Rules & Guardrails

### Project Conventions
1.  **Temporary Scripts (`.cjs`, `.js`, etc.)**: Any scripts created for patching, refactoring, modifying files in bulk, or seeding data MUST always be created and executed from inside the `scripts/patches/` directory. Do not create them in the root directory to avoid cluttering the repository.
2.  **No Custom CSS**: Always use Tailwind utility classes. Do not create separate `.css` or `.scss` files for component styling. If custom colors are needed, define them in `index.css` via `@theme` variables.
3.  **Strict Typing**: Do not use `any`. All properties, states, and API responses must be strongly typed and defined in `/src/types/` or co-located with the component.
4.  **Language**: All UI facing texts, comments explaining business rules, and meaningful variable names (e.g., forms, budgets) should prioritize Portuguese (PT-BR) as this is a regional enterprise application.

### UI/UX Rules
1.  **Responsive Layouts**: Design mobile-first but ensure all forms, grids, and tables behave appropriately on wide monitors (`max-w-[1200px]` is the standard constraint for forms).
2.  **Accessibility (A11y)**: Use proper semantic HTML, accessible contrast ratios, and clear feedback mechanisms (Warnings/Alerts).
3.  **Icons**: Exclusively use `Material Symbols Outlined` with Google Fonts. Avoid importing custom SVG icon files unless absolutely necessary for specific branding.

## 🌍 Build & Integração com WordPress

A aplicação é um Single Page Application (SPA) renderizado no lado do cliente.
Para integrar o FealqFlow a um ecossistema existente como o WordPress, as regras de **Build** devem ser rigorosamente seguidas.

### Processo de Build (`npm run build`)
O comando de build compila toda a aplicação React + Tailwind e gera artefatos estáticos prontos para produção.
1. O Vite está configurado com `base: './'`. Isso significa que todos os caminhos gerados para imagens, CSS e JS serão **relativos**. Essa regra não deve ser removida, pois é o que permite que a aplicação rode em subdiretórios do WordPress (ex: `fealq.com.br/portal-formularios/`).
2. **Geração Automática do Plano A**: Antes do Vite ser invocado, o comando de build executa automaticamente os scripts geradores do Plano A (localizados em `scripts/patches/`). Isso garante que o ecossistema estático de HTML seja regenerado e esteja 100% atualizado com os dados do projeto antes do empacotamento.
3. Ao rodar `npm run build`, a pasta `/dist/` será criada contendo:
   - `index.html`: Ponto de entrada (esqueleto).
   - `/assets/*.js`: Todo o código React, lógicas e componentes minificados.
   - `/assets/*.css`: Todo o estilo Tailwind purgado e minificado.
   - `/src/*.html`: Todo o conjunto de páginas HTML Puro independentes (Plano A).

### Como embarcar no WordPress
Existem duas formas principais de integrar o conteúdo da pasta `/dist/` no WordPress:
1. **Via iFrame (Mais simples e isolado)**: 
   - Fazer upload da pasta `dist/` via FTP para dentro do seu servidor (ex: `wp-content/uploads/fealqflow/`).
   - Na página do WordPress, usar um bloco HTML com `<iframe src="/wp-content/uploads/fealqflow/index.html" width="100%" height="1000px"></iframe>`.
2. **Via Custom Page Template (Avançado)**:
   - Copiar a div `<div id="root"></div>` para o corpo de uma página do WordPress.
   - Fazer o "enqueue" (carregamento) do arquivo `.js` e `.css` gerados na pasta `assets/` dentro do `functions.php` ou em um plugin de injeção de Headers/Footers. O próprio script do React vai assumir o controle da div `#root` e renderizar o sistema inteiro ali dentro, herdando inclusive parte do Header/Footer natural do site Wordpress.

## 📄 Plano A: HTML Puro Estático (Diretório `public/src`)

Por definição estratégica, a aplicação adota o modelo de **Plano A baseado em HTML Puro** para cenários que exigem máxima performance, zero dependência de JavaScript empacotado, ou injeção imaculada em iFrames no WordPress.

### Regras da Arquitetura Plano A:
1. **Localização**: Todos os arquivos HTML puros DEVEM ser criados e mantidos dentro do diretório `public/src/`.
2. **Processamento (Bypass do Build Vite)**: Os arquivos inseridos na pasta `public/` **NÃO** passam pelo pipeline de processamento de módulos do Vite. Eles são copiados **exatamente como estão** para a pasta `dist/src/` no momento do build. 
3. **Estilização Autônoma**: Para garantir o visual idêntico ao React, estes arquivos utilizam o Tailwind CSS via CDN (`<script src="https://cdn.tailwindcss.com"></script>`) configurado com as cores originais da FEALQ na tag `<head>`.
4. **Interatividade Nativa**: Toda a lógica de estado, validação e alertas ocorre usando Vanilla JavaScript (JS nativo) em tags `<script>` ao final da página.
5. **Integração Extrema**: Ideal para quando o WordPress tiver conflitos com bibliotecas React. Um iFrame apontando para `/wp-content/uploads/fealqflow/src/nome-do-form.html` carregará o formulário em milissegundos sem overhead.
6. **Automação de Geração**: Apesar de independentes, estes arquivos devem ser sempre gerados e atualizados por scripts TypeScript em `scripts/patches/` (para assegurar que dados sensíveis como `programasApoio.ts` estejam sincronizados com o HTML). A arquitetura foi montada para rodar essas gerações automaticamente como pré-requisito do `npm run build` no `package.json`.
