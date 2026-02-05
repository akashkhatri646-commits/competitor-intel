import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar, TopBar } from "@/components/ui";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "AcmeCloud Intel | Competitor Intelligence",
  description: "AI-powered competitor monitoring and insights platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="antialiased">
        <Sidebar />
        <TopBar />
        {children}
      </body>
    </html>
  );
}
