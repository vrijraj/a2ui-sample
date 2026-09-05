import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "A2UI Next.js Example",
  description:
    "Next.js A2UI demo with Google-style CSS and shadcn/ui — agent-driven restaurant booking.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full font-sans", roboto.variable)}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
