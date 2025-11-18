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
    uploaded_by BINARY(16),
    CONSTRAINT fk_papers_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Ensure legacy databases also have the uploader column + constraint
ALTER TABLE papers
    ADD COLUMN IF NOT EXISTS uploaded_by BINARY(16);

SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'papers'
      AND CONSTRAINT_NAME = 'fk_papers_user'
);

SET @ddl = IF(
    @fk_exists = 0,
    'ALTER TABLE papers ADD CONSTRAINT fk_papers_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL',
    'SELECT \"fk_papers_user already present\"'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Paper-Categories junction table (if not exists)
CREATE TABLE IF NOT EXISTS paper_categories (
    paper_id BINARY(16),
    category_id BINARY(16),
    PRIMARY KEY (paper_id, category_id),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;
