import express from 'express';
import bodyParser from 'body-parser';
import modelRoutes from './routes/modelRoutes';
const app = express();
const port = 3001;

app.use(bodyParser.json());

app.use('/api', modelRoutes);

            
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 