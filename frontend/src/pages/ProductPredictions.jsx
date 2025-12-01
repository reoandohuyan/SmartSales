// src/pages/ProductPredictions.jsx
import React, { useEffect, useState } from "react"; // Import React and hooks
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import React Router hooks for navigation and location
import { Line, Bar, Doughnut } from "react-chartjs-2"; // Import chart components from react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"; // Import Chart.js modules for rendering different charts

import {
  HomeIcon,
  ChartBarIcon,
  CpuChipIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  TrophyIcon,
  TrashIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline"; // Import Heroicons for UI icons

import jsPDF from "jspdf"; // Import jsPDF library to generate PDFs
import "jspdf-autotable"; // Import autotable plugin to create tables in PDFs
import { useMemo } from "react";

// Register Chart.js components globally
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const ProductPredictions = () => {
  const navigate = useNavigate(); // Hook to programmatically navigate to other routes
  const location = useLocation(); // Hook to access current location and state
  const [isOpen, setIsOpen] = useState(false); // State to toggle sidebar or menu
  const [productToDelete, setProductToDelete] = useState(null); // Store product selected for deletion
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Toggle delete confirmation modal visibility
  const [deletedMessage, setDeletedMessage] = useState(""); // Message displayed after a product is deleted
  const [predictions, setPredictions] = useState([]); // Store list of product predictions from API
  const [salesData, setSalesData] = useState({ months: [], sales: [] }); // Chart data: months and sales values
  const [loading, setLoading] = useState(true); // Loading state while fetching data
  const [error, setError] = useState(""); // Store error messages for display
  const [highlightProduct, setHighlightProduct] = useState(""); // Store the product to highlight if passed from navigation
  const [showModal, setShowModal] = useState(false); // Toggle chart modal visibility
  const [modalChartType, setModalChartType] = useState(""); // Store type of chart to show in modal
  const [selectedProduct, setSelectedProduct] = useState(null); // Store selected product for detailed view
  const [searchTerm, setSearchTerm] = useState(""); // Search input value for filtering products
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" }); // Sort configuration for product table
  const [dashboardProducts, setDashboardProducts] = useState([]);




// Filter by search term and sort by selected key/direction
// Always at the top level of your component
const sortedAndFiltered = useMemo(() => {
  return predictions
    .filter((p) =>
      p.product.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const dir = sortConfig.direction === "asc" ? 1 : -1;

      if (["forecast", "last_sales", "stock"].includes(sortConfig.key)) {
        return (a[sortConfig.key] - b[sortConfig.key]) * dir;
      }

      if (sortConfig.key === "trend") {
        return ((a.trend === "Up" ? 1 : 0) - (b.trend === "Up" ? 1 : 0)) * dir;
      }

      return 0;
    });
}, [predictions, searchTerm, sortConfig]);

// Then you can safely have early returns




const fetchPredictions = async () => {
  try {
    const resPred = await fetch("https://smartsales-dt0f.onrender.com/api/products-dashboard");
    if (!resPred.ok) throw new Error("Failed to fetch predictions");

    const prodJson = await resPred.json();
    setPredictions(prodJson.predictions || []); // update state with latest data
  } catch (err) {
    console.error("Failed to fetch predictions:", err);
    setError("Unable to load product predictions.");
  }
};


  useEffect(() => {
  fetch("https://smartsales-dt0f.onrender.com/api/products-dashboard")
    .then(res => res.json())
    .then(data => setDashboardProducts(data.predictions))
    .catch(err => console.error(err));
}, []);


  // Descriptions for each chart type to show in modal or tooltip
  const chartExplanations = {
    line: "This chart visualizes your historical sales and predicts the next month's sales using Linear Regression. It helps you understand trends—whether performance is rising, steady, or declining.",
    bar: "This bar chart compares your last recorded sales and the AI forecast for each product. It highlights which items are expected to grow or drop next month.",
    doughnut: "The doughnut chart shows your top-performing products based on their forecasted sales. It quickly identifies which products will lead in performance next month.",
  };
useEffect(() => {
  // Check if a product should be highlighted based on navigation state
  if (location.state?.highlightProduct) {
    setHighlightProduct(location.state.highlightProduct);
  }

  // Async function to fetch sales and product predictions
  const fetchData = async () => {
    try {
      setLoading(true); // Start loading state
      setError(""); // Reset previous errors

      // Fetch sales data from dashboard API
      const resSales = await fetch("https://smartsales-dt0f.onrender.com/api/dashboard");
      if (!resSales.ok) {
        // Throw error if API response is not OK
        throw new Error(`Dashboard API failed with status ${resSales.status}`);
      }
      const salesJson = await resSales.json(); // Parse JSON safely
      // Update sales chart data with months and sales, adding next month's prediction
      setSalesData({
        months: [...salesJson.months, "Next Month"],
        sales: [...salesJson.sales, salesJson.linear_regression_prediction],
      });

      await fetchPredictions();
      

    } catch (err) {
      console.error("Error fetching product predictions:", err); // Log any errors
      setError("Failed to load product predictions. Please check console logs."); // Display error message
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  fetchData(); // Call the async function to fetch data
}, [location.state]); // Re-run effect if the location state changes

// Loading state UI
if (loading)
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1B1926" }}>
      <img
        src="/loading1.gif"
        alt="Loading..."
        className="w-full max-w-[550px] h-80 sm:h-96 rounded-2xl object-contain"
      />
    </div>
  );



// Error state UI
if (error)
  return (
    <div className="min-h-screen flex items-center justify-center text-red-400 text-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-center p-4">
      {error}
    </div>
  );

// ---------------------
// Chart Data
// ---------------------

// Line chart data for sales trend over months
const lineData = {
  labels: salesData.months, // X-axis labels (months)
  datasets: [
    {
      label: "Sales", // Dataset label
      data: salesData.sales, // Y-axis data (sales values)
      borderColor: "#0ff", // Line color
      backgroundColor: "rgba(0,255,255,0.2)", // Fill under line
      fill: true,
      tension: 0.4, // Smooth curve tension
      borderWidth: 4, // Line width
      pointRadius: 6, // Data point radius
      pointBackgroundColor: "#0ff", // Data point color
    },
  ],
};

// Line chart options
const lineOptions = {
  plugins: { legend: { labels: { color: "#e2e8f0" } } }, // Legend text color
  scales: {
    x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } }, // X-axis ticks and grid
    y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } }, // Y-axis ticks and grid
  },
};

