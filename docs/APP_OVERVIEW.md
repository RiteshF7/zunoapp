# Zuno — App Overview & Screens

## What is Zuno?

**Zuno** is a unified content hub that brings all your digital resources into one place. You **share content directly into Zuno from any social media app**—Instagram Reels, YouTube Shorts, Facebook videos, Twitter/X posts, LinkedIn articles, and more—using the native **Share** action and choosing Zuno as the destination. Everything lands in one library. AI then organizes and categorizes your content, and you search through it using **natural language**—so you can find exactly what you need from a large library without digging through folders or hashtags.

---

## The Problem Zuno Solves

- **Content is scattered** across Reels, Shorts, articles, FB videos, LinkedIn posts, tweets, and more—each app has its own “save” and no single place to send everything.
- **Finding something later** is hard: no single search, no consistent categories, no way to ask in plain language.
- **Bulk of saved content** becomes unusable because organizing and retrieving it is tedious.

Zuno solves this by being the **one place** for all saved content, with **AI-driven categorization** and **natural language search** so you can ask things like *“that recipe video I saved last month”* or *“articles about TypeScript”* and get relevant results quickly.

---

## Core Features

| Feature | Description |
|--------|-------------|
| **Share to Zuno** | **Share content directly into Zuno from all different social media apps.** From Instagram, YouTube, Facebook, Twitter/X, LinkedIn, TikTok, or any app with a Share action, choose “Share to Zuno” and the post, reel, short, article, or video is saved to your Zuno library—no copy-paste, no switching apps to manually add links. |
| **Unified library** | All shared content (reels, shorts, articles, FB videos, posts, etc.) lives in one place in Zuno. |
| **AI categorization** | Content is automatically tagged and grouped (e.g. Ideas, Research, Personal, by topic or type) so you don’t have to file everything manually. |
| **Natural language search** | Search using everyday phrases (e.g. “videos about cooking,” “saved posts from last week”) instead of keywords or filters only. |
| **Collections** | Browse content by AI-generated or custom collections (e.g. Important Documents, Daily Helpers, Creative Projects, Learning & Discovery). |
| **Filters** | Quick filters like All, Recent, Ideas, Research, Personal to narrow down what you see. |
| **Personalized Feed** | Related content from across social media (reels, shorts, articles, FB videos, posts) curated **according to your personality** inferred from your saved content—so you discover new content that matches your interests. |
| **Bookmarks & engagement** | Save favorites, see engagement (e.g. likes), and open original source (e.g. open in Instagram, YouTube, article link). |

---

## Screens

The app is structured around these main screens. Each is built to fit the Zuno UI (see `UI_STYLE_GUIDE.md`), with support for light/dark mode, Inter typography, and consistent spacing and components.

---

### 1. Splash Screen  
**File:** `prototype/splashscreen.html`

**Purpose:** First screen when the app opens. Presents the Zuno brand and sets the tone before the user reaches the main experience.

**Contents:**
- Zuno logo (centered)
- App name “Zuno” with simple divider
- Optional tagline or short descriptor
- Network/grid-style background (subtle strokes and dots) for a connected, “everything in one place” feel

**User action:** Typically auto-advances to the main app (e.g. Home or Feed) after a short delay or tap.

---

### 2. Zuno (Home / Collections)  
**File:** `prototype/zuno.html`

**Purpose:** Main home screen. This is the hub where users see their **collections**—AI-curated or user-defined groups of content (e.g. Important Documents, Daily Helpers, Creative Projects).

**Contents:**
- **Header:** Logo, “Pick your” + app name (e.g. “Zuno”), notifications and settings
- **Filter bar:** Horizontal scroll of filter chips: **All**, **Recent**, **Ideas**, **Research**, **Personal** (data from `assets/content.json`)
- **Collections grid:** 2-column grid of collection cards. Each card shows:
  - Icon and color theme (blue, green, purple, amber, rose, indigo)
  - Title (e.g. “Important Documents,” “Daily Helpers,” “Creative Projects,” “Home & DIY,” “Personal Notes,” “Learning & Discovery”)
  - Item count (e.g. “12 items,” “37 items”)
- **Bottom nav:** Home (active), Add (create new), Profile/Account
- **Settings:** Dropdown for theme toggle (light/dark)

**Data:** Collections and filters are driven by `assets/content.json` (app name, filters, collections with ids, titles, counts, icons, and theme classes).

**User action:** Tap a collection to open that group of content; use filters to change what’s in focus; use Add or **Share to Zuno** from other apps to save new content; use settings for theme.

---

### 3. Feed  
**File:** `prototype/feed.html`

