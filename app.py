from transformers import AutoTokenizer, AutoModelForSequenceClassification
model_name = "cardiffnlp/twitter-roberta-base-hate-latest"

# Load from Hugging Face
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Save locally
model.save_pretrained("./models/twitter-roberta-abuse")
tokenizer.save_pretrained("./models/twitter-roberta-abuse")

