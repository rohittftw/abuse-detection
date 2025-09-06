import { Tweet, ITweet } from '../models/tweet';
import { AnalysisSession, IAnalysisSession } from '../models/AnalysisSession';
import { ProcessedTweet, ProcessedResponse } from '../types/twitter';
import { v4 as uuidv4 } from 'uuid';

export class TweetService {

  // Save processed tweets to database
  static async saveTweets(processedResponse: ProcessedResponse, sessionName?: string): Promise<IAnalysisSession> {
    const sessionId = uuidv4();
    const startTime = Date.now();

    try {
      // Generate session name if not provided
      const generatedSessionName = sessionName || this.generateSessionName(processedResponse.meta.query, processedResponse.query_info.hashtag);

      // Create analysis session
      const session = new AnalysisSession({
        sessionId,
        sessionName: generatedSessionName,
        query: processedResponse.meta.query,
        hashtag: processedResponse.query_info.hashtag,
        maxResults: processedResponse.query_info.max_results,
        startedAt: new Date(),
        status: 'pending'
      });

      await session.save();

      // Extract hashtags from query
      const hashtags = this.extractHashtags(processedResponse.meta.query);

      // Save tweets
      const tweetPromises = processedResponse.data.map(async (processedTweet: ProcessedTweet) => {
        try {
          const tweet = new Tweet({
            tweetId: processedTweet.id,
            text: processedTweet.text,
            createdAt: new Date(processedTweet.created_at),
            fetchedAt: new Date(),
            sessionId: sessionId, // Add session reference
            author: processedTweet.author,
            publicMetrics: {
              retweetCount: processedTweet.public_metrics.retweet_count || 0,
              likeCount: processedTweet.public_metrics.like_count || 0,
              replyCount: processedTweet.public_metrics.reply_count || 0,
              quoteCount: processedTweet.public_metrics.quote_count || 0
            },
            lang: processedTweet.lang,
            hashtags,
            query: processedResponse.meta.query,
            analysis: {
              sentiment: processedTweet.analysis.sentiment,
              abuse: processedTweet.analysis.abuse,
              riskLevel: processedTweet.analysis.risk_level,
              confidence: processedTweet.analysis.confidence,
              analyzedAt: new Date(),
              error: processedTweet.analysis.error
            },
            isProcessed: !processedTweet.analysis.error,
            metadata: {
              source: 'twitter-api',
              version: '1.0',
              processingTime: Date.now() - startTime
            }
          });

          // Use upsert to avoid duplicates
          return await Tweet.findOneAndUpdate(
            { tweetId: processedTweet.id },
            tweet.toObject(),
            { upsert: true, new: true }
          );
        } catch (error) {
          console.error(`Failed to save tweet ${processedTweet.id}:`, error);
          return null;
        }
      });

      const savedTweets = await Promise.all(tweetPromises);
      const successfulSaves = savedTweets.filter(tweet => tweet !== null);

      // Calculate summary statistics
      const summary = this.calculateSummary(processedResponse.data);

      // Update session with results
      session.status = 'completed';
      session.completedAt = new Date();
      session.summary = {
        totalTweets: processedResponse.data.length,
        processedTweets: successfulSaves.length,
        failedAnalysis: processedResponse.meta.failed_analysis,
        riskDistribution: summary.riskDistribution,
        sentimentDistribution: summary.sentimentDistribution
      };
      session.processingTime = Date.now() - startTime;

      await session.save();
      return session;

    } catch (error) {
      console.error('Error saving tweets to database:', error);
      throw error;
    }
  }

