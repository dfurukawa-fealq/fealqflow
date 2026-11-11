# Plano de Code Review e Refatoração — FealqFlow

## Objetivo

Melhorar a estabilidade, a legibilidade e a manutenção do FealqFlow, reduzindo código repetido sem alterar regras de negócio, rotas públicas ou o comportamento dos processos já iniciados.

O princípio central será: primeiro preservar dados e contratos existentes; depois consolidar componentes e regras repetidas; por fim remover compatibilidade legada somente quando houver evidência de migração concluída.

## Diagnóstico inicial

### 1. Persistência e autosave

- `ProcessoContext` concentra criação, carregamento, autosave, envio, anexos e retomada.
- `FormPageLayout` também captura alterações diretamente do DOM, enquanto vários componentes usam `useProcessoState`.
- Existem dois caminhos de persistência para o mesmo campo: estado React e captura DOM.
- `Field` já foi migrado para chaves estáveis, mas ainda mantém aliases baseados em `useId` para compatibilidade.
- A rotina de salvamento é chamada por nomes diferentes (`salvar` e `save_state`) e alguns fluxos repetem o salvamento antes de navegar.

### 2. Formulários duplicados

- Os formulários de Programas de Apoio repetem a mesma sequência de estados (`nome`, `cpf`, `email`, `telefone`, instituição, departamento, valores e dados do auxílio).
- `AberturaCursoEvento.tsx` é um arquivo muito grande e concentra layout, estado, regras de negócio, rastreabilidade, kit e modais.
- `ProjetoPesquisa.tsx` e `ProjetoPesquisaV2.tsx` possuem sobreposição de campos e estruturas, mas não compartilham um modelo de dados comum.
- Seções de coordenador, equipe, LGPD, orientações, convenio, propriedade intelectual e ações de rodapé já existem como componentes, porém suas regras de vinculação ainda são parcialmente repetidas nas páginas.

### 3. Rastreamento e navegação

- A construção de URLs vinculadas e o retorno ao processo pai aparecem em vários formulários.
- A regra `processo_pai`, `rota_retorno`, `protocolo` e `sessao` é repetida e pode divergir entre páginas.
- O Plano de Aplicação agora possui `processo_pai_id` no banco, mas a estratégia de identificação de processo raiz/filho precisa ser aplicada também às consultas administrativas e aos painéis.

### 4. Tipagem e qualidade

- Há ocorrências de `any` em componentes e páginas, inclusive em callbacks de campos e respostas de catálogo.
- Há conversões `as any` em eventos e estruturas de listas.
- Algumas interfaces de respostas HTTP são declaradas localmente e repetidas em diferentes páginas.
- Existem textos com sinais de codificação inconsistente (`Ã`, `Â`) em arquivos existentes; isso deve ser tratado como tarefa própria para não misturar correção de conteúdo com refatoração funcional.

### 5. Backend e contratos

- O backend usa consultas SQL extensas diretamente nas rotas.
- O contrato de processos, documentos, usuários e catálogo está espalhado entre handlers, migrations e tipos locais do frontend.
- A migration de processos concentra várias alterações incrementais; novas mudanças devem ser versionadas e acompanhadas de compatibilidade para ambientes já instalados.

## Estratégia de execução

### Fase 0 — Baseline e proteção

1. Registrar o estado atual com `git status`, `npm run lint` e build quando o ambiente tiver memória suficiente.
2. Criar uma matriz de fluxos críticos:
   - iniciar formulário direto;
   - retomar processo;
   - salvar rascunho;
   - atualizar a página;
   - abrir LGPD, Orientações e Plano de Aplicação;
   - retornar ao processo pai;
   - submeter processo;
   - anexar e baixar documento;
   - usuário não autenticado e perfis administrativos.
3. Criar testes manuais automatizáveis ou de integração para cada fluxo antes de remover duplicações.

### Fase 1 — Contrato único de processo e autosave

1. Definir tipos compartilhados em `apps/frontend/src/types/` para:
   - `Processo`;
   - `DadosProcesso`;
   - `ProcessoLocal`;
   - `DocumentoProcesso`;
   - respostas de API e erros.
2. Escolher `save_state` como nome público único e manter `salvar` apenas como alias temporário de compatibilidade.
3. Criar uma função de normalização de chave de campo, evitando chaves baseadas em texto visual ou `useId`.
4. Definir uma política única:
   - alterações de campo atualizam o estado em memória;
   - autosave com debounce persiste no servidor;
   - ações de navegação aguardam `save_state`;
   - `pagehide`/troca de aba tenta persistir o último snapshot;
   - falhas exibem feedback e preservam o backup local.
5. Eliminar a duplicidade entre captura DOM e componentes controlados, mantendo captura DOM somente como fallback explicitamente identificado.
6. Criar um registro global de campos obrigatórios com chave, rótulo, valor e visibilidade, além da validação HTML existente. O envio deve apresentar o primeiro campo pendente e uma lista resumida dos demais.

### Fase 2 — Componentes e padrões de formulário

1. Consolidar componentes de campo:
   - `Field`;
   - `MaskedInput`;
   - CPF, RG, telefone e CEP;
   - data, número, moeda e select pesquisável.
2. Remover `any` de `Field`, callbacks e eventos, usando tipos discriminados por `TipoCampo`.
3. Criar componentes de layout para:
   - seção de formulário;
   - rodapé de ações;
   - status/toast;
   - confirmação;
   - kit documental;
   - alerta de pendências.
