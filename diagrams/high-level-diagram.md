# MUSE MUSIC - High-Level System Diagram

## Overview
High-level diagram showing the overall MUSE MUSIC system at a high level, focusing on data flow and relationships between major components

---

## 🎯 System Context Diagram (Level 0)

```mermaid
graph TB
    subgraph "Users"
        VISITOR[👤 Visitor<br/>Anonymous User]
        USER[👤 Registered User<br/>Customer]
        ADMIN[👨‍💼 Administrator<br/>Content Moderator]
    end
    
    subgraph "MUSE MUSIC Platform"
        SYSTEM[🎵 MUSE MUSIC<br/>Lyrics Analysis Platform<br/><br/>Features:<br/>• AI-powered mood analysis<br/>• Multilingual translation<br/>• Synced lyrics player<br/>• Personalized recommendations]
    end
    
    subgraph "External Services"
        LRCLIB[📚 LRCLIB API<br/>Lyrics Database]
        YOUTUBE[📺 YouTube Transcript API<br/>Video Transcripts]
        OAUTH[🔐 OAuth Providers<br/>Google, GitHub]
        EMAIL[✉️ Email Service<br/>Notifications]
        AI[🤖 AI Models<br/>Ollama/OpenRouter]
    end
    
    VISITOR -->|Browse & Search| SYSTEM
    USER -->|Analyze Songs<br/>Manage Favorites<br/>Get Recommendations| SYSTEM
    ADMIN -->|Moderate Content<br/>Manage System<br/>Review Reports| SYSTEM
    
    SYSTEM -->|Fetch Lyrics| LRCLIB
    SYSTEM -->|Fetch Transcripts| YOUTUBE
    SYSTEM -->|Authenticate| OAUTH
    SYSTEM -->|Send Notifications| EMAIL
    SYSTEM -->|Process AI| AI
    
    style SYSTEM fill:#7B61FF,color:#fff
    style VISITOR fill:#e3f2fd
    style USER fill:#c8e6c9
    style ADMIN fill:#fff9c4
```

**System Boundary:**
- **Internal**: MUSE MUSIC web application (Frontend + Backend + Database)
- **External**: Third-party services and APIs
- **Users**: Three main actor types with different access levels

---

## 📦 Container Diagram (Level 1)

```mermaid
C4Container
    title MUSE MUSIC - Container Architecture

    Person(visitor, "Visitor", "Browses catalog")
    Person(user, "User", "Analyzes songs")
    Person(admin, "Admin", "Manages system")

    Container_Boundary(app, "MUSE MUSIC Application") {
        Container(web, "Web App", "Next.js 15", "React-based SPA with SSR")
        Container(api, "REST API", "Node.js + Express", "Business logic & orchestration")
        ContainerDb(db, "Database", "PostgreSQL 14", "Persistent data storage")
        Container(storage, "File Storage", "MinIO", "Images & files (S3-compatible)")
        Container(workflow, "Workflow Engine", "N8N", "AI automation & email")
        Container(ai, "AI Engine", "Ollama", "Local AI models")
        Container(cache, "Cache", "Redis", "Session & temporary data")
    }

    System_Ext(lrclib, "LRCLIB API")
    System_Ext(youtube, "YouTube API")
    System_Ext(oauth, "OAuth Services")

    Rel(visitor, web, "Uses", "HTTPS")
    Rel(user, web, "Uses", "HTTPS")
    Rel(admin, web, "Uses", "HTTPS")
    
    Rel(web, api, "API calls", "JSON/REST")
    Rel(api, db, "Queries", "PostgreSQL Protocol")
    Rel(api, storage, "Upload/Download", "S3 API")
    Rel(api, workflow, "Triggers", "Webhook")
    Rel(api, cache, "Read/Write", "Redis Protocol")
    Rel(workflow, ai, "Analyze", "HTTP")
    
    Rel(api, lrclib, "Fetch lyrics", "REST")
    Rel(api, youtube, "Fetch transcripts", "REST")
    Rel(web, oauth, "Authenticate", "OAuth 2.0")

    UpdateRelStyle(web, api, $offsetX="-50", $offsetY="-20")
    UpdateRelStyle(api, workflow, $offsetX="20", $offsetY="-30")
```

