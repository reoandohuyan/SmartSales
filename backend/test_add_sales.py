import requests

url = "http://127.0.0.1:5000/add_sales"

data = {
    "product": "Snacks",
    "month": "April",
    "sales": 1200
}

response = requests.post(url, json=data)
print(response.json())
