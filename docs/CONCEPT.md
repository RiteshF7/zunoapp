# Zuno — Full Concept, Features & Vision

**Note:** This document describes both the **current product** and **future vision**. In the Feature Breakdown, each feature is marked **Implemented** (exists in the app today) or **Planned** (roadmap / not yet built). Only **Implemented** features exist in the app; **Planned** features (e.g. Voice Search, Browser Extension, Weekly Digest) are aspirational and not yet built.

## Table of Contents

- [The Idea](#the-idea)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Core Flow](#core-flow)
- [Feature Breakdown](#feature-breakdown)
  - [1. Share to Zuno](#1-share-to-zuno)
  - [2. AI Categorization & Tagging](#2-ai-categorization--tagging)
  - [3. AI Summary Cards](#3-ai-summary-cards)
  - [4. Smart Collections](#4-smart-collections)
  - [5. Natural Language Search](#5-natural-language-search)
  - [6. Question-Based Search (Ask Zuno)](#6-question-based-search-ask-zuno)
  - [7. Tag Search](#7-tag-search)
  - [8. Personalized Feed](#8-personalized-feed)
  - [9. "Why This?" Explainability](#9-why-this-explainability)
  - [10. Weekly Digest & Insights](#10-weekly-digest--insights)
  - [11. Content Reminders](#11-content-reminders)
  - [12. Collaborative Collections](#12-collaborative-collections)
  - [13. Cross-Platform Linking](#13-cross-platform-linking)
  - [14. Browser Extension](#14-browser-extension)
  - [15. Voice Search](#15-voice-search)
  - [16. Goals](#16-goals-implemented--in-detail)
- [User Flow (Detailed)](#user-flow-detailed)
- [Investor Demo Story (6 Steps)](#investor-demo-story-6-steps)
- [Screens](#screens)
- [Content Types Supported](#content-types-supported)
- [Platform Integrations](#platform-integrations)
- [Technical Vision](#technical-vision)
- [Monetization Ideas](#monetization-ideas)
- [Competitive Edge](#competitive-edge)

---

## The Idea

**Share from anywhere. Search anytime.**

**Zuno** is a unified, AI-powered content hub. You **share content from anywhere** — from any social media app (Instagram, YouTube, Facebook, Twitter/X, LinkedIn, TikTok, etc.) or by pasting a URL — into Zuno. Zuno becomes the single library for all your saved digital content: reels, shorts, articles, posts, videos, threads. Then you **search anytime** in plain language over that library; results are personalized to *your* saved content.

AI then:
- **Categorizes** the content automatically (tags, topics, types)
- **Summarizes** it so you know what you saved at a glance
- **Organizes** it into smart collections that grow on their own
- **Enables search** via natural language, questions, and tags — personalized to your library
- **Detects goals** from what you save and suggests actionable steps
- **Curates a personalized feed** (My Feed + Suggested) based on what you save

The more you save, the smarter Zuno gets.

---

## The Problem

1. **Content is everywhere.** People save reels on Instagram, bookmark tweets, "Watch Later" on YouTube, save posts on Facebook, bookmark articles in browsers. Each app has its own silo. There is no single place.

2. **Finding it later is impossible.** No unified search. No way to ask "What was that cooking video I saved 2 weeks ago?" across all platforms. You have to remember which app you saved it in, then scroll through hundreds of items.

3. **Bulk becomes useless.** People save hundreds of items. Without organization, the library becomes a graveyard of forgotten content. Manual filing is too tedious — nobody does it.

4. **No discovery from what you save.** Saving content is a dead end. Platforms don't connect your saved items across apps or recommend new content based on your aggregate interests.

---

## The Solution

**Share from anywhere. Search anytime.**

**Zuno = One place. AI organizes. You search in your words. Discover more.**

| What | How |
|------|-----|
| **Share from anywhere** | Save from any app (Share → Zuno) or paste a URL; one place for all your content |
| **Search anytime** | Natural language search over *your* library — ask in plain words, get personalized results |
| **AI organizes** | Auto-categorize, auto-tag (AI + user tags), auto-summarize |
| **Find anything** | Natural language search, question-based search (Ask Zuno), tag search — all over your content |
| **Goals** | AI detects what you're working toward from your saves and suggests actionable steps |
| **Discover more** | Personalized feed (My Feed + Suggested) based on your saved content |
| **Stay engaged** | *(Planned)* Weekly digest, reminders, collaborative collections |

---

## Core Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SOCIAL MEDIA APPS                         │
│  Instagram · YouTube · Facebook · Twitter/X · LinkedIn       │
│  TikTok · Reddit · Pinterest · Browser articles              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                      Share → Zuno
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      ZUNO LIBRARY                            │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ AI Tags  │  │ AI Summary│  │ Smart    │  │ User     │    │
│  │ auto-gen │  │ auto-gen  │  │ Collection│  │ Tags     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  Search: Natural language · Questions · Tags                 │
│  Browse: Collections · Filters · Timeline                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                   AI personality engine
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   PERSONALIZED FEED                           │
│  Related content from across social media                    │
│  "Because you saved 12 cooking videos" · "Trending in Tech"  │
│  Feed view · VFeed (reels-style) view                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature Breakdown

| # | Feature | Status |
|---|---------|--------|
| 1 | Share to Zuno | Implemented (save URL in app; native Share target on mobile) |
| 2 | AI Categorization & Tagging | Implemented |
| 3 | AI Summary Cards | Implemented |
| 4 | Smart Collections | Implemented |
| 5 | Natural Language Search | Implemented |
| 6 | Question-Based Search (Ask Zuno) | Implemented |
| 7 | Tag Search | Implemented |
| 8 | Personalized Feed | Implemented (My Feed + Suggested) |
| 9 | "Why This?" Explainability | Planned |
| 10 | Weekly Digest & Insights | Planned |
| 11 | Content Reminders | Planned |
| 12 | Collaborative Collections | Planned (shared collections in progress) |
| 13 | Cross-Platform Linking | Planned |
| 14 | Browser Extension | Planned |
| 15 | Voice Search | Planned |
| 16 | Goals | Implemented |

---

### 1. Share to Zuno *(Implemented)* — Share from anywhere

**How it works:** Save content **from anywhere**. From any social app (Instagram, YouTube, Facebook, Twitter/X, LinkedIn, TikTok, Reddit, Pinterest), tap the native **Share** button and choose **Zuno** as the destination. You can also paste a URL in the app to save articles, videos, or any link. The content is saved to your Zuno library instantly.

**Key points:**
- **Share from anywhere** — no copy-paste, no switching apps, no manual filing
- Works with any app that has a Share action (Android/iOS share sheet)
- In-app: paste any URL to save (articles, videos, posts)
- Zuno extracts metadata: title, thumbnail, source URL, platform, content type
- One tap or one paste. Done.

---

### 2. AI Categorization & Tagging *(Implemented)*

**How it works:** When content is saved, Zuno's AI analyzes it and automatically assigns:
- **Category** (e.g., Cooking, Tech, Travel, Fitness, Finance)
- **Type** (e.g., Reel, Article, Video, Thread, Post)
- **AI-generated tags** (e.g., #recipe, #thai-food, #quick-meal, #vegetarian)

**User-created tags:** Users can also add their own custom tags to any item. AI suggestions + user tags live together.

**Key points:**
- Zero-effort organization — content is tagged the moment it's saved
- AI tags improve over time as it learns your patterns
- Users can edit, add, or remove tags at any time
- Tags are searchable and filterable

---

### 3. AI Summary Cards *(Implemented)*

**How it works:** For every saved item, Zuno generates a short AI summary. Examples:
- "3-min cooking video: Thai green curry recipe with coconut milk"
- "Twitter thread: 10 productivity tools for developers"
- "Instagram reel: Minimalist home office setup tour"

**Key points:**
- Instantly know what you saved without opening the content
- Summaries are visible on collection cards and search results
- Shows investors that AI doesn't just categorize — it *understands* the content

---

### 4. Smart Collections *(Implemented)*

**How it works:** Collections are **not static folders**. They are AI-powered groups that auto-populate. When you save a new cooking reel, it automatically appears in your "Recipes" collection. No manual filing.

**Types of collections:**
- **AI-generated:** Zuno creates collections based on your content patterns (e.g., "Recipes," "Tech Tutorials," "Travel Inspiration")
- **User-created:** Users can create custom collections (e.g., "Trip Planning," "Gift Ideas")
- **Hybrid:** User-created collections can have AI rules (e.g., "Auto-add anything tagged #fitness")

**Key points:**
- Collections grow on their own
- Items can belong to multiple collections
- Filters: All, Recent, Ideas, Research, Personal (quick toggles)

---

### 5. Natural Language Search *(Implemented)* — Search anytime, personalized to your content

**How it works:** **Search anytime** in plain language. You search over *your* saved content — results are **personalized** to your library, not the whole web. Type in natural language. Examples:
- "that recipe video I saved last month"
- "articles about TypeScript"
- "videos about cooking"
- "saved posts from last week"
- "travel reels from Instagram"

Zuno uses hybrid search (full-text + semantic embeddings) so it understands intent, time references, content types, platforms, and topics. Results are **personalized**: only *your* saved items, ranked by relevance to your query.

**Key points:**
- **Search anytime** — over your library, from anywhere in the app
- **Personalized search content** — every result is from *your* saves; no generic web results
- **Natural language** — no keywords or exact matches; say it like you'd say it to a friend
- Understands context: "last month," "from Instagram," "about cooking"
- Results show AI summary + thumbnail + source + tags
- Much faster than scrolling through a library

---

### 6. Question-Based Search (Ask Zuno) *(Implemented)*

**How it works:** A chat-like interface where you ask questions and Zuno responds with relevant saved content. Examples:
- "What was that startup video I saved?"
- "Do I have any articles about React?"
- "Show me everything related to home renovation"
- "What did I save from LinkedIn last week?"

**Key points:**
- Feels like asking a smart assistant
- Can ask follow-up questions to narrow results
- Combines natural language understanding with your saved library
- Could evolve into a full AI assistant for your content

---

### 7. Tag Search *(Implemented)*

**How it works:** Search by tags — both AI-generated and user-created.
- Click/tap a tag to see all items with that tag
- Search bar supports tag syntax: `#recipe`, `#tech`, `#travel`
- Tag cloud or tag suggestions for quick browsing
- Combine tags: `#cooking + #quick-meal`

**Key points:**
- Tags are shown on every content card
- AI suggests related tags as you search
- Users can follow tags for feed recommendations

---

### 8. Personalized Feed *(Implemented)*

**How it works:** Zuno analyzes your saved content to understand your interests. You get **My Feed** (your saves) and **Suggested** (related content from others, ranked by relevance to your categories/tags). Discovery is personalized to what you save.

**Example:** If you save a lot of cooking reels and tech articles, your feed shows trending cooking videos from YouTube, new food blogs, top tech threads from Twitter, etc.

**Key points:**
- Feed is NOT your saved content — it's discovery of NEW content
- Powered by personality inferred from what you save
- Available as Feed (scrollable list) or VFeed (reels-style vertical swipe)
- Can save feed items to library with one tap (full loop)

---

### 8b. Unified Mixed-Type Feed

**How it works:** The feed is a **single scrollable stream** that mixes all content types — **videos, audio, podcasts, posts, images, articles** — from all sources (YouTube, Instagram, Spotify, Medium, Twitter/X, LinkedIn, etc.) in one place. Each item shows a **content-type badge** (Video, Podcast, Article, Audio, Post, Image) and the **platform source icon** so the user always knows what they're looking at and where it came from.

**Content types in the feed:**
| Type | Card style | Badge | Example sources |
|------|-----------|-------|-----------------|
| **Video / Reel / Short** | Thumbnail with play button + duration | `Video` | YouTube, Instagram, TikTok |
| **Podcast / Audio** | Album art / icon + progress bar + waveform | `Podcast` / `Audio` | Spotify, Apple Podcasts |
| **Article** | Headline + snippet + read time | `Article` | Medium, blogs, news sites |
| **Post** | Avatar + text + engagement stats | `Post` | Twitter/X, LinkedIn, Facebook |
| **Image** | Large image + engagement | `Image` | Instagram, Pinterest |

**Filter bar:** Quick toggles at the top: **All**, **Videos**, **Audio**, **Articles**, **Posts**, **Images** — lets users narrow the feed to one content type while keeping everything in one stream.

**Key points:**
- Every type of content, every source, one single vertical feed
- Uniform card layout with content-type badge and source icon for instant recognition
- Filter bar to narrow by type without leaving the feed
- Personalized based on what the user saves — the feed reflects their interests
- Designed to feel familiar (like a social feed) but far more diverse in content types

---

### 9. "Why This?" Explainability *(Planned)*

**How it works:** On each recommended feed item, a small label explains why it's shown:
- "Because you saved 12 cooking videos"
- "Trending in your interests"
- "Similar to articles you saved last week"
- "Popular among users like you"

**Key points:**
- Builds trust in AI recommendations
- Shows investors the AI isn't a black box
- Users can dismiss or "not interested" to improve recommendations

---

### 10. Weekly Digest & Insights *(Planned)*

**How it works:** Every week, Zuno shows a summary:
- "You saved 23 items this week"
- "40% Tech, 30% Cooking, 30% Travel"
- "Your most-saved platform: Instagram"
- "Top tags: #recipe, #startup, #design"
- Trend: "Your interest in cooking is growing (+15% this month)"

**Key points:**
- Analytics on your own content consumption
- Shows patterns you might not notice yourself
- Drives engagement and retention
- Small card on Home screen + optional notification

---

### 11. Content Reminders *(Planned)*

**How it works:** Zuno nudges you to revisit content:
- "Revisit this article you saved 2 weeks ago"
- "You saved this video but never opened it"
- "This tutorial might be relevant to what you saved today"

**Key points:**
- Prevents saved content from becoming forgotten
- Keeps users coming back to the app
- Smart timing — not annoying, not too frequent
- Can be turned off or customized

---

### 12. Collaborative Collections *(Planned)*

**How it works:** Share a collection with friends or colleagues. Everyone can add content to it.
- "Trip Planning" shared with 3 friends — everyone adds travel reels, hotel articles, flight deals
- "Team Research" shared with coworkers — shared knowledge base
- Real-time sync across users

**Key points:**
- Social feature = viral loop (invite friends)
- Useful for group planning, team research, shared interests
- Permissions: view-only or edit access
- Each person's additions are AI-categorized

---

### 13. Cross-Platform Linking *(Planned)*

**How it works:** Zuno's AI detects when content from different platforms is about the same topic and links them together.
- "This YouTube video and this Twitter thread are about the same startup"
- "This Instagram reel and this article both cover Mediterranean cooking"

**Key points:**
- Unique feature — no other app does this
- Shows deep AI intelligence
- Helps users see connections across their saved content
- Could evolve into a knowledge graph of your interests

---

### 14. Browser Extension *(Planned)*

**How it works:** A Chrome/Safari/Firefox extension that adds a "Save to Zuno" button on any webpage. Save articles, blog posts, documentation, news — anything from the web.

**Key points:**
- Extends beyond mobile social apps to desktop web content
- Expands total addressable market (TAM) significantly
- Works the same: one click → Zuno library → AI categorizes
- Important for professional/research use cases

---

### 15. Voice Search *(Planned — not in app)*

**How it works (vision):** "Hey Zuno, find that recipe video I saved last week."

**Key points:**
- Hands-free search
- Future potential for voice-first interactions
- Natural extension of natural language search
- Accessibility benefit

---

### 16. Goals *(Implemented)* — In detail

**How it works:** Zuno analyzes *what* you save to detect **what you're trying to achieve**. The Goals engine runs as part of the AI pipeline whenever new content is processed. It uses RAG (vector similarity over your saved content) plus your existing goals and steps to decide whether to create a new goal, update an existing one, or add new steps. Goals are **actionable**: each goal has a title, a short description (why Zuno detected it), and **steps** tied to specific saved content (e.g. "Watch the saved tutorial on Runway ML," "Apply techniques from the saved article"). You can mark steps complete, dismiss goals, or merge similar goal suggestions.

**In the app:**
- **Goals tab** — List of goals with status: **Active**, **Completed**, **Dismissed**. An overall progress ring shows completion across all steps.
- **Goal detail** — Open a goal to see all steps; each step can link to source content. Toggle steps complete/incomplete.
- **Merge suggestions** — When the AI detects overlapping goals (e.g. "Learn AI video editing" and "Master Runway ML"), you get merge suggestions to consolidate.
- **Evidence** — Each goal stores which saved content supported it; steps reference specific items so your library and your goals stay connected.

**Key points:**
- **Automatic** — Goals are inferred from your saves; no manual goal entry required.
- **Actionable steps** — Each goal has 3–10 steps; steps are tied to your saved content so you know what to read or watch.
- **RAG-powered** — The engine finds *semantically similar* past saves (not just "last N items") to detect patterns and suggest steps.
- **Personality + goals** — The same pipeline updates a lightweight "personality" profile (interests, themes) used for feed and future analysis.
- **You stay in control** — Complete, dismiss, or merge goals; edit title/description if you want.

---

## User Flow (Detailed)

```
User is browsing Instagram
        │
        ▼
Sees an interesting reel
        │
        ▼
Taps Share → Zuno
        │
        ▼
┌─────────────────────────────────┐
│         ZUNO RECEIVES           │
│  Extracts: URL, title,         │
│  thumbnail, platform, type     │
│                                 │
│  AI generates:                  │
│  • Category: Cooking            │
│  • Tags: #recipe #thai-food     │
│  • Summary: "3-min Thai green   │
│    curry recipe video"          │
│  • Smart Collection: Recipes    │
│                                 │
│  User can:                      │
│  • Add custom tags              │
│  • Move to another collection   │
│  • Or just close — it's done    │
└─────────────────────────────────┘
        │
        ▼
Later, user opens Zuno
        │
        ├──► HOME: Collections grid
        │    ├── Recipes (auto-populated)
        │    ├── Tech Tutorials
        │    ├── Travel Inspiration
        │    └── ... more
        │
        ├──► SEARCH: "thai curry recipe"
        │    └── Finds the reel instantly
        │
        ├──► ASK: "What cooking videos did I save?"
        │    └── Chat-like response with results
        │
        ├──► TAGS: #recipe → all recipe items
        │
        └──► FEED: Personalized new content
             ├── "New Thai cooking channel" (Because you saved 12 cooking videos)
             ├── "Trending: Quick meal prep" (Trending in your interests)
             └── ... more recommendations
```

---

## Investor Demo Story (6 Steps)

### Step 1: The Problem
*"Your content is everywhere."*
Visual: 8+ social app icons with scattered save/bookmark buttons. Content is lost across platforms. No single search. No organization.

### Step 2: The Solution — Share to Zuno
*"One tap from any app."*
Visual: Abstract phone share sheet → content flows into Zuno. Works with Instagram, YouTube, Facebook, Twitter, LinkedIn, TikTok, browser.

### Step 3: AI Categorizes & Organizes
*"AI understands and organizes."*
Visual: Content card arrives → AI tags appear (#recipe, #cooking), summary generates ("3-min Thai curry recipe"), item flies into the "Recipes" smart collection. Zero effort from the user.

### Step 4: Search in Your Words
*"Find anything in seconds."*
Visual: Search bar with natural language query "that recipe video from last month" → instant results. Also: tag search (#recipe), question-based ("Do I have cooking videos?"). Three ways to find anything.

### Step 5: Discover More
*"AI finds what you'll love."*
Visual: Personalized feed with "Why this?" labels. "Because you saved 12 cooking videos" → new cooking content from YouTube, Instagram, blogs. Feed view + VFeed reels-style. Save feed items back to library (full loop).

### Step 6: Your Library Grows Smarter
*"The more you save, the smarter it gets."*
Visual: Weekly digest ("23 items saved, 40% Tech, 30% Cooking"), content reminders ("Revisit this article"), collaborative collections ("Trip Planning" shared with 3 friends), cross-platform links ("This YouTube video and this tweet are about the same topic").

---

## Screens

| Screen | Purpose |
|--------|---------|
| **Splash** | Brand intro, sets the tone |
| **Home (Zuno)** | Collections hub, filters, saved content overview |
| **Feed** | Personalized related content from social media (list view) |
| **VFeed** | Same personalized feed in reels-style vertical swipe |

---

## Content Types Supported

| Type | Examples |
|------|----------|
| **Reels** | Instagram Reels, YouTube Shorts, TikTok videos |
| **Videos** | YouTube videos, Facebook videos, Vimeo |
| **Articles** | Blog posts, news articles, Medium posts |
| **Posts** | Twitter/X tweets, LinkedIn posts, Facebook posts |
| **Threads** | Twitter threads, Reddit threads |
| **Images** | Instagram posts, Pinterest pins |
| **Stories** | Instagram stories (saved/highlighted) |
| **Web pages** | Any URL saved via browser extension |

---

## Platform Integrations

| Platform | Share Support | Content Types |
|----------|-------------|---------------|
| **Instagram** | Share sheet | Reels, Posts, Stories |
| **YouTube** | Share sheet | Videos, Shorts |
| **Facebook** | Share sheet | Videos, Posts |
| **Twitter/X** | Share sheet | Tweets, Threads |
| **LinkedIn** | Share sheet | Posts, Articles |
| **TikTok** | Share sheet | Videos |
| **Reddit** | Share sheet | Posts, Threads |
| **Pinterest** | Share sheet | Pins |
| **Browser** | Extension | Articles, Web pages |

---

## Technical Vision

| Component | Technology |
|-----------|-----------|
| **AI Categorization** | NLP models for content analysis, topic extraction, auto-tagging |
| **AI Summarization** | LLM-based summary generation for saved content |
| **Natural Language Search** | Semantic search (embeddings + vector DB) over titles, summaries, tags |
| **Question Search** | LLM-powered Q&A over user's content library |
| **Personalized Feed** | Recommendation engine based on user content profile / personality |
| **Cross-Platform Linking** | Entity resolution + topic matching across platforms |
| **Share Integration** | Native Android/iOS share sheet target + deep link handling |
| **Browser Extension** | Chrome/Safari/Firefox extension with "Save to Zuno" |

---

## Monetization Ideas

| Model | Description |
|-------|------------|
| **Freemium** | Free tier (limited saves/month, basic AI). Premium for unlimited saves, advanced AI, collaborative collections. |
| **Pro Plan** | Unlimited everything + browser extension + voice search + priority AI processing. |
| **Team Plan** | Collaborative collections for teams + shared search + admin controls. |
| **API Access** | Let developers build on Zuno's content categorization and search APIs. |

---

## Competitive Edge

| Competitor | What they do | What Zuno does differently |
|-----------|-------------|--------------------------|
| **Platform bookmarks** (IG saved, YT Watch Later) | Per-app, no search, no AI | Cross-platform, AI-organized, searchable |
| **Pocket / Raindrop** | Save articles/links | Save ANY content (reels, shorts, videos, posts), AI categorization, personalized feed |
| **Pinterest** | Visual bookmarking | Not limited to images; supports all content types; AI search + feed |
| **Notion / Notes** | Manual organization | Zero-effort AI organization; share-to-save instead of copy-paste |

---

## Summary

Zuno is the **one place** for all your digital content. Share from any social app. AI organizes, summarizes, and tags. Search in plain English, ask questions, or browse by tags. Discover new related content personalized to your interests. The more you save, the smarter it gets — with weekly insights, reminders, collaborative collections, and cross-platform intelligence.

**For investors:** Zuno sits at the intersection of **content aggregation**, **AI organization**, and **personalized discovery** — a space with massive TAM (billions of social media users who save content daily) and strong retention mechanics (the library grows more valuable over time).
