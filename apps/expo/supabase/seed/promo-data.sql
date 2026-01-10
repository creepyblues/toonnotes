-- ToonNotes Promo Sample Data
-- ============================================
-- This seed creates 40 sample notes across 4 use cases
-- for promotional screenshots and videos.
--
-- SETUP:
-- 1. Create a promo user in Supabase Auth Dashboard:
--    Email: promo@toonnotes.app
--    Password: (set a secure password)
-- 2. Copy the user's UUID and replace the value below
-- 3. Run this SQL in Supabase Dashboard > SQL Editor
-- ============================================

-- Promo user credentials:
-- Email: promo@toonnotes.app
-- Password: promo2026!demo
--
-- Set the promo user ID
DO $$
DECLARE
  promo_user_id UUID := 'ba4a2c4e-be83-4e9c-8837-e12ca804e9de';

  -- Timestamps spread across 7 days (for realistic feel)
  day7 TIMESTAMPTZ := NOW() - INTERVAL '7 days';
  day6 TIMESTAMPTZ := NOW() - INTERVAL '6 days';
  day5 TIMESTAMPTZ := NOW() - INTERVAL '5 days';
  day4 TIMESTAMPTZ := NOW() - INTERVAL '4 days';
  day3 TIMESTAMPTZ := NOW() - INTERVAL '3 days';
  day2 TIMESTAMPTZ := NOW() - INTERVAL '2 days';
  day1 TIMESTAMPTZ := NOW() - INTERVAL '1 day';
  today TIMESTAMPTZ := NOW();

BEGIN

-- ============================================
-- CLEAN UP EXISTING PROMO DATA (if re-running)
-- ============================================
DELETE FROM public.notes WHERE user_id = promo_user_id;
DELETE FROM public.labels WHERE user_id = promo_user_id;

-- ============================================
-- LABELS (with preset mappings)
-- ============================================
INSERT INTO public.labels (user_id, name, preset_id, created_at) VALUES
  -- Study labels
  (promo_user_id, 'research', 'research', day7),
  (promo_user_id, 'review', 'review', day7),

  -- Ideas labels
  (promo_user_id, 'ideas', 'ideas', day7),
  (promo_user_id, 'quotes', 'quotes', day7),
  (promo_user_id, 'brainstorm', 'brainstorm', day7),
  (promo_user_id, 'inspiration', 'inspiration', day7),
  (promo_user_id, 'reflection', 'reflection', day7),

  -- Writing labels
  (promo_user_id, 'draft', 'draft', day7),

  -- Trip labels
  (promo_user_id, 'planning', 'planning', day7),
  (promo_user_id, 'wishlist', 'wishlist', day7),
  (promo_user_id, 'bookmarks', 'bookmarks', day7),
  (promo_user_id, 'packing', 'packing', day7);

-- ============================================
-- USE CASE 1: Studying a Subject
-- Topic: "Learning Japanese"
-- Board: Knowledge Map
-- ============================================
INSERT INTO public.notes (user_id, title, content, labels, design_id, active_design_label_id, created_at, updated_at) VALUES
(promo_user_id,
  'Hiragana Chart',
  'The basic 46 characters of Japanese writing. Starts with あいうえお (a-i-u-e-o). Each character represents a syllable, not just a letter. Practice writing 5 new characters daily.',
  ARRAY['research'],
  'label-preset-research',
  'research',
  day7, day7),

(promo_user_id,
  'What is pitch accent?',
  'Japanese isn''t just about pronunciation—it has pitch patterns too! The word 橋 (bridge) vs 箸 (chopsticks) have different pitch. Need to study this more. Maybe watch Dogen''s videos?',
  ARRAY['research'],
  'label-preset-research',
  'research',
  day7 + INTERVAL '2 hours', day7 + INTERVAL '2 hours'),

