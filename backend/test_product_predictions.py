import requests

url = "http://127.0.0.1:5000/product_predictions"
response = requests.get(url)
print(response.json())
