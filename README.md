# Centro Trindade — Sistema de Gestão da Igreja

Aplicação web desenvolvida como projeto académico para o **Ministério Centro Trindade**, com uma área pública de apresentação e uma área interna para centralizar a gestão administrativa da igreja.

**[Aceder ao projeto online](https://projeto-academico-jade.vercel.app/)** · **[Repositório público](https://github.com/Ketahanan27/Centro-Trindade)**

O sistema reúne membros, agenda, secretaria, tesouraria, utilizadores e relatórios, com acesso definido pelo perfil de cada conta.

## Índice

- [Funcionalidades](#funcionalidades)
- [Perfis e permissões](#perfis-e-permissões)
- [Atualizações recentes](#atualizações-recentes)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Executar localmente](#executar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Testes e qualidade](#testes-e-qualidade)
- [Publicação](#publicação)
- [Manutenção](#manutenção)
- [Estado atual e limitações](#estado-atual-e-limitações)
- [Autoria](#autoria)

## Funcionalidades

### Área pública

- Página inicial com apresentação do ministério, vídeo e galeria de fotografias.
- Página da Escola 120.
- Agenda pública com eventos agendados e calendário sem controlos de navegação.
- Formulário de contacto com envio para a igreja e confirmação por email ao visitante.
- Página Contribua com indicação de que os pagamentos online ainda não estão disponíveis.
- Política de Privacidade e Termos e Condições.
- Login, recuperação da palavra-passe e configuração da conta através de convite.

### Dashboard

O painel apresenta indicadores conforme as permissões do utilizador:

- Total de membros ativos e total de participações de visitantes registadas por atividade.
- Próximos eventos, com visibilidade pública ou interna e estado: agendado, concluído ou cancelado.
- Contagens de visitantes por atividade e distribuição do acompanhamento por estado.
- Resumo financeiro mensal, saldo e evolução de receitas e despesas ao longo do ano.
- Pendências de associação de membros a contas e de ativação de convites, quando autorizadas.

Os dados financeiros e administrativos são selecionados no backend de acordo com o perfil; esconder um menu no frontend não substitui a autorização da API.

### Membros e Minha Área

- Registo, consulta, edição e eliminação de membros pela equipa autorizada.
- Gestão de contactos, morada, datas de nascimento e entrada, batismo e estado.
- Associação explícita entre o registo do membro e a sua conta, efetuada pelo administrador.
- Consulta do perfil associado à sessão na Minha Área e edição dos contactos pessoais permitidos.
- Carregamento e consulta protegida da fotografia de perfil.

O email, por si só, não associa uma conta a um membro. A identificação oficial, a entrada e o batismo permanecem sob gestão da equipa autorizada.

### Agenda

- Criação e gestão de eventos com data, hora, local, descrição, visibilidade e estado.
- Separação entre a agenda interna e os eventos apresentados ao público.
- Estados com identificação visual: **Agendado — azul**, **Concluído — verde** e **Cancelado — vermelho**.
- Validação de datas e proteção contra a eliminação de eventos passados.

### Secretaria

| Área | Operações |
| --- | --- |
| Visitantes por atividade | Contagens por culto ou atividade, manualmente ou a partir da Agenda, com filtros, paginação e exportação |
| Acompanhamento de visitantes | Registo de contactos e acompanhamento individual da evolução dos visitantes |
| Apresentações | Gestão de datas, quantidades de crianças e observações |
| Documentos | Declarações de membro, declarações de batismo e cartas de recomendação |
| Reuniões e atas | Registo de participantes, assuntos, decisões e observações |

As contagens por atividade são independentes do acompanhamento individual: permitem registar apenas a quantidade de visitantes. Representam **participações por atividade**, não pessoas únicas.

### Tesouraria

- Receitas e despesas com tipo, natureza, valor, data e observações.
- Identificação dos autores das operações na tabela de movimentos.
- Pesquisa, filtros, resumos e paginação com **10 movimentos por página**.
- Histórico de auditoria com os dados anteriores e posteriores às alterações.
- Exigência de motivo nas alterações e eliminações.
- Exportação de documentos financeiros em PDF.

### Relatórios e documentos PDF

- Secção própria de Relatórios no menu lateral.
- Relatório anual com indicadores administrativos e dados financeiros para os perfis autorizados.
- Relatório global num único documento, com período selecionado e versões resumida ou detalhada.
- Abrangência administrativa, financeira ou global, conforme o perfil.
- Exportações com logótipo, identificação do ministério, paginação e espaços para assinatura da Secretaria e do Pastor.
- Reimpressão de documentos com a identificação e a data de emissão originalmente guardadas.

O relatório global consulta os dados numa transação de leitura consistente. A versão detalhada tem um limite combinado de **5.000 registos**; acima desse limite, é necessário reduzir o período ou usar a versão resumida.

### Utilizadores e convites

- Criação de contas exclusivamente por convite do administrador.
- Gestão de perfis, estado da conta e reenvio de convites.
- Configuração inicial e recuperação da palavra-passe por links de utilização única.
- Convites válidos por **48 horas** e recuperação válida por **30 minutos**.
- Invalidação das sessões após alterações sensíveis à conta.

## Perfis e permissões

| Perfil | Âmbito principal |
| --- | --- |
| Administrador | Gestão das áreas internas, utilizadores, convites e associações de contas |
| Secretaria | Membros, agenda, secretaria e relatórios administrativos, sem dados financeiros |
| Tesouraria | Movimentos financeiros, indicadores financeiros e relatório global financeiro |
| Pastor | Consulta das áreas administrativas e financeiras, sem operações de gestão |
| Membro | Dashboard limitado e acesso ao seu perfil na Minha Área |

A Minha Área permite consultar o membro explicitamente associado à conta. A API valida a sessão, o estado da conta, a versão da sessão e as permissões de cada operação.

## Atualizações recentes

- Reorganização do frontend por funcionalidades, separando páginas, componentes, hooks, API e regras.
- Reorganização do backend em controladores, serviços e repositórios SQL.
- Organização das páginas públicas e dos fluxos de autenticação.
- Contagens de visitantes por culto ou atividade e integração no dashboard.
- Centralização dos relatórios, incluindo o relatório global com várias áreas num único PDF.
- Reformulação dos PDFs com a identidade do ministério e espaços para assinatura.
- Associação explícita entre contas e membros e acesso protegido às fotografias.
- Criação de contas por convite e armazenamento de tokens de recuperação como hashes.
- Remoção dos scripts antigos de manutenção MySQL, do respetivo driver e de ficheiros substituídos.
- Descrições dos testes em português e verificação automática no GitHub Actions.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Interface | React 19, React Router 7, JavaScript, HTML, CSS e CSS Modules |
| Desenvolvimento e compilação | Vite e ESLint |
| Backend | Node.js, Express 5 e módulos ES |
| Base de dados | PostgreSQL no Neon, com o driver `pg` |
| Autenticação | JWT com assinatura HS256, bcrypt e versão de sessão |
| Email | Nodemailer, com transporte Gmail |
| Fotografias | Vercel Blob privado, Multer e Sharp |
| Documentos | jsPDF |
| Verificação | Test runner do Node.js e GitHub Actions |
| Alojamento | Vercel, com frontend estático e API Express em função serverless |

O MySQL foi a origem da migração inicial. A aplicação atual utiliza PostgreSQL.

## Arquitetura

```text
Centro-Trindade/
├── api/                      # Entrada serverless da Vercel
├── backend/
│   ├── config/               # PostgreSQL, armazenamento e schemas adicionais
│   ├── middleware/           # Autenticação, autorização e limites de pedidos
│   ├── modules/              # Áreas funcionais da API
│   ├── routes/               # Endpoints e permissões
│   ├── scripts/              # Preparação, migração e manutenção
│   ├── tests/                # Testes isolados
│   ├── utils/                # Validação e operações partilhadas
│   ├── app.js                # Configuração da aplicação Express
│   └── server.js             # Arranque do servidor local
├── docs/                     # Documentação da arquitetura
├── migration/                # Instruções da migração para PostgreSQL
├── public/                   # Ficheiros públicos
├── shared/                   # Regras partilhadas entre frontend e backend
├── src/
│   ├── assets/               # Imagens e estilos gerais
│   ├── components/           # Layout e componentes partilhados
│   ├── features/             # Dashboard, membros, agenda, secretaria, etc.
│   │   ├── auth/             # Login, recuperação e acesso por convite
│   │   └── publico/          # Páginas e componentes públicos
│   ├── routes/               # Rotas e proteção da navegação
│   ├── utils/                # API, datas, permissões e exportações PDF
│   ├── App.jsx
│   └── main.jsx
├── scripts/                  # Compilação e pré-visualização dos PDFs
├── .env.example              # Configuração de exemplo, sem credenciais reais
├── package.json
├── vercel.json
└── vite.config.js
```

No frontend, as páginas apresentam os dados, os hooks gerem estado e ações e os ficheiros de API concentram os pedidos HTTP. No backend, o fluxo principal é:

```text
Rota → Autenticação e autorização → Controlador → Serviço → Repositório → PostgreSQL
```

Os serviços aplicam as regras; os repositórios executam consultas parametrizadas e gerem a persistência. Email e armazenamento de fotografias têm integrações próprias.

Consultar [a documentação da arquitetura](docs/arquitetura.md) para as responsabilidades de cada módulo.

## Executar localmente

### Requisitos

- Node.js 24, versão utilizada na integração contínua, e npm.
- Git.
- Uma base PostgreSQL de desenvolvimento com as tabelas de base do sistema.
- Uma conta administrativa previamente preparada para aceder à área interna.

O repositório público não inclui a base de dados, credenciais, fotografias de membros nem contas de demonstração. `db:prepare` acrescenta colunas, índices e estruturas complementares; **não cria sozinho toda a base inicial nem o primeiro administrador**. As instruções de conversão de uma base existente estão em [migration/README.md](migration/README.md).

### 1. Obter o código e instalar as dependências

```bash
git clone https://github.com/Ketahanan27/Centro-Trindade.git
cd Centro-Trindade
npm ci
```

### 2. Preparar a configuração

Copiar `.env.example` para `.env`. Em PowerShell:

```powershell
Copy-Item .env.example .env
```

Configurar as variáveis do ambiente de desenvolvimento, sobretudo `DATABASE_URL`, `JWT_SECRET` e `FRONTEND_URL`. As variáveis de email são necessárias para contacto, convites e recuperação da palavra-passe.

### 3. Preparar a base existente

Depois de confirmar que `DATABASE_URL` aponta para a base de desenvolvimento:

```bash
npm run db:prepare
```

### 4. Iniciar a API e o frontend

Numa janela do terminal:

```bash
npm run server
```

Noutra janela:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://127.0.0.1:5000`

O Vite encaminha os pedidos `/api` para a API local. Se alterar a porta do backend, ajustar também o destino do proxy em `vite.config.js`.

## Variáveis de ambiente

| Variável | Utilização |
| --- | --- |
| `DATABASE_URL` | Ligação PostgreSQL; no Neon, usar a configuração TLS adequada |
| `JWT_SECRET` | Segredo longo e aleatório utilizado para assinar as sessões |
| `FRONTEND_URL` | Origem autorizada do frontend e endereço base dos links enviados por email |
| `PORT` | Porta da API local; por omissão, `5000` |
| `HOST` | Endereço de escuta da API local; por omissão, `127.0.0.1` |
| `VITE_API_URL` | Base dos pedidos internos; na Vercel, a compilação utiliza a mesma origem |
| `EMAIL_USER` | Conta Gmail utilizada no envio de emails |
| `EMAIL_PASS` | Palavra-passe de aplicação da conta de envio |
| `EMAIL_DESTINO` | Endereço da igreja que recebe os contactos |
| `BLOB_PRIVATE_READ_WRITE_TOKEN` | Token do Blob privado para fotografias de membros em produção |
| `BLOB_READ_WRITE_TOKEN` | Acesso ao armazenamento anterior, quando necessário durante a migração de fotografias |
| `TEST_DATABASE_URL` | Base separada para os testes de integração PostgreSQL |

As variáveis antigas `DB_HOST`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`, ainda presentes no exemplo, não são utilizadas pela aplicação PostgreSQL atual.

Credenciais e tokens ficam no `.env` local ou nas variáveis da plataforma. Segredos do backend não devem usar o prefixo `VITE_`, porque as variáveis do frontend podem ser incluídas no código entregue ao navegador.

## Testes e qualidade

Executar a verificação completa:

```bash
npm run check:ci
```

Este comando encadeia:

1. Análise estática com ESLint.
2. Testes isolados com o test runner do Node.js.
3. Compilação de produção para a Vercel.
4. Verificação da entrada serverless e do bundle gerado.

A suite cobre validação, permissões, sessões, convites, transações, relatórios, PDFs, fotografias, limites de pedidos e regras dos módulos. As descrições dos testes estão em português. Os testes isolados simulam a base e os serviços externos, sem alterar a base real nem enviar emails.

| Comando | Finalidade |
| --- | --- |
| `npm run lint` | Verificar o código com ESLint |
| `npm run test:unit` | Executar todos os testes isolados |
| `npm run test:security` | Verificar autenticação e controlo de acesso |
| `npm run test:documents` | Verificar documentos, relatórios e PDFs |
| `npm run test:photos` | Verificar acesso e processamento de fotografias |
| `npm run test:invites` | Verificar convites e recuperação |
| `npm run test:contact` | Verificar o formulário de contacto e o envio simulado |
| `npm run test:postgres` | Executar integração numa base separada indicada por `TEST_DATABASE_URL` |

O GitHub Actions executa `npm ci` e `npm run check:ci` em envios para `main`, pull requests e execução manual. Os scripts de manutenção e de migração não fazem parte da suite isolada.

## Publicação

A configuração em `vercel.json` serve o frontend e a API no mesmo projeto:

- Frontend compilado para `dist`.
- Pedidos `/api/*` encaminhados para a entrada Express em `api/index.js`.
- Restantes rotas encaminhadas para a aplicação React.
- Base de dados PostgreSQL externa no Neon.
- Fotografias de membros num armazenamento Vercel Blob privado.

Para uma instalação própria, importar o repositório na Vercel, configurar as variáveis desse ambiente, preparar a base correspondente e publicar. `FRONTEND_URL` deve corresponder ao endereço final dessa instalação. A compilação configurada evita URLs localhost no frontend de produção.

O funcionamento da área interna depende da base, das contas e das integrações configuradas. A disponibilidade do código público não concede acesso à gestão da igreja.

## Manutenção

| Comando | Finalidade |
| --- | --- |
| `npm run db:prepare` | Preparar colunas, índices e estruturas complementares no PostgreSQL |
| `npm run photos:migrate` | Analisar a migração de fotografias locais |
| `npm run photos:protect` | Analisar a transferência de fotografias antigas para armazenamento privado |
| `npm run photos:reconcile` | Analisar objetos privados sem referência elegíveis para limpeza |
| `npm run tokens:protect` | Converter tokens antigos para o formato protegido por hash |

Os comandos de fotografias analisam por omissão. `-- --apply` aplica as operações previstas por cada script, incluindo transferências ou eliminações. Antes de o utilizar, confirmar o ambiente, as referências existentes e as instruções do script. Preparação da base e conversão de tokens escrevem na base configurada.

Os backups e ficheiros SQL de migração não são distribuídos com o código público. A migração histórica MySQL → PostgreSQL está documentada em [migration/README.md](migration/README.md).

## Estado atual e limitações

- Os pagamentos online permanecem indisponíveis; não existe uma integração de cobrança ativa.
- O acesso interno exige uma conta autorizada; o registo público está desativado.
- O envio de convites depende da configuração de email. Em caso de falha, o administrador pode repetir o envio; não existe uma fila automática de entrega.
- A reconciliação de fotografias é uma operação manual, sem execução recorrente configurada pelo projeto.
- A cópia pública disponibiliza o código e o histórico limpo, sem substituir o repositório privado utilizado na operação do projeto.

## Autoria

Desenvolvido por **Djamel Cambundi**, no âmbito de um projeto académico aplicado à gestão do Ministério Centro Trindade.

[Perfil no GitHub](https://github.com/Ketahanan27) · [Código do projeto](https://github.com/Ketahanan27/Centro-Trindade) · [Aplicação online](https://projeto-academico-jade.vercel.app/)
