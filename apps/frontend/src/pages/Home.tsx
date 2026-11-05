import { Link } from 'react-router-dom';

const ganhos = [
  { icone: 'database', titulo: 'Fonte única de entrada de dados', texto: 'Centraliza as solicitações e reduz a dispersão de informações.' },
  { icone: 'rule', titulo: 'Padronização no preenchimento', texto: 'Organiza campos, documentos e regras para cada tipo de solicitação.' },
  { icone: 'auto_awesome', titulo: 'Inteligência nos formulários', texto: 'Aplica validações, dependências e orientações durante o preenchimento.' },
  { icone: 'trending_up', titulo: 'Escalabilidade', texto: 'Permite ampliar programas e projetos sem multiplicar planilhas e modelos.' },
  { icone: 'build', titulo: 'Facilidade de manutenção', texto: 'Facilita ajustes de regras, documentos e fluxos em um único ambiente.' },
];

export const Home = () => (
  <main className="min-h-screen bg-surface px-4 py-8 sm:px-8 lg:px-12">
    <div className="mx-auto max-w-6xl">
      <section className="overflow-hidden rounded-3xl bg-primary px-6 py-10 text-white shadow-lg sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-14">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary-fixed">
            <span className="material-symbols-outlined text-base">account_balance</span>
            Portal de Formulários FEALQ
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">FealqFlow</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">Um ambiente único para organizar, preencher e acompanhar solicitações da FEALQ.</p>
        </div>
        <span className="material-symbols-outlined mt-8 hidden text-[120px] text-secondary-fixed/30 lg:block">account_tree</span>
      </section>

      <section className="mt-8 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-2xl text-primary">info</span>
          <h2 className="text-2xl font-bold text-on-surface">Sobre o projeto</h2>
        </div>
        <p className="mt-5 max-w-4xl text-base leading-7 text-on-surface-variant">
          O objetivo principal é atender requisições vindas do site da FEALQ e, com isso, padronizar o preenchimento, equalizando as informações e a entrada de dados na FEALQ. O FealqFlow substitui gradualmente formulários que atualmente estão em formatos DOCX, PDF e Google Forms.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-on-surface">Ganhos esperados</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ganhos.map((ganho) => (
            <article key={ganho.titulo} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
              <span className="material-symbols-outlined text-3xl text-secondary">{ganho.icone}</span>
              <h3 className="mt-4 font-bold text-on-surface">{ganho.titulo}</h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{ganho.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <Link to="/projetos" className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
          <span className="material-symbols-outlined text-3xl text-primary">science</span>
          <h2 className="mt-3 text-xl font-bold text-on-surface">Projetos</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Acesse formulários para abertura e acompanhamento de projetos.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">Ver formulários <span className="material-symbols-outlined text-base transition group-hover:translate-x-1">arrow_forward</span></span>
        </Link>
        <Link to="/programas-de-apoio" className="group rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
          <span className="material-symbols-outlined text-3xl text-primary">handshake</span>
          <h2 className="mt-3 text-xl font-bold text-on-surface">Programas de Apoio</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Encontre formulários para bolsas, auxílios e demais apoios.</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">Ver formulários <span className="material-symbols-outlined text-base transition group-hover:translate-x-1">arrow_forward</span></span>
        </Link>
      </section>
    </div>
  </main>
);
