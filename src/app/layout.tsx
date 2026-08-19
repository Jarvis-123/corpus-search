import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CorpusSearch — markdown FTS demo",
  description: "Keyword search over a markdown corpus with snippet UI. No LLM.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
