import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Hind_Siliguri } from "next/font/google";
import "./globals.css";

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
  title: "RoyalConsortium Portal | Admin & Dealer Management",
  description: "Secure management portal for RoyalConsortium dealers and staff.",
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} ${hindSiliguri.variable} font-sans antialiased bg-[#0D0D0F] text-[#F8F8F8]`}>
        {children}
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