(promo_user_id,
  'JLPT N5 Vocab List',
  'Core vocabulary for beginners:
• 水 (mizu) - water
• 食べる (taberu) - to eat
• 行く (iku) - to go
• 見る (miru) - to see
Goal: Learn 10 new words per day.',
  ARRAY['review'],
  'label-preset-review',
  'review',
  day6, day6),

(promo_user_id,
  'Sentence structure: SOV',
  'Unlike English (SVO), Japanese uses Subject-Object-Verb order. Example: 私は りんごを 食べます (I apple eat). The verb always comes at the end!',
  ARRAY['research'],
  'label-preset-research',
  'research',
  day6 + INTERVAL '3 hours', day6 + INTERVAL '3 hours'),

(promo_user_id,
  'Particle は vs が',
  'This is confusing! は (wa) marks the topic (what we''re talking about), が (ga) marks the subject (who does the action). Sometimes they overlap. Context matters.',
  ARRAY['research'],
  'label-preset-research',
  'research',
  day5, day5),

(promo_user_id,
  'Kanji radicals meaning',
  'Radicals are the building blocks:
• 木 (tree) → 森 (forest, 3 trees!)
• 水 (water) → used in 海 (sea)
• 火 (fire) → 炎 (flame)
Learning radicals helps guess new kanji meanings.',
  ARRAY['research'],
  'label-preset-research',
  'research',
  day4, day4),

(promo_user_id,
  'Conjugation patterns',
  'Verb groups in Japanese:
• Group 1 (五段): -u ending, most common
• Group 2 (一段): -ru ending
• Irregular: する and くる
Each group has different conjugation rules.',
  ARRAY['review'],
  'label-preset-review',
  'review',
  day3, day3),

(promo_user_id,
  'When to use keigo?',
  'Formal speech (敬語) is used with:
- Bosses and seniors
- Strangers
- Customers
Still learning when to switch between です/ます and casual form...',
  ARRAY['research'],
  'label-preset-research',
  'research',
  day2, day2),

(promo_user_id,
  'Anime vocab I learned',
  'Picked up from watching anime:
• なるほど (naruhodo) - I see!
• めんどくさい (mendokusai) - What a pain
• やばい (yabai) - Wow/Crazy/Bad
Real Japanese differs from anime though!',
  ARRAY['ideas'],
  'label-preset-ideas',
  'ideas',
  day1, day1),

(promo_user_id,
  'Study schedule',
  'Week 1: Master Hiragana (30 min/day)
Week 2: Learn Katakana (30 min/day)
Week 3: Start basic grammar
Week 4: First 50 Kanji
Review on weekends!',
  ARRAY['planning'],
  'label-preset-planning',
  'planning',
  today, today);

-- ============================================
-- USE CASE 2: Collecting Ideas
-- Topic: "App Ideas & Random Thoughts"
-- Board: Idea Constellation
-- ============================================
INSERT INTO public.notes (user_id, title, content, labels, design_id, active_design_label_id, created_at, updated_at) VALUES
(promo_user_id,
  'Shower thought: time',
  'What if we measured time in experiences rather than hours? A "week" of vacation feels longer than a "week" at work. Maybe memory-density is the real unit of time.',
  ARRAY['ideas'],
  'label-preset-ideas',
  'ideas',
  day7 + INTERVAL '6 hours', day7 + INTERVAL '6 hours'),

(promo_user_id,
  'Steve Jobs quote',
  '"Stay hungry, stay foolish."

From his 2005 Stanford commencement speech. The idea that complacency kills creativity. Keep learning, keep taking risks.',
  ARRAY['quotes'],
  'label-preset-quotes',
  'quotes',
  day7 + INTERVAL '8 hours', day7 + INTERVAL '8 hours'),

(promo_user_id,
  'Idea: habit tracker',
  'A habit tracker that uses streaks but doesn''t punish you for missing a day. Instead of losing your streak, it shows "streak paused" and lets you continue. Less guilt, more motivation.',
  ARRAY['ideas', 'brainstorm'],
  'label-preset-ideas',
  'ideas',
  day6 + INTERVAL '4 hours', day6 + INTERVAL '4 hours'),

