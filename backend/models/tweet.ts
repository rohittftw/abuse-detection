import mongoose, { Document, Schema } from 'mongoose';

// Interface for analysis result
interface IAnalysisResult {
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
  modelVersions?: {
    sentiment: string;
    abuse: string;
  };
  error?: string;
}

// Interface for Tweet document
export interface ITweet extends Document {
  tweetId: string;
  text: string;
  createdAt: Date;
  fetchedAt: Date;
  sessionId: string; // Foreign key reference to AnalysisSession
  userId: mongoose.Types.ObjectId; // Owner of the tweet (denormalized for per-user queries)
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
  analysis: IAnalysisResult;
  analysisHistory?: IAnalysisResult[];
  isProcessed: boolean;
  metadata: {
    source: string;
    version: string;
    processingTime?: number;
  };
}

// Sub-schemas with _id disabled: Mongoose otherwise adds an ObjectId to every
// array item (sentiment, abuse, history), which is pure storage overhead.
const SentimentSchema = new Schema(
  {
    label: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false }
);

const AbuseSchema = new Schema(
  {
    label: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false }
);

const AnalysisResultSchema = new Schema(
  {
    sentiment: [SentimentSchema],
    abuse: [AbuseSchema],
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'unknown'],
      default: 'unknown',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    analyzedAt: {
      type: Date,
      default: Date.now,
    },
    modelVersions: {
      sentiment: { type: String, required: true },
      abuse: { type: String, required: true },
    },
    error: String,
  },
  { _id: false }
);

// Tweet Schema
const TweetSchema = new Schema<ITweet>(
  {
    tweetId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      // Standard X/Twitter limit. Capping prevents a single document from
      // growing without bound; the service truncates before saving.
      maxlength: 280,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    sessionId: {
      type: String,
      required: true,
      ref: 'AnalysisSession',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    author: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      username: { type: String, required: true },
      verified: { type: Boolean, default: false },
    },
    publicMetrics: {
      retweetCount: { type: Number, default: 0 },
      likeCount: { type: Number, default: 0 },
      replyCount: { type: Number, default: 0 },
      quoteCount: { type: Number, default: 0 },
    },
    lang: {
      type: String,
      default: 'en',
    },
    hashtags: [{ type: String }],
    query: {
      type: String,
      required: true,
    },
    analysis: {
      type: AnalysisResultSchema,
      required: true,
    },
    analysisHistory: {
      type: [AnalysisResultSchema],
      // Omit the empty array entirely instead of storing `analysisHistory: []`.
      default: undefined,
    },
    isProcessed: {
      type: Boolean,
      default: true,
    },
    metadata: {
      source: { type: String, default: 'twitter-api' },
      version: { type: String, default: '1.0' },
      processingTime: Number,
    },
  },
  {
    collection: 'tweets',
    // Do not store Mongoose's __v counter or an unused updatedAt timestamp.
    versionKey: false,
    timestamps: false,
    // Reject any field that is not explicitly modelled (e.g. raw Twitter payloads).
    strict: true,
    minimize: true,
  }
);

// Deliberately minimal index set. Every index roughly doubles write cost and
// storage, so only keep the ones used by the main access patterns:
//   - userId + tweetId (unique per user: the same tweet can be analyzed by
//     multiple accounts, but only once per account)
//   - userId + createdAt (a user's tweets, newest first)
//   - sessionId + createdAt (tweets for one session, newest first)
TweetSchema.index({ userId: 1, tweetId: 1 }, { unique: true });
TweetSchema.index({ userId: 1, createdAt: -1 });
TweetSchema.index({ sessionId: 1, createdAt: -1 });

export const Tweet = mongoose.model<ITweet>('Tweet', TweetSchema);
