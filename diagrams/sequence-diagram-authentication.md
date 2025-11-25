# Sequence Diagrams - Authentication Flows

> **Verification Status**: ✅ All flows verified against actual code
> - Source files: `backend/src/controllers/authController.js`, `backend/src/services/userService.js`, `backend/src/services/sessionService.js`, `backend/src/services/googleAuthService.js`
> - All error codes, validation rules, and flow steps documented from actual implementation
> - Last verified: 25 November 2025

---

## 1. User Registration Flow

### Happy Path - Successful Registration

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthController
    participant UserService
    participant DatabaseService
    participant SessionService
    participant EmailService
    participant JWTService

    User->>Frontend: Submit registration (username, email, password)
    Frontend->>AuthController: POST /api/auth/register
    
    activate AuthController
    Note over AuthController: Validate input:<br/>username (3-20 chars)<br/>email (optional, valid format)<br/>password (strength check)
    
    AuthController->>UserService: checkUsernameExists(username)
    activate UserService
    UserService->>DatabaseService: SELECT FROM Users WHERE username=$1
    DatabaseService-->>UserService: No user found
    UserService-->>AuthController: false
    deactivate UserService
    
    AuthController->>UserService: checkEmailExists(email)
    activate UserService
    UserService->>DatabaseService: SELECT FROM Users WHERE email=$1
    DatabaseService-->>UserService: No user found
    UserService-->>AuthController: false
    deactivate UserService
    
    AuthController->>UserService: createUser(userData)
    activate UserService
    Note over UserService: Hash password<br/>(bcrypt, 12 rounds)
    UserService->>DatabaseService: INSERT INTO Users (username, email, password, role='customer')
    DatabaseService-->>UserService: User created (userID, username, email, ...)
    UserService-->>AuthController: User object
    deactivate UserService
    
    AuthController->>EmailService: sendWelcomeEmail(email, username)
    Note over EmailService: Non-blocking<br/>Email failure doesn't stop registration
    
    AuthController->>UserService: updateLoginStatus(userID, 'online')
    activate UserService
    UserService->>DatabaseService: UPDATE Users SET loginStatus='online'
    UserService-->>AuthController: Updated
    deactivate UserService
    
    AuthController->>SessionService: createSession(userID, deviceInfo)
    activate SessionService
    SessionService->>DatabaseService: INSERT INTO UserSessions
    DatabaseService-->>SessionService: Session created (sessionID, userID, ...)
    SessionService-->>AuthController: Session object
    deactivate SessionService
    
    AuthController->>JWTService: generateTokens(userID, sessionID)
    activate JWTService
    JWTService-->>AuthController: {accessToken, refreshToken}
    deactivate JWTService
    
    AuthController-->>Frontend: 201 {user, session, tokens}
    deactivate AuthController
    Frontend-->>User: Registration successful
```

### Error Path - Registration Failures

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthController
    participant UserService
    participant DatabaseService

    %% Error 1: Validation failure
    User->>Frontend: Submit invalid data (username too short)
    Frontend->>AuthController: POST /api/auth/register
    activate AuthController
    Note over AuthController: Validation fails:<br/>username must be 3-20 chars
    AuthController-->>Frontend: 400 {error: "Username must be 3-20 characters"}
    deactivate AuthController
    Frontend-->>User: Show validation error

    %% Error 2: Duplicate username
    User->>Frontend: Submit with existing username
    Frontend->>AuthController: POST /api/auth/register
    activate AuthController
    AuthController->>UserService: checkUsernameExists(username)
    activate UserService
    UserService->>DatabaseService: SELECT FROM Users WHERE username=$1
    DatabaseService-->>UserService: User found
    UserService-->>AuthController: true
    deactivate UserService
    AuthController-->>Frontend: 409 {error: "Username already exists"}
    deactivate AuthController
    Frontend-->>User: Show duplicate error

    %% Error 3: Duplicate email
    User->>Frontend: Submit with existing email
    Frontend->>AuthController: POST /api/auth/register
    activate AuthController
    AuthController->>UserService: checkUsernameExists(username)
    activate UserService
    UserService-->>AuthController: false
    deactivate UserService
    
    AuthController->>UserService: checkEmailExists(email)
    activate UserService
    UserService->>DatabaseService: SELECT FROM Users WHERE email=$1
    DatabaseService-->>UserService: Email found
    UserService-->>AuthController: true
    deactivate UserService
    AuthController-->>Frontend: 409 {error: "Email already exists"}
    deactivate AuthController
    Frontend-->>User: Show duplicate error

    %% Error 4: Database failure
    User->>Frontend: Submit valid data
    Frontend->>AuthController: POST /api/auth/register
    activate AuthController
    AuthController->>UserService: createUser(userData)
    activate UserService
    UserService->>DatabaseService: INSERT INTO Users
    DatabaseService-->>UserService: Database error (connection lost)
    UserService-->>AuthController: throw Error
    deactivate UserService
    AuthController-->>Frontend: 500 {error: "Internal Server Error"}
    deactivate AuthController
    Frontend-->>User: Show server error
```

