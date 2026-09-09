# Next-Nest Enterprise Monorepo Stack

A production-grade, highly scalable monorepo boilerplate featuring **Next.js 15** (App Router, Tailwind CSS, Redux-Toolkit, Redux-Saga, Formik, TanStack Table) and **NestJS 10** (Prisma ORM, PostgreSQL, Argon2, HttpOnly JWT Authentication, RBAC, Nodemailer).

---

## 📁 Project Architecture & Directory Structure

```text
next-nest/
├── apps/
│   ├── api/                                 # NestJS Backend Application
│   │   ├── prisma/
│   │   │   ├── schema.prisma                # Database Models & Prisma Schema
│   │   │   ├── migrations/                  # Historical SQL Migrations
│   │   │   └── seed.ts                      # Default Roles, Permissions & Admin Seeding
│   │   ├── src/
│   │   │   ├── main.ts                      # API Entrypoint (Helmet, CORS, CookieParser)
│   │   │   ├── app.module.ts                # Root Module
│   │   │   ├── config/                      # Environment Configuration (Dev / Prod)
│   │   │   ├── database/                    # Prisma Global Database Service
│   │   │   ├── common/                      # Guards (JWT, RBAC), Decorators, Interceptors
│   │   │   └── modules/                     # Features (Auth, Users, Roles, Modules, Permissions)
│   │   ├── .env.development                 # Development DB & JWT Secrets
│   │   └── .env.production                  # Production DB & JWT Secrets
│   │
│   └── web/                                 # Next.js 15 Frontend Application
│       ├── tailwind.config.ts               # Tailwind CSS Configuration
│       ├── postcss.config.mjs               # PostCSS Setup
│       └── src/
│           ├── app/                         # Next.js App Router Pages & Layouts
│           │   ├── (auth)/                  # Login & Registration Pages
│           │   ├── (dashboard)/             # Protected Dashboard Layout & Pages
│           │   │   ├── dashboard/           # Analytics Overview Page
│           │   │   ├── users/               # Users CRUD, Add, Edit & Profile Views
│           │   │   ├── roles/               # Roles CRUD & Dynamic Role Permissions Grid
│           │   │   ├── modules/             # System Modules Management
│           │   │   ├── permissions/         # Permissions Management
│           │   │   └── profile/             # Responsive User Profile & Password Change
│           │   └── layout.tsx               # Root App Layout & Theme Provider
│           ├── components/
│           │   ├── common/                  # Shared Enterprise Components
│           │   │   ├── DynamicSidebar.tsx   # Dual-mode Sidebar (Desktop Rail + Mobile Drawer)
│           │   │   ├── Header.tsx           # Responsive Header (Hamburger, Theme, Logout)
│           │   │   ├── TableToolbar.tsx     # Side-by-side Search & Custom Status Dropdown
│           │   │   └── TableRowActions.tsx  # Unified Edit, Delete, View Action Buttons
│           │   └── ui/                      # Base Reusable UI Controls
│           │       ├── dataTableComponent.tsx  # TanStack Table with Responsive Pagination
│           │       ├── genericModal.tsx     # Reusable Portal Modal Dialog
│           │       ├── confirmationModal.tsx# Promise-based Confirmation Dialog
│           │       ├── globalLoadingOverlay.tsx # Global Loading Spinner Overlay
│           │       ├── customSwitch.tsx     # Compact Toggle Switch
│           │       ├── renderFields.tsx     # Formik Dynamic Form Field Renderer
│           │       └── selectDropDown.tsx   # Custom React Select Dropdown
│           ├── features/                    # Feature Modules (Auth, Users, etc.)
│           ├── store/                       # Redux Toolkit Store & Redux-Saga
│           │   ├── common/                  # Generic CRUD Saga Worker Helpers
│           │   ├── rootReducer.ts           # Root Combined Reducer
│           │   └── rootSaga.ts              # Root Saga Orchestrator
│           ├── types/                       # Centralized Canonical Domain Types
│           └── lib/                         # Axios Client, Interceptors & Constants
│
├── package.json                             # Monorepo Workspaces & Central Script Hub
└── README.md                                # Project Documentation
```

---

## 📱 Full Responsive Design (Mobile, Tablet & Desktop)

The web application is engineered for fluid responsiveness across all viewport sizes:

1. **Dual-Mode Dynamic Sidebar ([DynamicSidebar.tsx](apps/web/src/components/common/DynamicSidebar.tsx))**:
   - **Desktop (`>= 1024px`)**: Docked left sidebar supporting expandable full view (`256px`) and compact icon rail mode (`80px`).
   - **Mobile / Tablet (`< 1024px`)**: Completely off-canvas by default. Opens smoothly as an animated slide-over drawer (`w-72 max-w-[85vw]`) with a dimmed backdrop blur (`bg-slate-950/60 backdrop-blur-xs`), dedicated close button (`FiX`), and auto-dismiss on link navigation or `Escape` key press.
