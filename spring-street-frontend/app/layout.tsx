import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spring Street | Market Intelligence Platform",
  description:
    "Professional-grade portfolio analytics, market insights, and performance attribution for modern investors.",
  keywords: "portfolio analytics, market intelligence, stock analysis, fintech, investment dashboard",
  authors: [{ name: "Spring Street" }],
  openGraph: {
    title: "Spring Street Market Intelligence",
    description: "Portfolio analytics and market insights for discerning investors.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
