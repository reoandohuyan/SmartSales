import json

# Load the sales data
with open("sales_data.json", "r", encoding="utf-8") as f:
    sales_data = json.load(f)

# Print the data to see if it’s correct
print("Sales Data:", sales_data)
