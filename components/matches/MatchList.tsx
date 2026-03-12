"use client";

import { useState, useTransition, useEffect } from "react";
import { useTranslations, useLocale, useFormatter } from "next-intl";
import LeagueGroup from "./LeagueGroup";
import type { Fixture } from "@/lib/api-sports";

type FixtureWithDate = Fixture & { _date: string };

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalMatches: number;
  totalPages: number;
}

interface MatchListProps {
  initialMatches: FixtureWithDate[];
  isSubscribed: boolean;
  pagination: PaginationInfo;
  startDate: string;
}

function getDayLabel(
  dateStr: string,
  todayStr: string,
  t: ReturnType<typeof useTranslations>,
  format: ReturnType<typeof useFormatter>
) {
  const today = new Date(todayStr + "T00:00:00Z");
  const date = new Date(dateStr + "T00:00:00Z");
  const diffDays = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return t("today");
  if (diffDays === 1) return t("tomorrow");

  return format.dateTime(date, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function MatchList({
  initialMatches,
  isSubscribed,
  pagination,
  startDate,
}: MatchListProps) {
  const t = useTranslations("matches");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const locale = useLocale();

  const [matches, setMatches] = useState<FixtureWithDate[]>(initialMatches);
  const [currentPage, setCurrentPage] = useState(pagination.page);
  const [totalPages, setTotalPages] = useState(pagination.totalPages);
  const [totalMatches, setTotalMatches] = useState(pagination.totalMatches);
  const [isPending, startTransition] = useTransition();

  // Sync state with props when initial data changes
  useEffect(() => {
    setMatches(initialMatches);
    setCurrentPage(pagination.page);
    setTotalPages(pagination.totalPages);
    setTotalMatches(pagination.totalMatches);
  }, [initialMatches, pagination]);

  if (matches.length === 0 && currentPage === 1) {
    return (
      <div className="text-center py-16 text-text-light/50">
        <p className="text-lg">{t("noUpcomingMatches")}</p>
      </div>
    );
  }

  // Group by date, then by league within each date
  const dayGroups = new Map<
    string,
    Map<
      number,
      {
        name: string;
        logo: string;
        flag: string | null;
        country: string;
        matches: FixtureWithDate[];
      }
    >
  >();

  let globalIndex = 0;
  const globalLockedMap = new Map<number, boolean>();

  // Sort by timestamp
  const sorted = [...matches].sort(
    (a, b) => a.fixture.timestamp - b.fixture.timestamp
  );

  for (const match of sorted) {
    const dateKey = match._date;
    if (!dayGroups.has(dateKey)) {
      dayGroups.set(dateKey, new Map());
    }
    const leagues = dayGroups.get(dateKey)!;
    const leagueId = match.league.id;
    if (!leagues.has(leagueId)) {
      leagues.set(leagueId, {
        name: match.league.name,
        logo: match.league.logo,
        flag: match.league.flag,
        country: match.league.country,
        matches: [],
      });
    }
    leagues.get(leagueId)!.matches.push(match);

    if (!isSubscribed && globalIndex >= 3) {
      globalLockedMap.set(match.fixture.id, true);
    }
    globalIndex++;
  }

  async function goToPage(page: number) {
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/matches?date=${startDate}&page=${page}&pageSize=${pagination.pageSize}&days=4`
        );
        const data = await res.json();
        setMatches(data.matches);
        setCurrentPage(page);

        // If API provides updated pagination, update it
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalMatches(data.pagination.totalMatches);
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("Failed to fetch page:", error);
      }
    });
  }

  // Generate page numbers to show
  function getPageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("upcomingMatches")}</h1>
        {totalMatches > 0 && (
          <span className="text-sm text-text-light/50">
            {t("showing", {
              count: matches.length,
              total: totalMatches,
            })}
          </span>
        )}
      </div>

      {Array.from(dayGroups.entries()).map(([dateKey, leagues]) => (
        <div key={dateKey} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-white/10" />
            <h2 className="text-lg font-semibold text-primary whitespace-nowrap">
              {getDayLabel(dateKey, startDate, tCommon, format)}
            </h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {Array.from(leagues.entries()).map(([leagueId, league]) => {
            const lockedIndexes = new Set<number>();
            league.matches.forEach((m, idx) => {
              if (globalLockedMap.has(m.fixture.id)) {
                lockedIndexes.add(idx);
              }
            });

            return (
              <LeagueGroup
                key={leagueId}
                leagueName={league.name}
                leagueLogo={league.logo}
                countryFlag={league.flag}
                countryName={league.country}
                matches={league.matches}
                lockedIndexes={lockedIndexes}
              />
            );
          })}
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
          <button
            className="btn btn-sm btn-ghost"
            disabled={currentPage === 1 || isPending}
            onClick={() => goToPage(currentPage - 1)}
          >
            ←
          </button>

          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-text-light/40">
                …
              </span>
            ) : (
              <button
                key={p}
                className={`btn btn-sm ${p === currentPage
                  ? "btn-primary"
                  : "btn-ghost"
                  }`}
                disabled={isPending}
                onClick={() => goToPage(p as number)}
              >
                {p}
              </button>
            )
          )}

          <button
            className="btn btn-sm btn-ghost"
            disabled={currentPage === totalPages || isPending}
            onClick={() => goToPage(currentPage + 1)}
          >
            →
          </button>
        </div>
      )}

      {isPending && (
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner loading-md text-primary" />
        </div>
      )}
    </div>
  );
}