// Bar chart data comparing last sales vs forecast
const barData = {
  labels: predictions.map((p) => p.product), // X-axis: product names
  datasets: [
    {
      label: "Last Sales", // Previous sales
      data: predictions.map((p) => p.last_sales),
      backgroundColor: "rgba(38,99,235,0.8)",
      borderColor: "#0ff",
      borderWidth: 2,
      borderRadius: 10,
    },
    {
      label: "Forecast", // AI forecast
      data: predictions.map((p) => p.forecast),
      backgroundColor: "rgba(56,189,248,0.8)",
      borderColor: "#0ff",
      borderWidth: 2,
      borderRadius: 10,
    },
  ],
};

// Bar chart options
const barOptions = {
  plugins: { legend: { labels: { color: "#e2e8f0" } } }, // Legend color
  scales: {
    x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
    y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
  },
};

// Select top 5 products by forecasted sales for doughnut chart
const topProducts = predictions
  .slice() // Copy array to avoid mutation
  .sort((a, b) => b.forecast - a.forecast) // Sort descending
  .slice(0, 5); // Take top 5

// Doughnut chart data
const doughnutData = {
  labels: topProducts.map((p) => p.product), // Product names
  datasets: [
    {
      data: topProducts.map((p) => p.forecast), // Forecasted sales
      backgroundColor: [ // Colors for slices
        "rgba(0,255,255,0.8)",
        "rgba(74,222,128,0.8)",
        "rgba(250,204,21,0.8)",
        "rgba(248,113,113,0.8)",
        "rgba(167,139,250,0.8)",
      ],
      borderColor: ["#0ff", "#0f0", "#ff0", "#f00", "#a7f"], // Slice borders
      borderWidth: 4,
      hoverOffset: 12, // Hover effect
    },
  ],
};

