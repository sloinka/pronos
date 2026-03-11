"use client";

import { useTranslations } from "next-intl";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-bold text-red-400">{t("error")}</h2>
      <button onClick={reset} className="btn btn-primary btn-sm">
        Try again
      </button>
    </div>
  );
}
