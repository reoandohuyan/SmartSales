import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const DashboardBottom = ({ months, sales, prediction }) => {
  // --- References for chart canvas elements ---
  const lineChartRef = useRef(null); // Ref for the line chart canvas
  const barChartRef = useRef(null); // Ref for the bar chart canvas
  const doughnutChartRef = useRef(null); // Ref for the doughnut chart canvas

  // --- References for chart instances to allow destroying/recreating charts ---
  const lineChartInstance = useRef(null);
  const barChartInstance = useRef(null);
  const doughnutChartInstance = useRef(null);

  // --- References for modal chart ---
  const modalChartRef = useRef(null); // Ref for chart displayed in modal
  const modalChartInstance = useRef(null); // Instance of modal chart

  // Hardcoded accuracy value for doughnut chart
  const hardcodedAccuracy = 96;

  // --- Modal state ---
  const [isModalOpen, setIsModalOpen] = useState(false); // Whether chart modal is open
  const [modalType, setModalType] = useState(null); // Type of chart to display in modal
  const [chartError, setChartError] = useState(null); // Store any chart rendering errors

  // --- Explanations for each chart type ---
  const chartExplanations = {
    line:
      "This line chart shows the monthly sales trend including the predicted value for next month. It helps visualize whether sales are increasing, stable, or declining over time.",
    bar:
      "This bar chart provides a clear comparison of monthly sales. It helps users quickly identify strong and weak months in performance.",
    doughnut:
      "This doughnut chart represents the system’s prediction accuracy. It shows how close the system’s predictions are to the actual sales.",
  };

  // --- Function to open modal ---
  const openModal = (type) => {
    setModalType(type); // Set the type of chart to display
    setIsModalOpen(true); // Open the modal
  };

  // --- Function to close modal ---
  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    modalChartInstance.current?.destroy(); // Destroy the modal chart instance to prevent duplicates
  };

  // --- Close modal if clicking outside of the modal content ---
  const handleOutsideClick = (e) => {
    if (e.target.dataset.modal === "background") {
      closeModal(); // Close modal when clicking on the background
    }
  };

  // === Main charts rendering logic ===
  useEffect(() => {
    try {
      // --- Validate input data ---
      const validMonths = Array.isArray(months) ? months : []; // Ensure months is an array
      const validSales = Array.isArray(sales) ? sales : []; // Ensure sales is an array
      const validPrediction = typeof prediction === "number" ? prediction : 0; // Ensure prediction is a number

      // --- LINE CHART ---
      if (lineChartRef.current) {
        const ctx = lineChartRef.current.getContext("2d"); // Get canvas context

        // --- Create gradient background for line chart ---
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(56,189,248,0.5)"); // Top gradient color
        gradient.addColorStop(1, "rgba(56,189,248,0.1)"); // Bottom gradient color

        // --- Extend months and sales arrays to include predicted next month ---
        const extendedMonths = [...validMonths, "Next Month"];
        const extendedSales = [...validSales, validPrediction];

        // --- Destroy previous chart instance if it exists ---
        lineChartInstance.current?.destroy();

        // --- Create new line chart ---
        lineChartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: extendedMonths, // X-axis labels
            datasets: [
              {
                label: "Monthly Sales",
                data: extendedSales, // Sales values including prediction
                borderColor: "#38bdf8", // Line color
                backgroundColor: gradient, // Fill gradient
                borderWidth: 3,
                tension: 0.4, // Smooth curve
                fill: true, // Fill area under line
                // Point color: highlight predicted point
                pointBackgroundColor: extendedSales.map((_, i) =>
                  i === extendedSales.length - 1 ? "#facc15" : "#38bdf8"
                ),
                pointHoverRadius: 8, // Hover effect size
                pointHoverBorderWidth: 3,
                pointHoverBorderColor: "#fff",
              },
            ],
          },
          options: {
            animation: { duration: 1000, easing: "easeOutQuart" }, // Animation settings
            plugins: {
              legend: { labels: { color: "#e2e8f0" } }, // Legend text color
              tooltip: { mode: "nearest", intersect: false }, // Tooltip behavior
            },
            hover: { mode: "nearest", intersect: true }, // Hover behavior
            scales: {
              x: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } }, // X-axis styling
              y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } }, // Y-axis styling
            },
          },
        });
      }
