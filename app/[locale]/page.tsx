import { getTranslations, getLocale } from "next-intl/server";
import { getMultiDayMatches } from "@/lib/api-sports";
import { auth } from "@/lib/auth";
import { isUserSubscribed } from "@/lib/subscription";
import MatchList from "@/components/matches/MatchList";
import SubscriptionBanner from "@/components/ui/SubscriptionBanner";

export default async function HomePage() {
  const [t, locale] = await Promise.all([
    getTranslations("hero"),
    getLocale()
  ]);
  
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

  const formattedDate = new Intl.DateTimeFormat(locale, { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(new Date());

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Slim Hero Section */}
      <section className="relative overflow-hidden rounded-xl bg-slate-900 p-8 text-center border border-primary/20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent"></div>
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold mb-4">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            <span>{t("todayLabel")}, {formattedDate}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight">{t("title")}</h1>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <div className="space-y-6">
        <MatchList
          initialMatches={firstPageMatches}
          isSubscribed={subscribed}
          pagination={{ page: 1, pageSize, totalMatches, totalPages }}
          startDate={today}
        />
      </div>

      {!subscribed && <SubscriptionBanner />}
    </main>
  );
}
