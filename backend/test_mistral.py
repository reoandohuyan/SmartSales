import requests
import json

# --- Configuration ---
MISTRAL_API_KEY = "YTntkY0b0zaPAVpgKUvROJrwIeoYSuoz"
MISTRAL_URL = "https://api.mistral.ai/v1/conversations"

# Sample user message
user_message = "Hello Mistral! Can you give me a sales recommendation based on some mock data?"

# Mock data (just for testing)
product_data = {"products": [{"product": "Soft Drinks", "last_sales": 1200, "stock": 100}]}
sales_data = [{"month": "January", "sales": 1200}, {"month": "February", "sales": 1500}]

# Build prompt
prompt = (
    f"User question: {user_message}\n\n"
    f"Product catalog:\n{json.dumps(product_data)}\n\n"
    f"Sales transactions:\n{json.dumps(sales_data)}\n\n"
    "Please analyze and answer."
)

# Headers and payload
headers = {
    "X-API-KEY": MISTRAL_API_KEY,
    "Content-Type": "application/json"
}

payload = {
    "model": "mistral-large-latest",
    "inputs": [{"role": "user", "content": prompt}],
    "completion_args": {"max_tokens": 150}
}

# Call Mistral API
try:
    response = requests.post(MISTRAL_URL, headers=headers, json=payload)
    if response.status_code == 200:
        data = response.json()
        outputs = data.get("outputs", [])
        if outputs:
            content = outputs[0].get("content")
            if isinstance(content, list) and content:
                text_item = content[0]
                if isinstance(text_item, dict) and "text" in text_item:
                    bot_reply = text_item["text"]
                elif isinstance(text_item, str):
                    bot_reply = text_item
            elif isinstance(content, str):
                bot_reply = content
            print("🤖 Mistral reply:")
            print(bot_reply)
        else:
            print("No outputs received from Mistral API")
    else:
        print(f"Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Exception occurred: {str(e)}")
