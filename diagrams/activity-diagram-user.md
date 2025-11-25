# MUSE MUSIC - User Activity Diagrams

## Overview
Activity diagrams showing the workflows and business processes for registered users in the MUSE MUSIC platform. These diagrams illustrate the step-by-step flows from user actions to system responses.

**Last Updated:** November 25, 2025  
**Repository:** tikpoptv/MUSE-MUSIC  
**Branch:** docs/diagrams  
**Actor:** Registered User

---

## 🔐 Activity 1: User Registration & Login

```mermaid
flowchart TD
    Start([User visits MUSE MUSIC]) --> Choice1{Has Account?}
    
    %% Registration Flow
    Choice1 -->|No| Register[Navigate to Register Page]
    Register --> FillRegForm[Fill Registration Form:<br/>- Email<br/>- Password<br/>- Display Name<br/>- Preferred Language]
    FillRegForm --> ValidateReg{Form Valid?}
    ValidateReg -->|No| RegError[Show Validation Errors]
    RegError --> FillRegForm
    ValidateReg -->|Yes| SubmitReg[Submit Registration]
    SubmitReg --> CreateAccount[Backend: Create User Account<br/>- Hash Password bcrypt<br/>- Generate UUID<br/>- Create Customer Profile]
    CreateAccount --> SendWelcome[Send Welcome Email<br/>via N8N]
    SendWelcome --> AutoLogin[Auto Login with JWT]
    AutoLogin --> Setup
    
    %% Login Flow
    Choice1 -->|Yes| Login[Navigate to Login Page]
    Login --> ChoiceAuth{Login Method?}
    
    %% Standard Login
    ChoiceAuth -->|Email/Password| FillLogin[Enter Email & Password]
    FillLogin --> SubmitLogin[Submit Login]
    SubmitLogin --> ValidateLogin{Credentials Valid?}
    ValidateLogin -->|No| LoginError[Show Error Message]
    LoginError --> FillLogin
    ValidateLogin -->|Yes| Check2FA{2FA Enabled?}
    
    Check2FA -->|Yes| Enter2FA[Enter OTP Code]
    Enter2FA --> Verify2FA{OTP Valid?}
    Verify2FA -->|No| 2FAError[Show Error Message]
    2FAError --> Enter2FA
    Verify2FA -->|Yes| GenerateJWT
    
    Check2FA -->|No| GenerateJWT[Generate JWT Token]
    
    %% OAuth Login
    ChoiceAuth -->|Google OAuth| GoogleAuth[Redirect to Google]
    GoogleAuth --> GoogleConsent[User Grants Permission]
    GoogleConsent --> GoogleCallback[Callback with Auth Code]
    GoogleCallback --> ValidateGoogle[Backend: Verify Google Token]
    ValidateGoogle --> CheckUserExists{User Exists?}
    CheckUserExists -->|No| CreateGoogleAccount[Create Account from Google Profile]
    CreateGoogleAccount --> GenerateJWT
    CheckUserExists -->|Yes| GenerateJWT
    
    %% Post Login
    GenerateJWT --> StoreToken[Store JWT in LocalStorage]
    StoreToken --> CheckSetup{Setup Complete?}
    CheckSetup -->|No| Setup[Redirect to Setup Wizard]
    CheckSetup -->|Yes| Dashboard[Redirect to For You Page]
    
    %% Setup Flow
    Setup --> Step1[Step 1: Favorite Genres]
    Step1 --> Step2[Step 2: Mood Preferences]
    Step2 --> Step3[Step 3: Language Settings]
    Step3 --> SavePreferences[Save User Preferences]
    SavePreferences --> Dashboard
    
    Dashboard --> End([User Logged In])
    
    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style LoginError fill:#ffcdd2
    style RegError fill:#ffcdd2
    style 2FAError fill:#ffcdd2
    style Dashboard fill:#fff9c4
```

---

## 🎵 Activity 2: Song Search & Analysis

