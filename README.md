# MUSE Music 🎵

Modern music web application with AI-powered lyrics analysis, translation, and personalized recommendations.

**Repository**: [https://github.com/tikpoptv/MUSE-MUSIC](https://github.com/tikpoptv/MUSE-MUSIC)

## 📦 Latest Release

**Version 1.3.0 - "Seamless Journey"** ✨ (2025-11-25) - [View Release Notes](./releases/)

- 🎵 **YouTube Transcript Integration** - Auto-fetch lyrics with Python service
- 📺 **Fullscreen Player Enhancements** - Real-time video updates, seek controls
- ❤️ **Favorites & History System** - Complete user tracking
- 📄 **Privacy & Legal Pages** - Terms of Service + Privacy Policy
- 📊 **15 Architecture Diagrams** - Complete system documentation (7,566 lines!)
- 🚀 **56 new features** · 33 bug fixes · 265 commits since v1.2.0

👉 **[See all releases and documentation](./releases/)**

---

## 🚀 Features

- **Music Discovery**: Search and explore songs with YouTube integration
- **Lyrics Management**: Get lyrics from LRCLIB with automatic synchronization
- **AI Analysis**: Translate lyrics, analyze mood, and generate summaries
- **User Authentication**: JWT-based auth with Google OAuth and 2FA support
- **Personalization**: Song ratings, recommendations, and user preferences
- **Image Management**: Upload and process images with MinIO storage

## 📋 Tech Stack

### Frontend
- **Next.js 15** (React SSR/SPA)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Jest** + **Playwright** (Testing)

### Backend
- **Express.js**
- **PostgreSQL**
- **JWT** (Authentication)
- **MinIO** (Object Storage)
- **Swagger** (API Documentation)

### DevOps
- **Docker** + **Docker Compose**
- **Jenkins** (CI/CD)
- **GitHub Actions**

## 📁 Project Structure

```
MUSE-MUSIC/
├── backend/                    # Express.js Backend API
│   ├── src/
│   │   ├── config/            # CORS, database, env, swagger
│   │   ├── controllers/       # Route handlers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, error handling, logging
│   │   ├── models/            # Database models
│   │   ├── docs/              # Swagger documentation
│   │   ├── utils/             # Utility functions
│   │   └── __tests__/         # Unit & integration tests
│   ├── database/
│   │   ├── migrations/        # SQL migrations
│   │   └── scripts/           # DB management
│   ├── index.js
│   └── package.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App Router (pages)
│   │   ├── components/        # React components
│   │   ├── services/          # API clients
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities
│   │   └── __tests__/         # Jest tests
│   ├── tests/                 # Playwright E2E tests
│   ├── public/                # Static assets
│   └── package.json
│
├── docker-compose.infra.dev.yml  # Infrastructure services (PostgreSQL, MinIO, n8n)
├── docker-compose.dev.yml         # Full stack (backend + frontend containers)
├── docker-compose.prod.yml        # Production setup
├── Jenkinsfile
└── TESTING.md
```

## 🛠️ Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** or **yarn**
- **Docker** (optional, for containerized setup)

## ⚡ Quick Start

### Development Setup

```bash
# Clone repository
git clone https://github.com/tikpoptv/MUSE-MUSIC.git
cd MUSE-MUSIC
```

#### 1. Start Infrastructure Services

First, start the infrastructure services (PostgreSQL, MinIO, n8n):

```bash
# Start infrastructure services
docker-compose -f docker-compose.infra.dev.yml up -d

# Verify services are running
docker ps --filter "name=muse-"
```

**Infrastructure Services:**
- **PostgreSQL**: `localhost:7770` (Database schema created automatically on first start)
- **MinIO API**: `localhost:7771` | **MinIO Console**: `localhost:7772`
- **n8n**: `http://localhost:7773`

**Important:** When PostgreSQL container starts for the first time, it automatically:
- Creates the `muse_music` database
- Creates the `n8n` database (for n8n workflow storage)
- Runs all migration files from `backend/database/migrations/` (via `docker-entrypoint-initdb.d`)
- Sets up all tables, indexes, and database structure

**No manual migration needed!** The database is ready to use after infrastructure starts.

**⚠️ If migration fails:** If you encounter any database errors or migration issues, you can run migrations manually:
```bash
npm run migrate
```

#### 2. Install Dependencies

```bash
# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend
```

#### 3. Setup Environment Files

```bash
# Backend environment
cp backend/env.example backend/.env

# Frontend environment
cp frontend/env.example frontend/.env.local
```

**Important:** The default values in `backend/env.example` are configured to connect to the infrastructure services:

- `DB_HOST=localhost` and `DB_PORT=7770` - Connects to PostgreSQL container
- `MINIO_ENDPOINT=localhost` and `MINIO_PORT=7771` - Connects to MinIO container
- `MINIO_ACCESS_KEY=minio_admin` and `MINIO_SECRET_KEY=minio_secret_password` - Default MinIO credentials
- `EMAIL_N8N_WEBHOOK_URL=http://localhost:7773/` - Connects to n8n container
- `N8N_WORKFLOW_URL=http://localhost:7773/api/v1/workflows/...` - n8n workflow endpoints

**Note:** Database migrations run automatically when PostgreSQL container starts for the first time (via `docker-entrypoint-initdb.d`). All tables and schema are created automatically - no manual migration needed!

#### 4. Seed Database

If you want to seed the database with test data:

```bash
npm run db:seed
```

This will create test users:
- **Admin**: `admin` / `Admin@123456`, `reviewer` / `Reviewer@123456`
- **Customers**: `testuser` / `Test@123456`, `john_doe` / `John@123456`, `jane_smith` / `Jane@123456`

#### 5. Start Development Servers

**Option 1: Using VSCode Tasks (Recommended - Auto split terminals)**

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Tasks: Run Task"
3. Select `dev:all`

This will automatically split terminals and run backend and frontend separately.

**Option 2: Run both together (single terminal)**

```bash
npm run dev
```

**Option 3: Run separately (manual terminals)**

```bash
# Terminal 1 - Backend
npm run dev:be

# Terminal 2 - Frontend
npm run dev:fe
```

This will start:
- **Backend**: `http://localhost:3001`
- **Frontend**: `http://localhost:3000`

**Access:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- API Docs: `http://localhost:3001/api-docs` (Swagger UI)
- **n8n**: `http://localhost:7773` (Workflow automation)

---

## 🧱 Part C — TA Testing Environment & Functional Limitations

Since the MUSE Music project relies heavily on external services such as YouTube API, LRCLIB, Google OAuth, MinIO (object storage), n8n (AI workflows), and email automation systems, we cannot include real API keys per Part C requirements (no `.env` files allowed). As a result, when running on TA's machine, many critical features will not be functional.

### 🚫 Features That **Will Not Work** in TA's Environment

* ❌ **Lyrics Fetching / YouTube Transcript** (requires External API key)
* ❌ **AI Analysis / Translation / Mood Detection** (requires n8n workflow + AI model)
* ❌ **Image Upload / Image Processing** (requires MinIO storage)
* ❌ **Email Notification (noreply)** (requires n8n webhook)
* ❌ **Edit Prompt / Backend-AI Integration** (requires n8n)
* ❌ **Admin Tools that depend on External Data**
* ❌ **OAuth Login (Google)**

### ⚠️ Pages That May Show Incomplete Data or Be Empty

* **Home** page (no song data because it requires YouTube API)
* **AI Analysis / Translation** pages
* **Admin Dashboard** (some sections)
* **Prompt Editing** page

### ✔ Features That Will Still Work

* ✅ Login / Logout (via seed DB)
* ✅ Basic UI navigation
* ✅ Endpoints that don't use External API
* ✅ Database operations via seed data
* ✅ Swagger API docs (`http://localhost:3001/api-docs`)
* ✅ Basic admin (read data from DB)
* ✅ Health check endpoint (`/api/health`)

### 📝 Important Notes

Part C emphasizes **process over product**, so the team has prepared:

* ✅ Well-structured codebase
* ✅ Database schema + seed data
* ✅ Example env files in `backend/env.example` and `frontend/env.example`
* ✅ Known Issues documented per environment limitations
* ✅ Documentation linked to Part B
* ✅ Health check endpoint that reports external API configuration status

The system that TA can run will be a **Minimal Functional Version** and does not reflect the full capabilities of MUSE Music in a Production Environment.

**For Testing:** TA can use test credentials from seed data to test authentication and basic features that don't depend on external services.

### 🔧 Setting Up Full Functionality (Optional)

If you want to enable full functionality (not required for Part C), you need to configure external API keys. **Please read `backend/env.example` carefully** - it contains detailed comments explaining each variable and where to obtain them.

#### How to Obtain Each Environment Variable

**1. Google OAuth (for Google Login)**
- **Variables:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Where to get:** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Steps:**
  1. Go to Google Cloud Console → APIs & Services → Credentials
  2. Create OAuth 2.0 Client ID
  3. Configure authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
  4. Copy Client ID and Client Secret to `.env`

**2. YouTube Data API v3 (for Lyrics & Video Search)**
- **Variable:** `YOUTUBE_API_KEY`
- **Where to get:** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Steps:**
  1. Go to Google Cloud Console → APIs & Services → Credentials
  2. Enable "YouTube Data API v3" in APIs & Services → Library
  3. Create API Key (or use existing one)
  4. Copy API Key to `.env`

**3. N8N Workflow (for AI Translation & Analysis)**
- **Variables:** `N8N_API_KEY`, `N8N_WORKFLOW_URL`, `TRANSLATE_WEBHOOK`
- **Where to get:** From your n8n instance (see [N8N Workflow Setup](#-n8n-workflow-setup) section)
- **Steps:**
  1. Start n8n: `docker-compose -f docker-compose.infra.dev.yml up -d`
  2. Access n8n at `http://localhost:7773`
  3. Import workflow from `n8n-translator-workflow.json`
  4. Activate workflow and copy webhook URL
  5. If API authentication is enabled, create API key in n8n Settings
  6. Copy webhook URL and API key to `.env`

**4. MinIO (for Image Storage)**
- **Variables:** `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
- **Where to get:** From MinIO setup (default values provided in `env.example`)
- **Steps:**
  1. Start infrastructure: `docker-compose -f docker-compose.infra.dev.yml up -d`
  2. Access MinIO Console at `http://localhost:7772`
  3. Login with default credentials: `minio_admin` / `minio_secret_password`
  4. Create bucket `muse-music` if not exists
  5. Use default credentials or create new access keys in MinIO Settings

**5. Email Service (N8N Webhook)**
- **Variables:** `EMAIL_N8N_USERNAME`, `EMAIL_N8N_PASSWORD`, `EMAIL_N8N_WEBHOOK_URL`
- **Where to get:** From n8n email workflow webhook
- **Steps:**
  1. Create email workflow in n8n
  2. Configure email credentials (SMTP settings)
  3. Copy webhook URL to `.env`
  4. Set email username/password if required by workflow

**6. LRCLIB (Lyrics API)**
- **Variables:** `LRCLIB_BASE_URL`, `LRCLIB_USER_AGENT`
- **Note:** 
  - No API key required - LRCLIB is a public API
  - **Important:** LRCLIB requires a User-Agent header to identify your application
  - Default `LRCLIB_USER_AGENT` is already configured: `MUSE-MUSIC Backend (https://github.com/tikpoptv/MUSE-MUSIC)`
  - The User-Agent is automatically sent in all LRCLIB API requests (see `backend/src/services/lyricsService.js`)
  - You can customize it in `.env` if needed, but the default value is recommended

**7. JWT Secret**
- **Variable:** `JWT_SECRET`
- **How to generate:** Use any secure random string generator
- **Example:** `openssl rand -base64 32` or use an online generator
- **⚠️ Important:** Change this in production! Never commit real secrets to git.

#### Quick Setup Checklist

For full functionality, ensure these are configured in `backend/.env`:

- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (for Google OAuth)
- [ ] `YOUTUBE_API_KEY` (for lyrics and video search)
- [ ] `N8N_API_KEY` and `N8N_WORKFLOW_URL` (for AI translation)
- [ ] `TRANSLATE_WEBHOOK` (n8n webhook URL)
- [ ] `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` (for image storage)
- [ ] `EMAIL_N8N_WEBHOOK_URL` (for email notifications)
- [ ] `JWT_SECRET` (generate a secure random string)

**Note:** All default values and detailed instructions are available in `backend/env.example`. Read it carefully for complete setup instructions.

---

## 🔄 N8N Workflow Setup

N8N is used for AI-powered lyrics translation and analysis. The infrastructure includes a pre-configured n8n instance.

### Access N8N

After starting infrastructure services, access n8n at:
- **URL**: `http://localhost:7773`
- **Default**: No authentication required (dev environment)

### Import Translator Workflow

A ready-to-use translator workflow is available in the repository:

**Workflow File**: [`n8n-translator-workflow.json`](./n8n-translator-workflow.json)

**Import Steps:**

1. **Open n8n**: Navigate to `http://localhost:7773`

2. **Import Workflow**:
   - Click **"Workflows"** in the sidebar
   - Click **"+"** button → **"Import from File"** or **"Import from URL"**
   - Upload `n8n-translator-workflow.json` or paste its content

3. **Configure Ollama Credentials**:
   - Open the workflow
   - Click on **"Ollama Chat Model"** node
   - Set up Ollama API credentials:
     - **Base URL**: `http://localhost:11434` (or your Ollama endpoint)
     - **Model**: `gpt-oss:120b` (ensure this model is downloaded in Ollama)
   - Save credentials

4. **Activate Workflow**:
   - Toggle the **"Active"** switch at the top right
   - The workflow is now listening for webhook requests

5. **Get Webhook URL**:
   - Click on the **"Webhook"** node
   - Copy the **Production URL** (e.g., `http://localhost:7773/webhook/translator`)

6. **Configure Backend**:
   - Open `backend/.env`
   - Set the webhook URL:
     ```bash
     TRANSLATE_WEBHOOK=http://localhost:7773/webhook/translator
     N8N_WORKFLOW_URL=http://localhost:7773/webhook/translator
     ```
   - If n8n has API authentication enabled, also set:
     ```bash
     N8N_API_KEY=your-n8n-api-key-here
     ```

### Workflow Features

The translator workflow provides:
- **Line-by-line translation** with poetic naturalness
- **Cultural interpretation** of song meaning
- **Mood analysis** (optional) - analyzes emotional tone using 22 mood classes
- **Multi-language support** - translate between any language pairs

### Testing the Workflow

You can test the workflow directly from n8n:
1. Open the workflow
2. Click **"Execute Workflow"** button
3. Provide test input:
   ```json
   {
     "language1": "Thai",
     "language2": "English",
     "lyrics": "ตัวอย่างเนื้อเพลง\nTest lyrics here",
     "moodEnabled": true,
     "moodTopK": 4
   }
   ```
4. Check the output for translation, interpretation, and mood analysis

### Requirements

- **Ollama**: Must be running with `gpt-oss:120b` model downloaded
- **Model Download**: Run `ollama pull gpt-oss:120b` in your terminal
- **Alternative**: You can replace Ollama node with OpenRouter API or other LLM providers

### Docker Setup (Alternative)

**Note:** For development, it's recommended to use `npm run dev` (runs backend/frontend locally) with infrastructure services in Docker. The full Docker setup below runs everything in containers.

```bash
# Development (full Docker stack)
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose -f docker-compose.prod.yml up --build
```

**Access (Docker):**
- Frontend: `http://localhost:7664` (dev) / `http://localhost:7661` (prod)
- Backend: `http://localhost:7665` (dev) / `http://localhost:7662` (prod)
- API Docs: `http://localhost:7665/api-docs` (Swagger UI)

## 🔧 Environment Variables

### Backend (`backend/.env`)

Copy `backend/env.example` to `backend/.env` and configure the following:

#### Default Values (from Infrastructure)

These values are pre-configured in `env.example` to connect to the development infrastructure:

```bash
# Database (connects to docker-compose.infra.dev.yml PostgreSQL)
DB_HOST=localhost
DB_PORT=7770                    # PostgreSQL container port
DB_NAME=muse_music
DB_USER=postgres
DB_PASSWORD=postgres123

# MinIO (connects to docker-compose.infra.dev.yml MinIO)
MINIO_ENDPOINT=localhost
MINIO_PORT=7771                 # MinIO API port
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minio_admin
MINIO_SECRET_KEY=minio_secret_password
MINIO_BUCKET_NAME=muse-music
MINIO_PUBLIC_URL=http://localhost:7771

# N8N (connects to docker-compose.infra.dev.yml n8n)
EMAIL_N8N_WEBHOOK_URL=http://localhost:7773/
N8N_WORKFLOW_URL=http://localhost:7773/api/v1/workflows/...
```

#### Required Configuration

You need to set these values:

```bash
# Server
BACKEND_PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT (⚠️ Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# YouTube API (get from Google Cloud Console)
YOUTUBE_API_KEY=your-youtube-api-key-here

# LRCLIB
LRCLIB_BASE_URL=https://lrclib.net
```

See `backend/env.example` for complete list of all environment variables.

### Frontend (`frontend/.env.local`)
See `frontend/env.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
NEXT_PUBLIC_NODE_ENV=development
```

## 📚 API Documentation

Full API documentation available via **Swagger UI**:
- Development: `http://localhost:3001/api-docs`
- Production: `http://localhost:7662/api-docs`

### Main Endpoints

- `/api/health` - Health check
- `/api/auth` - Authentication (login, register, OAuth)
- `/api/user` - User management
- `/api/songs` - Song management
- `/api/lyrics` - Lyrics retrieval (LRCLIB)
- `/api/analysis` - AI analysis (translation, mood)
- `/api/ratings` - Song ratings
- `/api/recommend` - Personalized recommendations
- `/api/youtube` - YouTube integration
- `/api/images` - Image upload/management
- `/api/2fa` - Two-factor authentication

## 🗄️ Database

### Migrations

**✅ Automatic Migration:** When using `docker-compose.infra.dev.yml`, database migrations run **automatically** when PostgreSQL container starts for the first time. The migration files from `backend/database/migrations/` are executed via `docker-entrypoint-initdb.d`, creating all tables, indexes, and database structure. **You don't need to run migrations manually!**

**When migrations run:**
- First time starting infrastructure: `docker-compose -f docker-compose.infra.dev.yml up -d`
- When PostgreSQL volume is empty (fresh start)
- All migration files in `backend/database/migrations/` are executed automatically

**⚠️ Troubleshooting:** If automatic migration fails or you encounter database errors, you can run migrations manually:

```bash
npm run migrate
```

This will check which migrations have been executed and run any missing ones.

**If you need to run migrations manually** (e.g., for production or non-Docker setup):

```bash
# From project root
npm run migrate
npm run migrate:dev
npm run migrate:prod

# Or from backend directory
cd backend
npm run migrate
npm run migrate:dev
npm run migrate:prod
```

### Seeding

Seed the database with test data:

```bash
# From project root
npm run db:seed
npm run db:seed:dev
npm run db:seed:prod

# Or from backend directory
cd backend
npm run db:seed
npm run db:seed:dev
npm run db:seed:prod
```

**Test Credentials (after seeding):**
- Admin: `admin` / `Admin@123456`, `reviewer` / `Reviewer@123456`
- Customers: `testuser` / `Test@123456`, `john_doe` / `John@123456`, `jane_smith` / `Jane@123456`

### Reset Database

⚠️ **WARNING**: This deletes all data!

```bash
# From backend directory (reset commands not available from root)
cd backend

# Reset database
npm run db:reset

# Reset + Seed
npm run db:fresh

# Environment-specific
npm run db:reset:dev
npm run db:reset:prod
npm run db:fresh:dev
```

## 🧪 Testing

### Frontend

```bash
cd frontend

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e

# All tests
npm run test:full
```

### Backend

```bash
cd backend

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# All tests with coverage
npm run test:coverage
```

See `TESTING.md` and `TEST_COVERAGE_STATUS.md` for detailed testing guide.

---

## 📦 Release Documentation

All release notes and documentation are available in the [`releases/`](./releases/) folder:

| Version | Date | Documentation |
|---------|------|---------------|
| **v1.3.0** ✨ | 2025-11-25 | [📝 Release Notes](./releases/RELEASE_NOTES_v1.3.0.md) |
| v1.2.0 | 2025-11-12 | [📋 Full Report](./releases/RELEASE_READINESS_v1.2.0.md) · [📝 Quick Notes](./releases/RELEASE_NOTES_v1.2.0.md) |
| v1.1.0 | Previous | On `main` branch |

### What's in v1.3.0? ✨ "Seamless Journey"
- � **YouTube Transcript** - Auto-fetch lyrics from YouTube videos
- 📺 **Enhanced Player** - Real-time updates, seek controls, brightness adjustment
- ❤️ **Favorites & History** - Complete tracking system
- � **Privacy & Legal** - Terms of Service + Privacy Policy with acceptance tracking
- ♾️ **Infinite Scroll** - Better browsing experience
- � **Architecture Docs** - 15 professional diagrams (7,566 lines)
- 🚀 **156 files changed** · +21,170 / -1,127 lines · 56 features · 33 fixes

---

## 🚢 CI/CD & Deployment

### Pipeline Overview

**GitHub Actions** → **Jenkins** → **Coolify**

- **GitHub Actions**: Fast CI checks (linting, tests)
- **Jenkins**: Comprehensive build/test gate (prevents bad builds from reaching Coolify)
- **Coolify**: Final deployment and hosting

### Why This Architecture?
✅ Coolify doesn't waste resources on failed builds  
✅ Jenkins acts as quality gate  
✅ Webhook-based deployment is fast

### Infrastructure Requirements
- **PostgreSQL** - Main database
- **MinIO** - Object storage for images
- **N8N** - AI translation & email workflows
- **Ollama** - Local AI models (optional)
- **Jenkins** - CI/CD automation

👉 **[See complete deployment guide](./DEPLOYMENT.md)**

## 📝 Scripts

### Root (Run from project root)

```bash
# Development
npm run dev          # Run both frontend & backend concurrently (single terminal)
npm run dev:be       # Run backend only
npm run dev:fe       # Run frontend only

# Database
npm run migrate      # Run database migrations
npm run migrate:dev  # Run migrations (development)
npm run migrate:prod # Run migrations (production)
npm run db:seed      # Seed database with test data
npm run db:seed:dev  # Seed database (development)
npm run db:seed:prod # Seed database (production)
```

### Backend (Run from `backend/` directory)

```bash
npm run dev          # Development server
npm run start        # Production server
npm run migrate      # Run database migrations
npm run db:reset     # Reset database
npm run db:seed      # Seed database
npm run db:fresh     # Reset + Seed
npm test             # Run all tests
npm run lint         # ESLint
```

### Frontend (Run from `frontend/` directory)

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm test             # Run all tests
npm run lint         # ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

See `LICENSE` file for details.

---

## 📚 Academic Information

This project is part of an academic course:

- **Course:** CPE 334 Software Engineering
- **Institution:** King Mongkut's University of Technology Thonburi (KMUTT)
- **Project Type:** Educational / Academic Project
- **Team:** F5 Team

**Note:** MUSE Music is developed for educational purposes to demonstrate software engineering principles, full-stack development, AI integration, and modern web application architecture. This project is not intended for commercial use.

For more information about privacy and terms of service, please see:
- [Privacy Policy](http://localhost:3000/privacy) (Development) | [Production](https://musemusic.phitik.com/privacy)
- [Terms of Service](http://localhost:3000/terms) (Development) | [Production](https://musemusic.phitik.com/terms)

---

**Built with ❤️ by the MUSE Music team**
