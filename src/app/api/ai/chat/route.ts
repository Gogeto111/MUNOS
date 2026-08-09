import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { env } from "@/lib/env";

function getModel() {
  if (env.GOOGLE_GENERATIVE_AI_API_KEY) return google(env.AI_MODEL || "gemini-2.5-flash");
  if (env.OPENAI_API_KEY) return openai("gpt-4o");
  if (env.ANTHROPIC_API_KEY) return anthropic("claude-sonnet-4-20250514");
  return null;
}

export async function POST(request: Request) {
  const model = getModel();
  if (!model) {
    return NextResponse.json({ error: "No AI provider configured" }, { status: 500 });
  }

  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const result = await generateText({
      model,
      system: `You are MUNOS AI — a specialized MUN preparation assistant. 
You help delegates with research, speech writing, debate strategy, and committee preparation.
Be concise, direct, and actionable. Focus on MUN-specific advice.`,
      messages,
    });

    return NextResponse.json({ text: result.text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
