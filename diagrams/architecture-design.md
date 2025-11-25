# MUSE MUSIC - Architecture Design

## Overview
System architecture showing the overall structure of the MUSE MUSIC system, including Frontend, Backend, Database, External Services, and Infrastructure

---

## 🏗️ High-Level Architecture

```mermaid
C4Context
    title System Context - MUSE MUSIC Platform

    Person(user, "User", "Music enthusiast looking for lyrics analysis")
    Person(admin, "Admin", "System administrator")
    
    System(museApp, "MUSE MUSIC", "Web application for lyrics analysis with AI")
    
    System_Ext(cloudflare, "CloudFlare", "CDN, WAF, DDoS Protection, DNS")
    System_Ext(lrclib, "LRCLIB API", "External lyrics database")
    System_Ext(youtube, "YouTube Transcript API", "Video transcript service")
    System_Ext(oauth, "OAuth Providers", "Google, GitHub authentication")
    System_Ext(email, "Email Service", "SendGrid/SMTP")
    
    Rel(user, cloudflare, "Uses", "HTTPS")
    Rel(cloudflare, museApp, "Routes to", "HTTPS")
    Rel(admin, museApp, "Manages", "HTTPS")
    Rel(museApp, lrclib, "Fetches lyrics", "REST API")
    Rel(museApp, youtube, "Fetches transcripts", "REST API")
    Rel(museApp, oauth, "Authenticates", "OAuth 2.0")
    Rel(museApp, email, "Sends emails", "SMTP")
```

---

## 🎯 Container Architecture

```mermaid
C4Container
    title Container Diagram - MUSE MUSIC

    Person(user, "User", "End user")
    Person(admin, "Admin", "Administrator")

    Container_Boundary(c1, "MUSE MUSIC Application") {
        Container(web, "Web Application", "Next.js 15, React", "Provides UI for lyrics analysis")
        Container(api, "Backend API", "Node.js, Express", "Handles business logic and AI processing")
        Container(db, "Database", "PostgreSQL 14+", "Stores users, songs, analysis")
        Container(storage, "Object Storage", "MinIO", "Stores images and files")
        Container(n8n, "Workflow Engine", "N8N", "Handles AI translation automation")
        Container(ai, "AI Engine", "Ollama/OpenRouter", "Processes mood analysis and translation")
    }

    System_Ext(lrclib, "LRCLIB API", "External lyrics source")
    System_Ext(youtube, "YouTube API", "Video transcript source")
    System_Ext(oauth, "OAuth Providers", "Authentication")

    Rel(user, web, "Uses", "HTTPS")
    Rel(admin, web, "Manages", "HTTPS")
    Rel(web, api, "Makes API calls", "JSON/HTTPS")
    Rel(api, db, "Reads/Writes", "SQL/TCP")
    Rel(api, storage, "Stores/Retrieves files", "S3 API")
    Rel(api, n8n, "Triggers workflows", "Webhook")
    Rel(n8n, ai, "Requests analysis", "REST API")
    Rel(api, lrclib, "Fetches lyrics", "REST API")
    Rel(api, youtube, "Fetches transcripts", "REST API")
    Rel(web, oauth, "Authenticates", "OAuth 2.0")
```

---

## 🔧 Component Architecture

### Frontend (Next.js)

```mermaid
graph TB
    subgraph "Next.js Application"
        subgraph "Pages/Routes"
            HOME[Home Page]
            FORYOU[For You Page]
            SEARCH[Search Page]
            SONG[Song Detail]
            ANALYSIS[Analysis Page]
            ARCHIVE[Archive Page]
            ADMIN[Admin Dashboard]
            AUTH[Auth Pages]
        end
        
        subgraph "Components"
            NAVBAR[Navbar]
            FOOTER[Footer]
            MUSICCARD[Music Card]
            MOODCARD[Mood Card]
            PLAYER[Lyrics Player]
            FORMS[Forms]
            GUARDS[Auth Guards]
        end
        
        subgraph "Services"
            APISERVICE[API Service]
            AUTHSERVICE[Auth Service]
            SONGSERVICE[Song Service]
            ANALYSISSERVICE[Analysis Service]
            FORYOUSERVICE[ForYou Service]
        end
        
        subgraph "Utils & State"
            LOCALSTORAGE[LocalStorage Manager]
            TYPES[TypeScript Types]
            UTILS[Utilities]
        end
    end
    
    HOME --> APISERVICE
    FORYOU --> FORYOUSERVICE
    SEARCH --> SONGSERVICE
    SONG --> ANALYSISSERVICE
    ANALYSIS --> ANALYSISSERVICE
    AUTH --> AUTHSERVICE
    GUARDS --> AUTHSERVICE
    
    APISERVICE --> LOCALSTORAGE
    AUTHSERVICE --> APISERVICE
    SONGSERVICE --> APISERVICE
    ANALYSISSERVICE --> APISERVICE
    FORYOUSERVICE --> APISERVICE
```

