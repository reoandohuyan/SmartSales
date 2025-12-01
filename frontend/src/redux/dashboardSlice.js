// src/redux/dashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// -----------------------------
// Async thunk to fetch dashboard sales data
// -----------------------------
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async () => {
    // Fetch sales data from a JSON file (adjust path if needed)
    const response = await fetch("/sales_data.json");
    const data = await response.json();

    // -----------------------------
    // Simple prediction logic
    // Example: next month's sales = last month's sales * 1.1
    // -----------------------------
    const lastMonthSales = data.sales[data.sales.length - 1] || 0;
    const prediction = Math.round(lastMonthSales * 1.1);

    // -----------------------------
    // Generate a recommendation based on the prediction
    // -----------------------------
    let recommendation = "";
    if (prediction > lastMonthSales) recommendation = "Increase stock next month";
    else recommendation = "Maintain current stock";

    // Return structured data to the slice
    return {
      months: data.months,
      sales: data.sales,
      prediction,
      recommendation,
    };
  }
);

// -----------------------------
// Create dashboard slice
// -----------------------------
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    months: [],           // Array of month labels
    sales: [],            // Array of sales numbers
    prediction: 0,        // Predicted sales for next month
    recommendation: "",   // Recommendation based on prediction
    status: "idle",       // Status of async fetch: idle | loading | succeeded | failed
    error: null,          // Stores any error message from fetch
  },
  reducers: {}, // No regular reducers, only using async thunks here
  extraReducers: (builder) => {
    builder
      // -----------------------------
      // Pending state: set loading
      // -----------------------------
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = "loading";
      })

      // -----------------------------
      // Fulfilled state: store fetched data
      // -----------------------------
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.months = action.payload.months;
        state.sales = action.payload.sales;
        state.prediction = action.payload.prediction;
        state.recommendation = action.payload.recommendation;
      })

      // -----------------------------
      // Rejected state: store error
      // -----------------------------
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

// Export the reducer for store configuration
export default dashboardSlice.reducer;
