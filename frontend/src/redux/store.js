import { configureStore, createSlice } from "@reduxjs/toolkit";
import productsReducer from "./productsSlice"; // ✅ Import products slice to include in store

// -----------------------------
// Example dashboard slice
// -----------------------------
const dashboardSlice = createSlice({
  name: "dashboard", // Name of the slice
  initialState: {
    months: ["Jan", "Feb", "Mar", "Apr", "May"], // Example months
    sales: [5000, 7000, 6500, 8000, 7200],       // Corresponding sales data
    prediction: 7800,                             // Predicted sales for next month
    recommendation: "Increase marketing for best-selling months", // Example recommendation
  },
  reducers: {
    // Optional: add reducers here later to update dashboard state
  },
});

// -----------------------------
// Configure Redux store
// -----------------------------
const store = configureStore({
  reducer: {
    // Add multiple slices here
    dashboard: dashboardSlice.reducer, // Dashboard slice state
    products: productsReducer,         // Products slice state
  },
});

// Export the store to use in your React app
export default store;