**Key Containers:**
- **Web App**: User-facing interface (Next.js)
- **REST API**: Backend server (Node.js/Express)
- **Database**: Primary data store (PostgreSQL)
- **File Storage**: Object storage for images (MinIO)
- **Workflow Engine**: Automation platform (N8N)
- **AI Engine**: Local AI processing (Ollama)
- **Cache**: Session management (Redis - future)

---

## 🔄 Data Flow Diagram (Level 2)

### Overall System Data Flow

```mermaid
graph LR
    subgraph "Client Layer"
        BROWSER[🌐 Web Browser]
    end
    
    subgraph "Presentation Layer"
        NEXTJS[Next.js Frontend<br/>React Components<br/>Client/Server Components]
    end
    
    subgraph "API Gateway Layer"
        NGINX[Nginx Reverse Proxy<br/>SSL/TLS Termination<br/>Load Balancing]
    end
    
    subgraph "Application Layer"
        EXPRESS[Express Server<br/>Routes & Controllers<br/>Business Logic]
        MIDDLEWARE[Middleware Stack<br/>Auth, CORS, Rate Limit<br/>Logging, Error Handler]
    end
    
    subgraph "Service Layer"
        SERVICES[Service Components<br/>Auth, Song, Analysis<br/>User, Admin, Share]
    end
    
    subgraph "Integration Layer"
        N8N[N8N Workflows<br/>AI Translation<br/>Email Notifications]
        EXTERNAL[External APIs<br/>LRCLIB, YouTube<br/>OAuth Providers]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL<br/>Primary Database<br/>18 Tables)]
        MINIO[MinIO<br/>Object Storage<br/>Images & Files]
    end
    
    subgraph "AI Layer"
        OLLAMA[Ollama<br/>gpt-oss:120b<br/>Mood & Translation]
    end
    
    BROWSER <-->|HTTPS| NEXTJS
    NEXTJS <-->|REST API| NGINX
    NGINX <-->|Proxy| EXPRESS
    EXPRESS <--> MIDDLEWARE
    MIDDLEWARE <--> SERVICES
    
    SERVICES <-->|SQL Queries| POSTGRES
    SERVICES <-->|S3 API| MINIO
    SERVICES <-->|Webhooks| N8N
    SERVICES <-->|HTTP| EXTERNAL
    
    N8N <-->|Analysis| OLLAMA
    
    style BROWSER fill:#e3f2fd
    style NEXTJS fill:#61dafb,color:#000
    style EXPRESS fill:#90ee90
    style POSTGRES fill:#336791,color:#fff
    style OLLAMA fill:#ff6b6b,color:#fff
    style N8N fill:#ff6d5a,color:#fff
```

---

## 🏗️ Layered Architecture

```mermaid
graph TB
    subgraph "Layer 1: Presentation Layer"
        UI[User Interface<br/>Next.js Pages & Components<br/>React Client Components<br/>Server Components]
        ROUTING[Routing & Navigation<br/>App Router<br/>Dynamic Routes<br/>Auth Guards]
    end
    
    subgraph "Layer 2: API Layer"
        ROUTES[API Routes<br/>RESTful Endpoints<br/>/api/* paths]
        MIDDLEWARE[Middleware<br/>Authentication<br/>Authorization<br/>Validation<br/>Rate Limiting]
    end
    
    subgraph "Layer 3: Business Logic Layer"
        CONTROLLERS[Controllers<br/>Request Handlers<br/>Response Formatting]
        SERVICES[Services<br/>Business Rules<br/>Data Orchestration<br/>External Integration]
    end
    
    subgraph "Layer 4: Data Access Layer"
        MODELS[Data Models<br/>Schema Definitions<br/>Validation Rules]
        DAO[Data Access<br/>Database Queries<br/>CRUD Operations]
    end
    
    subgraph "Layer 5: Infrastructure Layer"
        DB[(Database<br/>PostgreSQL)]
        STORAGE[(File Storage<br/>MinIO)]
        CACHE[(Cache<br/>Redis)]
        QUEUE[(Message Queue<br/>Future: RabbitMQ)]
    end
    
    subgraph "Layer 6: External Services"
        AI[AI Services<br/>N8N + Ollama]
        APIS[External APIs<br/>LRCLIB, YouTube]
        AUTH[Auth Providers<br/>OAuth]
    end
    
    UI --> ROUTING
    ROUTING --> ROUTES
    ROUTES --> MIDDLEWARE
    MIDDLEWARE --> CONTROLLERS
    CONTROLLERS --> SERVICES
    SERVICES --> MODELS
    SERVICES --> DAO
    DAO --> DB
    DAO --> STORAGE
    DAO --> CACHE
    SERVICES --> AI
    SERVICES --> APIS
    ROUTES --> AUTH
    
    style UI fill:#61dafb,color:#000
    style SERVICES fill:#90ee90
    style DB fill:#336791,color:#fff
    style AI fill:#ff6b6b,color:#fff
```

