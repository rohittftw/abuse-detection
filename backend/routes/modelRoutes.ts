import express from 'express';
import {
  predictAbuse,
  predictSentiment,
  fetchTweetsByHashtag,
  getTweetsFromDatabase,
  getAnalysisSessions,
  getDashboardStatistics,
  getTweetsBySessionName,
  getTweetsBySessionId,
  getAllSessionNames,
  reanalyzeSessionTweets
} from '../Controller/modelController';

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
    const { hashtag, query, maxResults = 10, saveToDb = true, sessionName } = req.body;

    // Accept either hashtag or query parameter
    const searchTerm = query || hashtag;
    
    if (!searchTerm || typeof searchTerm !== 'string') {
      return res.status(400).json({ error: 'Hashtag or query is required and must be a string' });
    }

    if (maxResults && (typeof maxResults !== 'number' || maxResults < 1 || maxResults > 100)) {
      return res.status(400).json({ error: 'maxResults must be a number between 1 and 100' });
    }

    console.log(`Fetching tweets for search term: "${searchTerm}" with maxResults: ${maxResults}, saveToDb: ${saveToDb}, sessionName: ${sessionName || 'auto-generated'}`);

    const tweets = await fetchTweetsByHashtag(searchTerm, maxResults, saveToDb, sessionName);
    res.json(tweets);
  } catch (error: any) {
    console.error('Fetch tweets error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Database query endpoints
router.get('/tweets', async (req: express.Request, res: express.Response) => {
  try {
    const {
      hashtag,
      riskLevel,
      limit = 50,
      offset = 0,
      startDate,
      endDate
    } = req.query;

    const filters: any = {};

    if (hashtag) filters.hashtag = hashtag as string;
    if (riskLevel) filters.riskLevel = riskLevel as string;
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const result = await getTweetsFromDatabase(filters);
    res.json(result);
  } catch (error: any) {
    console.error('Get tweets error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard/stats', async (req: express.Request, res: express.Response) => {
  try {
    const stats = await getDashboardStatistics();
    res.json(stats);
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Advanced analytics endpoints
router.get('/analytics/risk-trends', async (req: express.Request, res: express.Response) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days as string);

    // This would implement risk trend analysis over time
    // For now, return placeholder data
    const trendData = {
      period: `${daysNum} days`,
      trends: [
        { date: new Date().toISOString().split('T')[0], high: 0, medium: 0, low: 0 }
      ]
    };

    res.json(trendData);
  } catch (error: any) {
    console.error('Risk trends error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/sentiment-analysis', async (req: express.Request, res: express.Response) => {
  try {
    const { hashtag } = req.query;

    // This would implement detailed sentiment analysis
    // For now, return placeholder data
    const sentimentData = {
      hashtag: hashtag || 'all',
      analysis: {
        positive: 0,
        negative: 0,
        neutral: 0
      }
    };

    res.json(sentimentData);
  } catch (error: any) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Session-based endpoints
router.get('/sessions', async (req: express.Request, res: express.Response) => {
  try {
    const sessions = await getAllSessionNames();
    res.json(sessions);
  } catch (error: any) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/sessions/:sessionName/tweets', async (req: express.Request, res: express.Response) => {
  try {
    const { sessionName } = req.params;
    const result = await getTweetsBySessionName(sessionName);
    res.json(result);
  } catch (error: any) {
    console.error('Get tweets by session name error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/sessions/id/:sessionId/tweets', async (req: express.Request, res: express.Response) => {
  try {
    const { sessionId } = req.params;
    const result = await getTweetsBySessionId(sessionId);
    res.json(result);
  } catch (error: any) {
    console.error('Get tweets by session ID error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/sessions/:sessionName/reanalyze', async (req: express.Request, res: express.Response) => {
  try {
    const { sessionName } = req.params;
    const result = await reanalyzeSessionTweets(sessionName);
    res.json(result);
  } catch (error: any) {
    console.error('Reanalyze session tweets error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
