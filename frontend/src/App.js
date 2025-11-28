// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css';

// Import pages
import HomePage from "./components/HomePage"; // <-- your new homepage
import Dashboard from "./pages/Dashboard";
// import other pages if you have
import ProductPredictions from "./pages/ProductPredictions";
import Chatbot from "./pages/Chatbot";

function App() {
  return (
    <Router>
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Product Predictions */}
        <Route path="/product_predictions" element={<ProductPredictions />} />

        {/* Chatbot */}
        <Route path="/chatbot" element={<Chatbot />} />

        {/* Add more routes here if needed */}
      </Routes>
    </Router>
  );
}

export default App;
