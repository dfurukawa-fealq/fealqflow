import { GestaoLayout } from './GestaoLayout';
import { CrudLinhasApoio } from './components/CrudLinhasApoio';

export const GestaoLinhasApoio = () => {
  return (
    <GestaoLayout 
      title="Gestão de Linhas de Apoio" 
      description="Gerencie as Linhas de Incentivo. Excluir uma linha apenas a desativa (Soft Delete)."
    >
      <CrudLinhasApoio />
    </GestaoLayout>
  );
};
