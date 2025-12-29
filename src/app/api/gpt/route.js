//This commented code is an example of how to set up a route 
// in a Next.js application to interact with GitHub's AI model using the OpenAI API. 
// It demonstrates how to handle POST requests, send messages to the AI model, and return the response.
// // app/api/github-ai/route.ts
// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// const token = process.env.GITHUB_TOKEN;
// const endpoint = "https://models.github.ai/inference";
// const model = "openai/gpt-5"; // or your model id


// if (!token) {
//   throw new Error("Missing GITHUB_TOKEN in env");
// }

// const client = new OpenAI({ apiKey: token, baseURL: endpoint });

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     // body.messages should be an array of {role, content}
//     const messages = body.messages ?? [
//       { role: "system", content: "You are a helpful assistant." },
//       { role: "user", content: "Hello" }
//     ];

//     const response = await client.chat.completions.create({
//       model,
//       messages
//     });

//     // Choose how much of response to return — here full raw
//     return NextResponse.json(response);
//   } catch (err) {
//     console.error("GitHub AI error:", err);
//     return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import OpenAI from "openai";


const BASE_URL = "http://localhost:12434/v1";
const MODEL = "ai/gemma3:270M-F16";

// OpenAI SDK still expects a key (even if local) u can use dummy key
const client = new OpenAI({
  apiKey: "local-docker-model-runner",
  baseURL: BASE_URL
});


const log = {
  info: (msg) =>
    console.log("\x1b[36m%s\x1b[0m", `[INFO] ${msg}`),

  success: (msg) =>
    console.log("\x1b[32m%s\x1b[0m", `[SUCCESS] ${msg}`),

  warn: (msg) =>
    console.warn("\x1b[33m%s\x1b[0m", `[WARN] ${msg}`),

  error: (msg) =>
    console.error("\x1b[31m%s\x1b[0m", `[ERROR] ${msg}`)
};

/* --------------------------------------------------
   API HANDLER
-------------------------------------------------- */

export async function POST(req) {
  try {
    log.info("Incoming chat completion request");

    const body = await req.json();

    const messages = body.messages || [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello" }
    ];

    log.info(`Model      : ${MODEL}`);
    log.info(`Messages   : ${messages.length}`);
    log.info(`Endpoint   : ${BASE_URL}`);

    const response = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens ?? 512
    });

    log.success("LLM response generated successfully");

    return NextResponse.json(response);

  } catch (err) {
    log.error(err?.message || String(err));

    return NextResponse.json(
      { error: err?.message || "Local LLM error" },
      { status: 500 }
    );
  }
}
