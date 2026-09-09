import React, { useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { FormPageLayout } from '../components/form/FormPageLayout';
import { FormSection } from '../components/form/FormSection';
import { Field, CELULA_TABELA } from '../components/form/Field';
import { usePlanoAplicacaoCalculos, formatMoney, ESTRUTURA_DESPESAS } from './PlanoAplicacaoRecursos_Calculos';

export const PlanoAplicacaoRecursos = () => {
  // Controle de quais categorias estão expandidas (accordion)
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  
  const toggleCat = (catId: string) => {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const {
    valores,
    setters,
    cat1, cat2, cat3, cat4, cat5, cat6, cat7,
    receitaTotal,
    taxaBancaria,
    fpaFealqPercent,
    fpaDeptoPercent,
    fpaFzeaPercent,
    impostoInssPercent,
    impostoIssqnPercent,
    fpaFealq,
    fpaDepto,
    fpaFzea,
    fpaPref,
    fpaTotal,
    inss,
    issqn,
    impostoTotal,
    custoOperacional,
    custoTotal,
    saldoPrevisto,
    saldoZerado,
    reservaValida,
    podeEnviar
  } = usePlanoAplicacaoCalculos();

  let statusColorClass = 'bg-primary-container/20 border-primary-container text-on-surface';
  let statusIcon = 'check_circle';

  if (!saldoZerado || !reservaValida) {
    statusIcon = 'warning';
    if (saldoPrevisto > 0 && reservaValida) {
      statusColorClass = 'bg-green-50 border-green-500 text-green-700';
    } else {
      statusColorClass = 'bg-red-50 border-red-500 text-red-700';
    }
  }

  const footerCenter = (
    <div className={`px-md py-xs rounded flex items-center gap-sm border ${statusColorClass}`}>
      <span className="material-symbols-outlined text-[18px]">
        {statusIcon}
      </span>
      <div className="flex-1">
        <h4 className="font-bold text-[11px] uppercase tracking-wide leading-tight">Status do Orçamento</h4>
        {saldoZerado ? (
          <p className="text-[12px] leading-tight">Saldo zerado. Plano válido para submissão.</p>
        ) : (
          <p className="text-[12px] leading-tight">
            {saldoPrevisto > 0 
              ? `Saldo Positivo de ${formatMoney(saldoPrevisto)}. (Aloque mais recursos nas despesas).` 
              : `Saldo Negativo de ${formatMoney(Math.abs(saldoPrevisto))}. (Reduza despesas).`}
          </p>
        )}
        {!reservaValida && (
          <p className="text-[12px] leading-tight mt-[2px] font-bold text-red-700">
            Atenção: A Categoria 7 não pode exceder 10% do Custeio Total ({formatMoney(custoTotal)}).
          </p>
        )}
      </div>
    </div>
  );

  return (
    <FormPageLayout
      titulo="Plano de Aplicação de Recursos - Cursos FZEA"
      breadcrumb={['Área do Coordenador', 'Plano de Aplicação de Recursos']}
      acaoPrincipal="Salvar e Enviar"
      podeEnviar={podeEnviar}
      footerCenter={footerCenter}
      botoesAcoes={
        <button
          onClick={() => window.print()}
          className="px-lg h-[36px] rounded border border-outline text-on-surface text-[13px] hover:bg-surface-container-low transition-colors flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          Gerar PDF
        </button>
      }
    >
      <FormSection titulo="Identificação do Projeto" icone="badge" numero={1}>
        <Field label="Perfil do Projeto (FPA)" span={12} hint="Define as regras de taxas administrativas do projeto">
          <select
            value={valores.tipoProjetoFPA}
            onChange={(e) => setters.setTipoProjetoFPA(e.target.value as any)}
            className="w-full h-[40px] px-sm border border-outline-variant rounded bg-surface-container-lowest text-on-surface"
          >
            <option value="cursos">FZEA - Cursos</option>
            <option value="evento">FZEA - Evento</option>
            <option value="isento">FZEA - Isento</option>
          </select>
        </Field>
        <Field label="Título do Curso" span={12} placeholder="Digite o título do curso" />
        <Field label="Nome do Coordenador" span={8} placeholder="Digite o nome completo" />
        <Field label="Departamento/Setor" span={4} placeholder="Ex: ESALQ" />
        <Field label="Período de Execução (Início)" span={4} tipo="date" />
        <Field label="Período de Execução (Término)" span={4} tipo="date" />
      </FormSection>

      <FormSection titulo="Previsão de Receitas" icone="account_balance" numero={2}>
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-lg">
          <Field label="Receita de Inscrição" span={12} hint="Valores de inscrições pagos via plataforma">
            <NumericFormat
              value={valores.receitaInscricao === 0 ? '' : valores.receitaInscricao}
              onValueChange={(v) => setters.setReceitaInscricao(v.floatValue || 0)}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              allowNegative={false}
              placeholder="R$ 0,00"
              className="w-full h-[36px] px-sm py-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container outline-none"
            />
          </Field>
          <Field label="Receita de Patrocínio" span={12} hint="Aportes e repasses diretos">
            <NumericFormat
              value={valores.receitaPatrocinio === 0 ? '' : valores.receitaPatrocinio}
              onValueChange={(v) => setters.setReceitaPatrocinio(v.floatValue || 0)}
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              fixedDecimalScale
              allowNegative={false}
              placeholder="R$ 0,00"
              className="w-full h-[36px] px-sm py-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[13px] focus:border-primary-container outline-none"
            />
          </Field>
        </div>
        <div className="col-span-12 p-sm bg-surface-container-low rounded border border-outline-variant flex justify-between items-center mt-sm">
          <span className="font-bold text-[13px] uppercase tracking-wide text-on-surface-variant">Receita Total:</span>
          <span className="font-bold text-[16px] text-primary">{formatMoney(receitaTotal)}</span>
        </div>
      </FormSection>

      <FormSection titulo="Despesas Diretas (Custos Operacionais)" icone="payments" numero={3} livre>
        <div className="col-span-12 overflow-x-auto">
          <table className="w-full border-collapse text-left border border-outline-variant bg-surface-container-lowest">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-[11px] uppercase tracking-wide">
                <th className="p-sm font-bold border-b border-outline-variant">Categoria / Subitem</th>
                <th className="p-sm font-bold border-b border-outline-variant border-l w-48 text-right">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {ESTRUTURA_DESPESAS.map((cat) => {
                const isExpanded = expandedCats[cat.id];
                // Resgatar o subtotal calculado via hook
                const catTotal = { cat1, cat2, cat3, cat4, cat5, cat6, cat7 }[cat.id] as number;
                const temErroCat7 = cat.id === 'cat7' && !reservaValida;

                return (
                  <React.Fragment key={cat.id}>
                    {/* Linha Pai (Categoria) */}
                    <tr 
                      onClick={() => toggleCat(cat.id)} 
                      className="cursor-pointer group hover:bg-surface-container-low transition-colors border-b border-outline-variant bg-surface-container-lowest"
                    >
                      <td className="p-sm text-[13px] text-on-surface select-none">
                        <div className="flex items-start gap-xs">
                          <span className={`material-symbols-outlined text-[18px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            keyboard_arrow_down
                          </span>
                          <div>
                            <div className="font-bold">{cat.titulo}</div>
                            {cat.descricao && (
                              <div className="text-[11px] text-on-surface-variant mt-1">
                                {cat.descricao}
                              </div>
                            )}
                            {temErroCat7 && (
                              <div className="text-error font-bold text-[11px] mt-1">
                                Limite Máximo Atingido: {formatMoney(custoTotal * 0.10)} (10% do Custeio Total).
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={`p-sm border-l border-outline-variant text-right tabular-nums text-[13px] font-bold ${temErroCat7 ? 'text-error' : 'text-on-surface'}`}>
                        {formatMoney(catTotal)}
                      </td>
                    </tr>
                    
                    {/* Linhas Filhas (Itens) */}
                    {isExpanded && cat.itens.map(item => (
                      <tr key={item.id} className="bg-surface-container-lowest/30 border-b border-outline-variant transition-all">
                        <td className="py-[6px] pr-sm pl-[36px] text-[13px] text-on-surface">
                          {item.nome}
                        </td>
                        <td className="p-0 border-l border-outline-variant">
                          <NumericFormat
                            value={valores.despesasDetalhes[item.id] === 0 ? '' : valores.despesasDetalhes[item.id]}
                            onValueChange={(v) => setters.setDespesaDetalhe(item.id, v.floatValue || 0)}
                            thousandSeparator="." 
                            decimalSeparator="," 
                            prefix="R$ " 
                            decimalScale={2} 
                            fixedDecimalScale 
                            allowNegative={false}
                            placeholder="R$ 0,00" 
                            className={`${CELULA_TABELA} text-right tabular-nums ${temErroCat7 ? 'text-error' : ''} bg-transparent`}
                          />
                        </td>
                      </tr>
                    ))}

                    {/* Regra Especial: Linha Automática 4.34 para a Categoria 4 */}
                    {isExpanded && cat.id === 'cat4' && (
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <td className="py-xs pr-sm pl-[36px] text-[13px] text-on-surface-variant italic">
                          ↳ 4.34 Serviços de Op. Financeiras (3,99% sobre Inscrições) - Automático
                        </td>
                        <td className="p-sm border-l border-outline-variant text-right tabular-nums text-[13px] text-on-surface-variant bg-surface-container-low">
                          {formatMoney(taxaBancaria)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              
              {/* Totalizador de Custo Operacional */}
              <tr className="bg-surface-container font-bold text-on-surface">
                <td className="p-sm text-right text-[12px] uppercase">
                  Subtotal (Custo Operacional):
                </td>
                <td className="p-sm text-right tabular-nums text-[13px]">
                  {formatMoney(custoOperacional)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FormSection>

      <FormSection titulo="Taxas Administrativas e Impostos" icone="account_balance_wallet" numero={4} livre>
        <div className="col-span-12 overflow-x-auto">
          <table className="w-full border-collapse text-left border border-outline-variant bg-surface-container-lowest">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-[11px] uppercase tracking-wide">
                <th className="p-sm font-bold border-b border-outline-variant w-1/3">Item</th>
                <th className="p-sm font-bold border-b border-outline-variant border-l">Base de Cálculo / Regra</th>
                <th className="p-sm font-bold border-b border-outline-variant border-l w-48">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {/* FPA */}
              <tr>
                <td className="p-sm border-b border-outline-variant text-[13px] font-bold text-on-surface bg-surface-container-low" colSpan={2}>
                  Fundo de Pesquisa e Administração (FPA)
                </td>
                <td className="p-sm border-b border-outline-variant border-l text-[13px] font-bold text-on-surface bg-surface-container-low text-right tabular-nums">
                  {formatMoney(fpaTotal)}
                </td>
              </tr>
              <tr className="bg-transparent group">
                <td className="p-sm border-b border-outline-variant text-[13px] text-on-surface">10.1 FEALQ</td>
                <td className="p-sm border-b border-outline-variant border-l text-[12px] text-on-surface-variant">{fpaFealqPercent.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}% sobre a Receita Total</td>
                <td className="p-sm border-b border-outline-variant border-l text-right tabular-nums text-[13px] bg-surface-container-lowest">{formatMoney(fpaFealq)}</td>
              </tr>
              <tr className="bg-surface-container-lowest/50 group">
                <td className="p-sm border-b border-outline-variant text-[13px] text-on-surface">10.2 Departamento</td>
                <td className="p-sm border-b border-outline-variant border-l text-[12px] text-on-surface-variant">{fpaDeptoPercent.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}% sobre a Receita Total</td>
                <td className="p-sm border-b border-outline-variant border-l text-right tabular-nums text-[13px] bg-surface-container-lowest">{formatMoney(fpaDepto)}</td>
              </tr>
              <tr className="bg-transparent group">
                <td className="p-sm border-b border-outline-variant text-[13px] text-on-surface">10.3 FZEA</td>
                <td className="p-sm border-b border-outline-variant border-l text-[12px] text-on-surface-variant">{fpaFzeaPercent.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}% sobre a Receita Total</td>
                <td className="p-sm border-b border-outline-variant border-l text-right tabular-nums text-[13px] bg-surface-container-lowest">{formatMoney(fpaFzea)}</td>
              </tr>
              <tr className="bg-surface-container-lowest/50 group">
                <td className="p-sm border-b border-outline-variant text-[13px] text-on-surface flex items-center gap-xs">
                  10.4 Pref. do Campus
                  <div className="w-[80px]">
                    <NumericFormat
                      value={valores.fpaPrefPercent === 0 ? '' : valores.fpaPrefPercent}
                      onValueChange={(v) => setters.setFpaPrefPercent(v.floatValue || 0)}
                      thousandSeparator="." decimalSeparator="," decimalScale={2} allowNegative={false}
                      placeholder="0,00" className="w-full h-[24px] px-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-[12px] text-right"
                    />
                  </div>
                  %
                </td>
                <td className="p-sm border-b border-outline-variant border-l text-[12px] text-on-surface-variant">Percentual sobre a Receita Total</td>
                <td className="p-sm border-b border-outline-variant border-l text-right tabular-nums text-[13px] bg-surface-container-lowest">{formatMoney(fpaPref)}</td>
              </tr>
              
              {/* Impostos */}
              <tr>
                <td className="p-sm border-b border-outline-variant text-[13px] font-bold text-on-surface bg-surface-container-low" colSpan={2}>
                  Impostos
                </td>
                <td className="p-sm border-b border-outline-variant border-l text-[13px] font-bold text-on-surface bg-surface-container-low text-right tabular-nums">
                  {formatMoney(impostoTotal)}
                </td>
              </tr>
              <tr className="bg-transparent group">
                <td className="p-sm border-b border-outline-variant text-[13px] text-on-surface">11.1 INSS Patronal</td>
                <td className="p-sm border-b border-outline-variant border-l text-[12px] text-on-surface-variant">{impostoInssPercent.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}% sobre a Categoria 1 (Pagamentos PF)</td>
                <td className="p-sm border-b border-outline-variant border-l text-right tabular-nums text-[13px] bg-surface-container-lowest">{formatMoney(inss)}</td>
              </tr>
              <tr className="bg-surface-container-lowest/50 group">
                <td className="p-sm border-b border-outline-variant text-[13px] text-on-surface">11.2 I.S.S.Q.N.</td>
                <td className="p-sm border-b border-outline-variant border-l text-[12px] text-on-surface-variant">{impostoIssqnPercent.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}% sobre a Receita Total</td>
                <td className="p-sm border-b border-outline-variant border-l text-right tabular-nums text-[13px] bg-surface-container-lowest">{formatMoney(issqn)}</td>
              </tr>
              
              <tr className="bg-surface-container font-bold text-on-surface">
                <td colSpan={2} className="p-sm text-right text-[12px] uppercase">
                  Subtotal (FPA + Impostos):
                </td>
                <td className="p-sm text-right tabular-nums text-[13px]">
                  {formatMoney(fpaTotal + impostoTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </FormSection>
    </FormPageLayout>
  );
};

