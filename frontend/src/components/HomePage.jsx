import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; // ADDED useLocation
import {
  HomeIcon,
  ChartBarIcon,
  CubeIcon,
  CpuChipIcon,
  SparklesIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  XMarkIcon,
  Bars3Icon,   // Add Bars3Icon here
} from "@heroicons/react/24/outline";


const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ADDED
  const [isOpen, setIsOpen] = useState(false); // MOBILE MENU TOGGLE
  const [showForm, setShowForm] = useState(false); // NEW



  // ⭐ INITIAL MODE FROM LOCATION
  const initialMode = location.state?.mode === "product-sales" ? "product" : "forecast";

  const [mode, setMode] = useState(initialMode);
  const [product, setProduct] = useState("");
  const [month, setMonth] = useState("");
  const [sales, setSales] = useState("");
  const [stock, setStock] = useState("");

  // NEW RESTOCK STATES
  const [restockOpen, setRestockOpen] = useState(false);
  const [restockName, setRestockName] = useState("");
  const [restockQty, setRestockQty] = useState("");

  // NEW SOLD PRODUCT STATES
  const [soldOpen, setSoldOpen] = useState(false);
  const [soldName, setSoldName] = useState("");
  const [soldQty, setSoldQty] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forecast") {
  const payload = { month, sales: Number(sales) };
  await fetch("https://smartsales-dt0f.onrender.com/add_sales", {  // ✅ changed URL
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  setMonth("");
  setSales("");
  navigate("/dashboard");
}
 else if (mode === "product") {
  const payload = {
    product,
    last_sales: Number(sales),
    stock: stock ? Number(stock) : Math.floor(Math.random() * 50) + 10,
  };

  await fetch("https://smartsales-dt0f.onrender.com/add_product_sales", {  // ✅ changed URL
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  setProduct("");
  setMonth("");
  setSales("");
  setStock("");

  navigate("/product_predictions", {
    state: { highlightProduct: payload.product },
  });
}

    } catch (err) {
      console.error("Error submitting:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    const payload = {
      product: restockName,
      added_stock: Number(restockQty),
    };

    try {
      const response = await fetch("https://smartsales-dt0f.onrender.com/api/add_product_stock", {  // ✅ changed URL
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});


      const data = await response.json();

      if (response.ok) {
        setRestockName("");
        setRestockQty("");
        setRestockOpen(false);
        navigate("/product_predictions", { state: { highlightProduct: payload.product } });
      } else {
        alert(data.error || "Something went wrong while restocking.");
      }
    } catch (err) {
      console.error("Error restocking:", err);
      alert("Failed to restock. Make sure your backend is running.");
    }
  };

  const handleSold = async (e) => {
    e.preventDefault();
    const payload = {
      product: soldName,
      sold_quantity: Number(soldQty),
    };

    try {
      const response = await fetch("https://smartsales-dt0f.onrender.com/api/sell_product", {  // ✅ changed URL
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});


      const data = await response.json();

      if (response.ok) {
        setSoldName("");
        setSoldQty("");
        setSoldOpen(false);
        navigate("/product_predictions", { state: { highlightProduct: payload.product } });
      } else {
        alert(data.error || "Something went wrong while updating sold product.");
      }
    } catch (err) {
      console.error("Error updating sold product:", err);
      alert("Failed to update sold product. Make sure your backend is running.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-200 font-sans">
     {/* BACKGROUND */}
<div
  className="absolute inset-0 bg-cover bg-center z-0"
  style={{
    backgroundImage: "url('/store2.gif')", // make sure store.gif is in your public folder
    filter: "brightness(0.3)",
  }}
></div>


    {/* NAVBAR */}
<nav className="fixed top-0 w-full bg-slate-900/60 backdrop-blur-xl shadow-lg border-b border-slate-700 z-50">
  <div className="flex justify-between items-center p-2 sm:p-3 relative">
    {/* Logo on the left */}
    <div className="text-cyan-400 font-bold text-lg sm:text-xl">
      Smart Sales
    </div>

    {/* Desktop menu */}
    <div className="hidden sm:flex flex-1 justify-center gap-1 sm:gap-2 md:gap-4">
      <Link
        to="/"
        className="px-2 sm:px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:scale-105 transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"
      >
        <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" /> Home
      </Link>

      <Link
        to="/dashboard"
        className="px-2 sm:px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white font-medium hover:scale-105 transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"
      >
        <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-5" /> Dashboard
      </Link>

      <Link
        to="/chatbot"
        className="px-2 sm:px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white font-medium hover:scale-105 transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"
      >
        <CpuChipIcon className="w-3 h-3 sm:w-4 sm:h-5" /> Chatbot
      </Link>

      <Link
        to="/product_predictions"
        className="px-2 sm:px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white font-medium hover:scale-105 transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"
      >
        <CubeIcon className="w-3 h-3 sm:w-4 sm:h-5" /> Products
      </Link>

      <button
        className="px-2 sm:px-3 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium flex items-center gap-1 sm:gap-2 hover:scale-105 transition-all text-xs sm:text-sm md:text-base"
        onClick={() => setRestockOpen(true)}
      >
        <PlusCircleIcon className="w-3 h-3 sm:w-4 sm:h-5" /> Restock
      </button>

      <button
        className="px-2 sm:px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium flex items-center gap-1 sm:gap-2 hover:scale-105 transition-all text-xs sm:text-sm md:text-base"
        onClick={() => setSoldOpen(true)}
      >
        <MinusCircleIcon className="w-3 h-3 sm:w-4 sm:h-5" /> Product Sold
      </button>
    </div>

    {/* Hamburger button for mobile */}
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
      <Link
        to="/"
        className="px-2 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium flex items-center gap-1"
        onClick={() => setIsOpen(false)}
      >
        <HomeIcon className="w-4 h-4" /> Home
      </Link>

      <Link
        to="/dashboard"
        className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white font-medium flex items-center gap-1"
        onClick={() => setIsOpen(false)}
      >
        <ChartBarIcon className="w-4 h-4" /> Dashboard
      </Link>

      <Link
        to="/chatbot"
        className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white font-medium flex items-center gap-1"
        onClick={() => setIsOpen(false)}
      >
        <CpuChipIcon className="w-4 h-4" /> Chatbot
      </Link>

      <Link
        to="/product_predictions"
        className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white font-medium flex items-center gap-1"
        onClick={() => setIsOpen(false)}
      >
        <CubeIcon className="w-4 h-4" /> Products
      </Link>

      <button
        className="px-2 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium flex items-center gap-1"
        onClick={() => {
          setRestockOpen(true);
          setIsOpen(false);
        }}
      >
        <PlusCircleIcon className="w-4 h-4" /> Restock
      </button>

      <button
        className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium flex items-center gap-1"
        onClick={() => {
          setSoldOpen(true);
          setIsOpen(false);
        }}
      >
        <MinusCircleIcon className="w-4 h-4" /> Product Sold
      </button>
    </div>
  )}
</nav>



      {/* HERO CONTENT */}
      <div className="pt-32 pb-16 px-5 flex flex-col items-center text-center relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-lg mb-4">
  Smart Sales Forecasting System
</h1>

          <p className="text-base md:text-lg text-slate-300 mb-8 md:mb-10 leading-relaxed">
  Predict future sales, analyze product performance, and manage stock levels with AI-powered forecasting.
</p>

        </div>

        {/* FORM PANEL */}
{showForm ? (
  <div className="w-11/12 md:w-full max-w-xl md:max-w-2xl p-3 md:p-6 rounded-3xl bg-gradient-to-r from-cyan-500/40 to-blue-500/40 mb-8 shadow-2xl animate-fadeIn">
    <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-slate-700 shadow-xl">
      <div className="flex items-center justify-center gap-2 text-cyan-300 mb-3">
        <SparklesIcon className="w-6 h-6" />
        <span className="font-semibold text-lg">Choose Forecasting Mode</span>
      </div>

      {/* MODE SWITCH */}
      <div className="grid grid-cols-2 mb-6 gap-3">
        <button
          onClick={() => setMode("forecast")}
          className={`py-3 rounded-xl font-bold transition-all ${
            mode === "forecast"
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
              : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
        >
          Total Sales
        </button>
        <button
          onClick={() => setMode("product")}
          className={`py-3 rounded-xl font-bold transition-all ${
            mode === "product"
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
              : "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
        >
          Product Sales
        </button>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "product" && (
          <>
            <div>
              <label className="text-slate-300 font-medium">Product</label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full mt-2 p-2 md:p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium">Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </>
        )}

        <div>
          <label className="text-slate-300 font-medium">Month</label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
            required
          />
        </div>

        <div>
          <label className="text-slate-300 font-medium">Sales</label>
          <input
            type="number"
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-bold text-white hover:scale-105 transition transform"
        >
          {loading ? "Submitting..." : "Submit Data"}
        </button>

        {/* Cancel button */}
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="w-full py-3 mt-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition transform hover:scale-105"
        >
          Cancel
        </button>
      </form>
    </div>
  </div>
) : (
  <button
    onClick={() => setShowForm(true)}
    className="mt-8 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition transform animate-fadeIn"
  >
    Get Started
  </button>
)}

      </div>

      {/* RESTOCK MODAL */}
      {restockOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-[999]">
          <div className="bg-slate-900 p-4 md:p-6 rounded-2xl w-11/12 md:w-full max-w-md border border-slate-700 shadow-xl relative">
            <button
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
              onClick={() => setRestockOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircleIcon className="w-6 h-6 text-green-400" />
              Restock Product
            </h2>
            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="text-slate-300 font-medium">Product Name</label>
                <input
                  type="text"
                  value={restockName}
                  onChange={(e) => setRestockName(e.target.value)}
                  className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium">Quantity to Add</label>
                <input
                  type="number"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold"
              >
                Add Stock
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SOLD PRODUCT MODAL */}
      {soldOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-[999]">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-md border border-slate-700 shadow-xl relative">
            <button
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
              onClick={() => setSoldOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <MinusCircleIcon className="w-6 h-6 text-red-400" />
              Product Sold
            </h2>
            <form onSubmit={handleSold} className="space-y-4">
              <div>
                <label className="text-slate-300 font-medium">Product Name</label>
                <input
                  type="text"
                  value={soldName}
                  onChange={(e) => setSoldName(e.target.value)}
                  className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium">Quantity Sold</label>
                <input
                  type="number"
                  value={soldQty}
                  onChange={(e) => setSoldQty(e.target.value)}
                  className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
