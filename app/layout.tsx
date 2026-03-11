import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pronos.io — AI Football Predictions",
  description: "AI-powered football match predictions and simulations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
