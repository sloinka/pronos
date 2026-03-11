import Image from "next/image";
import { useTranslations } from "next-intl";
import type { Fixture } from "@/lib/api-sports";

export default function MatchHeader({ match }: { match: Fixture }) {
  const t = useTranslations("matchDetail");

  const kickoffDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(match.fixture.date));

  return (
    <div className="bg-surface rounded-xl p-6 border border-white/5">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 text-sm text-text-light/60 mb-1">
          {match.league.flag && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={match.league.flag}
              alt={match.league.country}
              className="rounded-sm w-5 h-auto"
            />
          )}
          <span>{match.league.name}</span>
          <span>·</span>
          <span>{match.league.country}</span>
          <span>·</span>
          <span>{t("round")} {match.league.round}</span>
        </div>
        <p className="text-sm text-text-light/50">{kickoffDate}</p>
        <span className="badge badge-outline badge-sm mt-1">
          {match.fixture.status.long}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-2 flex-1">
          <Image
            src={match.teams.home.logo}
            alt={match.teams.home.name}
            width={64}
            height={64}
          />
          <span className="font-semibold text-center">{match.teams.home.name}</span>
        </div>

        <div className="text-3xl font-bold text-primary px-8">VS</div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <Image
            src={match.teams.away.logo}
            alt={match.teams.away.name}
            width={64}
            height={64}
          />
          <span className="font-semibold text-center">{match.teams.away.name}</span>
        </div>
      </div>
    </div>
  );
}
