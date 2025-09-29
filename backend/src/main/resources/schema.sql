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
    uploaded_by BINARY(16)
);

-- Paper-Categories junction table (if not exists)
CREATE TABLE IF NOT EXISTS paper_categories (
    paper_id BINARY(16),
    category_id BINARY(16),
    PRIMARY KEY (paper_id, category_id),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;