(promo_user_id,
  'Why do good ideas come at night?',
  'Maybe because we''re tired and our inner critic is quieter? Or the darkness removes visual distractions? Need to keep a notepad by the bed. Too many ideas lost to sleep.',
  ARRAY['reflection'],
  'label-preset-reflection',
  'reflection',
  day5 + INTERVAL '10 hours', day5 + INTERVAL '10 hours'),

(promo_user_id,
  'Movie concept',
  'Time-loop movie, but the protagonist realizes THEY are the villain everyone is trying to stop. Each loop they see their actions from a new perspective.',
  ARRAY['ideas'],
  'label-preset-ideas',
  'ideas',
  day5 + INTERVAL '2 hours', day5 + INTERVAL '2 hours'),

(promo_user_id,
  'Design inspiration',
  'Saw the most beautiful gradient in today''s sunset—deep coral fading to soft lavender. Want to capture this for a design. Nature is the best color palette.',
  ARRAY['inspiration'],
  'label-preset-inspiration',
  'inspiration',
  day4 + INTERVAL '7 hours', day4 + INTERVAL '7 hours'),

(promo_user_id,
  'Einstein on creativity',
  '"Creativity is intelligence having fun."

Simple but profound. The best work happens when it doesn''t feel like work. How to bring more play into serious projects?',
  ARRAY['quotes'],
  'label-preset-quotes',
  'quotes',
  day3 + INTERVAL '1 hour', day3 + INTERVAL '1 hour'),

(promo_user_id,
  'Podcast idea',
  'Interviews with indie app developers about their "aha" moments. Not the success stories—the pivots, the failures, the 3am debugging sessions that led to breakthroughs.',
  ARRAY['ideas', 'brainstorm'],
  'label-preset-ideas',
  'ideas',
  day3 + INTERVAL '5 hours', day3 + INTERVAL '5 hours'),

(promo_user_id,
  'Why minimalism works',
  'Less decisions = more focus. When you have fewer options, you spend less energy choosing and more energy doing. This applies to apps, wardrobes, and life.',
  ARRAY['reflection'],
  'label-preset-reflection',
  'reflection',
  day2 + INTERVAL '3 hours', day2 + INTERVAL '3 hours'),

(promo_user_id,
  'Color palette idea',
  'Warm terracotta + sage green + cream. Earthy, calming, sophisticated. Could work for a wellness app or a cozy reading app. Screenshot the Pinterest board.',
  ARRAY['inspiration'],
  'label-preset-inspiration',
  'inspiration',
  day2 + INTERVAL '6 hours', day2 + INTERVAL '6 hours'),

(promo_user_id,
  'Be present',
  'From therapy today: "You spend so much time in the future that you miss the present." Writing this down to remember. The present is the only moment that''s real.',
  ARRAY['quotes'],
  'label-preset-quotes',
  'quotes',
  day1 + INTERVAL '4 hours', day1 + INTERVAL '4 hours'),

(promo_user_id,
  'Side project: recipe app',
  'AI that suggests recipes based on what''s in your fridge. Take a photo → get recipes. Reduce food waste, simplify meal decisions. Check if this exists already.',
  ARRAY['ideas', 'brainstorm'],
  'label-preset-ideas',
  'ideas',
  today - INTERVAL '2 hours', today - INTERVAL '2 hours');

-- ============================================
-- USE CASE 3: Drafting Writing
-- Topic: "Blog Post: Why I Quit Social Media"
-- Board: Writing Workspace
-- ============================================
INSERT INTO public.notes (user_id, title, content, labels, design_id, active_design_label_id, created_at, updated_at) VALUES
(promo_user_id,
  'Hook: The scroll',
  '"I looked up from my phone and realized I''d spent 3 hours scrolling through lives that weren''t mine, comparing myself to highlight reels, and feeling worse than when I started."

Opening needs to hit hard. Make it relatable.',
  ARRAY['draft'],
  'label-preset-draft',
  'draft',
  day6 + INTERVAL '8 hours', day6 + INTERVAL '8 hours'),

