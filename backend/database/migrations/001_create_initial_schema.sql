-- =========================
-- MUSE Music Database Schema
-- Initial Migration: Create all tables
-- =========================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- Table: Users (unified table for all user types)
-- =========================
CREATE TABLE Users (
    userID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255), -- Hashed password (NULL for OAuth users)
    fullName VARCHAR(100),
    profilePicture VARCHAR(500), -- Path to user profile picture image file
    
    -- OAuth Provider Information
    provider VARCHAR(50), -- 'google', 'facebook', 'github', 'local'
    providerID VARCHAR(100), -- OAuth provider user ID
    providerEmail VARCHAR(150), -- Email from OAuth provider
    
    role VARCHAR(20) NOT NULL DEFAULT 'customer', -- 'customer', 'admin', 'super_admin'
    loginStatus VARCHAR(50) DEFAULT 'offline',
    setupCompleted BOOLEAN DEFAULT FALSE, -- ตั้งค่าเริ่มต้นเสร็จหรือไม่
    setupSkipped BOOLEAN DEFAULT FALSE, -- ข้ามการตั้งค่าเริ่มต้นหรือไม่
    
    -- Password Reset
    passwordResetToken VARCHAR(255),
    passwordResetTokenExpiry TIMESTAMP,
    
    -- Two-Factor Authentication
    twoFactorEnabled BOOLEAN DEFAULT FALSE,
    twoFactorSetupCompleted BOOLEAN DEFAULT FALSE,
    
    registerDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_role CHECK (role IN ('customer', 'admin', 'super_admin')),
    CONSTRAINT check_email_lowercase CHECK (email = LOWER(email)),
    CONSTRAINT check_username_lowercase CHECK (username = LOWER(username)),
    CONSTRAINT check_provider CHECK (provider IN ('google', 'facebook', 'github', 'local', 'apple'))
);

