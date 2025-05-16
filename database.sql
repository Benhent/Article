-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Content types enum
CREATE TYPE content_type AS ENUM ('article', 'book', 'journal', 'user_post');

-- File types enum
CREATE TYPE file_type AS ENUM ('pdf', 'docx', 'doc', 'epub', 'mobi', 'txt', 'rtf', 'other');

-- Users table (core user authentication data)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url TEXT,  -- URL to profile picture
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'editor', 'author')),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User info table (additional user details)
CREATE TABLE user_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    birthday DATE,
    gender VARCHAR(50) CHECK (gender IN ('male', 'female', 'other')),
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- User posts table
CREATE TABLE user_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT, -- Short description or summary
    status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
    visibility VARCHAR(50) DEFAULT 'public', -- public, private, friends
    featured_image TEXT, -- URL to image
    view_count INTEGER DEFAULT 0, -- Track views directly in the post table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- User relationships (followers & following)
CREATE TABLE user_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id)
);

-- User favorites table (modified to only favorite user posts)
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    post_id UUID NOT NULL REFERENCES user_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    UNIQUE(user_id, post_id)
);

-- User bookmarks table (modified to only bookmark user posts)
CREATE TABLE user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    post_id UUID NOT NULL REFERENCES user_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    UNIQUE(user_id, post_id)
);

-- Comments table (modified to only comment on user posts)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    post_id UUID NOT NULL REFERENCES user_posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id), -- For nested comments
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Institutions table
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Authors table
CREATE TABLE authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    academic_title VARCHAR(100),
    email VARCHAR(255) CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}$'),
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    publish_date DATE,
    language VARCHAR(50),
    citation_count INTEGER DEFAULT 0,
    subject_classification VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Books table
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) CHECK (char_length(isbn) IN (10, 13)),
    language VARCHAR(50),
    publish_date DATE,
    publisher VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Journals table
CREATE TABLE journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    issn VARCHAR(20),
    language VARCHAR(50),
    publish_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

-- Tags mapping table (modified to only tag user posts)
CREATE TABLE post_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_id UUID NOT NULL REFERENCES tags(id),
    post_id UUID NOT NULL REFERENCES user_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    UNIQUE(tag_id, post_id)
);

-- Author Articles junction table
CREATE TABLE author_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    UNIQUE(author_id, article_id)
);

-- Author Books junction table
CREATE TABLE author_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE(author_id, book_id)
);

-- Article Journals junction table
CREATE TABLE article_journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    UNIQUE(article_id, journal_id)
);

-- Files table for storing document files
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- URL or path to the file in storage
    file_type file_type NOT NULL,
    file_size BIGINT, -- Size in bytes
    mime_type VARCHAR(100),
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('article', 'book', 'journal')),
    content_id UUID NOT NULL, -- ID of the related content (article, book, or journal)
    version VARCHAR(50), -- For version control
    is_public BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_type, content_id, version) -- Ensure unique version per content
);

-- Verification codes table
CREATE TABLE verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('email_verification', 'password_reset')),
    expires_at BIGINT NOT NULL, -- Lưu timestamp dạng UNIX
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT FALSE,
    used_at BIGINT, -- Nếu mã đã dùng, lưu thời gian UNIX
    UNIQUE(user_id, type) -- Đảm bảo một loại mã chỉ tồn tại một bản ghi cho mỗi user
);

-- Author requests table
CREATE TABLE author_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    academic_title VARCHAR(100),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    email VARCHAR(255) CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}$'),
    bio TEXT,
    reason_for_request TEXT,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Institution information in author requests