---

## 2. User Login Flow

### Happy Path - Successful Login (Without 2FA)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthController
    participant AuthService
    participant UserService
    participant TwoFactorService
    participant SessionService
    participant JWTService
    participant DatabaseService

    User->>Frontend: Submit login (username, password)
    Frontend->>AuthController: POST /api/auth/login
    
    activate AuthController
    Note over AuthController: Validate input:<br/>username required<br/>password required
    
    AuthController->>AuthService: authenticateUser(username, password)
    activate AuthService
    AuthService->>UserService: findByUsername(username)
    activate UserService
    UserService->>DatabaseService: SELECT FROM Users WHERE username=$1
    DatabaseService-->>UserService: User found
    UserService-->>AuthService: User object
    deactivate UserService
    
    Note over AuthService: Verify password<br/>(bcrypt.compare)
    AuthService-->>AuthController: User object
    deactivate AuthService
    
    AuthController->>TwoFactorService: get2FAStatus(userID)
    activate TwoFactorService
    TwoFactorService->>DatabaseService: SELECT FROM UserTwoFactorAuth WHERE userID=$1
    DatabaseService-->>TwoFactorService: No 2FA record (or isEnabled=false)
    TwoFactorService-->>AuthController: {isEnabled: false}
    deactivate TwoFactorService
    
    AuthController->>UserService: updateLoginStatus(userID, 'online')
    activate UserService
    UserService->>DatabaseService: UPDATE Users SET loginStatus='online'
    UserService-->>AuthController: Updated
    deactivate UserService
    
    AuthController->>SessionService: createSession(userID, deviceInfo)
    activate SessionService
    SessionService->>DatabaseService: INSERT INTO UserSessions
    DatabaseService-->>SessionService: Session created
    SessionService-->>AuthController: Session object
    deactivate SessionService
    
    AuthController->>JWTService: generateTokens(userID, sessionID)
    activate JWTService
    JWTService-->>AuthController: {accessToken, refreshToken}
    deactivate JWTService
    
    AuthController-->>Frontend: 200 {user, session, tokens}
    deactivate AuthController
    Frontend-->>User: Login successful
