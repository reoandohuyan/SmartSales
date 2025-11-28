import numpy as np
from sklearn.linear_model import LinearRegression
from statsmodels.tsa.arima.model import ARIMA
import json

# Load the sales data
with open("sales_data.json", "r", encoding="utf-8") as f:
    sales_data = json.load(f)

# Aggregate total sales by month
monthly_totals = {}
for entry in sales_data:
    month = entry["month"]
    monthly_totals[month] = monthly_totals.get(month, 0) + entry["sales"]

months = list(monthly_totals.keys())
sales = list(monthly_totals.values())

print("Months:", months)
print("Sales:", sales)

# Try ARIMA first
try:
    model = ARIMA(sales, order=(1,1,1))
    model_fit = model.fit()
    next_month_prediction = int(model_fit.forecast()[0])
    print("Next Month Prediction (ARIMA):", next_month_prediction)
except Exception as e:
    print("ARIMA failed, using Linear Regression. Error:", e)
    # Linear Regression fallback
    X = np.arange(len(sales)).reshape(-1,1)
    y = np.array(sales)
    lr_model = LinearRegression()
    lr_model.fit(X, y)
    next_month_prediction = int(lr_model.predict([[len(sales)]]))  # len(sales) is next index
    print("Next Month Prediction (Linear Regression):", next_month_prediction)
