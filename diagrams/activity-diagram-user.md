# MUSE MUSIC - User Activity Diagrams

## Overview
Activity diagrams showing actual user workflows in MUSE MUSIC platform based on verified codebase inspection. All flows match actual routes, controllers, services, and database schema.

**Last Updated:** November 25, 2025  
**Repository:** tikpoptv/MUSE-MUSIC  
**Branch:** docs/diagrams  
**Actor:** Registered User  
**Verification:** All activities verified against actual code

---

## 🔐 Activity 1: User Registration & Login

```mermaid
flowchart TD
    Start([User visits MUSE MUSIC]) --> Choice1{Has Account?}
    
    %% Registration Flow
    Choice1 -->|No| Register[Navigate to /register]
    Register --> FillRegForm[Fill Registration Form:<br/>- username 3-20 chars<br/>- email optional<br/>- password strong<br/>- fullName optional]
    FillRegForm --> ValidateReg{Form Valid?}
    ValidateReg -->|No| RegError[Show Validation Errors]
    RegError --> FillRegForm
    ValidateReg -->|Yes| SubmitReg[POST /api/auth/register]
    SubmitReg --> CheckExists{Username/Email<br/>Exists?}
    CheckExists -->|Yes| RegError409[Show 409: Already Exists]
    RegError409 --> FillRegForm
    CheckExists -->|No| CreateAccount[UserService.createUser:<br/>- Hash password bcrypt<br/>- Generate UUID<br/>- role = customer<br/>- setupCompleted = false]
    CreateAccount --> SendWelcome[EmailService.sendWelcomeEmail<br/>if email provided]
    SendWelcome --> CreateSession[SessionService.createSession]
    CreateSession --> GenToken[JWTService.generateAccessToken<br/>+ RefreshToken]
    GenToken --> ReturnReg[Return tokens + user data]
    ReturnReg --> CheckSetup
    
    %% Login Flow
    Choice1 -->|Yes| Login[Navigate to /login]
    Login --> ChoiceAuth{Login Method?}
    
    %% Standard Login
    ChoiceAuth -->|Email/Password| FillLogin[Enter username & password]
    FillLogin --> SubmitLogin[POST /api/auth/login]
    SubmitLogin --> ValidateLogin{Credentials Valid?}
    ValidateLogin -->|No| LoginError[Show 401 Error]
    LoginError --> FillLogin
    ValidateLogin -->|Yes| UpdateStatus[UPDATE Users<br/>SET loginStatus = online]
    UpdateStatus --> CreateLoginSession[SessionService.createSession<br/>deviceInfo, IP, userAgent]
    CreateLoginSession --> GenLoginToken[Generate JWT tokens]
    GenLoginToken --> ReturnLogin[Return tokens + user data]
    ReturnLogin --> CheckSetup
    
    %% Google OAuth Flow
    ChoiceAuth -->|Google OAuth| GoogleAuth[POST /api/auth/google<br/>Redirect to Google]
    GoogleAuth --> GoogleConsent[User Grants Permission]
    GoogleConsent --> GoogleCallback[POST /api/auth/google/callback<br/>with authCode]
    GoogleCallback --> VerifyGoogle[GoogleAuthService:<br/>- verifyGoogleToken<br/>- getUserInfo from Google]
    VerifyGoogle --> CheckGoogleUser{User Exists<br/>providerID?}
    CheckGoogleUser -->|No| CreateGoogleUser[UserService.createUser:<br/>- provider = google<br/>- providerID<br/>- providerEmail<br/>- No password]
    CreateGoogleUser --> GenGoogleToken
    CheckGoogleUser -->|Yes| GenGoogleToken[Generate JWT tokens]
    GenGoogleToken --> ReturnLogin
    
    %% Post Login
    CheckSetup{setupCompleted?}
    CheckSetup -->|No| Setup[Redirect to /setup]
    CheckSetup -->|Yes| Dashboard[Redirect to /for-you]
    
    %% Setup Flow
    Setup --> Step1["/setup/step1<br/>Password Setup"]
    Step1 --> Step2["/setup/step2<br/>2FA Setup optional"]
    Step2 --> Step3["/setup/step3<br/>Birthday DOB"]
    Step3 --> Step4["/setup/step4<br/>Country, Timezone, Language"]
    Step4 --> Step5["/setup/step5<br/>Music Genres Interests"]
    Step5 --> CompleteSetup[POST /api/setup/complete<br/>UPDATE Users<br/>SET setupCompleted = true]
    CompleteSetup --> Dashboard
    
    Dashboard --> End([User Logged In])
    
    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style LoginError fill:#ffcdd2
    style RegError fill:#ffcdd2
    style RegError409 fill:#ffcdd2
    style Dashboard fill:#fff9c4
```

