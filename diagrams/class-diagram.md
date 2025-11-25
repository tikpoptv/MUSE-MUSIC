# MUSE MUSIC - Class Diagram

## Overview
Class diagram แสดงโครงสร้างข้อมูล (Database Schema) และความสัมพันธ์ของ entities หลักในระบบ MUSE MUSIC

## Entity Relationship Diagram

```mermaid
classDiagram
    %% Core User Classes
    class Users {
        +UUID userID PK
        +String username UK
        +String email UK
        +String password
        +String fullName
        +String profilePicture
        +String provider
        +String providerID
        +String providerEmail
        +Enum role
        +String loginStatus
        +Boolean setupCompleted
        +Boolean setupSkipped
        +Boolean termsAccepted
        +String passwordResetToken
        +Timestamp passwordResetTokenExpiry
        +Boolean twoFactorEnabled
        +Boolean twoFactorSetupCompleted
        +Timestamp registerDate
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    class Customers {
        +UUID customerID PK
        +UUID userID FK UK
        +Date DOB
        +Array musicInterestTypes
        +Int customerInterest
        +String preferredLanguage
        +String timezone
        +String country
        +Timestamp lastActiveAt
        +Boolean isPremium
        +String preferredAudioQuality
        +Decimal playbackSpeed
        +Boolean autoPlay
        +Boolean explicitContent
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    %% Music Content Classes
    class Songs {
        +UUID songID PK
        +String songName
        +String artistName
        +String genre
        +Text lyrics
        +Text syncedLyrics
        +Int duration
        +String filePath
        +Boolean isActive
        +Boolean approved
        +UUID approvedBy FK
        +Int playCount
        +Int popularity
        +UUID lyricsSearchResultID FK
        +Enum sourceStatus
        +UUID createdBy FK
        +UUID updatedBy FK
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    class LyricsSearchResults {
        +UUID lyricsSearchResultID PK
        +String externalID UK
        +String trackName
        +String artistName
        +String albumName
        +Int duration
        +Boolean instrumental
        +String lyricsPreview
        +Int usageCount
        +Timestamp lastUsedAt
        +Enum sourceAPI
        +Timestamp fetchedAt
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    class SongAIProcessing {
        +UUID processingID PK
        +UUID songID FK
        +String aiModel
        +Int processingTime
        +Text summary
        +String summaryLanguage
        +Float summaryConfidence
        +Text translation
        +Text interpretation
        +String originalLanguage
        +String targetLanguage
        +Float translationConfidence
        +Text moodType
        +Decimal moodScore
        +Float moodConfidence
        +Int totalRatings
        +Decimal averageRating
        +Int starCount
        +Enum status
        +Boolean isCompleteProcessing
        +Text errorMessage
        +UUID createdBy FK
        +UUID updatedBy FK
        +Timestamp createdAt
        +Timestamp updatedAt
        +String coverImage
        +Enum shareStatus
        +Enum approvalStatus
        +UUID approvedBy FK
        +Text approvalNote
        +Timestamp approvedAt
        +Boolean isPublic
        +String youtubeVideoId
        +String shortlink
        +Boolean syncConfirmed
        +Decimal songStartTime
    }

    class AIProcessingRatings {
        +UUID ratingID PK
        +UUID processingID FK
        +UUID userID FK
        +Int rating
        +Text comment
        +Text feedback
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    %% Playlist Classes
    class Playlists {
        +UUID playlistID PK
        +UUID userID FK
        +String playlistName
        +Text description
        +Boolean isPublic
        +Boolean isActive
        +Int playCount
        +Int favoriteCount
        +String coverImage
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    class PlaylistSongs {
        +UUID playlistID FK PK
        +UUID songID FK PK
        +UUID addedBy FK
        +Timestamp addedAt
        +Serial sortOrder
        +Boolean isActive
    }

    %% User Activity Classes
    class History {
        +UUID historyID PK
        +UUID songID FK
        +UUID userID FK
        +UUID processingID FK
        +Timestamp timeStamp
        +Int playDuration
        +Int playbackPosition
        +String deviceInfo
        +Enum actionType
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    class UserFavorites {
        +UUID favoriteID PK
        +UUID userID FK
        +UUID songID FK
        +UUID playlistID FK
        +UUID processingID FK
        +Enum favoriteType
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    %% Security Classes
    class UserSessions {
        +UUID sessionID PK
        +UUID userID FK
        +String deviceInfo
        +INET ipAddress
        +Text userAgent
        +Boolean isActive
        +Timestamp expiresAt
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    class UserTwoFactorAuth {
        +UUID twoFactorID PK
        +UUID userID FK UK
        +Boolean isEnabled
        +String secretKey
        +Array backupCodes
        +String recoveryEmail
        +String recoveryPhone
        +Timestamp lastUsedAt
        +Int failedAttempts
        +Boolean isLocked
        +Timestamp lockedUntil
        +Boolean setupCompleted
        +Enum setupStep
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    class TwoFactorVerification {
        +UUID verificationID PK
        +UUID userID FK
        +UUID sessionID FK
        +Enum verificationType
        +String verificationCode
        +Boolean isSuccessful
        +INET ipAddress
        +Text userAgent
        +String deviceInfo
        +Int attemptNumber
        +Text errorMessage
        +Timestamp createdAt
    }

    %% Notification & Reporting Classes
    class Notifications {
        +UUID notificationID PK
        +UUID userID FK
        +String title
        +Text message
        +Enum type
        +Boolean isRead
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    class Reports {
        +UUID reportID PK
        +UUID userID FK
        +Enum reportType
        +UUID targetID
        +String reason
        +Text description
        +Enum status
        +Text adminNotes
        +Timestamp createdAt
        +Timestamp updatedAt
    }

    %% Relationships
    Users "1" --o "0..1" Customers : extends
    Users "1" --o "*" Songs : creates/updates
    Users "1" --o "*" Playlists : owns
    Users "1" --o "*" History : tracks
    Users "1" --o "*" UserFavorites : has
    Users "1" --o "*" UserSessions : has
    Users "1" --o "0..1" UserTwoFactorAuth : configures
    Users "1" --o "*" TwoFactorVerification : attempts
    Users "1" --o "*" Notifications : receives
    Users "1" --o "*" Reports : creates
    Users "1" --o "*" SongAIProcessing : triggers
    Users "1" --o "*" AIProcessingRatings : rates
    
    Songs "1" --o "*" SongAIProcessing : processed by
    Songs "*" --o "0..1" LyricsSearchResults : sourced from
    Songs "1" --o "*" History : tracked in
    Songs "1" --o "*" UserFavorites : favorited
    Songs "*" --o "*" Playlists : PlaylistSongs
    
    SongAIProcessing "1" --o "*" AIProcessingRatings : rated by
    SongAIProcessing "1" --o "*" History : tracked
    SongAIProcessing "1" --o "*" UserFavorites : favorited
    
    Playlists "1" --* "*" PlaylistSongs : contains
    Playlists "1" --o "*" UserFavorites : favorited
    
    UserSessions "1" --o "*" TwoFactorVerification : verified in
```

