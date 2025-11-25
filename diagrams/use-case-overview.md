## MUSE MUSIC – Overall Use Case Diagram

The diagram below summarizes the primary actors and interactions supported by the MUSE MUSIC platform, spanning both customer-facing and administrative flows.

```mermaid
usecaseDiagram
  actor Visitor as V
  actor "Registered User" as U
  actor Admin as A
  actor "Content Reviewer" as CR
  actor "Lyrics / LRCLIB API" as L
  actor "YouTube Transcript API" as Y
  actor "Email / Notification Service" as NS
  actor "Payment / Premium (future)" as PM

  rectangle "Public Web (Next.js, CDN)" as PUB {
    usecase "Browse landing content" as UC1
    usecase "View public share link" as UC8a
  }
  rectangle "Auth & Profile" as AUTH {
    usecase "Register / Login / 2FA" as UC2
    usecase "Reset password" as UC2a
    usecase "Complete onboarding steps" as UC2b
  }
  rectangle "Music Interaction" as MUSIC {
    usecase "Search catalog / upload songs" as UC3
    usecase "Run AI analysis (summary, translation, mood)" as UC4
    usecase "View lyrics, translations & mood insights" as UC5
    usecase "Manage favorites & history" as UC6
    usecase "\"For You\" personalized recommendations" as UC7
    usecase "Generate share links" as UC8
    usecase "Submit feedback / ratings" as UC9
  }
  rectangle "Administration" as ADMIN {
    usecase "Approve shared content" as UC10
    usecase "Manage catalog & users" as UC11
    usecase "Monitor AI jobs / quotas" as UC12
    usecase "Audit logs & incidents" as UC12a
  }

  V --> UC1
  V --> UC2
  V --> UC8a

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

  A --> UC10
  A --> UC11
  A --> UC12
  A --> UC12a
  CR --> UC10

  UC4 --> UC13 : <<include>>
  UC4 --> UC14 : <<include>>
  UC2 --> UC15 : <<include>>
  UC2a --> NS : <<include>>
  UC8 --> UC10 : <<include>>
  UC7 --> UC6 : <<extend>>
  UC3 --> UC4 : <<extend>>
  UC12 --> NS : <<extend>>
  UC2b --> PM : <<extend>>

  usecase "OTP / 2FA validation" as UC15
  UC15 --> NS
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
| UC2  | Account lifecycle: register, login, 2FA check (OTP) | `frontend/src/app/login`, `backend/src/controllers/authController.js`, `User` model |
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

