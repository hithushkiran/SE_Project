-- =============================================
-- ResearchHub Database Schema
-- This ensures tables are created in the right order
-- Spring Boot will run this before data.sql
-- =============================================

-- Note: Hibernate usually creates tables automatically, but this ensures proper order
SET FOREIGN_KEY_CHECKS = 0;

-- Categories table (if not exists)
CREATE TABLE IF NOT EXISTS categories (
    id BINARY(16) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(500)
);

-- Papers table (if not exists)  
CREATE TABLE IF NOT EXISTS papers (
    id BINARY(16) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    abstract_text TEXT,
    publication_year INT,
    uploaded_at DATETIME NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    view_count BIGINT NOT NULL DEFAULT 0,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    reviewed_at DATETIME,
    reviewed_by BINARY(16),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Paper-Categories junction table (if not exists)
CREATE TABLE IF NOT EXISTS paper_categories (
    paper_id BINARY(16),
    category_id BINARY(16),
    PRIMARY KEY (paper_id, category_id),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Comments table (if not exists)
CREATE TABLE IF NOT EXISTS comments (
    id BINARY(16) PRIMARY KEY,
    content TEXT NOT NULL,
    author_id BINARY(16) NOT NULL,
    paper_id BINARY(16) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    edited BOOLEAN DEFAULT FALSE,
    status ENUM('APPROVED', 'REJECTED', 'PENDING_REVIEW') NOT NULL DEFAULT 'APPROVED',
    moderation_reason TEXT,
    moderated_at DATETIME,
    moderated_by BINARY(16),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (moderated_by) REFERENCES users(id)
);

-- Notifications table (if not exists)
CREATE TABLE IF NOT EXISTS notifications (
    id BINARY(16) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('PAPER_SUBMITTED', 'PAPER_APPROVED', 'PAPER_REJECTED', 'COMMENT_REPORTED', 'COMMENT_APPROVED', 'COMMENT_REJECTED', 'USER_REGISTERED', 'USER_SUSPENDED', 'USER_ACTIVATED', 'SYSTEM_ANNOUNCEMENT') NOT NULL,
    user_id BINARY(16) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    read_at DATETIME,
    related_entity_id BINARY(16),
    related_entity_type ENUM('PAPER', 'COMMENT', 'USER'),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;