```mermaid
flowchart TD
    Start([User on For You / Home]) --> SearchAction[Click Search Icon]
    SearchAction --> EnterQuery[Enter Song/Artist Name]
    EnterQuery --> ChoiceSource{Search Source?}
    
    %% Local Catalog Search
    ChoiceSource -->|Local Catalog| SearchLocal[Search Songs Table]
    SearchLocal --> CheckLocalResults{Results Found?}
    CheckLocalResults -->|Yes| DisplayResults
    CheckLocalResults -->|No| ShowNoResults[Show: No Results in Catalog]
    ShowNoResults --> OfferExternal[Suggest: Search External Lyrics]
    OfferExternal --> ChoiceSource
    
    %% External Lyrics Search
    ChoiceSource -->|External LRCLIB| SearchLRCLIB[API Call to LRCLIB]
    SearchLRCLIB --> CheckLRCResults{Results Found?}
    CheckLRCResults -->|No| SearchYouTube[Suggest: Search YouTube]
    SearchYouTube --> End1([No Results])
    
    CheckLRCResults -->|Yes| CacheLyrics[Cache Results in<br/>LyricsSearchResults Table]
    CacheLyrics --> DisplayResults[Display Search Results<br/>List of Songs]
    
    %% Song Selection
    DisplayResults --> UserSelect[User Selects Song]
    UserSelect --> CheckAnalyzed{Already Analyzed?}
    
    CheckAnalyzed -->|Yes| LoadExisting[Load from<br/>SongAIProcessing Table]
    LoadExisting --> DisplaySong
    
    CheckAnalyzed -->|No| ConfirmAnalysis[Show: Start AI Analysis?<br/>- Translation<br/>- Mood Detection<br/>- Summary]
    ConfirmAnalysis --> UserConfirm{User Confirms?}
    UserConfirm -->|No| DisplaySong
    
    UserConfirm -->|Yes| CheckCover{Has Cover Image?}
    CheckCover -->|No| PromptUpload[Prompt: Upload Cover Image]
    PromptUpload --> UploadChoice{User Uploads?}
    UploadChoice -->|Yes| UploadImage[Upload to MinIO]
    UploadImage --> StartAnalysis
    UploadChoice -->|No| UseDefault[Use Default Placeholder]
    UseDefault --> StartAnalysis
    CheckCover -->|Yes| StartAnalysis
    
    %% AI Analysis Flow
    StartAnalysis[Start AI Analysis]
    StartAnalysis --> FetchLyrics[Fetch Lyrics:<br/>1. Check LyricsSearchResults<br/>2. Call LRCLIB API<br/>3. Try YouTube Transcript]
    FetchLyrics --> CheckLyricsFound{Lyrics Found?}
    CheckLyricsFound -->|No| AnalysisError[Show Error: No Lyrics Available]
    AnalysisError --> End2([Analysis Failed])
    
    CheckLyricsFound -->|Yes| SaveSong[Save Song to Songs Table]
    SaveSong --> CreateProcessing[Create SongAIProcessing Record<br/>Status: processing]
    CreateProcessing --> ShowLoading[Show Loading Screen<br/>with Progress Indicator]
    
    ShowLoading --> CallN8N[Call N8N Workflow Webhook]
    CallN8N --> N8NProcess[N8N: Send to Ollama AI<br/>- Translate Lyrics<br/>- Detect Mood<br/>- Generate Summary]
    N8NProcess --> WaitResponse[Wait for Response<br/>timeout: 120s]
    
    WaitResponse --> CheckSuccess{Analysis Success?}
    CheckSuccess -->|No| UpdateFailed[Update Status: failed]
    UpdateFailed --> ShowError[Show Error Message]
    ShowError --> Retry{User Retries?}
    Retry -->|Yes| StartAnalysis
    Retry -->|No| End2
    
    CheckSuccess -->|Yes| UpdateCompleted[Update SongAIProcessing:<br/>- translations<br/>- mood_percentages<br/>- summary<br/>Status: completed]
    UpdateCompleted --> AddToHistory[Add to UserHistory]
    AddToHistory --> DisplaySong
    
    %% Display Song
    DisplaySong[Display Song Analysis Page:<br/>- Synced Lyrics Player<br/>- Translation Side-by-Side<br/>- Mood Radar Chart<br/>- Summary<br/>- Cover Image]
    DisplaySong --> UserActions{User Action?}
    
    UserActions -->|Add to Favorites| AddFav[Save to UserFavorites]
    AddFav --> ShowToast1[Show Success Toast]
    ShowToast1 --> UserActions
    
    UserActions -->|Share| GenerateShare[Generate Share Link]
    GenerateShare --> CopyLink[Copy Link to Clipboard]
    CopyLink --> ShowToast2[Show Success Toast]
    ShowToast2 --> UserActions
    
    UserActions -->|Rate & Feedback| OpenFeedback[Open Feedback Form]
    OpenFeedback --> SubmitFeedback[Submit Rating 1-5 stars<br/>+ Optional Comment]
    SubmitFeedback --> SaveRating[Save to UserRatings]
    SaveRating --> ShowToast3[Show Thank You Message]
    ShowToast3 --> UserActions
    
    UserActions -->|Done| End3([Activity Complete])
    
    style Start fill:#e3f2fd
    style End1 fill:#ffcdd2
    style End2 fill:#ffcdd2
    style End3 fill:#c8e6c9
    style DisplaySong fill:#fff9c4
    style N8NProcess fill:#ff6d5a,color:#fff
    style AnalysisError fill:#ffcdd2
    style ShowError fill:#ffcdd2
```

