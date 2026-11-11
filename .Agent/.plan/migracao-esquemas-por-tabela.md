# Plano: organização granular dos esquemas por tabela

## Objetivo

Criar arquivos TypeScript independentes, um por tabela, para registrar nomes, campos, tipos e regras de esquema de forma reaplicável durante a migração. Nesta etapa, o trabalho deve se limitar à criação desses arquivos de definição em `data/`.

## Limites desta etapa

- Criar os arquivos de esquema listados abaixo em `data/`.
- Não alterar componentes, páginas, imports, listas ou qualquer comportamento do frontend.
- Não alterar tabelas, executar SQL ou criar migrações de banco nesta etapa.
- Não mover nem substituir os arquivos de referência existentes.
- Tratar os arquivos novos como documentação tipada do esquema, sem conectá-los à aplicação ainda.

## Referências encontradas

- `apps/frontend/src/data/listas.ts`: contém os valores atuais de `TIPOS_EVENTO` e `UNIDADES_USP`. Esses dados são listas de domínio, não definem todas as colunas de tabelas.
- `apps/frontend/src/data/programasApoio.ts`: define `TipoDocumento` (`gerado | upload | externo | aceite`) e `DocumentoExigido`, uma estrutura usada por documentos exigidos em formulários. Ela não comprova, por si só, que exista tabela persistida com as mesmas colunas.
- `apps/backend/migrations/008_catalogo_postgresql.mjs`: define `cadastros_formularios` e a tabela atualmente chamada `documentos_cadastro`.
- `apps/backend/migrations/010_autenticacao_admin.mjs`: define a tabela física `users` e os campos de autenticação.

## Arquivos a criar

Criar um arquivo por tabela, usando o nome físico confirmado como base:

| Arquivo em `data/` | Tabela | Conteúdo previsto |
| --- | --- | --- |
| `users.ts` | `users` | Campos: `id`, `username`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`, `last_login_at`. Preservar o nome plural da tabela. |
| `cadastros_formularios.ts` | `cadastros_formularios` | Campos e restrições conforme a migração 008: `id`, `nome`, `tipo`, `tipo_cadastro`, `linha_apoio_id`, `status`, `normas`, `periodos_submissao`, `documentos_solicitados`, `active`, `habilitado`, `nseq`, `criado_em`, `atualizado_em`. |
| `cadastro_documentos.ts` | Nome desejado: `cadastro_documentos` (nome atual: `documentos_cadastro`) | Registrar os campos atuais: `id`, `nome`, `descricao`, `template_url`, `active`, `criado_em`, `atualizado_em`. Anotar que a tabela atual está vazia, segundo a confirmação do responsável, e que o nome físico só muda em migração futura. |
| `tipos_evento.ts` | `tipos_evento` | Registrar os valores atualmente mantidos em `TIPOS_EVENTO` como referência inicial; não inventar colunas ou chaves ainda não definidas. |
| `unidades_usp.ts` | `unidades_usp` | Registrar os valores atualmente mantidos em `UNIDADES_USP` como referência inicial; não inventar colunas ou chaves ainda não definidas. |
| `tipodocumento.ts` | `tipodocumento` | Documentar a referência atual `TipoDocumento` (`gerado`, `upload`, `externo`, `aceite`) e marcar campos relacionais/persistidos não confirmados como pendentes de definição. |
| `documentoexigido.ts` | `documentoexigido` | Usar `DocumentoExigido` como referência de domínio: `id`, `label`, `descricao?`, `tipo`, `obrigatorio`, `condicao?`, `acaoEmail?`, `url_template?`, `documentoId?`, `status?`, `onAbrirLink?`, `linkTexto?`. Sinalizar quais propriedades são comportamento/estado de interface e não devem ser presumidas como colunas de banco. |

## Regras para os arquivos

1. Cada arquivo deve declarar explicitamente o nome da tabela correspondente e seus campos/valores em tipos TypeScript estritos.
2. Não usar `any`.
3. Preservar os nomes físicos existentes quando confirmados. A exceção é documentar `cadastro_documentos` como nome-alvo, sem alterar o banco agora.
4. Diferenciar claramente esquema persistido, lista de domínio e tipo de interface.
5. Quando a fonte disponível não definir campos relacionais ou colunas, registrar a lacuna como pendente; não criar estrutura por suposição.
6. Manter os arquivos independentes nesta etapa: não adicionar barrel, imports nos arquivos atuais, nem alterar o frontend.

## Sequência de execução

1. Transcrever os campos confirmados das migrações 008 e 010 para os arquivos correspondentes.
2. Separar as referências de domínio de eventos, unidades e documentos a partir dos arquivos TypeScript atuais.
3. Criar os sete arquivos em `data/` com notas de proveniência e pendências onde o esquema físico não estiver confirmado.
4. Revisar a correspondência entre nome do arquivo, nome lógico/tabela e fonte utilizada.
5. Confirmar por inspeção que apenas os arquivos de definição foram criados e que nenhum arquivo do frontend foi alterado.

## Etapa futura, fora do escopo atual

- Definir e aprovar as colunas e relações físicas de `tipos_evento`, `unidades_usp`, `tipodocumento` e `documentoexigido`.
- Criar uma migração versionada que renomeie `documentos_cadastro` para `cadastro_documentos`, verificando compatibilidade com instalações existentes. A tabela estar vazia não elimina a necessidade de atualizar o esquema dos bancos.
- Avaliar integração futura dos arquivos de `data/` com backend ou frontend em tarefa separada.