---

## 🎵 Activity 2: Song Search & AI Analysis

```mermaid
flowchart TD
    Start([User on /for-you]) --> SearchClick[Click Search Icon]
    SearchClick --> EnterQuery[Enter Song/Artist Name]
    EnterQuery --> SubmitSearch[POST /api/lyrics/search]
    
    SubmitSearch --> CallLRCLIB[LyricsService:<br/>Call LRCLIB API<br/>GET https://lrclib.net/api/search]
    CallLRCLIB --> CheckResults{Results Found?}
    CheckResults -->|No| ShowNoResults[Show: No Results]
    ShowNoResults --> End1([End])
    
    CheckResults -->|Yes| CacheResults[INSERT INTO<br/>LyricsSearchResults<br/>- externalID<br/>- trackName<br/>- artistName<br/>- instrumental<br/>- sourceAPI = lrclib]
    CacheResults --> DisplayResults[Display Search Results List]
    
    DisplayResults --> UserSelect[User Selects Song]
    UserSelect --> CheckExists{Song Already<br/>in Songs table?}
    
    CheckExists -->|Yes| LoadSong[Load existing Song]
    LoadSong --> CheckProcessed
    
    CheckExists -->|No| ConfirmCreate[Show: Create Song<br/>& Start Analysis?]
    ConfirmCreate --> UserConfirm{User Confirms?}
    UserConfirm -->|No| End1
    
    UserConfirm -->|Yes| FetchFullLyrics[LyricsService:<br/>Fetch full lyrics from LRCLIB]
    FetchFullLyrics --> CreateSong[INSERT INTO Songs:<br/>- songName<br/>- artistName<br/>- lyrics<br/>- syncedLyrics<br/>- lyricsSearchResultID<br/>- sourceStatus = from_lyrics_search<br/>- createdBy = userID]
    CreateSong --> UpdateUsage[UPDATE LyricsSearchResults<br/>SET usageCount++<br/>lastUsedAt = NOW]
    UpdateUsage --> CheckCover
    
    CheckCover{Has Cover Image?}
    CheckCover -->|No| PromptUpload[Optional: Upload Cover]
    PromptUpload --> UploadChoice{User Uploads?}
    UploadChoice -->|Yes| UploadToMinIO[POST /api/images/upload<br/>ImageController:<br/>- multer memory<br/>- MinIOService.uploadImage<br/>- Returns URL]
    UploadToMinIO --> StartAnalysis
    UploadChoice -->|No| StartAnalysis
    CheckCover -->|Yes| StartAnalysis
    
    %% AI Analysis
    StartAnalysis[Start AI Analysis]
    StartAnalysis --> FetchYouTube[Optional: Search YouTube<br/>POST /api/youtube/search]
    FetchYouTube --> CreateProcessing[INSERT INTO SongAIProcessing:<br/>- songID<br/>- status = processing<br/>- shareStatus = private<br/>- isPublic = false<br/>- coverImage URL<br/>- youtubeVideoId<br/>- createdBy = userID]
    CreateProcessing --> ShowLoading[Show Loading Screen]
    
    ShowLoading --> CallN8N[POST /api/analysis/translate<br/>TranslateService:<br/>Call N8N Webhook]
    CallN8N --> N8NProcess[N8N Workflow:<br/>- Send to Ollama AI<br/>- Translate lyrics<br/>- Detect mood 5 types<br/>- Generate summary]
    N8NProcess --> WaitResponse[Wait for N8N Response<br/>timeout 120s]
    
    WaitResponse --> CheckSuccess{Success?}
    CheckSuccess -->|No| UpdateFailed[UPDATE SongAIProcessing<br/>SET status = failed<br/>errorMessage]
    UpdateFailed --> ShowError[Show Error Message]
    ShowError --> RetryOption{Retry?}
    RetryOption -->|Yes| CallN8N
    RetryOption -->|No| End2([Analysis Failed])
    
    CheckSuccess -->|Yes| UpdateCompleted[UPDATE SongAIProcessing:<br/>- summary<br/>- translation<br/>- interpretation<br/>- moodType JSON array<br/>- originallanguage<br/>- targetLanguage<br/>- status = completed<br/>- isCompleteProcessing = true]
    UpdateCompleted --> AddHistory[INSERT INTO History:<br/>- songID<br/>- userID<br/>- processingID<br/>- actionType = view]
    AddHistory --> CheckProcessed
    
    CheckProcessed{Already<br/>Processed?}
    CheckProcessed -->|Yes| LoadExisting[SELECT FROM SongAIProcessing<br/>WHERE processingID]
    LoadExisting --> DisplaySong
    CheckProcessed -->|No| CreateProcessing
    
    DisplaySong["Navigate to /song/:songID<br/>Display:<br/>- SyncedLyricsPlayer<br/>- Original & Translation<br/>- Mood Radar Chart<br/>- Summary<br/>- Cover Image"]
    DisplaySong --> UserActions{User Action?}
    
    UserActions -->|Add Favorite| AddFav[POST /api/favorites<br/>body: processingID<br/>INSERT INTO UserFavorites<br/>UNIQUE userID,processingID]
    AddFav --> ShowToast1[Show Success Toast]
    ShowToast1 --> UserActions
    
    UserActions -->|Share| ShareFlow[Go to Activity 3: Share]
    
    UserActions -->|Rate| OpenFeedback[Open Feedback Form]
    OpenFeedback --> SubmitRating[POST /api/ratings/:processingID<br/>body: rating 1-5, comment optional]
    SubmitRating --> UpsertRating[INSERT/UPDATE<br/>AIProcessingRatings<br/>UNIQUE processingID,userID]
    UpsertRating --> TriggerUpdate[Trigger: update_rating_stats<br/>UPDATE SongAIProcessing<br/>- totalRatings<br/>- averageRating<br/>- starCount]
    TriggerUpdate --> ShowToast2[Show Thank You]
    ShowToast2 --> UserActions
    
    UserActions -->|Done| End3([Complete])
    
    style Start fill:#e3f2fd
    style End1 fill:#ffcdd2
    style End2 fill:#ffcdd2
    style End3 fill:#c8e6c9
    style DisplaySong fill:#fff9c4
    style N8NProcess fill:#ff6d5a,color:#fff
    style UpdateFailed fill:#ffcdd2
```

