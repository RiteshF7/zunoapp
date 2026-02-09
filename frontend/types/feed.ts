// types/feed.ts

export type ContentType = "video" | "reel" | "article" | "thread" | "post" | "image" | "podcast" | "audio";

export type Platform = "youtube" | "instagram" | "twitter" | "facebook" | "linkedin" | "tiktok" | "reddit" | "pinterest" | "spotify" | "medium" | "other";

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  category: string;
  likes: number;
  platform: Platform;
  contentType: ContentType;
}

export interface FeedData {
  items: FeedItem[];
}

export interface FeedFilter {
  id: string;
  label: string;
  contentTypes?: ContentType[];
}

export const FEED_FILTERS: FeedFilter[] = [
  { id: "all", label: "All" },
  { id: "videos", label: "Videos", contentTypes: ["video", "reel"] },
  { id: "articles", label: "Articles", contentTypes: ["article"] },
  { id: "posts", label: "Posts", contentTypes: ["post", "thread"] },
  { id: "images", label: "Images", contentTypes: ["image"] },
  { id: "audio", label: "Audio", contentTypes: ["podcast", "audio"] },
];

// --- Content Feed (user's own saved content, latest-first) ---

/** Page size for the content feed infinite scroll */
export const CONTENT_FEED_PAGE_SIZE = 20;

/** Filter chip for the content feed */
export interface ContentFeedFilter {
  id: string;
  label: string;
  /** When set, maps to the `content_type` query param on the backend */
  contentType?: string;
  /** When set, maps to the `platform` query param on the backend */
  platform?: string;
}

/** Static list of content-feed filter chips */
export const CONTENT_FEED_FILTERS: ContentFeedFilter[] = [
  { id: "all", label: "All" },
  { id: "videos", label: "Videos", contentType: "video" },
  { id: "reels", label: "Reels", contentType: "reel" },
  { id: "articles", label: "Articles", contentType: "article" },
  { id: "posts", label: "Posts", contentType: "post" },
  { id: "images", label: "Images", contentType: "image" },
  { id: "audio", label: "Audio", contentType: "podcast" },
];
