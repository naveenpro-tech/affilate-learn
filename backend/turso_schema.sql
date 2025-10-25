-- ============================================================================
-- TURSO DATABASE SCHEMA
-- ============================================================================
-- This is the authoritative schema for the Turso cloud database.
-- Generated from SQLAlchemy models - models are the source of truth.
-- Compatible with Turso/LibSQL (SQLite dialect)
-- ============================================================================

-- ============================================================================
-- CORE TABLES (No dependencies or self-referential only)
-- ============================================================================

-- Users table (self-referential FK)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    linkedin_url TEXT,
    referral_code TEXT NOT NULL UNIQUE,
    referred_by_id INTEGER,
    is_active INTEGER DEFAULT 1,
    is_admin INTEGER DEFAULT 0,
    email_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    verification_token_expires TIMESTAMP,
    reset_token TEXT,
    reset_token_expires TIMESTAMP,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'India',
    onboarding_completed INTEGER DEFAULT 0,
    onboarding_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referred_by_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS ix_users_id ON users(id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_referral_code ON users(referral_code);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users(username);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    base_price REAL NOT NULL,
    gst_amount REAL NOT NULL,
    final_price REAL NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_packages_id ON packages(id);

-- ============================================================================
-- PAYMENT & TRANSACTION TABLES
-- ============================================================================

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    package_id INTEGER,
    razorpay_order_id TEXT NOT NULL UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'created',
    payment_method TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES packages(id)
);

CREATE INDEX IF NOT EXISTS ix_payments_id ON payments(id);
CREATE INDEX IF NOT EXISTS ix_payments_user_id ON payments(user_id);

-- User Packages table
CREATE TABLE IF NOT EXISTS user_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    package_id INTEGER NOT NULL,
    payment_id INTEGER,
    status TEXT DEFAULT 'active',
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE INDEX IF NOT EXISTS ix_user_packages_id ON user_packages(id);

-- ============================================================================
-- REFERRAL & COMMISSION TABLES
-- ============================================================================

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer_id INTEGER NOT NULL,
    referee_id INTEGER NOT NULL,
    level INTEGER NOT NULL,
    package_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(id),
    FOREIGN KEY (referee_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES packages(id)
);

CREATE INDEX IF NOT EXISTS ix_referrals_id ON referrals(id);
CREATE INDEX IF NOT EXISTS ix_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS ix_referrals_referee_id ON referrals(referee_id);

-- Payouts table
CREATE TABLE IF NOT EXISTS payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    transaction_id TEXT,
    payment_method TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    upi_id TEXT,
    notes TEXT,
    payout_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS ix_payouts_id ON payouts(id);
CREATE INDEX IF NOT EXISTS ix_payouts_user_id ON payouts(user_id);

-- Commissions table (CRITICAL: includes commission_type column)
CREATE TABLE IF NOT EXISTS commissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    referral_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    commission_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    payout_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (referral_id) REFERENCES referrals(id),
    FOREIGN KEY (payout_id) REFERENCES payouts(id)
);

CREATE INDEX IF NOT EXISTS ix_commissions_id ON commissions(id);
CREATE INDEX IF NOT EXISTS ix_commissions_user_id ON commissions(user_id);

-- ============================================================================
-- FINANCIAL TABLES
-- ============================================================================

-- Bank Details table
CREATE TABLE IF NOT EXISTS bank_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    account_holder_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    branch_name TEXT,
    account_type TEXT DEFAULT 'Savings',
    upi_id TEXT,
    pan_number TEXT,
    gst_number TEXT,
    is_verified INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS ix_bank_details_id ON bank_details(id);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    balance REAL NOT NULL DEFAULT 0.0,
    total_earned REAL NOT NULL DEFAULT 0.0,
    total_withdrawn REAL NOT NULL DEFAULT 0.0,
    total_spent REAL NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS ix_wallets_id ON wallets(id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_wallets_user_id ON wallets(user_id);

-- Wallet Transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    source TEXT NOT NULL,
    amount REAL NOT NULL,
    balance_before REAL NOT NULL,
    balance_after REAL NOT NULL,
    description TEXT NOT NULL,
    reference_id TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id)
);

CREATE INDEX IF NOT EXISTS ix_wallet_transactions_id ON wallet_transactions(id);
CREATE INDEX IF NOT EXISTS ix_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS ix_wallet_transactions_created_at ON wallet_transactions(created_at);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    payment_id INTEGER NOT NULL,
    invoice_type TEXT NOT NULL,
    item_name TEXT NOT NULL,
    item_description TEXT,
    amount REAL NOT NULL,
    gst_percentage REAL DEFAULT 18.0,
    gst_amount REAL NOT NULL,
    total_amount REAL NOT NULL,
    invoice_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE INDEX IF NOT EXISTS ix_invoices_id ON invoices(id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS ix_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS ix_invoices_payment_id ON invoices(payment_id);

-- ============================================================================
-- COURSE & LEARNING TABLES
-- ============================================================================

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    package_id INTEGER NOT NULL,
    individual_price REAL DEFAULT 199.0,
    available_for_individual_purchase INTEGER DEFAULT 1,
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id)
);

CREATE INDEX IF NOT EXISTS ix_courses_id ON courses(id);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE INDEX IF NOT EXISTS ix_modules_id ON modules(id);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    video_source_type TEXT DEFAULT 'cloudinary',
    cloudinary_public_id TEXT,
    cloudinary_url TEXT,
    external_video_url TEXT,
    thumbnail_url TEXT,
    duration INTEGER,
    display_order INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(id)
);

CREATE INDEX IF NOT EXISTS ix_topics_id ON topics(id);

-- Videos table (legacy - kept for backward compatibility)
CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cloudinary_public_id TEXT NOT NULL,
    cloudinary_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    display_order INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE INDEX IF NOT EXISTS ix_videos_id ON videos(id);

-- Video Progress table
CREATE TABLE IF NOT EXISTS video_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    watched_seconds REAL DEFAULT 0.0,
    completed INTEGER DEFAULT 0,
    last_position REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id),
    UNIQUE (user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS ix_video_progress_id ON video_progress(id);
CREATE INDEX IF NOT EXISTS ix_video_progress_user_id ON video_progress(user_id);
CREATE INDEX IF NOT EXISTS ix_video_progress_topic_id ON video_progress(topic_id);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    certificate_number TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS ix_certificates_id ON certificates(id);
CREATE INDEX IF NOT EXISTS ix_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS ix_certificates_course_id ON certificates(course_id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_certificates_certificate_number ON certificates(certificate_number);

-- User Course Purchases table
CREATE TABLE IF NOT EXISTS user_course_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    amount_paid REAL NOT NULL,
    payment_id INTEGER,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_expires_at TIMESTAMP,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

CREATE INDEX IF NOT EXISTS ix_user_course_purchases_id ON user_course_purchases(id);

-- ============================================================================
-- NOTIFICATION TABLES
-- ============================================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    link TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    post_id INTEGER,
    comment_id INTEGER,
    from_user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS ix_notifications_id ON notifications(id);
CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS ix_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS ix_notifications_created_at ON notifications(created_at);

