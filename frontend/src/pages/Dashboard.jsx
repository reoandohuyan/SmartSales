import React, { useState, useEffect } from "react";
import {
  HomeIcon,
  ChartBarIcon,
  CpuChipIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate, useLocation } from "react-router-dom";
import DashboardBottom from "../components/DashboardBottom";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dashboard states
  const [months, setMonths] = useState([]);
  const [sales, setSales] = useState([]);
  const [prediction, setPrediction] = useState(0);
  const [recommendation, setRecommendation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false); // ✅ Saved indicator

  // Delete confirmation modal state
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("https://smartsales-dt0f.onrender.com/api/sales-data"); // ✅ updated URL

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0)
        throw new Error("No sales data available.");

      const monthsArray = data.map((item) => item.month || "Unknown");
      const salesArray = data.map((item) =>
        typeof item.sales === "number" ? item.sales : 0
      );

      setMonths(monthsArray);
      setSales(salesArray);

      // Simple linear regression for prediction
      let nextMonthPrediction = 0;
      let rec = "Add more data to get recommendations";

      if (salesArray.length >= 2) {
        const n = salesArray.length;
        const x = Array.from({ length: n }, (_, i) => i + 1);
        const y = salesArray;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
        const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

        const denominator = n * sumX2 - sumX * sumX;
        const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
        const intercept = (sumY - slope * sumX) / n;

        nextMonthPrediction = Math.round(intercept + slope * (n + 1));

        rec =
          slope > 0
            ? "Sales are trending up! Consider increasing stock."
            : slope < 0
            ? "Sales are trending down. Review marketing strategies."
            : "Sales are stable. Keep monitoring.";
      }

      setPrediction(nextMonthPrediction);
      setRecommendation(rec);
    } catch (err) {
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Show confirmation modal
  const confirmDelete = (index) => {
    setDeleteIndex(index);
    setShowConfirm(true);
  };

  // Actually delete after confirmation
  const handleDelete = () => {
    if (deleteIndex !== null) {
      const updatedMonths = [...months];
      const updatedSales = [...sales];
      updatedMonths.splice(deleteIndex, 1);
      updatedSales.splice(deleteIndex, 1);
      setMonths(updatedMonths);
      setSales(updatedSales);
      setDeleteIndex(null);
      setShowConfirm(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white text-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <p className="mb-4">⚠️ {error}</p>
        <button
          onClick={fetchDashboardData}
          className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition transform duration-300"
        >
          Retry
        </button>
      </div>
    );

  const getLinkClasses = (path) =>
    location.pathname === path
      ? "px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:scale-105 transition-all flex items-center gap-2"
      : "px-5 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white font-medium hover:scale-105 transition-all flex items-center gap-2";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 font-sans">
      {/* NAVBAR */}
      <nav className="flex justify-center gap-6 p-4 fixed top-0 w-full bg-slate-900/60 backdrop-blur-xl shadow-lg border-b border-slate-700 z-50">
        <Link to="/" className={getLinkClasses("/")}>
          <HomeIcon className="w-5 h-5" /> Home
        </Link>
        <Link to="/dashboard" className={getLinkClasses("/dashboard")}>
          <ChartBarIcon className="w-5 h-5" /> Dashboard
        </Link>
        <Link to="/chatbot" className={getLinkClasses("/chatbot")}>
          <CpuChipIcon className="w-5 h-5" /> Chatbot
        </Link>
        <Link to="/product_predictions" className={getLinkClasses("/product_predictions")}>
          <CubeIcon className="w-5 h-5" /> Products
        </Link>
      </nav>

      {/* Dashboard Content */}
      <div className="p-5 pt-32 space-y-5">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Left: Prediction + Recommendation */}
          <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-5">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-3 rounded-lg mb-4 shadow-md">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6" />
                Analytics Summary
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 shadow-md hover:shadow-xl transition-shadow duration-300">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  📈 Predicted Next Month’s Sales
                </p>
                <p className="text-3xl font-bold text-cyan-400 mt-1">
                  ₱ {prediction}
                </p>
              </div>

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

          {/* Right: Monthly Sales Table */}
          <div className="flex-1 bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
            <h2 className="text-left text-white font-semibold text-lg mb-3">
              Monthly Sales Data
            </h2>

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

                      <td className="p-2 border-b border-slate-600 text-center">
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-500 hover:scale-105 transition transform duration-200"
                          onClick={() => confirmDelete(idx)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Buttons */}
            <div className="mt-3 flex gap-3 flex-wrap items-center">
              <button
                className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition transform duration-300"
                onClick={() => navigate("/")}
              >
                Add More Data
              </button>

              <button
                className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition transform duration-300"
                onClick={() => window.print()}
              >
                Generate Report
              </button>

              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:scale-105 transition transform duration-300 relative flex items-center gap-2"
                onClick={async () => {
                  try {
                    const payload = months.map((month, idx) => ({
                      month: month,
                      sales: sales[idx],
                    }));

                    const res = await fetch("https://smartsales-dt0f.onrender.com/api/update-sales", {  // ✅ updated URL
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: payload }),
});


                    if (!res.ok) {
                      const errData = await res.json();
                      console.error("Update failed:", errData);
                      alert("Failed to update sales. Check console for details.");
                      return;
                    }

                    setSaved(true);
                    fetchDashboardData();
                    setTimeout(() => setSaved(false), 3000);
                  } catch (error) {
                    console.error("Error updating sales:", error);
                    alert("Error updating sales. See console for details.");
                  }
                }}
              >
                Update
                {saved && <span className="text-white bg-green-700 px-2 py-1 rounded ml-2">Saved ✅</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Charts */}
        <DashboardBottom months={months} sales={sales} prediction={prediction} />

        {/* Delete Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg w-80 text-center text-white">
              <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
              <p className="mb-6">Are you sure you want to delete this row?</p>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition"
                  onClick={handleDelete}
                >
                  Delete
                </button>
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
