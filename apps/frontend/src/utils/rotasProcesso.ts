const ROTAS_CURSO_EVENTO = new Set([
  '/projetos/form-curso',
  '/projetos/form-evento',
  '/projetos/form-curso-evento',
]);

/** Apelidos da mesma tela nunca devem converter o processo em um processo pai. */
export const saoRotasDoMesmoFormulario = (origem: string, destino: string) =>
  origem === destino || (ROTAS_CURSO_EVENTO.has(origem) && ROTAS_CURSO_EVENTO.has(destino));
