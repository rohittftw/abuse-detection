import express from 'express';
import { predictAbuse, predictSentiment, fetchTweetsByHashtag } from '../Controller/modelController';

const router = express.Router();


router.post('/predict-abuse', async (req: express.Request, res: express.Response) => {
    const { text } = req.body;
    const result = await predictAbuse(text);
    res.json(result);
  });
  
router.post('/predict-sentiment', async (req: express.Request, res: express.Response) => {
    const { text } = req.body;
    const result = await predictSentiment(text);
    res.json(result);
  });

router.post('/fetch-tweets', async (req: express.Request, res: express.Response) => {
  const { hashtag } = req.body;
  try {
    const tweets = await fetchTweetsByHashtag(hashtag);
    res.json(tweets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

  export default router;