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
