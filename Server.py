from fastapi import FastAPI, Request
from pydantic import BaseModel
from transformers import pipeline
import torch

# Set device to GPU if available
device = 0 if torch.cuda.is_available() else -1

app = FastAPI()

# Load your models (example)
abuse_model = pipeline("text-classification", model="models/twitter-roberta-abuse", device=device)
sentiment_model = pipeline("text-classification", model="models/twitter-roberta-sentiment", device=device)

class TextRequest(BaseModel):
    text: str

@app.post("/predict-abuse")
def predict_abuse(req: TextRequest):
    result = abuse_model(req.text)
    return {"result": result}

@app.post("/predict-sentiment")
def predict_sentiment(req: TextRequest):
    result = sentiment_model(req.text)
    return {"result": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)