---

## 🔗 Activity 3: Share Song Analysis

```mermaid
flowchart TD
    Start([User on /song/songID]) --> ClickShare[Click Share Button]
    ClickShare --> CallShare[POST /api/share/create<br/>body: processingID]
    CallShare --> CheckExisting{shortlink exists<br/>in SongAIProcessing?}
    
    CheckExisting -->|Yes| LoadExisting[Return existing shortlink]
    LoadExisting --> DisplayLink
    
    CheckExisting -->|No| GenerateShort[ShareService:<br/>Generate shortLink<br/>SHA256 hash substring 12 chars]
    GenerateShort --> CheckUnique{shortlink<br/>unique?}
    CheckUnique -->|No| RegenerateShort[Add timestamp + retry]
    RegenerateShort --> CheckUnique
    CheckUnique -->|Yes| UpdateProcessing[UPDATE SongAIProcessing<br/>SET shortlink<br/>WHERE processingID]
    UpdateProcessing --> DisplayLink
    
    DisplayLink[Display Share Modal:<br/>Share URL:<br/>frontend.url/share/shortlink]
    DisplayLink --> CopyLink[User Clicks Copy]
    CopyLink --> CopyToClipboard[Copy to Clipboard]
    CopyToClipboard --> ShowToast[Show Success Toast]
    ShowToast --> ShareOptions{Share Via?}
    
    ShareOptions -->|Social Media| OpenShare[Open Share Dialog]
    OpenShare --> End1([Shared])
    
    ShareOptions -->|Close| CloseModal[Close Modal]
    CloseModal --> End2([Done])
    
    %% Public Access
    Start2([Someone visits<br/>share/shortlink]) --> LoadShare[GET /api/share/shortlink]
    LoadShare --> QueryDB[SELECT FROM SongAIProcessing p<br/>JOIN Songs s<br/>WHERE p.shortlink<br/>NO approval check<br/>Public access]
    QueryDB --> CheckFound{Found?}
    CheckFound -->|No| Show404[Show 404:<br/>Processing not found]
    Show404 --> End3([End])
    CheckFound -->|Yes| DisplayPublic[Display Share Page:<br/>- Song Info<br/>- Translation<br/>- Mood Chart<br/>- Summary<br/>- Cover Image<br/>Read-only view]
    DisplayPublic --> End4([Public View])
    
    style Start fill:#e3f2fd
    style Start2 fill:#e3f2fd
    style End1 fill:#c8e6c9
    style End2 fill:#c8e6c9
    style End3 fill:#ffcdd2
    style End4 fill:#c8e6c9
    style Show404 fill:#ffcdd2
```

