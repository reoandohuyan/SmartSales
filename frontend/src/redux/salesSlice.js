// src/redux/salesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// -----------------------------
// Async thunk to fetch sales data from backend API
// -----------------------------
export const fetchSalesData = createAsyncThunk(
  "sales/fetchSalesData",
  async () => {
    // Make GET request to backend endpoint to get sales data
    const response = await axios.get("/api/sales"); // adjust endpoint if needed
    return response.data; // return response data to be used in reducers
  }
);

// -----------------------------
// Create Redux slice for sales data
// -----------------------------
const salesSlice = createSlice({
  name: "sales",
  
  // Initial state for sales slice
  initialState: {
    months: [],           // Array of month labels
    sales: [],            // Array of sales corresponding to months
    prediction: 0,        // Predicted sales value for next month
    recommendation: "",   // Recommendation based on prediction
    loading: false,       // Loading state for API call
    error: null,          // Error message if API call fails
  },

  // Standard reducers (none in this slice)
  reducers: {},

  // Extra reducers to handle async thunk states
  extraReducers: (builder) => {
    builder
      // Pending state: API call is in progress
      .addCase(fetchSalesData.pending, (state) => {
        state.loading = true;
      })

      // Fulfilled state: API call successful
      .addCase(fetchSalesData.fulfilled, (state, action) => {
        state.loading = false;
        state.months = action.payload.months;
        state.sales = action.payload.sales;
        state.prediction = action.payload.prediction;
        state.recommendation = action.payload.recommendation;
      })

      // Rejected state: API call failed
      .addCase(fetchSalesData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Export the reducer to be used in store
export default salesSlice.reducer;
