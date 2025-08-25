import axios from 'axios';

export const predictAbuse = async (text: string) => {
  try {
    const response = await axios.post('http://localhost:8000/predict-abuse', { text });
    return response.data;
  } catch (error) {
    throw new Error('Error communicating with Python abuse model');
  }
};

export const predictSentiment = async (text: string) => {
  try {
    const response = await axios.post('http://localhost:8000/predict-sentiment', { text });
    return response.data;
  } catch (error) {
    throw new Error('Error communicating with Python sentiment model');
  }
};

export const fetchTweetsByHashtag = async (hashtag: string) => {
  const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
  if (!BEARER_TOKEN) {
    throw new Error('Twitter Bearer Token not set in environment variables');
  }
  const url = `https://api.twitter.com/2/tweets/search/recent?query=%23${encodeURIComponent(hashtag)}&max_results=10`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
      },
    });
    // For each tweet, call predictAbuse and predictSentiment, and attach results
    const tweets = response.data.data || [];
    const results = await Promise.all(
      tweets.map(async (tweet: any) => {
        const sentiment = await predictSentiment(tweet.text);
        const abuse = await predictAbuse(tweet.text);
        return {
          ...tweet,
          sentiment: sentiment.result,
          abuse: abuse.result,
        };
      })
    );
  
    return {
      ...response.data,
      data: results,
    };
  } catch (error) {
    throw new Error('Error fetching tweets from Twitter API');
  }
};

