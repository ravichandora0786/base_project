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

## ⚡ Master Command Cheat Sheet (Dev vs Prod)

All commands can be executed either directly from the **Root Directory** or from inside individual workspace folders (`apps/api` or `apps/web`).

### 1. 🌐 Frontend (Next.js) Commands

| Action | Root Command | Inside `apps/web` | Env Loaded | Output / Target |
| :--- | :--- | :--- | :--- | :--- |
| **Dev Server (Local API)** | `npm run dev:web` | `npm run dev` | `.env.development` | `http://localhost:3000` (API: `localhost:4000`) |
| **Dev Server (Prod API)** | `npm run dev:web:prod` | `npm run dev:prod` | `.env.production` | `http://localhost:3000` (API: Live Render Backend) |
| **Static Export Build (Dev API)** | `npm run build:web:dev` | `npm run build:dev` | `.env.development` | Generates `apps/web/out/` (Local API) |
| **Static Export Build (Prod API - Netlify)** | `npm run build:web:prod` | `npm run build:prod` | `.env.production` | Generates `apps/web/out/` (Live API) |
| **Start Dev Build** | `npm run start:web:dev` | `npm run start:dev` | `.env.development` | Serves `.next` dev build locally |
| **Start Production Build** | `npm run start:web:prod` | `npm run start:prod` | `.env.production` | Serves `.next` prod build locally |
| **Lint Code** | `npm run lint --workspace=apps/web` | `npm run lint` | N/A | ESLint & Type validation |

---

### 2. ⚙️ Backend (NestJS) Commands

| Action | Root Command | Inside `apps/api` | Env Loaded | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Dev Server (Watch/Hot-reload)** | `npm run dev:api` | `npm run start:dev` | `.env.development` | Port 4000, hot reload active |
| **Compile API for Production** | `npm run build --workspace=apps/api` | `npm run build` | N/A | Compiles TS to `dist/src/main.js` |
| **Start Production Server** | `npm run prod:api` | `npm run start:prod` | `.env.production` | Runs `node dist/src/main` |
| **Start Debug Mode** | `npm run start:debug --workspace=apps/api` | `npm run start:debug` | `.env.development` | Nest debugger on port 9229 |

---

### 3. 🗄️ Database & Prisma Commands (Dev vs Prod)

| Action | Root Command | Inside `apps/api` | Env Loaded | Target DB |
| :--- | :--- | :--- | :--- | :--- |
| **Dev: Migrate + Seed (All-in-One)** | `npm run migration:dev` | `npm run migration:dev` | `.env.development` | Dev Database |
| **Prod: Migrate + Seed (All-in-One)** | `npm run migration:prod` | `npm run migration:prod` | `.env.production` | Production Database |
| **Dev: Apply/Create Migrations** | `npm run prisma:migrate:dev` | `npm run prisma:migrate:dev` | `.env.development` | Creates new SQL migrations |
| **Prod: Apply Pending Migrations** | `npm run prisma:migrate:prod` | `npm run prisma:migrate:prod` | `.env.production` | Non-interactive safe deploy |
| **Dev: Check Migration Status** | `npm run prisma:status:dev` | `npm run prisma:status:dev` | `.env.development` | Pending / applied migrations |
| **Prod: Check Migration Status** | `npm run prisma:status:prod` | `npm run prisma:status:prod` | `.env.production` | Production DB sync status |
| **Dev: Seed Data Only** | `npm run prisma:seed:dev` | `npm run prisma:seed:dev` | `.env.development` | Seeds roles, admin, permissions |
| **Prod: Seed Data Only** | `npm run prisma:seed:prod` | `npm run prisma:seed:prod` | `.env.production` | Seeds production DB |
| **Regenerate Prisma Client** | `npm run prisma:generate` | `npm run prisma:generate` | `schema.prisma` | Generates engine for Windows/Linux |

---

## 🏁 Complete Step-by-Step Project Lifecycle (Start Se End Tak)

Follow these exact steps from cloning the project to running in development and deploying to production.

### Step 1: Install Dependencies
Run from the root directory to install packages for root, backend, and frontend:
```bash
npm install
```

---

### Step 2: Environment Variables Setup

Ensure your environment configuration files are created:

#### 1. Backend Development (`apps/api/.env.development`):
```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/test_bd?schema=public"
JWT_SECRET="super_secret_jwt_key_development_min_32_chars"
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL="http://localhost:3000"
```

#### 2. Backend Production (`apps/api/.env.production`):
```env
NODE_ENV=production
PORT=4000
DATABASE_URL="postgresql://user:password@your-production-db-host.com/database_name?schema=public"
JWT_SECRET="super_secret_jwt_key_production_min_32_chars"
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL="https://your-frontend-domain.com"
```

#### 3. Frontend Development (`apps/web/.env.development`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

#### 4. Frontend Production (`apps/web/.env.production`):
```env
NEXT_PUBLIC_API_URL=https://your-production-backend.com/api
```

