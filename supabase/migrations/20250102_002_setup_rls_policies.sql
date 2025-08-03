-- RLS (Row Level Security) 활성화
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_achievements ENABLE ROW LEVEL SECURITY;

-- 기본 정책: 모든 사용자가 읽기 가능 (동호회 특성상 데이터 공유)
CREATE POLICY "Anyone can read members" ON members FOR SELECT USING (true);
CREATE POLICY "Anyone can read game_sessions" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can read game_results" ON game_results FOR SELECT USING (true);
CREATE POLICY "Anyone can read upload_history" ON upload_history FOR SELECT USING (true);
CREATE POLICY "Anyone can read member_statistics" ON member_statistics FOR SELECT USING (true);
CREATE POLICY "Anyone can read achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can read member_achievements" ON member_achievements FOR SELECT USING (true);

-- 삽입/수정/삭제는 인증된 사용자만 (향후 세부 권한 관리 가능)
CREATE POLICY "Authenticated users can insert members" ON members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update members" ON members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete members" ON members FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert game_sessions" ON game_sessions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update game_sessions" ON game_sessions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete game_sessions" ON game_sessions FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert game_results" ON game_results FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update game_results" ON game_results FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete game_results" ON game_results FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert upload_history" ON upload_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update upload_history" ON upload_history FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete upload_history" ON upload_history FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert member_statistics" ON member_statistics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update member_statistics" ON member_statistics FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete member_statistics" ON member_statistics FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert member_achievements" ON member_achievements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update member_achievements" ON member_achievements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete member_achievements" ON member_achievements FOR DELETE USING (auth.role() = 'authenticated');