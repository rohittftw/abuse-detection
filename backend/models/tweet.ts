import mongoose, { Document, Schema } from 'mongoose';

// Interface for Tweet document
export interface ITweet extends Document {
  tweetId: string;
  text: string;
  createdAt: Date;
  fetchedAt: Date;
  sessionId: string; // Foreign key reference to AnalysisSession
  author: {
    id: string;
    name: string;
    username: string;
    verified: boolean;
  };
  publicMetrics: {
    retweetCount: number;
    likeCount: number;
    replyCount: number;
    quoteCount: number;
  };
  lang: string;
  hashtags: string[];
  query: string;
  analysis: {
    sentiment: {
      label: string;
      score: number;
    }[];
    abuse: {
      label: string;
      score: number;
    }[];
    riskLevel: 'low' | 'medium' | 'high' | 'unknown';
    confidence: number;
    analyzedAt: Date;
    error?: string;
  };
  isProcessed: boolean;
  metadata: {
    source: string;
    version: string;
    processingTime?: number;
  };
}

// Tweet Schema
const TweetSchema = new Schema<ITweet>({
  tweetId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 2000
  },
  createdAt: {
    type: Date,
    required: true
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
    ref: 'AnalysisSession'
  },
  author: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    username: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
  publicMetrics: {
    retweetCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
    quoteCount: { type: Number, default: 0 }
  },
  lang: {
    type: String,
    default: 'en',
    index: true
  },
  hashtags: [{
    type: String,
    index: true
  }],
  query: {
    type: String,
    required: true,
    index: true
  },
  analysis: {
    sentiment: [{
      label: { type: String, required: true },
      score: { type: Number, required: true, min: 0, max: 1 }
    }],
    abuse: [{
      label: { type: String, required: true },
      score: { type: Number, required: true, min: 0, max: 1 }
    }],
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'unknown'],
      default: 'unknown',
      index: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    analyzedAt: {
      type: Date,
      default: Date.now
    },
    error: String
  },
  isProcessed: {
    type: Boolean,
    default: true,
    index: true
  },
  metadata: {
    source: { type: String, default: 'twitter-api' },
    version: { type: String, default: '1.0' },
    processingTime: Number
  }
}, {
  timestamps: true,
  collection: 'tweets'
});

// Indexes for better query performance
TweetSchema.index({ createdAt: -1 });
TweetSchema.index({ fetchedAt: -1 });
TweetSchema.index({ sessionId: 1, createdAt: -1 });
TweetSchema.index({ 'analysis.riskLevel': 1, createdAt: -1 });
TweetSchema.index({ hashtags: 1, createdAt: -1 });
TweetSchema.index({ query: 1, createdAt: -1 });

export const Tweet = mongoose.model<ITweet>('Tweet', TweetSchema);
