const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// ===== Existing routes =====

// Read sales data
app.get("/api/sales-data", (req, res) => {
  fs.readFile("./sales_data.json", "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read data" });
    res.json(JSON.parse(data));
  });
});

// Add new monthly data
app.post("/api/add-sale", (req, res) => {
  const { month, sales } = req.body;

  fs.readFile("./sales_data.json", "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read file" });

    let jsonData = JSON.parse(data);

    jsonData.push({ month, sales });

    fs.writeFile("./sales_data.json", JSON.stringify(jsonData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to save data" });

      res.json({ message: "Sale added successfully", data: jsonData });
    });
  });
});

// ===== NEW: Restock Route =====
app.post("/api/restock", (req, res) => {
  const { productName, quantity } = req.body;

  if (!productName || quantity == null) {
    return res.status(400).json({ message: "Product name and quantity required" });
  }

  fs.readFile("./product_sales.json", "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read product data" });

    let products = JSON.parse(data);

    const index = products.findIndex(
      (p) => p.name.toLowerCase() === productName.toLowerCase()
    );

    if (index >= 0) {
      // If product exists, add quantity
      products[index].stock += quantity;
    } else {
      // Add new product
      products.push({ name: productName, stock: quantity });
    }

    fs.writeFile("./product_sales.json", JSON.stringify(products, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to save product data" });

      res.json({ message: "Stock updated successfully", data: products });
    });
  });
});


// Read product sales
app.get("/api/product-sales", (req, res) => {
  fs.readFile("./product_sales.json", "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read product data" });
    res.json(JSON.parse(data));
  });
});

// Add or update product stock
app.post("/api/add_product_stock", (req, res) => {
  const { product, added_stock } = req.body;

  if (!product || !added_stock) {
    return res.status(400).json({ error: "Missing product or stock" });
  }

  fs.readFile("./product_sales.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read product file" });
    }

    let jsonData = JSON.parse(data);

    // Search for the product
    let item = jsonData.find(
      (p) => p.product.toLowerCase() === product.toLowerCase()
    );

    if (item) {
      // Product exists → increase stock
      item.stock = Number(item.stock) + Number(added_stock);
    } else {
      // Product does NOT exist → create it
      item = {
        product,
        last_sales: 0, // default
        stock: Number(added_stock),
      };
      jsonData.push(item);
    }

    // Save updated product list
    fs.writeFile(
      "./product_sales.json",
      JSON.stringify(jsonData, null, 2),
      (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to save product file" });
        }

        res.json({ message: "Stock updated successfully", data: jsonData });
      }
    );
  });
});


app.listen(5000, () => console.log("Backend running on port 5000"));

