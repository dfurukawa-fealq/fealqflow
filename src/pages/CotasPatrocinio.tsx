import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field, CELULA_TABELA } from '../components/form/Field';
import { KitDocumental } from '../components/KitDocumental';
import { DocumentoExigido } from '../data/programasApoio';

const COTAS = [
  {
    nome: 'Diamante',
    valor: '50.000,00',
    qtd: '1',
    contrapartidas:
      'Estande 20m², Logo no palco principal, 10 ingressos VIP, Menção na abertura.',
  },
  {
    nome: 'Ouro',
    valor: '25.000,00',
    qtd: '3',
    contrapartidas:
      'Estande 9m², Logo nos banners menores, 5 ingressos normais.',
  },
];

const DOCUMENTOS: DocumentoExigido[] = [
  {
    id: 'apresentacao-online',
    label: 'Apresentação Online (Link / Hotsite)',
    descricao: 'Gerada pela plataforma a partir das cotas cadastradas.',
    tipo: 'gerado',
    obrigatorio: true,
  },
  {
    id: 'proposta-comercial',
    label: 'Proposta Comercial PDF',
    tipo: 'upload',
    obrigatorio: false,
    condicao: 'Anexo opcional, quando houver material próprio.',
  },
];

const CELULA = `${CELULA_TABELA} text-[12px]`;

export const CotasPatrocinio = () => (
  <FormPageLayout
    breadcrumb={['Área do Coordenador', 'Cotas e Contrapartidas de Patrocínio']}
    titulo="Tabela de Cotas e Contrapartidas de Patrocínio"
    codigo="CONV-FR-06-FOR"
    acaoPrincipal="Cadastrar Cotas de Patrocínio"
    acaoIcone="save"
    sidebar={
      <KitDocumental
        documentos={DOCUMENTOS}
        titulo="Formato do Kit de Apresentação"
      />
    }
  >
    <FormSection numero={1} icone="link" titulo="Vínculo do Patrocínio">
      <Field
        label="Nome do Evento"
        span={5}
        placeholder="Insira o nome do evento"
        valor="Simpósio Nacional de Agronegócio 2024"
      />
      <Field label="N° Projeto" span={3} valor="PRJ-2024-0891" disabled />
      <Field
        label="Coordenador Responsável"
        span={4}
        valor="Dr. Carlos Mendes Ferreira"
        disabled
      />
    </FormSection>

    <FormSection
      numero={2}
      icone="table_rows"
      titulo="Estruturação das Cotas"
      acao={
        <button className="h-[28px] px-sm text-secondary flex items-center gap-xs hover:bg-secondary/10 rounded transition-colors text-[12px] shrink-0">
          <span className="material-symbols-outlined text-[16px]">
            add_circle
          </span>
          Adicionar Linha
        </button>
      }
      livre
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low text-[11px] font-bold uppercase text-on-surface-variant border-b border-outline-variant">
              <th className="py-[6px] px-sm w-48">Nome Cota</th>
              <th className="py-[6px] px-sm w-32">Valor (R$)</th>
              <th className="py-[6px] px-sm w-24">Qtd.</th>
              <th className="py-[6px] px-sm min-w-[200px]">
                Contrapartidas Oferecidas
              </th>
              <th className="py-[6px] px-sm w-32 text-center">
                Exige Contrato?
              </th>
              <th className="py-[6px] px-sm w-12 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="text-[12px] text-on-surface">
            {COTAS.map((c) => (
              <tr
                key={c.nome}
                className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors group"
              >
                <td className="p-sm align-top">
                  <input className={CELULA} type="text" defaultValue={c.nome} />
                </td>
                <td className="p-sm align-top">
                  <input
                    className={`${CELULA} text-right tabular-nums`}
                    type="text"
                    defaultValue={c.valor}
                  />
                </td>
                <td className="p-sm align-top">
                  <input
                    className={`${CELULA} text-center tabular-nums`}
                    type="number"
                    defaultValue={c.qtd}
                  />
                </td>
                <td className="p-sm align-top">
                  <textarea
                    className={`${CELULA} h-auto py-xs resize-none`}
                    rows={2}
                    defaultValue={c.contrapartidas}
                  />
                </td>
                <td className="p-sm align-top text-center">
                  <input
                    defaultChecked
                    type="checkbox"
                    className="w-4 h-4 mt-1 rounded border-outline-variant text-secondary focus:ring-secondary cursor-pointer"
                  />
                </td>
                <td className="p-sm align-top text-center">
                  <button className="text-outline hover:text-error transition-colors mt-1 opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </td>
              </tr>
            ))}
            <tr className="hover:bg-surface-container-low/50 transition-colors">
              <td className="p-sm align-top">
                <input
                  className={`${CELULA} border-dashed border-outline-variant text-on-surface-variant`}
                  placeholder="Adicionar cota..."
                  type="text"
                />
              </td>
              <td className="p-sm align-top">
                <input
                  className={`${CELULA} text-right tabular-nums cursor-not-allowed`}
                  disabled
                  placeholder="0,00"
                  type="text"
                />
              </td>
              <td className="p-sm" colSpan={4}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </FormSection>
  </FormPageLayout>
);

