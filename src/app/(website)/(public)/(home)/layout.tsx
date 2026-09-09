import Container from "@/components/container";
import { HomeCategoryList } from "@/components/home/home-category-list";
import HomeHero from "@/components/home/home-hero";
import { HomeSearchFilter } from "@/components/home/home-search-filter";
import { NewsletterCard } from "@/components/newsletter/newsletter-card";

export default function HomeLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <Container className="mt-12 mb-16 flex flex-col gap-12">
      <HomeHero />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* left sidebar: category list */}
        <div className="hidden lg:block w-[220px] flex-shrink-0">
          <div className="sticky top-24">
            <HomeCategoryList urlPrefix="/" />
          </div>
        </div>

        {/* right content: item grid */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-8">
            <HomeSearchFilter urlPrefix="/" />
            {children}
          </div>
        </div>
      </div>

      <NewsletterCard />
    </Container>
  );
}
