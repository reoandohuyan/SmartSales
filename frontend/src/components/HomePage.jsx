import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; 
import {
  HomeIcon,
  ChartBarIcon,
  CubeIcon,
  CpuChipIcon,
  SparklesIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  XMarkIcon,
  Bars3Icon,   
} from "@heroicons/react/24/outline";



// MAIN COMPONENT: HomePage
const HomePage = () => {
  // -------------------------------
  // NAVIGATION AND LOCATION SETUP
  // -------------------------------
  const navigate = useNavigate(); // for programmatic navigation
  const location = useLocation(); // to access state from previous routes

  // -------------------------------
  // UI STATE MANAGEMENT
  // -------------------------------
  const [isOpen, setIsOpen] = useState(false); // toggles main menu
  const [showForm, setShowForm] = useState(false); // toggles add product/sales form

  // -------------------------------
  // INITIAL MODE BASED ON ROUTE STATE
  // -------------------------------
  const initialMode = location.state?.mode === "product-sales" ? "product" : "forecast";
  const [mode, setMode] = useState(initialMode);

  // -------------------------------
  // FORM INPUT STATES
  // -------------------------------
  const [product, setProduct] = useState(""); // product name
  const [month, setMonth] = useState(""); // month input
  const [sales, setSales] = useState(""); // sales input
  const [stock, setStock] = useState(""); // stock input
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");  // NEW

  // -------------------------------
  // RESTOCK FORM STATES
  // -------------------------------
  const [restockOpen, setRestockOpen] = useState(false); // restock modal toggle
  const [restockName, setRestockName] = useState(""); // restock product name
  const [restockQty, setRestockQty] = useState(""); // restock quantity

  // -------------------------------
  // SOLD PRODUCT FORM STATES
  // -------------------------------
  const [soldOpen, setSoldOpen] = useState(false); // sold product modal toggle
  const [soldName, setSoldName] = useState(""); // sold product name
  const [soldQty, setSoldQty] = useState(""); // sold quantity
  const [soldCost, setSoldCost] = useState(""); // cost per unit
  const [predictions, setPredictions] = useState([]);
  const [totalSale, setTotalSale] = useState(0);



  

  // -------------------------------
  // LOADING STATE
  // -------------------------------
  const [loading, setLoading] = useState(false); // controls loading indicator
  const [products, setProducts] = useState([]);
  



  const handleQtyChange = (e) => {
  const value = e.target.value;
  setSoldQty(value);
  const qtyNum = Number(value);
  const costNum = Number(soldCost);
  if (!isNaN(qtyNum) && !isNaN(costNum)) {
    setTotalSale(qtyNum * costNum);
  } else {
    setTotalSale(0);
  }
};

const handleCostChange = (e) => {
  const value = e.target.value;
  setSoldCost(value);
  const qtyNum = Number(soldQty);
  const costNum = Number(value);
  if (!isNaN(qtyNum) && !isNaN(costNum)) {
    setTotalSale(qtyNum * costNum);
  } else {
    setTotalSale(0);
  }
};

  // -------------------------------
  // FORM SUBMISSION HANDLER
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // show loading spinner

    try {
      // -------------------------------
      // FORECAST MODE SUBMISSION
      // -------------------------------
      if (mode === "forecast") {
        const payload = { month, sales: Number(sales) };
        await fetch("https://smartsales-dt0f.onrender.com/add_sales", {  
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // reset form fields and navigate to dashboard
        setMonth("");
        setSales("");
        navigate("/dashboard");
      }

      // -------------------------------
      // PRODUCT MODE SUBMISSION
      // -------------------------------
      else if (mode === "product") {
        const payload = {
          product,
          last_sales: Number(sales),
          stock: stock ? Number(stock) : Math.floor(Math.random() * 50) + 10,
        };

        await fetch("https://smartsales-dt0f.onrender.com/add_product_sales", {  
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // reset form fields after submission
        setProduct("");
        setMonth("");
        setSales("");
        setStock("");

        // navigate to product predictions and highlight new product
        navigate("/product_predictions", {
          state: { highlightProduct: payload.product },
        });
      }

    } catch (err) {
      // -------------------------------
      // ERROR HANDLING
      // -------------------------------
      console.error("Error submitting:", err);
    } finally {
      // -------------------------------
      // FINALIZE LOADING STATE
      // -------------------------------
      setLoading(false); // hide loading spinner
    }
  };

  // -------------------------------
  // HANDLE RESTOCK FORM SUBMISSION
  // -------------------------------
  const handleRestock = async (e) => {
    e.preventDefault();

    // prepare payload for API
    const payload = {
      product: restockName,
      added_stock: Number(restockQty),
    };

    try {
      // send POST request to add stock
      const response = await fetch("https://smartsales-dt0f.onrender.com/api/add_product_stock", {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // handle successful response
      if (response.ok) {
        setRestockName(""); // reset input
        setRestockQty("");  // reset input
        setRestockOpen(false); // close restock modal
        navigate("/product_predictions", { state: { highlightProduct: payload.product } });
      } else {
        // handle API error
        alert(data.error || "Something went wrong while restocking.");
      }
    } catch (err) {
      // handle network or other errors
      console.error("Error restocking:", err);
      alert("Failed to restock. Make sure your backend is running.");
    }
  };


  // Function to fetch all products from backend
const fetchProducts = async () => {
  try {
    const response = await fetch("https://smartsales-dt0f.onrender.com/api/products"); // replace with your actual endpoint
    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch products:", data.error);
      return;
    }

    // Update products state
    setProducts(data.data); // make sure backend returns an array in `data.data`
    console.log("Products refreshed from backend:", data.data);
  } catch (err) {
    console.error("Error fetching products:", err);
  }
};

const handleSold = async (e) => {
  e.preventDefault();

  const soldQtyNum = Number(soldQty);
  const soldCostNum = Number(soldCost);

  // Validate input
  if (!soldName || isNaN(soldQtyNum) || isNaN(soldCostNum) || soldQtyNum <= 0 || soldCostNum <= 0) {
    alert("Please enter a valid product name, quantity, and cost.");
    return;
  }

  const payload = {
    product: soldName,
    sold_quantity: soldQtyNum,
    cost_per_unit: soldCostNum,
  };

  try {
    const response = await fetch(
      "https://smartsales-dt0f.onrender.com/api/sell_product",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Something went wrong while updating sold product.");
      return;
    }

    console.log("Backend returned updated product:", data.data);

    const updatedProduct = {
      ...data.data,
      last_sales: parseFloat(data.data.last_sales), // ensure number
      stock: parseInt(data.data.stock),             // ensure number
    };

    // ✅ Update predictions state so table updates immediately
    setPredictions((prev) =>
      prev.map((p) =>
        p.product.toLowerCase() === updatedProduct.product.toLowerCase()
          ? { ...p, last_sales: updatedProduct.last_sales, stock: updatedProduct.stock }
          : p
      )
    );

    // Reset form
    setSoldName("");
    setSoldQty("");
    setSoldCost("");
    setSoldOpen(false);

    // Optional: navigate to predictions page
    navigate("/product_predictions", {
      state: { highlightProduct: updatedProduct.product },
    });

  } catch (err) {
    console.error("Error updating sold product:", err);
    alert("Failed to update sold product. Make sure your backend is running.");
  }
};


  


  // -------------------------------
  // JSX RETURN
  // -------------------------------
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-200 font-sans">

      {/* -------------------------------
          BACKGROUND
      ------------------------------- */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/store2.gif')", 
          filter: "brightness(0.3)",
        }}
      ></div>
      

         {/* Floating Fairy Left */}
<img
  src="/fairy1.gif"
  alt="Fairy Left"
  className="absolute left-8 top-1/4 w-20 sm:w-32 animate-float z-20"
/>

{/* Floating Fairy Right */}
<img
  src="/fairy2.gif"
  alt="Fairy Right"
  className="absolute right-8 top-1/3 w-20 sm:w-32 animate-float z-20"
  style={{ animationDelay: '2s' }}
/>


      {/* -------------------------------
          NAVBAR
      ------------------------------- */}
      <nav className="fixed top-0 w-full bg-slate-900/60 backdrop-blur-xl shadow-lg border-b border-slate-700 z-50">
        <div className="flex justify-between items-center p-2 sm:p-3 relative">

    {/* Logo on the left */}
<div className="flex items-center gap-2">
  <img src="/logo.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
  <span className="text-cyan-400 font-bold text-lg sm:text-xl animate-blink">
    Smart Sales
  </span>
</div>


    {/* -------------------------------
        DESKTOP MENU
    ------------------------------- */}
    <div className="hidden sm:flex flex-1 justify-center gap-1 sm:gap-2 md:gap-4">
      {/* Home Link */}
      <Link
        to="/"
        className="px-2 sm:px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:scale-105 transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"
      >
        <HomeIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" /> Home
      </Link>

      {/* Dashboard Link */}
      <Link
        to="/dashboard"
        className="px-2 sm:px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white font-medium hover:scale-105 transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"
      >
        <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-5" /> Dashboard
      </Link>

      {/* Chatbot Link */}
      <Link
        to="/chatbot"
        className="px-2 sm:px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white font-medium hover:scale-105 transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"
      >
        <CpuChipIcon className="w-3 h-3 sm:w-4 sm:h-5" /> Chatbot
      </Link>

      {/* Product Predictions Link */}
      <Link
        to="/product_predictions"
        className="px-2 sm:px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white font-medium hover:scale-105 transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"
      >
        <CubeIcon className="w-3 h-3 sm:w-4 sm:h-5" /> Products
      </Link>

      {/* Restock Button */}
      <button
        className="px-2 sm:px-3 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium flex items-center gap-1 sm:gap-2 hover:scale-105 transition-all text-xs sm:text-sm md:text-base"
        onClick={() => setRestockOpen(true)}
      >
        <PlusCircleIcon className="w-3 h-3 sm:w-4 sm:h-5" /> Restock
      </button>

      {/* Product Sold Button */}
      <button
        className="px-2 sm:px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium flex items-center gap-1 sm:gap-2 hover:scale-105 transition-all text-xs sm:text-sm md:text-base"
        onClick={() => setSoldOpen(true)}
      >
        <MinusCircleIcon className="w-3 h-3 sm:w-4 sm:h-5" /> Product Sold
      </button>
    </div>

    {/* -------------------------------
        HAMBURGER BUTTON FOR MOBILE
    ------------------------------- */}
    <button
      className="sm:hidden text-white absolute right-3 top-2"
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
    </button>
  </div>

  {/* -------------------------------
      MOBILE COLLAPSIBLE MENU
  ------------------------------- */}
  {isOpen && (
    <div className="sm:hidden flex flex-col gap-2 px-3 pb-3">
      {/* Home Link */}
      <Link
        to="/"
        className="px-2 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium flex items-center gap-1"
        onClick={() => setIsOpen(false)}
      >
        <HomeIcon className="w-4 h-4" /> Home
      </Link>

      {/* Dashboard Link */}
      <Link
        to="/dashboard"
        className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white font-medium flex items-center gap-1"
        onClick={() => setIsOpen(false)}
      >
        <ChartBarIcon className="w-4 h-4" /> Dashboard
      </Link>

      {/* Chatbot Link */}
      <Link
        to="/chatbot"
        className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white font-medium flex items-center gap-1"
        onClick={() => setIsOpen(false)}
      >
        <CpuChipIcon className="w-4 h-4" /> Chatbot
      </Link>

      {/* Product Predictions Link */}
      <Link
        to="/product_predictions"
        className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white font-medium flex items-center gap-1"
        onClick={() => setIsOpen(false)}
      >
        <CubeIcon className="w-4 h-4" /> Products
      </Link>

      {/* Mobile Restock Button */}
      <button
        className="px-2 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium flex items-center gap-1"
        onClick={() => {
          setRestockOpen(true);
          setIsOpen(false);
        }}
      >
        <PlusCircleIcon className="w-4 h-4" /> Restock
      </button>

      {/* Mobile Product Sold Button */}
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

{/* -------------------------------
    HERO CONTENT
------------------------------- */}
<div className="pt-32 pb-16 px-5 flex flex-col items-center text-center relative z-10">
  <div className="max-w-3xl">
    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-lg mb-4">
        Smart Sales Forecasting System
    </h1>

    <p className="text-base md:text-lg text-slate-300 mb-8 md:mb-10 leading-relaxed">
         Predict future sales, analyze product performance, and manage stock levels with AI-powered forecasting.
    </p>

  </div>

  {/* -------------------------------
      FORM PANEL
  ------------------------------- */}
  {showForm ? (
    <div className="w-11/12 md:w-full max-w-xl md:max-w-2xl p-3 md:p-6 rounded-3xl bg-gradient-to-r from-cyan-500/40 to-blue-500/40 mb-8 shadow-2xl animate-fadeIn">
      <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-slate-700 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-center gap-2 text-cyan-300 mb-3">
          <SparklesIcon className="w-6 h-6" />
          <span className="font-semibold text-lg">Choose Forecasting Mode</span>
        </div>

        {/* -------------------------------
            MODE SWITCH
        ------------------------------- */}
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

        {/* -------------------------------
            FORM
        ------------------------------- */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product fields if mode is 'product' */}
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

          {/* Month field */}
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

          {/* Sales field */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-bold text-white hover:scale-105 transition transform"
          >
            {loading ? "Submitting..." : "Submit Data"}
          </button>

          {/* Cancel Button */}
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
    /* Show Get Started button if form is hidden */
    <button
      onClick={() => setShowForm(true)}
      className="mt-8 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition transform animate-fadeIn"
    >
      Get Started
    </button>
  )}

</div>

      {/* -------------------------------
          RESTOCK MODAL
      ------------------------------- */}
      {restockOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-[999]">
          <div className="bg-slate-900 p-4 md:p-6 rounded-2xl w-11/12 md:w-full max-w-md border border-slate-700 shadow-xl relative">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
              onClick={() => setRestockOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircleIcon className="w-6 h-6 text-green-400" />
              Restock Product
            </h2>

            {/* Restock Form */}
            <form onSubmit={handleRestock} className="space-y-4">
              {/* Product Name Input */}
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

              {/* Quantity Input */}
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

              {/* Submit Button */}
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

      {/* -------------------------------
          SOLD PRODUCT MODAL
      ------------------------------- */}
      {soldOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-[999]">
          <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-md border border-slate-700 shadow-xl relative">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
              onClick={() => setSoldOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Modal Header */}
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <MinusCircleIcon className="w-6 h-6 text-red-400" />
              Product Sold
            </h2>

            {/* Sold Product Form */}
            <form onSubmit={handleSold} className="space-y-4">
              {/* Product Name Input */}
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

             {/* Cost per Unit Input */}
<div>
  <label className="text-slate-300 font-medium">Cost per Unit</label>
  <input
    type="number"
    value={soldCost}
    onChange={handleCostChange} // ADDED: dynamic calculation
    className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
    required
  />
</div>

{/* Quantity Sold Input */}
<div>
  <label className="text-slate-300 font-medium">Quantity Sold</label>
  <input
    type="number"
    value={soldQty}
    onChange={handleQtyChange} // ADDED: dynamic calculation
    className="w-full mt-2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
    required
  />
</div>

{/* Display Total Sale */}
<div className="text-slate-200 font-medium mt-2">
  Total Sale: <span className="text-green-400 font-bold">{totalSale}</span>
</div>

{/* Submit Button */}
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
