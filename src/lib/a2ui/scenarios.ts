import { BASIC_CATALOG_ID, SURFACE_ID } from "./catalog";

export type A2uiMessage = Record<string, unknown>;

export type ScenarioId =
  | "restaurants"
  | "reservation"
  | "confirmation"
  | "welcome"
  | "fallback";

export const SUGGESTED_PROMPTS = [
  {
    label: "Find Italian restaurants",
    prompt: "Find Italian restaurants near me",
    scenario: "restaurants" as ScenarioId,
  },
  {
    label: "Book a table",
    prompt: "Book a table for 2 tonight",
    scenario: "reservation" as ScenarioId,
  },
  {
    label: "Ask something else",
    prompt: "What's the weather today?",
    scenario: "fallback" as ScenarioId,
  },
];

function createSurface(): A2uiMessage {
  return {
    version: "v0.9",
    createSurface: {
      surfaceId: SURFACE_ID,
      catalogId: BASIC_CATALOG_ID,
      sendDataModel: true,
    },
  };
}

function deleteSurface(): A2uiMessage {
  return {
    version: "v0.9",
    deleteSurface: { surfaceId: SURFACE_ID },
  };
}

/** Welcome surface shown on first load. */
export function welcomeMessages(): A2uiMessage[] {
  return [
    createSurface(),
    {
      version: "v0.9",
      updateComponents: {
        surfaceId: SURFACE_ID,
        components: [
          {
            id: "root",
            component: "Column",
            children: ["title", "body", "hint"],
            align: "stretch",
          },
          {
            id: "title",
            component: "Text",
            text: "A2UI × Next.js",
            variant: "h2",
          },
          {
            id: "body",
            component: "Text",
            text: "This demo shows how an agent can send **declarative UI JSON** that your app renders with native React components — no arbitrary code execution.",
            variant: "body",
          },
          {
            id: "hint",
            component: "Text",
            text: "Try a suggested prompt below, or type your own. The mock agent responds with A2UI surfaces.",
            variant: "caption",
          },
        ],
      },
    },
  ];
}

/** Restaurant search results with book actions. */
export function restaurantMessages(): A2uiMessage[] {
  return [
    deleteSurface(),
    createSurface(),
    {
      version: "v0.9",
      updateComponents: {
        surfaceId: SURFACE_ID,
        components: [
          {
            id: "root",
            component: "Column",
            children: ["heading", "list"],
            align: "stretch",
          },
          {
            id: "heading",
            component: "Text",
            text: "Italian nearby",
            variant: "h2",
          },
          {
            id: "list",
            component: "Column",
            children: {
              path: "/restaurants",
              componentId: "restaurant-card",
            },
          },
          {
            id: "restaurant-card",
            component: "Card",
            child: "card-body",
          },
          {
            id: "card-body",
            component: "Column",
            children: ["name-row", "meta", "actions"],
          },
          {
            id: "name-row",
            component: "Row",
            children: ["name", "price"],
            justify: "spaceBetween",
            align: "center",
          },
          {
            id: "name",
            component: "Text",
            text: { path: "name" },
            variant: "h3",
          },
          {
            id: "price",
            component: "Text",
            text: { path: "priceRange" },
            variant: "body",
          },
          {
            id: "meta",
            component: "Text",
            text: { path: "details" },
            variant: "caption",
          },
          {
            id: "actions",
            component: "Row",
            children: ["book-btn"],
            justify: "end",
          },
          {
            id: "book-btn",
            component: "Button",
            child: "book-label",
            variant: "primary",
            action: {
              event: {
                name: "book_restaurant",
                context: {
                  restaurantId: { path: "id" },
                  restaurantName: { path: "name" },
                },
              },
            },
          },
          {
            id: "book-label",
            component: "Text",
            text: "Book a table",
          },
        ],
      },
    },
    {
      version: "v0.9",
      updateDataModel: {
        surfaceId: SURFACE_ID,
        path: "/",
        value: {
          restaurants: [
            {
              id: "trattoria-verde",
              name: "Trattoria Verde",
              priceRange: "$$",
              details: "4.7 · Pasta · 0.4 mi · Open until 10pm",
            },
            {
              id: "nonna-rosa",
              name: "Nonna Rosa",
              priceRange: "$$$",
              details: "4.9 · Wine bar · 0.8 mi · Open until 11pm",
            },
            {
              id: "olio-mare",
              name: "Olio & Mare",
              priceRange: "$$",
              details: "4.5 · Seafood · 1.2 mi · Open until 9:30pm",
            },
          ],
        },
      },
    },
  ];
}

