"use client";

// this is not a github model , this ai model is from google ai studio 

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const GEMINI_MODELS = [
  { value: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (Preview)", category: "Gemini 3" },
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash (Preview)", category: "Gemini 3" },
  { value: "gemini-3-pro-preview", label: "Gemini 3 Pro (Preview)", category: "Gemini 3" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Stable)", category: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite (Fastest)", category: "Gemini 2.5 Flash-Lite" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Advanced)", category: "Gemini 2.5 Pro" },
];

export default function Gemini() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          input: userMessage,
          model: selectedModel 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to get response");
      }
      
      // Add assistant message to chat
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.text || data.response || "No response received" 
      }]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.message || "Sorry, I encountered an error. Please try again.";
      setError(errorMessage);
      setMessages(prev => [...prev, { 
        role: "error", 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="text-3xl">✨</span>
                Gemini AI Chat
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Powered by Google's {GEMINI_MODELS.find(m => m.value === selectedModel)?.label}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 
                         dark:bg-gray-700 dark:text-white text-sm
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {GEMINI_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Start a conversation
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Ask me anything! I'm here to help.
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : 
                message.role === "error" ? "justify-center" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-indigo-600 text-white"
                    : message.role === "error"
                    ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 shadow-md border-2 border-red-300 dark:border-red-700"
                    : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">
                    {message.role === "user" ? "👤" : message.role === "error" ? "⚠️" : "🤖"}
                  </span>
                  <div className="flex-1 prose prose-sm dark:prose-invert max-w-none">
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          code: ({ node, inline, className, children, ...props }) => (
                            inline ? (
                              <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-sm" {...props}>
                                {children}
                              </code>
                            ) : (
                              <code className={`${className} block p-3 rounded-lg overflow-x-auto`} {...props}>
                                {children}
                              </code>
                            )
                          ),
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          h1: ({ children }) => <h1 className="text-2xl font-bold mb-2 mt-4">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-2">{children}</h3>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2">
                              {children}
                            </blockquote>
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-2">
                              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white dark:bg-gray-700 shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 rounded-full px-6 py-3 border border-gray-300 dark:border-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 
                       dark:bg-gray-700 dark:text-white
                       disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-3 
                       font-semibold transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              <span>{isLoading ? "Sending..." : "Send"}</span>
              <span className="text-xl">{isLoading ? "⏳" : "📤"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}