  // Get tweets by various filters
  static async getTweets(filters: {
    hashtag?: string;
    riskLevel?: string;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ tweets: ITweet[], total: number }> {

    const query: any = {};

    if (filters.hashtag) {
      query.hashtags = { $in: [filters.hashtag] };
    }

    if (filters.riskLevel) {
      query['analysis.riskLevel'] = filters.riskLevel;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;

    const [tweets, total] = await Promise.all([
      Tweet.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .exec(),
      Tweet.countDocuments(query)
    ]);

    return { tweets, total };
  }

  // Get analysis sessions
  static async getAnalysisSessions(limit: number = 20): Promise<IAnalysisSession[]> {
    return await AnalysisSession.find()
      .sort({ startedAt: -1 })
      .limit(limit)
      .exec();
  }

  // Get tweets by session name
  static async getTweetsBySessionName(sessionName: string): Promise<{ tweets: ITweet[], session: IAnalysisSession | null }> {
    try {
      // Find session by name
      const session = await AnalysisSession.findOne({ sessionName }).exec();
      
      if (!session) {
        return { tweets: [], session: null };
      }

      // Get tweets for this session
      const tweets = await Tweet.find({ sessionId: session.sessionId })
        .sort({ createdAt: -1 })
        .exec();

      return { tweets, session };
    } catch (error) {
      console.error('Error fetching tweets by session name:', error);
      throw error;
    }
  }

  // Get tweets by session ID
  static async getTweetsBySessionId(sessionId: string): Promise<{ tweets: ITweet[], session: IAnalysisSession | null }> {
    try {
      // Find session by ID
      const session = await AnalysisSession.findOne({ sessionId }).exec();
      
      if (!session) {
        return { tweets: [], session: null };
      }

      // Get tweets for this session
      const tweets = await Tweet.find({ sessionId })
        .sort({ createdAt: -1 })
        .exec();

      return { tweets, session };
    } catch (error) {
      console.error('Error fetching tweets by session ID:', error);
      throw error;
    }
  }

  // Get all session names
  static async getSessionNames(): Promise<{ sessionId: string, sessionName: string, query: string, hashtag: string, startedAt: Date, tweetCount: number }[]> {
    try {
      const sessions = await AnalysisSession.find()
        .sort({ startedAt: -1 })
        .select('sessionId sessionName query hashtag startedAt')
        .lean()
        .exec();

      // Get tweet counts for each session
      const sessionsWithCounts = await Promise.all(
        sessions.map(async (session) => {
          const tweetCount = await Tweet.countDocuments({ sessionId: session.sessionId });
          return {
            sessionId: session.sessionId,
            sessionName: session.sessionName,
            query: session.query,
            hashtag: session.hashtag,
            startedAt: session.startedAt,
            tweetCount
          };
        })
      );

      return sessionsWithCounts;
    } catch (error) {
      console.error('Error fetching session names:', error);
      throw error;
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(): Promise<any> {
    const [
      totalTweets,
      highRiskTweets,
      recentSessions,
      riskDistribution,
      topHashtags
    ] = await Promise.all([
      Tweet.countDocuments(),
      Tweet.countDocuments({ 'analysis.riskLevel': 'high' }),
      AnalysisSession.countDocuments({
        startedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      Tweet.aggregate([
        {
          $group: {
            _id: '$analysis.riskLevel',
            count: { $sum: 1 }
          }
        }
      ]),
      Tweet.aggregate([
        { $unwind: '$hashtags' },
        {
          $group: {
            _id: '$hashtags',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    return {
      totalTweets,
      highRiskTweets,
      recentSessions,
      riskDistribution: riskDistribution.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topHashtags: topHashtags.map((item: any) => ({
        hashtag: item._id,
        count: item.count
      }))
    };
  }

  private static extractHashtags(query: string): string[] {
    const hashtags = query.match(/#\w+/g) || [];
    return hashtags.map(tag => tag.substring(1).toLowerCase());
  }

  private static generateSessionName(query: string, hashtag: string): string {
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Clean up the hashtag for display
    const cleanHashtag = hashtag.replace(/[#\s]/g, '').toLowerCase();
    
    return `${cleanHashtag}_${timestamp}`;
  }

  private static calculateSummary(tweets: ProcessedTweet[]) {
    const riskDistribution = { low: 0, medium: 0, high: 0, unknown: 0 };
    const sentimentDistribution = { positive: 0, negative: 0, neutral: 0, unknown: 0 };

    tweets.forEach(tweet => {
      // Risk distribution
      riskDistribution[tweet.analysis.risk_level]++;

      // Sentiment distribution
      const sentiment = tweet.analysis.sentiment[0]?.label?.toLowerCase() || 'unknown';
      if (sentiment.includes('positive')) {
        sentimentDistribution.positive++;
      } else if (sentiment.includes('negative')) {
        sentimentDistribution.negative++;
      } else if (sentiment.includes('neutral')) {
        sentimentDistribution.neutral++;
      } else {
        sentimentDistribution.unknown++;
      }
    });

    return { riskDistribution, sentimentDistribution };
  }
}
