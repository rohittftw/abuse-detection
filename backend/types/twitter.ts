// Twitter API Response Types
export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  verified?: boolean;
}

export interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  context_annotations?: Array<{
    domain: { id: string; name: string; description: string };
    entity: { id: string; name: string; description?: string };
  }>;
  lang?: string;
}

export interface TwitterApiResponse {
  data: TwitterTweet[];
  includes?: {
    users: TwitterUser[];
  };
  meta: {
    newest_id: string;
    oldest_id: string;
    result_count: number;
    next_token?: string;
  };
}

// AI Analysis Types
export interface SentimentResult {
  label: string;
  score: number;
}

export interface AbuseResult {
  label: string;
  score: number;
}

export interface ProcessedTweet {
  id: string;
  text: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    username: string;
    verified: boolean;
  };
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  lang: string;
  analysis: {
    sentiment: SentimentResult[];
    abuse: AbuseResult[];
    risk_level: 'low' | 'medium' | 'high' | 'unknown';
    confidence: number;
    error?: string;
  };
}

export interface ProcessedResponse {
  data: ProcessedTweet[];
  meta: {
    result_count: number;
    total_fetched: number;
    failed_analysis: number;
    query: string;
  };
  query_info: {
    hashtag: string;
    max_results: number;
    processed_at: string;
  };
}