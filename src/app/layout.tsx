import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ESC Project Tracker",
  description: "Revamped ESC Project Tracker"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
