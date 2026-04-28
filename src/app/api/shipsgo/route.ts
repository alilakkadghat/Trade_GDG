export async function GET() {
  try {
    const apiKey = process.env.SHIPSGO_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          error: "Missing API key in .env.local",
        },
        { status: 500 },
      );
    }

    const res = await fetch("https://api.shipsgo.com/v2/ocean/shipments", {
      method: "GET",
      headers: {
        "X-Shipsgo-User-Token": apiKey,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    return Response.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return Response.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 },
    );
  }
}
