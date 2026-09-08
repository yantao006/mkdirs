import Container from "@/components/container";
import HomeHeroSponsor from "@/components/home3/home3-hero-sponsor";
import { HomeSearchFilter } from "@/components/home3/home3-search-filter";
import { NewsletterCard } from "@/components/newsletter/newsletter-card";

export default function HomeLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <Container className="mt-12 mb-16 flex flex-col gap-12">
      <HomeHeroSponsor />

      <div className="flex flex-col gap-8">
        <HomeSearchFilter urlPrefix="/home3" />

        {children}
      </div>

      <NewsletterCard />
    </Container>
  );
}
