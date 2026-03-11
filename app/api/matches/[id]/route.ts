import { NextRequest, NextResponse } from "next/server";
import { getMatchDetails, getTeamForm, getH2H, getInjuries } from "@/lib/api-sports";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fixtureId = parseInt(id, 10);

  if (isNaN(fixtureId)) {
    return NextResponse.json({ error: "Invalid fixture ID" }, { status: 400 });
  }

  try {
    const match = await getMatchDetails(fixtureId);

    const [homeForm, awayForm, h2h, injuries] = await Promise.all([
      getTeamForm(match.teams.home.id),
      getTeamForm(match.teams.away.id),
      getH2H(match.teams.home.id, match.teams.away.id),
      getInjuries(fixtureId),
    ]);

    return NextResponse.json({
      match,
      homeForm,
      awayForm,
      h2h,
      injuries,
    });
  } catch (error) {
    console.error("Failed to fetch match details:", error);
    return NextResponse.json(
      { error: "Failed to fetch match details" },
      { status: 500 }
    );
  }
}
