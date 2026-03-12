import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import type { Fixture } from "@/lib/api-sports";

export default async function MatchHeader({ match }: { match: Fixture }) {
  const [t, locale] = await Promise.all([
    getTranslations("matchDetail"),
    getLocale()
  ]);

  const dateObj = new Date(match.fixture.date);
  
  const formattedDate = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(dateObj);

  const formattedTime = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);

  return (
    <section className="relative overflow-hidden rounded-xl bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/20 p-6 md:p-10">
      <div className="absolute top-4 right-9 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
        {match.fixture.status.long}
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-2">
        <div className="flex flex-col items-center gap-4 text-center md:text-left md:items-start flex-1">
          <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-2 border-primary/40">
            <Image
              src={match.teams.home.logo}
              alt={match.teams.home.name}
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold dark:text-white">
              {match.teams.home.name}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">{t("home")}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl font-black text-slate-300 dark:text-primary/20">
            VS
          </span>
          <div className="text-center">
            <p className="text-sm font-bold dark:text-white">
              {formattedDate}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formattedTime}
            </p>
            <p className="mt-2 text-xs font-medium text-primary">
              {t("round")} {match.league.round}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 text-center md:text-right md:items-end flex-1">
          <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-2 border-secondary/40">
            <Image
              src={match.teams.away.logo}
              alt={match.teams.away.name}
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold dark:text-white">
              {match.teams.away.name}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">{t("away")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
