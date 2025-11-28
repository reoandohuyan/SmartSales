// src/redux/salesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch sales data from backend API
export const fetchSalesData = createAsyncThunk(
  "sales/fetchSalesData",
  async () => {
    const response = await axios.get("/api/sales"); // adjust endpoint
    return response.data;
  }
);

const salesSlice = createSlice({
  name: "sales",
  initialState: {
    months: [],
    sales: [],
    prediction: 0,
    recommendation: "",
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesData.pending, (state) => { state.loading = true; })
      .addCase(fetchSalesData.fulfilled, (state, action) => {
        state.loading = false;
        state.months = action.payload.months;
        state.sales = action.payload.sales;
        state.prediction = action.payload.prediction;
        state.recommendation = action.payload.recommendation;
      })
      .addCase(fetchSalesData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default salesSlice.reducer;
