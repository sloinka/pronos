"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";

const plans = [
  {
    key: "weekly" as const,
    price: "4.99",
    intervalKey: "perWeek" as const,
    icon: "calendar_view_week",
  },
  {
    key: "monthly" as const,
    price: "12.99",
    intervalKey: "perMonth" as const,
    icon: "calendar_month",
    highlighted: true,
    advantageKey: "advantageMonthly",
  },
  {
    key: "yearly" as const,
    price: "89.99",
    intervalKey: "perYear" as const,
    icon: "workspace_premium",
    savePercentage: 42,
    advantageKey: "advantageYearly",
  },
];

const featureKeys = [
  "allMatches",
  "fullDetails",
  "aiPreviews",
  "aiSimulations",
  "unlimited",
] as const;

function PricingContent() {
  const t = useTranslations("pricing");
  const { data: session } = useSession();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true" && !verified) {
      fetch("/api/stripe/verify", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.active) {
            setVerified(true);
            window.location.href = `/${locale}`;
          }
        });
    }
  }, [searchParams, verified, locale]);

  async function handleCheckout(plan: string) {
    if (!session) {
      window.location.href = `/${locale}/auth/signin`;
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, locale }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#021610] text-white selection:bg-[#00f59b] selection:text-[#021610]">
      <div className="max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-20 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            {t("subtitle")}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, idx) => (idx === 0 || idx === 1 || idx === 2) && (
            <div
              key={plan.key}
              className={`relative flex flex-col p-8 rounded-[2rem] transition-all duration-500 hover:translate-y-[-4px] border ${plan.highlighted
                ? "bg-[#021610] border-[#00f59b] scale-105 z-10 shadow-[0_0_30px_rgba(0,245,155,0.15)]"
                : "bg-[#0a201c]/40 border-white/5 hover:border-white/20"
                }`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00f59b] text-[#021610] px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,245,155,0.3)]">
                  {t("mostPopular")}
                </div>
              )}

              {plan.savePercentage && (
                <div className="absolute top-8 right-8 bg-[#f59e0b]/20 text-[#f59e0b] px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-[#f59e0b]/30">
                  {t("savePercentage", { percentage: plan.savePercentage })}
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">{t(plan.key)}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white">
                    ${plan.price}
                  </span>
                  <span className="text-slate-400 text-sm font-medium">{t(plan.intervalKey)}</span>
                </div>
                {plan.advantageKey && (
                  <p className="mt-3 text-xs font-bold text-[#00f59b] antialiased">
                    {t(plan.advantageKey)}
                  </p>
                )}
              </div>

              <div className="mb-8 p-0.5">
                <button
                  onClick={() => handleCheckout(plan.key)}
                  disabled={loading === plan.key}
                  className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] ${plan.highlighted
                    ? "bg-[#00f59b] text-[#021610] hover:bg-[#00e08b] hover:shadow-[0_0_20px_rgba(0,245,155,0.4)]"
                    : "bg-[#00f59b] text-[#021610] hover:bg-[#00e08b]"
                    } disabled:opacity-50`}
                >
                  {loading === plan.key ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#021610] border-t-transparent rounded-full animate-spin"></div>
                      {t("choosePlan")}...
                    </span>
                  ) : (
                    t("choosePlan")
                  )}
                </button>
              </div>

              <ul className="flex-1 space-y-4 mb-2">
                {featureKeys.map((fk) => (
                  <li key={fk} className="flex items-center gap-3">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-[#00f59b] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] font-black text-[#021610]">
                        check
                      </span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {t(`features.${fk}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Methods Footer */}
        <div className="mt-24 flex flex-col items-center gap-6 animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined text-xl">lock</span>
            <span className="text-sm font-medium">{t("securePayment")}</span>
          </div>
          <p className="text-slate-500 text-[13px]">{t("cancelAnytime")}</p>

          <div className="flex items-center gap-4 py-4 grayscale opacity-40">
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <span className="material-symbols-outlined text-2xl mt-2">credit_card</span>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <span className="material-symbols-outlined text-2xl mt-2">payments</span>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <span className="material-symbols-outlined text-2xl mt-2">account_balance_wallet</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#021610] flex items-center justify-center text-[#00f59b]">Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
}