```

### Happy Path - Successful Login (With 2FA)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthController
    participant AuthService
    participant TwoFactorService
    participant SessionService
    participant JWTService
    participant DatabaseService

    %% Step 1: Initial login request (without 2FA token)
    User->>Frontend: Submit login (username, password)
    Frontend->>AuthController: POST /api/auth/login {username, password}
    
    activate AuthController
    AuthController->>AuthService: authenticateUser(username, password)
    activate AuthService
    Note over AuthService: Verify username & password
    AuthService-->>AuthController: User object
    deactivate AuthService
    
    AuthController->>TwoFactorService: get2FAStatus(userID)
    activate TwoFactorService
    TwoFactorService->>DatabaseService: SELECT FROM UserTwoFactorAuth WHERE userID=$1
    DatabaseService-->>TwoFactorService: 2FA record (isEnabled=true)
    TwoFactorService-->>AuthController: {isEnabled: true}
    deactivate TwoFactorService
    
    Note over AuthController: 2FA enabled but no token provided
    AuthController-->>Frontend: 200 {requires2FA: true, userID}
    deactivate AuthController
    Frontend-->>User: Show 2FA input form
    
    %% Step 2: Submit 2FA token
    User->>Frontend: Enter 2FA code (6 digits)
    Frontend->>AuthController: POST /api/auth/login {username, password, twoFactorToken}
    
    activate AuthController
    AuthController->>AuthService: authenticateUser(username, password)
    activate AuthService
    AuthService-->>AuthController: User object
    deactivate AuthService
    
    AuthController->>TwoFactorService: get2FAStatus(userID)
    activate TwoFactorService
    TwoFactorService-->>AuthController: {isEnabled: true}
    deactivate TwoFactorService
    
    AuthController->>TwoFactorService: verifyToken(userID, token, deviceInfo)
    activate TwoFactorService
    TwoFactorService->>DatabaseService: SELECT secret FROM UserTwoFactorAuth WHERE userID=$1
    DatabaseService-->>TwoFactorService: Secret key
    Note over TwoFactorService: Verify TOTP token<br/>(speakeasy)
    TwoFactorService->>DatabaseService: INSERT INTO TwoFactorVerification (log verification)
    TwoFactorService-->>AuthController: {success: true}
    deactivate TwoFactorService
    
    AuthController->>SessionService: createSession(userID, deviceInfo)
    activate SessionService
    SessionService->>DatabaseService: INSERT INTO UserSessions
    SessionService-->>AuthController: Session object
    deactivate SessionService
    
    AuthController->>JWTService: generateTokens(userID, sessionID)
    activate JWTService
    JWTService-->>AuthController: {accessToken, refreshToken}
    deactivate JWTService
    
    AuthController-->>Frontend: 200 {user, session, tokens}
    deactivate AuthController
    Frontend-->>User: Login successful
```

