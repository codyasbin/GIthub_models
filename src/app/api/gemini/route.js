import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

export async function POST(request) {
  try {
    const { input, model } = await request.json();
    
    if (!input || !input.trim()) {
      return new Response(
        JSON.stringify({ error: "Input is required" }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Use the selected model, default to gemini-2.5-flash if not provided
    const selectedModel = model || "gemini-2.5-flash";
    
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: input,
    });

    const text = response.text;

    return new Response(
      JSON.stringify({ text, response: text }), 
      { 
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate response",
        message: error.message || "An unknown error occurred",
        details: error.toString()
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