// --- Bar Chart ---
if (barChartRef.current) {
  const ctx = barChartRef.current.getContext("2d"); // Get canvas context for bar chart

  // --- Create vertical gradient for bar fill ---
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, "rgba(56,189,248,0.7)"); // Top color
  gradient.addColorStop(1, "rgba(56,189,248,0.3)"); // Bottom color

  // --- Destroy previous chart instance if exists ---
  barChartInstance.current?.destroy();

  // --- Create new bar chart ---
  barChartInstance.current = new Chart(ctx, {
    type: "bar",
    data: {
      labels: validMonths, // X-axis labels
      datasets: [
        {
          label: "Monthly Sales",
          data: validSales, // Sales data
          backgroundColor: gradient, // Fill gradient
          borderColor: "#38bdf8", // Bar border color
          borderWidth: 2,
          borderRadius: 8, // Rounded corners
          hoverBackgroundColor: "rgba(56,189,248,0.9)", // Hover effect
        },
      ],
    },
    options: {
      animation: { duration: 1000, easing: "easeOutQuart" }, // Animation settings
      plugins: {
        legend: { labels: { color: "#e2e8f0" } }, // Legend styling
        tooltip: { mode: "index", intersect: false }, // Tooltip behavior
      },
      scales: {
        x: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } }, // X-axis styling
        y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } }, // Y-axis styling
      },
    },
  });
}

// --- Doughnut Chart ---
if (doughnutChartRef.current) {
  const ctx = doughnutChartRef.current.getContext("2d"); // Get canvas context

  // --- Destroy previous instance if exists ---
  doughnutChartInstance.current?.destroy();

  // --- Create new doughnut chart ---
  doughnutChartInstance.current = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Accuracy", "Error"], // Labels for slices
      datasets: [
        {
          data: [hardcodedAccuracy, 100 - hardcodedAccuracy], // Values for slices
          backgroundColor: ["#38bdf8", "rgba(255,255,255,0.15)"], // Slice colors
          borderWidth: 0,
          hoverOffset: 15, // Hover effect
        },
      ],
    },
    options: {
      cutout: "70%", // Doughnut hole size
      animation: { animateRotate: true, animateScale: true }, // Animation effects
      plugins: { legend: { display: false } }, // Hide legend
      responsive: true, // Make chart responsive
    },
  });
}

// Clear any previous chart errors
setChartError(null);

// --- Catch errors during chart rendering ---
} catch (err) {
  console.error("Dashboard chart error:", err);
  setChartError("Failed to load chart data."); // Set error state for UI feedback
  lineChartInstance.current?.destroy(); // Destroy previous charts to prevent broken rendering
  barChartInstance.current?.destroy();
  doughnutChartInstance.current?.destroy();
}

// --- Cleanup function on dependency change or unmount ---
return () => {
  lineChartInstance.current?.destroy();
  barChartInstance.current?.destroy();
  doughnutChartInstance.current?.destroy();
};
}, [months, sales, prediction]);

