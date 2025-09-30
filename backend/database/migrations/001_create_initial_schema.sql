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
    createdBy UUID, -- who added this song
    updatedBy UUID, -- who last updated this song
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES Users(userID) ON DELETE SET NULL,
    FOREIGN KEY (updatedBy) REFERENCES Users(userID) ON DELETE SET NULL,
    FOREIGN KEY (approvedBy) REFERENCES Users(userID) ON DELETE SET NULL
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
    originalLanguage VARCHAR(10),
    targetLanguage VARCHAR(10),
    translationConfidence FLOAT DEFAULT 0.0,
    
    -- Mood Analysis Results
    moodType VARCHAR(50),
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
    FOREIGN KEY (songID) REFERENCES Songs(songID) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES Users(userID) ON DELETE SET NULL,
    FOREIGN KEY (updatedBy) REFERENCES Users(userID) ON DELETE SET NULL
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
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (songID) REFERENCES Songs(songID) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (processingID) REFERENCES SongAIProcessing(processingID) ON DELETE SET NULL
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
    favoriteType VARCHAR(20) NOT NULL, -- 'song', 'playlist'
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (songID) REFERENCES Songs(songID) ON DELETE CASCADE,
    FOREIGN KEY (playlistID) REFERENCES Playlists(playlistID) ON DELETE CASCADE,
    CONSTRAINT check_favorite_type CHECK (favoriteType IN ('song', 'playlist')),
    CONSTRAINT check_favorite_target CHECK (
        (favoriteType = 'song' AND songID IS NOT NULL AND playlistID IS NULL) OR
        (favoriteType = 'playlist' AND playlistID IS NOT NULL AND songID IS NULL)
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

-- Songs table indexes
CREATE INDEX idx_songs_artist ON Songs(artistName);
CREATE INDEX idx_songs_genre ON Songs(genre);
CREATE INDEX idx_songs_active ON Songs(isActive);
CREATE INDEX idx_songs_popularity ON Songs(popularity);
CREATE INDEX idx_songs_play_count ON Songs(playCount);
CREATE INDEX idx_songs_created_at ON Songs(createdAt);
CREATE INDEX idx_songs_created_by ON Songs(createdBy);
CREATE INDEX idx_songs_updated_by ON Songs(updatedBy);

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

-- SongAIProcessing table indexes
CREATE INDEX idx_ai_processing_song ON SongAIProcessing(songID);
CREATE INDEX idx_ai_processing_model ON SongAIProcessing(aiModel);
CREATE INDEX idx_ai_processing_status ON SongAIProcessing(status);
CREATE INDEX idx_ai_processing_mood ON SongAIProcessing(moodType);
CREATE INDEX idx_ai_processing_rating ON SongAIProcessing(averageRating);
CREATE INDEX idx_ai_processing_created ON SongAIProcessing(createdAt);
CREATE INDEX idx_ai_processing_created_by ON SongAIProcessing(createdBy);
CREATE INDEX idx_ai_processing_updated_by ON SongAIProcessing(updatedBy);

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

-- Notifications table indexes
CREATE INDEX idx_notifications_user ON Notifications(userID);
CREATE INDEX idx_notifications_type ON Notifications(type);
CREATE INDEX idx_notifications_read ON Notifications(isRead);
CREATE INDEX idx_notifications_created ON Notifications(createdAt);

-- UserFavorites table indexes
CREATE INDEX idx_favorites_user ON UserFavorites(userID);
CREATE INDEX idx_favorites_type ON UserFavorites(favoriteType);
CREATE INDEX idx_favorites_song ON UserFavorites(songID);
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
BEGIN
    -- Update rating statistics in SongAIProcessing table
    UPDATE SongAIProcessing 
    SET 
        totalRatings = (
            SELECT COUNT(*) 
            FROM AIProcessingRatings 
            WHERE processingID = NEW.processingID
        ),
        averageRating = (
            SELECT ROUND(AVG(rating::DECIMAL), 2) 
            FROM AIProcessingRatings 
            WHERE processingID = NEW.processingID
        ),
        starCount = (
            SELECT ROUND(AVG(rating::DECIMAL))::INT 
            FROM AIProcessingRatings 
            WHERE processingID = NEW.processingID
        ),
        updatedAt = CURRENT_TIMESTAMP
    WHERE processingID = NEW.processingID;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update rating statistics
CREATE TRIGGER update_rating_stats_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON AIProcessingRatings
    FOR EACH ROW EXECUTE FUNCTION update_rating_stats();
