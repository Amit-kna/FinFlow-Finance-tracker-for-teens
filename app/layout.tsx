import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/components/AuthProvider";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { NavigationProvider } from "@/components/NavigationProvider";
import BottomNav from "@/components/BottomNav";
import SidebarWrapper from "@/components/SidebarWrapper";
import AuthGuard from "@/components/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinFlow - Teen Money Tracker",
  description: "Track what you earn, set savings goals, and climb the Money Score ladder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} pb-20 md:pb-0`}>
        <CurrencyProvider>
          <AuthProvider>
            <NavigationProvider>
              <SidebarWrapper />
              <AuthGuard>
                {children}
              </AuthGuard>
              <BottomNav />
            </NavigationProvider>
          </AuthProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
