"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import type { Fixture } from "@/lib/api-sports";

export default function MatchCard({
  match,
  locked,
}: {
  match: Fixture;
  locked: boolean;
}) {
  const kickoffTime = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(match.fixture.date));

  const card = (
    <div
      className={`card bg-surface border border-white/5 hover:border-primary/30 transition-all duration-200 cursor-pointer group ${
        locked ? "relative overflow-hidden" : ""
      }`}
    >
      {locked && (
        <div className="absolute inset-0 backdrop-blur-sm bg-bg-dark/50 z-10 flex items-center justify-center">
          <span className="badge badge-primary badge-lg">Subscribe to unlock</span>
        </div>
      )}
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Image
              src={match.teams.home.logo}
              alt={match.teams.home.name}
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-semibold text-sm truncate">
              {match.teams.home.name}
            </span>
          </div>

          <div className="px-4 text-center">
            <span className="text-lg font-bold text-primary">{kickoffTime}</span>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            <span className="font-semibold text-sm truncate text-right">
              {match.teams.away.name}
            </span>
            <Image
              src={match.teams.away.logo}
              alt={match.teams.away.name}
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (locked) return card;

  return (
    <Link href={`/match/${match.fixture.id}`}>
      {card}
    </Link>
  );
}
