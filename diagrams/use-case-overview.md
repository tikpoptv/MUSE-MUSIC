## MUSE MUSIC – Overall Use Case Diagram

The diagram below summarizes the primary actors and interactions supported by the MUSE MUSIC platform, spanning both customer-facing and administrative flows.

```mermaid
graph TB
    %% Actors
    V[👤 Visitor]
    U[👤 Registered User]
    A[👤 Admin]
    CR[👤 Content Reviewer]
    L[🌐 Lyrics/LRCLIB API]
    Y[🌐 YouTube Transcript API]
    NS[📧 Email/Notification Service]
    PM[💳 Payment/Premium future]
    OAUTH[🔐 OAuth Providers<br/>Google active<br/>GitHub, Facebook, Apple future]

    %% Public Web Zone
    subgraph PUB[Public Web Next.js, CDN]
        UC1((UC1: Browse<br/>landing content))
        UC8a((UC8a: View public<br/>share link))
    end

    %% Auth & Profile Zone
    subgraph AUTH[Auth & Profile]
        UC2((UC2: Register/Login<br/>2FA))
        UC2a((UC2a: Reset<br/>password))
        UC2b((UC2b: Complete<br/>onboarding))
        UC15((UC15: OTP/2FA<br/>validation))
    end

    %% Music Interaction Zone
    subgraph MUSIC[Music Interaction]
        UC3((UC3: Search catalog<br/>upload songs))
        UC4((UC4: Run AI analysis<br/>mood, translation))
        UC5((UC5: View lyrics<br/>translations, mood))
        UC6((UC6: Manage favorites<br/>& history))
        UC7((UC7: For You<br/>recommendations))
        UC8((UC8: Generate<br/>share links))
        UC9((UC9: Submit feedback<br/>& ratings))
    end

    %% Administration Zone
    subgraph ADMIN[Administration]
        UC10((UC10: Approve<br/>shared content))
        UC11((UC11: Manage catalog<br/>& users))
        UC12((UC12: Monitor AI jobs<br/>& quotas))
        UC12a((UC12a: Audit logs<br/>& incidents))
    end

    %% External Use Cases
    UC13((UC13: Fetch lyrics<br/>from LRCLIB))
    UC14((UC14: YouTube<br/>transcript ingestion))

    %% Visitor connections
    V --> UC1
    V --> UC2
    V --> UC8a

    %% Registered User connections
    U --> UC2
    U --> UC2a
    U --> UC2b
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8
    U --> UC9

    %% Admin connections
    A --> UC10
    A --> UC11
    A --> UC12
    A --> UC12a
    CR --> UC10

    %% Include relationships
    UC4 -.include.-> UC13
    UC4 -.include.-> UC14
    UC2 -.include.-> UC15
    UC2a -.include.-> NS
    UC8 -.include.-> UC10

    %% Extend relationships
    UC7 -.extend.-> UC6
    UC3 -.extend.-> UC4
    UC12 -.extend.-> NS
    UC2b -.extend.-> PM

    %% External service connections
    UC15 --> NS
    UC13 --> L
    UC14 --> Y
    UC2 -.extend.-> OAUTH

    %% Styling
    classDef actor fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef usecase fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef external fill:#f3e5f5,stroke:#4a148c,stroke-width:2px

    class V,U,A,CR actor
    class UC1,UC2,UC2a,UC2b,UC3,UC4,UC5,UC6,UC7,UC8,UC8a,UC9,UC10,UC11,UC12,UC12a,UC15 usecase
    class L,Y,NS,PM,OAUTH,UC13,UC14 external
```

### Actor Highlights

- **Visitor** – anonymous traffic; can explore public marketing content and start the onboarding sequence.
- **Registered User** – authenticated customer with access to search, history, AI analysis (mood, translation, summary), favorites, sharing, and the personalized *For You* feed.
- **Admin** – staff role that moderates public content, inspects system metrics/logs, manages catalog entries and user accounts, and keeps AI processing capacity healthy.
- **Lyrics / LRCLIB API** & **YouTube Transcript API** – external providers the backend calls while running analyses to supply lyrics or subtitles when the local catalog does not have them.

### Use Case Notes

| ID   | Description | Key Components / References |
|------|-------------|-----------------------------|
| UC1  | Public visitors browse marketing sections, pricing, features before signup | `frontend/src/app/page.tsx`, `Navbar`, `Footer` |
| UC2  | Account lifecycle: register, login, 2FA check (OTP), OAuth (Google only; GitHub, Facebook, Apple planned) | `frontend/src/app/login`, `backend/src/controllers/authController.js`, `User` model, `googleAuthService.js` |
| UC2a | Forgot-password + reset flow (email link) | `frontend/src/app/reset-password`, `backend/src/services/emailService.js` |
| UC2b | Multi-step onboarding/setup wizard (profile, preferences) | `frontend/src/app/setup/step*/page.tsx`, `SetupRedirect` |
| UC3  | Search catalog, import via lyrics search, upload songs | `backend/src/services/songService.js`, `lyricsSearchResults`, `frontend search components` |
| UC4  | Run AI processing (summary, translation, mood, cover image) | `backend/src/services/analysisService.js`, `songAIProcessing` |
| UC5  | View song detail (lyrics, translation, mood radar, synced player) | `frontend/src/app/song/[songID]` |
| UC6  | Manage favorites, playback history, recently analyzed songs | `backend/src/services/historyService.js`, `userFavorites`, `frontend recent-list components` |
| UC7  | Personalized *For You* content (mood stats, recent, recommendations, top hits) | `backend/src/services/foryouService.js`, `frontend/src/app/for-you/page.tsx` |
| UC8  | Generate share links / public pages for AI results | `backend/src/services/shareService.js`, `frontend/src/app/share/[shortLink]` |
| UC8a | Public visitors view shared pages without login | `ShareLinkClient`, `songAIProcessing` public data |
| UC9  | Submit rating/feedback on AI output | `backend/src/services/ratingService.js`, `frontend/src/components/FeedbackSection.tsx` |
| UC10 | Admin review & approve public content / share requests | `backend/src/services/adminShareService.js`, admin UI |
| UC11 | Admin catalogs, user management, dashboards | `frontend/src/app/admin/*`, `backend/src/services/admin*.js` |
| UC12 | Monitor AI processing jobs, quotas, system logs | `backend/src/middleware/logger.js`, `analysisRateLimit.js`, admin dashboards |
| UC12a| Audit logs, incident reviews, notification hooks | `logger`, `NotificationService (future)` |
| UC13 | External lyrics fetching (LRCLIB/LRClib docs) | `backend/source/lrclib.md`, `scripts` |
| UC14 | YouTube transcript ingestion when lyrics missing | `backend/scripts/youtube_transcript.py`, `youtubeTranscriptUtils.js` |
| UC15 | OTP / 2FA validation (TOTP, backup codes) | `backend/src/middleware/twoFactorMiddleware.js`, `UserTwoFactorAuth` |
| NS   | Email/notification service for OTP, share approvals, alerts | `backend/src/services/emailService.js` |
| PM   | Placeholder for premium/payments integration (future) | `Customers` table columns (`isPremium`, etc.) |

Use this diagram as the base layer for more detailed sequence, component, or data-flow diagrams in the `diagrams/` folder.

