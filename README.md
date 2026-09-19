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

- MySQL
- MySQL2
- MySQL Workbench

## Ferramentas

- Visual Studio Code
- Git
- GitHub
- Thunder Client
- MySQL Workbench

---

# 🏗️ Arquitetura do Projeto

O projeto utiliza uma arquitetura separada entre frontend e backend.

```text
erp-centro_trindade/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── agendaController.js
│   │   ├── authController.js
│   │   ├── membroController.js
│   │   ├── visitantesController.js
│   │   └── ...
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── routes/
│   │   ├── agendaRoutes.js
│   │   ├── authRoutes.js
│   │   ├── membroRoutes.js
│   │   ├── visitantesRoutes.js
│   │   └── ...
│   │
│   └── server.js
│
├── public/
│
├── src/
│   ├── assets/
│   │   ├── img/
│   │   └── styles/
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   ├── home/
│   │   └── secretaria/
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Escola120.jsx
│   │   ├── Contribua.jsx
│   │   ├── Formulario.jsx
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── ProctedRoute.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
