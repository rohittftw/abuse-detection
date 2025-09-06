from fastapi import FastAPI, Request
from pydantic import BaseModel, Field
from transformers import pipeline
import torch
from optimal_preprocessing import preprocess_for_twitter_roberta, preprocess_for_display
from typing import Optional
import time

# Set device to GPU if available
device = 0 if torch.cuda.is_available() else -1

app = FastAPI(
    title="TweetWatch ML API",
    description="University Project: Abuse Detection and Sentiment Analysis for Social Media",
    version="1.0.0"
)

# Load your models
print("Loading models...")
abuse_model = pipeline("text-classification", model="models/twitter-roberta-abuse", device=device)
sentiment_model = pipeline("text-classification", model="models/twitter-roberta-sentiment", device=device)
print("Models loaded successfully!")

class TextRequest(BaseModel):
    text: str = Field(..., description="Text to analyze", example="I love this! 😍 Great work @user #awesome")
    include_preprocessing_info: bool = Field(default=True, description="Include preprocessing details in response")

class AnalysisResponse(BaseModel):
    text_analysis: dict
    preprocessing_info: Optional[dict] = None
    model_info: dict
    processing_time_ms: float

@app.get("/")
def root():
    return {"message": "TweetWatch ML API - University Project", "status": "running"}

@app.post("/predict-abuse")
def predict_abuse(req: TextRequest):
    start_time = time.time()

    # Preprocess text
    processed_text = preprocess_for_twitter_roberta(req.text)
    preprocessing_info = preprocess_for_display(req.text) if req.include_preprocessing_info else None

    # Get prediction
    result = abuse_model(processed_text)

    processing_time = (time.time() - start_time) * 1000

    response = {
        "result": result,
        "input_text": processed_text,
        "processing_time_ms": round(processing_time, 2)
    }

    if preprocessing_info:
        response["preprocessing_info"] = preprocessing_info

    return response

@app.post("/predict-sentiment")
def predict_sentiment(req: TextRequest):
    start_time = time.time()

    # Preprocess text
    processed_text = preprocess_for_twitter_roberta(req.text)
    preprocessing_info = preprocess_for_display(req.text) if req.include_preprocessing_info else None

    # Get prediction
    result = sentiment_model(processed_text)

    processing_time = (time.time() - start_time) * 1000

    response = {
        "result": result,
        "input_text": processed_text,
        "processing_time_ms": round(processing_time, 2)
    }

    if preprocessing_info:
        response["preprocessing_info"] = preprocessing_info

    return response

@app.post("/analyze-both")
def analyze_both(req: TextRequest):
    """Analyze text for both abuse and sentiment - great for demos!"""
    start_time = time.time()

    processed_text = preprocess_for_twitter_roberta(req.text)
    preprocessing_info = preprocess_for_display(req.text) if req.include_preprocessing_info else None

    abuse_result = abuse_model(processed_text)
    sentiment_result = sentiment_model(processed_text)

    processing_time = (time.time() - start_time) * 1000

    response = {
        "input_text": processed_text,
        "abuse_detection": abuse_result,
        "sentiment_analysis": sentiment_result,
        "processing_time_ms": round(processing_time, 2),
        "summary": {
            "is_abusive": abuse_result[0]["label"] == "HATE" if abuse_result else False,
            "sentiment": sentiment_result[0]["label"] if sentiment_result else "UNKNOWN",
            "confidence_abuse": round(abuse_result[0]["score"], 3) if abuse_result else 0,
            "confidence_sentiment": round(sentiment_result[0]["score"], 3) if sentiment_result else 0
        }
    }

    if preprocessing_info:
        response["preprocessing_info"] = preprocessing_info

    return response

if __name__ == "__main__":
    import uvicorn
    print("Starting TweetWatch ML API for University Project...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