---

## 💖 Activity 3: Manage Favorites & History

```mermaid
flowchart TD
    Start([User on For You Page]) --> ViewSection{View Section?}
    
    %% Favorites Section
    ViewSection -->|Favorites| LoadFav[Load UserFavorites<br/>JOIN Songs<br/>JOIN SongAIProcessing]
    LoadFav --> CheckFavEmpty{Has Favorites?}
    CheckFavEmpty -->|No| ShowEmptyFav[Show: No Favorites Yet<br/>Browse Songs to Add]
    ShowEmptyFav --> End1([End])
    
    CheckFavEmpty -->|Yes| DisplayFav[Display Favorite Songs<br/>with MusicCard Components]
    DisplayFav --> FavAction{User Action?}
    
    FavAction -->|Click Song| NavigateToSong[Navigate to Song Detail]
    NavigateToSong --> End2([View Song])
    
    FavAction -->|Remove Favorite| ConfirmRemove{Confirm Remove?}
    ConfirmRemove -->|No| FavAction
    ConfirmRemove -->|Yes| DeleteFav[DELETE from UserFavorites]
    DeleteFav --> RefreshFav[Refresh Favorites List]
    RefreshFav --> ShowToast1[Show: Removed from Favorites]
    ShowToast1 --> DisplayFav
    
    FavAction -->|Done| End1
    
    %% History Section
    ViewSection -->|History| LoadHistory[Load UserHistory<br/>JOIN Songs<br/>JOIN SongAIProcessing<br/>ORDER BY analyzed_at DESC]
    LoadHistory --> CheckHistoryEmpty{Has History?}
    CheckHistoryEmpty -->|No| ShowEmptyHistory[Show: No Analysis History<br/>Start Analyzing Songs]
    ShowEmptyHistory --> End1
    
    CheckHistoryEmpty -->|Yes| DisplayHistory[Display Analysis History<br/>with Timestamps]
    DisplayHistory --> HistoryAction{User Action?}
    
    HistoryAction -->|Click Song| NavigateToSong2[Navigate to Song Detail]
    NavigateToSong2 --> End2
    
    HistoryAction -->|Filter by Date| SelectDate[Select Date Range]
    SelectDate --> FilterHistory[Filter UserHistory<br/>WHERE analyzed_at BETWEEN dates]
    FilterHistory --> DisplayHistory
    
    HistoryAction -->|Clear History| ConfirmClear{Confirm Clear All?}
    ConfirmClear -->|No| HistoryAction
    ConfirmClear -->|Yes| DeleteHistory[DELETE from UserHistory<br/>WHERE user_id = current_user]
    DeleteHistory --> ShowToast2[Show: History Cleared]
    ShowToast2 --> ShowEmptyHistory
    
    HistoryAction -->|Done| End1
    
    %% Recommendations Section
    ViewSection -->|Recommendations| LoadRecommend[Load Recommendations<br/>Based on:<br/>- Favorite Genres<br/>- Mood Preferences<br/>- Analysis History]
    LoadRecommend --> DisplayRecommend[Display Recommended Songs]
    DisplayRecommend --> RecommendAction{User Action?}
    
    RecommendAction -->|Click Song| NavigateToSong3[Navigate to Song Detail]
    NavigateToSong3 --> End2
    
    RecommendAction -->|Refresh| RefreshRecommend[Regenerate Recommendations]
    RefreshRecommend --> LoadRecommend
    
    RecommendAction -->|Done| End1
    
    style Start fill:#e3f2fd
    style End1 fill:#c8e6c9
    style End2 fill:#c8e6c9
    style ShowEmptyFav fill:#fff3e0
    style ShowEmptyHistory fill:#fff3e0
```

---

## 🔗 Activity 4: Share Song Analysis

