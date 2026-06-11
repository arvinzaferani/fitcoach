import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitCoach",
  description: "پلتفرم مدیریت تمرینات بین مربی و ورزشکار",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen font-vazir antialiased">{children}</body>
    </html>
  );
}
