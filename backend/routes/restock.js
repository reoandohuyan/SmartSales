const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Path to your JSON "database"
const filePath = path.join(__dirname, "../product_sales.json");

// POST /api/restock
router.post("/restock", (req, res) => {
  const { productName, quantity } = req.body;

  if (!productName || !quantity) {
    return res.status(400).json({ message: "Product name and quantity required" });
  }

  // Read current product data
  let data = [];
  try {
    const fileData = fs.readFileSync(filePath, "utf-8");
    data = JSON.parse(fileData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error reading product data" });
  }

  // Check if product already exists
  const productIndex = data.findIndex(
    (p) => p.name.toLowerCase() === productName.toLowerCase()
  );

  if (productIndex >= 0) {
    // Add new quantity to existing stock
    data[productIndex].stock += quantity;
  } else {
    // Add new product with the stock
    data.push({ name: productName, stock: quantity });
  }

  // Save back to JSON
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return res.json({ message: "Stock updated successfully", data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error saving product data" });
  }
});

module.exports = router;
