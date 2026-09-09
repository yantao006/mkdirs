import { siteConfig } from "@/config/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/api/", "/auth/", "/dashboard", "/submit"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
