# Sequence Diagrams - User Interaction Flows

> **Verification Status**: ✅ All flows verified against actual code
> - Source files: `backend/src/controllers/shareController.js`, `backend/src/services/shareService.js`, `backend/src/controllers/favoriteController.js`, `backend/src/services/favoriteService.js`, `backend/src/controllers/historyController.js`, `backend/src/services/historyService.js`
> - All error codes, database operations, and share link generation documented from actual implementation
> - Last verified: 25 November 2025

---

## 1. Share Link Creation Flow

### Happy Path - Create New Share Link

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ShareController
    participant JWTService
    participant ShareService
    participant DatabaseService

    User->>Frontend: Click "Share" button on analysis result
    Frontend->>ShareController: POST /api/share/create {processingID}
    
    activate ShareController
    Note over ShareController: Extract JWT token from Authorization header (optional)
    
    alt Token provided
        ShareController->>JWTService: extractTokenFromHeader(authHeader)
        activate JWTService
        JWTService-->>ShareController: JWT token
        deactivate JWTService
        
        ShareController->>JWTService: verifyAccessToken(token)
        activate JWTService
        JWTService-->>ShareController: {userID}
        deactivate JWTService
    else No token
        Note over ShareController: userId = null (anonymous share)
    end
    
    Note over ShareController: Validate processingID is present
    
    ShareController->>ShareService: createShareLink(processingID, userId)
    activate ShareService
    
    %% Check if processing exists
    ShareService->>DatabaseService: SELECT FROM SongAIProcessing WHERE processingID=$1
    activate DatabaseService
    DatabaseService-->>ShareService: Processing found
    deactivate DatabaseService
    
    %% Check if shortLink already exists
    alt shortLink already exists
        Note over ShareService: Return existing shortLink
        ShareService-->>ShareController: {processingID, shortLink, shareUrl, alreadyExists: true}
    else shortLink not exists
        %% Generate new shortLink
        Note over ShareService: generateShortLink(processingID)<br/>SHA256 hash, first 12 chars
        
        %% Check for collision
        ShareService->>DatabaseService: SELECT FROM SongAIProcessing WHERE shortLink=$1
        activate DatabaseService
        DatabaseService-->>ShareService: No collision
        deactivate DatabaseService
        
        %% Update processing with shortLink
        ShareService->>DatabaseService: UPDATE SongAIProcessing SET shortLink=$1, updatedBy=$2 WHERE processingID=$3
        activate DatabaseService
        DatabaseService-->>ShareService: Updated (processingID, shortLink)
        deactivate DatabaseService
        
        Note over ShareService: Build shareUrl:<br/>{frontend.url}/share/{shortLink}
        ShareService-->>ShareController: {processingID, shortLink, shareUrl, alreadyExists: false}
    end
    deactivate ShareService
    
    ShareController-->>Frontend: 200 {success: true, message: "Share link created successfully", data: result}
    deactivate ShareController
    
    Frontend-->>User: Display share link with copy button
