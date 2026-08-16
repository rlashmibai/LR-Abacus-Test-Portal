import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { BRAND_NAME } from "@/lib/brand";
import ClickSound from "@/components/ClickSound";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: `${BRAND_NAME} - free timed abacus mental-math practice tests for kids.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClickSound />
        {children}
      </body>
    </html>
  );
}