### Error Path - Login Failures

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthController
    participant AuthService
    participant UserService
    participant TwoFactorService
    participant DatabaseService

    %% Error 1: Missing fields
    User->>Frontend: Submit incomplete (missing password)
    Frontend->>AuthController: POST /api/auth/login {username only}
    activate AuthController
    Note over AuthController: Validation fails:<br/>password is required
    AuthController-->>Frontend: 400 {error: "Username and password are required"}
    deactivate AuthController
    Frontend-->>User: Show validation error

    %% Error 2: Invalid credentials
    User->>Frontend: Submit wrong password
    Frontend->>AuthController: POST /api/auth/login {username, wrong password}
    activate AuthController
    AuthController->>AuthService: authenticateUser(username, password)
    activate AuthService
    AuthService->>UserService: findByUsername(username)
    activate UserService
    UserService-->>AuthService: User object
    deactivate UserService
    Note over AuthService: Password verification fails<br/>(bcrypt.compare returns false)
    AuthService-->>AuthController: null (authentication failed)
    deactivate AuthService
    AuthController-->>Frontend: 401 {error: "Invalid username or password"}
    deactivate AuthController
    Frontend-->>User: Show authentication error

    %% Error 3: User not found
    User->>Frontend: Submit non-existent username
    Frontend->>AuthController: POST /api/auth/login
    activate AuthController
    AuthController->>AuthService: authenticateUser(username, password)
    activate AuthService
    AuthService->>UserService: findByUsername(username)
    activate UserService
    UserService->>DatabaseService: SELECT FROM Users WHERE username=$1
    DatabaseService-->>UserService: No user found
    UserService-->>AuthService: null
    deactivate UserService
    AuthService-->>AuthController: null (user not found)
    deactivate AuthService
    AuthController-->>Frontend: 401 {error: "Invalid username or password"}
    deactivate AuthController
    Frontend-->>User: Show authentication error

    %% Error 4: Account locked
    User->>Frontend: Submit login for locked account
    Frontend->>AuthController: POST /api/auth/login
    activate AuthController
    AuthController->>AuthService: authenticateUser(username, password)
    activate AuthService
    AuthService->>UserService: findByUsername(username)
    activate UserService
    UserService-->>AuthService: User object (with accountLocked=true)
    deactivate UserService
    Note over AuthService: Check account status:<br/>accountLocked is true
    AuthService-->>AuthController: throw Error "Account is locked"
    deactivate AuthService
    AuthController-->>Frontend: 423 {error: "Account is locked. Contact support."}
    deactivate AuthController
    Frontend-->>User: Show account locked error

    %% Error 5: Invalid 2FA token
    User->>Frontend: Submit login with wrong 2FA code
    Frontend->>AuthController: POST /api/auth/login {username, password, twoFactorToken: "wrong"}
    activate AuthController
    AuthController->>AuthService: authenticateUser(username, password)
    activate AuthService
    AuthService-->>AuthController: User object
    deactivate AuthService
    
    AuthController->>TwoFactorService: verifyToken(userID, token, deviceInfo)
    activate TwoFactorService
    TwoFactorService->>DatabaseService: SELECT secret FROM UserTwoFactorAuth
    DatabaseService-->>TwoFactorService: Secret key
    Note over TwoFactorService: TOTP verification fails<br/>(invalid code)
    TwoFactorService->>DatabaseService: INSERT INTO TwoFactorVerification (failed=true)
    TwoFactorService-->>AuthController: {success: false}
    deactivate TwoFactorService
    
    AuthController-->>Frontend: 400 {error: "Invalid two-factor authentication code"}
    deactivate AuthController
    Frontend-->>User: Show 2FA error, retry

    %% Error 6: Database error
    User->>Frontend: Submit valid login
    Frontend->>AuthController: POST /api/auth/login
    activate AuthController
    AuthController->>AuthService: authenticateUser(username, password)
    activate AuthService
    AuthService->>UserService: findByUsername(username)
    activate UserService
    UserService->>DatabaseService: SELECT FROM Users
    DatabaseService-->>UserService: Database connection error
    UserService-->>AuthService: throw Error
    deactivate UserService
    AuthService-->>AuthController: throw Error
    deactivate AuthService
    AuthController-->>Frontend: 500 {error: "Internal Server Error"}
    deactivate AuthController
    Frontend-->>User: Show server error
