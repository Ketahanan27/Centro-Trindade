# Organização do projeto

O frontend está a ser organizado por funcionalidades. Membros é o primeiro
módulo migrado; os restantes continuam nas pastas anteriores até à sua migração.

## Membros: responsabilidades

| Ficheiro | Responsabilidade |
| --- | --- |
| `src/features/membros/MembrosPage.jsx` | Compor a página e ligar os componentes |
| `hooks/useMembros.js` | Gerir carregamento, pesquisa, formulários e ações |
| `membros.api.js` | Construir os pedidos HTTP do módulo |
| `membros.model.js` | Preparar formulários e dados para guardar |
| `components/MembrosTabela.jsx` | Apresentar a lista e as ações autorizadas |
| `components/MembroFormulario.jsx` | Apresentar os campos de criação e edição |
| `components/MembroDetalhes.jsx` | Apresentar a ficha e fotografia protegida |
| `components/MembroModal.jsx` | Montar as janelas no portal do documento |
| `membros.module.css` | Estilos locais, sem interferência entre páginas |

## Como explicar uma alteração de membro

1. A página apresenta a tabela; Editar abre o formulário.
2. O hook prepara os dados com as funções do modelo.
3. Ao guardar, o módulo de API envia o pedido autenticado.
4. O backend verifica a sessão, as permissões e os dados antes de consultar
   ou alterar o PostgreSQL.
5. Após sucesso, o hook recarrega a lista e fecha o formulário.

As permissões no frontend apenas orientam a interface. A autorização continua
no backend. A associação de contas só é enviada por administradores e é omitida
quando a consulta de contas falha; assim, uma falha de carregamento não desfaz
uma associação existente.

## Convenções para os próximos módulos

- Organizar código específico em `src/features/<modulo>`.
- Manter componentes partilhados em `src/components` e utilitários gerais em
  `src/utils`. Não generalizar componentes que só têm um uso sem necessidade.
- Usar CSS Modules nas páginas migradas; manter apenas estilos gerais e do
  layout no CSS global.
- Separar apresentação, gestão do estado e pedidos HTTP.
- Extrair funções puras quando representam regras que precisam de verificação.
- Migrar um módulo de cada vez e confirmar rotas, permissões e comportamento.
- Remover ficheiros substituídos só depois de verificar as suas referências.
  Scripts de manutenção não são lixo por não serem importados pela aplicação.

## Verificação

`npm run check:ci` executa lint, testes isolados, compilação de produção e
verificação da entrada serverless. Os testes não precisam da base de produção.

## Continuação

Migrar os restantes módulos do frontend, consolidar os seus estilos e, depois,
organizar o backend por módulo com controlador, regras e consultas separados
onde a complexidade o justificar. A migração do backend ainda não foi feita
nesta primeira etapa.
