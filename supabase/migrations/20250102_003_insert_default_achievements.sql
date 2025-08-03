-- 기본 업적 데이터 삽입
INSERT INTO achievements (name, description, badge_icon, badge_color, category, condition_type, condition_value, points, rarity) VALUES
-- 점수 관련 업적
('첫 스트라이크', '첫 번째 스트라이크를 달성했습니다!', '🎯', 'blue', 'score', 'first_strike', '{}', 10, 'common'),
('100점 돌파', '100점을 넘어섰습니다!', '💯', 'green', 'score', 'score_threshold', '{"threshold": 100}', 20, 'common'),
('150점 달성', '150점 이상을 기록했습니다!', '🌟', 'blue', 'score', 'score_threshold', '{"threshold": 150}', 50, 'rare'),
('200점 클럽', '200점의 벽을 넘었습니다!', '🏆', 'gold', 'score', 'score_threshold', '{"threshold": 200}', 100, 'epic'),
('완벽한 게임', '300점 퍼펙트 게임을 달성했습니다!', '👑', 'purple', 'score', 'score_threshold', '{"threshold": 300}', 500, 'legendary'),

-- 연속 기록 관련 업적
('더블 스트라이크', '연속 2회 스트라이크를 달성했습니다!', '🔥', 'orange', 'streak', 'consecutive_strikes', '{"count": 2}', 30, 'common'),
('터키', '연속 3회 스트라이크 터키를 달성했습니다!', '🦃', 'orange', 'streak', 'consecutive_strikes', '{"count": 3}', 75, 'rare'),
('4연속 스트라이크', '4연속 스트라이크의 위력을 보여주었습니다!', '⚡', 'red', 'streak', 'consecutive_strikes', '{"count": 4}', 150, 'epic'),

-- 참여도 관련 업적
('첫 게임', '볼링 동호회에 첫 참여를 환영합니다!', '🎳', 'green', 'participation', 'first_game', '{}', 5, 'common'),
('꾸준한 참여', '5회 이상 게임에 참여했습니다!', '📅', 'blue', 'participation', 'game_count', '{"count": 5}', 25, 'common'),
('단골 멤버', '10회 이상 게임에 참여했습니다!', '⭐', 'blue', 'participation', 'game_count', '{"count": 10}', 50, 'rare'),
('베테랑', '20회 이상 게임에 참여한 베테랑입니다!', '🎖️', 'purple', 'participation', 'game_count', '{"count": 20}', 100, 'epic'),

-- 특별 업적
('컴백 마스터', '1게임에서 3게임으로 50점 이상 향상했습니다!', '📈', 'green', 'special', 'comeback', '{"improvement": 50}', 75, 'rare'),
('안정의 제왕', '3게임 점수 편차가 10점 이하입니다!', '🎯', 'blue', 'special', 'consistency', '{"max_deviation": 10}', 60, 'rare'),
('스페어 마스터', '한 게임에서 5개 이상의 스페어를 기록했습니다!', '🎪', 'yellow', 'special', 'spares_in_game', '{"count": 5}', 40, 'common'),
('올나이터', '하루에 5게임 이상 플레이했습니다!', '🌙', 'dark', 'special', 'games_per_day', '{"count": 5}', 80, 'rare'),

-- 소셜 업적
('팀 플레이어', '팀 게임에서 팀 평균을 끌어올렸습니다!', '🤝', 'purple', 'social', 'team_contribution', '{}', 35, 'common'),
('분위기 메이커', '함께한 게임에서 모든 멤버의 평균이 상승했습니다!', '🎉', 'rainbow', 'social', 'mood_maker', '{}', 90, 'epic');