**Purpose:** A **personalized discovery feed** of **related content from across social media**—reels, shorts, articles, FB videos, posts from different platforms—curated **according to your personality** inferred from your **saved content**. It is not a list of what you saved; it is new content from the whole web/social sphere that matches your interests and style, so you discover things you’re likely to care about.

**Contents:**
- **Header:** Logo, “Zuno” title, search, settings, account
- **Feed list:** Cards for each recommended item. Each card includes:
  - Image/thumbnail
  - Title
  - Engagement (e.g. likes)
  - Actions: “Open source” (open in browser/app), “Bookmark” (save to favorites)
  - Optional category (e.g. Tutorial, Resource, Article)
- **Settings:** Theme toggle (light/dark) in header dropdown

**Data:** Feed items come from `assets/feed.json` (id, title, description, imageUrl, sourceUrl, category, likes). In production, items would be recommended by AI from multiple platforms based on personality derived from saved content. Bookmarked items are stored in `localStorage` (`feedBookmarks`).

**User action:** Scroll to browse recommended content; tap “Open source” to view original; tap bookmark to save to favorites; use search (natural language search across content).

---

### 4. VFeed (Vertical / Reels-style Feed)  
**File:** `prototype/vfeed.html`

**Purpose:** The same **personalized related content** as the main Feed (from social media, matched to your personality from saved content) but in a **vertical, full-screen, reels-style** layout—one item at a time, swipe up/down for next/previous. Suited for video-first content (Reels, Shorts, FB videos).

**Contents:**
- **Header:** Profile avatar, “Pick your” + “future.” tagline, notifications
- **Reel viewport:** Vertical stack of full-screen “reel” cards. Each reel has:
  - Category/type icon (e.g. boat for travel, snowflake for winter)
  - Title (e.g. “Sindalah Island,” “Trojena”)
  - Media (image/video), optional labels (e.g. “Luxury”)
  - “Open” action (e.g. north_east icon) to open source
- **Interaction:** Swipe or drag to move between reels (reel track with transform-based sliding)

**Design:** Uses a distinct theme (e.g. teal/green gradient, “Sindalah Island Discovery”) to differentiate from the main Zuno light/dark theme—shows how the same content can be presented in a reels-style experience.

**User action:** Swipe vertically to move between items; tap open to go to source; optional tap on card for more detail.

---

## Content & Data

- **`assets/content.json`**  
  - App name, title, filters (All, Recent, Ideas, Research, Personal), and collections (id, title, count, icon, color, and theme classes for cards). Used by the Zuno (Home) screen.

- **`assets/feed.json`**  
  - List of feed items: id, title, description, imageUrl, sourceUrl, category, likes. Used by the Feed screen. In the app, these represent **related content from social media** (multiple platforms) personalized by the user’s personality inferred from their saved content—not the user’s saved items themselves.

- **Bookmarks**  
  - Feed bookmarks are stored in the browser’s `localStorage` under `feedBookmarks` (array of item ids).

In a full product:
- **Getting content in:** Users **share directly to Zuno from any social app** (Share → Zuno). Saved content lives in collections (Home); AI categorizes it; natural language search runs over it.
- **Feed content** is recommended from across social media (Instagram, YouTube, Facebook, Twitter/X, etc.) based on the user’s personality inferred from that saved content—so the feed is discovery, not a mirror of the saved library.

---

## User Flow (High Level)

1. **Open app** → Splash screen → Home (Zuno) or Feed.
2. **Saving content:** From any social app (Instagram, YouTube, Facebook, etc.), tap **Share** → **Share to Zuno**; the item is added to your Zuno library and categorized by AI.
3. **Home:** See collections (your saved content) and filters; tap a collection to see its content; use Add or Share to Zuno to save new content.
4. **Feed:** Scroll **personalized related content** from social media (based on your personality from saved content); use search (natural language); bookmark items; open source links.
5. **VFeed:** Same personalized related content in reels-style for video-heavy browsing.

---

## Summary

| Screen | Role |
|--------|------|
| **Splash** | Brand intro. |
| **Zuno (Home)** | Collections hub (your saved content) + filters (All, Recent, Ideas, Research, Personal). |
| **Feed** | Personalized related content from social media (by personality from saved content); search, bookmarks, source links. |
| **VFeed** | Same personalized related content in vertical, reels-style feed. |

*Note: `preview.html` is a dev-only preview board for viewing screens in a grid; it is not part of the app.*

Zuno is the **single place** to save and browse reels, shorts, articles, FB videos, and social posts. **Share content directly into Zuno from all different social media apps**; AI categorizes it and **natural language search** lets you find anything quickly—plus a **personalized Feed** of related content from across social media based on your personality.