(promo_user_id,
  'Outline structure',
  '1. Hook - The moment of realization
2. Problem - What social media does to us
3. The breaking point - My story
4. The experiment - 30 days off
5. Results - What changed
6. Recommendation - Not quitting, but boundaries',
  ARRAY['draft'],
  'label-preset-draft',
  'draft',
  day6 + INTERVAL '9 hours', day6 + INTERVAL '9 hours'),

(promo_user_id,
  'Research: screen time stats',
  'Average American: 7+ hours on screens/day
45% say social media makes them feel worse
Doom scrolling linked to increased anxiety
Teen mental health crisis correlates with smartphone adoption',
  ARRAY['research'],
  'label-preset-research',
  'research',
  day5 + INTERVAL '1 hour', day5 + INTERVAL '1 hour'),

(promo_user_id,
  'The breaking point',
  'The day I deleted Instagram:
I was at a beautiful dinner with friends, but spent more time photographing the food than eating it. Looking for the perfect angle instead of enjoying the conversation. That was it.',
  ARRAY['draft'],
  'label-preset-draft',
  'draft',
  day4 + INTERVAL '3 hours', day4 + INTERVAL '3 hours'),

(promo_user_id,
  'Key point: attention economy',
  '"If you''re not paying for the product, you ARE the product."

These apps are designed by the world''s smartest engineers to be addictive. We''re not weak—we''re outmatched.',
  ARRAY['ideas'],
  'label-preset-ideas',
  'ideas',
  day3 + INTERVAL '2 hours', day3 + INTERVAL '2 hours'),

(promo_user_id,
  'Cal Newport quote',
  '"Deep work requires extended periods of distraction-free time."

From "Deep Work" - fits perfectly with the focus section. Social media fragments our attention into unusable pieces.',
  ARRAY['quotes'],
  'label-preset-quotes',
  'quotes',
  day2 + INTERVAL '5 hours', day2 + INTERVAL '5 hours'),

(promo_user_id,
  'Benefits I experienced',
  'After 30 days off:
• Slept better (no blue light doom scrolling in bed)
• Read 4 books (had "no time" before)
• Less anxiety about missing out
• Reconnected with actual hobbies
• More present in conversations',
  ARRAY['draft'],
  'label-preset-draft',
  'draft',
  day1 + INTERVAL '6 hours', day1 + INTERVAL '6 hours'),

(promo_user_id,
  'Counter-argument',
  '"But what about staying connected with friends?"

Real friends text you. Real friends call. The "connection" on social media is often just surveillance dressed up as friendship. But acknowledge the valid use cases.',
  ARRAY['draft'],
  'label-preset-draft',
  'draft',
  today - INTERVAL '4 hours', today - INTERVAL '4 hours');

-- ============================================
-- USE CASE 4: Planning a Trip
-- Topic: "Tokyo Trip 2026"
-- Board: Trip Planner
-- ============================================
INSERT INTO public.notes (user_id, title, content, labels, design_id, active_design_label_id, created_at, updated_at) VALUES
(promo_user_id,
  'Flight options',
  'ANA vs JAL - both highly rated
Departing: March 15, 2026
Direct flights from LAX: ~12 hours
Price range: $800-1200 round trip
Book at least 2 months ahead for best rates.',
  ARRAY['planning'],
  'label-preset-planning',
  'planning',
  day7 + INTERVAL '1 hour', day7 + INTERVAL '1 hour'),

(promo_user_id,
  'Hotel: Park Hyatt Tokyo',
  'Lost in Translation vibes! The hotel from the movie. Splurge for at least one night?
- New York Bar on 52nd floor
- Amazing views of the city
- Pool and gym
Alternative: Stay in Shinjuku for location.',
  ARRAY['wishlist'],
  'label-preset-wishlist',
  'wishlist',
  day7 + INTERVAL '3 hours', day7 + INTERVAL '3 hours'),

