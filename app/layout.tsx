import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const viewport = {
  themeColor: "#F8FAFC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.quascan.xyz"),
  title: "QuaScan | QuantaChain Block Explorer | Post-Quantum Blockchain",
  description: "Explore blocks, transactions, and validators on QuantaChain — the world's first Falcon-512 secured post-quantum blockchain. Built for AI agents, DePIN, and M2M.",
  keywords: ["post-quantum blockchain", "Falcon-512 blockchain", "quantum-safe blockchain explorer", "quanta", "blockchain", "explorer", "quascan", "ai", "depin", "m2m"],
  authors: [{ name: "QuantaChain Team" }],
  openGraph: {
    title: "QuaScan | QuantaChain Block Explorer | Post-Quantum Blockchain",
    description: "Explore blocks, transactions, and validators on QuantaChain — the world's first Falcon-512 secured post-quantum blockchain. Built for AI agents, DePIN, and M2M.",
    url: "https://www.quascan.xyz",
    siteName: "QuaScan",
    images: [{ url: "/seo/image.png", width: 1200, height: 630, alt: "QuaScan Explorer" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuaScan | QuantaChain Block Explorer | Post-Quantum Blockchain",
    description: "Explore blocks, transactions, and validators on QuantaChain — the world's first Falcon-512 secured post-quantum blockchain.",
    images: ["/seo/image.png"],
    creator: "@quantachain",
  },
  icons: { icon: "/favicon.svg" },
  manifest: "/site.webmanifest",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Inter (sans) + JetBrains Mono (mono) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Anti-flash: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('qsTheme');if(t==='light'){document.documentElement.setAttribute('data-theme','light')}else{document.documentElement.removeAttribute('data-theme')}}catch(e){}})()`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Navbar />
        <main style={{ paddingTop: "64px" }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
