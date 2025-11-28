// src/components/ChartBox.jsx
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const ChartBox = ({ title, type, labels, data, options, plugins }) => {
  const chartRef = useRef();

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    const chart = new Chart(ctx, { type, data: { labels, datasets: data }, options, plugins });
    return () => chart.destroy();
  }, [type, labels, data, options, plugins]);

  return (
    <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-5 flex flex-col justify-center h-96">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ChartBox;
