import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RoyalConsortium | Bangladesh's Premier Bike Marketplace",
  description: "Experience excellence in motorcycle trading. Verified dealers, premium bikes, and seamless bKash payments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} ${hindSiliguri.variable} font-sans antialiased bg-[#0D0D0F] text-[#F8F8F8]`}>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
