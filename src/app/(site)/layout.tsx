import type { Metadata } from "next";
import "../globals.css";
import { auth } from "@/auth";
import { Header } from "@/components/header";
import { SubscribeStrip } from "@/components/subscribe-strip";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/site.config";

const title = `${siteConfig.authorName} - ${siteConfig.name}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: siteConfig.description,
  },
};

/**
 * Sitewide structured data: a Person for the author (who publishes both the
 * posts and the courses) and a WebSite entry with a sitelinks searchbox
 * pointing at the /posts search — matches PostsSearchInput's `?q=` param.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.authorName,
      description: siteConfig.authorBio,
      url: siteConfig.url,
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      author: { "@id": `${siteConfig.url}/#person` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteConfig.url}/posts?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

/** Root layout for the public site — one of two root layouts in this app,
 * the other being admin/layout.tsx. They share globals.css but render
 * completely separate chrome (site header/footer vs admin's own). */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  const user = session?.user
    ? { name: session.user.name ?? null, email: session.user.email ?? null }
    : null;

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full w-full flex-col">
        <JsonLd data={jsonLd} />
        <Header user={user} />
        <main className="flex flex-grow flex-col">{children}</main>
        <SubscribeStrip />
        <Footer />
      </body>
    </html>
  );
}
