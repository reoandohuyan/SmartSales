// src/pages/Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import { HomeIcon, ChartBarIcon, CubeIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";

const Chatbot = () => {
  const location = useLocation(); // Detect current path

  // Safe default for messages
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I’m your Smart Sales Assistant. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setIsTyping(false);
    const userMessage = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");

    const loadingId = Math.random().toString(36);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "🤖 Thinking...", id: loadingId },
    ]);

    try {
      const response = await fetch("https://smartsales-dt0f.onrender.com/api/mistral", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: userMessage }),
});


      const data = await response.json();
      setMessages((prev) => prev.filter((m) => m.id !== loadingId));
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data?.reply || "🤖 Sorry, I couldn’t get a response.",
        },
      ]);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== loadingId));
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Network error or server issue." },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Safe function to determine active link
  const getLinkClasses = (path) =>
    location?.pathname === path
      ? "px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:scale-105 transition-all flex items-center gap-2"
      : "px-5 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white font-medium hover:scale-105 transition-all flex items-center gap-2";

  // Safe map for messages
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div
      className="flex flex-col min-h-screen text-slate-200 font-sans relative"
      style={{
        backgroundImage: "url('/robot.gif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay to darken background */}
      <div className="absolute inset-0 bg-slate-900/70 z-0"></div>

      {/* NAVBAR */}
      <nav className="flex justify-center gap-6 p-4 fixed top-0 w-full bg-slate-900/80 backdrop-blur-xl z-50 shadow-md">
        <Link to="/" className={getLinkClasses("/")}>
          <HomeIcon className="w-5 h-5" /> Home
        </Link>
        <Link to="/dashboard" className={getLinkClasses("/dashboard")}>
          <ChartBarIcon className="w-5 h-5" /> Dashboard
        </Link>
        <Link to="/chatbot" className={getLinkClasses("/chatbot")}>
          <ChatBubbleLeftRightIcon className="w-5 h-5" /> Chatbot
        </Link>
        <Link to="/product_predictions" className={getLinkClasses("/product_predictions")}>
          <CubeIcon className="w-5 h-5" /> Products
        </Link>
      </nav>

      <h1 className="text-center text-4xl text-cyan-400 mt-24 mb-4 flex justify-center items-center gap-2 z-10 relative">
        <ChatBubbleLeftRightIcon className="w-8 h-8" /> Smart Sales Chatbot
      </h1>

      {/* CHAT AREA */}
      <div className="flex-1 p-5 pt-2 overflow-y-auto flex flex-col gap-4 scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-slate-700 relative z-10">
        {safeMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "bot" && (
              <img
                src="/eyes.gif"
                alt="Bot"
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div
              className={`p-3 rounded-2xl max-w-[80%] break-words shadow-md ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-cyan-400 text-slate-900 rounded-bl-sm"
              }`}
            >
              <span dangerouslySetInnerHTML={{ __html: msg.text }} />
            </div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* INPUT */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-xl flex gap-3 bg-slate-800 p-3 rounded-3xl shadow-lg transition-opacity duration-300 opacity-70 hover:opacity-100 z-10">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsTyping(true);
          }}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className={`flex-1 p-3 rounded-2xl bg-slate-900 text-white outline-none border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition-all ${
            isTyping ? "opacity-100" : "opacity-70"
          }`}
        />
        <button
          onClick={sendMessage}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold hover:scale-105 transition flex items-center gap-2"
        >
          <PaperAirplaneIcon className="w-5 h-5 rotate-45" /> Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
