// src/pages/ProductPredictions.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
} from "chart.js";

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
} from "@heroicons/react/24/outline";



import jsPDF from "jspdf";
import "jspdf-autotable";

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
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
// Delete confirmation modal state
const [productToDelete, setProductToDelete] = useState(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);



  const [deletedMessage, setDeletedMessage] = useState(""); // ⭐ ADDED for delete confirmation toast
  const [predictions, setPredictions] = useState([]);
  const [salesData, setSalesData] = useState({ months: [], sales: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [highlightProduct, setHighlightProduct] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalChartType, setModalChartType] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  const chartExplanations = {
    line: "This chart visualizes your historical sales and predicts the next month's sales using Linear Regression. It helps you understand trends—whether performance is rising, steady, or declining.",
    bar: "This bar chart compares your last recorded sales and the AI forecast for each product. It highlights which items are expected to grow or drop next month.",
    doughnut: "The doughnut chart shows your top-performing products based on their forecasted sales. It quickly identifies which products will lead in performance next month.",
  };

  useEffect(() => {
    if (location.state?.highlightProduct) {
      setHighlightProduct(location.state.highlightProduct);
    }

    const fetchData = async () => {
  try {
    setLoading(true);
    setError("");

    // 1️⃣ Fetch sales data
    const resSales = await fetch("https://smartsales-dt0f.onrender.com/api/dashboard");
    if (!resSales.ok) {
      throw new Error(`Dashboard API failed with status ${resSales.status}`);
    }
    const salesJson = await resSales.json(); // safer
    setSalesData({
      months: [...salesJson.months, "Next Month"],
      sales: [...salesJson.sales, salesJson.linear_regression_prediction],
    });

    // 2️⃣ Fetch product predictions
    // 2️⃣ Fetch product predictions
const resPred = await fetch("https://smartsales-dt0f.onrender.com/api/products-dashboard");
console.log("Products response status:", resPred.status);

if (!resPred.ok) {
  throw new Error("Products API returned an error");
}

const prodJson = await resPred.json(); // ✅ automatically parses JSON
console.log("Products JSON:", prodJson);

setPredictions(prodJson.predictions || []);


  } catch (err) {
    console.error("Error fetching product predictions:", err);
    setError("Failed to load product predictions. Please check console logs.");
  } finally {
    setLoading(false);
  }
};




    fetchData();
  }, [location.state]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        Loading product predictions...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-center p-4">
        {error}
      </div>
    );

  // ---------------------
  // Chart Data
  // ---------------------

  const lineData = {
    labels: salesData.months,
    datasets: [
      {
        label: "Sales",
        data: salesData.sales,
        borderColor: "#0ff",
        backgroundColor: "rgba(0,255,255,0.2)",
        fill: true,
        tension: 0.4,
        borderWidth: 4,
        pointRadius: 6,
        pointBackgroundColor: "#0ff",
      },
    ],
  };

  const lineOptions = {
    plugins: { legend: { labels: { color: "#e2e8f0" } } },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
    },
  };

  const barData = {
    labels: predictions.map((p) => p.product),
    datasets: [
      {
        label: "Last Sales",
        data: predictions.map((p) => p.last_sales),
        backgroundColor: "rgba(38,99,235,0.8)",
        borderColor: "#0ff",
        borderWidth: 2,
        borderRadius: 10,
      },
      {
        label: "Forecast",
        data: predictions.map((p) => p.forecast),
        backgroundColor: "rgba(56,189,248,0.8)",
        borderColor: "#0ff",
        borderWidth: 2,
        borderRadius: 10,
      },
    ],
  };

  const barOptions = {
    plugins: { legend: { labels: { color: "#e2e8f0" } } },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
    },
  };

  const topProducts = predictions
    .slice()
    .sort((a, b) => b.forecast - a.forecast)
    .slice(0, 5);

  const doughnutData = {
    labels: topProducts.map((p) => p.product),
    datasets: [
      {
        data: topProducts.map((p) => p.forecast),
        backgroundColor: [
          "rgba(0,255,255,0.8)",
          "rgba(74,222,128,0.8)",
          "rgba(250,204,21,0.8)",
          "rgba(248,113,113,0.8)",
          "rgba(167,139,250,0.8)",
        ],
        borderColor: ["#0ff", "#0f0", "#ff0", "#f00", "#a7f"],
        borderWidth: 4,
        hoverOffset: 12,
      },
    ],
  };

  const doughnutOptions = {
    cutout: "55%",
    plugins: { legend: { position: "bottom", labels: { color: "#e2e8f0" } } },
  };

  // ---------------------
  // Modal
  // ---------------------

  const openModal = (chartType, product = null) => {
    setModalChartType(chartType);
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalChartType("");
    setSelectedProduct(null);
  };

  const renderModalContent = () => {
    if (selectedProduct) {
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

    return renderModalChart();
  };

  const renderModalChart = () => {
    if (modalChartType === "line") return <Line data={lineData} options={lineOptions} />;
    if (modalChartType === "bar") return <Bar data={barData} options={barOptions} />;
    if (modalChartType === "doughnut")
      return <Doughnut data={doughnutData} options={{ ...doughnutOptions, cutout: "40%" }} />;
    return null;
  };

  // ---------------------
  // Sorting and Filtering
  // ---------------------

  const sortedAndFiltered = predictions
    .filter((p) => p.product.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  // ⭐ Delete function
  // ⭐ Delete with confirmation (already mostly correct)
const handleDelete = async (productName) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete "${productName}"? This action cannot be undone.`
  );
  if (!confirmDelete) return;

  try {
    const res = await fetch("https://smartsales-dt0f.onrender.com/api/delete-product", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ product: productName }),
});


    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete product.");
      return;
    }

    // Update local state only if backend deletion succeeds
    setPredictions((prev) => prev.filter((p) => p.product !== productName));
    setDeletedMessage(`"${productName}" deleted successfully!`);
    setTimeout(() => setDeletedMessage(""), 3000);
  } catch (err) {
    console.error(err);
    alert("Error deleting product. Please try again.");
  }
};



  // ---------------------
  // RETURN UI
  // ---------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 font-sans">
     {/* NAVBAR */}
<nav className="fixed top-0 w-full bg-slate-900/60 backdrop-blur-xl shadow-lg border-b border-slate-700 z-50">
  <div className="flex justify-between items-center p-2 sm:p-3 md:p-4 relative">
    {/* Logo on the left */}
    <div className="text-cyan-400 font-bold text-lg sm:text-xl">
      Smart Sales
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
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {React.cloneElement(icons[idx], { className: "w-3 h-3 sm:w-4 sm:h-5 md:w-5 md:h-5" })}{" "}
            {labels[idx]}
          </Link>
        );
      })}
    </div>

    {/* Mobile menu toggle */}
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
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
            onClick={() => setIsOpen(false)}
          >
            {React.cloneElement(icons[idx], { className: "w-4 h-4" })} {labels[idx]}
          </Link>
        );
      })}
    </div>
  )}
</nav>



      <div className="p-5 pt-32 space-y-5 max-w-7xl mx-auto">
        <header className="text-center mb-6 flex flex-col items-center gap-2">
  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400 mb-1 drop-shadow-[0_0_10px_#0ff] flex flex-col sm:flex-row items-center gap-2">
    <ChartPieIcon className="w-10 h-10" />
    Product Sales Predictions
  </h1>
  <p className="text-sm sm:text-base text-gray-400">Smart insights on upcoming sales performance</p>
</header>
{/* Charts */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
  <div
    onClick={() => openModal("line")}
    className="cursor-pointer bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-3 sm:p-5 hover:shadow-[0_0_25px_rgba(0,255,255,0.7)] transition-shadow duration-300"
  >
    <h2 className="text-cyan-400 font-semibold mb-3 drop-shadow-[0_0_6px_#0ff] flex items-center gap-2">
      <PresentationChartLineIcon className="w-5 h-5 sm:w-6 sm:h-6" /> Historical Sales
    </h2>
    <div className="h-64 sm:h-72 md:h-80">
      <Line data={lineData} options={{ ...lineOptions, responsive: true, maintainAspectRatio: false }} />
    </div>
  </div>

  <div
    onClick={() => openModal("bar")}
    className="cursor-pointer bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-3 sm:p-5 hover:shadow-[0_0_25px_rgba(0,255,255,0.7)] transition-shadow duration-300"
  >
    <h2 className="text-cyan-400 font-semibold mb-3 drop-shadow-[0_0_6px_#0ff] flex items-center gap-2">
      <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6" /> Predicted vs Actual Sales
    </h2>
    <div className="h-64 sm:h-72 md:h-80">
      <Bar data={barData} options={{ ...barOptions, responsive: true, maintainAspectRatio: false }} />
    </div>
  </div>

  <div
    onClick={() => openModal("doughnut")}
    className="cursor-pointer bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-3 sm:p-5 hover:shadow-[0_0_25px_rgba(0,255,255,0.7)] transition-shadow duration-300"
  >
    <h2 className="text-cyan-400 font-semibold mb-3 drop-shadow-[0_0_6px_#0ff] flex items-center gap-2">
      <TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6" /> Top Performing Products
    </h2>
    <div className="h-64 sm:h-72 md:h-80">
      <Doughnut data={doughnutData} options={{ ...doughnutOptions, responsive: true, maintainAspectRatio: false }} />
    </div>
  </div>
</div>


        {/* Search Input */}
        <div className="mt-5">
          <input
            type="text"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        {/* Product Table */}
        <div className="bg-slate-800 rounded-xl shadow-lg p-4 mt-3">
          <h2 className="text-lg font-bold mb-3">Product Predictions</h2>
          <div className="h-96 overflow-y-auto border-t border-b border-slate-700 scrollbar-dark">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-700 sticky top-0 z-10">
                  <th className="px-2 py-1 border-b border-slate-600 cursor-pointer" onClick={() => requestSort("product")}>Product</th>
                  <th className="px-2 py-1 border-b border-slate-600 cursor-pointer" onClick={() => requestSort("last_sales")}>Last Sales</th>
                  <th className="px-2 py-1 border-b border-slate-600 cursor-pointer" onClick={() => requestSort("forecast")}>Forecast</th>
                  <th className="px-2 py-1 border-b border-slate-600 cursor-pointer" onClick={() => requestSort("trend")}>Trend</th>
                  <th className="px-2 py-1 border-b border-slate-600 cursor-pointer" onClick={() => requestSort("stock")}>Stock</th>
                  <th className="px-2 py-1 border-b border-slate-600">Actions</th> {/* ⭐ new column */}
                </tr>
              </thead>

              <tbody>
                {sortedAndFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-1 text-center text-red-400">
                      No product predictions loaded
                    </td>
                  </tr>
                ) : (
                  sortedAndFiltered.map((item, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-700 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_18px_rgba(0,255,255,0.8)] hover:z-20 hover:border-cyan-400 hover:bg-slate-700 ${
                        item.product === highlightProduct ? "bg-green-600/50 animate-pulse" : ""
                      }`}
                      onClick={() => openModal("bar", item)}
                    >
                      <td className="px-2 py-1">{item.product}</td>
                      <td className="px-2 py-1">{item.last_sales}</td>
                      <td className="px-2 py-1">{item.forecast}</td>
                      <td className={`px-2 py-1 font-semibold flex items-center gap-1 ${item.trend === "Up" ? "text-green-400" : "text-red-400"}`}>
                        {item.trend === "Up" ? <><ArrowTrendingUpIcon className="w-4 h-4" /> Up</> : <><ArrowTrendingDownIcon className="w-4 h-4" /> Down</>}
                      </td>
                      <td className="px-2 py-1">{item.stock}</td>
                      <td className="px-2 py-1">
                        <button
  onClick={(e) => {
    e.stopPropagation(); // prevent chart modal from opening
    setProductToDelete(item.product); // store the product to delete
    setShowDeleteModal(true);         // show the confirmation modal
  }}
  className="text-red-400 hover:text-red-600 transition-colors"
>
  <TrashIcon className="w-5 h-5" />
</button>

                      </td>
                    </tr>
                  ))
                )}
              </tbody>


{showDeleteModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-80 text-center text-white">
      <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
      <p className="mb-6">
        Are you sure you want to delete "{productToDelete}"? This action cannot be undone.
      </p>
      <div className="flex justify-center gap-4">
        <button
          className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition"
          onClick={async () => {
            try {
              const res = await fetch(
                "https://smartsales-dt0f.onrender.com/api/delete-product",
                {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ product: productToDelete }),
                }
              );

              const data = await res.json();

              if (!res.ok) {
                alert(data.error || "Failed to delete product.");
                return;
              }

              setPredictions((prev) =>
                prev.filter((p) => p.product !== productToDelete)
              );
              setDeletedMessage(`"${productToDelete}" deleted successfully!`);
              setTimeout(() => setDeletedMessage(""), 3000);
            } catch (err) {
              console.error(err);
              alert("Error deleting product. Please try again.");
            } finally {
              setShowDeleteModal(false);
              setProductToDelete(null);
            }
          }}
        >
          Delete
        </button>
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

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-slate-900 rounded-xl shadow-xl w-11/12 md:w-3/4 lg:w-2/3 p-6 relative transform scale-95 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors duration-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="h-[500px] flex items-center justify-center">
              <div className="w-full h-full transition-transform duration-500 hover:scale-105">
                {renderModalContent()}
              </div>
            </div>

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
