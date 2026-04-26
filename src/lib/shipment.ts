export async function getShipmentStatus(containerId: string) {
  const apiKey = process.env.SHIPSGO_API_KEY;

  const res = await fetch(`https://api.shipsgodata.com/v2/container/${containerId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    throw new Error("ShipsGo API error");
  }

  const data = await res.json();

  return {
    location: data?.current_location || "Unknown",
    eta: data?.eta || "Unknown",
    delayRisk: calculateDelayRisk(data),
  };
}

function calculateDelayRisk(data: any) {
  if (!data?.eta) return "LOW";

  const eta = new Date(data.eta).getTime();
  const now = Date.now();

  const delayDays = (eta - now) / (1000 * 60 * 60 * 24);

  if (delayDays > 5) return "HIGH";
  if (delayDays > 2) return "MED";

  return "LOW";
}