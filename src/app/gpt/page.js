// components/ChatClient.jsx (client component)
"use client";
import { useState } from "react";

export default function ChatClient() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");

  async function send() {
    const res = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: input }
        ]
      })
    });

    const data = await res.json();
    // adapt depending on which server variant you used:
    // If using SDK, use data.choices[0].message.content
    const content = data?.choices?.[0]?.message?.content ?? JSON.stringify(data);
    setReply(content);
  }

// simple HTML detection + lightweight sanitizer (not a full-proof sanitizer — for stronger guarantees use DOMPurify)
const isHTML = (str) => /<\/?[a-z][\s\S]*>/i.test(str);
const sanitize = (html) => {
    if (!html) return "";
    // remove script/style blocks
    let s = html.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");
    // remove event handler attributes like onclick="..."
    s = s.replace(/\son\w+\s*=\s*(['"`])[\s\S]*?\1/gi, "");
    // neutralize javascript: URIs
    s = s.replace(/(href|src)\s*=\s*(['"`])\s*javascript:[\s\S]*?\2/gi, '$1=$2#$2');
    return s;
};

return (
    <div className="mx-auto max-w-xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md ring-1 ring-black/5">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Message
            </label>
            <textarea
                    id="prompt"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={4}
                    placeholder="Write a message..."
                    className="w-full resize-y p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <div className="mt-4 flex items-center gap-3">
                    <button
                            onClick={send}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                            Send
                    </button>
                    <button
                            onClick={() => { setInput(""); setReply(""); }}
                            className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm text-gray-800 dark:text-gray-200 rounded-md"
                    >
                            Clear
                    </button>
            </div>

            {isHTML(reply) ? (
                // render sanitized HTML
                <>
                <div
                    className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-md text-sm"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: sanitize(reply) }}
                    />
                <pre className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-md text-sm whitespace-pre-wrap wrap-break-word">
                        {reply}
                </pre>
                </>
            
            ) : (
                <pre className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-md text-sm whitespace-pre-wrap wrap-break-word">
                        {reply}
                </pre>
            )}
    </div>
);
}