## Key Relationships

### User Management
- **Users ↔ Customers**: One-to-one extension for customer-specific attributes
- **Users ↔ UserSessions**: One-to-many for tracking login sessions
- **Users ↔ UserTwoFactorAuth**: One-to-one for 2FA configuration
- **Users ↔ TwoFactorVerification**: One-to-many for 2FA verification attempts

### Content Management
- **Songs ↔ LyricsSearchResults**: Many-to-one linking songs to external API sources
- **Songs ↔ SongAIProcessing**: One-to-many for AI analysis results
- **SongAIProcessing ↔ AIProcessingRatings**: One-to-many for user ratings

### Music Organization
- **Playlists ↔ Songs**: Many-to-many through PlaylistSongs junction table
- **Users ↔ Playlists**: One-to-many ownership
- **Users ↔ UserFavorites**: One-to-many for favorites (songs/playlists)

### Activity Tracking
- **History**: Tracks user interactions with songs and AI processing
- **UserFavorites**: Tracks user favorites for songs and playlists
- **AIProcessingRatings**: Tracks user ratings for AI processing results

### Security & Communication
- **UserSessions**: Active login sessions per user
- **UserTwoFactorAuth**: 2FA configuration per user
- **TwoFactorVerification**: 2FA verification attempts
- **Notifications**: System notifications to users
- **Reports**: User-submitted reports

## Enum Types

### User Role
- `customer`: Regular user
- `admin`: Administrator
- `super_admin`: Super administrator

### Share Status (SongAIProcessing)
- `private`: Not shared
- `public_pending`: Pending approval
- `public_approved`: Approved and public

### Approval Status (SongAIProcessing)
- `pending`: Awaiting review
- `approved`: Approved
- `rejected`: Rejected

### Processing Status
- `processing`: In progress
- `completed`: Finished
- `failed`: Failed

### Source Status (Songs)
- `manual`: User-entered lyrics
- `from_lyrics_search`: From external API
- `external`: Other external sources

### Action Type (History)
- `view`: User viewed song
- `save`: User saved translation

### Report Type
- `song`: Report a song
- `playlist`: Report a playlist
- `user`: Report a user
- `ai`: Report AI processing result

### Verification Type (2FA)
- `totp`: Time-based OTP
- `backup_code`: Backup code
- `recovery_email`: Email recovery
- `recovery_sms`: SMS recovery

## Database Files Reference
- Schema: `backend/database/migrations/001_create_initial_schema.sql`
- Services: `backend/src/services/*.js`
- Models: `backend/src/models/*.js`

