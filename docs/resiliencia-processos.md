# Salvamento e histórico de ações

Os formulários de Projetos e Programas de Apoio usam o limite de salvamento do
`FormPageLayout` e o executor exposto por `useEnvio().executarAcao`.

| Ação | Gravação |
| --- | --- |
| Abrir link, item de kit ou baixar documento | Aguarda salvar antes de abrir |
| Alterar checkbox, radio ou select | Salva após o manipulador atualizar o campo |
| Selecionar opção no campo de busca | Salva após selecionar |
| Anexar ou remover arquivo | Salva o formulário, realiza a operação e salva novamente |
| Cancelar, reiniciar ou concluir | Aguarda salvar antes de sair ou executar a decisão |
| Alterações durante o salvamento | Aguarda uma versão estável antes de navegar |

Um formulário novo recebe um único processo no primeiro salvamento. A criação é
serializada para impedir duplicação por ações simultâneas. Os subformulários com
`processo_pai` gravam em `dados_json.campos.__subformularios[rota]` do pai, sem
criar outro protocolo, e recuperam os campos ao serem reabertos.

Uma falha de gravação impede a navegação e aparece no formulário. O backup local
é mantido até a confirmação da gravação. O Cancelar preserva o rascunho, mas não
marca o subformulário como concluído nem envia o processo.

## Histórico

A migration `020_eventos_processo` cria `processo_eventos`. As rotas
`GET/POST /api/processos/:id/eventos` usam a mesma autorização do processo. O
formulário mostra os últimos 100 eventos em **Histórico do processo**.

O cliente registra início, sucesso e falha dos manipuladores de ação. O servidor
registra também os resultados HTTP das gravações, anexos e envios. O histórico
não armazena o conteúdo dos campos, tokens, arquivo ou URL com parâmetros. O
sucesso de download significa que a solicitação foi iniciada pelo aplicativo.
Uma indisponibilidade do histórico gera aviso, sem invalidar um salvamento já
confirmado. Antes de existir um processo não há histórico persistido por ID.

## Novas ações

Manipuladores que navegam programaticamente devem usar o executor (links nativos
no layout já são interceptados). Exemplo de ação que altera dados:

```tsx
await executarAcao('confirmar_opcao', async () => {
  atualizarCampo('opcaoConfirmada', true);
}, { antes: false, depois: true });
```

O teste `tests/e2e/resiliencia-processo.spec.ts` cobre processo novo, continuidade
do ID, navegação, cancelamento, recuperação do cadastro, falha de gravação,
seleção, flags, anexos, download e autorização dos eventos. Os processos criados
pelo teste são inativados ao terminar.
