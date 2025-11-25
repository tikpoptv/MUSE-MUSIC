# MUSE MUSIC - Detailed Component Architecture

## Overview
Comprehensive component architecture diagram showing all major components, their relationships, and data flow in the MUSE MUSIC system. This diagram is based on actual codebase inspection.

**Last Updated:** November 25, 2025  
**Repository:** tikpoptv/MUSE-MUSIC  
**Branch:** docs/diagrams

---

## 🏗️ Complete System Component Architecture

```mermaid
graph TB
    subgraph "Frontend Layer - Next.js 15 + React 19"
        subgraph "Pages/Routes"
            PAGE_HOME[Home Page<br/>page.tsx]
            PAGE_LOGIN[Login Page<br/>login/page.tsx]
            PAGE_REGISTER[Register Page<br/>register/page.tsx]
            PAGE_SONG[Song Analysis<br/>song/page.tsx]
            PAGE_FORYOU[For You<br/>for-you/page.tsx]
            PAGE_ACCOUNT[Account Settings<br/>account/page.tsx]
            PAGE_SETUP[Setup Wizard<br/>setup/step1-3]
            PAGE_SHARE[Share Link<br/>share/[shortLink]]
            PAGE_ADMIN[Admin Dashboard<br/>admin/*]
        end
        
        subgraph "Core Components"
            COMP_NAVBAR[Navbar<br/>Navigation + Auth Status]
            COMP_AUTHGUARD[AuthGuard<br/>Route Protection]
            COMP_ADMINGUARD[AdminGuard<br/>Admin Protection]
            COMP_MUSICCARD[MusicCard<br/>Song Display]
            COMP_LYRICS[LyricsViewer<br/>Translation Display]
            COMP_PLAYER[SyncedLyricsPlayer<br/>YouTube Integration]
            COMP_MOOD[MoodSection<br/>Emotion Analysis]
            COMP_FEEDBACK[FeedbackSection<br/>Rating System]
            COMP_COVER[CoverImageUpload<br/>Image Management]
        end
        
        subgraph "Modal Components"
            MODAL_SHARE[ShareModal]
            MODAL_2FA[2FA Modals<br/>Setup/Manage/Disable]
            MODAL_RESET[ResetPassword]
            MODAL_APPROVE[ApproveReject<br/>Admin Actions]
            MODAL_NAVIGATE[NavigateAwayConfirm]
        end
        
        subgraph "Frontend Services (TypeScript)"
            SVC_AUTH_F[authService.ts<br/>Login/Register/Logout]
            SVC_SONG_F[songService.ts<br/>Song CRUD]
            SVC_ANALYSIS_F[analysisService.ts<br/>AI Translation]
            SVC_FAVORITE_F[favoriteService.ts<br/>Favorites Management]
            SVC_HISTORY_F[historyService.ts<br/>User History]
            SVC_YOUTUBE_F[youtubeService.ts<br/>Video Search]
            SVC_IMAGE_F[imageService.ts<br/>Upload/Delete Images]
            SVC_ADMIN_F[adminServices.ts<br/>Admin Operations]
            SVC_API[api.ts<br/>HTTP Client + Interceptors]
        end
        
        subgraph "Frontend Utils"
            UTIL_STORAGE[localStorageManager<br/>Token/Data Storage]
            UTIL_LYRICS[lyricsMappingUtils<br/>Lyrics Processing]
            UTIL_PASSWORD[passwordValidation<br/>Password Rules]
            UTIL_LANGUAGE[languageUtils<br/>i18n Support]
            UTIL_DATE[dateUtils<br/>Date Formatting]
        end
    end
    
    subgraph "Backend Layer - Node.js 24 + Express"
        subgraph "Entry Point"
            SERVER[index.js<br/>Express Server<br/>Port 3001]
        end
        
        subgraph "Core Middleware"
            MW_HELMET[Helmet<br/>Security Headers]
            MW_CORS[CORS<br/>Origin Control]
            MW_MORGAN[Morgan<br/>HTTP Logging]
            MW_LOGGER[Logger<br/>Request/Response]
            MW_ERROR[ErrorHandler<br/>Global Error]
            MW_AUTH[authMiddleware<br/>JWT Verification]
            MW_ORIGIN[enforceFrontendOrigin<br/>Origin Validation]
            MW_2FA[twoFactorMiddleware<br/>2FA Check]
            MW_RATELIMIT[Rate Limiters<br/>Analysis/Transcript]
        end
        
        subgraph "API Routes (27 files)"
            ROUTE_AUTH[auth.js<br/>/api/auth]
            ROUTE_USER[user.js<br/>/api/user]
            ROUTE_SONGS[songs.js<br/>/api/songs]
            ROUTE_LYRICS[lyrics.js<br/>/api/lyrics]
            ROUTE_ANALYSIS[analysis.js<br/>/api/analysis]
            ROUTE_RATING[ratings.js<br/>/api/ratings]
            ROUTE_FAV[favorites.js<br/>/api/favorites]
            ROUTE_HISTORY[history.js<br/>/api/history]
            ROUTE_SHARE[share.js<br/>/api/share]
            ROUTE_YOUTUBE[youtube.js<br/>/api/youtube]
            ROUTE_IMAGE[images.js<br/>/api/images]
            ROUTE_2FA[twoFactor.js<br/>/api/2fa]
            ROUTE_SETUP[setup.js<br/>/api/setup]
            ROUTE_ADMIN[admin*.js<br/>/api/admin/*]
            ROUTE_DASHBOARD[dashboard.js<br/>/api/dashboard]
            ROUTE_RECOMMEND[recommend*.js<br/>/api/recommend]
            ROUTE_FORYOU[foryou.js<br/>/api/foryou]
            ROUTE_N8N[n8nWorkflow.js<br/>/api/n8n/workflow]
            ROUTE_PROMPT[prompts.js<br/>/api/prompts]
        end
        
        subgraph "Controllers (29 files)"
            CTRL_AUTH[authController<br/>Login/Register/OAuth]
            CTRL_USER[userController<br/>Profile/Settings]
            CTRL_SONG[songController<br/>Search/Get Songs]
            CTRL_LYRICS[lyricsController<br/>Fetch External Lyrics]
            CTRL_TRANSLATE[translateController<br/>AI Translation]
            CTRL_RATING[ratingController<br/>Save Ratings]
            CTRL_FAVORITE[favoriteController<br/>Add/Remove Favorites]
            CTRL_HISTORY[historyController<br/>Track History]
            CTRL_SHARE[shareController<br/>Generate Share Links]
            CTRL_YOUTUBE[youtubeController<br/>Search Videos]
            CTRL_IMAGE[imageController<br/>Upload to MinIO]
            CTRL_2FA[twoFactorController<br/>TOTP Management]
            CTRL_ADMIN[admin*Controllers<br/>Manage/Songs/Analysis/Logs]
            CTRL_PROCESSING[processingController<br/>Update Processing Data]
            CTRL_DASHBOARD[dashboardController<br/>Statistics]
            CTRL_PROMPT[promptController<br/>Prompt CRUD]
        end
        
        subgraph "Business Logic Services (31 files)"
            SVC_USER[userService<br/>User CRUD + Bcrypt]
            SVC_AUTH_B[authService<br/>Login Logic]
            SVC_GOOGLE[googleAuthService<br/>OAuth Integration]
            SVC_SESSION[sessionService<br/>Session Management]
            SVC_JWT[jwtService<br/>Token Generation]
            SVC_SONG[songService<br/>Song Operations]
            SVC_LYRICS[lyricsService<br/>LRCLIB API]
            SVC_TRANSLATE[translateService<br/>N8N Webhook]
            SVC_YOUTUBE[youtubeService<br/>YouTube API + Python]
            SVC_RATING[ratingService<br/>Rating CRUD]
            SVC_FAVORITE[favoriteService<br/>Favorite CRUD]
            SVC_HISTORY[historyService<br/>History CRUD]
            SVC_SHARE[shareService<br/>Short Link Generation]
            SVC_PROCESSING[processingService<br/>Processing Updates]
            SVC_MINIO[minioService<br/>S3 Operations]
            SVC_EMAIL[emailService<br/>N8N Email Webhook]
            SVC_2FA[twoFactorService<br/>Speakeasy + QRCode]
            SVC_ADMIN[admin*Services<br/>Admin Operations]
            SVC_DASHBOARD[dashboardService<br/>Analytics Queries]
            SVC_RECOMMEND[recommend*Services<br/>Recommendation Logic]
            SVC_FORYOU[foryouService<br/>Personalized Feed]
            SVC_PROMPT[promptService<br/>Prompt Management]
            SVC_N8N[n8nService<br/>Email Webhook]
            SVC_N8NWF[n8nWorkflowService<br/>Workflow API]
            SVC_LOG[logService<br/>System Logs]
            SVC_DB[databaseService<br/>Query Helper]
            SVC_ANALYSIS[analysisService<br/>Analysis Logic]
        end
        
        subgraph "External Integration"
            PYTHON_SCRIPT[youtube_transcript.py<br/>Python Script]
        end
    end
    
    subgraph "Database Layer - PostgreSQL 14+"
        subgraph "Core Tables"
            TBL_USERS[(Users<br/>Authentication)]
            TBL_CUSTOMERS[(Customers<br/>Preferences)]
            TBL_SESSIONS[(UserSessions<br/>JWT Tokens)]
            TBL_SETTINGS[(UserSettings<br/>2FA + Preferences)]
        end
        
        subgraph "Content Tables"
            TBL_LYRICS[(LyricsSearchResults<br/>External API Cache)]
            TBL_SONGS[(Songs<br/>Song Metadata)]
            TBL_PROCESSING[(SongAIProcessing<br/>Translation Results)]
        end
        
        subgraph "User Activity Tables"
            TBL_FAVORITES[(UserFavorites<br/>Liked Songs)]
            TBL_HISTORY[(UserHistory<br/>Analysis History)]
            TBL_RATINGS[(UserRatings<br/>Feedback)]
            TBL_SHARED[(SharedSongs<br/>Share Links)]
        end
        
        subgraph "System Tables"
            TBL_PROMPTS[(Prompts<br/>AI Prompts)]
            TBL_LOGS[(SystemLogs<br/>Audit Trail)]
            TBL_HEALTH[(HealthCheckStatus<br/>Monitoring)]
            TBL_ERRORS[(ErrorLogs<br/>Error Tracking)]
            TBL_AUDIT[(AuditLogs<br/>Admin Actions)]
        end
        
        subgraph "Future Tables"
            TBL_PLAYLISTS[(Playlists<br/>⚠️ Future)]
            TBL_PLAYLIST_SONGS[(PlaylistSongs<br/>⚠️ Future)]
            TBL_NOTIFICATIONS[(Notifications<br/>⚠️ Future)]
            TBL_REPORTS[(Reports<br/>⚠️ Future)]
        end
    end
    
    subgraph "External Services & Infrastructure"
        subgraph "Storage & CDN"
            EXT_MINIO[MinIO<br/>S3-Compatible Storage<br/>Cover Images]
            EXT_CLOUDFLARE[CloudFlare<br/>CDN + WAF + DDoS]
        end
        
        subgraph "AI & Automation"
            EXT_N8N[N8N Workflow Engine<br/>Translation Webhook]
            EXT_OLLAMA[Ollama<br/>AI Model: gpt-oss:120b]
        end
        
        subgraph "External APIs"
            EXT_LRCLIB[LRCLIB API<br/>Lyrics Database]
            EXT_YOUTUBE[YouTube Data API v3<br/>Video Search]
            EXT_YOUTUBE_TRANSCRIPT[YouTube Transcript API<br/>Python Library]
            EXT_GOOGLE_OAUTH[Google OAuth 2.0<br/>Authentication]
        end
    end
    
    %% Frontend Page to Component Connections
    PAGE_HOME --> COMP_NAVBAR
    PAGE_HOME --> COMP_MUSICCARD
    PAGE_LOGIN --> SVC_AUTH_F
    PAGE_REGISTER --> SVC_AUTH_F
    PAGE_SONG --> COMP_LYRICS
    PAGE_SONG --> COMP_PLAYER
    PAGE_SONG --> COMP_MOOD
    PAGE_SONG --> COMP_FEEDBACK
    PAGE_SONG --> COMP_COVER
    PAGE_FORYOU --> COMP_MUSICCARD
    PAGE_ACCOUNT --> MODAL_2FA
    PAGE_SETUP --> SVC_AUTH_F
    PAGE_SHARE --> COMP_LYRICS
    PAGE_ADMIN --> COMP_ADMINGUARD
    
    %% Component to Service Connections
    COMP_AUTHGUARD --> SVC_AUTH_F
    COMP_ADMINGUARD --> SVC_AUTH_F
    COMP_MUSICCARD --> SVC_SONG_F
    COMP_MUSICCARD --> SVC_FAVORITE_F
    COMP_LYRICS --> SVC_ANALYSIS_F
    COMP_PLAYER --> SVC_YOUTUBE_F
    COMP_MOOD --> SVC_ANALYSIS_F
    COMP_FEEDBACK --> SVC_SONG_F
    COMP_COVER --> SVC_IMAGE_F
    MODAL_SHARE --> SVC_SONG_F
    
    %% Frontend Service to API Connections
    SVC_AUTH_F --> SVC_API
    SVC_SONG_F --> SVC_API
    SVC_ANALYSIS_F --> SVC_API
    SVC_FAVORITE_F --> SVC_API
    SVC_HISTORY_F --> SVC_API
    SVC_YOUTUBE_F --> SVC_API
    SVC_IMAGE_F --> SVC_API
    SVC_ADMIN_F --> SVC_API
    
    %% API to Backend Routes
    SVC_API -->|HTTP/JSON| SERVER
    SERVER --> MW_HELMET
    SERVER --> MW_CORS
    SERVER --> MW_MORGAN
    SERVER --> MW_LOGGER
    MW_LOGGER --> ROUTE_AUTH
    MW_LOGGER --> ROUTE_USER
    MW_LOGGER --> ROUTE_SONGS
    MW_LOGGER --> ROUTE_ANALYSIS
    
    %% Routes to Controllers
    ROUTE_AUTH --> CTRL_AUTH
    ROUTE_USER --> CTRL_USER
    ROUTE_SONGS --> CTRL_SONG
    ROUTE_LYRICS --> CTRL_LYRICS
    ROUTE_ANALYSIS --> CTRL_TRANSLATE
    ROUTE_RATING --> CTRL_RATING
    ROUTE_FAV --> CTRL_FAVORITE
    ROUTE_HISTORY --> CTRL_HISTORY
    ROUTE_SHARE --> CTRL_SHARE
    ROUTE_YOUTUBE --> CTRL_YOUTUBE
    ROUTE_IMAGE --> CTRL_IMAGE
    ROUTE_2FA --> CTRL_2FA
    ROUTE_ADMIN --> CTRL_ADMIN
    
    %% Controllers to Services
    CTRL_AUTH --> SVC_USER
    CTRL_AUTH --> SVC_AUTH_B
    CTRL_AUTH --> SVC_GOOGLE
    CTRL_AUTH --> SVC_SESSION
    CTRL_AUTH --> SVC_JWT
    CTRL_AUTH --> SVC_EMAIL
    CTRL_USER --> SVC_USER
    CTRL_SONG --> SVC_SONG
    CTRL_SONG --> SVC_PROCESSING
    CTRL_LYRICS --> SVC_LYRICS
    CTRL_TRANSLATE --> SVC_TRANSLATE
    CTRL_RATING --> SVC_RATING
    CTRL_FAVORITE --> SVC_FAVORITE
    CTRL_HISTORY --> SVC_HISTORY
    CTRL_SHARE --> SVC_SHARE
    CTRL_YOUTUBE --> SVC_YOUTUBE
    CTRL_IMAGE --> SVC_MINIO
    CTRL_2FA --> SVC_2FA
    CTRL_ADMIN --> SVC_ADMIN
    CTRL_DASHBOARD --> SVC_DASHBOARD
    
    %% Services to Database
    SVC_USER --> TBL_USERS
    SVC_USER --> TBL_CUSTOMERS
    SVC_SESSION --> TBL_SESSIONS
    SVC_SONG --> TBL_SONGS
    SVC_SONG --> TBL_PROCESSING
    SVC_LYRICS --> TBL_LYRICS
    SVC_RATING --> TBL_RATINGS
    SVC_FAVORITE --> TBL_FAVORITES
    SVC_HISTORY --> TBL_HISTORY
    SVC_SHARE --> TBL_SHARED
    SVC_2FA --> TBL_SETTINGS
    SVC_PROMPT --> TBL_PROMPTS
    SVC_LOG --> TBL_LOGS
    SVC_DASHBOARD --> TBL_PROCESSING
    SVC_DASHBOARD --> TBL_SONGS
    
    %% Services to External Services
    SVC_LYRICS -->|HTTP GET| EXT_LRCLIB
    SVC_TRANSLATE -->|Webhook POST| EXT_N8N
    SVC_YOUTUBE -->|API Call| EXT_YOUTUBE
    SVC_YOUTUBE -->|Python subprocess| PYTHON_SCRIPT
    PYTHON_SCRIPT -->|API Call| EXT_YOUTUBE_TRANSCRIPT
    SVC_MINIO -->|S3 API| EXT_MINIO
    SVC_EMAIL -->|Webhook POST| EXT_N8N
    SVC_GOOGLE -->|OAuth 2.0| EXT_GOOGLE_OAUTH
    EXT_N8N -->|HTTP POST| EXT_OLLAMA
    EXT_MINIO --> EXT_CLOUDFLARE
    
    %% Utils Connections
    SVC_AUTH_F --> UTIL_STORAGE
    SVC_API --> UTIL_STORAGE
    COMP_LYRICS --> UTIL_LYRICS
    PAGE_REGISTER --> UTIL_PASSWORD
    
    %% Middleware Protection
    MW_AUTH --> ROUTE_USER
    MW_AUTH --> ROUTE_SONGS
    MW_AUTH --> ROUTE_ADMIN
    MW_ORIGIN --> ROUTE_USER
    MW_ORIGIN --> ROUTE_SONGS
    MW_2FA --> ROUTE_ADMIN
    MW_RATELIMIT --> ROUTE_ANALYSIS
    MW_RATELIMIT --> ROUTE_YOUTUBE
    
    %% Error Flow
    SERVER --> MW_ERROR
    CTRL_AUTH --> MW_ERROR
    CTRL_SONG --> MW_ERROR
    MW_ERROR --> TBL_ERRORS

    style PAGE_HOME fill:#e3f2fd
    style PAGE_LOGIN fill:#e3f2fd
    style PAGE_SONG fill:#e3f2fd
    style PAGE_ADMIN fill:#fff9c4
    style SERVER fill:#7B61FF,color:#fff
    style EXT_N8N fill:#ff6d5a,color:#fff
    style EXT_OLLAMA fill:#000,color:#fff
    style EXT_MINIO fill:#C72C48,color:#fff
    style TBL_PLAYLISTS fill:#ffebee
    style TBL_NOTIFICATIONS fill:#ffebee
    style TBL_REPORTS fill:#ffebee
```

