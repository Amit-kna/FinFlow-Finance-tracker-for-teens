import modal
import json
import random

app = modal.App("ai-scanner")

image = modal.Image.debian_slim().pip_install("requests")

@app.function(image=image)
@modal.web_endpoint(method="POST")
def scan_receipt(item: dict):
    """
    Parses receipt text/image data into structured JSON.
    Expected input: {"receipt_content": "base64_string_or_text"}
    
    Using a mock structure here to simulate AI extracting the data, 
    as the user didn't specify an AI provider.
    To use OpenAI: add `secret=modal.Secret.from_name("openai-secret")` to function decorators.
    """
    content = item.get("receipt_content", "")
    
    if not content:
        return {"error": "No receipt content provided"}

    # Mocking AI extraction logic
    categories = ["Food & Dining", "Shopping", "Entertainment", "Transportation", "Utilities"]
    mock_amount = round(random.uniform(5.0, 150.0), 2)
    mock_category = random.choice(categories)
    
    # Return structured JSON matching the transaction schema
    result = {
        "type": "expense",
        "amount": mock_amount,
        "category": mock_category,
        "note": "Extracted via AI Scanner"
    }

    return {"status": "success", "data": result}
