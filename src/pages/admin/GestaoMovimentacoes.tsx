import { GestaoLayout } from './GestaoLayout';
import { MovimentacoesOrcamentarias } from './components/MovimentacoesOrcamentarias';

export const GestaoMovimentacoes = () => {
  return (
    <GestaoLayout 
      title="Movimentações Orçamentárias" 
      description="Controle os aportes, transferências e reduções orçamentárias."
    >
      <MovimentacoesOrcamentarias />
    </GestaoLayout>
  );
};
