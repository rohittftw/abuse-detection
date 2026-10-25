import { DemoTweet } from '../models/DemoTweet';

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Turns a user search term into tokens that can match demo tweets.
 * Strips hashtags, quotes, and Twitter operators such as `lang:en`.
 */
const tokenize = (term: string): string[] =>
  term
    .toLowerCase()
    .replace(/\b[a-z-]+:\S+/g, ' ')
    .replace(/[#"']/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

export type DemoFetchResult = {
  /** Raw tweets in the same shape the Twitter API returns. */
  tweets: any[];
  /** Author records for the user-expansion lookup. */
  users: any[];
};

export class DemoTweetService {
  /**
   * Returns up to `limit` shared demo tweets, preferring ones that match the
   * search term. Falls back to a random sample when nothing matches.
   */
  static async fetchForQuery(
    term: string,
    limit: number
  ): Promise<DemoFetchResult> {
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const tokens = tokenize(term);

    // The analysis models are English-only, so never hand them non-English
    // text. Multilingual rows can stay in the collection for later use.
    const englishOnly = { lang: 'en' };

    let docs = tokens.length
      ? await DemoTweet.aggregate([
          {
            $match: {
              ...englishOnly,
              $or: [
                { hashtags: { $in: tokens } },
                {
                  text: {
                    $in: tokens.map(
                      (token) => new RegExp(escapeRegex(token), 'i')
                    ),
                  },
                },
              ],
            },
          },
          { $sample: { size: safeLimit } },
        ])
      : [];

    if (docs.length === 0) {
      docs = await DemoTweet.aggregate([
        { $match: englishOnly },
        { $sample: { size: safeLimit } },
      ]);
    }

    const usersById = new Map<string, any>();

    const tweets = docs.map((doc: any) => {
      usersById.set(doc.authorId, {
        id: doc.authorId,
        name: doc.author.name,
        username: doc.author.username,
        verified: doc.author.verified,
      });

      return {
        id: doc.tweetId,
        text: doc.text,
        created_at: doc.createdAt.toISOString(),
        author_id: doc.authorId,
        public_metrics: {
          retweet_count: doc.publicMetrics.retweetCount || 0,
          like_count: doc.publicMetrics.likeCount || 0,
          reply_count: doc.publicMetrics.replyCount || 0,
          quote_count: doc.publicMetrics.quoteCount || 0,
        },
        lang: doc.lang,
        hashtags: doc.hashtags || [],
      };
    });

    return { tweets, users: Array.from(usersById.values()) };
  }
}