### Backend (Node.js/Express)

```mermaid
graph TB
    subgraph "Backend API"
        subgraph "Entry Point"
            EXPRESS[Express Server]
            SWAGGER[Swagger Docs]
        end
        
        subgraph "Middleware"
            AUTH[Auth Middleware]
            RATELIMIT[Rate Limiter]
            CORS[CORS Handler]
            ERROR[Error Handler]
            LOGGER[Logger]
            ENFORCE[Origin Enforcer]
        end
        
        subgraph "Routes"
            AUTHROUTE[Auth Routes]
            SONGROUTE[Song Routes]
            ANALYSISROUTE[Analysis Routes]
            FORYOUROUTE[ForYou Routes]
            ADMINROUTE[Admin Routes]
            USERROUTE[User Routes]
        end
        
        subgraph "Controllers"
            AUTHCTRL[Auth Controller]
            SONGCTRL[Song Controller]
            ANALYSISCTRL[Analysis Controller]
            FORYOUCTRL[ForYou Controller]
            ADMINCTRL[Admin Controller]
        end
        
        subgraph "Services"
            AUTHSVC[Auth Service]
            SONGSVC[Song Service]
            ANALYSISSVC[Analysis Service]
            FORYOUSVC[ForYou Service]
            USERSVC[User Service]
            DBSVC[Database Service]
            EMAILSVC[Email Service]
            MINIOSVC[MinIO Service]
        end
        
        subgraph "External"
            DB[(PostgreSQL)]
            MINIO[MinIO]
            N8N[N8N Webhook]
            LRCLIB[LRCLIB API]
            YOUTUBE[YouTube API]
        end
    end
    
    EXPRESS --> MIDDLEWARE
    MIDDLEWARE --> ROUTES
    ROUTES --> CONTROLLERS
    CONTROLLERS --> SERVICES
    
    AUTHSVC --> DBSVC
    SONGSVC --> DBSVC
    ANALYSISSVC --> DBSVC
    ANALYSISSVC --> N8N
    FORYOUSVC --> DBSVC
    USERSVC --> DBSVC
    EMAILSVC --> N8N
    
    DBSVC --> DB
    MINIOSVC --> MINIO
    SONGSVC --> LRCLIB
    SONGSVC --> YOUTUBE
```

---

## 🗄️ Data Flow Architecture

### AI Analysis Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant DB
    participant N8N
    participant Ollama
    participant MinIO

    User->>Frontend: Request Song Analysis
    Frontend->>Backend: POST /api/analysis
    Backend->>DB: Check existing processing
    
    alt No existing analysis
        Backend->>DB: Create processing record
        Backend->>Backend: Extract lyrics
        Backend->>N8N: Trigger translation workflow
        N8N->>Ollama: Request AI processing
        Ollama-->>N8N: Return analysis (mood, translation, summary)
        N8N-->>Backend: Webhook callback with results
        Backend->>DB: Update processing record
        Backend->>MinIO: Store cover image (if any)
        Backend-->>Frontend: Return processing ID
    else Analysis exists
        Backend->>DB: Fetch existing result
        Backend-->>Frontend: Return cached analysis
    end
    
    Frontend->>User: Display analysis results
