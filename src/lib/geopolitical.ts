type NewsArticle = {
  title?: string | null;
  description?: string | null;
  source?: {
    name?: string | null;
  } | null;
};

type Signal = {
  title: string;
  impact: string;
  event: string;
  category: string;
  location: string;
  source?: string | null;
};

// 1. Fetch news
export async function fetchNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing NEWS_API_KEY environment variable");
  }

  const res = await fetch(
    `https://newsapi.org/v2/everything?q=(shipping OR port OR logistics OR cargo OR trade) AND (india OR nigeria OR kenya OR ghana OR egypt OR "south africa")&language=en&sortBy=publishedAt&pageSize=30&apiKey=${apiKey}`,
  );

  if (!res.ok) {
    throw new Error(`NewsAPI error: ${res.status}`);
  }

  const data = (await res.json()) as { articles?: NewsArticle[] };
  return data.articles ?? [];
}

// 2. Event keywords
const EVENT_KEYWORDS = {
  // 🚢 PORT & SHIPPING ISSUES
  "port strike": "Port Strike",
  strike: "Port Strike",
  congestion: "Port Congestion",
  backlog: "Port Congestion",
  delay: "Delay",
  delays: "Delay",
  disruption: "Shipping Disruption",
  crisis: "Crisis",
  shortage: "Supply Shortage",
  blockade: "Trade Blockade",
  diversion: "Route Diversion",
  "blank sailing": "Vessel Cancellation",

  // ⚔️ CONFLICT / SECURITY
  war: "Conflict",
  attack: "Security Threat",
  missile: "Security Threat",
  bombing: "Security Threat",
  piracy: "Maritime Piracy",

  // 🚫 TRADE RESTRICTIONS
  ban: "Trade Ban",
  banned: "Trade Ban",
  sanction: "Sanctions",
  sanctions: "Sanctions",
  embargo: "Trade Embargo",
  restriction: "Trade Restriction",

  // 📈 ECONOMIC / POLICY
  tariff: "Tariff Change",
  duty: "Duty Change",
  regulation: "Regulatory Change",
  policy: "Policy Change",
  compliance: "Compliance Issue",

  // 🌍 INFRASTRUCTURE / TRANSPORT
  "port closure": "Port Closure",
  closed: "Port Closure",
  shutdown: "Operational Shutdown",
  railway: "Inland Transport Disruption",
  trucking: "Inland Transport Disruption",
  roadblock: "Inland Transport Disruption",

  // 🌪️ NATURAL EVENTS (optional but useful)
  storm: "Weather Disruption",
  cyclone: "Weather Disruption",
  flood: "Weather Disruption",
  earthquake: "Natural Disaster",

  // ⚠️ SOCIAL / POLITICAL
  protest: "Civil Unrest",
  unrest: "Civil Unrest",
  riot: "Civil Unrest",
  election: "Political Risk",
};

const EVENT_MATCHERS = Object.keys(EVENT_KEYWORDS)
  .sort((a, b) => b.length - a.length)
  .map((key) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = key.includes(" ") ? escapedKey : `\\b${escapedKey}\\b`;

    return {
      key,
      regex: new RegExp(pattern, "i"),
    };
  });

// 3. Detect event
function detectEvent(text: string) {
  text = text.toLowerCase().trim();

  for (const { key, regex } of EVENT_MATCHERS) {
    if (regex.test(text)) {
      return EVENT_KEYWORDS[key as keyof typeof EVENT_KEYWORDS];
    }
  }

  return "General";
}

// 4. Detect location
const LOCATIONS = [
  "india",
  "south africa",
  "lagos",
  "durban",
  "mombasa",
  "alexandria",
  "tema",
  "nigeria",
  "kenya",
  "egypt",
  "ghana",
  "iran",
  "maldives",
  "usa",
  "united states",
  "california",
  "us",
  "colombia",
  "canary islands",
  "australia",
  "port said",
  "cape town",
];

const LOCATION_REGEX = LOCATIONS.map((loc) => ({
  loc,
  regex: new RegExp(`\\b${loc}\\b`, "i"),
}));

function detectLocation(text: string) {
  text = text.toLowerCase();

  const matches: string[] = [];

  for (const { loc, regex } of LOCATION_REGEX) {
    if (regex.test(text)) {
      matches.push(loc);
    }
  }

  if (matches.length === 0) return "unknown";

  return matches.sort((a, b) => b.length - a.length)[0];
}

// 5. Impact level
function getImpactLevel(title: string): "HIGH" | "MEDIUM" | "LOW" {
  const t = title.toLowerCase();

  if (/(war|attack|missile|blockade|conflict)/.test(t)) return "HIGH";
  if (/(strike|protest|delay|sanction|tariff)/.test(t)) return "MEDIUM";
  return "LOW";
}

function getConfidence(event: string) {
  if (event === "General") return "LOW";
  if (["Port Strike", "Port Congestion"].includes(event)) return "MEDIUM";
  return "HIGH";
}

// 5a. Classify category
function getCategory(text: string) {
  const t = text.toLowerCase();

  if (t.includes("war") || t.includes("conflict")) return "CONFLICT";
  if (t.includes("strike") || t.includes("protest")) return "LABOR";
  if (t.includes("policy") || t.includes("tariff")) return "POLICY";

  return "GENERAL";
}

// 5b. Extract location
export function extractLocation(title: string) {
  if (title.includes("India")) return "India";
  if (title.includes("Iran")) return "Iran";
  if (title.includes("China")) return "China";
  if (title.includes("Red Sea")) return "Red Sea";
  if (title.includes("Suez")) return "Suez Canal";

  return "Global";
}

// 6. Combine everything
export async function getSignals(): Promise<Signal[]> {
  const articles = await fetchNews();

  return articles.slice(0, 10).map((article) => {
    const text = `${article.title || ""} ${article.description || ""}`;

    return {
      title: article.title || "Untitled",
      source: article.source?.name || "Unknown",
      impact: getImpactLevel(article.title || ""),
      event: detectEvent(text),
      category: getCategory(text),
      location: extractLocation(article.title || ""),
    };
  });
}

export function getPortRisk(port: any, signals: any[]) {
  const portName = port.port.toLowerCase();
  const country = port.country.toLowerCase();

  const relevantSignals = signals.filter((s: any) => {
    const title = s.title.toLowerCase();
    const location = s.location.toLowerCase();

    return (
      title.includes(portName) || // direct hit
      location === country || // country-level
      location.includes("global") || // global impact
      location.includes("red sea") || // trade chokepoints
      location.includes("suez") ||
      location.includes("middle east")
    );
  });

  const highCount = relevantSignals.filter((s: any) => s.impact === "HIGH").length;

  if (highCount >= 2) return "HIGH";
  if (highCount === 1) return "MEDIUM";
  return "LOW";
}
