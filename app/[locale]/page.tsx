import { getDailyMatches } from "@/lib/api-sports";
import { auth } from "@/lib/auth";
import { isUserSubscribed } from "@/lib/subscription";
import MatchList from "@/components/matches/MatchList";

export default async function HomePage() {
  const today = new Date().toISOString().split("T")[0];
  const matches = await getDailyMatches(today);
  const session = await auth();

  let subscribed = false;
  if (session?.user?.id) {
    subscribed = await isUserSubscribed(session.user.id);
  }

  return <MatchList matches={matches} isSubscribed={subscribed} />;
}
