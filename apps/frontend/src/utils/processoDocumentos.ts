export interface DocumentoDoProcesso {
  id: string;
  nome: string;
  obrigatorio: boolean;
  status: string;
  arquivo_nome: string | null;
}

export function formatarDocumentosDoProcesso(documentos: DocumentoDoProcesso[] | undefined): string[] {
  return (documentos ?? []).map((documento) => {
    const concluido = ['enviado', 'validado', 'concluido'].includes(documento.status)
      || Boolean(documento.arquivo_nome);

    if (concluido) return `${documento.nome} (Validado)`;
    if (!documento.obrigatorio) return `${documento.nome} (Opcional)`;
    return `FALTANDO: ${documento.nome}`;
  });
}
