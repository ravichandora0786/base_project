# Next-Nest Monorepo Stack

A production-grade, highly scalable monorepo boilerplate featuring **Next.js** (App Router, Tailwind CSS, Redux-Saga, Formik) and **NestJS** (Prisma ORM, Argon2, HttpOnly cookies JWT authentication, PostgreSQL, RBAC).

---

## Project Directory Structure

```text
next-nest/
├── apps/
│   ├── api/                           # NestJS Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma          # Prisma Schema Definition
│   │   │   └── seed.ts                # Database Default Seeding Data
│   │   ├── src/
│   │   │   ├── main.ts                # Entrypoint (Helmet, CookieParser, Global Prefix)
│   │   │   ├── app.module.ts          # Root Module importing all dependencies
│   │   │   ├── config/                # Environment-wise application configurations
│   │   │   ├── database/              # Global Prisma Service Module
│   │   │   ├── common/                # Shared Guards (RBAC, JWT), Decorators, Exceptions
│   │   │   └── modules/               # Modules (Auth, Users, Courses)
│   │
│   └── web/                           # Next.js Frontend
│       ├── tailwind.config.ts         # Tailwind Styling Configuration
│       ├── postcss.config.mjs         # PostCSS configurations
│       └── src/
│           ├── app/                   # App Router pages, layouts & authentication guards
│           ├── features/              # Feature directories (components, stores, schemas)
│           │   ├── auth/              # Auth forms, validation schemas, and states
│           ├── store/                 # Global Redux Toolkit & Redux-Saga configurations
│           └── lib/                   # API utilities & client interceptors (Auto Refresh)
│
├── docker-compose.yml                 # PostgreSQL Container Setup
├── package.json                       # Monorepo workspaces definition & root scripts
└── .gitignore                         # Credentials and Build artifacts ignore list
```

---

## Implemented Security & Database Schema

### 1. Database Schema Models (PostgreSQL + Prisma)
- **Role**: Custom roles with dynamic permission associations.
- **User**: Comprehensive profile metadata, Argon2-hashed passwords, role relations.
- **Permission**: Actions list (`view`, `create`, `edit`, `delete`, `view_detail`).
- **Module**: Application sections (`user`, `role`, `dashboard`).
- **RolePermission**: Mapped permissions (e.g. `view` permission mapped to all roles for all modules).
- **RoutePermissionMap**: Maps API methods & routes to explicit permission identifiers.
- **BlacklistedToken**: Revoked JWTs tracking.

### 2. Authentication Flow
- **HttpOnly Cookies**: Short-lived `access_token` and long-lived `refresh_token` are stored securely in client-side HttpOnly cookies.
- **Refresh Token Rotation**: Old tokens are revoked, and new sessions are registered in the PostgreSQL `Session` table.
- **Client Auto-Refresh Interceptor**: If the access token expires, the Axios client automatically hits the `/auth/refresh` endpoint behind the scenes and retries the failed API call.

---

## How to Run the Project

### Prerequisites
- Install [Node.js](https://nodejs.org) (v18 or higher recommended).
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop).

---

### Step-by-Step Setup:

### 1. Start Database Container
Spin up PostgreSQL via Docker:
```bash
docker compose up -d
```

### 2. Install Project Dependencies
Run from the root folder:
```bash
npm install
```

### 3. Setup Environment Variables
Before running the project, configure your environment files:
- **Backend:** `apps/api/.env.development` and `apps/api/.env.production`
- **Frontend:** `apps/web/.env.development` and `apps/web/.env.production`

---

## Workspace CLI Commands

All workspace commands can be run directly from the root folder:

### Database, Migrations & Seeding Commands

| Command | Action | Loaded Env File | Target Database |
| :--- | :--- | :--- | :--- |
| **`npm run migration`** | **Dev Migration + Seed (Run together)** | `apps/api/.env.development` | **`test_bd` (Development)** |
| **`npm run migration:prod`** | **Prod Migration + Seed (Run together)** | `apps/api/.env.production` | **`test_bd_prod` (Production)** |
| `npm run prisma:migrate:dev` | Apply database migrations only | `apps/api/.env.development` | `test_bd` |
| `npm run prisma:migrate:prod` | Apply database migrations only | `apps/api/.env.production` | `test_bd_prod` |
| `npm run prisma:seed:dev` | Seed database tables only | `apps/api/.env.development` | `test_bd` |
| `npm run prisma:seed:prod` | Seed database tables only | `apps/api/.env.production` | `test_bd_prod` |
| `npm run prisma:generate` | Regenerate Prisma Client | N/A | N/A |

### Development Mode (Local Servers)

| Command | Action | Loaded Env File | Runs On Port |
| :--- | :--- | :--- | :--- |
| **`npm run dev:api`** | Start NestJS Backend | `apps/api/.env.development` | **`4000`** |
| **`npm run dev:web`** | Start Next.js Frontend | `apps/web/.env.development` | **`3000`** |

### Production Build & Execution

| Command | Action | Loaded Env File | Runs On Port |
| :--- | :--- | :--- | :--- |
| **`npm run build:web`** | Compile Next.js Frontend for Prod | `apps/web/.env.production` | N/A |
| **`npm run build --workspace=apps/api`** | Compile NestJS Backend for Prod | N/A | N/A |
| **`npm run start:web`** | Start Next.js Production Frontend | `apps/web/.env.production` | **`3000`** |
| **`npm run prod:api`** | Start NestJS Production Backend | `apps/api/.env.production` | **`4000`** |

---

## How to Scale the Structure
When adding new business features (e.g. payments, courses, tasks):

1. **Database Schema**: Add the Prisma Model inside `apps/api/prisma/schema.prisma`.
2. **Backend Module**: Create a module under `apps/api/src/modules/` containing controller, service, and validation DTOs. Add it to `app.module.ts`.
3. **Frontend Feature**: Under `apps/web/src/features/`, create your feature folder with matching folders: `components/`, `store/`, `services/`, and `schemas/`.
4. **Redux Store**: Register any new feature slices/sagas inside global root configurations (`src/store/rootReducer.ts` and `src/store/rootSaga.ts`).
# base_project