/** Reservation form for a chosen restaurant. */
export function reservationMessages(restaurantName = "Trattoria Verde"): A2uiMessage[] {
  return [
    deleteSurface(),
    createSurface(),
    {
      version: "v0.9",
      updateComponents: {
        surfaceId: SURFACE_ID,
        components: [
          {
            id: "root",
            component: "Column",
            children: [
              "title",
              "subtitle",
              "guests",
              "date",
              "time",
              "seating",
              "extras",
              "notes",
              "submit",
            ],
            align: "stretch",
          },
          {
            id: "title",
            component: "Text",
            text: "Reserve a table",
            variant: "h2",
          },
          {
            id: "subtitle",
            component: "Text",
            text: { path: "/restaurantName" },
            variant: "body",
          },
          {
            id: "guests",
            component: "ChoicePicker",
            label: "Party size",
            value: { path: "/reservation/guests" },
            variant: "mutuallyExclusive",
            displayStyle: "chips",
            options: [
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3", value: "3" },
              { label: "4", value: "4" },
              { label: "5", value: "5" },
              { label: "6+", value: "6" },
            ],
          },
          {
            id: "date",
            component: "DateTimeInput",
            label: "Date",
            value: { path: "/reservation/date" },
            enableDate: true,
            enableTime: false,
          },
          {
            id: "time",
            component: "ChoicePicker",
            label: "Time",
            value: { path: "/reservation/time" },
            variant: "mutuallyExclusive",
            displayStyle: "chips",
            options: [
              { label: "5:30 PM", value: "17:30" },
              { label: "6:00 PM", value: "18:00" },
              { label: "6:30 PM", value: "18:30" },
              { label: "7:00 PM", value: "19:00" },
              { label: "7:30 PM", value: "19:30" },
              { label: "8:00 PM", value: "20:00" },
              { label: "8:30 PM", value: "20:30" },
              { label: "9:00 PM", value: "21:00" },
            ],
          },
          {
            id: "seating",
            component: "ChoicePicker",
            label: "Seating preference",
            value: { path: "/reservation/seating" },
            variant: "mutuallyExclusive",
            displayStyle: "checkbox",
            options: [
              { label: "Indoor", value: "indoor" },
              { label: "Patio / outdoor", value: "outdoor" },
              { label: "Bar seating", value: "bar" },
              { label: "Private room", value: "private" },
            ],
          },
          {
            id: "extras",
            component: "ChoicePicker",
            label: "Extras",
            value: { path: "/reservation/extras" },
            variant: "multipleSelection",
            displayStyle: "chips",
            options: [
              { label: "High chair", value: "highchair" },
              { label: "Wheelchair access", value: "accessible" },
              { label: "Quiet table", value: "quiet" },
              { label: "Celebration", value: "celebration" },
            ],
          },
          {
            id: "notes",
            component: "TextField",
            label: "Special requests",
            value: { path: "/reservation/notes" },
            variant: "longText",
          },
          {
            id: "submit",
            component: "Button",
            child: "submit-label",
            variant: "primary",
            action: {
              event: {
                name: "confirm_booking",
                context: {
                  restaurantName: { path: "/restaurantName" },
                  guests: { path: "/reservation/guests" },
                  date: { path: "/reservation/date" },
                  time: { path: "/reservation/time" },
                  seating: { path: "/reservation/seating" },
                  notes: { path: "/reservation/notes" },
                },
              },
            },
          },
          {
            id: "submit-label",
            component: "Text",
            text: "Confirm reservation",
          },
        ],
      },
    },
    {
      version: "v0.9",
      updateDataModel: {
        surfaceId: SURFACE_ID,
        path: "/",
        value: {
          restaurantName,
          reservation: {
            // ChoicePicker binds to string arrays
            guests: ["2"],
            date: "2026-09-12",
            time: ["19:00"],
            seating: ["indoor"],
            extras: [],
            notes: "",
          },
        },
      },
    },
  ];
}

function asDisplayValue(value: unknown, fallback: string): string {
  if (Array.isArray(value) && value.length > 0) {
    return String(value[0]);
  }
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return fallback;
}

const TIME_LABELS: Record<string, string> = {
  "17:30": "5:30 PM",
  "18:00": "6:00 PM",
  "18:30": "6:30 PM",
  "19:00": "7:00 PM",
  "19:30": "7:30 PM",
  "20:00": "8:00 PM",
  "20:30": "8:30 PM",
  "21:00": "9:00 PM",
};

const SEATING_LABELS: Record<string, string> = {
  indoor: "Indoor",
  outdoor: "Patio / outdoor",
  bar: "Bar seating",
  private: "Private room",
};

