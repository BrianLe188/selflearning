import type { Metadata } from "next";
import "../globals.css";
import { Header } from "@/components/header";
import { SubscribeStrip } from "@/components/subscribe-strip";
import { Footer } from "@/components/footer";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

/** Root layout for the public site — one of two root layouts in this app,
 * the other being admin/layout.tsx. They share globals.css but render
 * completely separate chrome (site header/footer vs admin's own). */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full w-full flex-col">
        <Header />
        <main className="flex flex-grow flex-col">{children}</main>
        <SubscribeStrip />
        <Footer />
      </body>
    </html>
  );
}