-- =========================
-- Table: Customers (extends Users)
-- =========================
CREATE TABLE Customers (
    customerID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userID UUID UNIQUE,
    DOB DATE,
    musicInterestTypes TEXT[], -- Array of music genres user likes
    customerInterest INT,
    
    -- User preferences
    preferredLanguage VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    country VARCHAR(100),
    lastActiveAt TIMESTAMP,
    
    -- Premium & Quality settings
    isPremium BOOLEAN DEFAULT FALSE,
    preferredAudioQuality VARCHAR(20) DEFAULT '320k',
    playbackSpeed DECIMAL(3,2) DEFAULT 1.00,
    autoPlay BOOLEAN DEFAULT TRUE,
    explicitContent BOOLEAN DEFAULT FALSE,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- =========================
-- Table: LyricsSearchResults (External Lyrics API Results)
-- =========================
CREATE TABLE LyricsSearchResults (
    lyricsSearchResultID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    externalID INT NOT NULL UNIQUE, -- ID from external API (LRCLIB)
    trackName VARCHAR(200) NOT NULL,
    artistName VARCHAR(150) NOT NULL,
    albumName VARCHAR(200),
    duration INT, -- duration in seconds
    instrumental BOOLEAN DEFAULT FALSE,
    lyricsPreview VARCHAR(500), -- First line of lyrics for mapping (copyright-safe, full lyrics fetched from external API when needed)
    
    -- Usage tracking
    usageCount INT DEFAULT 0, -- จำนวนครั้งที่ถูกนำไปใช้สร้าง Song
    lastUsedAt TIMESTAMP, -- ครั้งล่าสุดที่ถูกใช้
    
    -- Metadata
    sourceAPI VARCHAR(50) DEFAULT 'lrclib', -- Source API name
    fetchedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When this record was fetched from external API
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_source_api CHECK (sourceAPI IN ('lrclib', 'other'))
);

-- =========================
-- Table: Songs
-- =========================
CREATE TABLE Songs (
    songID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    songName VARCHAR(200) NOT NULL,
    artistName VARCHAR(150),
    genre VARCHAR(100),
    lyrics TEXT,
    duration INT, -- duration in seconds
    filePath VARCHAR(500), -- path to audio file
    isActive BOOLEAN DEFAULT TRUE,
    approved BOOLEAN DEFAULT FALSE,
    approvedBy UUID, -- who approved this song
    playCount INT DEFAULT 0,
    popularity INT DEFAULT 0,
    
    -- Lyrics Search Result Reference
    lyricsSearchResultID UUID, -- Reference to LyricsSearchResults if song was created from external API
    
    -- Song Source Status
    sourceStatus VARCHAR(50) DEFAULT 'manual', -- 'manual', 'from_lyrics_search', 'external'
    -- 'manual': เพลงที่ผู้ใช้กรอกเนื้อเพลงเอง
    -- 'from_lyrics_search': เพลงที่สร้างจาก LyricsSearchResults
    -- 'external': เพลงจากแหล่งอื่น
    
    createdBy UUID, -- who added this song
    updatedBy UUID, -- who last updated this song
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES Users(userID) ON DELETE SET NULL,
    FOREIGN KEY (updatedBy) REFERENCES Users(userID) ON DELETE SET NULL,
    FOREIGN KEY (approvedBy) REFERENCES Users(userID) ON DELETE SET NULL,
    FOREIGN KEY (lyricsSearchResultID) REFERENCES LyricsSearchResults(lyricsSearchResultID) ON DELETE SET NULL,
    CONSTRAINT check_source_status CHECK (sourceStatus IN ('manual', 'from_lyrics_search', 'external'))
);

-- =========================
-- Table: Playlists
-- =========================
CREATE TABLE Playlists (
    playlistID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userID UUID NOT NULL,
    playlistName VARCHAR(150) NOT NULL,
    description TEXT,
    isPublic BOOLEAN DEFAULT FALSE,
    isActive BOOLEAN DEFAULT TRUE,
    playCount INT DEFAULT 0,
    favoriteCount INT DEFAULT 0,
    coverImage VARCHAR(500), -- path to cover image
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- =========================
-- Table: PlaylistSongs (Many-to-Many relation)
-- =========================
CREATE TABLE PlaylistSongs (
    playlistID UUID,
    songID UUID,
    addedBy UUID NOT NULL, -- who added this song
    addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sortOrder SERIAL, -- auto-increment order
    isActive BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (playlistID, songID),
    FOREIGN KEY (playlistID) REFERENCES Playlists(playlistID) ON DELETE CASCADE,
    FOREIGN KEY (songID) REFERENCES Songs(songID) ON DELETE CASCADE,
    FOREIGN KEY (addedBy) REFERENCES Users(userID) ON DELETE CASCADE
);

-- =========================
-- Table: SongAIProcessing (Unified AI Processing)
-- =========================
CREATE TABLE SongAIProcessing (
    processingID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    songID UUID NOT NULL,
    
    -- AI Model Information
    aiModel VARCHAR(100) NOT NULL,
    processingTime INT, -- total processing time in milliseconds
    
    -- Summary Results
    summary TEXT,
    summaryLanguage VARCHAR(10) DEFAULT 'en',
    summaryConfidence FLOAT DEFAULT 0.0,
    
    -- Translation Results
    translation TEXT,
    interpretation TEXT, -- Interpretation/meaning of the translation
    originalLanguage VARCHAR(10),
    targetLanguage VARCHAR(10),
    translationConfidence FLOAT DEFAULT 0.0,
    
    -- Mood Analysis Results
    moodType TEXT, -- Changed from VARCHAR(50) to TEXT to support JSON array of top 5 moods
    moodScore DECIMAL(3,2) DEFAULT 0.00, -- mood intensity 0.00-1.00
    moodConfidence FLOAT DEFAULT 0.0,
    
    -- User Rating System
    totalRatings INT DEFAULT 0, -- จำนวนคนที่โหวต
    averageRating DECIMAL(3,2) DEFAULT 0.00, -- คะแนนเฉลี่ย (0.00-5.00)
    starCount INT DEFAULT 0, -- จำนวนดาว (0-5)
    
    -- Overall Processing Status
    status VARCHAR(20) DEFAULT 'completed', -- 'processing', 'completed', 'failed'
    isCompleteProcessing BOOLEAN DEFAULT FALSE, -- whether AI generated all 3 components (summary, translation, mood)
    errorMessage TEXT,
    
    -- User tracking
    createdBy UUID, -- who triggered this AI processing
    updatedBy UUID, -- who last updated this processing
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Cover Image
    coverImage VARCHAR(500), -- URL to cover image (stored in MinIO) - each processing can have its own cover
    
    -- Sharing & Approval System
    shareStatus VARCHAR(20) DEFAULT 'private', -- 'private' (ไม่แชร์), 'public_pending' (ขอแชร์ รออนุมัติ), 'public_approved' (แชร์แล้ว)
    approvalStatus VARCHAR(20), -- 'pending', 'approved', 'rejected' (NULL ถ้า shareStatus = 'private')
    approvedBy UUID, -- who approved/rejected this processing
    approvalNote TEXT, -- optional note from approver explaining the decision
    approvedAt TIMESTAMP, -- when it was approved/rejected
    isPublic BOOLEAN DEFAULT FALSE, -- whether this processing result is public or private (true เมื่อ shareStatus = 'public_approved')
    
    -- Synchronized Lyrics Player
    youtubeVideoId VARCHAR(100), -- YouTube video ID for synced lyrics player
    
    -- Sharing Link
    shortlink VARCHAR(255), -- Short link for sharing this processing
    
    -- Sync Confirmation & Timing
    syncConfirmed BOOLEAN DEFAULT FALSE, -- Confirms that sync is correct even if lyrics timing doesn't match the video
    songStartTime DECIMAL(10,3) DEFAULT NULL, -- Time offset in seconds where the song actually starts (for cases where video timing doesn't match)
    
    FOREIGN KEY (songID) REFERENCES Songs(songID) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES Users(userID) ON DELETE SET NULL,
    FOREIGN KEY (updatedBy) REFERENCES Users(userID) ON DELETE SET NULL,
    FOREIGN KEY (approvedBy) REFERENCES Users(userID) ON DELETE SET NULL,
    CONSTRAINT check_share_status CHECK (shareStatus IN ('private', 'public_pending', 'public_approved')),
    CONSTRAINT check_approval_status CHECK (approvalStatus IS NULL OR approvalStatus IN ('pending', 'approved', 'rejected'))
);

-- =========================
-- Table: AIProcessingRatings (User Ratings)
-- =========================
CREATE TABLE AIProcessingRatings (
    ratingID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    processingID UUID NOT NULL,
    userID UUID NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 1-5 stars
    comment TEXT, -- detailed comment from user
    feedback TEXT, -- optional feedback from user (legacy field)
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (processingID) REFERENCES SongAIProcessing(processingID) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    UNIQUE(processingID, userID) -- One rating per user per processing
);

-- =========================
-- Table: History
-- =========================
CREATE TABLE History (
    historyID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    songID UUID NOT NULL,
    userID UUID NOT NULL,
    processingID UUID, -- link to AI processing if available
    timeStamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    playDuration INT, -- how long the song was played in seconds
    playbackPosition INT, -- position in seconds where user stopped
    deviceInfo VARCHAR(100), -- mobile, desktop, etc.
    actionType VARCHAR(20) DEFAULT 'view', -- 'view' (when user views song detail) or 'save' (when user saves translation)
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (songID) REFERENCES Songs(songID) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (processingID) REFERENCES SongAIProcessing(processingID) ON DELETE SET NULL,
    CONSTRAINT check_action_type CHECK (actionType IN ('view', 'save'))
);


-- =========================
-- Table: UserSessions (User Login Sessions)
-- =========================
CREATE TABLE UserSessions (
    sessionID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userID UUID NOT NULL,
    deviceInfo VARCHAR(200), -- mobile, desktop, tablet
    ipAddress INET,
    userAgent TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    expiresAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- =========================
-- Table: UserTwoFactorAuth (Two-Factor Authentication Settings)
-- =========================
CREATE TABLE UserTwoFactorAuth (
    twoFactorID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userID UUID NOT NULL,
    
    -- 2FA Settings
    isEnabled BOOLEAN DEFAULT FALSE,
    secretKey VARCHAR(255), -- TOTP secret key (encrypted)
    backupCodes TEXT[], -- Array of backup codes (encrypted)
    
    -- Recovery Settings
    recoveryEmail VARCHAR(150),
    recoveryPhone VARCHAR(20),
    
    -- Security & Status
    lastUsedAt TIMESTAMP,
    failedAttempts INT DEFAULT 0,
    isLocked BOOLEAN DEFAULT FALSE,
    lockedUntil TIMESTAMP,
    
    -- Setup Status
    setupCompleted BOOLEAN DEFAULT FALSE,
    setupStep VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'qr_generated', 'verified', 'backup_codes_generated'
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    UNIQUE(userID),
    CONSTRAINT check_setup_step CHECK (setupStep IN ('not_started', 'qr_generated', 'verified', 'backup_codes_generated'))
);

-- =========================
-- Table: TwoFactorVerification (2FA Verification Attempts)
-- =========================
CREATE TABLE TwoFactorVerification (
    verificationID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userID UUID NOT NULL,
    sessionID UUID,
    
    -- Verification Details
    verificationType VARCHAR(20) NOT NULL, -- 'totp', 'backup_code', 'recovery_email', 'recovery_sms'
    verificationCode VARCHAR(10), -- TOTP code or backup code
    isSuccessful BOOLEAN DEFAULT FALSE,
    
    -- Security Info
    ipAddress INET,
    userAgent TEXT,
    deviceInfo VARCHAR(200),
    
    -- Additional Info
    attemptNumber INT DEFAULT 1, -- Track attempt number for rate limiting
    errorMessage TEXT, -- Store error message if verification fails
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (sessionID) REFERENCES UserSessions(sessionID) ON DELETE SET NULL,
    CONSTRAINT check_verification_type CHECK (verificationType IN ('totp', 'backup_code', 'recovery_email', 'recovery_sms'))
);

-- =========================
-- Table: Notifications (User Notifications)
-- =========================
CREATE TABLE Notifications (
    notificationID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userID UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'info', 'warning', 'success', 'error'
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- =========================
-- Table: UserFavorites (User Favorites)
-- =========================
CREATE TABLE UserFavorites (
    favoriteID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userID UUID NOT NULL,
    songID UUID,
    playlistID UUID,
    processingID UUID,
    favoriteType VARCHAR(20) NOT NULL, -- 'song', 'playlist'
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (songID) REFERENCES Songs(songID) ON DELETE CASCADE,
    FOREIGN KEY (playlistID) REFERENCES Playlists(playlistID) ON DELETE CASCADE,
    FOREIGN KEY (processingID) REFERENCES SongAIProcessing(processingID) ON DELETE CASCADE,
    CONSTRAINT check_favorite_type CHECK (favoriteType IN ('song', 'playlist')),
    CONSTRAINT check_favorite_target CHECK (
        (favoriteType = 'song' AND songID IS NOT NULL AND playlistID IS NULL AND processingID IS NOT NULL) OR
        (favoriteType = 'playlist' AND playlistID IS NOT NULL AND songID IS NULL AND processingID IS NULL)
    )
);

-- =========================
-- Table: Reports (User Reports)
-- =========================
CREATE TABLE Reports (
    reportID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userID UUID NOT NULL,
    reportType VARCHAR(50) NOT NULL, -- 'song', 'playlist', 'user', 'ai'
    targetID UUID, -- ID ของสิ่งที่รายงาน
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
    adminNotes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- =========================
-- Create Indexes for better performance
-- =========================

-- Users table indexes
CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_users_login_status ON Users(loginStatus);
CREATE INDEX idx_users_setup ON Users(setupCompleted);
CREATE INDEX idx_users_setup_skipped ON Users(setupSkipped);
CREATE INDEX idx_users_profile_picture ON Users(profilePicture) WHERE profilePicture IS NOT NULL;
CREATE INDEX idx_users_2fa_enabled ON Users(twoFactorEnabled);
CREATE INDEX idx_users_2fa_setup_completed ON Users(twoFactorSetupCompleted);

-- Password reset indexes
CREATE INDEX idx_users_password_reset_token ON Users(passwordResetToken) WHERE passwordResetToken IS NOT NULL;
CREATE INDEX idx_users_password_reset_expiry ON Users(passwordResetTokenExpiry) WHERE passwordResetTokenExpiry IS NOT NULL;

-- OAuth indexes
CREATE INDEX idx_users_provider ON Users(provider);
CREATE INDEX idx_users_provider_id ON Users(providerID);
CREATE INDEX idx_users_provider_email ON Users(providerEmail);
CREATE INDEX idx_users_provider_combo ON Users(provider, providerID);

-- Customers table indexes
CREATE INDEX idx_customers_music_interest ON Customers USING GIN(musicInterestTypes);
CREATE INDEX idx_customers_country ON Customers(country);
CREATE INDEX idx_customers_premium ON Customers(isPremium);
CREATE INDEX idx_customers_last_active ON Customers(lastActiveAt);
CREATE INDEX idx_customers_language ON Customers(preferredLanguage);
CREATE INDEX idx_customers_audio_quality ON Customers(preferredAudioQuality);

-- LyricsSearchResults table indexes
CREATE INDEX idx_lyrics_search_external_id ON LyricsSearchResults(externalID);
CREATE INDEX idx_lyrics_search_track_name ON LyricsSearchResults(trackName);
CREATE INDEX idx_lyrics_search_artist_name ON LyricsSearchResults(artistName);
CREATE INDEX idx_lyrics_search_album_name ON LyricsSearchResults(albumName);
CREATE INDEX idx_lyrics_search_usage_count ON LyricsSearchResults(usageCount);
CREATE INDEX idx_lyrics_search_last_used ON LyricsSearchResults(lastUsedAt);
CREATE INDEX idx_lyrics_search_source_api ON LyricsSearchResults(sourceAPI);
CREATE INDEX idx_lyrics_search_fetched_at ON LyricsSearchResults(fetchedAt);

-- Songs table indexes
CREATE INDEX idx_songs_artist ON Songs(artistName);
CREATE INDEX idx_songs_genre ON Songs(genre);
CREATE INDEX idx_songs_active ON Songs(isActive);
CREATE INDEX idx_songs_popularity ON Songs(popularity);
CREATE INDEX idx_songs_play_count ON Songs(playCount);
CREATE INDEX idx_songs_created_at ON Songs(createdAt);
CREATE INDEX idx_songs_created_by ON Songs(createdBy);
CREATE INDEX idx_songs_updated_by ON Songs(updatedBy);
CREATE INDEX idx_songs_lyrics_search_result ON Songs(lyricsSearchResultID) WHERE lyricsSearchResultID IS NOT NULL;
CREATE INDEX idx_songs_source_status ON Songs(sourceStatus);
CREATE INDEX idx_songs_source_status_lyrics ON Songs(sourceStatus, lyricsSearchResultID) WHERE sourceStatus = 'from_lyrics_search';

-- Playlists table indexes
CREATE INDEX idx_playlists_user ON Playlists(userID);
CREATE INDEX idx_playlists_public ON Playlists(isPublic);
CREATE INDEX idx_playlists_active ON Playlists(isActive);
CREATE INDEX idx_playlists_play_count ON Playlists(playCount);
CREATE INDEX idx_playlists_favorite_count ON Playlists(favoriteCount);

-- PlaylistSongs table indexes
CREATE INDEX idx_playlist_songs_playlist ON PlaylistSongs(playlistID);
CREATE INDEX idx_playlist_songs_song ON PlaylistSongs(songID);
CREATE INDEX idx_playlist_songs_added_by ON PlaylistSongs(addedBy);
CREATE INDEX idx_playlist_songs_active ON PlaylistSongs(isActive);
CREATE INDEX idx_playlist_songs_sort ON PlaylistSongs(sortOrder);

-- History table indexes
CREATE INDEX idx_history_user ON History(userID);
CREATE INDEX idx_history_timestamp ON History(timeStamp);
CREATE INDEX idx_history_song ON History(songID);
CREATE INDEX idx_history_processing ON History(processingID);
CREATE INDEX idx_history_device ON History(deviceInfo);
CREATE INDEX idx_history_duration ON History(playDuration);
CREATE INDEX idx_history_action_type ON History(actionType);

-- SongAIProcessing table indexes
CREATE INDEX idx_ai_processing_song ON SongAIProcessing(songID);
CREATE INDEX idx_ai_processing_model ON SongAIProcessing(aiModel);
CREATE INDEX idx_ai_processing_status ON SongAIProcessing(status);
CREATE INDEX idx_ai_processing_mood ON SongAIProcessing(moodType);
CREATE INDEX idx_ai_processing_rating ON SongAIProcessing(averageRating);
CREATE INDEX idx_ai_processing_created ON SongAIProcessing(createdAt);
CREATE INDEX idx_ai_processing_created_by ON SongAIProcessing(createdBy);
CREATE INDEX idx_ai_processing_updated_by ON SongAIProcessing(updatedBy);
CREATE INDEX idx_ai_processing_share_status ON SongAIProcessing(shareStatus);
CREATE INDEX idx_ai_processing_approval_status ON SongAIProcessing(approvalStatus);
CREATE INDEX idx_ai_processing_approved_by ON SongAIProcessing(approvedBy);
CREATE INDEX idx_ai_processing_public ON SongAIProcessing(isPublic);
CREATE INDEX idx_ai_processing_approved_at ON SongAIProcessing(approvedAt);
CREATE INDEX idx_ai_processing_youtube_video_id ON SongAIProcessing(youtubeVideoId) WHERE youtubeVideoId IS NOT NULL;
CREATE INDEX idx_ai_processing_sync_confirmed ON SongAIProcessing(syncConfirmed) WHERE syncConfirmed = TRUE;
CREATE INDEX idx_ai_processing_song_start_time ON SongAIProcessing(songStartTime) WHERE songStartTime IS NOT NULL;

-- AIProcessingRatings table indexes
CREATE INDEX idx_ratings_processing ON AIProcessingRatings(processingID);
CREATE INDEX idx_ratings_user ON AIProcessingRatings(userID);
CREATE INDEX idx_ratings_rating ON AIProcessingRatings(rating);
CREATE INDEX idx_ratings_comment ON AIProcessingRatings(comment) WHERE comment IS NOT NULL;

-- UserSessions table indexes
CREATE INDEX idx_sessions_user ON UserSessions(userID);
CREATE INDEX idx_sessions_active ON UserSessions(isActive);
CREATE INDEX idx_sessions_expires ON UserSessions(expiresAt);
CREATE INDEX idx_sessions_device ON UserSessions(deviceInfo);

-- UserTwoFactorAuth table indexes
CREATE INDEX idx_2fa_user ON UserTwoFactorAuth(userID);
CREATE INDEX idx_2fa_enabled ON UserTwoFactorAuth(isEnabled);
CREATE INDEX idx_2fa_setup_completed ON UserTwoFactorAuth(setupCompleted);
CREATE INDEX idx_2fa_setup_step ON UserTwoFactorAuth(setupStep);
CREATE INDEX idx_2fa_locked ON UserTwoFactorAuth(isLocked);
CREATE INDEX idx_2fa_locked_until ON UserTwoFactorAuth(lockedUntil);
CREATE INDEX idx_2fa_failed_attempts ON UserTwoFactorAuth(failedAttempts);
CREATE INDEX idx_2fa_last_used ON UserTwoFactorAuth(lastUsedAt);

-- TwoFactorVerification table indexes
CREATE INDEX idx_2fa_verification_user ON TwoFactorVerification(userID);
CREATE INDEX idx_2fa_verification_session ON TwoFactorVerification(sessionID);
CREATE INDEX idx_2fa_verification_type ON TwoFactorVerification(verificationType);
CREATE INDEX idx_2fa_verification_successful ON TwoFactorVerification(isSuccessful);
CREATE INDEX idx_2fa_verification_created ON TwoFactorVerification(createdAt);
CREATE INDEX idx_2fa_verification_ip ON TwoFactorVerification(ipAddress);
CREATE INDEX idx_2fa_verification_device ON TwoFactorVerification(deviceInfo);

-- Notifications table indexes
CREATE INDEX idx_notifications_user ON Notifications(userID);
CREATE INDEX idx_notifications_type ON Notifications(type);
CREATE INDEX idx_notifications_read ON Notifications(isRead);
CREATE INDEX idx_notifications_created ON Notifications(createdAt);

-- UserFavorites table indexes
CREATE INDEX idx_favorites_user ON UserFavorites(userID);
CREATE INDEX idx_favorites_type ON UserFavorites(favoriteType);
CREATE INDEX idx_favorites_song ON UserFavorites(songID);
CREATE INDEX idx_favorites_processing ON UserFavorites(processingID);
CREATE INDEX idx_favorites_playlist ON UserFavorites(playlistID);

-- Reports table indexes
CREATE INDEX idx_reports_user ON Reports(userID);
CREATE INDEX idx_reports_type ON Reports(reportType);
CREATE INDEX idx_reports_status ON Reports(status);
CREATE INDEX idx_reports_created ON Reports(createdAt);

-- =========================
-- Create Triggers for updatedAt timestamps
-- =========================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updatedAt column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON Users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON Customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lyrics_search_results_updated_at BEFORE UPDATE ON LyricsSearchResults
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON Songs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON Playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_processing_updated_at BEFORE UPDATE ON SongAIProcessing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON AIProcessingRatings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_history_updated_at BEFORE UPDATE ON History
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON UserSessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_2fa_updated_at BEFORE UPDATE ON UserTwoFactorAuth
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON Notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_favorites_updated_at BEFORE UPDATE ON UserFavorites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON Reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================
-- Create Function to Normalize Email to Lowercase
-- =========================
CREATE OR REPLACE FUNCTION normalize_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Convert email to lowercase before insert/update
    IF NEW.email IS NOT NULL THEN
        NEW.email = LOWER(NEW.email);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION normalize_username()
RETURNS TRIGGER AS $$
BEGIN
    -- Convert username to lowercase before insert/update
    IF NEW.username IS NOT NULL THEN
        NEW.username = LOWER(NEW.username);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-normalize email
CREATE TRIGGER normalize_email_trigger 
    BEFORE INSERT OR UPDATE ON Users
    FOR EACH ROW EXECUTE FUNCTION normalize_email();

-- Create trigger to auto-normalize username
CREATE TRIGGER normalize_username_trigger 
    BEFORE INSERT OR UPDATE ON Users
    FOR EACH ROW EXECUTE FUNCTION normalize_username();

-- =========================
-- Create Function to Update Rating Statistics
-- =========================
CREATE OR REPLACE FUNCTION update_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_processing_id UUID;
BEGIN
    -- Determine which processingID to update based on operation type
    IF TG_OP = 'DELETE' THEN
        target_processing_id := OLD.processingid;
    ELSE
        target_processing_id := NEW.processingid;
    END IF;
    
    -- Update rating statistics in SongAIProcessing table
    UPDATE songaiprocessing 
    SET 
        totalratings = (
            SELECT COUNT(*) 
            FROM aiprocessingratings 
            WHERE processingid = target_processing_id
        ),
        averagerating = (
            SELECT COALESCE(ROUND(AVG(rating::DECIMAL), 2), 0.00)
            FROM aiprocessingratings 
            WHERE processingid = target_processing_id
        ),
        starcount = (
            SELECT COALESCE(ROUND(AVG(rating::DECIMAL))::INT, 0)
            FROM aiprocessingratings 
            WHERE processingid = target_processing_id
        ),
        updatedat = CURRENT_TIMESTAMP
    WHERE processingid = target_processing_id;
    
    -- Return appropriate row based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update rating statistics
CREATE TRIGGER update_rating_stats_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON aiprocessingratings
    FOR EACH ROW EXECUTE FUNCTION update_rating_stats();

-- =========================
-- Create Function to Update LyricsSearchResults Usage Statistics
-- =========================
CREATE OR REPLACE FUNCTION update_lyrics_search_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- On INSERT: increment usage count for new reference
    IF TG_OP = 'INSERT' THEN
        IF NEW.lyricsSearchResultID IS NOT NULL THEN
            UPDATE LyricsSearchResults 
            SET 
                usageCount = usageCount + 1,
                lastUsedAt = CURRENT_TIMESTAMP,
                updatedAt = CURRENT_TIMESTAMP
            WHERE lyricsSearchResultID = NEW.lyricsSearchResultID;
        END IF;
        RETURN NEW;
    END IF;
    
    -- On UPDATE: handle changes in lyricsSearchResultID
    IF TG_OP = 'UPDATE' THEN
        -- If lyricsSearchResultID changed
        IF (OLD.lyricsSearchResultID IS DISTINCT FROM NEW.lyricsSearchResultID) THEN
            -- Update old record (if existed)
            IF OLD.lyricsSearchResultID IS NOT NULL THEN
                -- Note: We don't decrement usageCount as we want to keep historical usage
                UPDATE LyricsSearchResults 
                SET updatedAt = CURRENT_TIMESTAMP
                WHERE lyricsSearchResultID = OLD.lyricsSearchResultID;
            END IF;
            
            -- Update new record (if exists)
            IF NEW.lyricsSearchResultID IS NOT NULL THEN
                UPDATE LyricsSearchResults 
                SET 
                    usageCount = usageCount + 1,
                    lastUsedAt = CURRENT_TIMESTAMP,
                    updatedAt = CURRENT_TIMESTAMP
                WHERE lyricsSearchResultID = NEW.lyricsSearchResultID;
            END IF;
        ELSIF NEW.lyricsSearchResultID IS NOT NULL THEN
            -- If same lyricsSearchResultID but other fields changed, update lastUsedAt
            UPDATE LyricsSearchResults 
            SET 
                lastUsedAt = CURRENT_TIMESTAMP,
                updatedAt = CURRENT_TIMESTAMP
            WHERE lyricsSearchResultID = NEW.lyricsSearchResultID;
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update lyrics search usage statistics
CREATE TRIGGER update_lyrics_search_usage_stats_trigger 
    AFTER INSERT OR UPDATE ON Songs
    FOR EACH ROW EXECUTE FUNCTION update_lyrics_search_usage_stats();

-- =========================
-- Table: Prompts (AI Prompts for Translation and Mood Analysis)
-- =========================
CREATE TABLE Prompts (
    promptID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promptType VARCHAR(50) NOT NULL, -- 'translation', 'mood', 'both'
    promptText TEXT NOT NULL,
    temp TEXT, -- Temporary prompt text for testing
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_prompt_type CHECK (promptType IN ('translation', 'mood', 'both'))
);

-- Trigger for Prompts updatedAt
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON Prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================
-- Table: SystemLogs (Application Logging)
-- =========================
CREATE TABLE SystemLogs (
    logID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL, -- 'info', 'error', 'warn', 'debug'
    category VARCHAR(50), -- 'api', 'database', 'auth', 'admin', etc.
    message TEXT NOT NULL,
    details JSONB,
    
    -- Request Context
    method VARCHAR(10),
    path VARCHAR(500),
    statusCode INT,
    
    -- User Context
    userID UUID,
    userRole VARCHAR(20),
    
    -- System Context
    ipAddress INET,
    userAgent TEXT,
    requestID VARCHAR(100),
    
    -- Error Context
    errorStack TEXT,
    errorCode VARCHAR(50),
    
    -- Performance
    duration INT,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE SET NULL,
    CONSTRAINT check_level CHECK (level IN ('info', 'error', 'warn', 'debug'))
);

-- SystemLogs table indexes
CREATE INDEX idx_logs_level ON SystemLogs(level);
CREATE INDEX idx_logs_category ON SystemLogs(category);
CREATE INDEX idx_logs_created ON SystemLogs(createdAt DESC);
CREATE INDEX idx_logs_user ON SystemLogs(userID) WHERE userID IS NOT NULL;
