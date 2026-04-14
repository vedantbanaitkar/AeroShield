import { NextRequest, NextResponse } from "next/server";

type OracleResponse = {
  flightNumber: string;
  status: string;
  delayMinutes: number;
  isEligible: boolean;
  departure: string;
  arrival: string;
  source: "mock" | "aviationstack";
};

const TWO_HOURS = 120;

export async function GET(req: NextRequest) {
  const flightNumber = req.nextUrl.searchParams.get("flight")?.toUpperCase();
  const isMock = req.nextUrl.searchParams.get("mock") === "true";
  const mockDelayRaw = req.nextUrl.searchParams.get("delay");

  if (!flightNumber) {
    return NextResponse.json(
      { error: "Missing flight query param" },
      { status: 400 },
    );
  }

  if (isMock) {
    const mockDelay = Number(mockDelayRaw ?? "150");
    const delayMinutes = Number.isFinite(mockDelay)
      ? Math.max(0, mockDelay)
      : 150;

    const mockResponse: OracleResponse = {
      flightNumber,
      status: delayMinutes >= TWO_HOURS ? "delayed" : "on-time",
      delayMinutes,
      isEligible: delayMinutes >= TWO_HOURS,
      departure: "Mumbai (BOM)",
      arrival: "Delhi (DEL)",
      source: "mock",
    };

    return NextResponse.json(mockResponse);
  }

  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing AVIATIONSTACK_API_KEY and mock=false" },
      { status: 500 },
    );
  }

  const response = await fetch(
    `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "AviationStack request failed", status: response.status },
      { status: 502 },
    );
  }

  const payload = await response.json();
  const flight = payload?.data?.[0];

  if (!flight) {
    return NextResponse.json({ error: "Flight not found" }, { status: 404 });
  }

  const delayMinutes = Number(flight?.departure?.delay ?? 0);
  const result: OracleResponse = {
    flightNumber,
    status: String(flight?.flight_status ?? "unknown"),
    delayMinutes: Number.isFinite(delayMinutes) ? Math.max(0, delayMinutes) : 0,
    isEligible: delayMinutes >= TWO_HOURS,
    departure: String(flight?.departure?.airport ?? "Unknown departure"),
    arrival: String(flight?.arrival?.airport ?? "Unknown arrival"),
    source: "aviationstack",
  };

  return NextResponse.json(result);
}