2. **Responsive Header ([Header.tsx](apps/web/src/components/common/Header.tsx))**:
   - Dedicated mobile hamburger menu button (`FiMenu`) and brand logo on mobile devices.
   - Desktop rail toggle button for quick workspace expansion.
   - Touch-optimized theme toggle (Dark/Light mode) and secure logout action.
3. **Professional Side-by-Side Toolbar ([TableToolbar.tsx](apps/web/src/components/common/TableToolbar.tsx))**:
   - Search box with integrated clear (`⨉`) button and status dropdown sit **side-by-side on the same line** across mobile and desktop.
   - Custom Status Dropdown with live colored status indicators (Active: Green `●`, Inactive: Red `●`, All: Slate `●`), rotating chevron, and active checkmarks.
4. **Responsive Tables & Pagination ([dataTableComponent.tsx](apps/web/src/components/ui/dataTableComponent.tsx))**:
   - Horizontal table scrolling with sticky headers and clean striped rows.
   - Adaptive pagination footer preventing clipping or overflow on narrow screens.
5. **Adaptive Profile Tabs ([profile/page.tsx](apps/web/src/app/(dashboard)/profile/page.tsx))**:
   - Horizontal scrollable pills on mobile devices, vertical tab rail on desktop.

---

## 🗄️ Database Migrations & Environment Handling

The project strictly separates **Development** and **Production** environments using dedicated `.env` files:
- **Development:** `apps/api/.env.development`
- **Production:** `apps/api/.env.production`

### Migration Commands Overview

All commands can be executed directly from the **root directory** or from **`apps/api`**:

| Operation | Development Command | Production Command | Target Env File |
| :--- | :--- | :--- | :--- |
| **Apply Migrations + Run Seeds** | `npm run migration:dev` | `npm run migration:prod` | `.env.development` / `.env.production` |
| **Apply / Create Migrations Only** | `npm run prisma:migrate:dev` | `npm run prisma:migrate:prod` | `.env.development` / `.env.production` |
| **Check Migration Status** | `npm run prisma:status:dev` | `npm run prisma:status:prod` | `.env.development` / `.env.production` |
| **Run Seed Data Only** | `npm run prisma:seed:dev` | `npm run prisma:seed:prod` | `.env.development` / `.env.production` |
| **Regenerate Prisma Client** | `npm run prisma:generate` | `npm run prisma:generate` | `schema.prisma` |

### How to Create a New Migration (Step-by-Step):

1. Edit your models in `apps/api/prisma/schema.prisma`.
2. Run the development migration command:
   ```bash
   npm run prisma:migrate:dev
   ```
3. Prisma will prompt you for a migration name (e.g. `add_user_bio`), generate the SQL migration file under `apps/api/prisma/migrations/`, apply it to your development database, and regenerate the Prisma Client.
4. When ready to deploy to production:
   ```bash
   npm run prisma:migrate:prod
   ```
   *(This uses `prisma migrate deploy`, safely applying all pending migrations to the production database without prompts or database resets).*

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: Local PostgreSQL instance or remote connection (e.g. Render / Supabase / Neon)

### 2. Installation
Install all dependencies for all workspaces from the root folder:
```bash
npm install
```

### 3. Environment Variables Setup
Ensure your environment files are configured:

**Backend (`apps/api/.env.development`):**
```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db_name>?schema=public"
JWT_SECRET="your_secure_jwt_secret_key"
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL="http://localhost:3000"
```

**Frontend (`apps/web/.env.development`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### 4. Run Migrations & Seed Initial Data
```bash
npm run migration:dev
```

### 5. Start Development Servers

Open two terminals (or run via npm workspace scripts):

* **Start Backend API Server (Port 4000):**
  ```bash
  npm run dev:api
  ```
* **Start Frontend Web App (Port 3000):**
  ```bash
  npm run dev:web
  ```

Visit the application at [http://localhost:3000](http://localhost:3000).

---

## 🛡️ Security & Authentication

- **HttpOnly Cookies**: Secure `access_token` and `refresh_token` storage protecting against XSS attacks.
- **Argon2 Password Hashing**: State-of-the-art password security.
- **Silent Refresh Interceptor**: Axios client automatically refreshes expired access tokens in the background and retries the original request.
- **Granular RBAC**: Role-based access control with module-level permissions (`view`, `create`, `edit`, `delete`, `view_detail`).
- **Input Validation**: Server-side validation via `class-validator` DTOs and client-side validation via Formik + Yup.

---

## 🏗️ Building for Production

To verify types and generate production builds:

* **Type Check:**
  ```bash
  npx tsc --noEmit --workspace=apps/web
  ```
* **Compile Frontend:**
  ```bash
  npm run build:web
  ```
* **Compile Backend:**
  ```bash
  npm run build --workspace=apps/api
  ```
* **Start Production Frontend:**
  ```bash
  npm run start:web
  ```
* **Start Production Backend:**
  ```bash
  npm run prod:api
  ```
