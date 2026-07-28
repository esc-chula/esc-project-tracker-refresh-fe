import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-sans-thai"
});

export const metadata: Metadata = {
  title: "ESC Project Tracker",
  description: "ESC Project Tracker",
  icons: {
    icon: "/icons/esc-red.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ibmPlexSansThai.variable}>{children}</body>
    </html>
  );
}
