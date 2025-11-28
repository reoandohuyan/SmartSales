import requests

url = "http://127.0.0.1:5000/ask"
data = {"message": "Which product sold the most last month?"}
response = requests.post(url, json=data)
print(response.json())