CREATE TABLE author_request_institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_request_id UUID NOT NULL REFERENCES author_requests(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Book information in author requests
CREATE TABLE author_request_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_request_id UUID NOT NULL REFERENCES author_requests(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20),
    language VARCHAR(50),
    publish_date DATE,
    publisher VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Article information in author requests
CREATE TABLE author_request_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_request_id UUID NOT NULL REFERENCES author_requests(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    publish_date DATE,
    language VARCHAR(50),
    subject_classification VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Journal information in author requests
CREATE TABLE author_request_journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_request_id UUID NOT NULL REFERENCES author_requests(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    issn VARCHAR(20),
    language VARCHAR(50),
    publish_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) on necessary tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_request_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_request_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_request_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_request_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Policies for Row Level Security (RLS)
CREATE POLICY insert_books ON books
FOR INSERT WITH CHECK (auth.uid() = updated_by);
CREATE POLICY insert_articles ON articles
FOR INSERT WITH CHECK (auth.uid() = updated_by);
CREATE POLICY insert_journals ON journals
FOR INSERT WITH CHECK (auth.uid() = updated_by);
CREATE POLICY insert_user_posts ON user_posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_books ON books
FOR UPDATE USING (auth.uid() = updated_by);
CREATE POLICY update_articles ON articles
FOR UPDATE USING (auth.uid() = updated_by);
CREATE POLICY update_journals ON journals
FOR UPDATE USING (auth.uid() = updated_by);
CREATE POLICY update_user_posts ON user_posts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY select_comments ON comments
FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY insert_comments ON comments
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_comments ON comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY select_own_users ON users
FOR SELECT USING (auth.uid() = id);
CREATE POLICY select_all_users_for_admin ON users
FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Người dùng chỉ có thể xem danh sách yêu thích của chính họ
CREATE POLICY select_user_favorites ON user_favorites
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY insert_user_favorites ON user_favorites
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_user_favorites ON user_favorites
FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY delete_user_favorites ON user_favorites
FOR DELETE USING (auth.uid() = user_id);

-- Người dùng chỉ có thể xem danh sách đánh dấu của chính họ
CREATE POLICY select_user_bookmarks ON user_bookmarks
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY insert_user_bookmarks ON user_bookmarks
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_user_bookmarks ON user_bookmarks
FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY delete_user_bookmarks ON user_bookmarks
FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for verification_codes
CREATE POLICY select_own_verification_codes ON verification_codes
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY insert_own_verification_codes ON verification_codes
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_verification_codes ON verification_codes
FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY select_all_verification_codes_for_admin ON verification_codes
FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY update_verification_codes_for_admin ON verification_codes
FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for author_requests
CREATE POLICY select_own_author_requests ON author_requests
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY insert_own_author_requests ON author_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_author_requests ON author_requests
FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');
CREATE POLICY select_all_author_requests_for_admin ON author_requests
FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY update_author_requests_for_admin ON author_requests
FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Similar policies for the related tables
CREATE POLICY select_own_author_request_institutions ON author_request_institutions
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM author_requests WHERE id = author_request_id));
CREATE POLICY insert_own_author_request_institutions ON author_request_institutions
FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM author_requests WHERE id = author_request_id));
CREATE POLICY select_all_author_request_institutions_for_admin ON author_request_institutions
FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY select_own_author_request_books ON author_request_books
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM author_requests WHERE id = author_request_id));
CREATE POLICY insert_own_author_request_books ON author_request_books
FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM author_requests WHERE id = author_request_id));
CREATE POLICY select_all_author_request_books_for_admin ON author_request_books
FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY select_own_author_request_articles ON author_request_articles
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM author_requests WHERE id = author_request_id));
CREATE POLICY insert_own_author_request_articles ON author_request_articles
FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM author_requests WHERE id = author_request_id));
CREATE POLICY select_all_author_request_articles_for_admin ON author_request_articles
FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY select_own_author_request_journals ON author_request_journals
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM author_requests WHERE id = author_request_id));
CREATE POLICY insert_own_author_request_journals ON author_request_journals
FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM author_requests WHERE id = author_request_id));
CREATE POLICY select_all_author_request_journals_for_admin ON author_request_journals
FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- RLS Policies for files
-- Authors can view their own files
CREATE POLICY select_own_files ON files
FOR SELECT USING (
    (uploaded_by = auth.uid()) OR
    (content_type = 'article' AND content_id IN (
        SELECT a.id FROM articles a
        JOIN author_articles aa ON a.id = aa.article_id
        JOIN authors au ON aa.author_id = au.id
        WHERE au.user_id = auth.uid()
    )) OR
    (content_type = 'book' AND content_id IN (
        SELECT b.id FROM books b
        JOIN author_books ab ON b.id = ab.book_id
        JOIN authors au ON ab.author_id = au.id
        WHERE au.user_id = auth.uid()
    )) OR
    (content_type = 'journal' AND content_id IN (
        SELECT j.id FROM journals j
        WHERE j.updated_by = auth.uid()
    )) OR
    (is_public = true)
);

-- Authors can upload files for their own content
CREATE POLICY insert_own_files ON files
FOR INSERT WITH CHECK (
    (uploaded_by = auth.uid()) AND
    (
        (content_type = 'article' AND content_id IN (
            SELECT a.id FROM articles a
            JOIN author_articles aa ON a.id = aa.article_id
            JOIN authors au ON aa.author_id = au.id
            WHERE au.user_id = auth.uid()
        )) OR
        (content_type = 'book' AND content_id IN (
            SELECT b.id FROM books b
            JOIN author_books ab ON b.id = ab.book_id
            JOIN authors au ON ab.author_id = au.id
            WHERE au.user_id = auth.uid()
        )) OR
        (content_type = 'journal' AND content_id IN (
            SELECT j.id FROM journals j
            WHERE j.updated_by = auth.uid()
        ))
    )
);

-- Authors can update their own files
CREATE POLICY update_own_files ON files
FOR UPDATE USING (
    (uploaded_by = auth.uid()) AND
    (
        (content_type = 'article' AND content_id IN (
            SELECT a.id FROM articles a
            JOIN author_articles aa ON a.id = aa.article_id
            JOIN authors au ON aa.author_id = au.id
            WHERE au.user_id = auth.uid()
        )) OR
        (content_type = 'book' AND content_id IN (
            SELECT b.id FROM books b
            JOIN author_books ab ON b.id = ab.book_id
            JOIN authors au ON ab.author_id = au.id
            WHERE au.user_id = auth.uid()
        )) OR
        (content_type = 'journal' AND content_id IN (
            SELECT j.id FROM journals j
            WHERE j.updated_by = auth.uid()
        ))
    )
);

