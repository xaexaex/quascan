import type { Metadata } from "next";
import { Inter, Syne, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://scan.quantachain.org"),
  title: "QuaScan | Quantum-Resistant Blockchain Explorer",
  description: "Real-time blockchain explorer for the quantum-resistant Quanta network. View blocks, transactions, mempool, and network statistics.",
  keywords: ["quanta", "blockchain", "explorer", "quascan", "quantum-resistant", "pqc"],
  authors: [{ name: "QuantaChain Team" }],
  openGraph: {
    title: "QuaScan | Quantum-Resistant Blockchain Explorer",
    description: "Real-time blockchain explorer for the quantum-resistant Quanta network. View blocks, transactions, mempool, and network statistics.",
    url: "https://scan.quantachain.org",
    siteName: "QuaScan",
    images: [
      {
        url: "/seo/image.png",
        width: 1200,
        height: 630,
        alt: "QuaScan Explorer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuaScan | Quantum-Resistant Blockchain Explorer",
    description: "Real-time blockchain explorer for the quantum-resistant Quanta network.",
    images: ["/seo/image.png"],
    creator: "@quantachain",
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${syne.variable} ${jetbrains.variable} antialiased min-h-screen flex flex-col font-sans`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="flex-grow pt-20">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

