-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Boards (e.g., /tech/, /random/)
CREATE TABLE boards (
                        id SERIAL PRIMARY KEY,
                        short_name VARCHAR(10) UNIQUE NOT NULL, -- e.g., "g", "b", "pol"
                        name VARCHAR(100) NOT NULL,
                        description TEXT,
                        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for boards
CREATE TRIGGER set_timestamp_boards
    BEFORE UPDATE ON boards
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();


-- Threads (Original Posts)
CREATE TABLE threads (
                         id SERIAL PRIMARY KEY,
                         board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
                         subject VARCHAR(255),
                         comment TEXT NOT NULL,
                         poster_name VARCHAR(50) DEFAULT 'Anonymous',

                         image_original_filename VARCHAR(255) NOT NULL,
                         image_filename_stored VARCHAR(255) NOT NULL UNIQUE, -- UUID based or similar
                         image_mimetype VARCHAR(50) NOT NULL,
                         image_filesize_bytes INTEGER NOT NULL,
                         image_width INTEGER,
                         image_height INTEGER,

                         thumbnail_filename_stored VARCHAR(255) NOT NULL UNIQUE, -- UUID based or similar for thumbnail

                         created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                         last_bumped_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- Updated on new reply
                         ip_address INET, -- Store for moderation purposes

    -- For simple password-based post deletion (optional)
                         deletion_password_hash VARCHAR(255) -- Store a hash of a user-provided password
);

-- Index for faster lookup of threads by board and bump order
CREATE INDEX idx_threads_board_bump ON threads (board_id, last_bumped_at DESC);
CREATE INDEX idx_threads_last_bumped ON threads (last_bumped_at DESC);


-- Replies
CREATE TABLE replies (
                         id SERIAL PRIMARY KEY,
                         thread_id INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
                         parent_reply_id INTEGER REFERENCES replies(id) ON DELETE SET NULL, -- For nested replies, optional
                         comment TEXT NOT NULL,
                         poster_name VARCHAR(50) DEFAULT 'Anonymous',

                         image_original_filename VARCHAR(255),
                         image_filename_stored VARCHAR(255) UNIQUE,
                         image_mimetype VARCHAR(50),
                         image_filesize_bytes INTEGER,
                         image_width INTEGER,
                         image_height INTEGER,
                         thumbnail_filename_stored VARCHAR(255) UNIQUE,

                         created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                         ip_address INET,
                         deletion_password_hash VARCHAR(255)
);

-- Index for faster lookup of replies by thread
CREATE INDEX idx_replies_thread ON replies (thread_id, created_at ASC);

-- Trigger to update thread's last_bumped_at on new reply
CREATE OR REPLACE FUNCTION update_thread_bump_time()
RETURNS TRIGGER AS $$
BEGIN
UPDATE threads
SET last_bumped_at = CURRENT_TIMESTAMP
WHERE id = NEW.thread_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_bump
    AFTER INSERT ON replies
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_bump_time();

-- (Optional) For moderation: Bans
CREATE TABLE bans (
                      id SERIAL PRIMARY KEY,
                      ip_address INET NOT NULL,
                      reason TEXT,
                      expires_at TIMESTAMPTZ,
                      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                      UNIQUE (ip_address) -- Assuming one active ban per IP
);

-- (Optional) For moderation: Reports
CREATE TABLE reports (
                         id SERIAL PRIMARY KEY,
                         thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
                         reply_id INTEGER REFERENCES replies(id) ON DELETE CASCADE,
                         reason TEXT NOT NULL,
                         reporter_ip INET,
                         created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                         resolved_at TIMESTAMPTZ,
                         CHECK (thread_id IS NOT NULL OR reply_id IS NOT NULL) -- Must report either a thread or a reply
);