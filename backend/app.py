from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.linear_model import LinearRegression
import warnings
import json
import os
import requests  # For Mistral API calls
from statsmodels.tsa.arima.model import ARIMA
from flask import send_from_directory

# Path to React build folder
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../frontend/build")

warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# --- Helper functions ---
def load_json_file(filename, default):
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return default
    return default

def save_json_file(filename, data):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)

# --- ROUTES ---

# Serve React build static files
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    build_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../frontend/build")
    if path != "" and os.path.exists(os.path.join(build_dir, path)):
        return send_from_directory(build_dir, path)
    else:
        # fallback to index.html for React Router
        return send_from_directory(build_dir, "index.html")


# === Monthly Sales Routes ===
@app.route("/add_sales", methods=['POST'])
def add_sales():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    month = request.json.get('month')
    sales = request.json.get('sales')

    if not month or sales is None:
        return jsonify({"error": "Missing month or sales"}), 400

    sales_data = load_json_file('sales_data.json', [])
    sales_data.append({"month": month, "sales": int(sales)})
    save_json_file('sales_data.json', sales_data)

    return jsonify({
        "message": "Sales data added successfully",
        "data": {"month": month, "sales": sales}
    })

@app.route("/dashboard")
def dashboard():
    sales_data = load_json_file('sales_data.json', [])

    if not sales_data:
        return jsonify({
            "months": [],
            "sales": [],
            "linear_regression_prediction": 0,
            "timeseries_prediction": 0,
            "recommendation": "No data available yet."
        })

    months = [entry["month"] for entry in sales_data]
    sales = [entry["sales"] for entry in sales_data]

    # Linear Regression Prediction
    X = np.arange(len(sales)).reshape(-1, 1)
    y = np.array(sales)
    lr_model = LinearRegression()
    lr_model.fit(X, y)
    next_month_index = len(sales)
    lr_prediction = int(lr_model.predict([[next_month_index]])[0])

    # ARIMA Forecast
    try:
        arima_model = ARIMA(sales, order=(1,1,1))
        arima_fit = arima_model.fit()
        ts_prediction = int(arima_fit.forecast()[0])
    except:
        window_size = 3
        if len(sales) >= window_size:
            ts_prediction = int(np.mean(sales[-window_size:]))
        else:
            ts_prediction = int(np.mean(sales))

    last_sales = sales[-1]
    if lr_prediction > last_sales:
        recommendation = "📈 Sales are expected to increase next month!"
    elif lr_prediction < last_sales:
        recommendation = "📉 Sales may decrease. Consider promotions."
    else:
        recommendation = "⚖️ Sales likely stable next month."

    return jsonify({
        "months": months,
        "sales": sales,
        "linear_regression_prediction": lr_prediction,
        "timeseries_prediction": ts_prediction,
        "recommendation": recommendation
    })

# === Server.js routes for sales_data.json ===
@app.route("/api/sales-data")
def get_sales_data():
    data = load_json_file("sales_data.json", [])
    return jsonify(data)

@app.route("/api/add-sale", methods=["POST"])
def api_add_sale():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    month = request.json.get("month")
    sales = request.json.get("sales")
    if not month or sales is None:
        return jsonify({"error": "Missing month or sales"}), 400
    sales_data = load_json_file("sales_data.json", [])
    sales_data.append({"month": month, "sales": int(sales)})
    save_json_file("sales_data.json", sales_data)
    return jsonify({"message": "Sale added successfully", "data": sales_data})

# --- FIXED FULL TABLE UPDATE ---
@app.route("/api/update-sales", methods=["PUT"])
def update_sales():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.json.get("data")  # expect [{month: ..., sales: ...}, ...]
    if not isinstance(data, list):
        return jsonify({"error": "Invalid data format. Must be a list."}), 400

    # Convert sales to int and sanitize
    for entry in data:
        entry["sales"] = int(entry.get("sales", 0))
        entry["month"] = str(entry.get("month", ""))

    save_json_file("sales_data.json", data)
    return jsonify({"message": "All sales updated successfully", "data": data}), 200

# --- DELETE SALE ROUTE ---
@app.route("/api/delete-sale", methods=["DELETE"])
def delete_sale():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    month = request.json.get("month")
    if not month:
        return jsonify({"error": "Missing month"}), 400

    sales_data = load_json_file("sales_data.json", [])
    filtered_data = [item for item in sales_data if item["month"] != month]
    save_json_file("sales_data.json", filtered_data)

    return jsonify({"message": f"Deleted sales for month: {month}", "data": filtered_data}), 200


@app.route("/api/delete-product", methods=["DELETE"])
def delete_product():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    product_name = request.json.get("product")
    if not product_name:
        return jsonify({"error": "Missing product"}), 400

    product_data = load_json_file("product_data.json", [])
    new_data = [p for p in product_data if p["product"].lower() != product_name.lower()]

    if len(new_data) == len(product_data):
        return jsonify({"error": "Product not found"}), 404

    save_json_file("product_data.json", new_data)
    return jsonify({"message": f"Product '{product_name}' deleted successfully", "data": new_data}), 200


