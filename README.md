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
├── docker-compose.dev.yml
├── docker-compose.prod.yml
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

# Backend
cd backend
npm install
cp env.example .env
npm run migrate
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp env.example .env.local
npm run dev
```

### Docker Setup

```bash
# Development
docker-compose -f docker-compose.dev.yml up --build

# Production
docker-compose -f docker-compose.prod.yml up --build
```

**Access:**
- Frontend: `http://localhost:7664` (dev) / `http://localhost:7661` (prod)
- Backend: `http://localhost:7665` (dev) / `http://localhost:7662` (prod)
- API Docs: `http://localhost:7665/api-docs` (Swagger UI)

## 🔧 Environment Variables

### Backend (`backend/.env`)
See `backend/env.example` for all required variables:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=muse_music
DB_USER=postgres
DB_PASSWORD=your_password

# Server
BACKEND_PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# MinIO
MINIO_ENDPOINT=your-minio-endpoint
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_NAME=muse-music

# YouTube API
YOUTUBE_API_KEY=your-youtube-api-key

# LRCLIB
LRCLIB_BASE_URL=https://lrclib.net
```

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

```bash
cd backend

# Run migrations
npm run migrate

# Reset database (⚠️ WARNING: Deletes all data)
npm run db:reset

# Environment-specific
npm run migrate:dev
npm run migrate:prod
npm run db:reset:dev
npm run db:reset:prod
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

### Root
```bash
npm run dev  # Run both frontend & backend concurrently
```

### Backend
```bash
npm run dev          # Development server
npm run start        # Production server
npm run migrate      # Run database migrations
npm run db:reset     # Reset database
npm test             # Run all tests
npm run lint         # ESLint
```

### Frontend
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

**Built with ❤️ by the MUSE Music team**
