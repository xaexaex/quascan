import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
    <html lang="en" style={{ backgroundColor: '#ffffff' }}>
      <body
        className={`${manrope.variable} antialiased min-h-screen flex flex-col font-sans`}
        style={{ backgroundColor: '#ffffff', color: '#000000' }}
      >
        <Navbar />
        <main className="flex-grow pt-20 bg-white">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
