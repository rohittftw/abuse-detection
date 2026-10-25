import mongoose, { Document, Schema } from 'mongoose';

export interface IDemoTweet extends Document {
  tweetId: string;
  text: string;
  createdAt: Date;
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
  topic: string;
  region: string;
  /**
   * Intended label for QA. The app does not read this field; it is only here
   * so the seed data can be checked against the model's output.
   */
  expectedRisk: 'low' | 'medium' | 'high' | 'unknown';
}

/**
 * Raw, shared demo tweets used when the Twitter API is unavailable.
 * These documents are intentionally not owned by a user and have no session.
 * The normal fetch-and-analyze flow copies them into the caller's session.
 */
const DemoTweetSchema = new Schema<IDemoTweet>(
  {
    tweetId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 280,
    },
    createdAt: {
      type: Date,
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
    topic: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    expectedRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'unknown'],
      default: 'low',
    },
  },
  {
    collection: 'demo_tweets',
    versionKey: false,
    timestamps: false,
    strict: true,
    minimize: true,
  }
);

// Only the seed upsert needs an index; the collection is small enough to scan.
DemoTweetSchema.index({ tweetId: 1 }, { unique: true });

export const DemoTweet = mongoose.model<IDemoTweet>(
  'DemoTweet',
  DemoTweetSchema
);
