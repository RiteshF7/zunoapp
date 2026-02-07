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
