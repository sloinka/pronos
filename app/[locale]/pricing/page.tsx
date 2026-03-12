"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";

const plans = [
  {
    key: "weekly" as const,
    price: 4.99,
    intervalKey: "perWeek" as const,
    icon: "calendar_view_week",
  },
  {
    key: "monthly" as const,
    price: 12.99,
    intervalKey: "perMonth" as const,
    icon: "calendar_month",
  },
  {
    key: "yearly" as const,
    price: 89.99,
    intervalKey: "perYear" as const,
    highlighted: true,
    icon: "workspace_premium",
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
    <main className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm">payments</span>
          Pricing Options
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Choose Your <span className="text-primary italic">Strategy</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={`relative flex flex-col p-8 rounded-2xl transition-all duration-300 ${
              plan.highlighted
                ? "bg-slate-900 text-white ring-4 ring-primary ring-opacity-50 transform scale-105 z-10"
                : "bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-primary/10"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-slate-900 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                {t("bestValue")}
              </div>
            )}
            
            <div className="mb-8">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                plan.highlighted ? "bg-primary text-slate-900" : "bg-primary/10 text-primary"
              }`}>
                <span className="material-symbols-outlined">{plan.icon}</span>
              </div>
              <h2 className="text-2xl font-black">{t(plan.key)}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className={`text-5xl font-black ${plan.highlighted ? "text-white" : "text-slate-900 dark:text-white"}`}>
                  ${plan.price}
                </span>
                <span className="text-slate-500 text-sm">{t(plan.intervalKey)}</span>
              </div>
            </div>

            <ul className="flex-1 space-y-4 mb-10">
              {featureKeys.map((fk) => (
                <li key={fk} className="flex items-start gap-3">
                  <span className={`material-symbols-outlined text-sm mt-0.5 ${
                    plan.highlighted ? "text-primary" : "text-primary"
                  }`}>
                    check_circle
                  </span>
                  <span className={`text-sm ${plan.highlighted ? "text-slate-300" : "text-slate-600 dark:text-slate-400"}`}>
                    {t(`features.${fk}`)}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout(plan.key)}
              disabled={loading === plan.key}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
                plan.highlighted
                  ? "bg-primary text-slate-900 hover:bg-primary/90 shadow-xl shadow-primary/20"
                  : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-lg"
              } disabled:opacity-50`}
            >
              {loading === plan.key ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                t("choosePlan")
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <p className="text-slate-500 text-sm">
          All plans include 24/7 AI-generated stats updates.
        </p>
      </div>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
}
