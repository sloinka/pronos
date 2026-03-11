import { NextRequest, NextResponse } from "next/server";
import { getDailyMatches } from "@/lib/api-sports";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  try {
    const matches = await getDailyMatches(date);
    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}
