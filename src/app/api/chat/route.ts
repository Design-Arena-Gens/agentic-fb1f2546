import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const client =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    const { systemPrompt, messages } = (await request.json()) as {
      systemPrompt?: string;
      messages?: IncomingMessage[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 },
      );
    }

    if (!client) {
      return NextResponse.json(
        {
          error:
            "The AI service is unavailable. Ensure OPENAI_API_KEY is configured.",
        },
        { status: 503 },
      );
    }

    const formattedMessages = [
      {
        role: "system" as const,
        content:
          systemPrompt ??
          "You are a helpful AI assistant. Answer rigorously, cite sources when known, and proactively share useful follow-up insights.",
      },
      ...messages,
    ];

    const completion = await client.responses.create({
      model: "gpt-4o-mini",
      input: formattedMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      temperature: 0.6,
      max_output_tokens: 800,
    });

    const message =
      completion.output_text?.trim() ??
      "I don’t have enough information to respond to that just yet.";

    return NextResponse.json({ message });
  } catch (error) {
    console.error("[chat] failure", error);
    return NextResponse.json(
      { error: "Unable to generate a response at this time." },
      { status: 500 },
    );
  }
}
