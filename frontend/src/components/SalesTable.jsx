// src/components/SalesTable.jsx
import React from "react";

const SalesTable = ({ months, sales }) => {
  return (
    <div className="bg-gray-700 rounded-xl p-5 shadow-md">
      <h2 className="text-left text-xl font-semibold mb-3">📅 Monthly Sales Data</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-600 text-gray-100">
            <th className="p-2">Month</th>
            <th className="p-2">Sales</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month, i) => (
            <tr key={i} className="border-b border-gray-500">
              <td className="p-2">{month}</td>
              <td className="p-2">{sales[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 mt-4">
        <button className="btn bg-gradient-to-r from-cyan-500 to-blue-500">➕ Add More Data</button>
        <button className="btn bg-gradient-to-r from-cyan-500 to-blue-500" onClick={() => window.print()}>🖨️ Generate Report</button>
      </div>
    </div>
  );
};

export default SalesTable;
