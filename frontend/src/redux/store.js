import { configureStore, createSlice } from "@reduxjs/toolkit";
import productsReducer from "./productsSlice"; // ✅ import products slice

// === Example dashboard slice ===
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    months: ["Jan", "Feb", "Mar", "Apr", "May"],
    sales: [5000, 7000, 6500, 8000, 7200],
    prediction: 7800,
    recommendation: "Increase marketing for best-selling months",
  },
  reducers: {
    // Optional: add reducers here later
  },
});

// ✅ single store definition with both slices
const store = configureStore({
  reducer: {
    dashboard: dashboardSlice.reducer,
    products: productsReducer,
  },
});

export default store;