---

## 📊 Component Count Summary

### Frontend Layer
- **Pages/Routes**: 9 main page groups
- **Core Components**: 9 reusable components
- **Modal Components**: 5 modal types
- **Services**: 9 TypeScript services
- **Utils**: 5 utility modules
- **Total Frontend Files**: ~50+ files

### Backend Layer
- **Routes**: 27 route files
- **Controllers**: 29 controller files
- **Services**: 31 service files
- **Middleware**: 8 middleware modules
- **Total Backend Files**: ~95+ files

### Database Layer
- **Implemented Tables**: 14 tables (fully functional)
- **Future Tables**: 4 tables (schema only)
- **Total Tables**: 18 tables

### External Services
- **Storage**: MinIO + CloudFlare
- **AI**: N8N + Ollama
- **APIs**: LRCLIB + YouTube (Data API v3 + Transcript API)
- **Auth**: Google OAuth 2.0

---

## 🔄 Key Data Flow Paths

### 1. User Authentication Flow
```
Login Page → authService.ts → /api/auth/login → authController 
→ googleAuthService/authService → Users/Sessions Tables 
→ JWT Token → LocalStorage
```

### 2. Song Analysis Flow
```
Song Page → analysisService.ts → /api/analysis → translateController 
→ translateService → N8N Webhook → Ollama AI → Response 
→ processingService → SongAIProcessing Table → Frontend Display
```

