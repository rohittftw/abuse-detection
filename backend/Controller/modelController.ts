import axios from 'axios';

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

export const fetchTweetsByHashtag = async (hashtag: string, maxResults: number = 10) => {
  const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
  
  if (!BEARER_TOKEN) {
    throw new Error('Twitter Bearer Token not set in environment variables');
  }
  
  // Clean hashtag - remove # if present
  const cleanHashtag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;
  
  // Build query - search for hashtag or keyword
  const query = cleanHashtag.includes(' ') 
    ? `"${cleanHashtag}"` // Use quotes for multi-word phrases
    : `#${cleanHashtag}`; // Use hashtag for single words
  
  const url = `https://api.twitter.com/2/tweets/search/recent`;
  const params = {
    query: query,
    max_results: Math.min(maxResults, 100), // Twitter API limit is 100
    'tweet.fields': 'created_at,author_id,public_metrics,context_annotations,lang',
    'user.fields': 'name,username,verified',
    expansions: 'author_id'
  };
  
  try {
    console.log(`Fetching tweets for query: "${query}" with max_results: ${params.max_results}`);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
      params: params
    });
    
    console.log(`Twitter API Response Status: ${response.status}`);
    
    const tweets = response.data.data || [];
    const users = response.data.includes?.users || [];
    
    if (tweets.length === 0) {
      return {
        data: [],
        meta: { result_count: 0 },
        message: 'No tweets found for this query'
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
          // Get user info
          const user = userMap[tweet.author_id] || {};
          
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
            id: tweet.id,
            text: tweet.text,
            created_at: tweet.created_at,
            author: {
              id: tweet.author_id,
              name: user.name || 'Unknown',
              username: user.username || 'unknown',
              verified: user.verified || false
            },
            public_metrics: tweet.public_metrics || {},
            lang: tweet.lang || 'en',
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
            id: tweet.id,
            text: tweet.text,
            created_at: tweet.created_at,
            author: { id: tweet.author_id, name: 'Unknown', username: 'unknown' },
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
    
    const failedCount = results.length - successfulResults.length;
    if (failedCount > 0) {
      console.warn(`${failedCount} tweets failed processing`);
    }
    
    return {
      data: successfulResults,
      meta: {
        result_count: successfulResults.length,
        total_fetched: tweets.length,
        failed_analysis: failedCount,
        query: query
      },
      query_info: {
        hashtag: cleanHashtag,
        max_results: maxResults,
        processed_at: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('Twitter API Error:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.detail || error.response?.data?.error || error.message;
      
      if (status === 401) {
        throw new Error('Twitter API authentication failed. Please check your Bearer Token.');
      } else if (status === 429) {
        throw new Error('Twitter API rate limit exceeded. Please try again later.');
      } else if (status === 400) {
        throw new Error(`Invalid request to Twitter API: ${message}`);
      } else {
        throw new Error(`Twitter API error (${status}): ${message}`);
      }
    }
    
    throw new Error(`Error fetching tweets: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }