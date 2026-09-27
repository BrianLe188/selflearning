import type { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";
import { getAllPosts } from "@/lib/posts";
import { getCoursesByTrack } from "@/lib/courses";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tracks] = await Promise.all([
    getAllPosts(),
    getCoursesByTrack(),
  ]);
  const courses = tracks.flatMap((track) => track.courses);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteConfig.url}/posts`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/courses`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/courses/search`,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/about`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/posts/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${siteConfig.url}/courses/${course.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes, ...courseRoutes];
}
