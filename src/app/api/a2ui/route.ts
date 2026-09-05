import {
  messagesForScenario,
  resolveScenarioFromPrompt,
  type A2uiMessage,
  type ScenarioId,
} from "@/lib/a2ui/scenarios";

export const runtime = "nodejs";

type RequestBody = {
  prompt?: string;
  scenario?: ScenarioId;
  action?: {
    name: string;
    context?: Record<string, unknown>;
  };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveMessages(body: RequestBody): A2uiMessage[] {
  if (body.action) {
    const { name, context = {} } = body.action;

    if (name === "book_restaurant" || name === "start_booking") {
      return messagesForScenario("reservation", context);
    }
    if (name === "confirm_booking") {
      return messagesForScenario("confirmation", context);
    }
    if (name === "search_again") {
      return messagesForScenario("restaurants");
    }
  }

  if (body.scenario) {
    return messagesForScenario(body.scenario, {
      ...body.action?.context,
      prompt: body.prompt,
    });
  }

  const prompt = body.prompt?.trim() ?? "";
  if (!prompt) {
    return messagesForScenario("welcome");
  }

  const scenario = resolveScenarioFromPrompt(prompt);
  return messagesForScenario(scenario, { prompt });
}

/**
 * Mock agent endpoint that streams A2UI messages as Server-Sent Events.
 * In production this would be an LLM agent generating the same JSON shape.
 */
export async function POST(request: Request) {
  let body: RequestBody = {};
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    body = {};
  }

  const messages = resolveMessages(body);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (const message of messages) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(message)}\n\n`),
        );
        // Simulate progressive generation so the UI builds incrementally.
        await sleep(120);
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
