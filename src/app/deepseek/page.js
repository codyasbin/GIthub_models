"use client";
import { useState } from "react";

export default function DeepSeekChat() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 600
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setReply("Error: " + (data?.error?.message ?? JSON.stringify(data?.error)));
      } else {
        const content = data?.choice?.message?.content ?? JSON.stringify(data);
        setReply(content);
      }
    } catch (err) {
      setReply("Request failed: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  //press enter to send message
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">DeepSeek Chat</h2>

            <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask DeepSeek model..."
                className="w-full p-3 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none text-gray-800 bg-white placeholder-gray-400"
            />

            <div className="mt-4 flex items-center gap-3">
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-md shadow-sm transition"
                >
                    {loading ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            Loading...
                        </>
                    ) : (
                        "Send"
                    )}
                </button>

                <button
                    onClick={() => { setPrompt(""); setReply(""); }}
                    className="px-4 py-2 bg-white border border-orange-200 text-orange-600 rounded-md hover:bg-orange-50 transition"
                >
                    Clear
                </button>
            </div>

            <pre className="mt-6 bg-gray-50 border border-orange-100 p-4 rounded-md text-gray-800 whitespace-pre-wrap">{reply}</pre>
        </div>
    </div>
);
}
