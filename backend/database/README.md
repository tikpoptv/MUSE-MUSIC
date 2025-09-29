# MUSE Music Database

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Copy environment file
cp env.example .env

# Edit database config in .env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=muse_music
DB_PASSWORD=your_password
DB_PORT=5432
```

### 2. Run Migration
```bash
# Run all migrations
npm run migrate

# Development environment
npm run migrate:dev

# Production environment  
npm run migrate:prod
```

## 📁 Structure

```
database/
├── migrations/           # SQL migration files
│   └── 001_create_initial_schema.sql
├── scripts/             # Migration & seed scripts
│   └── migrate.js
└── README.md           # This file
```

## 🎯 What Migration Creates

- **12 Tables** - Users, Songs, Playlists, etc.
- **Indexes** - For better performance
- **Triggers** - Auto-update timestamps
- **Functions** - Rating statistics

## ⚠️ Note

Migration creates **empty database structure** only.
No sample data included.

## 🔧 Commands

```bash
npm run migrate        # Run migrations
npm run migrate:dev    # Development
npm run migrate:prod   # Production
```
