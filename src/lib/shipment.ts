/**
 * shipment.ts
 * ShipsGo v2 tracking + delay engine
 *
 * ShipsGo API docs: https://shipsgodata.com/api-documentation
 * Env required: SHIPSGO_API_KEY
 */

import { getSignals } from "@/lib/geopolitical";

// ─── ShipsGo response shape (v2) ────────────────────────────────────────────

interface ShipsGoEvent {
  location: string;
  description: string;
  actual_time?: string;
  expected_time?: string;
}

interface ShipsGoContainer {
  container_number: string;
  carrier: string;
  status: string;
  pol: string; // port of loading (name)
  pod: string; // port of discharge (name)
  eta: string | null; // ISO date string
  ata: string | null; // actual time of arrival
  atd: string | null; // actual time of departure
  current_location: string;
  vessel_name: string;
  voyage_number: string;
  events: ShipsGoEvent[];
  delay_days?: number; // ShipsGo sometimes returns this directly
}

// ─── Our enriched response ───────────────────────────────────────────────────

export interface ShipmentStatus {
  containerId: string;
  carrier: string;
  vessel: string;
  currentLocation: string;
  pol: string;
  pod: string;
  eta: string;
  ata: string | null;
  status: string;
  delayRisk: "LOW" | "MED" | "HIGH";
  delayDays: number;
  delayReasons: string[];
  geoRisk: "LOW" | "MEDIUM" | "HIGH";
  geoRiskReasons: string[];
  events: ShipsGoEvent[];
  lastUpdated: string;
}

// ─── Fetch raw data from ShipsGo ────────────────────────────────────────────

async function fetchShipsGo(containerId: string): Promise<ShipsGoContainer> {
  const apiKey = process.env.SHIPSGO_API_KEY;

  if (!apiKey) {
    throw new Error("Missing SHIPSGO_API_KEY in environment variables");
  }

  const res = await fetch(`https://api.shipsgodata.com/v2/container/${containerId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    // Don't cache — we always want live data
    next: { revalidate: 0 },
  });

  if (res.status === 404) {
    throw new Error(`Container ${containerId} not found on ShipsGo`);
  }

  if (res.status === 401) {
    throw new Error("Invalid ShipsGo API key");
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ShipsGo API error ${res.status}: ${body}`);
  }

  return res.json();
}

// ─── Delay engine ────────────────────────────────────────────────────────────

function calculateDelay(data: ShipsGoContainer): {
  delayRisk: "LOW" | "MED" | "HIGH";
  delayDays: number;
  delayReasons: string[];
} {
  const reasons: string[] = [];
  let delayDays = 0;

  // 1. Use ShipsGo's own delay_days if available
  if (data.delay_days && data.delay_days > 0) {
    delayDays = data.delay_days;
    reasons.push(`Carrier-reported delay of ${data.delay_days} day(s)`);
  }

  // 2. Compare ETA vs now
  if (data.eta) {
    const eta = new Date(data.eta).getTime();
    const now = Date.now();
    const daysUntilEta = (eta - now) / (1000 * 60 * 60 * 24);

    // If ETA already passed and no ATA, it's late
    if (daysUntilEta < 0 && !data.ata) {
      const overdueDays = Math.abs(Math.round(daysUntilEta));
      delayDays = Math.max(delayDays, overdueDays);
      reasons.push(`ETA passed ${overdueDays} day(s) ago — vessel not yet arrived`);
    }
  }

  // 3. Scan events for delay keywords
  const delayKeywords = [
    { pattern: /rolled/i, reason: "Cargo rolled to next sailing", days: 7 },
    { pattern: /blank sailing/i, reason: "Blank sailing — vessel cancelled", days: 7 },
    { pattern: /omit/i, reason: "Port omitted by carrier", days: 5 },
    { pattern: /congestion/i, reason: "Port congestion reported", days: 3 },
    { pattern: /customs hold/i, reason: "Customs hold at port", days: 4 },
    { pattern: /reroute|divert/i, reason: "Vessel rerouted (e.g. Red Sea bypass)", days: 12 },
    { pattern: /equipment shortage/i, reason: "Equipment shortage at terminal", days: 3 },
    { pattern: /strike/i, reason: "Port or terminal strike action", days: 4 },
    { pattern: /weather/i, reason: "Weather-related delay", days: 2 },
    { pattern: /transhipment delay/i, reason: "Transhipment delay at hub port", days: 5 },
  ];

  for (const event of data.events || []) {
    const text = `${event.description} ${event.location}`.toLowerCase();
    for (const { pattern, reason, days } of delayKeywords) {
      if (pattern.test(text) && !reasons.includes(reason)) {
        reasons.push(reason);
        delayDays = Math.max(delayDays, days);
      }
    }
  }

  // 4. Derive risk level
  let delayRisk: "LOW" | "MED" | "HIGH" = "LOW";
  if (delayDays >= 7) delayRisk = "HIGH";
  else if (delayDays >= 3) delayRisk = "MED";

  return { delayRisk, delayDays, delayReasons: reasons };
}

// ─── Geo-risk overlay ────────────────────────────────────────────────────────

async function overlayGeoRisk(data: ShipsGoContainer): Promise<{
  geoRisk: "LOW" | "MEDIUM" | "HIGH";
  geoRiskReasons: string[];
}> {
  const reasons: string[] = [];

  try {
    const signals = await getSignals();

    // Build a search string from the route
    const routeText = [
      data.pol,
      data.pod,
      data.current_location,
      ...(data.events || []).map((e) => e.location),
    ]
      .join(" ")
      .toLowerCase();

    let highCount = 0;
    let medCount = 0;

    for (const signal of signals) {
      const loc = signal.location.toLowerCase();

      if (routeText.includes(loc) && loc !== "global" && loc !== "unknown") {
        if (signal.risk === "HIGH") {
          highCount++;
          reasons.push(`${signal.title} (${signal.location})`);
        } else if (signal.risk === "MEDIUM") {
          medCount++;
          reasons.push(`${signal.title} (${signal.location})`);
        }
      }
    }

    const geoRisk: "LOW" | "MEDIUM" | "HIGH" =
      highCount > 0 ? "HIGH" : medCount > 0 ? "MEDIUM" : "LOW";

    return { geoRisk, geoRiskReasons: reasons.slice(0, 3) };
  } catch {
    // Geo overlay is non-blocking — if it fails, default to LOW
    return { geoRisk: "LOW", geoRiskReasons: [] };
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function getShipmentStatus(containerId: string): Promise<ShipmentStatus> {
  const raw = await fetchShipsGo(containerId);

  const [{ delayRisk, delayDays, delayReasons }, { geoRisk, geoRiskReasons }] = await Promise.all([
    Promise.resolve(calculateDelay(raw)),
    overlayGeoRisk(raw),
  ]);

  return {
    containerId: raw.container_number,
    carrier: raw.carrier,
    vessel: raw.vessel_name,
    currentLocation: raw.current_location ?? "Unknown",
    pol: raw.pol,
    pod: raw.pod,
    eta: raw.eta ?? "Unknown",
    ata: raw.ata ?? null,
    status: raw.status,
    delayRisk,
    delayDays,
    delayReasons,
    geoRisk,
    geoRiskReasons,
    events: (raw.events ?? []).slice(0, 10), // last 10 events
    lastUpdated: new Date().toISOString(),
  };
}
