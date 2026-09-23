import type { Metadata } from "next";
import "../globals.css";
import { siteConfig } from "@/site.config";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: `%s — Admin — ${siteConfig.name}`,
  },
  robots: { index: false, follow: false },
};

/** Root layout for /admin — deliberately separate from the public site's
 * (see (site)/layout.tsx): no Header/SubscribeStrip/Footer, just the same
 * design tokens via globals.css. Sign-in vs authenticated chrome is handled
 * one level down (admin/(protected)/layout.tsx). */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full w-full flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
