type SecaoCondicional<T extends string> = {
  id: T;
  visivel?: boolean;
};

/** Numera as seções visíveis pela ordem em que aparecem no formulário. */
export const numerarSecoesVisiveis = <T extends string>(
  secoes: readonly SecaoCondicional<T>[],
): Record<T, number | undefined> => {
  let numero = 0;
  const resultado = Object.fromEntries(secoes.map(({ id, visivel = true }) => [
    id,
    visivel ? ++numero : undefined,
  ]));
  return resultado as Record<T, number | undefined>;
};
