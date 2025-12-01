import { createSlice } from "@reduxjs/toolkit";

// -----------------------------
// Initial state for products slice
// -----------------------------
const initialState = {
  // List of products with their details
  products: [
    { id: 1, name: "Product A", category: "Cat 1", price: 150, sales: 120 },
    { id: 2, name: "Product B", category: "Cat 2", price: 200, sales: 90 },
    { id: 3, name: "Product C", category: "Cat 1", price: 100, sales: 150 },
    { id: 4, name: "Product D", category: "Cat 3", price: 300, sales: 60 },
  ],

  // Sales data for charts
  salesData: {
    months: ["Jan", "Feb", "Mar", "Apr", "May"],       // Month labels
    sales: [100, 150, 120, 180, 200],                 // Total sales per month
    lastSales: [120, 90, 150, 60],                    // Last sales per product
    forecasts: [130, 100, 160, 70],                   // Forecasted sales per product
  },

  // Predictions for products
  predictions: [
    { product: "Product A", last_sales: 120, forecast: 130, trend: "Up", stock: 50 },
    { product: "Product B", last_sales: 90, forecast: 100, trend: "Up", stock: 30 },
    { product: "Product C", last_sales: 150, forecast: 160, trend: "Up", stock: 25 },
    { product: "Product D", last_sales: 60, forecast: 70, trend: "Up", stock: 70 },
  ],

  // Top performing products and their sales
  topProducts: ["Product C", "Product A", "Product B", "Product D"],
  topSales: [150, 120, 90, 60],
};

// -----------------------------
// Create Redux slice for products
// -----------------------------
export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // -----------------------------
    // Add a new product to the state
    // payload = { id, name, category, price, sales }
    // -----------------------------
    addProduct: (state, action) => {
      state.products.push(action.payload);
    },

    // -----------------------------
    // Update sales of an existing product
    // payload = { id, sales }
    // -----------------------------
    updateProductSales: (state, action) => {
      const product = state.products.find(p => p.id === action.payload.id);
      if (product) {
        product.sales = action.payload.sales;
      }
    },

    // -----------------------------
    // Update sales data for charts
    // payload = { months?, sales?, lastSales?, forecasts? }
    // Only updates provided fields
    // -----------------------------
    updateSalesData: (state, action) => {
      state.salesData = { ...state.salesData, ...action.payload };
    },
  },
});

// Export actions for components to dispatch
export const { addProduct, updateProductSales, updateSalesData } = productsSlice.actions;

// Export reducer to configure store
export default productsSlice.reducer;
