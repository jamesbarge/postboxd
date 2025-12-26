import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Cormorant } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Postboxd - London Cinema Calendar",
  description:
    "The definitive cinema calendar for London cinephiles. Never miss a screening at BFI, Prince Charles, ICA, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} ${cormorant.variable} antialiased bg-background-primary text-text-primary`}
      >
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#1E3A5F",
              colorText: "#1A1A1A",
              colorTextSecondary: "#4A4A4A",
              colorBackground: "#FFFFFF",
              colorInputBackground: "#EDE8DD",
              colorInputText: "#1A1A1A",
              borderRadius: "0.5rem",
            },
          }}
        >
          <Providers>{children}</Providers>
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
