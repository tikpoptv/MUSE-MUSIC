# MUSE MUSIC - Diagrams Overview

## 📋 Table of Contents

1. [Overview](#overview)
2. [Diagram Files](#diagram-files)
3. [Quick Reference](#quick-reference)
4. [How to Use](#how-to-use)

---

## Overview

This directory contains comprehensive system diagrams for the MUSE MUSIC platform, documenting the architecture, data structures, components, and use cases. All diagrams use **Mermaid** syntax and are kept in sync with the actual codebase.

**Last Updated**: November 25, 2025  
**Completeness**: 100% ✅  
**Total Diagrams**: 25+

---

## Diagram Files

### 1. **use-case-overview.md**
**Purpose**: High-level view of all system use cases and actors

**Contents**:
- Overall use case diagram with 15+ primary use cases
- Actor definitions (Visitor, User, Admin, Content Reviewer)
- External system integrations (LRCLIB, YouTube, OAuth, Email)
- Use case descriptions table with file references

**When to Use**:
- Understanding system capabilities
- Planning new features
- Onboarding new team members
- Stakeholder presentations

**Key Sections**:
- UC1-UC15: Core use cases
- External services integration
- Actor highlights
- Use case notes with component references

---

### 2. **class-diagram.md**
**Purpose**: Database schema and entity relationships

**Contents**:
- Entity Relationship Diagram (ERD) with all 18 tables
- Class definitions with attributes and data types
- Relationship mappings (1:1, 1:*, *:*)
- Enum type definitions
- Index strategies

**Database Tables** (18 total):
- **User Management**: Users, Customers, UserSessions, UserTwoFactorAuth, TwoFactorVerification
- **Music Content**: Songs, LyricsSearchResults, SongAIProcessing, AIProcessingRatings
- **Organization**: Playlists, PlaylistSongs
- **Activity**: History, UserFavorites
- **Communication**: Notifications, Reports
- **System**: Prompts, SystemLogs

**When to Use**:
- Database design and modifications
- Understanding data relationships
- Writing queries
- Planning migrations

---

### 3. **architecture-design.md**
**Purpose**: System architecture at multiple levels

**Contents**:
- **High-Level Architecture**: System context with CloudFlare integration
- **Container Architecture**: C4 model showing all containers
- **Component Architecture**: Frontend and Backend component breakdown
- **Data Flow Architecture**: AI analysis, ForYou recommendations, Authentication flows
- **Deployment Architecture**: Production environment with CI/CD

**Key Sections**:
- System Context (CloudFlare, External APIs)
- Container Diagram (Next.js, Express, PostgreSQL, MinIO, N8N, Ollama)
- Frontend Components (Pages, Components, Services, Utils)
- Backend Components (Routes, Controllers, Services, Middleware)
- External Service Integration

**When to Use**:
- Understanding system structure
- Planning infrastructure changes
- Scaling decisions
- DevOps setup

---

### 4. **high-level-diagram.md**
**Purpose**: Comprehensive system overview with detailed explanations

**Contents**:
- **System Context Diagram (Level 0)**: Users, MUSE Platform, External Services
- **Container Diagram (Level 1)**: All application containers
- **Data Flow Diagram (Level 2)**: Request/response flows
- **Layered Architecture**: 6-layer application structure
- **Security Architecture**: Multi-layer security with CloudFlare
- **Deployment Architecture**: Production setup with Coolify
- **Request Flow**: Typical user journey with sequence
- **System Metrics & Capacity**: Current and max capacity
- **Design Principles**: Architecture decisions explained

**When to Use**:
- System overview presentations
- Architecture decision records
- Performance analysis
- Security audits
- Capacity planning

---

### 5. **component-diagrams.md**
**Purpose**: Detailed component interactions for each use case

**Contents**:
- **21 Use Case Component Diagrams**:
  - UC1: User Registration
  - UC2: User Login (OAuth & Local)
  - UC3: User Setup (Onboarding)
  - UC4: Search Songs
  - UC5: AI Song Analysis
  - UC6: Rate & Review Analysis
  - UC7: Share Analysis (Public)
  - UC8: Favorites & Archive
  - UC9: For You (Personalized Feed)
  - UC10: Admin - Approve Analysis
  - UC11: Admin - Manage Songs
  - UC12: Two-Factor Authentication (2FA)
  - UC13: Playlist Management
  - UC14: View Song Detail & Synced Lyrics Player
  - UC15: Password Reset Flow
  - UC16: User Profile & Account Settings
  - UC17: Notification System
  - UC18: Report System
  - UC19: Admin - System Logs & Monitoring
  - UC20: Admin - AI Prompts Management
  - UC21: History & Activity Tracking

**Each Diagram Shows**:
- Frontend components and pages
- Frontend services
- Backend API routes
- Backend controllers and services
- Database tables
- External services
- Component flow with relationships

**When to Use**:
- Implementing new features
- Debugging issues
- Code reviews
- Understanding specific flows
- Testing planning

---

## Quick Reference

### Architecture Layers

```
┌─────────────────────────────────────────┐
│ Presentation (Next.js Frontend)         │
├─────────────────────────────────────────┤
│ API Gateway (Express Routes)            │
├─────────────────────────────────────────┤
│ Business Logic (Services)               │
├─────────────────────────────────────────┤
│ Data Access (Database Service)          │
├─────────────────────────────────────────┤
│ Infrastructure (PostgreSQL, MinIO)      │
├─────────────────────────────────────────┤
│ External Services (AI, APIs, OAuth)     │
└─────────────────────────────────────────┘
```

### Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **CDN & Security** | CloudFlare | CDN, WAF, DDoS Protection, DNS |
| **Frontend** | Next.js 15 + React 19 | SSR/SSG web application |
| **Backend** | Node.js 24 + Express | RESTful API server |
| **Database** | PostgreSQL 14+ | Primary data store (18 tables) |
| **Storage** | MinIO | S3-compatible object storage |
| **AI** | Ollama (gpt-oss:120b) | Local AI processing |
| **Workflow** | N8N | AI automation & email |
| **Auth** | JWT + OAuth 2.0 | Google, GitHub (Facebook, Apple planned) |
| **2FA** | TOTP | Time-based one-time passwords |
| **Deployment** | Coolify | Container orchestration |
| **CI/CD** | Jenkins + GitHub Actions | Automated pipelines |

### Database Tables Overview

```
Users (13 fields) ──┬── Customers (11 fields)
                    ├── UserSessions (7 fields)
                    ├── UserTwoFactorAuth (10 fields)
                    └── TwoFactorVerification (9 fields)

Songs (13 fields) ──┬── SongAIProcessing (25 fields)
                    ├── AIProcessingRatings (6 fields)
                    ├── History (9 fields)
                    └── UserFavorites (6 fields)

LyricsSearchResults (10 fields) ──> Songs (reference)

Playlists (8 fields) ──> PlaylistSongs (5 fields) ──> Songs

Notifications (6 fields)
Reports (8 fields)
Prompts (6 fields)
SystemLogs (16 fields)
```

---

## How to Use

### For Developers

1. **Starting a new feature?**
   - Check `use-case-overview.md` for related use cases
   - Review `component-diagrams.md` for the specific UC
   - Check `class-diagram.md` for database tables needed

2. **Understanding the system?**
   - Start with `high-level-diagram.md` for overview
   - Deep dive into `architecture-design.md` for details
   - Reference `component-diagrams.md` for specific flows

3. **Database changes?**
   - Always consult `class-diagram.md` first
   - Check relationships before modifying
   - Update diagram after schema changes

### For Project Managers

1. **Planning features?**
   - Use `use-case-overview.md` to identify affected areas
   - Review `component-diagrams.md` for complexity estimation

2. **Stakeholder presentations?**
   - Use `high-level-diagram.md` for executive overview
   - Use `architecture-design.md` for technical discussions

### For DevOps

1. **Infrastructure planning?**
   - Check `architecture-design.md` for deployment architecture
   - Review `high-level-diagram.md` for scaling strategy
   - Check capacity tables for current metrics

2. **Monitoring setup?**
   - Review `component-diagrams.md` UC19 for logging flow
   - Check `class-diagram.md` for SystemLogs table structure

---

## Diagram Maintenance

### Update Checklist

When making code changes that affect architecture:

- [ ] Update relevant diagram in this directory
- [ ] Verify all file paths are correct
- [ ] Check relationships are accurate
- [ ] Update enums if changed
- [ ] Add new components/services to diagrams
- [ ] Update this README if adding new diagrams
- [ ] Commit diagram changes with code changes

### Verification

Run these checks before committing diagram updates:

1. **File paths exist**:
   ```bash
   # Check if referenced files exist
   grep -r "frontend/src/" diagrams/*.md | while read line; do
     # Extract and verify paths
   done
   ```

2. **Service names match**:
   ```bash
   # Compare diagram services with actual files
   ls backend/src/services/*.js
   ls frontend/src/services/*.ts
   ```

3. **Routes match**:
   ```bash
   # Verify API routes
   ls backend/src/routes/*.js
   ```

4. **Database tables match**:
   ```bash
   # Check migration file
   grep "CREATE TABLE" backend/database/migrations/*.sql
   ```

---

## Mermaid Syntax

All diagrams use Mermaid syntax for easy rendering in:
- GitHub (native support)
- VS Code (with Mermaid extension)
- Documentation sites (GitBook, Docusaurus, etc.)

**VS Code Extension**: 
- Install "Markdown Preview Mermaid Support"
- Preview with `Cmd+Shift+V` (Mac) or `Ctrl+Shift+V` (Windows)

---

## Related Documentation

- **Database Schema**: `backend/database/migrations/001_create_initial_schema.sql`
- **API Documentation**: `backend/src/docs/swagger.yaml`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Testing Guide**: `TESTING.md`
- **Release Notes**: `releases/`
- **Main README**: `README.md`

---

## Change Log

| Date | Changes | Updated By |
|------|---------|------------|
| 2025-11-25 | Added Prompts and SystemLogs tables, clarified OAuth providers | GitHub Copilot |
| 2025-11-12 | Added UC19-UC21, updated for v1.2.0 | Development Team |
| 2025-11-10 | Initial comprehensive diagram set | Development Team |

---

## Questions or Issues?

If you find any discrepancies between diagrams and code:

1. Verify with the actual codebase
2. Update the diagram to match reality
3. Create an issue if uncertain
4. Update `DIAGRAM_UPDATES.md` with changes

---

**Maintained by**: MUSE MUSIC Development Team  
**Repository**: [https://github.com/tikpoptv/MUSE-MUSIC](https://github.com/tikpoptv/MUSE-MUSIC)  
**Status**: ✅ 100% Complete and Up-to-date
