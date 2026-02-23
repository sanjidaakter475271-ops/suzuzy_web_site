import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Hind_Siliguri, Roboto, Inter } from "next/font/google";
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

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RoyalConsortium Portal | Admin & Dealer Management",
  description: "Secure management portal for RoyalConsortium dealers and staff.",
};

import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} ${hindSiliguri.variable} ${roboto.variable} ${inter.variable} font-sans antialiased bg-[#0D0D0F] text-[#F8F8F8]`}>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