### 3. Lyrics Fetching Flow
```
lyricsService.ts → /api/lyrics → lyricsController → lyricsService 
→ LRCLIB API → LyricsSearchResults Table (cache) → Response
```

### 4. Image Upload Flow
```
CoverImageUpload → imageService.ts → /api/images → imageController 
→ Multer (memory) → minioService → MinIO Storage → URL → Database
```

### 5. YouTube Integration Flow
```
youtubeService.ts → /api/youtube/search → youtubeController 
→ youtubeService → YouTube Data API v3 → Video Results

youtubeService → /api/youtube/transcript → youtubeController 
→ youtubeService → youtube_transcript.py (Python) 
→ YouTube Transcript API → Transcript Text
```

---

## 🛡️ Security Layers

### Middleware Protection Chain
1. **Helmet** - Security headers (XSS, CSP, etc.)
2. **CORS** - Origin validation
3. **enforceFrontendOrigin** - Strict origin check
4. **authMiddleware** - JWT verification
5. **twoFactorMiddleware** - 2FA verification (admin routes)
6. **Rate Limiters** - API abuse prevention

### Authentication Flow
```
Request → CORS → Origin Check → JWT Verify → 2FA Check → Route Handler
```

---

## 📦 Technology Stack by Layer

### Frontend
- **Framework**: Next.js 15.5.4 (React 19.1.0)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui + Radix UI
- **Charts**: Recharts 2.15.4
- **Icons**: Lucide React 0.545.0
- **Notifications**: React Hot Toast 2.6.0
- **Date**: date-fns 4.1.0
- **Testing**: Jest 30.2.0 + Playwright 1.40.0

