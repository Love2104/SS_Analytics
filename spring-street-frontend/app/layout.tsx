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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        {/* Prevent theme flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var s=t==='system'||!t?window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light':t;document.documentElement.setAttribute('data-theme',s)}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
