# Padrao de codigos de formularios

## Formato

- `PRJ-[SIGLA]-[NNN]`: formularios do modulo Projetos.
- `APO-[SIGLA]-[NNN]`: formularios do modulo Programas de Apoio.
- `[NNN]` e a versao vigente do formulario, com tres digitos. A primeira versao e `001`.
- A sigla identifica o tipo do formulario, nao a posicao dele no menu.

## Projetos

| Codigo | Formulario |
| --- | --- |
| `PRJ-CEV-001` | Protocolo de Abertura de Curso/Evento |
| `PRJ-PSQ-003` | Processo de Abertura de Projeto de Pesquisa |
| `PRJ-PUB-001` | Abertura de Publicacao |
| `PRJ-EPE-001` | Abertura de Programa EPE |
| `PRJ-PAR-001` | Cadastro de Parceiro |
| `PRJ-COT-001` | Cotas de Patrocinio |
| `PRJ-FIN-001` | Cadastro de Financiadora |
| `PRJ-COO-001` | Cadastro de Coordenador |
| `PRJ-PAT-001` | Cadastro de Patrocinador |
| `PRJ-PTB-001` | Plano de Trabalho |
| `PRJ-CCD-001` | Ciencia e Concordancia do Departamento |
| `PRJ-CMU-001` | Central Multiusuario |
| `PRJ-ORI-003` | Orientacoes ao Coordenador, revisao 03 |
| `PRJ-REC-001` | Plano de Aplicacao de Recursos |
| `PRJ-LGP-005` | Termo de LGPD, revisao 05 |
| `PRJ-PSQ-002` | Formulario de pesquisa na rota legada `/form-pesquisa` |

## Programas de Apoio

| Codigo | Formulario |
| --- | --- |
| `APO-BPG-001` | Bolsa Academica - Pos-graduacao |
| `APO-BAG-001` | Bolsa Academica - Graduacao |
| `APO-INF-001` | Apoio Infraestrutura e Melhorias |
| `APO-EVT-001` | Apresentacao de Trabalho em Evento |
| `APO-VIA-001` | Auxilio Viagem |
| `APO-PUB-001` | Auxilio para Publicacao de Artigo |
| `APO-COM-001` | Apoio de Interesse da Comunidade |
| `APO-MAT-001` | Apoio Material para Eventos |
| `APO-CUL-001` | Cultura e Extensao Universitaria |

## Identificadores internos

O codigo padronizado tambem e o ID do formulario no catalogo e o formulario_id de kits e novos processos. As rotas amigaveis permanecem separadas. A migracao atualiza as referencias no banco, sem alterar os UUIDs dos processos, IDs dos kits ou identificadores de anexos. Chaves de rastreabilidade usadas para status de subformularios continuam estaveis.