**Layer Responsibilities:**
1. **Presentation**: User interface & interactions
2. **API**: Request routing & validation
3. **Business Logic**: Core application logic
4. **Data Access**: Database operations
5. **Infrastructure**: Data persistence & storage
6. **External**: Third-party integrations

---

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Security Perimeter"
        subgraph "Network Security"
            FIREWALL[🔥 CloudFlare WAF<br/>Web Application Firewall<br/>DDoS Protection<br/>Bot Management<br/>IP Filtering]
            SSL[🔒 CloudFlare SSL/TLS<br/>Universal SSL<br/>TLS 1.3<br/>Auto-renewal]
        end
        
        subgraph "Application Security"
            AUTH[🔑 Authentication<br/>JWT Tokens<br/>OAuth 2.0<br/>Session Management]
            AUTHZ[👮 Authorization<br/>RBAC<br/>Permission Checks<br/>Admin Guards]
            TWOFACTOR[📱 2FA/TOTP<br/>Time-based OTP<br/>Backup Codes<br/>Recovery Options]
        end
        
        subgraph "API Security"
            RATELIMIT[⏱️ Rate Limiting<br/>Per-endpoint Throttle<br/>IP-based Limits]
            CORS_SEC[🌐 CORS Policy<br/>Origin Validation<br/>Whitelist Control]
            VALIDATION[✅ Input Validation<br/>Schema Validation<br/>SQL Injection Prevention<br/>XSS Protection]
        end
        
        subgraph "Data Security"
            ENCRYPTION[🔐 Encryption<br/>Password: bcrypt<br/>Tokens: AES<br/>DB: SSL]
            SANITIZATION[🧹 Data Sanitization<br/>HTML Escaping<br/>SQL Parameterization]
            AUDIT[📝 Audit Logging<br/>Access Logs<br/>Change Tracking<br/>Security Events]
        end
    end
    
    USERS[👥 Users] --> FIREWALL
    FIREWALL --> SSL
    SSL --> CORS_SEC
    CORS_SEC --> RATELIMIT
    RATELIMIT --> VALIDATION
    VALIDATION --> AUTH
    AUTH --> TWOFACTOR
    TWOFACTOR --> AUTHZ
    AUTHZ --> ENCRYPTION
    ENCRYPTION --> SANITIZATION
    SANITIZATION --> AUDIT
    
    style FIREWALL fill:#ff6b6b,color:#fff
    style AUTH fill:#7B61FF,color:#fff
    style ENCRYPTION fill:#ffd93d
