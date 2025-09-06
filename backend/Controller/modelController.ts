import axios from 'axios';
import { TweetService } from '../services/tweetService';

const PYTHON_ML_SERVICE_URL = process.env.PYTHON_ML_SERVICE_URL || 'http://localhost:8000';

export const predictAbuse = async (text: string) => {
  try {
    const response = await axios.post(`${PYTHON_ML_SERVICE_URL}/predict-abuse`, { text });
    return response.data;
  } catch (error) {
    console.error('Error in predictAbuse:', error);
    throw new Error('Error communicating with Python abuse model');
  }
};

export const predictSentiment = async (text: string) => {
  try {
    const response = await axios.post(`${PYTHON_ML_SERVICE_URL}/predict-sentiment`, { text });
    return response.data;
  } catch (error) {
    console.error('Error in predictSentiment:', error);
    throw new Error('Error communicating with Python sentiment model');
  }
};

export const fetchTweetsByHashtag = async (
  hashtag: string,
  maxResults: number = 10,
  saveToDb: boolean = true,
  sessionName?: string
) => {
  const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

  if (!BEARER_TOKEN) {
    throw new Error("Twitter Bearer Token not set in environment variables");
  }

  // Clean hashtag - remove # if present
  const cleanHashtag = hashtag.startsWith("#") ? hashtag.slice(1) : hashtag;

  // Build query - search for hashtag or keyword
  const query = cleanHashtag.includes(" ")
    ? `"${cleanHashtag}"`
    : `#${cleanHashtag}`;

  const url = `https://api.x.com/2/tweets/search/recent`;
  const params = {
    query: query,
    max_results: Math.min(maxResults, 100),
    "tweet.fields":
      "created_at,author_id,public_metrics,context_annotations,lang",
    "user.fields": "name,username,verified",
    expansions: "author_id",
  };

  try {
    console.log(
      `Fetching tweets for query: "${query}" with max_results: ${params.max_results}`
    );

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      params: params,
    });

    console.log(`Twitter API Response Status: ${response.status}`);

    const tweets = response.data.data || [];
    const users = response.data.includes?.users || [];

    if (tweets.length === 0) {
      return {
        data: [],
        meta: { result_count: 0 },
        message: "No tweets found for this query",
      };
    }

    console.log(`Processing ${tweets.length} tweets for AI analysis...`);

    // Create user lookup map
    const userMap = users.reduce((acc: any, user: any) => {
      acc[user.id] = user;
      return acc;
    }, {});

    // Process tweets with AI analysis
    const results = await Promise.allSettled(
      tweets.map(async (tweet: any) => {
        try {
          const user = userMap[tweet.author_id] || {};

          // Run AI analysis
          const [sentimentResult, abuseResult] = await Promise.all([
            predictSentiment(tweet.text).catch((err) => {
              console.error("Sentiment analysis failed:", err);
              return { result: [{ label: "UNKNOWN", score: 0 }] };
            }),
            predictAbuse(tweet.text).catch((err) => {
              console.error("Abuse detection failed:", err);
              return { result: [{ label: "NOT_HATE", score: 0 }] };
            }),
          ]);

          return {
            id: tweet.id,
            text: tweet.text,
            created_at: tweet.created_at,
            author: {
              id: tweet.author_id,
              name: user.name || "Unknown",
              username: user.username || "unknown",
              verified: user.verified || false,
            },
            public_metrics: tweet.public_metrics || {},
            lang: tweet.lang || "en",
            analysis: {
              sentiment: sentimentResult.result,
              abuse: abuseResult.result,
              risk_level:
                abuseResult.result[0]?.label === "HATE" ? "high" : "low",
              confidence: Math.max(
                sentimentResult.result[0]?.score || 0,
                abuseResult.result[0]?.score || 0
              ),
            },
          };
        } catch (error) {
          console.error("Error processing tweet:", error);
          return {
            id: tweet.id,
            text: tweet.text,
            created_at: tweet.created_at,
            author: {
              id: tweet.author_id,
              name: "Unknown",
              username: "unknown",
            },
            analysis: {
              sentiment: [{ label: "ERROR", score: 0 }],
              abuse: [{ label: "ERROR", score: 0 }],
              risk_level: "unknown",
              confidence: 0,
              error: "Analysis failed",
            },
          };
        }
      })
    );

    // Filter successful results
    const successfulResults = results
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === "fulfilled"
      )
      .map((result) => result.value);

    const failedCount = results.length - successfulResults.length;
    if (failedCount > 0) {
      console.warn(`${failedCount} tweets failed processing`);
    }

    // --- Aggregation helpers ---
    function aggregateScores(resultsArr: any[], key: "sentiment" | "abuse") {
      const labelScores: Record<
        string,
        { total: number; count: number }
      > = {};
      resultsArr.forEach((tweet) => {
        if (tweet.analysis && Array.isArray(tweet.analysis[key])) {
          tweet.analysis[key].forEach((item: any) => {
            if (!labelScores[item.label]) {
              labelScores[item.label] = { total: 0, count: 0 };
            }
            labelScores[item.label].total += item.score;
            labelScores[item.label].count += 1;
          });
        }
      });
      return Object.entries(labelScores).map(([label, { total, count }]) => ({
        label,
        score: count > 0 ? total / count : 0,
      }));
    }

    function aggregateRiskLevel(resultsArr: any[]) {
      return resultsArr.some(
        (tweet) => tweet.analysis && tweet.analysis.risk_level === "high"
      )
        ? "high"
        : "low";
    }

    function aggregateConfidence(resultsArr: any[]) {
      return resultsArr.reduce((max, tweet) => {
        if (tweet.analysis && typeof tweet.analysis.confidence === "number") {
          return Math.max(max, tweet.analysis.confidence);
        }
        return max;
      }, 0);
    }

    function getDominantLabel(
      averagedScores: { label: string; score: number }[]
    ) {
      if (!averagedScores.length) return { label: "UNKNOWN", score: 0 };
      return averagedScores.reduce((best, curr) =>
        curr.score > best.score ? curr : best
      );
    }

    // --- Build overall analysis ---
    const avgSentiment = aggregateScores(successfulResults, "sentiment");
    const avgAbuse = aggregateScores(successfulResults, "abuse");

    const dominantSentiment = getDominantLabel(avgSentiment);
    const dominantAbuse = getDominantLabel(avgAbuse);

    const overallAnalysis = {
      sentiment: avgSentiment,
      abuse: avgAbuse,
      risk_level: aggregateRiskLevel(successfulResults),
      confidence: aggregateConfidence(successfulResults),
      overall_sentiment: dominantSentiment.label,
      overall_abuse: dominantAbuse.label,
    };

    const processedResponse = {
      data: successfulResults,
      overall: overallAnalysis,
      meta: {
        result_count: successfulResults.length,
        total_fetched: tweets.length,
        failed_analysis: failedCount,
        query: query,
      },
      query_info: {
        hashtag: cleanHashtag,
        max_results: maxResults,
        processed_at: new Date().toISOString(),
      },
    };

    // Save to database if requested
    let session = null;
    if (saveToDb && successfulResults.length > 0) {
      try {
        console.log("Saving tweets and analysis to database...");
        session = await TweetService.saveTweets(processedResponse, sessionName);
        console.log(
          `✅ Saved ${successfulResults.length} tweets to database with session ID: ${session.sessionId}`
        );
      } catch (dbError) {
        console.error("Failed to save to database:", dbError);
      }
    }

    return {
      ...processedResponse,
      session: session
        ? {
            sessionId: session.sessionId,
            status: session.status,
            savedTweets: session.summary.processedTweets,
          }
        : null,
    };
  } catch (error) {
    console.error("Twitter API Error:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message;

      if (status === 401) {
        throw new Error(
          "Twitter API authentication failed. Please check your Bearer Token."
        );
      } else if (status === 429) {
        throw new Error(
          "Twitter API rate limit exceeded. Please try again later."
        );
      } else if (status === 400) {
        throw new Error(`Invalid request to Twitter API: ${message}`);
      } else {
        throw new Error(`Twitter API error (${status}): ${message}`);
      }
    }

    throw new Error(
      `Error fetching tweets: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};


// New functions for database operations
export const getTweetsFromDatabase = async (filters: any) => {
  try {
    return await TweetService.getTweets(filters);
  } catch (error) {
    console.error('Error fetching tweets from database:', error);
    throw new Error('Error fetching tweets from database');
  }
};

export const getAnalysisSessions = async (limit: number = 20) => {
  try {
    return await TweetService.getAnalysisSessions(limit);
  } catch (error) {
    console.error('Error fetching analysis sessions:', error);
    throw new Error('Error fetching analysis sessions');
  }
};

export const getDashboardStatistics = async () => {
  try {
    return await TweetService.getDashboardStats();
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    throw new Error('Error fetching dashboard statistics');
  }
};

// New session-based functions
export const getTweetsBySessionName = async (sessionName: string) => {
  try {
    return await TweetService.getTweetsBySessionName(sessionName);
  } catch (error) {
    console.error('Error fetching tweets by session name:', error);
    throw new Error('Error fetching tweets by session name');
  }
};

export const getTweetsBySessionId = async (sessionId: string) => {
  try {
    return await TweetService.getTweetsBySessionId(sessionId);
  } catch (error) {
    console.error('Error fetching tweets by session ID:', error);
    throw new Error('Error fetching tweets by session ID');
  }
};

export const getAllSessionNames = async () => {
  try {
    return await TweetService.getSessionNames();
  } catch (error) {
    console.error('Error fetching session names:', error);
    throw new Error('Error fetching session names');
  }
};

// Re-analyze tweets from a session
export const reanalyzeSessionTweets = async (sessionName: string) => {
  try {
    // Get tweets from the session
    const { tweets, session } = await TweetService.getTweetsBySessionName(sessionName);
    
    if (!session || tweets.length === 0) {
      throw new Error('Session not found or no tweets available');
    }

    // Process tweets with AI analysis (re-run analysis)
    const results = await Promise.allSettled(
      tweets.map(async (tweet: any) => {
        try {
          // Run AI analysis
          const [sentimentResult, abuseResult] = await Promise.all([
            predictSentiment(tweet.text).catch(err => {
              console.error('Sentiment analysis failed:', err);
              return { result: [{ label: 'UNKNOWN', score: 0 }] };
            }),
            predictAbuse(tweet.text).catch(err => {
              console.error('Abuse detection failed:', err);
              return { result: [{ label: 'NOT_HATE', score: 0 }] };
            })
          ]);

          return {
            id: tweet.tweetId,
            text: tweet.text,
            created_at: tweet.createdAt.toISOString(),
            author: tweet.author,
            public_metrics: {
              retweet_count: tweet.publicMetrics.retweetCount,
              like_count: tweet.publicMetrics.likeCount,
              reply_count: tweet.publicMetrics.replyCount,
              quote_count: tweet.publicMetrics.quoteCount
            },
            lang: tweet.lang,
            analysis: {
              sentiment: sentimentResult.result,
              abuse: abuseResult.result,
              risk_level: abuseResult.result[0]?.label === 'HATE' ? 'high' : 'low',
              confidence: Math.max(
                sentimentResult.result[0]?.score || 0,
                abuseResult.result[0]?.score || 0
              )
            }
          };
        } catch (error) {
          console.error('Error processing tweet:', error);
          return {
            id: tweet.tweetId,
            text: tweet.text,
            created_at: tweet.createdAt.toISOString(),
            author: tweet.author,
            analysis: {
              sentiment: [{ label: 'ERROR', score: 0 }],
              abuse: [{ label: 'ERROR', score: 0 }],
              risk_level: 'unknown',
              confidence: 0,
              error: 'Analysis failed'
            }
          };
        }
      })
    );

    // Filter successful results
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);

    // Calculate overall analysis
    const avgSentiment = aggregateScores(successfulResults, 'sentiment');
    const avgAbuse = aggregateScores(successfulResults, 'abuse');
    const dominantSentiment = getDominantLabel(avgSentiment);
    const dominantAbuse = getDominantLabel(avgAbuse);

    const overallAnalysis = {
      sentiment: avgSentiment,
      abuse: avgAbuse,
      risk_level: aggregateRiskLevel(successfulResults),
      confidence: aggregateConfidence(successfulResults),
      overall_sentiment: dominantSentiment.label,
      overall_abuse: dominantAbuse.label,
    };

    return {
      data: successfulResults,
      overall: overallAnalysis,
      meta: {
        result_count: successfulResults.length,
        total_fetched: tweets.length,
        failed_analysis: results.length - successfulResults.length,
        query: session.query,
      },
      query_info: {
        hashtag: session.hashtag,
        max_results: session.maxResults,
        processed_at: new Date().toISOString(),
        session_name: session.sessionName,
        session_id: session.sessionId
      },
      session: {
        sessionId: session.sessionId,
        sessionName: session.sessionName,
        status: session.status,
        startedAt: session.startedAt
      }
    };

  } catch (error) {
    console.error('Error re-analyzing session tweets:', error);
    throw new Error('Error re-analyzing session tweets');
  }
};

// Helper functions for aggregation (reused from fetchTweetsByHashtag)
function aggregateScores(resultsArr: any[], key: 'sentiment' | 'abuse') {
  const labelScores: Record<string, { total: number; count: number }> = {};
  resultsArr.forEach((tweet) => {
    if (tweet.analysis && Array.isArray(tweet.analysis[key])) {
      tweet.analysis[key].forEach((item: any) => {
        if (!labelScores[item.label]) {
          labelScores[item.label] = { total: 0, count: 0 };
        }
        labelScores[item.label].total += item.score;
        labelScores[item.label].count += 1;
      });
    }
  });
  return Object.entries(labelScores).map(([label, { total, count }]) => ({
    label,
    score: count > 0 ? total / count : 0,
  }));
}

function aggregateRiskLevel(resultsArr: any[]) {
  return resultsArr.some(
    (tweet) => tweet.analysis && tweet.analysis.risk_level === 'high'
  )
    ? 'high'
    : 'low';
}

function aggregateConfidence(resultsArr: any[]) {
  return resultsArr.reduce((max, tweet) => {
    if (tweet.analysis && typeof tweet.analysis.confidence === 'number') {
      return Math.max(max, tweet.analysis.confidence);
    }
    return max;
  }, 0);
}

function getDominantLabel(averagedScores: { label: string; score: number }[]) {
  if (!averagedScores.length) return { label: 'UNKNOWN', score: 0 };
  return averagedScores.reduce((best, curr) =>
    curr.score > best.score ? curr : best
  );
}
