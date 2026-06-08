CREATE TABLE IF NOT EXISTS techniques (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty  TEXT NOT NULL,
  tags        TEXT[] NOT NULL DEFAULT '{}'
);

INSERT INTO techniques (id, name, category, subcategory, description, difficulty, tags) VALUES
('ippon-seoi-nage', 'Ippon Seoi Nage', 'nage-waza', 'te-waza', 'One-arm shoulder throw: enter deeply between uke''s arms, load them onto your back, and throw forward over the shoulder.', 'intermediate', ARRAY['standing', 'forward', 'Olympic staple']),
('o-uchi-gari', 'O Uchi Gari', 'nage-waza', 'ashi-waza', 'Major inner reap: break uke''s balance backward, then reap their near leg from the inside while driving through.', 'beginner', ARRAY['reap', 'backward', 'combo friendly']),
('harai-goshi', 'Harai Goshi', 'nage-waza', 'koshi-waza', 'Sweeping hip throw: hip goes deep; the sweeping leg lifts and clears uke''s legs as you rotate them over.', 'advanced', ARRAY['hip', 'sweeping', 'kuzushi']),
('tomoe-nage', 'Tomoe Nage', 'nage-waza', 'ma-sutemi-waza', 'Circle throw: place a foot on uke''s stomach or hip, fall back in a controlled arc, and wheel them overhead.', 'advanced', ARRAY['sacrifice', 'circle', 'grip dependent']),
('de-ashi-barai', 'De Ashi Barai', 'nage-waza', 'ashi-waza', 'Advanced foot sweep: time the moment uke''s foot is about to touch the mat and sweep it sideways.', 'intermediate', ARRAY['foot sweep', 'timing', 'okuri ashi feel']),
('uki-goshi', 'Uki Goshi', 'nage-waza', 'koshi-waza', 'Floating hip throw: hip lifts uke while you turn; less lift than o-goshi, more floating rotation.', 'beginner', ARRAY['hip', 'rotation', 'fundamentals']),
('kesa-gatame', 'Kesa Gatame', 'katame-waza', 'osaekomi-waza', 'Scarf hold: control from the side with your arm threaded around uke''s head and far arm trapped.', 'beginner', ARRAY['pin', 'side control', 'transition']),
('yoko-shiho-gatame', 'Yoko Shiho Gatame', 'katame-waza', 'osaekomi-waza', 'Side four-corner hold: chest-to-chest pin with limbs woven to prevent escape to the north–south line.', 'intermediate', ARRAY['pin', 'pressure', 'stability']),
('juji-gatame', 'Juji Gatame', 'katame-waza', 'kansetsu-waza', 'Cross armlock: hyperextend the elbow with the arm trapped between your hips and legs, wrist controlled.', 'advanced', ARRAY['armlock', 'submission', 'breakfall critical']),
('okuri-eri-jime', 'Okuri Eri Jime', 'katame-waza', 'shime-waza', 'Sliding lapel strangle: lapel feeds deep as you slide around; pressure is applied with controlled rotation.', 'advanced', ARRAY['strangle', 'gi', 'competition legal when applied cleanly']),
('soto-uke-atemi', 'Soto Uke (atemi application)', 'atemi-waza', 'ude-ate', 'Outer block/strike to the forearm line used in kata contexts to disrupt balance before entering waza.', 'beginner', ARRAY['kata', 'block', 'distancing']),
('mae-geri-circular', 'Mae Geri (circular)', 'atemi-waza', 'keri-waza', 'Front kick on a circular line toward midsection; emphasizes hip commitment and recovery to clinch range.', 'intermediate', ARRAY['kick', 'kihon', 'not used in randori scoring'])
ON CONFLICT (id) DO NOTHING;