```

### For You Recommendation Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: Visit For You page
    Frontend->>Backend: GET /api/foryou
    
    par Mood Stats
        Backend->>DB: Query user processing history
        Backend->>Backend: Calculate mood distribution
    and Recently Searched
        Backend->>DB: Query recent history
    and Recommendations
        Backend->>DB: Query public approved songs
        Backend->>Backend: Score by mood match
    and Top Hits
        Backend->>DB: Query by ratings
    end
    
    Backend-->>Frontend: Combined ForYou response
    Frontend->>User: Display personalized feed
```

### Authentication Flow (OAuth)

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant OAuth
    participant DB

    User->>Frontend: Click "Login with Google"
    Frontend->>OAuth: Redirect to OAuth provider
    OAuth->>User: Request permission
    User->>OAuth: Grant permission
    OAuth-->>Frontend: Redirect with auth code
    Frontend->>Backend: POST /api/auth/google/callback
    Backend->>OAuth: Exchange code for token
    OAuth-->>Backend: Return user info
    Backend->>DB: Check/Create user
    Backend->>DB: Create session
    Backend-->>Frontend: Return JWT token
    Frontend->>Frontend: Store token in localStorage
    Frontend->>User: Redirect to dashboard
```

---

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "CI/CD Pipeline"
        DEV[Developer] -->|Push| GITHUB[GitHub]
        GITHUB -->|Trigger| GHACTIONS[GitHub Actions<br/>Quick CI]
        GITHUB -->|Webhook| JENKINS[Jenkins<br/>Full Build]
        JENKINS -->|Success| COOLIFY[Coolify<br/>Deploy]
    end
    
    subgraph "Production Environment"
        COOLIFY --> FRONTEND_PROD[Frontend Container<br/>Next.js]
        COOLIFY --> BACKEND_PROD[Backend Container<br/>Node.js]
        
        FRONTEND_PROD --> NGINX[Nginx Reverse Proxy]
        BACKEND_PROD --> NGINX
        
        BACKEND_PROD --> POSTGRES[(PostgreSQL DB)]
        BACKEND_PROD --> MINIO_PROD[MinIO Storage]
        BACKEND_PROD --> N8N_PROD[N8N Workflows]
        N8N_PROD --> OLLAMA_PROD[Ollama AI]
    end
    
    USERS[Users] -->|HTTPS| NGINX
    NGINX -->|SSL/TLS| FRONTEND_PROD
    NGINX -->|SSL/TLS| BACKEND_PROD
```

### Infrastructure Stack

| Component | Technology | Purpose | Scale |
|-----------|-----------|---------|-------|
| **Frontend** | Next.js 15 + React 19 | UI/UX | Serverless/Container |
| **Backend** | Node.js 24 + Express | API Server | 2-4 instances |
| **Database** | PostgreSQL 14+ | Primary data store | Managed DB |
| **Storage** | MinIO (S3-compatible) | File/image storage | 50-500 GB |
| **AI Engine** | Ollama + N8N | AI processing | GPU instance |
| **Reverse Proxy** | Nginx | Load balancer | 2+ instances |
| **CI/CD** | Jenkins + GitHub Actions | Automation | Dedicated server |
| **Monitoring** | (Future: Grafana/Prometheus) | Observability | TBD |

---

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Layer - CloudFlare"
            FIREWALL[CloudFlare Firewall Rules]
            SSL[CloudFlare SSL/TLS]
            WAF[CloudFlare WAF]
            DDOS[CloudFlare DDoS Protection]
        end
        
        subgraph "Application Layer"
            AUTH[JWT Authentication]
            OAUTH[OAuth 2.0]
            TWOFACTOR[2FA/TOTP]
            RATELIMIT_SEC[Rate Limiting]
            CORS_SEC[CORS Policy]
        end
        
        subgraph "Data Layer"
            ENCRYPTION[Password Hashing]
            TOKENENC[Token Encryption]
            BACKUP[Encrypted Backups]
        end
        
        subgraph "Access Control"
            RBAC[Role-Based Access]
            PERMISSIONS[Permission Checks]
            SESSION[Session Management]
        end
    end
    
    USERS[Users] --> FIREWALL
    FIREWALL --> WAF
    WAF --> SSL
    SSL --> DDOS
    DDOS --> RATELIMIT_SEC
    RATELIMIT_SEC --> CORS_SEC
    CORS_SEC --> AUTH
    AUTH --> RBAC
    RBAC --> PERMISSIONS
