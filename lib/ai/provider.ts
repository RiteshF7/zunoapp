// lib/ai/provider.ts

export interface AICategorizationResult {
  category: string;
  confidence: number;
}

export interface AISummaryResult {
  summary: string;
}

export interface AITagsResult {
  tags: string[];
}

export interface AIEmbeddingResult {
  embedding: number[];
}

export interface AIProcessResult {
  category: string;
  summary: string;
  tags: string[];
  embedding: number[];
  title?: string;
  description?: string;
  thumbnail_url?: string;
}

export interface AIProvider {
  categorize(text: string): Promise<AICategorizationResult>;
  summarize(text: string): Promise<AISummaryResult>;
  generateTags(text: string): Promise<AITagsResult>;
  generateEmbedding(text: string): Promise<AIEmbeddingResult>;
}