// === Modal chart effect ===
useEffect(() => {
  try {
    if (isModalOpen && modalChartRef.current) {
      const ctx = modalChartRef.current.getContext("2d"); // Canvas context for modal chart

      // Destroy previous modal chart instance to prevent duplicates
      modalChartInstance.current?.destroy();

      // --- Validate data ---
      const validMonths = Array.isArray(months) ? months : [];
      const validSales = Array.isArray(sales) ? sales : [];
      const validPrediction = typeof prediction === "number" ? prediction : 0;

      // --- Switch modal chart based on type ---
      switch (modalType) {
        case "line":
          // Create gradient for line chart in modal
          const g1 = ctx.createLinearGradient(0, 0, 0, 400);
          g1.addColorStop(0, "rgba(56,189,248,0.5)");
          g1.addColorStop(1, "rgba(56,189,248,0.1)");

          // Create modal line chart
          modalChartInstance.current = new Chart(ctx, {
            type: "line",
            data: {
              labels: [...validMonths, "Next Month"],
              datasets: [
                {
                  label: "Monthly Sales",
                  data: [...validSales, validPrediction],
                  borderColor: "#38bdf8",
                  backgroundColor: g1,
                  borderWidth: 3,
                  tension: 0.4,
                  fill: true,
                },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false },
          });
          break;

        case "bar":
          // Gradient for modal bar chart
          const g2 = ctx.createLinearGradient(0, 0, 0, 400);
          g2.addColorStop(0, "rgba(56,189,248,0.7)");
          g2.addColorStop(1, "rgba(56,189,248,0.3)");

          // Create modal bar chart
          modalChartInstance.current = new Chart(ctx, {
            type: "bar",
            data: {
              labels: validMonths,
              datasets: [
                {
                  label: "Monthly Sales",
                  data: validSales,
                  backgroundColor: g2,
                  borderColor: "#38bdf8",
                  borderWidth: 2,
                  borderRadius: 8,
                },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false },
          });
          break;

        case "doughnut":
          // Create modal doughnut chart
          modalChartInstance.current = new Chart(ctx, {
            type: "doughnut",
            data: {
              labels: ["Accuracy", "Error"],
              datasets: [
                {
                  data: [hardcodedAccuracy, 100 - hardcodedAccuracy],
                  backgroundColor: ["#38bdf8", "rgba(255,255,255,0.15)"],
                  borderWidth: 0,
                },
              ],
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: "70%" },
          });
          break;

        default:
          break; // Do nothing if type is unknown
      }
    }
  } catch (err) {
    console.error("Modal chart error:", err);
    setChartError("Failed to load modal chart."); // Set error state for modal
    modalChartInstance.current?.destroy(); // Destroy broken chart instance
  }
}, [isModalOpen, modalType]);

      return (
  <>
    {/* --- Display chart error if any --- */}
    {chartError && (
      <div className="text-red-400 text-center mb-3">{chartError}</div> // Show error message if chart fails to load
    )}

    {/* --- Main Charts Container --- */}
    <div className="flex flex-col md:flex-row gap-5 mt-5">
      
      {/* --- Line Chart Card --- */}
      <div
        className="flex-1 p-5 rounded-xl border border-slate-700 bg-slate-800 shadow-lg cursor-pointer"
        onClick={() => openModal("line")} // Open modal displaying line chart
      >
        <h2 className="text-white text-lg font-semibold mb-3">Sales Trend</h2>
        <canvas ref={lineChartRef} className="w-full h-64"></canvas> {/* Canvas for line chart */}
      </div>

      {/* --- Bar Chart Card --- */}
      <div
        className="flex-1 p-5 rounded-xl border border-slate-700 bg-slate-800 shadow-lg cursor-pointer"
        onClick={() => openModal("bar")} // Open modal displaying bar chart
      >
        <h2 className="text-white text-lg font-semibold mb-3">Sales Overview</h2>
        <canvas ref={barChartRef} className="w-full h-64"></canvas> {/* Canvas for bar chart */}
      </div>

      {/* --- Doughnut Chart Card --- */}
      <div
        className="flex-1 p-5 rounded-xl border border-slate-700 bg-slate-800 shadow-lg flex flex-col items-center cursor-pointer"
        onClick={() => openModal("doughnut")} // Open modal displaying doughnut chart
      >
        <h2 className="text-white text-lg font-semibold mb-3 text-center">
          Prediction Accuracy
        </h2>
        <div className="w-44 h-44">
          <canvas ref={doughnutChartRef} className="w-full h-full"></canvas> {/* Canvas for doughnut chart */}
        </div>
        <p className="text-white mt-3 text-xl font-bold">{hardcodedAccuracy}%</p> {/* Display accuracy percentage */}
      </div>
    </div>

    {/* --- Modal for Enlarged Chart --- */}
    {isModalOpen && (
      <div
        data-modal="background" // Identify modal background for click detection
        onClick={handleOutsideClick} // Close modal if clicked outside chart area
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fadeIn"
      >
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg relative w-11/12 md:w-3/4 max-h-[90vh] overflow-y-auto transform scale-95 animate-scaleUp">
          
          {/* --- Close Button --- */}
          <button
            className="absolute top-3 right-3 text-white text-lg font-bold"
            onClick={closeModal} // Close modal when clicked
          >
            &times;
          </button>

          {/* --- Modal Chart Canvas --- */}
          <div className="w-full h-72 md:h-96">
            <canvas ref={modalChartRef} className="w-full h-full"></canvas> {/* Canvas for modal chart */}
          </div>

          {/* --- Explanation Box --- */}
          <div className="mt-5 p-4 bg-slate-700 rounded-lg shadow-inner">
            <p className="text-slate-300 text-center text-lg">
              {chartExplanations[modalType]} {/* Show explanation based on current chart type */}
            </p>
          </div>
        </div>
      </div>
    )}
  </>
);
};

export default DashboardBottom;
