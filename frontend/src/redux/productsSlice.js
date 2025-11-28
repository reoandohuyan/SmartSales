import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [
    { id: 1, name: "Product A", category: "Cat 1", price: 150, sales: 120 },
    { id: 2, name: "Product B", category: "Cat 2", price: 200, sales: 90 },
    { id: 3, name: "Product C", category: "Cat 1", price: 100, sales: 150 },
    { id: 4, name: "Product D", category: "Cat 3", price: 300, sales: 60 },
  ],
  salesData: {
    months: ["Jan", "Feb", "Mar", "Apr", "May"],
    sales: [100, 150, 120, 180, 200],
    lastSales: [120, 90, 150, 60],
    forecasts: [130, 100, 160, 70],
  },
 predictions: [
  { product: "Product A", last_sales: 120, forecast: 130, trend: "Up", stock: 50 },
  { product: "Product B", last_sales: 90, forecast: 100, trend: "Up", stock: 30 },
  { product: "Product C", last_sales: 150, forecast: 160, trend: "Up", stock: 25 },
  { product: "Product D", last_sales: 60, forecast: 70, trend: "Up", stock: 70 },
],

  topProducts: ["Product C", "Product A", "Product B", "Product D"],
  topSales: [150, 120, 90, 60],
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProduct: (state, action) => {
      // payload = { id, name, category, price, sales }
      state.products.push(action.payload);
    },
    updateProductSales: (state, action) => {
      // payload = { id, sales }
      const product = state.products.find(p => p.id === action.payload.id);
      if (product) {
        product.sales = action.payload.sales;
      }
    },
    updateSalesData: (state, action) => {
      // payload = { months?, sales?, lastSales?, forecasts? }
      state.salesData = { ...state.salesData, ...action.payload };
    },
  },
});

export const { addProduct, updateProductSales, updateSalesData } = productsSlice.actions;
export default productsSlice.reducer;
