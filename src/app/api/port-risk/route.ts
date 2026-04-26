import ports from "../../../lib/ports.json";

export async function GET() {
  const signals = await fetch("http://localhost:3000/api/signals").then(r => r.json());

  const highRiskCountries = signals
    .filter((s: any) => s.risk === "HIGH")
    .map((s: any) => s.location?.toLowerCase());

  const updatedPorts = ports.map((port: any) => {
    const isHigh = highRiskCountries.includes(port.country.toLowerCase());

    return {
      ...port,
      risk: isHigh ? "HIGH" : "LOW",
    };
  });

  return Response.json(updatedPorts);
}
