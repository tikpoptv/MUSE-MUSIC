# MUSE Music

MUSE Music website coming soon 🎵

## Project Structure

```
MUSE-MUSIC/
├── frontend/          # Next.js Frontend
├── backend/           # Express.js Backend
└── docker-compose.yml # Docker deployment
```

## Getting Started

### Development
```bash
# Backend
cd backend
npm install
cp env.example .env
npm run dev

# Frontend  
cd frontend
npm install
cp env.example .env.local
npm run dev
```

### Docker
```bash
# Run entire system
docker-compose up --build

# Access
# Frontend: http://localhost:7661
# Backend:  http://localhost:7662
```

## Environment Variables

### Frontend
```bash
NEXT_PUBLIC_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:7662
NEXT_PUBLIC_NODE_ENV=production
```

### Backend
```bash
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=muse_music
DB_USER=postgres
DB_PASSWORD=your_password
FRONTEND_URL=http://localhost:7661
```

## API Endpoints

- `GET /api/health` - Health check + database status

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Express.js, PostgreSQL
- **Deployment**: Docker, Docker Compose

---
*Coming Soon* 🚀
