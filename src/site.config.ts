/**
 * Single source of truth for site-wide copy. Edit here — everywhere this
 * data appears in the UI reads from this file.
 */
export const siteConfig = {
  name: "Personal Journal",
  authorName: "Viet Anh",
  authorBio: "Solo developer, writing about what I build",
  description:
    "A behind-the-scenes coding journal — projects, tips, and what I'm learning.",
  url: "https://example.com",
  subscribe: {
    headline: "Join me on a behind-the-scenes coding journey.",
    subtext: "Weekly-ish updates on projects, tips, and what I'm learning.",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "All posts", href: "/posts" },
    { label: "Courses", href: "/courses" },
    { label: "About", href: "/about" },
  ],
  footerTags: ["Tips", "Life", "Project"],
} as const;
