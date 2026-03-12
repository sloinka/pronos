"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  tr: "Türkçe",
  fr: "Français",
  it: "Italiano",
  es: "Español",
  el: "Ελληνικά",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-primary/10 text-slate-600 dark:text-slate-300">
      <span className="material-symbols-outlined text-lg">language</span>
      <select
        value={locale}
        onChange={onSelectChange}
        className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer p-0 pr-6 uppercase appearance-none"
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc} className="bg-white dark:bg-background-dark text-slate-900 dark:text-white">
            {loc}
          </option>
        ))}
      </select>
    </div>
  );
}
