import { getSignals } from "@/lib/geopolitical";

export async function GET() {
  const signals = await getSignals();
  return Response.json(signals);
}