---

### Step 3: Run Database Migrations & Seeds

#### For Local Development:
```bash
# 1. Regenerate Prisma Client
npm run prisma:generate

# 2. Run migrations and seed default data (admin user, modules, roles, permissions)
npm run migration:dev
```

#### For Production Database:
```bash
# Safely deploys migrations to production DB and seeds initial data
npm run migration:prod
```

#### How to Add New Schema Changes / New Tables:
1. Modify `apps/api/prisma/schema.prisma`.
2. Generate migration locally:
   ```bash
   npm run prisma:migrate:dev
   ```
   (Prisma will prompt you for a migration name and create the SQL migration file).
3. Deploy changes to production database when ready:
   ```bash
   npm run prisma:migrate:prod
   ```

---

### Step 4: Run Development Servers (Local Full-Stack)

Open two terminals:

* **Terminal 1: Backend API (Port 4000)**
  ```bash
  npm run dev:api
  ```
  API will run at: [http://localhost:4000/api](http://localhost:4000/api)

* **Terminal 2: Frontend Web (Port 3000)**
  ```bash
  npm run dev:web
  ```
  Web app will run at: [http://localhost:3000](http://localhost:3000)

*(Optional: If you want to develop frontend locally against the Live Production Backend, run `npm run dev:web:prod`).*

---

### Step 5: Build Applications

#### 1. Build Backend API:
```bash
npm run build --workspace=apps/api
```
Compiles TypeScript into `apps/api/dist/src/main.js`.

#### 2. Build Frontend for Development (connects to local API):
```bash
npm run build:web:dev
```

#### 3. Build Frontend for Production (connects to live production API):
```bash
npm run build:web:prod
```

---

### Step 6: Run Production Builds Locally

#### 1. Run Production Backend API:
```bash
npm run prod:api
```

#### 2. Run Production Frontend:
```bash
# Runs production build connected to live production backend
npm run start:web:prod

# OR runs build connected to local backend
npm run start:web:dev
```

---

### Step 7: Docker & Cloud Deployment (e.g. Render / AWS / VPS)

#### Backend Deployment:
- **Root Directory:** Leave **BLANK / EMPTY** (Monorepo context is required).
- **Dockerfile Path:** `apps/api/Dockerfile`
- **Environment Variables on Render / Server:**
  - `NODE_ENV` = `production`
  - `DATABASE_URL` = Your production PostgreSQL connection string
  - `JWT_SECRET` = Your strong production JWT secret
  - `CLIENT_URL` = Your live frontend URL (or `*`)
- The Dockerfile installs OpenSSL 3 compatibility (`apk add --no-cache openssl libc6-compat`), generates Prisma client with `linux-musl-openssl-3.0.x`, and starts the container via `node apps/api/dist/src/main.js`.

#### Frontend Deployment:
- **Root Directory:** Leave **BLANK / EMPTY**.
- **Dockerfile Path:** `apps/web/Dockerfile`
- Uses `npm run build:prod --workspace=apps/web` to bake the production API URL into the Next.js bundle.

---

### Step 8: Netlify Static Export Deployment (Netlify Drop / out.zip)

If deploying the frontend as a pure static site to **Netlify Drop** without needing a Node.js server:

1. **Build Production Static Export**:
   Run from the root directory:
   ```bash
   npm run build:web:prod
   ```
   *(Or inside `apps/web`: `npm run build:prod`)*  
   This compiles Next.js with `output: 'export'`, connecting to the live production API (`.env.production`), and outputs static HTML/CSS/JS into `apps/web/out/`.

2. **Create the Zip File**:
   ```powershell
   Compress-Archive -Path "apps\web\out\*" -DestinationPath "apps\web\out.zip" -Force
   ```

3. **Deploy to Netlify**:
   - Visit [app.netlify.com/drop](https://app.netlify.com/drop).
   - Drag & drop the generated **`apps/web/out.zip`** (or the `out` folder).
   - The included `_redirects` file (`/* /index.html 200`) ensures client-side SPA routing and page refreshes on `/dashboard`, `/login`, `/users`, etc. work seamlessly without 404 errors.

---

## 🛡️ Security & Authentication

- **HttpOnly Cookies**: Secure `access_token` and `refresh_token` storage protecting against XSS attacks.
- **Argon2 Password Hashing**: State-of-the-art password security.
- **Silent Refresh Interceptor**: Axios client automatically refreshes expired access tokens in the background and retries the original request.
- **Granular RBAC**: Role-based access control with module-level permissions (`view`, `create`, `edit`, `delete`, `view_detail`).
- **Input Validation**: Server-side validation via `class-validator` DTOs and client-side validation via Formik + Yup.

---

## 🔍 Code Quality & Verification Commands

```bash
# Type Check Frontend
npx tsc --noEmit --workspace=apps/web

# Lint Frontend
npm run lint --workspace=apps/web

# Check Database Migration Status
npm run prisma:status:dev
npm run prisma:status:prod
```

