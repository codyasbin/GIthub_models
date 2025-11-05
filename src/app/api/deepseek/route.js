// app/api/deepseek/route.js
import { NextResponse } from "next/server";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = "https://models.github.ai/inference";
const model = "deepseek/DeepSeek-V3-0324";
const model2= "meta/Llama-4-Scout-17B-16E-Instruct";
const token = process.env.GITHUB_TOKEN;

if (!token) {
    throw new Error("Missing GITHUB_TOKEN in env");
}

const client = ModelClient(endpoint, new AzureKeyCredential(token));

export async function POST(req) {
    try {
        const { messages, temperature, max_tokens, top_p } = await req.json();

        // Provide safe defaults if caller didn't send full options
        const body = {
            model: model,
            messages:
                messages ??
                [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: "Say hi" },
                ],
            temperature: temperature ?? 1.0,
            top_p: top_p ?? 1.0,
            max_tokens: max_tokens ?? 1000,
        };

        const response = await client.path("/chat/completions").post({ body });

        if (isUnexpected(response)) {
            // Attempt to return useful error info
            const err = response.body?.error ?? response;
            console.error("Model error:", err);
            return NextResponse.json({ error: err }, { status: 502 });
        }

        // Return only the parts the client needs (avoid leaking extras)
        const choice = response.body?.choices?.[0];
        return NextResponse.json({
            choice,
            raw: response.body, // optional; remove if you want slimmer payload
        });
    } catch (err) {
        console.error("Server route error:", err);
        const msg = err && err.message ? err.message : String(err);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
