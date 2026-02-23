import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

export async function POST(request) {
  try {
    const { input } = await request.json();
    
    if (!input || !input.trim()) {
      return new Response(
        JSON.stringify({ error: "Input is required" }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Use the latest Gemini 3 Flash model
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
        details: error.message 
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