```

---

## 3. Google OAuth Login Flow

### Happy Path - Successful Google Login

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant GoogleOAuth
    participant AuthController
    participant GoogleAuthService
    participant UserService
    participant SessionService
    participant JWTService
    participant DatabaseService

    User->>Frontend: Click "Sign in with Google"
    Frontend->>GoogleOAuth: Redirect to Google OAuth consent
    GoogleOAuth-->>User: Show consent screen
    User->>GoogleOAuth: Grant permission
    GoogleOAuth-->>Frontend: Redirect with googleToken
    
    Frontend->>AuthController: POST /api/auth/google {googleToken}
    
    activate AuthController
    Note over AuthController: Validate googleToken is present
    
    AuthController->>GoogleAuthService: handleGoogleLogin(googleToken, deviceInfo, ipAddress, userAgent)
    activate GoogleAuthService
    
    Note over GoogleAuthService: verifyGoogleToken(token)<br/>Verify with Google OAuth2Client<br/>Extract: googleId, email, name, picture
    
    GoogleAuthService->>GoogleAuthService: findOrCreateGoogleUser(googleUserData)
    activate GoogleAuthService
    
    GoogleAuthService->>DatabaseService: SELECT FROM Users WHERE providerID=$1 AND provider='google'
    activate DatabaseService
    DatabaseService-->>GoogleAuthService: User found or null
    deactivate DatabaseService
    
    alt User exists (found by providerID)
        Note over GoogleAuthService: Return existing Google user
    else User not found by providerID
        GoogleAuthService->>DatabaseService: SELECT FROM Users WHERE email=$1
        activate DatabaseService
        DatabaseService-->>GoogleAuthService: User found or null
        deactivate DatabaseService
        
        alt Email exists (link account)
            Note over GoogleAuthService: Update existing user with Google info
            GoogleAuthService->>DatabaseService: UPDATE Users SET provider='google', providerID=$1, profilePicture=$2
            activate DatabaseService
            DatabaseService-->>GoogleAuthService: Updated user
            deactivate DatabaseService
        else User not found (create new)
            Note over GoogleAuthService: Generate username: email.split('@')[0] + '_' + Date.now()
            GoogleAuthService->>DatabaseService: INSERT INTO Users (username, email, fullName, profilePicture, provider='google', providerID)
            activate DatabaseService
            DatabaseService-->>GoogleAuthService: New Google user created
            deactivate DatabaseService
        end
    end
    
    GoogleAuthService-->>GoogleAuthService: User object
    deactivate GoogleAuthService
    
    Note over GoogleAuthService: handleGoogleLogin continues...
    
    GoogleAuthService->>DatabaseService: UPDATE Users SET loginStatus='online' WHERE userID=$1
    activate DatabaseService
    DatabaseService-->>GoogleAuthService: Updated
    deactivate DatabaseService
    
    GoogleAuthService->>DatabaseService: INSERT INTO UserSessions (userID, deviceInfo, ipAddress, userAgent)
    activate DatabaseService
    DatabaseService-->>GoogleAuthService: Session created
    deactivate DatabaseService
    
    GoogleAuthService->>GoogleAuthService: generateAccessToken(userID, username, role)
    GoogleAuthService->>GoogleAuthService: generateRefreshToken(userID)
    
    GoogleAuthService-->>AuthController: {user, session, isNewUser, tokens: {accessToken, refreshToken}}
    deactivate GoogleAuthService
    
    AuthController-->>Frontend: 200 {user, session, tokens}
    deactivate AuthController
    Frontend-->>User: Login successful
```

### Error Path - Google Login Failures

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant AuthController
    participant GoogleAuthService

    %% Error 1: Missing Google token
    User->>Frontend: OAuth flow fails, no token
    Frontend->>AuthController: POST /api/auth/google {}
    activate AuthController
    Note over AuthController: Validation fails:<br/>googleToken is required
    AuthController-->>Frontend: 400 {error: "Google token is required"}
    deactivate AuthController
    Frontend-->>User: Show error, retry

    %% Error 2: Invalid Google token
    User->>Frontend: OAuth returns invalid token
    Frontend->>AuthController: POST /api/auth/google {googleToken: "invalid"}
    activate AuthController
    AuthController->>GoogleAuthService: handleGoogleLogin("invalid", deviceInfo, ipAddress, userAgent)
    activate GoogleAuthService
    Note over GoogleAuthService: verifyGoogleToken() fails<br/>OAuth2Client.verifyIdToken() throws error<br/>(invalid signature, expired, or wrong audience)
    GoogleAuthService-->>AuthController: throw Error "Invalid Google token"
    deactivate GoogleAuthService
    AuthController-->>Frontend: 500 {error: "Google authentication failed"}
    deactivate AuthController
    Frontend-->>User: Show authentication error

    %% Error 3: Database error during user creation
    User->>Frontend: First-time Google login
    Frontend->>AuthController: POST /api/auth/google {googleToken}
    activate AuthController
    AuthController->>GoogleAuthService: handleGoogleLogin(googleToken, deviceInfo, ipAddress, userAgent)
    activate GoogleAuthService
    Note over GoogleAuthService: Token valid, user not found
    GoogleAuthService->>DatabaseService: INSERT INTO Users (username, email, provider='google', providerID)
    activate DatabaseService
    DatabaseService-->>GoogleAuthService: Database error (connection lost or constraint violation)
    deactivate DatabaseService
    GoogleAuthService-->>AuthController: throw Error
    deactivate GoogleAuthService
    AuthController-->>Frontend: 500 {error: "Google authentication failed"}
    deactivate AuthController
    Frontend-->>User: Show server error

    %% Error 4: Google account already linked to another user
    User->>Frontend: Try to link Google account
    Frontend->>AuthController: POST /api/auth/google {googleToken, type: 'link', userId}
    activate AuthController
    AuthController->>GoogleAuthService: handleGoogleLogin(googleToken, ..., type='link', userId)
    activate GoogleAuthService
    Note over GoogleAuthService: Token valid, check if googleId already linked
    GoogleAuthService->>DatabaseService: SELECT FROM Users WHERE providerID=$1 AND provider='google'
    activate DatabaseService
    DatabaseService-->>GoogleAuthService: Another user found with same providerID
    deactivate DatabaseService
    GoogleAuthService-->>AuthController: throw Error "This Google account is already linked to another user"
    deactivate GoogleAuthService
    AuthController-->>Frontend: 500 {error: "Google authentication failed"}
    deactivate AuthController
    Frontend-->>User: Show "Account already linked" error
