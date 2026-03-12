"use client";

import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link } from "@/i18n/routing";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("common");
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-primary/20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl font-bold">bolt</span>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{t("appName")}</span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-semibold text-primary"
            >
              {t("home")}
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
            >
              {t("pricing")}
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            {session?.user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm font-medium text-slate-600 dark:text-slate-300">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-bold px-4 py-2 hover:text-primary transition-colors"
                >
                  {t("signOut")}
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className="text-sm font-bold px-4 py-2 hover:text-primary transition-colors"
                >
                  {t("signIn")}
                </Link>
                <Link
                  href="/pricing"
                  className="bg-primary text-background-dark px-5 py-2 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 transition-all"
                >
                  {t("subscribeText")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