```

---

## 📊 Deployment Architecture (Production)

```mermaid
graph TB
    subgraph "Internet"
        USERS[🌍 Users Worldwide]
    end
    
    subgraph "CloudFlare Edge Network"
        CF[☁️ CloudFlare<br/>CDN + WAF + DDoS Protection<br/>SSL/TLS Management<br/>Static Assets Cache<br/>DNS Management]
    end
    
    subgraph "Edge Layer"
        LB[⚖️ Load Balancer<br/>Nginx<br/>SSL Termination<br/>Health Checks]
    end
    
    subgraph "Application Tier - Coolify"
        FE1[Frontend Instance 1<br/>Next.js Container]
        FE2[Frontend Instance 2<br/>Next.js Container]
        BE1[Backend Instance 1<br/>Node.js Container]
        BE2[Backend Instance 2<br/>Node.js Container]
    end
    
    subgraph "Data Tier"
        PG_MASTER[(PostgreSQL Master<br/>Read/Write)]
        PG_REPLICA1[(PostgreSQL Replica 1<br/>Read Only)]
        PG_REPLICA2[(PostgreSQL Replica 2<br/>Read Only)]
        MINIO_CLUSTER[MinIO Cluster<br/>Distributed Storage<br/>Multi-node]
    end
    
    subgraph "Service Tier"
        N8N_CLUSTER[N8N Cluster<br/>Workflow Nodes]
        OLLAMA_CLUSTER[Ollama Cluster<br/>GPU Instances]
    end
    
    subgraph "CI/CD Pipeline"
        GITHUB[📦 GitHub<br/>Source Code]
        GHACTIONS[⚡ GitHub Actions<br/>Quick CI]
        JENKINS[🔧 Jenkins<br/>Build & Test]
        COOLIFY[🚀 Coolify<br/>Deployment Platform]
    end
    
    subgraph "Monitoring"
        LOGS[📊 Logging<br/>Winston Logs]
        METRICS[📈 Metrics<br/>Future: Prometheus]
        ALERTS[🔔 Alerts<br/>Future: Grafana]
    end
    
    USERS --> CF
    CF --> LB
    LB --> FE1
    LB --> FE2
    FE1 --> BE1
    FE2 --> BE2
    
    BE1 --> PG_MASTER
    BE2 --> PG_MASTER
    BE1 --> PG_REPLICA1
    BE2 --> PG_REPLICA2
    
    BE1 --> MINIO_CLUSTER
    BE2 --> MINIO_CLUSTER
    
    BE1 --> N8N_CLUSTER
    BE2 --> N8N_CLUSTER
    N8N_CLUSTER --> OLLAMA_CLUSTER
    
    GITHUB --> GHACTIONS
    GITHUB --> JENKINS
    JENKINS --> COOLIFY
    COOLIFY --> FE1
    COOLIFY --> FE2
    COOLIFY --> BE1
    COOLIFY --> BE2
    
    BE1 --> LOGS
    BE2 --> LOGS
    LOGS --> METRICS
    METRICS --> ALERTS
    
    style USERS fill:#e3f2fd
    style LB fill:#ffd93d
    style PG_MASTER fill:#336791,color:#fff
    style OLLAMA_CLUSTER fill:#ff6b6b,color:#fff
```

---

## 🔄 Request Flow (Typical User Journey)

### Flow: User Analyzes a Song

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant NextJS as Next.js Frontend
    participant Nginx
    participant Express as Express Backend
    participant Auth as Auth Service
    participant Analysis as Analysis Service
    participant DB as PostgreSQL
    participant MinIO
    participant N8N
    participant Ollama as Ollama AI
    
    User->>Browser: Search for song
    Browser->>NextJS: GET /song/[id]
    NextJS->>Nginx: API call
    Nginx->>Express: Forward request
    Express->>Auth: Verify JWT token
    Auth-->>Express: Token valid
    Express->>DB: Fetch song data
    DB-->>Express: Song details
    Express-->>NextJS: Song data
    NextJS-->>Browser: Display song page
    
    User->>Browser: Click "Analyze" button
    Browser->>NextJS: Upload cover image
    NextJS->>MinIO: Store image
    MinIO-->>NextJS: Image URL
    NextJS->>Express: POST /api/analysis
    Express->>Auth: Verify JWT
    Auth-->>Express: Authorized
    Express->>Analysis: Process analysis
    Analysis->>DB: Create processing record
    Analysis->>N8N: Trigger AI workflow
    N8N->>Ollama: Request mood + translation
    Ollama-->>N8N: AI results
    N8N-->>Express: Webhook callback
    Express->>DB: Update results
    DB-->>Express: Success
    Express-->>NextJS: Processing ID
    NextJS-->>Browser: Redirect to results
    Browser->>NextJS: GET /analysis/[id]
    NextJS->>Express: Fetch results
    Express->>DB: Query processing
    DB-->>Express: Analysis data
    Express-->>NextJS: Complete results
    NextJS-->>Browser: Display analysis
    Browser-->>User: Show mood, translation, summary
```

---

## 🎯 Key Design Principles

### 1. Separation of Concerns
- **Frontend**: Pure UI/UX concerns
- **Backend**: Business logic isolated from presentation
- **Database**: Data persistence only
- **External Services**: Integrated through abstraction layers

### 2. Scalability
- **Horizontal Scaling**: Multiple frontend/backend instances
- **Database Replication**: Master-slave PostgreSQL setup
- **Caching Strategy**: Redis for session/temporary data
- **CDN Integration**: CloudFlare CDN for global static assets delivery

