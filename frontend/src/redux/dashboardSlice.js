// src/redux/dashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch sales data from JSON
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchData",
  async () => {
    const response = await fetch("/sales_data.json"); // adjust path if needed
    const data = await response.json();

    // Calculate simple prediction (e.g., next month = last month sales * 1.1)
    const lastMonthSales = data.sales[data.sales.length - 1] || 0;
    const prediction = Math.round(lastMonthSales * 1.1); // example prediction

    // Recommendation based on prediction
    let recommendation = "";
    if (prediction > lastMonthSales) recommendation = "Increase stock next month";
    else recommendation = "Maintain current stock";

    return {
      months: data.months,
      sales: data.sales,
      prediction,
      recommendation,
    };
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    months: [],
    sales: [],
    prediction: 0,
    recommendation: "",
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.months = action.payload.months;
        state.sales = action.payload.sales;
        state.prediction = action.payload.prediction;
        state.recommendation = action.payload.recommendation;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default dashboardSlice.reducer;
