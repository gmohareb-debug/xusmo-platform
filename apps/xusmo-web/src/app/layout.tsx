import type { Metadata } from "next";
import { displayFont, bodyFont } from "@/lib/design/fonts";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Xusmo — Free AI Website Builder | Professional Websites in Minutes",
  description:
    "AI builds your professional website for free. Tell us about your business and get a custom WordPress site in minutes. Go live with hosting for $11.99/mo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
