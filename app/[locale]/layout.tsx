import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import { GlobalProvider } from "@/context/GlobalContext";
import { AppToastProvider } from "@/context/ToastContext";
import { getServerSession } from "@/lib/session";
import "../globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Economy and Fair Competition",
    template: "%s | Economy and Fair Competition",
  },
  description:
    "Firma internacional especializada en Comercio Exterior, Derecho Aduanero y Propiedad Intelectual e Industrial.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  if (!hasLocale(routing.locales, rawLocale)) {
    notFound();
  }

  const locale = rawLocale;
  const messages = await getMessages();
  const session = await getServerSession();

  return (
    <html lang={locale} className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg text-ink antialiased font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <GlobalProvider
            locale={locale}
            initialAdminSession={session ? { email: session.email } : null}
          >
            <AppToastProvider>{children}</AppToastProvider>
          </GlobalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
