import type { FooterConfig } from "@/types";

export const footerConfig: FooterConfig = {
  links: [
    {
      title: "Explore",
      items: [
        { title: "All resources", href: "/" },
        { title: "Search", href: "/search" },
        { title: "Collections", href: "/collection" },
      ],
    },
    {
      title: "Browse",
      items: [
        { title: "Categories", href: "/category" },
        { title: "Tags", href: "/tag" },
      ],
    },
    {
      title: "Project",
      items: [
        {
          title: "Source & updates",
          href: "https://github.com/yantao006/mkdirs",
          external: true,
        },
        { title: "Content editor", href: "/studio" },
      ],
    },
  ],
};
