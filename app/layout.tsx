import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Altitude Stairway Designer",
  description:
    "Enter two numbers about your space and see a live, code-compliant staircase in 3D — then request a quote.",
};

export const viewport: Viewport = {
  themeColor: "#fdfcfb",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