### Backend
- **Runtime**: Node.js 24
- **Framework**: Express 4.18.2
- **Language**: JavaScript (ES6+)
- **Database Client**: pg 8.11.3 + pg-pool 3.6.1
- **Auth**: jsonwebtoken 9.0.2 + bcrypt 6.0.0
- **OAuth**: google-auth-library 10.3.0
- **2FA**: speakeasy 2.0.0 + qrcode 1.5.4
- **File Upload**: multer 2.0.2
- **Storage Client**: minio 8.0.6
- **Security**: helmet 7.1.0 + cors 2.8.5
- **Logging**: morgan 1.10.0
- **API Docs**: swagger-jsdoc 6.2.8 + swagger-ui-express 5.0.1
- **Testing**: jest 30.2.0

### Database
- **RDBMS**: PostgreSQL 14+
- **Extensions**: uuid-ossp

### External Services
- **Object Storage**: MinIO (S3-compatible)
- **CDN**: CloudFlare
- **Workflow Engine**: N8N
- **AI Model**: Ollama (gpt-oss:120b)
- **Python Runtime**: Python 3.x (for youtube-transcript-api)

### DevOps
- **CI/CD**: Jenkins
- **Containerization**: Docker + Docker Compose
- **Version Control**: GitHub

---

## 🎯 Component Responsibilities

