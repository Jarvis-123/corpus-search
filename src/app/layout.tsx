import "@/app/globals.css";
import type { Metadata } from "next";
import { site } from "@/lib/site";

const ogImageUrl = `${site.siteUrl}${site.ogImagePath}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: site.ogTitle,
  description: site.description,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: site.siteUrl,
    title: site.ogTitle,
    description: site.ogDescription,
    siteName: site.title,
    images: [
      {
        url: ogImageUrl,
        width: site.ogImageWidth,
        height: site.ogImageHeight,
        alt: site.title,
        type: site.ogImageType,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.ogTitle,
    description: site.ogDescription,
    images: [ogImageUrl],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