```mermaid
flowchart TD
    Start([User viewing Song Analysis]) --> ClickShare[Click Share Button]
    ClickShare --> OpenModal[Open Share Modal]
    OpenModal --> CheckExisting{Share Link Exists?}
    
    CheckExisting -->|Yes| LoadExisting[Load from SharedSongs Table]
    LoadExisting --> CheckStatus{Status?}
    
    CheckStatus -->|approved| DisplayApproved[Display Share Link<br/>Status: ✅ Approved]
    DisplayApproved --> CopyLink
    
    CheckStatus -->|pending| DisplayPending[Display Share Link<br/>Status: ⏳ Pending Approval]
    DisplayPending --> WaitOption[Option: Copy Link Anyway<br/>Note: Link inactive until approved]
    WaitOption --> CopyLink
    
    CheckStatus -->|rejected| DisplayRejected[Display Status: ❌ Rejected<br/>Show Reason if Available]
    DisplayRejected --> RequestNew{Request New?}
    RequestNew -->|No| CloseModal1[Close Modal]
    CloseModal1 --> End1([End])
    RequestNew -->|Yes| GenerateNew
    
    CheckExisting -->|No| GenerateNew[Generate Share Link]
    GenerateNew --> CreateShort[Create Short Link:<br/>- Generate UUID<br/>- Create 8-char shortcode<br/>- Check uniqueness]
    CreateShort --> SaveShare[Save to SharedSongs Table:<br/>- song_id<br/>- user_id<br/>- short_link<br/>- is_public: false<br/>- status: pending]
    SaveShare --> NotifyAdmin[Queue Admin Notification<br/>New Share Request]
    NotifyAdmin --> DisplayPending
    
    %% Copy Link Actions
    CopyLink[Copy Link to Clipboard]
    CopyLink --> ShowToast[Show Success Toast:<br/>Link Copied!]
    ShowToast --> ShareOptions{Share Via?}
    
    ShareOptions -->|Social Media| OpenSocial[Open Share Dialog:<br/>- Facebook<br/>- Twitter<br/>- LINE<br/>- WhatsApp]
    OpenSocial --> End2([Shared Successfully])
    
    ShareOptions -->|QR Code| GenerateQR[Generate QR Code<br/>for Share Link]
    GenerateQR --> DisplayQR[Display QR Code<br/>Option: Download as Image]
    DisplayQR --> End2
    
    ShareOptions -->|Done| CloseModal2[Close Modal]
    CloseModal2 --> End1
    
    style Start fill:#e3f2fd
    style End1 fill:#c8e6c9
    style End2 fill:#c8e6c9
    style DisplayApproved fill:#c8e6c9
    style DisplayPending fill:#fff9c4
    style DisplayRejected fill:#ffcdd2
    style NotifyAdmin fill:#ff6d5a,color:#fff
```

---

## ⚙️ Activity 5: Account Settings & 2FA

