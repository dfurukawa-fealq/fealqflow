import { GestaoLayout } from './GestaoLayout';
import { CrudFormularios } from './components/CrudFormularios';

export const GestaoFormularios = () => {
  return (
    <GestaoLayout 
      title="Gestão de Formulários" 
      description="Gerencie os formulários. Excluir desativa o item."
    >
      <CrudFormularios modo="formularios" />
    </GestaoLayout>
  );
};
