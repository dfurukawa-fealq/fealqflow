import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field, CELULA_TABELA as CELULA } from '../components/form/Field';

const ETAPAS = [
  {
    n: 1,
    descricao: 'Levantamento Bibliográfico e Aquisição de Insumos',
    inicio: '1',
    fim: '3',
  },
  { n: 2, descricao: 'Desenvolvimento do Protótipo Alfa', inicio: '4', fim: '8' },
];

const PARCELAS = [
  { n: '1ª', etapa: 'Etapa 1 - Aquisição', valor: '50.000,00', mes: '1' },
];

const BotaoAdicionar = ({ rotulo }: { rotulo: string }) => (
  <button className="h-[28px] px-sm bg-surface text-primary-container border border-outline-variant rounded flex items-center gap-xs hover:bg-surface-container-high text-[11px] font-bold uppercase tracking-wide shrink-0">
    <span className="material-symbols-outlined text-[16px]">add</span>
    {rotulo}
  </button>
);

export const PlanoTrabalho = () => (
  <FormPageLayout
    breadcrumb={['Área do Coordenador', 'Plano de Trabalho']}
    titulo="Plano de Trabalho"
    codigo="FR16-PRO"
    acaoPrincipal="Finalizar e Validar Plano de Trabalho"
    acaoIcone="verified"
  >
    <FormSection numero={1} icone="description" titulo="Cabeçalho">
      <Field
        label="Título do Projeto"
        valor="Desenvolvimento de Tecnologia Assistiva Avançada"
      />
      <Field
        label="Objeto"
        span={6}
        tipo="textarea"
        valor="Pesquisa e desenvolvimento de próteses modulares de baixo custo..."
      />
      <Field
        label="Objetivo"
        span={6}
        tipo="textarea"
        valor="Garantir acessibilidade tecnológica para populações em situação de vulnerabilidade."
      />
      <Field
        label="Justificativa"
        span={6}
        tipo="textarea"
        valor="A alta demanda reprimida por soluções protéticas personalizadas..."
      />
      <Field
        label="Resultados Esperados"
        span={6}
        tipo="textarea"
        valor="Protótipo funcional validado em ambiente relevante; 2 artigos científicos publicados."
      />
    </FormSection>

    <FormSection numero={2} icone="group" titulo="Equipe">
      <Field label="Coordenador" span={4} valor="Dr. Carlos Mendes" />
      <Field label="CPF" span={4} valor="123.456.789-00" />
      <Field
        label="E-mail"
        span={4}
        tipo="email"
        valor="carlos.mendes@instituicao.edu.br"
      />
      <Field
        label="Vínculo Institucional"
        span={4}
        tipo="select"
        opcoes={['Docente Efetivo', 'Pesquisador Visitante']}
      />
      <Field label="CERT" span={4} valor="CERT-2024-998" />
      <Field
        label="Contato Parceiro (Opcional)"
        span={4}
        placeholder="Nome/Telefone"
      />
    </FormSection>

    <FormSection
      numero={3}
      icone="checklist"
      titulo="Cronograma Físico (Etapas)"
      acao={<BotaoAdicionar rotulo="Adicionar Etapa" />}
      livre
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase">
              <th className="p-sm w-12 text-center">Nº</th>
              <th className="p-sm">Descrição da Meta/Etapa</th>
              <th className="p-sm w-32">Mês Início</th>
              <th className="p-sm w-32">Mês Fim</th>
              <th className="p-sm w-16"></th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {ETAPAS.map((e) => (
              <tr
                key={e.n}
                className="border-b border-outline-variant/50 hover:bg-surface/50"
              >
                <td className="p-sm text-center text-on-surface-variant">
                  {e.n}
                </td>
                <td className="p-sm">
                  <input className={CELULA} type="text" defaultValue={e.descricao} />
                </td>
                <td className="p-sm">
                  <input className={CELULA} type="number" defaultValue={e.inicio} />
                </td>
                <td className="p-sm">
                  <input className={CELULA} type="number" defaultValue={e.fim} />
                </td>
                <td className="p-sm text-center">
                  <button className="text-outline hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FormSection>

    <FormSection
      numero={4}
      icone="payments"
      titulo="Cronograma Financeiro (Parcelas)"
      acao={<BotaoAdicionar rotulo="Adicionar Parcela" />}
      livre
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase">
              <th className="p-sm w-16 text-center">Parcela</th>
              <th className="p-sm">Vínculo à Etapa (Ref.)</th>
              <th className="p-sm w-48 text-right">Valor (R$)</th>
              <th className="p-sm w-32">Mês Previsto</th>
              <th className="p-sm w-16"></th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {PARCELAS.map((p) => (
              <tr
                key={p.n}
                className="border-b border-outline-variant/50 hover:bg-surface/50"
              >
                <td className="p-sm text-center text-on-surface-variant">
                  {p.n}
                </td>
                <td className="p-sm">
                  <input className={CELULA} type="text" defaultValue={p.etapa} />
                </td>
                <td className="p-sm">
                  <input
                    className={`${CELULA} text-right`}
                    type="text"
                    defaultValue={p.valor}
                  />
                </td>
                <td className="p-sm">
                  <input className={CELULA} type="number" defaultValue={p.mes} />
                </td>
                <td className="p-sm text-center">
                  <button className="text-outline hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </td>
              </tr>
            ))}
            <tr className="bg-surface-container-low border-t-2 border-outline-variant text-[11px] font-bold uppercase">
              <td className="p-sm text-right text-on-surface-variant" colSpan={2}>
                Total Previsto:
              </td>
              <td className="p-sm text-right text-primary text-[13px]">
                R$ 50.000,00
              </td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </FormSection>

    <FormSection numero={5} icone="draw" titulo="Formato de Submissão (Kit)">
      <Field
        label="Formato"
        tipo="radio"
        opcoes={[
          'Formulário Online Integrado',
          'Minuta Assinada DocuSign (PDF)',
        ]}
        padrao="Formulário Online Integrado"
        hint="* Preencha todos os campos obrigatórios para liberar a validação."
      />
    </FormSection>
  </FormPageLayout>
);

