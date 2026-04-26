import { getShipmentStatus } from "@/lib/shipment";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const containerId = searchParams.get("id");

  if (!containerId) {
    return Response.json({ error: "Missing container ID" }, { status: 400 });
  }

  const data = await getShipmentStatus(containerId);

  return Response.json(data);
}