import { createMistral } from "@ai-sdk/mistral";
import { streamText } from "ai";
import { buildSystemPrompt } from "@/agent/system-prompt";
import type { Memory } from "@/agent/memory/types";

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY ?? "",
});

export async function POST(req: Request) {
  const url = new URL(req.url);
  const streamEvents = url.searchParams.get("stream") === "events";

  let body: { messages: { role: string; content: string }[]; memories?: Memory[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { messages, memories = [] } = body;
  const systemPrompt = buildSystemPrompt(memories);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type AnyMessages = any;

  if (!streamEvents) {
    // Default AI SDK data stream (for compatibility)
    const result = streamText({
      model: mistral("mistral-large-latest"),
      system: systemPrompt,
      messages: messages as AnyMessages,
    });
    return result.toTextStreamResponse();
  }

  // NDJSON event stream — one JSON object per line
  // Protocol matches AgentConversationProvider expectations
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        const result = streamText({
          model: mistral("mistral-large-latest"),
          system: systemPrompt,
          messages: messages as AnyMessages,
        });

        for await (const chunk of result.textStream) {
          emit({ t: "text", d: chunk });
        }

        const usage = await result.usage;
        emit({
          t: "finish",
          finishReason: "stop",
          usage: {
            promptTokens: usage?.inputTokens,
            completionTokens: usage?.outputTokens,
            totalTokens: usage?.totalTokens,
          },
        });
      } catch (err) {
        emit({ t: "error", message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
