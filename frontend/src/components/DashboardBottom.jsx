import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

const DashboardBottom = ({ months, sales, prediction }) => {
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const doughnutChartRef = useRef(null);

  const lineChartInstance = useRef(null);
  const barChartInstance = useRef(null);
  const doughnutChartInstance = useRef(null);

  const modalChartRef = useRef(null);
  const modalChartInstance = useRef(null);

  const hardcodedAccuracy = 96;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [chartError, setChartError] = useState(null); // ADDED error state

  const chartExplanations = {
    line:
      "This line chart shows the monthly sales trend including the predicted value for next month. It helps visualize whether sales are increasing, stable, or declining over time.",
    bar:
      "This bar chart provides a clear comparison of monthly sales. It helps users quickly identify strong and weak months in performance.",
    doughnut:
      "This doughnut chart represents the system’s prediction accuracy. It shows how close the system’s predictions are to the actual sales.",
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    modalChartInstance.current?.destroy();
  };

  const handleOutsideClick = (e) => {
    if (e.target.dataset.modal === "background") {
      closeModal();
    }
  };

  // === Main charts ===
  useEffect(() => {
    try {
      // Basic validation
      const validMonths = Array.isArray(months) ? months : [];
      const validSales = Array.isArray(sales) ? sales : [];
      const validPrediction = typeof prediction === "number" ? prediction : 0;

      // --- Line Chart ---
      if (lineChartRef.current) {
        const ctx = lineChartRef.current.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(56,189,248,0.5)");
        gradient.addColorStop(1, "rgba(56,189,248,0.1)");

        const extendedMonths = [...validMonths, "Next Month"];
        const extendedSales = [...validSales, validPrediction];

        lineChartInstance.current?.destroy();
        lineChartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: extendedMonths,
            datasets: [
              {
                label: "Monthly Sales",
                data: extendedSales,
                borderColor: "#38bdf8",
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: extendedSales.map((_, i) =>
                  i === extendedSales.length - 1 ? "#facc15" : "#38bdf8"
                ),
                pointHoverRadius: 8,
                pointHoverBorderWidth: 3,
                pointHoverBorderColor: "#fff",
              },
            ],
          },
          options: {
            animation: { duration: 1000, easing: "easeOutQuart" },
            plugins: {
              legend: { labels: { color: "#e2e8f0" } },
              tooltip: { mode: "nearest", intersect: false },
            },
            hover: { mode: "nearest", intersect: true },
            scales: {
              x: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
              y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
            },
          },
        });
      }

      // --- Bar Chart ---
      if (barChartRef.current) {
        const ctx = barChartRef.current.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(56,189,248,0.7)");
        gradient.addColorStop(1, "rgba(56,189,248,0.3)");

        barChartInstance.current?.destroy();
        barChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: validMonths,
            datasets: [
              {
                label: "Monthly Sales",
                data: validSales,
                backgroundColor: gradient,
                borderColor: "#38bdf8",
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: "rgba(56,189,248,0.9)",
              },
            ],
          },
          options: {
            animation: { duration: 1000, easing: "easeOutQuart" },
            plugins: {
              legend: { labels: { color: "#e2e8f0" } },
              tooltip: { mode: "index", intersect: false },
            },
            scales: {
              x: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
              y: { ticks: { color: "#94a3b8" }, grid: { color: "#1e293b" } },
            },
          },
        });
      }

      // --- Doughnut Chart ---
      if (doughnutChartRef.current) {
        const ctx = doughnutChartRef.current.getContext("2d");
        doughnutChartInstance.current?.destroy();
        doughnutChartInstance.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Accuracy", "Error"],
            datasets: [
              {
                data: [hardcodedAccuracy, 100 - hardcodedAccuracy],
                backgroundColor: ["#38bdf8", "rgba(255,255,255,0.15)"],
                borderWidth: 0,
                hoverOffset: 15,
              },
            ],
          },
          options: {
            cutout: "70%",
            animation: { animateRotate: true, animateScale: true },
            plugins: { legend: { display: false } },
            responsive: true,
          },
        });
      }

      setChartError(null);
    } catch (err) {
      console.error("Dashboard chart error:", err);
      setChartError("Failed to load chart data.");
      lineChartInstance.current?.destroy();
      barChartInstance.current?.destroy();
      doughnutChartInstance.current?.destroy();
    }

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
        const ctx = modalChartRef.current.getContext("2d");
        modalChartInstance.current?.destroy();

        const validMonths = Array.isArray(months) ? months : [];
        const validSales = Array.isArray(sales) ? sales : [];
        const validPrediction = typeof prediction === "number" ? prediction : 0;

        switch (modalType) {
          case "line":
            const g1 = ctx.createLinearGradient(0, 0, 0, 400);
            g1.addColorStop(0, "rgba(56,189,248,0.5)");
            g1.addColorStop(1, "rgba(56,189,248,0.1)");
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
            const g2 = ctx.createLinearGradient(0, 0, 0, 400);
            g2.addColorStop(0, "rgba(56,189,248,0.7)");
            g2.addColorStop(1, "rgba(56,189,248,0.3)");
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
            break;
        }
      }
    } catch (err) {
      console.error("Modal chart error:", err);
      setChartError("Failed to load modal chart.");
      modalChartInstance.current?.destroy();
    }
  }, [isModalOpen, modalType]);

  return (
    <>
      {chartError && (
        <div className="text-red-400 text-center mb-3">{chartError}</div>
      )}

      <div className="flex flex-col md:flex-row gap-5 mt-5">
        {/* Line Chart */}
        <div
          className="flex-1 p-5 rounded-xl border border-slate-700 bg-slate-800 shadow-lg cursor-pointer"
          onClick={() => openModal("line")}
        >
          <h2 className="text-white text-lg font-semibold mb-3">Sales Trend</h2>
          <canvas ref={lineChartRef} className="w-full h-64"></canvas>
        </div>

        {/* Bar Chart */}
        <div
          className="flex-1 p-5 rounded-xl border border-slate-700 bg-slate-800 shadow-lg cursor-pointer"
          onClick={() => openModal("bar")}
        >
          <h2 className="text-white text-lg font-semibold mb-3">Sales Overview</h2>
          <canvas ref={barChartRef} className="w-full h-64"></canvas>
        </div>

        {/* Doughnut Chart */}
        <div
          className="flex-1 p-5 rounded-xl border border-slate-700 bg-slate-800 shadow-lg flex flex-col items-center cursor-pointer"
          onClick={() => openModal("doughnut")}
        >
          <h2 className="text-white text-lg font-semibold mb-3 text-center">
            Prediction Accuracy
          </h2>
          <div className="w-44 h-44">
            <canvas ref={doughnutChartRef} className="w-full h-full"></canvas>
          </div>
          <p className="text-white mt-3 text-xl font-bold">{hardcodedAccuracy}%</p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          data-modal="background"
          onClick={handleOutsideClick}
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 animate-fadeIn"
        >
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg relative w-11/12 md:w-3/4 max-h-[90vh] overflow-y-auto transform scale-95 animate-scaleUp">
            <button
              className="absolute top-3 right-3 text-white text-lg font-bold"
              onClick={closeModal}
            >
              &times;
            </button>

            {/* Chart */}
            <div className="w-full h-72 md:h-96">
              <canvas ref={modalChartRef} className="w-full h-full"></canvas>
            </div>

            {/* Explanation Container */}
            <div className="mt-5 p-4 bg-slate-700 rounded-lg shadow-inner">
              <p className="text-slate-300 text-center text-lg">
                {chartExplanations[modalType]}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardBottom;
