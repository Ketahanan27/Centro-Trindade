# Alterações realizadas — Centro Trindade

Resumo consolidado em 5 de outubro de 2026.

## Identidade e apresentação

- Título de partilha atualizado para **CENTRO TRINDADE**.
- Produzidos os relatórios de auditoria e prioridades de correção.

## Contas, sessões e associação de membros

- Registo público recusado pela API; novas contas usam o fluxo de convite do administrador.
- Página de registo substituída por informação sobre o acesso por convite.
- A Minha Área usa a associação explícita entre membro e conta; coincidência de email não concede acesso.
- Upload de fotografia não cria membros nem associa contas automaticamente.
- Administrador pode escolher a conta associada em Membros; Secretaria preserva essa ligação.
- Índice único impede associar a mesma conta a vários membros.
- Estado, perfil e versão de sessão são verificados na base em cada pedido autenticado.
- Alterações de conta e password revogam sessões anteriores.
- Redefinição de password consome o token e altera a password na mesma transação.
- Nomes interpolados nos emails de autenticação têm escape HTML.
- Entrada e batismo não podem ser alterados pelo próprio membro na Minha Área.
- Mensagens da Minha Área distinguem ausência de associação de falhas de comunicação.

## Fotografias

- Novos uploads em produção usam Blob privado através de `BLOB_PRIVATE_READ_WRITE_TOKEN`.
- Fotografias são servidas pela API após verificação da sessão e da associação/perfil autorizado.
- Respostas de membros apresentam a rota autenticada em vez do URL de armazenamento.
- Pasta local de uploads deixou de ser servida publicamente.
- Respostas de fotografia usam `Cache-Control: private, no-store`.
- Frontend carrega as imagens com autenticação e liberta os URLs temporários.
- Corrigidos o avatar inicial e o comportamento que podia ocultar imagens durante o carregamento.
- Substituição e eliminação de membros tentam remover as fotografias anteriores.
- Script de transferência inclui verificação sem escrita e atualização condicional das ligações.
- Falhas de comunicação ambíguas preservam ficheiros para evitar eliminar uma fotografia possivelmente referenciada.

## Documentos e PDFs

- Reimpressão preserva a identidade, os dados e a data de emissão do registo selecionado.
- Emissão só descarrega o PDF depois da confirmação de gravação do histórico.
- Validação partilhada entre frontend e backend verifica tipos, campos obrigatórios e datas reais.
- Histórico de documentos disponível para leitura pelo Pastor.
- Todas as exportações usam um modelo comum A4 com logótipo e **MINISTÉRIO CENTRO TRINDADE**.
- Cabeçalhos, rodapés, paginação, tabelas e espaços para assinatura/data da Secretaria e do Pastor.
- Reformulados batismo, declaração de membro, recomendação, atas, relatório anual e tesouraria geral/diária.
- Textos extensos e células longas repartidos por páginas.
- Logótipo original preservado; versão leve incorporada nos PDFs.
- Amostras fictícias e testes de paginação preparados sem emitir documentos reais.

## Relatórios

- Indicador de visitantes alinhado com o estado válido `Tornou-se membro`.
- Distinção entre indicadores globais atuais e atividade do ano selecionado.
- Anos inválidos rejeitados e respostas antigas ignoradas após mudança de ano.
- Dados financeiros e exportação sujeitos às permissões do backend.
- Área independente de Relatórios removida a pedido do utilizador; separador mantido na Secretaria.

## Tesouraria

- Novos movimentos guardam o autor a partir da sessão confirmada.
- Histórico guarda operação, autor, nome, data/hora, motivo e dados anteriores/posteriores.
- Histórico preservado após eliminação do movimento.
- Alterações e eliminações exigem um motivo de 5 a 500 caracteres.
- Movimento e histórico gravados na mesma transação; falhas revertem a operação.
- Alterações/eliminações bloqueiam a linha durante a operação.
- Validação de valores positivos, precisão monetária, limites, datas reais e observações.
- Consulta das últimas 200 operações na interface.
- Submissões bloqueadas enquanto a operação está em curso.
- Listagem de movimentos limitada a **10 por página**, com Anterior, Seguinte e seleção de página.
- Pesquisa e filtros voltam à primeira página; totais e PDFs mantêm o conjunto completo.
- Categoria visual sem correspondência na API removida.

## Contribuições

- Simulação MBWay desativada no backend.
- Secção visual Contribua reposta, com campos/botão desativados e nota de indisponibilidade.
- Dados bancários de exemplo identificados como tal.

## Configuração e verificação

- `.env.example` limpo de credenciais e atualizado com variáveis de exemplo.
- Testes serverless e de segurança isolados da base real.
- Integração PostgreSQL exige uma base separada em `TEST_DATABASE_URL`.
- Scripts de preparação incluem versão de sessão, associação única e histórico da tesouraria.
- Testes isolados: 19 de segurança, 18 de documentos/relatórios, 7 de tesouraria e 6 de fotografias.
- Compilação de produção, verificações serverless e lint dos ficheiros abrangidos executados.
- PDFs revistos visualmente, incluindo documentos extensos.
- Amostras de PDF e ficheiros de revisão excluídos do Git.

## Operações realizadas na base e no armazenamento

Estas operações não fazem parte do conteúdo de um commit Git:

- Preparação aditiva da estrutura PostgreSQL, sem apagar registos existentes.
- Associação confirmada de Djamel Cambundi, Djamel Simão e Elizandro Pinto às respetivas contas.
- Transferência de quatro fotografias existentes para Blob privado e eliminação das cópias anteriores, sem erros reportados.
- Verificação de leitura autenticada em produção e bloqueio de acesso anónimo.

## Commits de implementação publicados

- `52ee7e5`: título de partilha CENTRO TRINDADE.
- `13dc784`: contas, sessões, fotografias, documentos, PDFs, relatórios, contribuições e tesouraria.
- `a4eb22f`: registo da publicação e transferência das fotografias privadas.
- `e8d4f51`: correção do avatar inicial e carregamento das fotografias privadas.

Os restantes itens pendentes, incluindo rotação de credenciais históricas, retenção, normalização completa de imagens e outros blocos da auditoria, constam de `CORRECOES-PRIORIDADES.md`. Este resumo não os considera concluídos.
