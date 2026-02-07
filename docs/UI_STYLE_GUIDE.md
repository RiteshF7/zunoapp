# Zuno UI Style Guide

Complete design system and UI guidelines for the Zuno project. All pages must follow this style guide to maintain consistency.

## Table of Contents
- [Overview](#overview)
- [Design Tokens](#design-tokens)
- [Typography](#typography)
- [Colors](#colors)
- [Spacing & Layout](#spacing--layout)
- [Components](#components)
- [Dark Mode](#dark-mode)
- [Required Dependencies](#required-dependencies)
- [Implementation Checklist](#implementation-checklist)

---

## Overview

Zuno uses a modern, clean design system built on Tailwind CSS with:
- **Dark mode support** with system preference detection
- **Material Icons Round** for iconography
- **Inter font family** for typography
- **Rounded corners** (1.25rem default, 1.5rem xl, 2rem 2xl)
- **Smooth transitions** (200ms duration)
- **Backdrop blur effects** for headers
- **Content-driven architecture** (JSON-based content)

---

## Design Tokens

### Custom Colors
```javascript
{
  primary: "#E2E8F0",           // Off-white/light gray for primary accent in dark mode
  "background-light": "#F8FAFC", // Light mode background
  "background-dark": "#1A1C1E",  // Dark mode background
  "card-dark": "#2D2F31",        // Dark mode card background
  "accent-blue": "#4D96FF"       // Primary accent blue
}
```

### Border Radius
- **Default**: `1.25rem` (20px)
- **XL**: `1.5rem` (24px)
- **2XL**: `2rem` (32px)

### Font Family
- **Display Font**: `Inter, sans-serif`
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

---

## Typography

### Headings
- **H1 (App Name)**: `text-xl font-bold tracking-tight`
- **H3 (Card Titles)**: `font-bold text-slate-800 dark:text-white text-lg leading-tight mb-1`
- **Body Text**: `text-sm text-slate-500 dark:text-slate-400`

### Text Colors
- **Light Mode**: 
  - Primary: `text-slate-900`
  - Secondary: `text-slate-800`
  - Tertiary: `text-slate-500`
  - Muted: `text-slate-400`
- **Dark Mode**:
  - Primary: `dark:text-slate-100`
  - Secondary: `dark:text-white`
  - Tertiary: `dark:text-slate-400`
  - Muted: `dark:text-slate-500`

---

## Colors

### Background Colors

#### Light Mode
- **Body**: `bg-background-light` (#F8FAFC)
- **Cards**: Color-specific (e.g., `bg-blue-50`, `bg-green-50`)
- **Header**: `bg-background-light/80` with `backdrop-blur-md`

#### Dark Mode
- **Body**: `bg-background-dark` (#1A1C1E)
- **Cards**: Custom dark colors (e.g., `dark:bg-[#2A303C]`)
- **Header**: `bg-background-dark/80` with `backdrop-blur-md`
- **Card Background**: `dark:bg-card-dark` (#2D2F31)

### Collection Card Color Themes

Each collection card uses a specific color theme with light and dark variants:

| Color | Light BG | Dark BG | Icon Light | Icon Dark |
|-------|----------|---------|------------|-----------|
| Blue | `bg-blue-50` | `dark:bg-[#2A303C]` | `text-blue-600` | `dark:text-blue-400` |
| Green | `bg-green-50` | `dark:bg-[#2A3430]` | `text-green-600` | `dark:text-green-400` |
| Purple | `bg-purple-50` | `dark:bg-[#342A38]` | `text-purple-600` | `dark:text-purple-400` |
| Amber | `bg-amber-50` | `dark:bg-[#38332A]` | `text-amber-600` | `dark:text-amber-400` |
| Rose | `bg-rose-50` | `dark:bg-[#382A2A]` | `text-rose-600` | `dark:text-rose-400` |
| Indigo | `bg-indigo-50` | `dark:bg-[#2A2E38]` | `text-indigo-600` | `dark:text-indigo-400` |

---

## Spacing & Layout

### Container Padding
- **Horizontal**: `px-6` (1.5rem / 24px)
- **Vertical**: `py-4` for headers, `py-2` for filters
- **Main Content**: `px-6 pb-32` (extra bottom padding for fixed button)

### Grid Layouts
- **Collection Cards**: `grid grid-cols-2 gap-4`
- **Card Height**: `h-48` (12rem / 192px)

### Gaps
- **Header Elements**: `gap-3` (0.75rem)
- **Button Groups**: `gap-4` (1rem)
- **Filter Buttons**: `gap-2` (0.5rem)

---

## Components

### Header

**Structure:**
```html
<header class="px-6 py-4 flex items-center justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-20">
```

**Avatar:**
- Size: `w-10 h-10` (2.5rem)
- Style: `rounded-full bg-gradient-to-tr from-accent-blue to-purple-500`
- Text: `text-white font-bold text-lg shadow-lg`

**App Name:**
- Style: `text-xl font-bold tracking-tight`

**Action Buttons:**
- Style: `p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors`
- Icons: Material Icons Round

### Filter Buttons

**Active State:**
```html
class="px-5 py-2.5 rounded-full bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 font-semibold text-sm whitespace-nowrap shadow-md"
```

**Inactive State:**
```html
class="px-5 py-2.5 rounded-full bg-slate-200 dark:bg-card-dark text-slate-600 dark:text-slate-400 font-medium text-sm whitespace-nowrap"
```

**Container:**
```html
class="px-6 py-2 overflow-x-auto no-scrollbar flex gap-2 mb-4"
```

### Collection Cards

**Structure:**
```html
<div class="[color-bg-light] [color-bg-dark] p-5 rounded-2xl flex flex-col justify-between h-48 active:scale-95 transition-all">
```

**Icon Container:**
```html
<div class="w-12 h-12 rounded-xl [icon-bg-light] [icon-bg-dark] flex items-center justify-center mb-4">
  <span class="material-icons-round [icon-color-light] [icon-color-dark]">[icon-name]</span>
</div>
```

**Content:**
```html
<div>
  <h3 class="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-1">[Title]</h3>
  <p class="text-sm text-slate-500 dark:text-slate-400">[Count] items</p>
</div>
```

### Primary Action Button

**Structure:**
```html
<button class="w-full bg-white dark:bg-slate-100 text-slate-900 py-4 px-8 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-transform">
  <span class="material-icons-round text-2xl">add</span>
  <span class="font-bold tracking-tight">Add New</span>
</button>
```

**Container:**
```html
<div class="fixed bottom-8 left-0 right-0 px-6">
```

### Settings Dropdown

**Container:**
```html
<div class="hidden absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-card-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-30">
```

**Menu Item:**
```html
<button class="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
```

---

## Dark Mode

### Implementation
- Uses Tailwind's `dark:` prefix
- Toggle via `dark` class on `<html>` element
- System preference detection with localStorage persistence

### Required Script
```javascript
// Get saved theme preference or default to system preference
function getInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Apply theme
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
}
```

### Body Classes
```html
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200">
```

---

## Required Dependencies

### CDN Links (Include in `<head>`)
```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>

<!-- Inter Font -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>

<!-- Material Icons Round -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
```

### Tailwind Config
```javascript
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#E2E8F0",
        "background-light": "#F8FAFC",
        "background-dark": "#1A1C1E",
        "card-dark": "#2D2F31",
        "accent-blue": "#4D96FF",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1.25rem",
        "xl": "1.5rem",
        "2xl": "2rem",
      },
    },
  },
};
```

### Custom Styles
```css
body {
    font-family: 'Inter', sans-serif;
    -webkit-tap-highlight-color: transparent;
    min-height: max(884px, 100dvh);
}

.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
```

---

## Implementation Checklist

When creating a new HTML page, ensure:

- [ ] Include all required CDN links (Tailwind, Inter font, Material Icons)
- [ ] Include Tailwind config with custom colors and border radius
- [ ] Include custom CSS styles (body, no-scrollbar)
- [ ] Body element has correct classes for dark mode support
- [ ] All colors use the design system tokens
- [ ] All spacing follows the spacing guidelines
- [ ] Border radius uses custom values (1.25rem default)
- [ ] Typography uses Inter font family
- [ ] Icons use Material Icons Round
- [ ] Dark mode classes are applied to all elements
- [ ] Transitions use `duration-200`
- [ ] Buttons have `active:scale-95` for touch feedback
- [ ] Headers use backdrop blur (`backdrop-blur-md`)
- [ ] Content is loaded from JSON files when applicable

---

## Content Architecture

### JSON Structure
Content should be separated into JSON files following this structure:
```json
{
  "app": {
    "name": "Zuno",
    "avatar": "Z",
    "title": "Page Title"
  },
  "filters": [...],
  "collections": [...],
  "actions": {...}
}
```

### Dynamic Rendering
- Use JavaScript to load and render content from JSON
- Maintain consistent structure across all pages
- Use IDs for dynamic content updates

---

## Best Practices

1. **Consistency**: Always use the design tokens, never hardcode colors or spacing
2. **Dark Mode**: Every element must have dark mode variants
3. **Accessibility**: Maintain proper contrast ratios in both modes
4. **Responsive**: Use Tailwind's responsive utilities when needed
5. **Performance**: Minimize custom CSS, prefer Tailwind utilities
6. **Content Separation**: Keep content in JSON files, not HTML
7. **Transitions**: Use smooth transitions (200ms) for state changes
8. **Touch Feedback**: Add `active:scale-95` to interactive elements

---

## Examples

### Complete Header Example
```html
<header class="px-6 py-4 flex items-center justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-20">
  <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-blue to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
      Z
    </div>
    <h1 class="text-xl font-bold tracking-tight">Zuno</h1>
  </div>
  <div class="flex gap-4">
    <button class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
      <span class="material-icons-round">search</span>
    </button>
  </div>
</header>
```

### Collection Card Example
```html
<div class="bg-blue-50 dark:bg-[#2A303C] p-5 rounded-2xl flex flex-col justify-between h-48 active:scale-95 transition-all">
  <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
    <span class="material-icons-round text-blue-600 dark:text-blue-400">gavel</span>
  </div>
  <div>
    <h3 class="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-1">Legal Cases</h3>
    <p class="text-sm text-slate-500 dark:text-slate-400">12 items</p>
  </div>
</div>
```

---

**Last Updated**: 2024
**Version**: 1.0.0
