-- TheGAVL PostgreSQL Database Schema
-- Production deployment database initialization

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    case_id VARCHAR(255) UNIQUE NOT NULL,
    case_name VARCHAR(512) NOT NULL,
    court VARCHAR(50) NOT NULL,
    issue_area VARCHAR(100),
    year INT,
    petitioner VARCHAR(255),
    respondent VARCHAR(255),
    opinion_text TEXT,
    opinion_author VARCHAR(255),
    vote_count VARCHAR(10),
    outcome VARCHAR(100),
    amicus_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    case_id VARCHAR(255) REFERENCES cases(case_id),
    prediction_outcome VARCHAR(100) NOT NULL,
    probability FLOAT NOT NULL,
    confidence FLOAT NOT NULL,
    reasoning TEXT,
    model_version VARCHAR(50) NOT NULL,
    processing_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    case_id VARCHAR(255) REFERENCES cases(case_id),
    predicted_outcome VARCHAR(100),
    actual_outcome VARCHAR(100),
    feedback_type VARCHAR(50),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Metrics table
CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value FLOAT NOT NULL,
    metric_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cases_case_id ON cases(case_id);
CREATE INDEX IF NOT EXISTS idx_cases_issue_area ON cases(issue_area);
CREATE INDEX IF NOT EXISTS idx_cases_year ON cases(year);
CREATE INDEX IF NOT EXISTS idx_predictions_case_id ON predictions(case_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created ON predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_time ON metrics(metric_time);

-- Create roles for security
CREATE ROLE gavl_app WITH PASSWORD 'secure_password_change_me' LOGIN;
GRANT CONNECT ON DATABASE gavl_predictions TO gavl_app;
GRANT USAGE ON SCHEMA public TO gavl_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gavl_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gavl_app;
