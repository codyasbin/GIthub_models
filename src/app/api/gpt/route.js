// app/api/github-ai/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-5"; // or your model id


if (!token) {
  throw new Error("Missing GITHUB_TOKEN in env");
}

const client = new OpenAI({ apiKey: token, baseURL: endpoint });

export async function POST(req) {
  try {
    const body = await req.json();
    // body.messages should be an array of {role, content}
    const messages = body.messages ?? [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello" }
    ];

    const response = await client.chat.completions.create({
      model,
      messages
    });

    // Choose how much of response to return — here full raw
    return NextResponse.json(response);
  } catch (err) {
    console.error("GitHub AI error:", err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