// Doughnut chart options
const doughnutOptions = {
  cutout: "55%", // Inner circle size
  plugins: { legend: { position: "bottom", labels: { color: "#e2e8f0" } } }, // Legend position and color
};

// ---------------------
// Modal
// ---------------------

// Open modal with selected chart type and optional product
const openModal = (chartType, product = null) => {
  setModalChartType(chartType); // Set chart type for modal
  setSelectedProduct(product); // Set product details if provided
  setShowModal(true); // Show modal
};

// Close modal and reset states
const closeModal = () => {
  setShowModal(false);
  setModalChartType("");
  setSelectedProduct(null);
};

// Render modal content dynamically
const renderModalContent = () => {
  if (selectedProduct) {
    // If a specific product is selected, show its details
    return (
      <div className="space-y-4 w-full">
        <h3 className="text-xl font-bold text-cyan-400">{selectedProduct.product}</h3>
        <p className="text-gray-300">
          Current Stock: <span className="font-semibold">{selectedProduct.stock}</span>
        </p>
        {selectedProduct.stock < 20 && (
          <p className="text-red-400 font-semibold">
            Low stock! Consider restocking soon.
          </p>
        )}
        {/* Bar chart showing last sales vs forecast for selected product */}
        <div className="h-64">
          <Bar
            data={{
              labels: ["Last Sales", "Forecast"],
              datasets: [
                {
                  label: selectedProduct.product,
                  data: [selectedProduct.last_sales, selectedProduct.forecast],
                  backgroundColor: ["rgba(38,99,235,0.8)", "rgba(56,189,248,0.8)"],
                  borderColor: "#0ff",
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, ticks: { color: "#94a3b8" } },
                x: { ticks: { color: "#94a3b8" } },
              },
            }}
          />
        </div>
        {/* Line chart for sales history if available */}
        {selectedProduct.history && (
          <div className="h-64">
            <Line
              data={{
                labels: selectedProduct.history.months,
                datasets: [
                  {
                    label: "Sales History",
                    data: selectedProduct.history.sales,
                    borderColor: "#0ff",
                    backgroundColor: "rgba(0,255,255,0.2)",
                    fill: true,
                  },
                ],
              }}
              options={{
                plugins: { legend: { labels: { color: "#e2e8f0" } } },
                scales: {
                  y: { ticks: { color: "#94a3b8" } },
                  x: { ticks: { color: "#94a3b8" } },
                },
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // If no product selected, render general chart
  return renderModalChart();
};

// Function to render modal chart based on selected type
const renderModalChart = () => {
  if (modalChartType === "line") 
    return <Line data={lineData} options={lineOptions} />; // Line chart
  if (modalChartType === "bar") 
    return <Bar data={barData} options={barOptions} />; // Bar chart
  if (modalChartType === "doughnut")
    return <Doughnut data={doughnutData} options={{ ...doughnutOptions, cutout: "40%" }} />; // Doughnut chart with smaller cutout
  return null; // Return nothing if no type matches
};

// ---------------------
// Sorting and Filtering
// ---------------------




// Function to request sorting by column
const requestSort = (key) => {
  let direction = "asc";
  if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc"; // toggle direction
  setSortConfig({ key, direction });
};

// ⭐ Delete product function
const handleDelete = async (productName) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete "${productName}"? This action cannot be undone.`
  );
  if (!confirmDelete) return; // abort if user cancels

  try {
    // Call API to delete product
    const res = await fetch("https://smartsales-dt0f.onrender.com/api/delete-product", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: productName }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete product."); // show error if API fails
      return;
    }

    // Update local state to remove deleted product
    setPredictions((prev) => prev.filter((p) => p.product !== productName));
    setDeletedMessage(`"${productName}" deleted successfully!`);
    setTimeout(() => setDeletedMessage(""), 3000); // clear message after 3s
  } catch (err) {
    console.error(err);
    alert("Error deleting product. Please try again."); // handle network/other errors
  }
};

// ---------------------
// RETURN UI
// ---------------------

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 font-sans">

    {/* SUCCESS DELETE MESSAGE */}
    {deletedMessage && (
      <div className="fixed top-20 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
        {deletedMessage}
      </div>
    )}

    {/* NAVBAR */}
    <nav className="fixed top-0 w-full bg-slate-900/60 backdrop-blur-xl shadow-lg border-b border-slate-700 z-50">
      <div className="flex justify-between items-center p-2 sm:p-3 md:p-4 relative">
           {/* Logo on the left */}
<div className="flex items-center gap-2">
  <img src="/logo.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
  <span className="text-cyan-400 font-bold text-lg sm:text-xl animate-blink">
    Smart Sales
  </span>
</div>

        {/* Desktop menu - hidden on mobile */}
        <div className="hidden sm:flex flex-1 justify-center gap-2 sm:gap-3 md:gap-6">
          {["/", "/dashboard", "/chatbot", "/product_predictions"].map((path, idx) => {
            const icons = [<HomeIcon />, <ChartBarIcon />, <CpuChipIcon />, <CubeIcon />];
            const labels = ["Home", "Dashboard", "Chatbot", "Products"];
            return (
              <Link
                key={idx}
                to={path}
                className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 font-medium transition-all hover:scale-105 text-xs sm:text-sm md:text-base ${
                  location.pathname === path
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" // highlight active
                    : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {React.cloneElement(icons[idx], { className: "w-3 h-3 sm:w-4 sm:h-5 md:w-5 md:h-5" })}{" "}
                {labels[idx]}
              </Link>
            );
          })}
        </div>


        {/* Mobile menu toggle button */}
        <button
          className="sm:hidden text-white absolute right-3 top-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile collapsible menu */}
      {isOpen && (
        <div className="sm:hidden flex flex-col gap-2 px-3 pb-3">
          {["/", "/dashboard", "/chatbot", "/product_predictions"].map((path, idx) => {
            const icons = [<HomeIcon />, <ChartBarIcon />, <CpuChipIcon />, <CubeIcon />];
            const labels = ["Home", "Dashboard", "Chatbot", "Products"];
            return (
              <Link
                key={idx}
                to={path}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                  location.pathname === path
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" // highlight active
                    : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
                onClick={() => setIsOpen(false)} // close mobile menu after click
              >
                {React.cloneElement(icons[idx], { className: "w-4 h-4" })} {labels[idx]}
              </Link>
            );
          })}
        </div>
      )}
    </nav>




      {/* Main page container */}
<div className="p-5 pt-32 space-y-5 max-w-7xl mx-auto">

  {/* Header section (title + subtitle) */}
  <header className="text-center mb-6 flex flex-col items-center gap-2">

    {/* Page title with icon */}
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400 mb-1 drop-shadow-[0_0_10px_#0ff] flex flex-col sm:flex-row items-center gap-2">
      <ChartPieIcon className="w-10 h-10" /> {/* Title icon */}
      Product Sales Predictions
    </h1>

    {/* Subtitle text */}
    <p className="text-sm sm:text-base text-gray-400">
      Smart insights on upcoming sales performance
    </p>
  </header>

  {/* Charts Grid Section */}
  {/* 1 column on mobile, 3 columns on larger screens */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

    {/* LINE CHART CARD */}
    <div
      onClick={() => openModal("line")} // Opens modal displaying line chart
      className="cursor-pointer bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-3 sm:p-5 hover:shadow-[0_0_25px_rgba(0,255,255,0.7)] transition-shadow duration-300"
    >
      {/* Section heading */}
      <h2 className="text-cyan-400 font-semibold mb-3 drop-shadow-[0_0_6px_#0ff] flex items-center gap-2">
        <PresentationChartLineIcon className="w-5 h-5 sm:w-6 sm:h-6" /> {/* Icon */}
        Historical Sales
      </h2>

      {/* Line Chart container */}
      <div className="h-64 sm:h-72 md:h-80">
        <Line
          data={lineData} // Line chart dataset
          options={{ ...lineOptions, responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>

    {/* BAR CHART CARD */}
    <div
      onClick={() => openModal("bar")} // Opens modal for bar chart
      className="cursor-pointer bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-3 sm:p-5 hover:shadow-[0_0_25px_rgba(0,255,255,0.7)] transition-shadow duration-300"
    >
      {/* Section heading */}
      <h2 className="text-cyan-400 font-semibold mb-3 drop-shadow-[0_0_6px_#0ff] flex items-center gap-2">
        <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6" /> {/* Icon */}
        Predicted vs Actual Sales
      </h2>

      {/* Bar Chart container */}
      <div className="h-64 sm:h-72 md:h-80">
        <Bar
          data={barData} // Bar chart dataset
          options={{ ...barOptions, responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>

    {/* DOUGHNUT CHART CARD */}
    <div
      onClick={() => openModal("doughnut")} // Opens modal for doughnut chart
      className="cursor-pointer bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-3 sm:p-5 hover:shadow-[0_0_25px_rgba(0,255,255,0.7)] transition-shadow duration-300"
    >
      {/* Section heading */}
      <h2 className="text-cyan-400 font-semibold mb-3 drop-shadow-[0_0_6px_#0ff] flex items-center gap-2">
        <TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6" /> {/* Icon */}
        Top Performing Products
      </h2>

      {/* Doughnut Chart container */}
      <div className="h-64 sm:h-72 md:h-80">
        <Doughnut
          data={doughnutData} // Doughnut chart dataset
          options={{ ...doughnutOptions, responsive: true, maintainAspectRatio: false }}
        />
      </div>
    </div>

  </div>

        {/* Search Input */}
        <div className="mt-5">
          {/* Controlled search input field */}
          <input
            type="text"
            placeholder="Search product..."
            value={searchTerm} // current search text
            onChange={(e) => setSearchTerm(e.target.value)} // updates searchTerm on typing
            className="w-full md:w-1/3 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        {/* Product Table */}
        <div className="bg-slate-800 rounded-xl shadow-lg p-4 mt-3">
          {/* Table title */}
          <h2 className="text-lg font-bold mb-3">Product Predictions</h2>

          {/* Scrollable table container */}
          <div className="h-96 overflow-y-auto border-t border-b border-slate-700 scrollbar-dark">
            <table className="w-full text-left border-collapse text-sm">

              {/* Table Header */}
              <thead>
                <tr className="bg-slate-700 sticky top-0 z-10">
                  
                  {/* Sortable column headers */}
                  <th 
                    className="px-2 py-1 border-b border-slate-600 cursor-pointer" 
                    onClick={() => requestSort("product")}
                  >
                    Product
                  </th>

                  <th 
                    className="px-2 py-1 border-b border-slate-600 cursor-pointer"
                    onClick={() => requestSort("last_sales")}
                  >
                    Last Sales
                  </th>

                  <th 
                    className="px-2 py-1 border-b border-slate-600 cursor-pointer"
                    onClick={() => requestSort("forecast")}
                  >
                    Forecast
                  </th>

                  <th 
                    className="px-2 py-1 border-b border-slate-600 cursor-pointer"
                    onClick={() => requestSort("trend")}
                  >
                    Trend
                  </th>

                  <th 
                    className="px-2 py-1 border-b border-slate-600 cursor-pointer"
                    onClick={() => requestSort("stock")}
                  >
                    Stock
                  </th>

                  {/* Action buttons column (Delete) */}
                  <th className="px-2 py-1 border-b border-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {/* Empty state message when filtering returns nothing */}
                {sortedAndFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-1 text-center text-red-400">
                      No product predictions loaded
                    </td>
                  </tr>
                ) : (
                  /* Display product rows */
                  sortedAndFiltered.map((item, idx) => (
                    <tr
                      key={idx}
                      /* Hover effects, highlight pulse for selected row */
                      className={`border-b border-slate-700 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_18px_rgba(0,255,255,0.8)] hover:z-20 hover:border-cyan-400 hover:bg-slate-700 ${
                        item.product === highlightProduct ? "bg-green-600/50 animate-pulse" : ""
                      }`}
                      onClick={() => openModal("bar", item)} // opens product-specific bar chart modal
                    >
                      
                      {/* PRODUCT NAME */}
                      <td className="px-2 py-1">{item.product}</td>

                      {/* LAST SALES */}
                      <td className="px-2 py-1">{item.last_sales}</td>

                      {/* FORECAST VALUE */}
                      <td className="px-2 py-1">{item.forecast}</td>

                      {/* TREND (Up/Down with icon and color) */}
                      <td
                        className={`px-2 py-1 font-semibold flex items-center gap-1 ${
                          item.trend === "Up" ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {item.trend === "Up" ? (
                          <>
                            <ArrowTrendingUpIcon className="w-4 h-4" /> Up
                          </>
                        ) : (
                          <>
                            <ArrowTrendingDownIcon className="w-4 h-4" /> Down
                          </>
                        )}
                      </td>

                      {/* STOCK */}
                      <td className="px-2 py-1">{item.stock}</td>

                      {/* ACTION BUTTONS (Delete) */}
                      <td className="px-2 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent opening modal when clicking delete
                            setProductToDelete(item.product); // store selected product
                            setShowDeleteModal(true); // show confirmation modal
                          }}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" /> {/* Delete icon */}
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>


{showDeleteModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    {/* ADDED COMMENT: Modal wrapper for the delete confirmation */}
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-80 text-center text-white">
      <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>

      {/* ADDED COMMENT: Warning message showing which product will be deleted */}
      <p className="mb-6">
        Are you sure you want to delete "{productToDelete}"? This action cannot be undone.
      </p>

      <div className="flex justify-center gap-4">

        {/* ADDED COMMENT: Delete button triggers API DELETE request */}
        <button
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition"
          onClick={async () => {
            try {
              // ADDED COMMENT: Call backend delete endpoint
              const res = await fetch(
                "https://smartsales-dt0f.onrender.com/api/delete-product",
                {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ product: productToDelete }), // ADDED COMMENT: Send product name to delete
                }
              );

              const data = await res.json();

              if (!res.ok) {
                // ADDED COMMENT: Backend returned error
                alert(data.error || "Failed to delete product.");
                return;
              }

              // ADDED COMMENT: Update UI by removing the deleted product from the list
              setPredictions((prev) =>
                prev.filter((p) => p.product !== productToDelete)
              );

              // ADDED COMMENT: Show success message temporarily
              setDeletedMessage(`"${productToDelete}" deleted successfully!`);
              setTimeout(() => setDeletedMessage(""), 3000);
            } catch (err) {
              console.error(err);
              alert("Error deleting product. Please try again."); // ADDED COMMENT: Fallback error message
            } finally {
              // ADDED COMMENT: Close modal and reset productToDelete value
              setShowDeleteModal(false);
              setProductToDelete(null);
            }
          }}
        >
          Delete
        </button>

        {/* ADDED COMMENT: Cancel button closes the delete modal */}
        <button
          className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-500 transition"
          onClick={() => setShowDeleteModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}



            </table>
          </div>

          {/* ADDED COMMENT: Button actions under product table */}
          <div className="mt-4 flex gap-4 justify-end">
            <button
              onClick={() => navigate("/", { state: { mode: "product-sales" } })}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
            >
              Add More Data
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium transition-all"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* ADDED COMMENT: Chart modal for product visualizations */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={closeModal} // ADDED COMMENT: Clicking outside closes modal
        >
          <div
            className="bg-slate-900 rounded-xl shadow-xl w-11/12 md:w-3/4 lg:w-2/3 p-6 relative transform scale-95 animate-scaleUp"
            onClick={(e) => e.stopPropagation()} // ADDED COMMENT: Prevent closing when clicking inside
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors duration-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* ADDED COMMENT: Chart container */}
            <div className="h-[500px] flex items-center justify-center">
              <div className="w-full h-full transition-transform duration-500 hover:scale-105">
                {renderModalContent()} {/* ADDED COMMENT: Renders chart type (bar/line/etc.) */}
              </div>
            </div>

            {/* ADDED COMMENT: Explanation text under chart */}
            <p className="text-gray-300 mt-6 text-center text-sm md:text-base bg-slate-800 p-4 rounded-lg border border-slate-700">
              {modalChartType === "line"
                ? chartExplanations.line
                : selectedProduct
                ? `${selectedProduct.product} is expected to ${
                    selectedProduct.trend === "Up" ? "grow" : "decline"
                  } by ${Math.abs(selectedProduct.forecast - selectedProduct.last_sales)} units next month.`
                : chartExplanations[modalChartType]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPredictions;
