import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/ui/Navbar";
import SubscriptionBanner from "@/components/ui/SubscriptionBanner";

import { auth } from "@/lib/auth";
import { isUserSubscribed } from "@/lib/subscription";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;
  const session = await auth();
  let subscribed = false;
  if (session?.user?.id) {
    subscribed = await isUserSubscribed(session.user.id);
  }

  return (
    <html lang={locale} data-theme="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-900 dark:text-slate-100 font-display">
        <SessionProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Navbar />
            {children}
            {!subscribed && <SubscriptionBanner />}
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
