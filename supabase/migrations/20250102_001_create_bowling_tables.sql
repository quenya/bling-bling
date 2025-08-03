-- 동호회 회원 테이블
CREATE TABLE IF NOT EXISTS members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    joined_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 게임 세션 테이블
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_name VARCHAR(200),
    date DATE NOT NULL,
    location VARCHAR(200),
    start_time TIME,
    end_time TIME,
    lane_number INTEGER,
    total_participants INTEGER DEFAULT 0,
    session_type VARCHAR(50) DEFAULT 'regular', -- regular, tournament, practice
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 개별 게임 결과 테이블 (3게임)
CREATE TABLE IF NOT EXISTS game_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    game_number INTEGER NOT NULL CHECK (game_number BETWEEN 1 AND 3),
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 300),
    strikes INTEGER DEFAULT 0 CHECK (strikes >= 0),
    spares INTEGER DEFAULT 0 CHECK (spares >= 0),
    splits INTEGER DEFAULT 0 CHECK (splits >= 0),
    frame_scores JSONB, -- 각 프레임별 상세 점수
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, member_id, game_number)
);

-- 이미지 업로드 기록 테이블
CREATE TABLE IF NOT EXISTS upload_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    original_filename VARCHAR(255),
    file_size BIGINT,
    image_width INTEGER,
    image_height INTEGER,
    processed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ocr_raw_text TEXT,
    ocr_confidence DECIMAL(5,2),
    processing_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 회원 통계 테이블 (계산된 통계 캐시)
CREATE TABLE IF NOT EXISTS member_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    total_games INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    highest_score INTEGER DEFAULT 0,
    lowest_score INTEGER DEFAULT 0,
    total_strikes INTEGER DEFAULT 0,
    total_spares INTEGER DEFAULT 0,
    total_splits INTEGER DEFAULT 0,
    improvement_rate DECIMAL(5,2) DEFAULT 0, -- 최근 향상률
    consistency_score DECIMAL(5,2) DEFAULT 0, -- 안정성 지수
    last_played_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id)
);

-- 업적 및 배지 테이블
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    badge_icon VARCHAR(100),
    badge_color VARCHAR(20) DEFAULT 'blue',
    category VARCHAR(50), -- score, streak, participation, special
    condition_type VARCHAR(50), -- score_threshold, consecutive_strikes, etc.
    condition_value JSONB, -- 조건 상세 정보
    points INTEGER DEFAULT 0, -- 경험치 포인트
    rarity VARCHAR(20) DEFAULT 'common', -- common, rare, epic, legendary
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 회원 업적 달성 기록
CREATE TABLE IF NOT EXISTS member_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    achieved_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    achieved_value JSONB, -- 달성 당시의 구체적인 값
    session_id UUID REFERENCES game_sessions(id), -- 달성한 세션 (선택사항)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, achievement_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_game_results_session_member ON game_results(session_id, member_id);
CREATE INDEX IF NOT EXISTS idx_game_results_member_date ON game_results(member_id, created_at);
CREATE INDEX IF NOT EXISTS idx_game_sessions_date ON game_sessions(date);
CREATE INDEX IF NOT EXISTS idx_upload_history_session ON upload_history(session_id);
CREATE INDEX IF NOT EXISTS idx_member_statistics_member ON member_statistics(member_id);
CREATE INDEX IF NOT EXISTS idx_member_achievements_member ON member_achievements(member_id);