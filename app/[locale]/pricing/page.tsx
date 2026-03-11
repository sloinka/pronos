"use client";

import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const plans = [
  {
    key: "weekly" as const,
    price: 4.99,
    intervalKey: "perWeek" as const,
  },
  {
    key: "monthly" as const,
    price: 12.99,
    intervalKey: "perMonth" as const,
  },
  {
    key: "yearly" as const,
    price: 89.99,
    intervalKey: "perYear" as const,
    highlighted: true,
  },
];

const featureKeys = [
  "allMatches",
  "fullDetails",
  "aiPreviews",
  "aiSimulations",
  "unlimited",
] as const;

export default function PricingPage() {
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
      window.location.href = "/auth/signin";
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
    <div className="max-w-5xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-text-light/60">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={`card bg-surface border ${
              plan.highlighted
                ? "border-primary shadow-lg shadow-primary/10"
                : "border-white/5"
            } relative`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="badge badge-primary">{t("bestValue")}</span>
              </div>
            )}
            <div className="card-body p-6 text-center">
              <h2 className="text-xl font-bold">{t(plan.key)}</h2>
              <div className="my-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-text-light/50">{t(plan.intervalKey)}</span>
              </div>

              <ul className="space-y-2 text-sm text-left mb-6">
                {featureKeys.map((fk) => (
                  <li key={fk} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t(`features.${fk}`)}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.key)}
                disabled={loading === plan.key}
                className={`btn w-full ${
                  plan.highlighted ? "btn-primary" : "btn-outline"
                }`}
              >
                {loading === plan.key ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  t("choosePlan")
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