# === Product Routes ===
@app.route("/add_product_sales", methods=['POST'])
def add_product_sales():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    product = request.json.get('product')
    last_sales = request.json.get('last_sales')
    stock = request.json.get('stock')

    if not product or last_sales is None or stock is None:
        return jsonify({"error": "Missing product, last_sales, or stock"}), 400

    product_data = load_json_file('product_data.json', [])
    for p in product_data:
        if p['product'].lower() == product.lower():
            p['last_sales'] = int(last_sales)
            p['stock'] = int(stock)
            save_json_file('product_data.json', product_data)
            return jsonify({"message": "Product updated successfully", "data": p})

    new_product = {"product": product, "last_sales": int(last_sales), "stock": int(stock)}
    product_data.append(new_product)
    save_json_file('product_data.json', product_data)
    return jsonify({"message": "Product added successfully", "data": new_product})

@app.route("/products-dashboard")
def products_dashboard():
    product_data = load_json_file('product_data.json', [])
    predictions = []

    for item in product_data:
        last_sales = item.get('last_sales', 0)
        stock = item.get('stock', 0)

        forecast = int(last_sales * 1.2)
        trend = "Up" if forecast > last_sales else "Down"

        predictions.append({
            "product": item.get('product', 'Unknown'),
            "last_sales": last_sales,
            "forecast": forecast,
            "trend": trend,
            "stock": stock
        })

    return jsonify({"predictions": predictions})

# === Server.js routes for product_sales.json ===
@app.route("/api/product-sales")
def get_product_sales():
    data = load_json_file("product_sales.json", [])
    return jsonify(data)

@app.route("/api/add_product_stock", methods=["POST"])
def add_product_stock():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    product = request.json.get("product")
    added_stock = request.json.get("added_stock")
    if not product or added_stock is None:
        return jsonify({"error": "Missing product or added_stock"}), 400

    product_data = load_json_file("product_data.json", [])
    found = False
    for p in product_data:
        if p["product"].lower() == product.lower():
            p["stock"] += int(added_stock)
            found = True
            break

    if not found:
        product_data.append({"product": product, "last_sales": 0, "stock": int(added_stock)})

    save_json_file("product_data.json", product_data)
    return jsonify({"message": "Stock updated successfully", "data": product_data})

@app.route("/api/restock", methods=["POST"])
def restock_product():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    product_name = request.json.get("productName")
    quantity = request.json.get("quantity")

    if not product_name or quantity is None:
        return jsonify({"error": "Missing productName or quantity"}), 400

    product_data = load_json_file("product_data.json", [])
    found = False
    for p in product_data:
        if p["product"].lower() == product_name.lower():
            p["stock"] += int(quantity)
            found = True
            break

    if not found:
        product_data.append({"product": product_name, "last_sales": 0, "stock": int(quantity)})

    save_json_file("product_data.json", product_data)
    return jsonify({"message": "Stock updated successfully", "data": product_data})

# === Mistral AI Chatbot ===
@app.route("/api/mistral", methods=["POST"])
def mistral_chat():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"reply": "No message received"}), 400

    product_data = load_json_file('product_data.json', [])
    sales_data = load_json_file('sales_data.json', [])

    prompt = (
        f"User question: {user_message}\n\n"
        f"Product catalog:\n{json.dumps(product_data)}\n\n"
        f"Sales transactions:\n{json.dumps(sales_data)}\n\n"
        "Please analyze and answer."
    )

    MISTRAL_API_KEY = "YTntkY0b0zaPAVpgKUvROJrwIeoYSuoz"
    MISTRAL_URL = "https://api.mistral.ai/v1/conversations"

    headers = {"X-API-KEY": MISTRAL_API_KEY, "Content-Type": "application/json"}
    payload = {"model": "mistral-large-latest", "inputs": [{"role": "user", "content": prompt}], "completion_args": {"max_tokens": 300}}

    bot_reply = "🤖 Sorry, I couldn’t get a response."
    try:
        response = requests.post(MISTRAL_URL, headers=headers, json=payload)
        if response.status_code == 200:
            data = response.json()
            if "outputs" in data and len(data["outputs"]) > 0:
                content = data["outputs"][0].get("content")
                if isinstance(content, list) and len(content) > 0:
                    text_item = content[0]
                    if isinstance(text_item, dict) and "text" in text_item:
                        bot_reply = text_item["text"]
                    elif isinstance(text_item, str):
                        bot_reply = text_item
                elif isinstance(content, str):
                    bot_reply = content
        else:
            bot_reply = f"Error: {response.status_code} - {response.text}"
    except Exception as e:
        bot_reply = f"Exception occurred: {str(e)}"

    return jsonify({"reply": bot_reply})

# === Sell Product Route ===
@app.route("/api/sell_product", methods=["POST"])
def sell_product():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    product = request.json.get("product")
    sold_quantity = request.json.get("sold_quantity")
    if not product or sold_quantity is None:
        return jsonify({"error": "Missing product or sold_quantity"}), 400

    product_data = load_json_file("product_data.json", [])

    for p in product_data:
        if p["product"].lower() == product.lower():
            if p["stock"] >= sold_quantity:
                p["stock"] -= int(sold_quantity)
                save_json_file("product_data.json", product_data)
                return jsonify({"message": "Product sold successfully", "data": p}), 200
            else:
                return jsonify({"error": f"Not enough stock. Current stock: {p['stock']}"}), 400

    return jsonify({"error": "Product not found"}), 404





# Serve React build static files
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    build_dir = os.path.join(os.getcwd(), "frontend", "build")
    if path != "" and os.path.exists(os.path.join(build_dir, path)):
        return send_from_directory(build_dir, path)
    else:
        # fallback to index.html for React Router
        return send_from_directory(build_dir, "index.html")



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
