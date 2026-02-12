# Zuno — Product Overview

Single source for what Zuno is, its features (implemented vs planned), screens, and landing/marketing copy.

---

## Table of Contents

1. [What is Zuno?](#1-what-is-zuno)
2. [The Problem](#2-the-problem)
3. [The Solution](#3-the-solution)
4. [Core Features](#4-core-features)
5. [Screens](#5-screens)
6. [Feature Breakdown (Implemented vs Planned)](#6-feature-breakdown-implemented-vs-planned)
7. [User Flow](#7-user-flow)
8. [Content Types & Platforms](#8-content-types--platforms)
9. [Investor Demo Story](#9-investor-demo-story)
10. [Technical Vision, Monetization & Competitive Edge](#10-technical-vision-monetization--competitive-edge)
11. [Landing Page Copy](#11-landing-page-copy)

---

## 1. What is Zuno?

**Zuno** is a unified content hub. You **share content directly into Zuno from any social media app** (Instagram Reels, YouTube Shorts, Facebook videos, Twitter/X, LinkedIn, etc.) using the native **Share** action and choosing Zuno as the destination. Everything lands in one library. AI organizes and categorizes your content, and you search using **natural language** so you can find what you need without digging through folders or hashtags.

---

## 2. The Problem

- **Content is scattered** across Reels, Shorts, articles, FB videos, LinkedIn posts, tweets—each app has its own “save” and no single place for everything.
- **Finding something later** is hard: no single search, no consistent categories, no way to ask in plain language.
- **Bulk of saved content** becomes unusable because organizing and retrieving it is tedious.
- **No discovery from what you save**—platforms don’t connect saved items across apps or recommend new content based on your interests.

---

## 3. The Solution

**Share from anywhere. Search anytime.**

| What | How |
|------|-----|
| **Share from anywhere** | Save from any app (Share → Zuno) or paste a URL; one place for all content |
| **Search anytime** | Natural language search over *your* library—personalized results |
| **AI organizes** | Auto-categorize, auto-tag, auto-summarize |
| **Find anything** | Natural language, question-based (Ask Zuno), tag search |
| **Goals** | AI infers what you’re working toward from saves and suggests steps |
| **Discover more** | Personalized feed (My Feed + Suggested) from your saved content |

---

## 4. Core Features

| Feature | Description |
|--------|-------------|
| **Share to Zuno** | Share from Instagram, YouTube, Facebook, Twitter/X, LinkedIn, TikTok, or any app with Share → Zuno; or paste URL. |
| **Unified library** | All shared content in one place. |
| **AI categorization** | Auto tags and groups (e.g. Ideas, Research, Personal, by topic). |
| **Natural language search** | Search with phrases like “that recipe video I saved last month” or “articles about TypeScript”. |
| **Collections** | Browse by AI-generated or custom collections. |
| **Filters** | All, Recent, Ideas, Research, Personal. |
| **Personalized Feed** | Related content from across social media based on personality inferred from saved content. |
| **Bookmarks & engagement** | Save favorites, see engagement, open original source. |

---

## 5. Screens

| Screen | Purpose |
|--------|---------|
| **Splash** | Brand intro. |
| **Home (Zuno)** | Collections hub, filters (All, Recent, Ideas, Research, Personal). |
| **Feed** | Personalized related content (list view); search, bookmarks, source links. |
| **VFeed** | Same personalized content in vertical reels-style feed. |

Each screen follows the Zuno UI (see `UI_STYLE_GUIDE.md`): light/dark mode, Inter typography, consistent spacing and components.

---

## 6. Feature Breakdown (Implemented vs Planned)

| # | Feature | Status |
|---|---------|--------|
| 1 | Share to Zuno | Implemented |
| 2 | AI Categorization & Tagging | Implemented |
| 3 | AI Summary Cards | Implemented |
| 4 | Smart Collections | Implemented |
| 5 | Natural Language Search | Implemented |
| 6 | Question-Based Search (Ask Zuno) | Implemented |
| 7 | Tag Search | Implemented |
| 8 | Personalized Feed | Implemented |
| 9 | "Why This?" Explainability | Planned |
| 10 | Weekly Digest & Insights | Planned |
| 11 | Content Reminders | Planned |
| 12 | Collaborative Collections | Planned |
| 13 | Cross-Platform Linking | Planned |
| 14 | Browser Extension | Planned |
| 15 | Voice Search | Planned |
| 16 | Goals | Implemented |

**Goals (in detail):** Zuno infers goals from what you save. Each goal has actionable steps tied to saved content. You can complete, dismiss, or merge goals. RAG-powered; same pipeline updates a lightweight “personality” for feed and analysis.

---

## 7. User Flow

1. **Open app** → Splash → Home or Feed.
2. **Saving:** From any social app, tap **Share** → **Share to Zuno**; item is added and categorized by AI.
3. **Home:** See collections and filters; tap a collection; use Add or Share to Zuno to save more.
4. **Feed:** Scroll personalized related content; use natural language search; bookmark; open source links.
5. **VFeed:** Same content in reels-style for video-heavy browsing.

---

## 8. Content Types & Platforms

**Content types:** Reels, Videos, Articles, Posts, Threads, Images, Stories, Web pages (e.g. via extension).

**Platforms:** Instagram, YouTube, Facebook, Twitter/X, LinkedIn, TikTok, Reddit, Pinterest, Browser (extension)—all via share sheet or URL.

---

## 9. Investor Demo Story (6 Steps)

1. **Problem** — “Your content is everywhere.” (Visual: scattered app icons.)
2. **Solution** — “One tap from any app.” (Share → Zuno.)
3. **AI** — “AI understands and organizes.” (Tags, summary, smart collection.)
4. **Search** — “Find anything in seconds.” (Natural language, tags, Ask Zuno.)
5. **Discovery** — “AI finds what you’ll love.” (Personalized feed + “Why this?”.)
6. **Smarter over time** — “The more you save, the smarter it gets.” (Digest, reminders, collaborative collections, cross-platform links.)

---

## 10. Technical Vision, Monetization & Competitive Edge

**Technical:** AI categorization (NLP, topic extraction), summarization (LLM), natural language + semantic search (embeddings + vector DB), question search (LLM), personalized feed (recommendation engine), share integration (native share target + deep links), browser extension.

**Monetization:** Freemium (limited saves / basic AI; premium for unlimited + advanced AI + collaborative collections); Pro (unlimited + extension + voice + priority AI); Team (shared collections + admin); API access.

**Competitive edge:** Cross-platform, AI-organized, searchable vs per-app bookmarks; save any content type + AI + personalized feed vs Pocket/Raindrop; all content types + AI search + feed vs Pinterest; zero-effort AI organization vs Notion/notes.

---

## 11. Landing Page Copy

Use this for the public site (e.g. www.zuno.com).

### Hero / above the fold

- **One-liner:** Zuno is your one place for everything you save — from every app.
- **Taglines (pick one or rotate):**  
  - Share from anywhere. Search anytime.  
  - One place. AI organizes. You search in your words.  
  - Your Knowledge Network.  
  - Save from anywhere. Find in one place.
- **Short paragraph:** Zuno is a unified content hub. Share from anywhere—save reels, articles, videos, and posts from Instagram, YouTube, Twitter, LinkedIn, and more with one tap (Share → Zuno) or paste a URL. AI categorizes and organizes everything. Search anytime in plain language over *your* library so you can find “that recipe video I saved last month” or “articles about TypeScript” in seconds.

### Problem (Why Zuno)

- Content is everywhere; no single place.
- Finding it later is hard; no unified search or plain-language ask.
- Saved content becomes useless without structure.

**Zuno fixes this:** one library (share from anywhere), AI organization, and search anytime in natural language—personalized to your content.

### Core features (for feature cards)

| Feature | Headline | One line |
|--------|----------|----------|
| Share from anywhere | Save from any app or URL | One tap (Share → Zuno) or paste URL. |
| One library | Everything in one place | All saved content in a single library. |
| Search anytime | Natural language, personalized | Search over *your* content in plain language. |
| AI organization | Auto-categorized & tagged | Tagged and grouped by topic; no manual filing. |
| Smart summaries | Know what you saved at a glance | Short AI summaries per item. |
| Ask your library | Ask Zuno | Questions about your saves with sources. |
| Collections | Browse by topic or project | AI-generated or custom collections. |
| Personalized discovery | Discover more of what you like | “For You” feed tailored to what you save. |
| Goals | Goals from what you save | AI infers goals and suggests actionable steps. |

### CTAs

- **Primary:** “Get started” / “Sign up with Google”
- **Secondary:** “See how it works”
- **Footer:** “Save from any app. Find in one place.” + sign-up or app-store links

### Suggested landing structure

1. Hero — one-liner, tagline, short paragraph, primary CTA  
2. Problem — 3 bullets  
3. Solution — “Zuno is the one place…”  
4. Features — 6–10 cards from table above  
5. How it works (optional) — Share → Zuno organizes → Search anytime  
6. Goals (optional) — AI goals from saves + steps  
7. CTA — Repeat primary + “Sign up with Google” or “Download”  
8. Footer — Tagline + Privacy, Terms, Contact

---

*For UI design system see `UI_STYLE_GUIDE.md`. For setup and config see `SETUP.md` and `CONFIG_REFERENCE.md`.*