-- Authors can delete their own files
CREATE POLICY delete_own_files ON files
FOR DELETE USING (
    (uploaded_by = auth.uid()) AND
    (
        (content_type = 'article' AND content_id IN (
            SELECT a.id FROM articles a
            JOIN author_articles aa ON a.id = aa.article_id
            JOIN authors au ON aa.author_id = au.id
            WHERE au.user_id = auth.uid()
        )) OR
        (content_type = 'book' AND content_id IN (
            SELECT b.id FROM books b
            JOIN author_books ab ON b.id = ab.book_id
            JOIN authors au ON ab.author_id = au.id
            WHERE au.user_id = auth.uid()
        )) OR
        (content_type = 'journal' AND content_id IN (
            SELECT j.id FROM journals j
            WHERE j.updated_by = auth.uid()
        ))
    )
);

-- Admins can view all files
CREATE POLICY select_all_files_for_admin ON files
FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

-- Admins can update all files
CREATE POLICY update_all_files_for_admin ON files
FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

-- Admins can delete all files
CREATE POLICY delete_all_files_for_admin ON files
FOR DELETE USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

-- Indexes for optimization
CREATE INDEX idx_user_relationships_following ON user_relationships(following_id);
CREATE INDEX idx_user_relationships_follower ON user_relationships(follower_id);
CREATE INDEX idx_post_tags ON post_tags(tag_id, post_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_author_articles ON author_articles(author_id, article_id);
CREATE INDEX idx_author_books ON author_books(author_id, book_id);
CREATE INDEX idx_article_journals ON article_journals(article_id, journal_id);
CREATE INDEX idx_articles_title ON articles(title);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_journals_name ON journals(name);
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_articles_subject ON articles(subject_classification);
CREATE INDEX idx_verification_codes_user_id ON verification_codes(user_id);
CREATE INDEX idx_verification_codes_code ON verification_codes(code);
CREATE INDEX idx_verification_codes_type ON verification_codes(type);
CREATE INDEX idx_verification_codes_expires_at ON verification_codes(expires_at);
CREATE INDEX idx_author_requests_user_id ON author_requests(user_id);
CREATE INDEX idx_author_requests_status ON author_requests(status);
CREATE INDEX idx_author_request_institutions_request_id ON author_request_institutions(author_request_id);
CREATE INDEX idx_author_request_books_request_id ON author_request_books(author_request_id);
CREATE INDEX idx_author_request_articles_request_id ON author_request_articles(author_request_id);
CREATE INDEX idx_author_request_journals_request_id ON author_request_journals(author_request_id);
CREATE INDEX idx_files_content ON files(content_type, content_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX idx_files_file_type ON files(file_type);
CREATE INDEX idx_files_is_public ON files(is_public);
CREATE INDEX idx_user_posts_user_id ON user_posts(user_id);
CREATE INDEX idx_user_posts_status ON user_posts(status);
CREATE INDEX idx_user_posts_visibility ON user_posts(visibility);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_post_id ON user_favorites(post_id);
CREATE INDEX idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_post_id ON user_bookmarks(post_id);

-- Hàm tự động xóa mã hết hạn
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM verification_codes 
    WHERE expires_at < EXTRACT(EPOCH FROM NOW())::BIGINT AND used = FALSE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger tự động dọn dẹp khi có mã mới
CREATE TRIGGER trigger_cleanup_expired_verification_codes
AFTER INSERT ON verification_codes
EXECUTE FUNCTION cleanup_expired_verification_codes();

-- Hàm tự động tạo excerpt khi tạo bài viết mới
CREATE OR REPLACE FUNCTION create_post_excerpt()
RETURNS TRIGGER AS $$
BEGIN
    -- Chỉ tạo excerpt nếu không được cung cấp
    IF NEW.excerpt IS NULL THEN
        NEW.excerpt = SUBSTRING(NEW.content, 1, 150) || '...';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger để tự động tạo excerpt khi tạo bài viết mới
CREATE TRIGGER trigger_create_post_excerpt
BEFORE INSERT ON user_posts
FOR EACH ROW
WHEN (NEW.excerpt IS NULL)
EXECUTE FUNCTION create_post_excerpt();

-- Hàm tự động cập nhật excerpt khi content thay đổi
CREATE OR REPLACE FUNCTION update_post_excerpt()
RETURNS TRIGGER AS $$
BEGIN
    -- Chỉ cập nhật excerpt nếu content thay đổi và excerpt không được cung cấp
    IF NEW.content IS DISTINCT FROM OLD.content AND NEW.excerpt IS NULL THEN
        NEW.excerpt = SUBSTRING(NEW.content, 1, 150) || '...';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo trigger để tự động cập nhật excerpt khi content thay đổi
CREATE TRIGGER trigger_update_post_excerpt
BEFORE UPDATE ON user_posts
FOR EACH ROW
WHEN (NEW.content IS DISTINCT FROM OLD.content)
EXECUTE FUNCTION update_post_excerpt();