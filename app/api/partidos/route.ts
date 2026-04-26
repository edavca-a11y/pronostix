import { NextResponse } from "next/server";

const API_KEY = process.env.FOOTBALL_API_KEY;

export async function GET() {
  try {
    const hoy = new Date().toISOString().split("T")[0];
    const en7dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const res = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${hoy}&dateTo=${en7dias}&limit=10`,
      {
        headers: {
          "X-Auth-Token": API_KEY || "",
        },
        next: { revalidate: 300 },
      }
    );

    const data = await res.json();

    const partidos = data.matches?.slice(0, 6).map((m: any) => ({
      id: m.id,
      liga: m.competition?.name || "Liga",
      local: m.homeTeam?.shortName || m.homeTeam?.name || "Local",
      visita: m.awayTeam?.shortName || m.awayTeam?.name || "Visita",
      hora: new Date(m.utcDate).toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Santiago",
      }),
      fecha: new Date(m.utcDate).toLocaleDateString("es-CL", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "America/Santiago",
      }),
    })) || [];

    return NextResponse.json({ partidos });
  } catch (error) {
    return NextResponse.json({ partidos: [] });
  }
}