# This goes in: BT_Project/project 2/optimal_preprocessing.py
# (Same directory as your current Server.py)

import re
import unicodedata
from typing import Optional

def preprocess_for_twitter_roberta(text: str) -> str:
    """
    Optimal preprocessing for Twitter-RoBERTa models
    These models were trained on raw tweets, so minimal preprocessing works best
    """
    if not text or not isinstance(text, str):
        return ""

    # 1. Normalize unicode (essential for consistency)
    text = unicodedata.normalize('NFKC', text)

    # 2. Keep emojis as-is (RoBERTa tokenizer handles them well)
    # No emoji processing needed!

    # 3. Handle URLs - replace with placeholder (models expect this)
    text = re.sub(r'http[s]?://[^\s]+', 'http', text)
    text = re.sub(r'www\.[^\s]+', 'http', text)

    # 4. Handle mentions - keep them (important for context in abuse detection)
    # Don't remove @mentions as they're part of Twitter language

    # 5. Keep hashtags (they provide context)
    # Don't remove hashtags

    # 6. Clean up excessive whitespace only
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()

    # 7. DON'T convert to lowercase - RoBERTa is case-sensitive

    return text

def preprocess_for_display(text: str) -> dict:
    """
    For showing preprocessing results in your UI
    """
    original = text
    processed = preprocess_for_twitter_roberta(text)

    return {
        "original": original,
        "processed": processed,
        "changes_made": original != processed,
        "preprocessing_steps": [
            "Unicode normalization",
            "URL standardization",
            "Whitespace cleanup",
            "Emojis preserved",
            "Case preserved"
        ]
    }