/** Booking confirmation surface. */
export function confirmationMessages(context: {
  restaurantName?: string;
  guests?: unknown;
  date?: unknown;
  time?: unknown;
  seating?: unknown;
}): A2uiMessage[] {
  const name = context.restaurantName ?? "your restaurant";
  const guests = asDisplayValue(context.guests, "2");
  const date = asDisplayValue(context.date, "tonight");
  const timeRaw = asDisplayValue(context.time, "19:00");
  const time = TIME_LABELS[timeRaw] ?? timeRaw;
  const seating = SEATING_LABELS[asDisplayValue(context.seating, "indoor")] ?? "Indoor";

  return [
    deleteSurface(),
    createSurface(),
    {
      version: "v0.9",
      updateComponents: {
        surfaceId: SURFACE_ID,
        components: [
          {
            id: "root",
            component: "Card",
            child: "body",
          },
          {
            id: "body",
            component: "Column",
            children: ["check", "title", "summary", "again"],
            align: "stretch",
          },
          {
            id: "check",
            component: "Icon",
            name: "check",
          },
          {
            id: "title",
            component: "Text",
            text: "Reservation confirmed",
            variant: "h2",
          },
          {
            id: "summary",
            component: "Text",
            text: { path: "/summary" },
            variant: "body",
          },
          {
            id: "again",
            component: "Button",
            child: "again-label",
            variant: "borderless",
            action: {
              event: {
                name: "search_again",
                context: {},
              },
            },
          },
          {
            id: "again-label",
            component: "Text",
            text: "Search again",
          },
        ],
      },
    },
    {
      version: "v0.9",
      updateDataModel: {
        surfaceId: SURFACE_ID,
        path: "/",
        value: {
          summary: `Table for ${guests} at ${name} on ${date} at ${time} (${seating}). We'll send a reminder an hour before.`,
        },
      },
    },
  ];
}

/** Fallback when the mock agent does not understand the prompt. */
export function fallbackMessages(prompt = ""): A2uiMessage[] {
  const asked =
    prompt.trim() ||
    "a question outside the restaurant booking demo";

  return [
    deleteSurface(),
    createSurface(),
    {
      version: "v0.9",
      updateComponents: {
        surfaceId: SURFACE_ID,
        components: [
          {
            id: "root",
            component: "Card",
            child: "body",
          },
          {
            id: "body",
            component: "Column",
            children: [
              "title",
              "asked",
              "explain",
              "divider",
              "help-title",
              "help-body",
              "actions",
            ],
            align: "stretch",
          },
          {
            id: "title",
            component: "Text",
            text: "I only handle booking demos",
            variant: "h2",
          },
          {
            id: "asked",
            component: "Text",
            text: { path: "/asked" },
            variant: "body",
          },
          {
            id: "explain",
            component: "Text",
            text: "This is a **mock agent** — it returns handcrafted A2UI JSON, not an LLM answer. Try a restaurant or booking prompt to see dynamic UI.",
            variant: "body",
          },
          {
            id: "divider",
            component: "Divider",
          },
          {
            id: "help-title",
            component: "Text",
            text: "What I can do",
            variant: "h3",
          },
          {
            id: "help-body",
            component: "Text",
            text: "• Find Italian restaurants near you\n• Book a table (party size, time, seating)\n• Confirm a reservation",
            variant: "body",
          },
          {
            id: "actions",
            component: "Row",
            children: ["find-btn", "book-btn"],
            justify: "start",
          },
          {
            id: "find-btn",
            component: "Button",
            child: "find-label",
            variant: "primary",
            action: {
              event: {
                name: "search_again",
                context: {},
              },
            },
          },
          {
            id: "find-label",
            component: "Text",
            text: "Find restaurants",
          },
          {
            id: "book-btn",
            component: "Button",
            child: "book-label",
            variant: "borderless",
            action: {
              event: {
                name: "start_booking",
                context: {},
              },
            },
          },
          {
            id: "book-label",
            component: "Text",
            text: "Book a table",
          },
        ],
      },
    },
    {
      version: "v0.9",
      updateDataModel: {
        surfaceId: SURFACE_ID,
        path: "/",
        value: {
          asked: `You asked: “${asked}”`,
        },
      },
    },
  ];
}

/** Resolve which scenario to run from a free-text prompt. */
export function resolveScenarioFromPrompt(prompt: string): ScenarioId {
  const q = prompt.toLowerCase();
  if (q.includes("book") || q.includes("reserv") || q.includes("table")) {
    return "reservation";
  }
  if (
    q.includes("italian") ||
    q.includes("restaurant") ||
    q.includes("find") ||
    q.includes("near me") ||
    q.includes("dinner") ||
    q.includes("lunch")
  ) {
    return "restaurants";
  }
  return "fallback";
}

export function messagesForScenario(
  scenario: ScenarioId,
  context?: Record<string, unknown>,
): A2uiMessage[] {
  switch (scenario) {
    case "welcome":
      return welcomeMessages();
    case "restaurants":
      return restaurantMessages();
    case "reservation":
      return reservationMessages(
        typeof context?.restaurantName === "string"
          ? context.restaurantName
          : "Trattoria Verde",
      );
    case "confirmation":
      return confirmationMessages({
        restaurantName:
          typeof context?.restaurantName === "string"
            ? context.restaurantName
            : undefined,
        guests: context?.guests,
        date: context?.date,
        time: context?.time,
        seating: context?.seating,
      });
    case "fallback":
      return fallbackMessages(
        typeof context?.prompt === "string" ? context.prompt : "",
      );
    default:
      return welcomeMessages();
  }
}
