# ERP Centro Trindade

Sistema de gestão desenvolvido para o **Ministério Centro Trindade**, com o objetivo de centralizar e facilitar a gestão administrativa da igreja.

O sistema possui uma área pública, acessível sem autenticação, e uma área administrativa protegida, destinada à gestão interna da igreja.

---

## 📌 Sobre o Projeto

O ERP Centro Trindade foi desenvolvido como projeto académico e tem como principal objetivo digitalizar processos administrativos que tradicionalmente são realizados de forma manual.

O sistema permite centralizar informações relacionadas com:

- 👥 Membros
- 📅 Agenda e eventos
- 🧑‍💼 Utilizadores e acessos
- 🏛️ Secretaria
- 👤 Visitantes
- 💰 Tesouraria
- 📄 Documentos
- 📊 Dashboard administrativo

A aplicação está dividida em duas áreas principais:

### Área Pública

A área pública pode ser consultada sem necessidade de autenticação.

Inclui páginas como:

- Página inicial
- Escola 120
- Contribuições
- Formulários
- Calendário
- Outras informações do Ministério

### Área Administrativa

A área administrativa é protegida por autenticação.

Após o login, o utilizador é encaminhado para o dashboard, onde poderá aceder às funcionalidades de acordo com as permissões definidas.

---

# 🚀 Tecnologias Utilizadas

## Frontend

- React
- JavaScript
- HTML5
- CSS3
- React Router
- Vite
- Remix Icon

## Backend

- Node.js
- Express.js
- JavaScript
- REST API
- JWT
- bcrypt
- CORS
- dotenv

## Base de Dados

- PostgreSQL alojado no Neon
- Driver Node.js `pg`
- MySQL / MySQL Workbench como origem do backup migrado

A API usa `DATABASE_URL` no `.env`. Executar `npm run db:prepare` antes da
publicação para preparar as colunas de último acesso/sessões e a unicidade das
associações de contas. `npm run test:security` e `npm run test:vercel` usam
fixtures isoladas. `npm run test:postgres` exige `TEST_DATABASE_URL` de uma
base separada, já preparada. Ver [instruções da migração](migration/README.md).

## Ferramentas

- Visual Studio Code
- Git
- GitHub
- Thunder Client
- MySQL Workbench

---

# Arquitetura do projeto

O frontend organiza cada área em `src/features`, separando páginas, componentes,
hooks, pedidos HTTP e regras. O backend utiliza `backend/modules`, com
controladores HTTP, serviços e repositórios SQL. Layout e utilitários partilhados
ficam fora dos módulos.

```text
erp-centro_trindade/
├── api/                 # Entrada serverless da Vercel
├── backend/
│   ├── config/          # PostgreSQL, fotografias e schemas
│   ├── middleware/      # Autenticação, autorização e limites
│   ├── modules/         # Áreas funcionais da API
│   ├── routes/          # Endpoints e permissões
│   ├── scripts/         # Migração e manutenção
│   ├── tests/           # Testes isolados
│   ├── utils/           # Validação e operações partilhadas
│   └── server.js
├── docs/arquitetura.md
├── migration/           # Instruções da migração
├── public/              # Ficheiros públicos
├── shared/              # Regras usadas pelo frontend e backend
├── src/
│   ├── assets/          # Imagens e estilos gerais
│   ├── components/      # Layout e componentes partilhados
│   ├── features/        # Áreas internas, acesso e páginas públicas
│   ├── routes/          # AppRoutes e ProtectedRoute
│   ├── utils/           # API, datas, permissões e exportação PDF
│   ├── App.jsx
│   └── main.jsx
└── scripts/             # Compilação e pré-visualização de PDFs
```

Ver [a arquitetura e responsabilidades dos módulos](docs/arquitetura.md).
`npm run check:ci` executa lint, testes isolados, compilação e verificação da
entrada serverless. Os scripts de manutenção da base são executados separadamente.
