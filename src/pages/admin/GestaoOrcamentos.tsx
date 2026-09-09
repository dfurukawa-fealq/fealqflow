import { GestaoLayout } from './GestaoLayout';
import { CrudOrcamentos } from './components/CrudOrcamentos';

export const GestaoOrcamentos = () => {
  return (
    <GestaoLayout 
      title="Gestão de Orçamentos" 
      description="Gerencie os tetos e saldos globais de cada programa/formulário."
    >
      <CrudOrcamentos />
    </GestaoLayout>
  );
};