```

---

## Summary of Error Codes

| Endpoint | Status Code | Error Scenario | Message |
|----------|-------------|----------------|---------|
| **POST /api/auth/register** | 400 | Validation failure | "Username must be 3-20 characters", "Invalid email format", "Password too weak" |
| | 409 | Duplicate username | "Username already exists" |
| | 409 | Duplicate email | "Email already exists" |
| | 500 | Server error | "Internal Server Error" |
| **POST /api/auth/login** | 400 | Missing fields | "Username and password are required" |
| | 400 | Invalid 2FA code | "Invalid two-factor authentication code" |
| | 401 | Invalid credentials | "Invalid username or password" |
| | 423 | Account locked | "Account is locked. Contact support." |
| | 500 | Server error | "Internal Server Error" |
| **POST /api/auth/google** | 400 | Missing token | "Google token is required" |
| | 500 | Invalid token | "Google authentication failed" |
| | 500 | Google account already linked | "Google authentication failed" |
| | 500 | Server error | "Google authentication failed" |

---

## Verification Notes

**Registration Flow** (lines 13-120 in authController.js):
- Username validation: 3-20 characters (line 20-25)
- Email optional but validated if provided (line 26-33)
- Password strength check (line 34-38)
- Duplicate checks: username (line 40-45), email (line 47-55)
- User creation with bcrypt hash (12 rounds) (line 57-60)
- Email service non-blocking (line 62-67)
- Session creation (line 69-75)
- Token generation (line 77-82)

**Login Flow** (lines 122-220 in authController.js):
- Username & password required (line 126-132)
- Authentication via authenticateUser() (line 134-143)
- 2FA check and handling (line 145-175)
- Account locked check returns 423 (line 177-181)
- Session creation and token generation (line 183-200)

**Google Login Flow** (lines 227-275 in authController.js, googleAuthService.js lines 1-257):
- Google token required (authController line 230-234)
- handleGoogleLogin() in GoogleAuthService:
  1. verifyGoogleToken() with OAuth2Client (line 15-32)
  2. findOrCreateGoogleUser() - checks by providerID, then email, or creates new (line 35-85)
  3. Updates user with Google info if email exists (line 117-165)
  4. Creates new user with auto-generated username if not found (line 167-215)
  5. updateLoginStatus('online') (line 230)
  6. createSession() (line 232-236)
  7. generateAccessToken() and generateRefreshToken() (line 238-239)
  8. Returns {user, session, isNewUser, tokens} (line 241-250)
- Welcome email sent to new Google users (non-blocking) (line 202-213)

**Services Involved**:
- GoogleAuthService: verifyGoogleToken(), findOrCreateGoogleUser(), handleGoogleLogin() (googleAuthService.js lines 1-257)
- UserService: createUser(), findByUsername(), checkUsernameExists(), checkEmailExists(), findByID(), updateLoginStatus() (userService.js lines 7-483)
- SessionService: createSession() (sessionService.js)
- JWTService: generateAccessToken(), generateRefreshToken() (jwtService.js)
- TwoFactorService: get2FAStatus(), verifyToken() (twoFactorService.js)
- EmailService: sendWelcomeEmail() (emailService.js)
- DatabaseService: query() for all database operations