---

## 💖 Activity 4: Favorites & History

```mermaid
flowchart TD
    Start([User on /for-you]) --> ViewSection{View Section?}
    
    %% Favorites
    ViewSection -->|Favorites| LoadFav[GET /api/favorites<br/>FavoriteController]
    LoadFav --> QueryFav[SELECT FROM UserFavorites<br/>JOIN Songs<br/>JOIN SongAIProcessing<br/>WHERE userID]
    QueryFav --> CheckEmpty{Has Items?}
    CheckEmpty -->|No| ShowEmpty[Show: No Favorites Yet]
    ShowEmpty --> End1([End])
    CheckEmpty -->|Yes| DisplayFav[Display Favorite Cards]
    DisplayFav --> FavAction{Action?}
    
    FavAction -->|View Song| NavSong[Navigate to /song/songID]
    NavSong --> End2([View Song])
    
    FavAction -->|Remove| ConfirmRemove{Confirm?}
    ConfirmRemove -->|No| DisplayFav
    ConfirmRemove -->|Yes| RemoveFav[DELETE /api/favorites<br/>body: processingID<br/>DELETE FROM UserFavorites<br/>WHERE userID AND processingID]
    RemoveFav --> RefreshFav[Refresh List]
    RefreshFav --> DisplayFav
    
    FavAction -->|Done| End1
    
    %% History
    ViewSection -->|History| LoadHistory[GET /api/history<br/>HistoryController]
    LoadHistory --> QueryHistory[SELECT FROM History<br/>JOIN Songs<br/>JOIN SongAIProcessing<br/>WHERE userID<br/>ORDER BY timestamp DESC]
    QueryHistory --> CheckHistEmpty{Has Items?}
    CheckHistEmpty -->|No| ShowEmptyHist[Show: No History]
    ShowEmptyHist --> End1
    CheckHistEmpty -->|Yes| DisplayHistory[Display History List<br/>with Timestamps]
    DisplayHistory --> HistAction{Action?}
    
    HistAction -->|View Song| NavSong2[Navigate to /song/songID]
    NavSong2 --> End2
    
    HistAction -->|Done| End1
    
    %% For You Feed
    ViewSection -->|For You Feed| LoadFeed[GET /api/foryou<br/>ForyouController]
    LoadFeed --> QueryFeed[ForyouService:<br/>- Recent songs<br/>- Popular mood types<br/>- Recommended based on<br/>  user preferences<br/>- Top rated songs]
    QueryFeed --> DisplayFeed[Display For You Page:<br/>- Recent Analyses<br/>- Mood Statistics<br/>- Recommendations<br/>- Top Rated]
    DisplayFeed --> FeedAction{Action?}
    
    FeedAction -->|Click Song| NavSong3[Navigate to /song/songID]
    NavSong3 --> End2
    
    FeedAction -->|Done| End1
    
    style Start fill:#e3f2fd
    style End1 fill:#c8e6c9
    style End2 fill:#c8e6c9
    style ShowEmpty fill:#fff3e0
    style ShowEmptyHist fill:#fff3e0
```

