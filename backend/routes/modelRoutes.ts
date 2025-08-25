import express from 'express';
import { predictAbuse, predictSentiment, fetchTweetsByHashtag } from '../Controller/modelController';

const router = express.Router();

// Individual prediction endpoints
router.post('/predict-abuse', async (req: express.Request, res: express.Response) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }
    
    const result = await predictAbuse(text);
    res.json(result);
  } catch (error: any) {
    console.error('Abuse prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/predict-sentiment', async (req: express.Request, res: express.Response) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }
    
    const result = await predictSentiment(text);
    res.json(result);
  } catch (error: any) {
    console.error('Sentiment prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Twitter API endpoints
router.post('/fetch-tweets', async (req: express.Request, res: express.Response) => {
  try {
    const { hashtag, maxResults = 10 } = req.body;
    
    if (!hashtag || typeof hashtag !== 'string') {
      return res.status(400).json({ error: 'Hashtag is required and must be a string' });
    }
    
    if (maxResults && (typeof maxResults !== 'number' || maxResults < 1 || maxResults > 100)) {
      return res.status(400).json({ error: 'maxResults must be a number between 1 and 100' });
    }
    
    console.log(`Fetching tweets for hashtag: "${hashtag}" with maxResults: ${maxResults}`);
    
    const tweets = await fetchTweetsByHashtag(hashtag, maxResults);
    res.json(tweets);
  } catch (error: any) {
    console.error('Fetch tweets error:', error);
    res.status(500).json({ error: error.message });
  }
});