```mermaid
flowchart TD
    Start([User clicks Account Settings]) --> LoadSettings[Load User Settings Page]
    LoadSettings --> DisplayOptions[Display Settings Sections:<br/>- Profile<br/>- Security 2FA<br/>- Preferences<br/>- Language]
    DisplayOptions --> UserChoice{Select Section?}
    
    %% Profile Section
    UserChoice -->|Profile| EditProfile[Edit Profile Information:<br/>- Display Name<br/>- Email read-only<br/>- Avatar Upload]
    EditProfile --> ValidateProfile{Valid?}
    ValidateProfile -->|No| ShowProfileError[Show Validation Errors]
    ShowProfileError --> EditProfile
    ValidateProfile -->|Yes| SaveProfile[UPDATE Users Table]
    SaveProfile --> ShowToast1[Show Success Toast]
    ShowToast1 --> DisplayOptions
    
    %% Security & 2FA Section
    UserChoice -->|Security| Check2FAStatus{2FA Enabled?}
    
    Check2FAStatus -->|No| OfferEnable[Show: Enable 2FA<br/>for Better Security]
    OfferEnable --> EnableChoice{Enable 2FA?}
    EnableChoice -->|No| DisplayOptions
    EnableChoice -->|Yes| GenerateSecret[Generate TOTP Secret<br/>using Speakeasy]
    GenerateSecret --> GenerateQR[Generate QR Code<br/>for Authenticator App]
    GenerateQR --> DisplayQR[Display QR Code<br/>Show Secret Key<br/>Generate Backup Codes]
    DisplayQR --> UserScans[User Scans with App:<br/>Google Authenticator<br/>Authy<br/>Microsoft Authenticator]
    UserScans --> EnterVerify[Enter Verification Code]
    EnterVerify --> VerifyCode{Code Valid?}
    VerifyCode -->|No| ShowVerifyError[Show Error: Invalid Code]
    ShowVerifyError --> EnterVerify
    VerifyCode -->|Yes| Enable2FA[UPDATE UserSettings:<br/>two_factor_enabled: true<br/>two_factor_secret: encrypted]
    Enable2FA --> ShowBackupCodes[Display Backup Codes<br/>Prompt: Save Securely]
    ShowBackupCodes --> ShowToast2[Show Success: 2FA Enabled]
    ShowToast2 --> DisplayOptions
    
    Check2FAStatus -->|Yes| Show2FAOptions[Display 2FA Options:<br/>- View Backup Codes<br/>- Regenerate Codes<br/>- Disable 2FA]
    Show2FAOptions --> TwoFAAction{User Action?}
    
    TwoFAAction -->|View Codes| RequirePassword1[Enter Password to View]
    RequirePassword1 --> VerifyPass1{Password Valid?}
    VerifyPass1 -->|No| ShowPassError1[Show Error]
    ShowPassError1 --> RequirePassword1
    VerifyPass1 -->|Yes| DisplayBackup[Display Backup Codes]
    DisplayBackup --> Show2FAOptions
    
    TwoFAAction -->|Regenerate| RequirePassword2[Enter Password + OTP]
    RequirePassword2 --> VerifyAuth{Auth Valid?}
    VerifyAuth -->|No| ShowAuthError[Show Error]
    ShowAuthError --> RequirePassword2
    VerifyAuth -->|Yes| RegenerateBackup[Generate New Backup Codes<br/>Invalidate Old Codes]
    RegenerateBackup --> ShowNewCodes[Display New Codes]
    ShowNewCodes --> ShowToast3[Show Success Toast]
    ShowToast3 --> Show2FAOptions
    
    TwoFAAction -->|Disable| RequirePassword3[Enter Password + OTP<br/>to Disable]
    RequirePassword3 --> VerifyDisable{Auth Valid?}
    VerifyDisable -->|No| ShowAuthError2[Show Error]
    ShowAuthError2 --> RequirePassword3
    VerifyDisable -->|Yes| ConfirmDisable{Confirm Disable 2FA?<br/>Warning: Less Secure}
    ConfirmDisable -->|No| Show2FAOptions
    ConfirmDisable -->|Yes| Disable2FA[UPDATE UserSettings:<br/>two_factor_enabled: false<br/>Clear secret & codes]
    Disable2FA --> ShowToast4[Show: 2FA Disabled]
    ShowToast4 --> DisplayOptions
    
    TwoFAAction -->|Back| DisplayOptions
    
    %% Preferences Section
    UserChoice -->|Preferences| EditPreferences[Edit Preferences:<br/>- Favorite Genres<br/>- Mood Preferences<br/>- Email Notifications]
    EditPreferences --> SavePreferences[UPDATE Customers Table]
    SavePreferences --> ShowToast5[Show Success Toast]
    ShowToast5 --> DisplayOptions
    
    %% Language Section
    UserChoice -->|Language| SelectLanguage[Select Language:<br/>- English<br/>- Thai<br/>- Japanese<br/>- Korean<br/>- Chinese]
    SelectLanguage --> SaveLanguage[UPDATE Customers:<br/>preferred_language]
    SaveLanguage --> RefreshUI[Refresh UI with New Language]
    RefreshUI --> ShowToast6[Show Success Toast]
    ShowToast6 --> DisplayOptions
    
    UserChoice -->|Done| End([Settings Saved])
    
    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style DisplayQR fill:#fff9c4
    style ShowBackupCodes fill:#fff9c4
    style ShowVerifyError fill:#ffcdd2
    style ShowPassError1 fill:#ffcdd2
    style ShowAuthError fill:#ffcdd2
    style ShowAuthError2 fill:#ffcdd2
```

---

## 🔄 Activity 6: Password Reset

