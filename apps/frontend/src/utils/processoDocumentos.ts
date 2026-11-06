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

    // Itens opcionais nunca entram na fração do Kit; o rótulo permanece explícito
    // mesmo quando já possuem arquivo ou foram concluídos.
    if (!documento.obrigatorio) return `${documento.nome} (Opcional)`;
    if (concluido) return `${documento.nome} (Validado)`;
    return `FALTANDO: ${documento.nome}`;
  });
}
