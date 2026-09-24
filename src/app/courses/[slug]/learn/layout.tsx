import type { Metadata } from "next";
import "../../../globals.css";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: {
    default: "Learn",
    template: `%s — Learn — ${siteConfig.name}`,
  },
  robots: { index: false, follow: false },
};

/** Root layout for /courses/[slug]/learn — deliberately separate from the
 * public site's ((site)/layout.tsx): the learn screen is a full-height
 * two-pane app view with no Header/SubscribeStrip/Footer, same pattern
 * admin/layout.tsx already uses to opt /admin out of the site chrome. */
export default function LearnRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full w-full">{children}</body>
    </html>
  );
}