```

### Happy Path - Access Shared Content

```mermaid
sequenceDiagram
    participant Visitor
    participant Frontend
    participant ShareController
    participant ShareService
    participant DatabaseService

    Visitor->>Frontend: Open share link (https://muse.com/share/abc123xyz456)
    Frontend->>ShareController: GET /api/share/{shortLink}
    
    activate ShareController
    Note over ShareController: Extract shortLink from params<br/>Validate shortLink is present
    
    ShareController->>ShareService: getProcessingByShortLink(shortLink)
    activate ShareService
    
    ShareService->>DatabaseService: SELECT p.*, s.songName, s.artistName FROM SongAIProcessing p LEFT JOIN Songs s ON p.songID=s.songID WHERE p.shortLink=$1
    activate DatabaseService
    DatabaseService-->>ShareService: Processing found with song details
    deactivate DatabaseService
    
    Note over ShareService: Return processing data with:<br/>- processingID, songID<br/>- coverImage, summary<br/>- songName, artistName<br/>- shareStatus, approvalStatus<br/>- isApproved flag
    ShareService-->>ShareController: Processing object
    deactivate ShareService
    
    ShareController-->>Frontend: 200 {success: true, message: "Processing retrieved successfully", data: {processing}}
    deactivate ShareController
    
    Frontend-->>Visitor: Display shared analysis (translation, mood, interpretation)
```

### Error Path - Share Link Failures

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ShareController
    participant ShareService
    participant DatabaseService

    %% Error 1: Missing processingID
    User->>Frontend: Try to share without processingID
    Frontend->>ShareController: POST /api/share/create {}
    activate ShareController
    Note over ShareController: Validation fails:<br/>processingID is required
    ShareController-->>Frontend: 400 {error: "processingID is required"}
    deactivate ShareController
    Frontend-->>User: Show validation error

    %% Error 2: Processing not found
    User->>Frontend: Share non-existent processing
    Frontend->>ShareController: POST /api/share/create {processingID: "invalid-id"}
    activate ShareController
    ShareController->>ShareService: createShareLink("invalid-id", userId)
    activate ShareService
    ShareService->>DatabaseService: SELECT FROM SongAIProcessing WHERE processingID=$1
    activate DatabaseService
    DatabaseService-->>ShareService: No rows found
    deactivate DatabaseService
    ShareService-->>ShareController: throw Error "Processing record not found"
    deactivate ShareService
    ShareController-->>Frontend: 400 {error: "Processing record not found"}
    deactivate ShareController
    Frontend-->>User: Show not found error

    %% Error 3: Failed to generate unique shortLink (collision after max attempts)
    User->>Frontend: Share processing
    Frontend->>ShareController: POST /api/share/create {processingID}
    activate ShareController
    ShareController->>ShareService: createShareLink(processingID, userId)
    activate ShareService
    Note over ShareService: Generate shortLink
    loop 10 attempts
        ShareService->>DatabaseService: SELECT FROM SongAIProcessing WHERE shortLink=$1
        activate DatabaseService
        DatabaseService-->>ShareService: Collision found (shortLink exists)
        deactivate DatabaseService
        Note over ShareService: Regenerate with timestamp + attempts
    end
    Note over ShareService: Max attempts (10) exceeded
    ShareService-->>ShareController: throw Error "Failed to generate unique short link after multiple attempts"
    deactivate ShareService
    ShareController-->>Frontend: 500 {error: "Failed to create share link"}
    deactivate ShareController
    Frontend-->>User: Show error, retry

    %% Error 4: Database update failure
    User->>Frontend: Share processing
    Frontend->>ShareController: POST /api/share/create {processingID}
    activate ShareController
    ShareController->>ShareService: createShareLink(processingID, userId)
    activate ShareService
    Note over ShareService: shortLink generated successfully
    ShareService->>DatabaseService: UPDATE SongAIProcessing SET shortLink=$1
    activate DatabaseService
    DatabaseService-->>ShareService: Database error (connection lost)
    deactivate DatabaseService
    ShareService-->>ShareController: throw Error "Failed to update processing record with short link"
    deactivate ShareService
    ShareController-->>Frontend: 500 {error: "Failed to create share link"}
    deactivate ShareController
    Frontend-->>User: Show server error

    %% Error 5: Invalid shortLink when accessing
    Visitor->>Frontend: Open invalid share link
    Frontend->>ShareController: GET /api/share/invalid-shortlink
    activate ShareController
    ShareController->>ShareService: getProcessingByShortLink("invalid-shortlink")
    activate ShareService
    ShareService->>DatabaseService: SELECT FROM SongAIProcessing WHERE shortLink=$1
    activate DatabaseService
    DatabaseService-->>ShareService: No rows found
    deactivate DatabaseService
    ShareService-->>ShareController: null
    deactivate ShareService
    ShareController-->>Frontend: 404 {error: "Processing not found or not publicly shared"}
    deactivate ShareController
    Frontend-->>Visitor: Show "Content not found" page

    %% Error 6: Missing shortLink parameter
    Visitor->>Frontend: Access share endpoint without shortLink
    Frontend->>ShareController: GET /api/share/
    activate ShareController
    Note over ShareController: Validation fails:<br/>shortLink is required
    ShareController-->>Frontend: 400 {error: "shortLink is required"}
    deactivate ShareController
    Frontend-->>Visitor: Show error page
```

---

## 2. Favorites Management Flow

### Happy Path - Add to Favorites

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant FavoriteController
    participant AuthMiddleware
    participant FavoriteService
    participant DatabaseService

    User->>Frontend: Click "Add to Favorites" ❤️
    Frontend->>FavoriteController: POST /api/favorites {processingID}
    
    activate FavoriteController
    Note over FavoriteController: authenticateToken middleware:<br/>Verify JWT and extract userID
    
    FavoriteController->>AuthMiddleware: authenticateToken(req, res, next)
    activate AuthMiddleware
    Note over AuthMiddleware: Verify accessToken<br/>Extract userID from JWT
    AuthMiddleware-->>FavoriteController: req.user.userID set
    deactivate AuthMiddleware
    
    Note over FavoriteController: Validate processingID is present
    
    FavoriteController->>FavoriteService: addFavorite(userID, processingID)
    activate FavoriteService
    
    %% Check if favorite already exists
    FavoriteService->>DatabaseService: SELECT FROM UserFavorites WHERE userID=$1 AND processingID=$2
    activate DatabaseService
    DatabaseService-->>FavoriteService: Check result
    deactivate DatabaseService
    
    alt Favorite already exists
        Note over FavoriteService: Return existing favorite
        FavoriteService-->>FavoriteController: {favoriteID, isNew: false}
    else Favorite not exists
        %% Insert new favorite
        FavoriteService->>DatabaseService: INSERT INTO UserFavorites (userID, processingID) RETURNING *
        activate DatabaseService
        DatabaseService-->>FavoriteService: New favorite created (favoriteID, userID, processingID, addedAt)
        deactivate DatabaseService
        FavoriteService-->>FavoriteController: {favoriteID, isNew: true}
    end
    deactivate FavoriteService
    
    FavoriteController-->>Frontend: 200 {success: true, message: "Favorite added successfully", data: result}
    deactivate FavoriteController
    
    Frontend-->>User: Update UI (❤️ → ❤️ filled)
```

### Happy Path - Remove from Favorites

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant FavoriteController
    participant AuthMiddleware
    participant FavoriteService
    participant DatabaseService

    User->>Frontend: Click "Remove from Favorites" ❤️ filled
    Frontend->>FavoriteController: DELETE /api/favorites {processingID}
    
    activate FavoriteController
    FavoriteController->>AuthMiddleware: authenticateToken(req, res, next)
    activate AuthMiddleware
    AuthMiddleware-->>FavoriteController: req.user.userID set
    deactivate AuthMiddleware
    
    FavoriteController->>FavoriteService: removeFavorite(userID, processingID)
    activate FavoriteService
    
    FavoriteService->>DatabaseService: DELETE FROM UserFavorites WHERE userID=$1 AND processingID=$2
    activate DatabaseService
    DatabaseService-->>FavoriteService: Deleted (rowCount: 1)
    deactivate DatabaseService
    
    FavoriteService-->>FavoriteController: true (removed successfully)
    deactivate FavoriteService
    
    FavoriteController-->>Frontend: 200 {success: true, message: "Favorite removed successfully", data: {removed: true}}
    deactivate FavoriteController
    
    Frontend-->>User: Update UI (❤️ filled → ❤️)
```

### Happy Path - Get User Favorites List

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant FavoriteController
    participant AuthMiddleware
    participant FavoriteService
    participant DatabaseService

    User->>Frontend: Navigate to "My Favorites" page
    Frontend->>FavoriteController: GET /api/favorites?page=1&limit=20
    
    activate FavoriteController
    FavoriteController->>AuthMiddleware: authenticateToken(req, res, next)
    activate AuthMiddleware
    AuthMiddleware-->>FavoriteController: req.user.userID set
    deactivate AuthMiddleware
    
    Note over FavoriteController: Parse query params:<br/>page (default: 1)<br/>limit (default: 20)
    
    FavoriteController->>FavoriteService: getUserFavorites(userID, page, limit)
    activate FavoriteService
    
    %% Get total count
    FavoriteService->>DatabaseService: SELECT COUNT(*) FROM UserFavorites WHERE userID=$1
    activate DatabaseService
    DatabaseService-->>FavoriteService: Total count
    deactivate DatabaseService
    
    %% Get paginated favorites with song details
    FavoriteService->>DatabaseService: SELECT uf.*, p.*, s.songName, s.artistName FROM UserFavorites uf LEFT JOIN SongAIProcessing p ON uf.processingID=p.processingID LEFT JOIN Songs s ON p.songID=s.songID WHERE uf.userID=$1 ORDER BY uf.addedAt DESC LIMIT $2 OFFSET $3
    activate DatabaseService
    DatabaseService-->>FavoriteService: Favorites array with song details
    deactivate DatabaseService
    
    FavoriteService-->>FavoriteController: {favorites: [...], total, page, limit, totalPages}
    deactivate FavoriteService
    
    FavoriteController-->>Frontend: 200 {success: true, message: "User favorites retrieved successfully", data: result}
    deactivate FavoriteController
    
    Frontend-->>User: Display favorites list with pagination
```

### Error Path - Favorites Failures

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant FavoriteController
    participant AuthMiddleware
    participant FavoriteService
    participant DatabaseService

    %% Error 1: Missing authentication token
    User->>Frontend: Try to add favorite (not logged in)
    Frontend->>FavoriteController: POST /api/favorites {processingID}
    activate FavoriteController
    FavoriteController->>AuthMiddleware: authenticateToken(req, res, next)
    activate AuthMiddleware
    Note over AuthMiddleware: No Authorization header or invalid token
    AuthMiddleware-->>Frontend: 401 {error: "Authentication required"}
    deactivate AuthMiddleware
    deactivate FavoriteController
    Frontend-->>User: Show "Please login first"

    %% Error 2: Missing processingID
    User->>Frontend: Add favorite without processingID
    Frontend->>FavoriteController: POST /api/favorites {}
    activate FavoriteController
    FavoriteController->>AuthMiddleware: authenticateToken(req, res, next)
    activate AuthMiddleware
    AuthMiddleware-->>FavoriteController: req.user.userID set
    deactivate AuthMiddleware
    Note over FavoriteController: Validation fails:<br/>processingID is required
    FavoriteController-->>Frontend: 400 {error: "processingID is required"}
    deactivate FavoriteController
    Frontend-->>User: Show validation error

    %% Error 3: Favorite not found when removing
    User->>Frontend: Remove non-existent favorite
    Frontend->>FavoriteController: DELETE /api/favorites {processingID}
    activate FavoriteController
    FavoriteController->>AuthMiddleware: authenticateToken(req, res, next)
    activate AuthMiddleware
    AuthMiddleware-->>FavoriteController: req.user.userID set
    deactivate AuthMiddleware
    FavoriteController->>FavoriteService: removeFavorite(userID, processingID)
    activate FavoriteService
    FavoriteService->>DatabaseService: DELETE FROM UserFavorites WHERE userID=$1 AND processingID=$2
    activate DatabaseService
    DatabaseService-->>FavoriteService: Deleted (rowCount: 0)
    deactivate DatabaseService
    FavoriteService-->>FavoriteController: false (not found)
    deactivate FavoriteService
    FavoriteController-->>Frontend: 404 {error: "Favorite not found"}
    deactivate FavoriteController
    Frontend-->>User: Show "Not in favorites"

    %% Error 4: Database error during add
    User->>Frontend: Add favorite
    Frontend->>FavoriteController: POST /api/favorites {processingID}
    activate FavoriteController
    FavoriteController->>AuthMiddleware: authenticateToken(req, res, next)
    activate AuthMiddleware
    AuthMiddleware-->>FavoriteController: req.user.userID set
    deactivate AuthMiddleware
    FavoriteController->>FavoriteService: addFavorite(userID, processingID)
    activate FavoriteService
    FavoriteService->>DatabaseService: INSERT INTO UserFavorites
    activate DatabaseService
    DatabaseService-->>FavoriteService: Database error (connection lost)
    deactivate DatabaseService
    FavoriteService-->>FavoriteController: throw Error
    deactivate FavoriteService
    FavoriteController-->>Frontend: 500 {error: "Failed to add favorite"}
    deactivate FavoriteController
    Frontend-->>User: Show server error
```

---

## 3. History Tracking Flow

### Happy Path - Record Translation History

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant HistoryController
    participant AuthMiddleware
    participant HistoryService
    participant DatabaseService

    User->>Frontend: Save translation to history
    Frontend->>HistoryController: POST /api/history/save {songID, processingID}
    
    activate HistoryController
    HistoryController->>AuthMiddleware: authenticateToken(req, res, next)
    activate AuthMiddleware
    AuthMiddleware-->>HistoryController: req.user.userID set
    deactivate AuthMiddleware
    
    Note over HistoryController: Validate songID and processingID are present<br/>Extract deviceInfo from User-Agent
    
    HistoryController->>HistoryService: recordSaveTranslation(userID, songID, processingID, deviceInfo)
    activate HistoryService
    
    HistoryService->>DatabaseService: INSERT INTO History (userID, songID, processingID, actionType='save_translation', deviceInfo) RETURNING *
    activate DatabaseService
    DatabaseService-->>HistoryService: History record created (historyID, userID, songID, processingID, actionType, actionTime, deviceInfo)
    deactivate DatabaseService
    
    HistoryService-->>HistoryController: {historyID, actionType, actionTime}
    deactivate HistoryService
    
    HistoryController-->>Frontend: 200 {success: true, message: "Translation saved successfully", data: result}
    deactivate HistoryController
    
    Frontend-->>User: Show success notification
```

### Happy Path - Get User History

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant HistoryController
    participant AuthMiddleware
    participant HistoryService
    participant DatabaseService

    User->>Frontend: Navigate to "My History" page
    Frontend->>HistoryController: GET /api/history?page=1&limit=20&actionType=save_translation
    
    activate HistoryController
    HistoryController->>AuthMiddleware: authenticateToken(req, res, next)
    activate AuthMiddleware
    AuthMiddleware-->>HistoryController: req.user.userID set
    deactivate AuthMiddleware
    
    Note over HistoryController: Parse query params:<br/>page (default: 1)<br/>limit (default: 20)<br/>actionType (optional filter)
    
    HistoryController->>HistoryService: getUserHistory(userID, page, limit, actionType)
    activate HistoryService
    
    %% Get total count
    HistoryService->>DatabaseService: SELECT COUNT(*) FROM History WHERE userID=$1 AND actionType=$2
    activate DatabaseService
    DatabaseService-->>HistoryService: Total count
    deactivate DatabaseService
    
    %% Get paginated history with song details
    HistoryService->>DatabaseService: SELECT h.*, s.songName, s.artistName, p.coverImage FROM History h LEFT JOIN Songs s ON h.songID=s.songID LEFT JOIN SongAIProcessing p ON h.processingID=p.processingID WHERE h.userID=$1 AND h.actionType=$2 ORDER BY h.actionTime DESC LIMIT $3 OFFSET $4
    activate DatabaseService
    DatabaseService-->>HistoryService: History array with song details
    deactivate DatabaseService
    
    HistoryService-->>HistoryController: {history: [...], total, page, limit, totalPages}
    deactivate HistoryService
    
    HistoryController-->>Frontend: 200 {success: true, message: "User history retrieved successfully", data: result}
    deactivate HistoryController
    
    Frontend-->>User: Display history list with pagination
```

### Error Path - History Failures

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant HistoryController
    participant AuthMiddleware
    participant HistoryService
    participant DatabaseService

    %% Error 1: Missing authentication
    User->>Frontend: Try to save history (not logged in)
    Frontend->>HistoryController: POST /api/history/save {songID, processingID}
    activate HistoryController
    HistoryController->>AuthMiddleware: authenticateToken(req, res, next)
    activate AuthMiddleware
    AuthMiddleware-->>Frontend: 401 {error: "Authentication required"}
    deactivate AuthMiddleware
    deactivate HistoryController
    Frontend-->>User: Show "Please login first"

    %% Error 2: Missing required fields
    User->>Frontend: Save history without songID
    Frontend->>HistoryController: POST /api/history/save {processingID}
    activate HistoryController
    HistoryController->>AuthMiddleware: authenticateToken(req, res, next)
    activate AuthMiddleware
    AuthMiddleware-->>HistoryController: req.user.userID set
    deactivate AuthMiddleware
    Note over HistoryController: Validation fails:<br/>songID and processingID are required
    HistoryController-->>Frontend: 400 {error: "songID and processingID are required"}
    deactivate HistoryController
    Frontend-->>User: Show validation error

    %% Error 3: Database error during save
    User->>Frontend: Save translation
    Frontend->>HistoryController: POST /api/history/save {songID, processingID}
    activate HistoryController
    HistoryController->>AuthMiddleware: authenticateToken(req, res, next)
    activate AuthMiddleware
    AuthMiddleware-->>HistoryController: req.user.userID set
    deactivate AuthMiddleware
    HistoryController->>HistoryService: recordSaveTranslation(userID, songID, processingID, deviceInfo)
    activate HistoryService
    HistoryService->>DatabaseService: INSERT INTO History
    activate DatabaseService
    DatabaseService-->>HistoryService: Database error (constraint violation)
    deactivate DatabaseService
    HistoryService-->>HistoryController: throw Error
    deactivate HistoryService
    HistoryController-->>Frontend: 500 {error: "Failed to save translation"}
    deactivate HistoryController
    Frontend-->>User: Show server error
```

---

## Summary of Error Codes

| Endpoint | Status Code | Error Scenario | Message |
|----------|-------------|----------------|---------|
| **POST /api/share/create** | 400 | Missing processingID | "processingID is required" |
| | 400 | Processing not found | "Processing record not found" |
| | 500 | Collision after max attempts | "Failed to create share link" |
| | 500 | Database error | "Failed to create share link" |
| **GET /api/share/{shortLink}** | 400 | Missing shortLink | "shortLink is required" |
| | 404 | Invalid shortLink | "Processing not found or not publicly shared" |
| | 500 | Server error | "Failed to retrieve processing" |
| **POST /api/favorites** | 401 | Missing auth token | "Authentication required" |
| | 400 | Missing processingID | "processingID is required" |
| | 500 | Database error | "Failed to add favorite" |
| **DELETE /api/favorites** | 401 | Missing auth token | "Authentication required" |
| | 400 | Missing processingID | "processingID is required" |
| | 404 | Favorite not found | "Favorite not found" |
| | 500 | Database error | "Failed to remove favorite" |
| **GET /api/favorites** | 401 | Missing auth token | "Authentication required" |
| | 500 | Database error | "Failed to retrieve user favorites" |
| **POST /api/history/save** | 401 | Missing auth token | "Authentication required" |
| | 400 | Missing required fields | "songID and processingID are required" |
| | 500 | Database error | "Failed to save translation" |
| **GET /api/history** | 401 | Missing auth token | "Authentication required" |
| | 500 | Database error | "Failed to retrieve user history" |

---

## Verification Notes

**Share Link Flow** (shareController.js lines 1-150, shareService.js lines 1-150):
- **createShareLink**: Optional JWT auth (userId can be null for anonymous) (controller lines 7-25)
- **shortLink generation**: SHA256 hash of processingID, first 12 characters (service lines 10-15)
- **Collision check**: Max 10 attempts, regenerate with timestamp + attempts if collision (service lines 40-60)
- **alreadyExists flag**: Returns existing shortLink if already created (service lines 30-40)
- **shareUrl format**: {frontend.url}/share/{shortLink} (service line 42)
- **getProcessingByShortLink**: Returns processing with shareStatus, approvalStatus, isApproved flag (service lines 80-120)

**Favorites Flow** (favoriteController.js lines 1-139, favoriteService.js):
- **addFavorite**: Requires auth (authenticateToken middleware), validates processingID (controller lines 5-38)
- **Duplicate check**: Returns isNew:false if favorite already exists (service)
- **removeFavorite**: Returns 404 if favorite not found (controller lines 40-73)
- **getUserFavorites**: Pagination with page/limit params (default: page=1, limit=20) (controller lines 75-100)
- **JOIN query**: Favorites joined with SongAIProcessing and Songs for complete data (service)

**History Flow** (historyController.js lines 1-100, historyService.js):
- **saveTranslation**: Requires auth, validates songID and processingID (controller lines 29-67)
- **deviceInfo**: Extracted from User-Agent header (mobile vs desktop) (controller line 54)
- **actionType**: 'save_translation' stored in History table (service)
- **getUserHistory**: Optional actionType filter, pagination (controller lines 5-27)
- **ORDER BY**: History ordered by actionTime DESC (most recent first) (service)

**Database Tables**:
- **SongAIProcessing**: shortLink column (varchar, unique), shareStatus, approvalStatus
- **UserFavorites**: userID, processingID, addedAt timestamp
- **History**: userID, songID, processingID, actionType, actionTime, deviceInfo

**JWT Authentication**:
- Favorites and History require authenticateToken middleware
- Share creation supports optional auth (anonymous sharing allowed)
- JWT verified via JWTService.verifyAccessToken()
