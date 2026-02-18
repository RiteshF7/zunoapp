-- =============================================================
-- Zuno App — Seed Data
-- =============================================================

-- Feed Items (sample data for the discovery feed)
INSERT INTO public.feed_items (title, description, image_url, source_url, category, content_type, platform, likes, reason) VALUES
  ('10 Must-Know TypeScript Tips for 2025', 'Boost your TypeScript skills with these essential tips and best practices for modern development.', 'https://picsum.photos/seed/ts-tips/400/250', 'https://example.com/typescript-tips', 'Tutorial', 'video', 'youtube', 2340, 'Trending in Tech'),
  ('The Ultimate Guide to Meal Prep', 'Save time and eat healthy with this comprehensive meal prep guide covering 20 recipes.', 'https://picsum.photos/seed/meal-prep/400/250', 'https://example.com/meal-prep', 'Article', 'reel', 'instagram', 1567, 'Because you saved 5 cooking videos'),
  ('Minimalist Home Office Setup 2025', 'Transform your workspace with these minimalist design ideas and productivity hacks.', 'https://picsum.photos/seed/office/400/250', 'https://example.com/home-office', 'Resource', 'image', 'pinterest', 892, 'Similar to your saved design content'),
  ('React Native Performance Deep Dive', 'Learn advanced techniques to optimize your React Native app performance.', 'https://picsum.photos/seed/rn-perf/400/250', 'https://example.com/rn-performance', 'Tutorial', 'video', 'youtube', 3105, 'Trending in your interests'),
  ('5-Minute Morning Yoga Routine', 'Start your day right with this quick and effective morning yoga flow for all levels.', 'https://picsum.photos/seed/yoga/400/250', 'https://example.com/morning-yoga', 'Health', 'reel', 'instagram', 4521, 'Popular among users like you'),
  ('Building a Second Brain with AI', 'How to use AI tools to organize your knowledge and boost creativity.', 'https://picsum.photos/seed/second-brain/400/250', 'https://example.com/second-brain', 'Article', 'thread', 'twitter', 1890, 'Because you saved AI articles');
