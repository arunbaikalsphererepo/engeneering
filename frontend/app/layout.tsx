import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Hotel Engineering | Asset & Maintenance Portal",
  description: "Professional hotel engineering asset management and maintenance operations platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
