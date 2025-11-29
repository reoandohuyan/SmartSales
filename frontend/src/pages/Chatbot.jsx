// src/pages/Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import { HomeIcon, ChartBarIcon, CubeIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";


const Chatbot = () => {
  const location = useLocation(); // Detect current path
  const [isOpen, setIsOpen] = useState(false);

  // Load messages from localStorage if available, otherwise default
const [messages, setMessages] = useState(() => {
  const saved = localStorage.getItem("chatbotMessages");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [
    {
      sender: "bot",
      text: "Hello! I’m your Smart Sales Assistant. How can I help you today?",
    },
  ];
});


  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  

  // Save messages to localStorage whenever updated
useEffect(() => {
  localStorage.setItem("chatbotMessages", JSON.stringify(messages));
}, [messages]);



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
<nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-xl z-50 shadow-md">
  <div className="flex flex-col sm:flex-row justify-center items-center p-3 sm:p-4 relative">
    {/* Logo */}
    <div className="text-cyan-400 font-bold text-lg sm:text-xl mb-2 sm:mb-0 sm:absolute sm:left-4">
      Smart Sales
    </div>

    {/* Hamburger button for mobile */}
    <button
      className="sm:hidden text-white absolute right-4 top-3"
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
    </button>

    {/* Desktop menu */}
    <div className="hidden sm:flex gap-2 md:gap-4">
      <Link to="/" className={getLinkClasses("/")}>
        <HomeIcon className="w-4 h-4 md:w-5 md:h-5" /> Home
      </Link>
      <Link to="/dashboard" className={getLinkClasses("/dashboard")}>
        <ChartBarIcon className="w-4 h-4 md:w-5 md:h-5" /> Dashboard
      </Link>
      <Link to="/chatbot" className={getLinkClasses("/chatbot")}>
        <ChatBubbleLeftRightIcon className="w-4 h-4 md:w-5 md:h-5" /> Chatbot
      </Link>
      <Link to="/product_predictions" className={getLinkClasses("/product_predictions")}>
        <CubeIcon className="w-4 h-4 md:w-5 md:h-5" /> Products
      </Link>
    </div>
  </div>

  {/* Mobile collapsible menu */}
  {isOpen && (
    <div className="sm:hidden flex flex-col gap-2 px-3 pb-3">
      <Link to="/" className={getLinkClasses("/")} onClick={() => setIsOpen(false)}>
        <HomeIcon className="w-4 h-4" /> Home
      </Link>
      <Link to="/dashboard" className={getLinkClasses("/dashboard")} onClick={() => setIsOpen(false)}>
        <ChartBarIcon className="w-4 h-4" /> Dashboard
      </Link>
      <Link to="/chatbot" className={getLinkClasses("/chatbot")} onClick={() => setIsOpen(false)}>
        <ChatBubbleLeftRightIcon className="w-4 h-4" /> Chatbot
      </Link>
      <Link to="/product_predictions" className={getLinkClasses("/product_predictions")} onClick={() => setIsOpen(false)}>
        <CubeIcon className="w-4 h-4" /> Products
      </Link>
    </div>
  )}
</nav>




      <h1 className="text-center text-2xl sm:text-3xl md:text-4xl text-cyan-400 mt-16 sm:mt-20 md:mt-24 mb-4 flex justify-center items-center gap-2 sm:gap-2 md:gap-2 z-10 relative">
  <ChatBubbleLeftRightIcon className="w-5 sm:w-6 md:w-8 h-5 sm:h-6 md:h-8" /> Smart Sales Chatbot
</h1>


{/* Clear Chat Button */}
<div className="flex justify-center mb-4">
  <button
    onClick={() => {
      setMessages([]);
      localStorage.removeItem("chatbotMessages");
    }}
    className="ml-2 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
  >
    Clear Chat
  </button>
</div>

      {/* CHAT AREA */}
<div className="flex-1 p-3 sm:p-5 pt-2 overflow-y-auto flex flex-col gap-3 sm:gap-4 scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-slate-700 relative z-10">
  {safeMessages.map((msg, idx) => (
  <div
    key={idx}
    className={`flex items-start gap-2 sm:gap-3 ${
      msg.sender === "user" ? "justify-end" : "justify-start"
    }`}
  >
    {msg.sender === "bot" && (
      <img
        src="/eyes.gif"
        alt="Bot"
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
      />
    )}
    <div
      className={`p-2 sm:p-3 rounded-2xl max-w-[70%] sm:max-w-[80%] shadow-md text-sm sm:text-base overflow-auto font-mono ${
        msg.sender === "user"
          ? "bg-blue-600 text-white rounded-br-sm"
          : "bg-cyan-400 text-slate-900 rounded-bl-sm"
      }`}
       style={{ whiteSpace: "pre-wrap", maxHeight: "600px", overflowY: "auto" }}// ✅ allows scrolling if content is long
    >
      <pre className="whitespace-pre-wrap">{msg.text}</pre>
    </div>
  </div>
))}

  <div ref={chatEndRef}></div>
</div>

{/* INPUT */}
<div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 sm:w-10/12 max-w-md flex gap-2 sm:gap-3 bg-slate-800 p-2 sm:p-3 rounded-2xl shadow-lg transition-opacity duration-300 opacity-80 hover:opacity-100 z-10">
  <input
    type="text"
    value={input}
    onChange={(e) => {
      setInput(e.target.value);
      setIsTyping(true);
    }}
    onKeyPress={handleKeyPress}
    placeholder="Type a message..."
    className={`flex-1 p-2 sm:p-3 rounded-2xl bg-slate-900 text-white outline-none border border-slate-700 
  focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition-all text-sm sm:text-base
  ${isTyping ? "opacity-100" : "opacity-40"} hover:opacity-100`}

  />
  <button
    onClick={sendMessage}
    className="px-3 sm:px-5 py-2 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold hover:scale-105 transition flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
  >
    <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5 rotate-45" /> Send
  </button>
</div>

    </div>
  );
};

export default Chatbot;
