import { getShipmentStatus } from "@/lib/shipment";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const containerId = searchParams.get("id");

  if (!containerId) {
    return Response.json({ error: "Missing container ID. Pass ?id=MSCU1234567" }, { status: 400 });
  }

  try {
    const data = await getShipmentStatus(containerId);
    return Response.json(data);
  } catch (err: any) {
    const isNotFound = err.message?.includes("not found");
    return Response.json(
      { error: err.message ?? "Failed to fetch shipment status" },
      { status: isNotFound ? 404 : 500 },
    );
  }
}