---

## ⚙️ Activity 5: 2FA Setup & Management

```mermaid
flowchart TD
    Start([User on /account]) --> Load2FAStatus[GET 2FA Status from Users table<br/>twoFactorEnabled field]
    Load2FAStatus --> Check2FA{2FA Enabled?}
    
    %% Enable 2FA
    Check2FA -->|No| ShowEnable[Show: Enable 2FA button]
    ShowEnable --> ClickEnable{User Clicks Enable?}
    ClickEnable -->|No| End1([End])
    ClickEnable -->|Yes| GenerateSecret[POST /api/2fa/setup<br/>TwoFactorService:<br/>- speakeasy.generateSecret<br/>- Generate QR with qrcode lib]
    GenerateSecret --> DisplayQR[Display Setup Modal:<br/>- QR Code image<br/>- Manual Entry Key<br/>- Instructions]
    DisplayQR --> UserScans[User Scans with App:<br/>Google Authenticator<br/>Authy, etc.]
    UserScans --> EnterCode[Enter 6-digit Code]
    EnterCode --> VerifyCode[POST /api/2fa/verify-setup<br/>body: token]
    VerifyCode --> CheckValid{Code Valid?}
    CheckValid -->|No| ShowError[Show Error:<br/>Invalid Code]
    ShowError --> EnterCode
    CheckValid -->|Yes| GenerateBackup[POST /api/2fa/generate-backup-codes<br/>TwoFactorService:<br/>Generate 10 random codes]
    GenerateBackup --> SaveBackup[INSERT INTO UserTwoFactorAuth:<br/>- secret encrypted<br/>- backupCodes hashed<br/>- isEnabled = true<br/>- setupCompleted = true]
    SaveBackup --> Update2FAFlag[UPDATE Users<br/>SET twoFactorEnabled = true<br/>twoFactorSetupCompleted = true]
    Update2FAFlag --> DisplayBackup[Display Backup Codes:<br/>⚠️ Save these securely<br/>Download as text file option]
    DisplayBackup --> ShowSuccess[Show Success Toast:<br/>2FA Enabled]
    ShowSuccess --> LoadManage
    
    %% Manage 2FA
    Check2FA -->|Yes| LoadManage[Show 2FA Management Options:<br/>- View Backup Codes<br/>- Regenerate Backup Codes<br/>- Disable 2FA]
    LoadManage --> ManageAction{User Action?}
    
    ManageAction -->|View Codes| RequirePass[Require Password<br/>for Security]
    RequirePass --> EnterPass[Enter Password]
    EnterPass --> VerifyPass{Password Valid?}
    VerifyPass -->|No| ShowPassError[Show Error]
    ShowPassError --> EnterPass
    VerifyPass -->|Yes| FetchBackup[SELECT FROM UserTwoFactorAuth<br/>Decrypt backupCodes]
    FetchBackup --> ShowCodes[Display Backup Codes]
    ShowCodes --> LoadManage
    
    ManageAction -->|Regenerate| RequirePass2[Require Password + OTP]
    RequirePass2 --> EnterBoth[Enter Password & Code]
    EnterBoth --> VerifyBoth{Both Valid?}
    VerifyBoth -->|No| ShowError2[Show Error]
    ShowError2 --> EnterBoth
    VerifyBoth -->|Yes| GenerateNew[Generate new 10 codes]
    GenerateNew --> UpdateBackup[UPDATE UserTwoFactorAuth<br/>SET backupCodes = new]
    UpdateBackup --> ShowNewCodes[Display New Codes]
    ShowNewCodes --> LoadManage
    
    ManageAction -->|Disable| RequirePass3[Require Password + OTP]
    RequirePass3 --> EnterToDisable[Enter Password & Code]
    EnterToDisable --> VerifyToDisable{Both Valid?}
    VerifyToDisable -->|No| ShowError3[Show Error]
    ShowError3 --> EnterToDisable
    VerifyToDisable -->|Yes| ConfirmDisable{Confirm Disable?<br/>⚠️ Less Secure}
    ConfirmDisable -->|No| LoadManage
    ConfirmDisable -->|Yes| Disable2FA[POST /api/2fa/disable<br/>UPDATE Users<br/>SET twoFactorEnabled = false<br/>DELETE FROM UserTwoFactorAuth]
    Disable2FA --> ShowDisabled[Show: 2FA Disabled]
    ShowDisabled --> ShowEnable
    
    ManageAction -->|Done| End1
    
    style Start fill:#e3f2fd
    style End1 fill:#c8e6c9
    style DisplayQR fill:#fff9c4
    style DisplayBackup fill:#fff9c4
    style ShowError fill:#ffcdd2
    style ShowPassError fill:#ffcdd2
    style ShowError2 fill:#ffcdd2
    style ShowError3 fill:#ffcdd2
```

