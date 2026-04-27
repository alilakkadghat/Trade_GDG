import ports from "../../../lib/ports.json";

import { getPortRisk } from "@/lib/geopolitical";

export async function GET() {
  const signals = await fetch("http://localhost:3000/api/signals").then(r => r.json());

  const updatedPorts = ports.map((port: any) => {
    return {
      ...port,
      risk: getPortRisk(port, signals),
    };
  });

  return Response.json(updatedPorts);
}
