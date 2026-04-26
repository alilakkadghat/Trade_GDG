import { getSignals } from "@/lib/geopolitical";
import ports from "@/lib/ports.json";

const CITY_TO_COUNTRY: Record<string, string> = {
  lagos: "nigeria",
  mombasa: "kenya",
  durban: "south africa",
  alexandria: "egypt",
  tema: "ghana"
};

const NORMALIZE: Record<string, string> = {
  us: "united states"
};

export async function getPortRisk() {
  const signals = await getSignals();

  return ports.map((port: any) => {
    let risk = "LOW";

    for (const signal of signals) {
      const normalizedLocation =
        NORMALIZE[CITY_TO_COUNTRY[signal.location] || signal.location] ||
        CITY_TO_COUNTRY[signal.location] ||
        signal.location;

      if (
        normalizedLocation === port.country.trim().toLowerCase()
      ) {
        if (signal.risk === "HIGH") {
          risk = "HIGH";
          break;
        } else if (signal.risk === "MEDIUM" && risk !== "HIGH") {
          risk = "MEDIUM";
        }
      }
    }

    return {
      ...port,
      risk
    };
  });
}
