import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Game Night Planner",
  description:
    "Plan your weekly board game night around who's coming and how much time you have.",
};

/** Wraps every page with the html and body tags, fonts and global styles. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* Lets keyboard users jump past the header straight to the page content. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:font-semibold focus:text-paper"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
