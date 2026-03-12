import { getMultiDayMatches } from "@/lib/api-sports";
import { auth } from "@/lib/auth";
import { isUserSubscribed } from "@/lib/subscription";
import MatchList from "@/components/matches/MatchList";

export default async function HomePage() {
  const today = new Date().toISOString().split("T")[0];
  const dayResults = await getMultiDayMatches(today, 4);

  // Flatten with date info for MatchList, sorted by timestamp
  const allMatches = dayResults.flatMap((day) =>
    day.matches.map((m) => ({ ...m, _date: day.date }))
  );
  allMatches.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);

  const session = await auth();

  let subscribed = false;
  if (session?.user?.id) {
    subscribed = await isUserSubscribed(session.user.id);
  }

  // First page: 20 matches
  const pageSize = 20;
  const firstPageMatches = allMatches.slice(0, pageSize);
  const totalMatches = allMatches.length;
  const totalPages = Math.ceil(totalMatches / pageSize);

  return (
    <MatchList
      initialMatches={firstPageMatches}
      isSubscribed={subscribed}
      pagination={{ page: 1, pageSize, totalMatches, totalPages }}
      startDate={today}
    />
  );
}
