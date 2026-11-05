import { GestaoLayout } from './GestaoLayout';
import { CrudFormularios } from './components/CrudFormularios';

export const GestaoDocumentos = () => (
  <GestaoLayout title="Gestão de Documentos" description="Gerencie os documentos oficiais e seus modelos.">
    <CrudFormularios modo="documentos" />
  </GestaoLayout>
);
