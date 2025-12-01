import React, { useEffect, useState } from "react";
import { ArrowTrendingUpIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardData } from "../redux/dashboardSlice";

const DashboardTop = () => {
  const navigate = useNavigate(); // Hook to navigate programmatically
  const dispatch = useDispatch(); // Redux dispatch function

  // Destructure required dashboard state from Redux store
  const { months, sales, prediction, recommendation, status } = useSelector(
    (state) => state.dashboard
  );

  // Local state for editable sales and months
  const [editableSales, setEditableSales] = useState([]);
  const [editableMonths, setEditableMonths] = useState([]);
  const [originalMonths, setOriginalMonths] = useState([]); // Keep track of original months
  const [saved, setSaved] = useState(false); // To show "Saved" feedback

  // Fetch dashboard data on component mount
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // When sales or months update in Redux store, copy them to local editable state
  useEffect(() => {
    if (Array.isArray(sales) && sales.length > 0) {
      setEditableSales([...sales]);      // copy sales array
      setEditableMonths([...months]);    // copy months array
      setOriginalMonths([...months]);    // store original months
    }
  }, [sales, months]);

  // Handle change in sales input
  const handleSaleChange = (index, value) => {
    const updated = [...editableSales];
    updated[index] = Number(value); // ensure value is a number
    setEditableSales(updated);
  };

  // Handle change in month input
  const handleMonthChange = (index, value) => {
    const updated = [...editableMonths];
    updated[index] = value;
    setEditableMonths(updated);
  };

  // Update all sales data to backend
  const updateAllSales = async () => {
    try {
      // Prepare payload to send to backend
      const payload = editableMonths.map((month, idx) => ({
        month: month,
        sales: editableSales[idx] || 0, // default to 0 if empty
      }));

      // Send PUT request to update sales
      const res = await fetch("https://smartsales-dt0f.onrender.com/api/update-sales", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });

      // Handle failed response
      if (!res.ok) {
        const resData = await res.json();
        console.error("Update failed:", resData);
        alert("Failed to update sales. Check console for details.");
        return;
      }

      // Save original months after successful update
      setOriginalMonths([...editableMonths]);

      // Refresh dashboard data from backend
      dispatch(fetchDashboardData());

      // Show "Saved" indicator for 3 seconds
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error updating sales:", error);
      alert("Error updating sales. See console for details.");
    }
  };
// --- Handle Delete ---
const handleDelete = async (month) => {
  // Ask user for confirmation before deleting
  if (!window.confirm(`Are you sure you want to delete ${month}?`)) return;

  try {
    // Send DELETE request to backend with the month to delete
    const res = await fetch("https://smartsales-dt0f.onrender.com/api/delete-sale", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month }), // Pass month in request body
    });

    // If response is not OK, log error and alert user
    if (!res.ok) {
      const resData = await res.json();
      console.error("Delete failed:", resData);
      alert("Failed to delete. Check console for details.");
      return;
    }

    // Remove the deleted month from local editable state arrays
    const idx = editableMonths.indexOf(month);
    if (idx > -1) {
      const newMonths = [...editableMonths];
      const newSales = [...editableSales];
      newMonths.splice(idx, 1); // remove month
      newSales.splice(idx, 1);  // remove corresponding sales
      setEditableMonths(newMonths);
      setEditableSales(newSales);
    }

    // Notify user of successful deletion
    alert(`${month} deleted successfully!`);
  } catch (error) {
    // Catch and log any network or JS errors
    console.error("Error deleting sale:", error);
    alert("Error deleting sale. See console for details.");
  }
};

return (
  <div className="flex flex-col gap-5">
    <div className="flex flex-col md:flex-row gap-5">
      {/* Prediction & Recommendation Section */}
      <div className="flex-1 bg-slate-800 p-5 rounded-xl border shadow-lg">
        <div className="grid grid-cols-1 gap-4">
          {/* Predicted Sales */}
          <div className="flex items-center bg-slate-700 p-4 rounded-lg">
            <ArrowTrendingUpIcon className="w-8 h-8 text-cyan-400 mr-4" />
            <div>
              <p className="text-sm text-gray-300">Predicted Next Month’s Sales</p>
              <p className="text-2xl font-bold text-white">₱ {prediction || 0}</p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="flex items-center bg-slate-700 p-4 rounded-lg">
            <LightBulbIcon className="w-8 h-8 text-yellow-400 mr-4" />
            <div>
              <p className="text-sm text-gray-300">Recommendation</p>
              <p className="text-xl font-bold text-white">{recommendation || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Sales Table Section */}
      <div className="flex-1 bg-slate-800 p-5 rounded-xl border shadow-lg">
        <h2 className="text-white font-semibold text-lg mb-3">Monthly Sales Data</h2>

        {/* Table of editable months and sales */}
        <table className="w-full border-collapse mb-3">
          <thead>
            <tr className="bg-slate-700 text-slate-100">
              <th className="p-2 border-b border-slate-600 text-left">Month</th>
              <th className="p-2 border-b border-slate-600 text-right">Sales</th>
              <th className="p-2 border-b border-slate-600 text-center">Actions</th> {/* Action column for Delete */}
            </tr>
          </thead>
          <tbody>
            {editableMonths.map((month, idx) => (
              <tr key={idx} className="text-slate-200 hover:bg-slate-700">
                <td className="p-2 border-b border-slate-600">
                  {/* Editable month input */}
                  <input
                    type="text"
                    value={month}
                    onChange={(e) => handleMonthChange(idx, e.target.value)}
                    className="w-full bg-slate-700 text-white rounded px-2 py-1"
                  />
                </td>

                <td className="p-2 border-b border-slate-600 text-right">
                  {/* Editable sales input */}
                  <input
                    type="number"
                    value={editableSales[idx] || 0}
                    onChange={(e) => handleSaleChange(idx, e.target.value)}
                    className="w-20 text-black px-2 py-1 rounded"
                  />
                </td>

                <td className="p-2 border-b border-slate-600 text-center">
                  {/* Delete button */}
                  <button
                    className="bg-red-600 px-3 py-1 rounded-lg text-white hover:bg-red-500 hover:scale-105 transition transform duration-200"
                    onClick={() => handleDelete(month)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap items-center">
          {/* Navigate to add more data */}
          <button
            className="bg-cyan-500 text-white px-4 py-2 rounded-lg"
            onClick={() => navigate("/")}
          >
            Add More Data
          </button>

          {/* Print report */}
          <button
            className="bg-cyan-500 text-white px-4 py-2 rounded-lg"
            onClick={() => window.print()}
          >
            Generate Report
          </button>

          {/* Update all sales */}
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg relative"
            onClick={updateAllSales}
          >
            Update
            {saved && (
              <span className="absolute -top-6 right-0 text-green-400 font-semibold text-sm">
                Saved ✅
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardTop;