(promo_user_id,
  'Must-visit: TeamLab',
  'TeamLab Borderless or Planets?
- Borderless: More immersive, larger
- Planets: Walk through water
BOOK IN ADVANCE - sells out weeks ahead!
Best to go on weekday morning.',
  ARRAY['wishlist'],
  'label-preset-wishlist',
  'wishlist',
  day6 + INTERVAL '2 hours', day6 + INTERVAL '2 hours'),

(promo_user_id,
  'Restaurant: Ichiran Ramen',
  'Famous solo booth ramen experience!
- Order from vending machine
- Customize noodle firmness, broth richness
- Multiple locations in Tokyo
- 24 hours in some spots
Perfect for jet-lagged late night meal.',
  ARRAY['bookmarks'],
  'label-preset-bookmarks',
  'bookmarks',
  day5 + INTERVAL '4 hours', day5 + INTERVAL '4 hours'),

(promo_user_id,
  'Day 1 itinerary',
  '• Arrive Narita ~3pm
• Airport train to Shinjuku (NEX)
• Hotel check-in, rest
• Evening: Shibuya crossing at night
• Dinner: Convenience store onigiri (iconic!)
• Early bed - jet lag recovery',
  ARRAY['planning'],
  'label-preset-planning',
  'planning',
  day4 + INTERVAL '6 hours', day4 + INTERVAL '6 hours'),

(promo_user_id,
  'Packing: electronics',
  '• Camera + extra battery
• Japan power adapter (Type A, same as US!)
• Portable charger (20000mAh)
• AirPods
• Kindle for flight
• Universal adapter backup',
  ARRAY['packing'],
  'label-preset-packing',
  'packing',
  day3 + INTERVAL '4 hours', day3 + INTERVAL '4 hours'),

(promo_user_id,
  'Suica card',
  'Get at Narita airport:
- Tap-to-pay for trains/buses
- Works at convenience stores
- Can reload at any station
- No more buying individual tickets!
Also: Mobile Suica on iPhone works in Japan.',
  ARRAY['planning'],
  'label-preset-planning',
  'planning',
  day2 + INTERVAL '2 hours', day2 + INTERVAL '2 hours'),

(promo_user_id,
  'Conveyor belt sushi',
  'Sushiro - best budget option!
- Touch screen ordering
- Fresh and affordable
- Fun experience
- Multiple locations
Alternative: Kura Sushi (has games)',
  ARRAY['bookmarks'],
  'label-preset-bookmarks',
  'bookmarks',
  day2 + INTERVAL '7 hours', day2 + INTERVAL '7 hours'),

(promo_user_id,
  'Day trip: Kamakura',
  'Giant Buddha + temples
- 1 hour from Tokyo by train
- Great for half day trip
- Enoshima island nearby
- Beach town vibes
Best on a clear day for photos!',
  ARRAY['wishlist'],
  'label-preset-wishlist',
  'wishlist',
  day1 + INTERVAL '3 hours', day1 + INTERVAL '3 hours'),

(promo_user_id,
  'Packing: clothes',
  'March weather: 8-15°C (cold!)
• Light jacket + packable puffer
• Layers (temples = lots of walking)
• Comfortable walking shoes
• 1 nice outfit for fancy dinner
• Umbrella (March is rainy)
Laundry at hotel saves space.',
  ARRAY['packing'],
  'label-preset-packing',
  'packing',
  today - INTERVAL '1 hour', today - INTERVAL '1 hour');

-- ============================================
-- UPDATE PROFILE (optional - set coins/free designs)
-- ============================================
UPDATE public.profiles
SET
  coin_balance = 10,
  free_design_used = FALSE,
  has_completed_welcome = TRUE,
  notes_created_count = 40
WHERE id = promo_user_id;

RAISE NOTICE 'Promo data seeded successfully!';
RAISE NOTICE 'Created 12 labels and 40 notes for user %', promo_user_id;

END $$;