---

## 🔄 Activity 6: Password Reset

```mermaid
flowchart TD
    Start([User Forgot Password]) --> Navigate[Navigate to /forgot-password]
    Navigate --> EnterEmail[Enter Email Address]
    EnterEmail --> Submit[POST /api/auth/forgot-password]
    Submit --> ValidateEmail{Email Valid<br/>Format?}
    ValidateEmail -->|No| ShowError[Show Validation Error]
    ShowError --> EnterEmail
    
    ValidateEmail -->|Yes| CheckUser{User Exists<br/>with Email?}
    CheckUser -->|No| ShowGeneric[Show Generic Success:<br/>Check email for reset link<br/>Security: Don't reveal<br/>user existence]
    ShowGeneric --> End1([End])
    
    CheckUser -->|Yes| GenerateToken[Generate crypto token<br/>32 bytes random]
    GenerateToken --> SetExpiry[Set expiry: NOW + 1 hour]
    SetExpiry --> UpdateUser[UPDATE Users SET<br/>passwordResetToken = token<br/>passwordResetTokenExpiry]
    UpdateUser --> BuildEmail[Build Reset Email:<br/>- Reset link with token<br/>- Expiry warning<br/>- Security notice]
    BuildEmail --> SendEmail[EmailService:<br/>Send via N8N webhook]
    SendEmail --> ShowSuccess[Show Success Message]
    ShowSuccess --> End1
    
    %% Reset Flow
    Start2([User Clicks Email Link]) --> OpenReset[Open /reset-password/token]
    OpenReset --> ValidateToken[GET /api/auth/validate-reset-token/token]
    ValidateToken --> CheckToken{Token Valid<br/>& Not Expired?}
    CheckToken -->|No| ShowExpired[Show Error:<br/>Link expired or invalid]
    ShowExpired --> End2([End])
    
    CheckToken -->|Yes| ShowResetForm[Display Reset Password Form]
    ShowResetForm --> EnterNewPass[Enter New Password<br/>- Min 8 characters<br/>- Uppercase<br/>- Lowercase<br/>- Number<br/>- Special char]
    EnterNewPass --> EnterConfirm[Confirm Password]
    EnterConfirm --> ValidatePass{Match &<br/>Meet Rules?}
    ValidatePass -->|No| ShowPassError[Show Validation Errors]
    ShowPassError --> EnterNewPass
    
    ValidatePass -->|Yes| SubmitReset[POST /api/auth/reset-password<br/>body: token, newPassword]
    SubmitReset --> HashPass[bcrypt.hash newPassword]
    HashPass --> UpdatePassword[UPDATE Users SET<br/>password = hashed<br/>passwordResetToken = NULL<br/>passwordResetTokenExpiry = NULL]
    UpdatePassword --> InvalidateSessions[DELETE FROM UserSessions<br/>WHERE userID<br/>Force re-login]
    InvalidateSessions --> SendConfirm[EmailService:<br/>Send confirmation email]
    SendConfirm --> ShowSuccessReset[Show Success:<br/>Password Reset Complete]
    ShowSuccessReset --> RedirectLogin[Redirect to /login<br/>after 3 seconds]
    RedirectLogin --> End3([Must Login Again])
    
    style Start fill:#e3f2fd
    style Start2 fill:#e3f2fd
    style End1 fill:#c8e6c9
    style End2 fill:#ffcdd2
    style End3 fill:#c8e6c9
    style ShowExpired fill:#ffcdd2
    style ShowError fill:#ffcdd2
    style ShowPassError fill:#ffcdd2
    style SendEmail fill:#ff6d5a,color:#fff
```

