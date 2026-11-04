import { GestaoLayout } from './GestaoLayout';
import { CrudFormularios } from './components/CrudFormularios';

export const GestaoFormularios = () => {
  return (
    <GestaoLayout 
      title="Gestão de Formulários (Auxílios)" 
      description="Gerencie os formulários, editais e regras de cada auxílio. Excluir desativa o item."
    >
      <CrudFormularios />
    </GestaoLayout>
  );
};
