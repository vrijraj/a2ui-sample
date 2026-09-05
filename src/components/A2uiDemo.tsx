"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2Icon,
  BotIcon,
  SendIcon,
  UtensilsCrossedIcon,
} from "lucide-react";
import { MessageProcessor } from "@a2ui/web_core/v0_9";
import { A2uiSurface, basicCatalog } from "@a2ui/react/v0_9";
import { injectStyles } from "@a2ui/react/styles";
import type { SurfaceModel } from "@a2ui/web_core/v0_9";
import type { ReactComponentImplementation } from "@a2ui/react/v0_9";
import { SUGGESTED_PROMPTS, type ScenarioId } from "@/lib/a2ui/scenarios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type ChatLine = {
  id: string;
  role: "user" | "agent" | "system";
  text: string;
};

type ActionPayload = {
  name: string;
  context?: Record<string, unknown>;
};

async function consumeA2uiStream(
  body: Record<string, unknown>,
  onMessage: (message: unknown) => void,
) {
  const response = await fetch("/api/a2ui", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Agent request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const line = chunk
        .split("\n")
        .find((entry) => entry.startsWith("data: "));
      if (!line) continue;

      const payload = line.slice(6).trim();
      if (!payload || payload === "[DONE]") continue;
      onMessage(JSON.parse(payload));
    }
  }
}

export function A2uiDemo() {
  const actionHandlerRef = useRef<(action: ActionPayload) => void>(() => {});
  const [processor] = useState(() => {
    return new MessageProcessor([basicCatalog], (action) => {
      actionHandlerRef.current({
        name: action.name,
        context: action.context,
      });
    });
  });

  const [surfaces, setSurfaces] = useState<
    SurfaceModel<ReactComponentImplementation>[]
  >(() => Array.from(processor.model.surfacesMap.values()));
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatLine[]>([
    {
      id: "intro",
      role: "system",
      text: "Mock agent ready. Ask it to find restaurants or book a table.",
    },
  ]);

  useEffect(() => {
    injectStyles();
  }, []);

  useEffect(() => {
    const sync = () =>
      setSurfaces(Array.from(processor.model.surfacesMap.values()));
    const created = processor.onSurfaceCreated(sync);
    const deleted = processor.onSurfaceDeleted(sync);
    return () => {
      created.unsubscribe();
      deleted.unsubscribe();
    };
  }, [processor]);

  const runAgent = useCallback(
    async (body: Record<string, unknown>, userText?: string) => {
      setBusy(true);
      setError(null);

      if (userText) {
        setChat((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "user", text: userText },
        ]);
      }

      try {
        await consumeA2uiStream(body, (message) => {
          processor.processMessages([message as never]);
          setSurfaces(Array.from(processor.model.surfacesMap.values()));
        });

        setChat((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "agent",
            text: "Responded with an A2UI surface.",
          },
        ]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to talk to the agent";
        setError(message);
      } finally {
        setBusy(false);
      }
    },
    [processor],
  );

  useEffect(() => {
    actionHandlerRef.current = (action) => {
      void runAgent(
        { action },
        `Action: ${action.name}${
          action.context?.restaurantName
            ? ` (${String(action.context.restaurantName)})`
            : ""
        }`,
      );
    };
  }, [runAgent]);

  useEffect(() => {
    void runAgent({ scenario: "welcome" satisfies ScenarioId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = prompt.trim();
    if (!next || busy) return;
    setPrompt("");
    void runAgent({ prompt: next }, next);
  };

  return (
    <div className="g-shell">
      <header className="g-appbar">
        <div className="g-appbar-inner">
          <div className="g-appbar-icon" aria-hidden>
            <UtensilsCrossedIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="g-appbar-title">A2UI Restaurant Booking</h1>
          </div>
        </div>
      </header>

      <main className="g-main">
        <p className="g-lede">
          An agent streams{" "}
          <a href="https://a2ui.org/" target="_blank" rel="noreferrer">
            A2UI
          </a>{" "}
          JSON; this client renders it with native React widgets.
        </p>

        <div className="g-grid">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BotIcon className="size-4 text-[var(--g-blue)]" />
                Conversation
              </CardTitle>
              <CardDescription>
                Suggested prompts or free-form messages for the mock agent.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="g-suggest">
                {SUGGESTED_PROMPTS.map((item) => (
                  <Button
                    key={item.label}
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void runAgent(
                        { scenario: item.scenario, prompt: item.prompt },
                        item.prompt,
                      )
                    }
                  >
                    {item.label}
                  </Button>
                ))}
              </div>

              <ScrollArea className="g-chat-scroll">
                <div className="grid gap-2 p-3">
                  {chat.map((line) => (
                    <div
                      key={line.id}
                      className="g-bubble"
                      data-role={line.role}
                    >
                      <p className="g-bubble-role">{line.role}</p>
                      <p className="g-bubble-text">{line.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <form onSubmit={onSubmit} className="g-composer">
                <Input
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask the agent…"
                  disabled={busy}
                  aria-label="Message the agent"
                />
                <Button type="submit" disabled={busy || !prompt.trim()}>
                  {busy ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <SendIcon className="size-4" />
                  )}
                  {busy ? "…" : "Send"}
                </Button>
              </form>

              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>A2UI surface</CardTitle>
              <CardDescription>
                Rendered with <code className="text-xs">A2uiSurface</code> ·
                themed via CSS variables
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="a2ui-container a2ui-light">
                {surfaces.length === 0 ? (
                  <p className="text-sm text-[var(--g-ink-secondary)]">
                    Waiting for agent messages…
                  </p>
                ) : (
                  surfaces.map((surface) => (
                    <A2uiSurface key={surface.id} surface={surface} />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
