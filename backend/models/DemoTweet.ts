import mongoose, { Document, Schema } from 'mongoose';

/**
 * A raw, unanalysed tweet that stands in for a live Twitter/X API result.
 *
 * This collection is a fetch source, not a result store:
 *   - documents are shared and owned by nobody (`userId`/`sessionId` are absent)
 *   - they contain exactly the fields the Twitter API returns for a tweet plus
 *     its expanded author
 *   - there is no analysis here. When a user fetches tweets, the normal
 *     fetch-and-analyse pipeline scores them and writes the results to that
 *     user's own `tweets` collection.
 */
export interface IDemoTweet extends Document {
  /** Same as the Twitter tweet id. */
  tweetId: string;
  text: string;
  createdAt: Date;
  /** Same as `author_id` in the Twitter API payload. */
  authorId: string;
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
}

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
    authorId: {
      type: String,
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