```mermaid
flowchart TD
    Start([User Forgot Password]) --> ClickForgot[Click Forgot Password Link]
    ClickForgot --> EnterEmail[Enter Email Address]
    EnterEmail --> ValidateEmail{Email Valid?}
    ValidateEmail -->|No| ShowEmailError[Show Validation Error]
    ShowEmailError --> EnterEmail
    
    ValidateEmail -->|Yes| SubmitRequest[Submit Reset Request]
    SubmitRequest --> CheckUserExists{User Exists?}
    
    CheckUserExists -->|No| ShowGeneric[Show Generic Message:<br/>If account exists,<br/>email will be sent<br/>Security: Don't reveal user existence]
    ShowGeneric --> End1([End])
    
    CheckUserExists -->|Yes| GenerateToken[Generate Reset Token:<br/>- UUID<br/>- Expires in 1 hour<br/>- Store in UserSessions]
    GenerateToken --> BuildEmail[Build Reset Email:<br/>- Reset Link with Token<br/>- Expiry Warning<br/>- Security Notice]
    BuildEmail --> SendEmail[Send Email via N8N Webhook]
    SendEmail --> ShowSuccess[Show Success Message:<br/>Check your email for reset link]
    ShowSuccess --> End1
    
    %% Reset Link Flow
    Start2([User Clicks Email Link]) --> ValidateToken{Token Valid<br/>& Not Expired?}
    ValidateToken -->|No| ShowExpired[Show Error:<br/>Link expired or invalid<br/>Request new reset]
    ShowExpired --> End2([End])
    
    ValidateToken -->|Yes| LoadResetPage[Load Reset Password Page]
    LoadResetPage --> EnterNewPass[Enter New Password:<br/>- Min 8 characters<br/>- Uppercase<br/>- Lowercase<br/>- Number<br/>- Special char]
    EnterNewPass --> EnterConfirm[Confirm New Password]
    EnterConfirm --> ValidatePass{Passwords Match<br/>& Meet Rules?}
    ValidatePass -->|No| ShowPassError[Show Validation Errors]
    ShowPassError --> EnterNewPass
    
    ValidatePass -->|Yes| HashPassword[Hash Password with Bcrypt]
    HashPassword --> UpdatePassword[UPDATE Users:<br/>password_hash<br/>updated_at]
    UpdatePassword --> InvalidateSessions[DELETE all UserSessions<br/>for this user<br/>Force re-login]
    InvalidateSessions --> InvalidateToken[DELETE reset token]
    InvalidateToken --> SendConfirmEmail[Send Confirmation Email:<br/>Password Changed Successfully]
    SendConfirmEmail --> ShowSuccessReset[Show Success Page:<br/>Password Reset Complete]
    ShowSuccessReset --> RedirectLogin[Redirect to Login Page<br/>after 3 seconds]
    RedirectLogin --> End3([User Must Login Again])
    
    style Start fill:#e3f2fd
    style Start2 fill:#e3f2fd
    style End1 fill:#c8e6c9
    style End2 fill:#ffcdd2
    style End3 fill:#c8e6c9
    style ShowExpired fill:#ffcdd2
    style ShowEmailError fill:#ffcdd2
    style ShowPassError fill:#ffcdd2
    style SendEmail fill:#ff6d5a,color:#fff
```

---

## 📝 Activity Summary

### User Activities Covered
1. ✅ **Registration & Login** - Account creation, OAuth, 2FA, setup wizard
2. ✅ **Song Search & Analysis** - Search catalog/external, AI processing, display results
3. ✅ **Favorites & History** - Manage favorites, view history, recommendations
4. ✅ **Share Links** - Generate share links, approval status, social sharing
5. ✅ **Account Settings** - Profile edit, 2FA management, preferences, language
6. ✅ **Password Reset** - Forgot password flow, email verification, secure reset

### Key Components Used
- **Frontend Pages**: login, register, song, for-you, account, share, setup
- **Frontend Components**: Navbar, MusicCard, LyricsViewer, SyncedLyricsPlayer, FeedbackSection, Modals
- **Frontend Services**: authService, songService, analysisService, favoriteService, historyService
- **Backend Controllers**: authController, songController, analysisController, shareController
- **Backend Services**: userService, googleAuthService, lyricsService, translateService, shareService
- **External Services**: N8N, Ollama, LRCLIB, YouTube APIs, Google OAuth

### Database Tables Involved
- Users, Customers, UserSessions, UserSettings
- Songs, LyricsSearchResults, SongAIProcessing
- UserFavorites, UserHistory, UserRatings, SharedSongs
- SystemLogs, ErrorLogs

---

## 🔍 Notes

- All flows are based on actual codebase implementation
- Error handling and validation included in each flow
- Security measures (JWT, 2FA, password hashing) integrated
- External service integrations (N8N, Ollama, APIs) shown with proper timing
- Toast notifications and user feedback included
- Database operations match actual schema

**Verification Date:** November 25, 2025  
**Codebase State:** All activities verified against actual implementation
