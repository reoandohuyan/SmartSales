// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-center gap-4 bg-gray-800 w-full py-3 fixed top-0 left-0 z-50 shadow-md">
      <Link to="/" className="text-white px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 transition">
        🏠 Home
      </Link>
      <Link to="/dashboard" className="text-white px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 transition">
        📈 Dashboard
      </Link>
      <Link to="/chatbot" className="text-white px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 transition">
        🤖 Chatbot
      </Link>
      <Link to="/products" className="text-white px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 transition">
        📦 Products
      </Link>
    </nav>
  );
};

export default Navbar;
