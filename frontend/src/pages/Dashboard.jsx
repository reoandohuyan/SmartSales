import React, { useState, useEffect } from "react";
import {
  HomeIcon,
  ChartBarIcon,
  CpuChipIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate, useLocation } from "react-router-dom";
import DashboardBottom from "../components/DashboardBottom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // -------------------------------
  // DASHBOARD DATA STATES
  // -------------------------------
  const [months, setMonths] = useState([]);
  const [sales, setSales] = useState([]);
  const [prediction, setPrediction] = useState(0);
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false); 

  // -------------------------------
  // DELETE CONFIRMATION MODAL STATE
  // -------------------------------
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // -------------------------------
  // FETCH DASHBOARD DATA
  // -------------------------------
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch sales data from backend
      const response = await fetch("https://smartsales-dt0f.onrender.com/api/sales-data"); // ✅ updated URL

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0)
        throw new Error("No sales data available.");

      // Extract months and sales arrays
      const monthsArray = data.map((item) => item.month || "Unknown");
      const salesArray = data.map((item) =>
        typeof item.sales === "number" ? item.sales : 0
      );

      setMonths(monthsArray);
      setSales(salesArray);

      // -------------------------------
      // SIMPLE LINEAR REGRESSION FOR PREDICTION
      // -------------------------------
      let nextMonthPrediction = 0;
      let rec = "Add more data to get recommendations";

      if (salesArray.length >= 2) {
        const n = salesArray.length;
        const x = Array.from({ length: n }, (_, i) => i + 1);
        const y = salesArray;

        // Calculate sums required for regression
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
        const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

        // Calculate slope and intercept
        const denominator = n * sumX2 - sumX * sumX;
        const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
        const intercept = (sumY - slope * sumX) / n;

        // Predict next month's sales
        nextMonthPrediction = Math.round(intercept + slope * (n + 1));

        // Generate recommendation based on trend
        rec =
          slope > 0
            ? "Sales are trending up! Consider increasing stock."
            : slope < 0
            ? "Sales are trending down. Review marketing strategies."
            : "Sales are stable. Keep monitoring.";
      }

      // Set state with prediction and recommendation
      setPrediction(nextMonthPrediction);
      setRecommendation(rec);
    } catch (err) {
      // -------------------------------
      // ERROR HANDLING
      // -------------------------------
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "An unknown error occurred.");
      setMonths([]);
      setSales([]);
      setPrediction(0);
      setRecommendation("Unable to calculate recommendation.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // FETCH DASHBOARD DATA ON COMPONENT MOUNT
  // -------------------------------
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // -------------------------------
  // SHOW DELETE CONFIRMATION MODAL
  // -------------------------------
  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setShowConfirm(true);
  };

  // -------------------------------
  // HANDLE ACTUAL DELETE AFTER CONFIRMATION
  // -------------------------------
  const handleDelete = () => {
    if (deleteIndex !== null) {
      const updatedMonths = [...months]; // copy months array
      const updatedSales = [...sales];   // copy sales array
      updatedMonths.splice(deleteIndex, 1); // remove selected month
      updatedSales.splice(deleteIndex, 1);  // remove corresponding sales
      setMonths(updatedMonths);             // update state
      setSales(updatedSales);               // update state
      setDeleteIndex(null);                 // reset selected index
      setShowConfirm(false);                // hide modal
    }
  };

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


  // -------------------------------
  // ERROR STATE DISPLAY
  // -------------------------------
  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white text-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <p className="mb-4">⚠️ {error}</p>
        <button
          onClick={fetchDashboardData} // retry fetching data
          className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition transform duration-300"
        >
          Retry
        </button>
      </div>
    );

  // -------------------------------
  // FUNCTION TO GET NAV LINK CLASSES BASED ON CURRENT PATH
  // -------------------------------
  const getLinkClasses = (path) =>
    location.pathname === path
      ? "px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:scale-105 transition-all flex items-center gap-2"
      : "px-5 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white font-medium hover:scale-105 transition-all flex items-center gap-2";

  // -------------------------------
  // MAIN DASHBOARD JSX
  // -------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 font-sans">
      
      {/* ---------------- NAVBAR ---------------- */}
      <nav className="fixed top-0 w-full bg-slate-900/60 backdrop-blur-xl shadow-lg border-b border-slate-700 z-50">
        <div className="flex justify-between items-center p-2 sm:p-3 relative">
          
             {/* Logo on the left */}
