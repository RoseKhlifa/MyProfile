import { getVisitCounter, isVisitEventId } from "@/lib/visit-counter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(body: { total: number } | { error: string }, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const incoming = new URL(origin);
    if (
      !["http:", "https:"].includes(incoming.protocol) ||
      incoming.origin !== origin
    ) {
      return false;
    }
    return (
      incoming.origin === new URL(request.url).origin ||
      incoming.host === request.headers.get("host")?.toLowerCase()
    );
  } catch {
    return false;
  }
}

async function readEventId(request: Request): Promise<string> {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > 256)) {
    throw new Error("Invalid visit request size");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Visit request body is missing");
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let body = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 256) {
        await reader.cancel();
        throw new Error("Visit request body is too large");
      }
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  const value: unknown = JSON.parse(body);
  if (
    typeof value !== "object" ||
    value === null ||
    !("eventId" in value) ||
    Object.keys(value).length !== 1 ||
    !isVisitEventId(value.eventId)
  ) {
    throw new Error("Invalid visit event ID");
  }
  return value.eventId;
}

export async function GET(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Forbidden" }, 403);
  try {
    return json({ total: getVisitCounter().getTotal() });
  } catch {
    return json({ error: "Visit counter unavailable" }, 503);
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Forbidden" }, 403);
  let eventId: string;
  try {
    eventId = await readEventId(request);
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  try {
    return json({ total: getVisitCounter().recordVisit(eventId) });
  } catch {
    return json({ error: "Visit counter unavailable" }, 503);
  }
}
