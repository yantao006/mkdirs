import type { SiteConfig } from "@/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://mkdirs.yantao006.workers.dev";

export const siteConfig: SiteConfig = {
  name: "mkdirs",
  tagline: "Useful tools and resources for building on the web.",
  description:
    "Explore a curated starter directory of developer tools, documentation, frameworks, and testing resources. Browse by category, tag, or collection.",
  keywords: [
    "developer tools",
    "web resources",
    "directory",
    "documentation",
    "frameworks",
  ],
  author: "mkdirs directory",
  url: SITE_URL,
  logo: "/directory-mark.svg",
  image: `${SITE_URL}/directory-og.png`,
  mail: "",
  utm: { source: "", medium: "", campaign: "" },
  links: { github: "https://github.com/yantao006/mkdirs" },
};