---

## 📝 Summary

### Verified User Activities (6 Activities)
1. ✅ **Registration & Login** - Standard + Google OAuth (verified against authController)
2. ✅ **Song Search & AI Analysis** - LRCLIB + N8N + Ollama (verified against lyricsController, translateController)
3. ✅ **Share Links** - Simple share via shortlink (verified against shareController, shareService)
4. ✅ **Favorites & History** - Standard CRUD (verified against favoriteController, historyController)
5. ✅ **2FA Management** - Speakeasy + QRCode (verified against twoFactorController, twoFactorService)
6. ✅ **Password Reset** - Email token flow (verified against authController, emailService)

### Key Findings from Code Inspection
- **NO approval system for shares** - shares are public immediately via shortlink
- **NO SharedSongs table** - sharing uses shortlink field in SongAIProcessing
- **Rating system uses trigger** - update_rating_stats auto-updates averageRating
- **LyricsSearchResults has usage tracking** - usageCount and lastUsedAt auto-updated via trigger
- **Setup wizard** - setupCompleted flag determines if user needs onboarding
- **2FA is optional** - stored in UserTwoFactorAuth table with encrypted secrets

### Database Tables Used
- Users, Customers, UserSessions, UserTwoFactorAuth
- Songs, LyricsSearchResults, SongAIProcessing
- UserFavorites, History, AIProcessingRatings
- SystemLogs (via logger middleware)

### External Services
- **LRCLIB API** - lyrics search via https://lrclib.net/api/search
- **N8N** - AI workflow orchestration
- **Ollama** - AI model (gpt-oss:120b) via N8N
- **MinIO** - S3-compatible image storage
- **Email via N8N** - welcome, password reset, confirmation emails
- **Google OAuth** - google-auth-library

**Verification Date:** November 25, 2025  
**Codebase State:** All activities verified against actual routes, controllers, services, and schema  
**Method:** File inspection + grep search + SQL schema analysis