```

### Security Features

- **CloudFlare Protection**:
  - **CDN**: Global content delivery network
  - **WAF**: Web Application Firewall with custom rules
  - **DDoS Protection**: Automatic mitigation of large-scale attacks
  - **SSL/TLS**: Universal SSL with TLS 1.3 support
  - **Bot Management**: Automated bot detection and blocking
  - **DNS Management**: Secure DNS resolution

- **Authentication**: JWT tokens + OAuth 2.0 (Google, GitHub)
- **Authorization**: Role-based access control (Customer, Admin, Super Admin)
- **2FA**: TOTP-based two-factor authentication
- **Rate Limiting**: Per-endpoint request throttling
- **CORS**: Frontend origin enforcement
- **Encryption**: 
  - Passwords: bcrypt hashing
  - Tokens: AES encryption
  - Database: PostgreSQL SSL
  - Storage: MinIO encryption at rest
- **Session Management**: Token expiry + refresh mechanism
- **Audit Logging**: System logs for admin actions

---

## 📊 Scalability Considerations

### Horizontal Scaling

```mermaid
graph LR
    CF[CloudFlare CDN/WAF] --> LB[Load Balancer<br/>Nginx]
    
    LB --> BE1[Backend Instance 1]
    LB --> BE2[Backend Instance 2]
    LB --> BE3[Backend Instance 3]
    
    BE1 --> DB[(PostgreSQL<br/>Master)]
    BE2 --> DB
    BE3 --> DB
    
    DB --> REPLICA1[(Read Replica 1)]
    DB --> REPLICA2[(Read Replica 2)]
    
    BE1 --> REDIS[Redis Cache]
    BE2 --> REDIS
    BE3 --> REDIS
```

### Performance Optimization

- **Database**: 
  - Connection pooling (pg-pool)
  - Indexed queries (see schema indexes)
  - Read replicas for heavy reads
- **Caching**: 
  - Redis for session storage
  - CDN for static assets (MinIO + CloudFlare)
- **API**: 
  - Rate limiting per endpoint
  - Response compression (gzip)
  - Pagination for large datasets
- **Frontend**: 
  - Next.js SSR/SSG
  - Image optimization
  - Code splitting

---

## 📁 File References

### Architecture Files
- **Deployment**: `DEPLOYMENT.md`
- **Database Schema**: `backend/database/migrations/001_create_initial_schema.sql`
- **Docker Compose**: `docker-compose.dev.yml`, `docker-compose.prod.yml`
- **CI/CD**: `Jenkinsfile`

### Service Files
- **Backend Services**: `backend/src/services/*.js`
- **Backend Routes**: `backend/src/routes/*.js`
- **Backend Controllers**: `backend/src/controllers/*.js`
- **Frontend Services**: `frontend/src/services/*.ts`
- **Frontend Components**: `frontend/src/components/*.tsx`

### Configuration
- **Backend Config**: `backend/src/config/*.js`
- **Frontend Config**: `frontend/next.config.ts`
- **Environment**: `backend/env.example`, `frontend/env.example`

---

## 🚀 Infrastructure & Performance

### Current Setup
- **CloudFlare**: CDN, WAF, DDoS Protection, SSL/TLS management, DNS
- **Coolify**: Container orchestration and deployment
- **Nginx**: Reverse proxy and load balancing
- **PostgreSQL**: Primary database with replication support
- **MinIO**: Object storage for media files
- **Redis**: Caching layer (planned)

### Performance Metrics
- **CDN Cache Hit Rate**: Target 90%+ (CloudFlare)
- **API Response Time**: < 200ms average
- **Database Query Time**: < 50ms average
- **Page Load Time**: < 2s (First Contentful Paint)
- **Uptime**: 99.9% SLA target

---

## 🔮 Future Enhancements

- **Real-time Features**: WebSocket for live updates
- **Mobile Apps**: React Native iOS/Android
- **Advanced AI**: Custom fine-tuned models
- **Premium Features**: Subscription management
- **Analytics**: User behavior tracking with Mixpanel
- **Monitoring**: Grafana + Prometheus dashboards
- **CloudFlare Analytics**: Advanced analytics and insights
- **Microservices**: Split monolith into services (if scale requires)

