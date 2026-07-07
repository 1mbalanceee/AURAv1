import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "✦ AURA ✦ Tracker of Achievements",
  description: "Минималистичный мобильный трекер достижений и борьбы с обесцениванием в стиле дримкор/веб-панк.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aura Tracker",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09080f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09080f] text-[#f4f4f7] font-mono selection:bg-purple-500/30 selection:text-white">
        {/* Grain overlay */}
        <div className="grain-overlay" />
        
        {/* Scanlines for subtle retro vibe */}
        <div className="scanline-overlay" />
        
        {children}
      </body>
    </html>
  );
}
