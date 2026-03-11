import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Tutor",
  description: "AI learning assistant for university students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-cream text-text-primary font-sans antialiased">{children}</body>
    </html>
  );
}