<div className="flex items-center gap-2">
  <img src="/logo.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
  <span className="text-cyan-400 font-bold text-lg sm:text-xl animate-blink">
    Smart Sales
  </span>
</div>

          {/* Desktop menu */}
          <div className="hidden sm:flex flex-1 justify-center gap-2 sm:gap-4 md:gap-6">
            <Link
              to="/"
              className={getLinkClasses("/") + " flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"}
            >
              <HomeIcon className="w-3 h-3 sm:w-4 sm:h-5 md:w-5 md:h-5" /> Home
            </Link>

            <Link
              to="/dashboard"
              className={getLinkClasses("/dashboard") + " flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"}
            >
              <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-5 md:w-5 md:h-5" /> Dashboard
            </Link>

            <Link
              to="/chatbot"
              className={getLinkClasses("/chatbot") + " flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"}
            >
              <CpuChipIcon className="w-3 h-3 sm:w-4 sm:h-5 md:w-5 md:h-5" /> Chatbot
            </Link>

            <Link
              to="/product_predictions"
              className={getLinkClasses("/product_predictions") + " flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"}
            >
              <CubeIcon className="w-3 h-3 sm:w-4 sm:h-5 md:w-5 md:h-5" /> Products
            </Link>
          </div>

      {/* ---------------- MOBILE MENU TOGGLE ---------------- */}
      <button
        className="sm:hidden text-white absolute right-3 top-2"
        onClick={() => setIsOpen(!isOpen)} // toggle mobile menu open/close
      >
        {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>
    </div>

    {/* ---------------- MOBILE COLLAPSIBLE MENU ---------------- */}
    {isOpen && (
      <div className="sm:hidden flex flex-col gap-2 px-3 pb-3">
        {/* Home link */}
        <Link
          to="/"
          className={getLinkClasses("/") + " flex items-center gap-1"}
          onClick={() => setIsOpen(false)} // close menu on click
        >
          <HomeIcon className="w-4 h-4" /> Home
        </Link>

        {/* Dashboard link */}
        <Link
          to="/dashboard"
          className={getLinkClasses("/dashboard") + " flex items-center gap-1"}
          onClick={() => setIsOpen(false)}
        >
          <ChartBarIcon className="w-4 h-4" /> Dashboard
        </Link>

        {/* Chatbot link */}
        <Link
          to="/chatbot"
          className={getLinkClasses("/chatbot") + " flex items-center gap-1"}
          onClick={() => setIsOpen(false)}
        >
          <CpuChipIcon className="w-4 h-4" /> Chatbot
        </Link>

        {/* Products link */}
        <Link
          to="/product_predictions"
          className={getLinkClasses("/product_predictions") + " flex items-center gap-1"}
          onClick={() => setIsOpen(false)}
        >
          <CubeIcon className="w-4 h-4" /> Products
        </Link>
      </div>
    )}
  </nav>

  {/* ---------------- DASHBOARD CONTENT ---------------- */}
  <div className="p-5 pt-32 space-y-5">

    {/* ---------------- FLEX CONTAINER FOR LEFT AND RIGHT PANELS ---------------- */}
    <div className="flex flex-col md:flex-row gap-5">

      {/* ---------------- LEFT PANEL: PREDICTION + RECOMMENDATION ---------------- */}
      <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-5">
        {/* Panel header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-3 rounded-lg mb-4 shadow-md">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6" />
            Analytics Summary
          </h2>
        </div>

        {/* Predicted sales and recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {/* Predicted next month sales */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 shadow-md hover:shadow-xl transition-shadow duration-300">
            <p className="text-sm text-gray-400 flex items-center gap-2">
              📈 Predicted Next Month’s Sales
            </p>
            <p className="text-3xl font-bold text-cyan-400 mt-1">
              ₱ {prediction}
            </p>
          </div>

          {/* Recommendation */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 shadow-md hover:shadow-xl transition-shadow duration-300">
            <p className="text-sm text-gray-400 flex items-center gap-2">
              💡 Recommendation
            </p>
            <p className="text-lg font-medium text-white mt-1">
              {recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- RIGHT PANEL: MONTHLY SALES TABLE ---------------- */}
      <div className="flex-1 bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-left text-white font-semibold text-lg mb-3">
          Monthly Sales Data
        </h2>

        {/* Scrollable table container */}
        <div className="h-64 overflow-y-auto border-t border-slate-700 scrollbar-dark rounded-lg">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-slate-700 z-10">
              <tr className="text-slate-100">
                <th className="p-2 border-b border-slate-600 text-left">Month</th>
                <th className="p-2 border-b border-slate-600 text-right">Sales</th>
                <th className="p-2 border-b border-slate-600 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {months?.map((month, idx) => (
                <tr
                  key={idx}
                  className="text-slate-200 hover:bg-slate-700 transition-colors duration-200"
                >
                  {/* Editable month input */}
                  <td className="p-2 border-b border-slate-600">
                    <input
                      type="text"
                      value={months[idx]}
                      className="w-full bg-slate-700 text-white rounded px-2 py-1"
                      onChange={(e) => {
                        const newMonths = [...months];
                        newMonths[idx] = e.target.value;
                        setMonths(newMonths);
                      }}
                    />
                  </td>

                  {/* Editable sales input */}
                  <td className="p-2 border-b border-slate-600 text-right">
                    <input
                      type="number"
                      value={sales[idx]}
                      className="w-full bg-slate-700 text-white rounded px-2 py-1 text-right"
                      onChange={(e) => {
                        const newSales = [...sales];
                        newSales[idx] = Number(e.target.value);
                        setSales(newSales);
                      }}
                    />
                  </td>

                  {/* Delete button */}
                  <td className="p-2 border-b border-slate-600 text-center">
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-500 hover:scale-105 transition transform duration-200"
                      onClick={() => confirmDelete(idx)} // show delete confirmation modal
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---------------- TABLE ACTION BUTTONS ---------------- */}
        <div className="mt-3 flex gap-3 flex-wrap items-center">
          {/* Add more data button */}
          <button
            className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition transform duration-300"
            onClick={() => navigate("/")}
          >
            Add More Data
          </button>

          {/* Generate report button */}
          <button
            className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition transform duration-300"
            onClick={() => window.print()}
          >
            Generate Report
          </button>

              {/* ---------------- UPDATE SALES BUTTON ---------------- */}
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition transform duration-300 relative flex items-center gap-2"
                onClick={async () => {
                  try {
                    // Prepare payload to send to backend
                    const payload = months.map((month, idx) => ({
                      month: month,
                      sales: sales[idx],
                    }));

                    // Send PUT request to update sales
                    const res = await fetch("https://smartsales-dt0f.onrender.com/api/update-sales", {  // ✅ updated URL
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ data: payload }),
                    });

                    // Check for failed response
                    if (!res.ok) {
                      const errData = await res.json();
                      console.error("Update failed:", errData);
                      alert("Failed to update sales. Check console for details.");
                      return;
                    }

                    // Show "Saved" feedback and refresh dashboard
                    setSaved(true);
                    fetchDashboardData();
                    setTimeout(() => setSaved(false), 3000); // remove saved status after 3 seconds
                  } catch (error) {
                    console.error("Error updating sales:", error);
                    alert("Error updating sales. See console for details.");
                  }
                }}
              >
                Update
                {/* Show Saved ✅ message when update is successful */}
                {saved && <span className="text-white bg-green-700 px-2 py-1 rounded ml-2">Saved ✅</span>}
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- BOTTOM SECTION: CHARTS ---------------- */}
        <DashboardBottom months={months} sales={sales} prediction={prediction} />

        {/* ---------------- DELETE CONFIRMATION MODAL ---------------- */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-80 text-center text-white">
              <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
              <p className="mb-6">Are you sure you want to delete this row?</p>

              {/* Buttons for delete or cancel */}
              <div className="flex justify-center gap-4">
                {/* Delete button triggers handleDelete */}
                <button
                  className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition"
                  onClick={handleDelete}
                >
                  Delete
                </button>

                {/* Cancel button closes modal */}
                <button
                  className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-500 transition"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