### 3. Security First
- **Defense in Depth**: Multiple security layers
- **Zero Trust**: Verify every request
- **Data Protection**: Encryption at rest and in transit
- **Audit Trail**: Comprehensive logging

### 4. Maintainability
- **Modular Architecture**: Clear service boundaries
- **Code Organization**: Consistent folder structure
- **Documentation**: Comprehensive API docs (Swagger)
- **Testing**: Unit, integration, and E2E tests

### 5. Performance
- **Lazy Loading**: On-demand resource loading
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Indexed database queries
- **Caching**: Multi-level caching strategy

---

## 📈 System Metrics & Capacity

### Current Capacity
| Component | Specification | Current Load | Max Capacity |
|-----------|--------------|--------------|--------------|
| **Frontend** | 2 instances @ 2GB RAM | ~20% | 1000 concurrent users |
| **Backend** | 2 instances @ 4GB RAM | ~30% | 500 req/sec |
| **Database** | 4GB RAM, 2 cores, 18 tables | ~40% | 10,000 connections |
| **MinIO** | 100GB storage | ~15GB | 500GB |
| **N8N** | 2GB RAM | ~25% | 50 parallel workflows |
| **Ollama** | 16GB RAM + GPU | ~60% | 10 concurrent analyses |

### Performance Targets
- **Page Load**: < 2 seconds (95th percentile)
- **API Response**: < 500ms (average)
- **AI Analysis**: < 30 seconds (full processing)
- **Database Query**: < 100ms (simple), < 500ms (complex)
- **CloudFlare CDN Cache Hit Rate**: > 90%
- **CloudFlare Edge Response**: < 50ms
- **Uptime**: 99.5% availability

---

## 📚 References

### Architecture Documentation
- **System Design**: `diagrams/architecture-design.md`
- **Use Cases**: `diagrams/use-case-overview.md`
- **Components**: `diagrams/component-diagrams.md`
- **Class Diagram**: `diagrams/class-diagram.md`

### Infrastructure
- **Deployment**: `DEPLOYMENT.md`
- **Docker Compose Dev**: `docker-compose.dev.yml`
- **Docker Compose Prod**: `docker-compose.prod.yml`
- **CI/CD**: `Jenkinsfile`

### Database
- **Schema**: `backend/database/migrations/001_create_initial_schema.sql`
- **Migration Scripts**: `backend/database/scripts/`

### Application
- **Backend**: `backend/src/` (routes, controllers, services)
- **Frontend**: `frontend/src/` (pages, components, services)
- **N8N Workflow**: `n8n-translator-workflow.json`

---

## 🎓 Architecture Decisions

### Why Next.js?
- **SSR/SSG**: Better SEO and initial load performance
- **Full-stack**: API routes alongside frontend
- **React 19**: Latest React features
- **App Router**: Modern routing with layouts

### Why Node.js Backend?
- **JavaScript Everywhere**: Same language frontend/backend
- **Express**: Mature, well-documented framework
- **npm Ecosystem**: Rich library ecosystem
- **Async I/O**: Efficient for I/O-bound operations

### Why PostgreSQL?
- **ACID Compliance**: Strong consistency guarantees
- **JSON Support**: Flexible schema with JSONB
- **Full-text Search**: Built-in search capabilities
- **Extensions**: PostGIS, pg_trgm, uuid-ossp

### Why N8N + Ollama?
- **N8N**: Visual workflow builder, easy to modify
- **Ollama**: Local AI hosting, no API costs
- **Flexibility**: Easy to switch AI models
- **Control**: Full control over AI processing

### Why MinIO?
- **S3-Compatible**: Easy migration to AWS S3
- **Self-hosted**: Full control over file storage
- **Scalable**: Distributed storage support
- **Cost-effective**: No storage API costs

### Why CloudFlare?
- **Global CDN**: Edge caching in 300+ cities worldwide
- **DDoS Protection**: Automatic mitigation of attacks
- **WAF**: Web Application Firewall with custom rules
- **SSL/TLS**: Free Universal SSL with auto-renewal
- **DNS**: Fast, secure DNS resolution
- **Analytics**: Real-time traffic insights
- **Zero Trust**: Additional security layer for admin access

