import Container from "@/components/container";
import HomeHero from "@/components/home2/home2-hero";
import { NewsletterCard } from "@/components/newsletter/newsletter-card";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "",
  canonicalUrl: `${siteConfig.url}/`,
});

export default function HomeLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <Container className="mt-12 mb-16 flex flex-col gap-12">
      <HomeHero />

      {children}

      <NewsletterCard />
    </Container>
  );
}