### Frontend Components
| Component | Responsibility | Key Features |
|-----------|---------------|--------------|
| **Navbar** | Navigation + Auth Status | User menu, admin link, responsive |
| **AuthGuard** | Route Protection | Redirect unauthenticated users |
| **AdminGuard** | Admin Protection | Role-based access control |
| **MusicCard** | Song Display | Thumbnail, title, artist, mood |
| **LyricsViewer** | Translation Display | Side-by-side lyrics, editable |
| **SyncedLyricsPlayer** | YouTube Integration | Sync lyrics with video time |
| **MoodSection** | Emotion Analysis | AI-generated mood percentages |
| **FeedbackSection** | Rating System | 5-star rating, comments |
| **CoverImageUpload** | Image Management | Upload, preview, delete |

### Backend Services
| Service | Responsibility | External Dependencies |
|---------|---------------|----------------------|
| **userService** | User CRUD | PostgreSQL, Bcrypt |
| **googleAuthService** | OAuth Integration | Google OAuth 2.0 |
| **jwtService** | Token Management | jsonwebtoken |
| **lyricsService** | Lyrics Fetching | LRCLIB API |
| **translateService** | AI Translation | N8N Webhook → Ollama |
| **youtubeService** | Video Search + Transcript | YouTube API v3 + Python |
| **minioService** | File Storage | MinIO S3 API |
| **emailService** | Email Notifications | N8N Email Webhook |
| **twoFactorService** | 2FA Management | Speakeasy + QRCode |
| **dashboardService** | Analytics | PostgreSQL aggregations |

---

## 📝 Implementation Status

### ✅ Fully Implemented (18/21 Use Cases)
- UC1-UC8: User Features (Auth, Profile, Favorites, History, etc.)
- UC9-UC12: Admin Features (Dashboard, Management, Approval)
- UC14-UC16: AI Features (Prompts, Sharing, Custom Analysis)

### ⚠️ Future Features (3/21 Use Cases)
- **UC13**: Playlist Management (tables exist, no implementation)
- **UC17**: Notification System (tables exist, no implementation)
- **UC18**: Report System (tables exist, no implementation)

---

## 🔍 Notes

- All component names and file paths are verified against actual codebase
- Database table structures match `001_create_initial_schema.sql`
- External service integrations are confirmed via service files and .env configuration
- Future features are clearly marked with ⚠️ symbol
- Middleware chain follows actual implementation in `backend/index.js`
- Route structure matches `backend/src/routes/index.js`

**Verification Date:** November 25, 2025  
**Codebase State:** All components verified against actual files
