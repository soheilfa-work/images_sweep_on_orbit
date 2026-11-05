import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "City Arc",
  description:
    "Eleven city skylines ride a circle as you scroll. The first closes onto the arc, and the last straightens and opens to the edges of the screen.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${syne.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