4. Definir a ordem universal do rodapé em um único componente, com slots semânticos (`cancelar`, `status`, `secundarias`, `rascunho`, `principal`).
5. Garantir comportamento mobile por componente, sem regras específicas espalhadas nas páginas.

### Fase 3 — Rastreabilidade e processos pai/filho

1. Criar um utilitário único para construir e validar URLs vinculadas.
2. Criar um hook ou serviço para:
   - identificar se veio de processo pai;
   - obter rota segura de retorno;
   - montar protocolo/sessão/formulário;
   - registrar abertura e conclusão.
3. Aplicar `processo_pai_id` em:
   - listagem de rascunhos;
   - histórico;
   - painéis de Projetos;
   - painéis de Programas de Apoio;
   - contadores e status.
4. Garantir que processos filhos não sejam contados como processos raiz, mas continuem visíveis dentro do Kit do pai.
5. Criar migração/rotina de saneamento para registros antigos sem `processo_pai_id`, com relatório antes de qualquer inativação automática.

### Fase 4 — Redução de duplicação nas páginas

1. Extrair um modelo comum para formulários de Programas de Apoio:
   - identificação do solicitante;
   - dados institucionais;
   - dados do auxílio;
   - valores e justificativa;
   - ações finais.
2. Migrar cada página para configuração tipada de campos e seções, mantendo componentes específicos apenas onde houver regra própria.
3. Dividir `AberturaCursoEvento.tsx` em módulos:
   - estado e modelo;
   - URLs/rastreabilidade;
   - kit documental;
   - seções visuais;
   - regras de validação;
   - ações e modais.
4. Unificar `ProjetoPesquisa` e `ProjetoPesquisaV2` por uma camada de configuração/versionamento, mantendo componentes distintos somente quando a versão realmente exigir.
5. Remover arrays mockados e descrições duplicadas das páginas quando já existirem no catálogo ou no banco.

### Fase 5 — Backend, catálogo e consultas

1. Centralizar tipos e validadores de payload no backend.
2. Separar rotas HTTP de regras de domínio e consultas SQL.
3. Criar funções de acesso para processos raiz, filhos, documentos e status do Kit.
4. Adicionar filtros explícitos de:
   - ativo;
   - categoria/perfil/tenant;
   - processo raiz ou filho;
   - formulário/versionamento.
5. Padronizar respostas de erro com código, mensagem para usuário e detalhe técnico para log.
6. Adicionar índices para `processo_pai_id`, `formulario_rota`, `categoria`, `status` e `ativo`.

### Fase 6 — Segurança, acessibilidade e observabilidade

1. Remover `any` e validar todos os payloads externos.
2. Revisar autorização de processo pai/filho e escopo por perfil/tenant.
3. Garantir que links de retorno não permitam navegação fora das rotas permitidas.
4. Padronizar foco, `aria-live`, `aria-label`, teclado e mensagens de erro.
5. Adicionar logs estruturados para falha de autosave, conflito de versão, acesso negado e erro de migração.
6. Não registrar dados pessoais completos em logs.

## Ordem de prioridade

### P0 — Risco de perda ou inconsistência de dados

- contrato único do autosave;
- chaves estáveis de campos;
- processo pai/filho;
- validação global de obrigatórios;
- recuperação após refresh e falha de rede.

### P1 — Manutenção e duplicação

- tipos compartilhados;
- FormActionFooter;
- componentes de campos e máscaras;
- utilitário de rastreabilidade;
- divisão dos arquivos grandes.

### P2 — Evolução e qualidade

- configuração declarativa dos formulários;
- extração de serviços backend;
- observabilidade;
- limpeza de codificação textual;
- testes de acessibilidade e desempenho.

## Critérios de aceite

- Nenhum campo preenchido é perdido ao trocar de seção, abrir um subformulário, atualizar a página ou voltar ao processo.
- O autosave ocorre sem exigir chamadas manuais em cada componente novo.
- O botão de envio identifica todos os obrigatórios pendentes de forma consistente.
- Processos filhos não aparecem como processos iniciados independentes.
- Formulários diretos e formulários vinculados mantêm retornos corretos.
- `npm run lint` passa sem `any` novo.
- O build de produção passa em ambiente com memória suficiente.
- Não há alteração de comportamento para usuários não logados, perfis administrativos ou processos antigos sem plano de migração.

## Riscos e cuidados

- Não remover aliases de campos antes de verificar dados já persistidos.
- Não substituir o backend de persistência por `localStorage`; o backup local deve ser apenas contingência.
- Não migrar todas as páginas de uma vez: cada grupo deve ser refatorado e validado isoladamente.
- Não esconder registros antigos de forma silenciosa; processos sem vínculo devem ser identificados e tratados por migração controlada.
- Não misturar correção de codificação com mudança de regra de negócio.

## Entregas sugeridas

1. PR 1 — Baseline, tipos e contrato de autosave.
2. PR 2 — Validação global, toasts e rodapé de ações.
3. PR 3 — Processo pai/filho e filtros de raiz.
4. PR 4 — Componentes de formulário, máscaras e redução de duplicação.
5. PR 5 — Refatoração de páginas grandes.
6. PR 6 — Backend, índices, logs e testes de regressão.
