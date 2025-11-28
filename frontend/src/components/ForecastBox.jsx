// src/components/ForecastBox.jsx
import React from "react";

const ForecastBox = ({ prediction, recommendation }) => {
  return (
    <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-5 flex flex-col justify-center">
      <h3 className="text-lg font-semibold">Predicted Next Month’s Sales</h3>
      <p className="text-cyan-400 text-2xl font-bold mt-2">₱ {prediction}</p>
      <p className="mt-1">💡 Recommendation: {recommendation}</p>
    </div>
  );
};

export default ForecastBox;
