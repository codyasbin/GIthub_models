import {GoogleGenAI} from "@google/genai";

export async function GET(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenAI(apiKey);
    const response = await genAI.generateContent({
        model: "gemini-1.5-pro",
        input: "What is Gemini AI model?"
    });
    return new Response(JSON.stringify(response), { 
        headers: { "Content-Type": "application/json" },
    });
}   

