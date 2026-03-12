import { NextRequest, NextResponse } from "next/server";
import { getMultiDayMatches } from "@/lib/api-sports";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const days = Math.min(7, Math.max(1, parseInt(searchParams.get("days") || "4", 10)));

  try {
    const dayResults = await getMultiDayMatches(date, days);

    // Flatten all matches with their date, sorted by timestamp
    const allMatches = dayResults.flatMap((day) =>
      day.matches.map((m) => ({ ...m, _date: day.date }))
    );
    allMatches.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);

    const totalMatches = allMatches.length;
    const totalPages = Math.ceil(totalMatches / pageSize);
    const start = (page - 1) * pageSize;
    const paginatedMatches = allMatches.slice(start, start + pageSize);

    return NextResponse.json({
      matches: paginatedMatches,
      pagination: {
        page,
        pageSize,
        totalMatches,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
