import { heroConfig } from "@/config/hero";
import HomeSearchBox from "./home-search-box";

export default function HomeHero() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="max-w-5xl flex flex-col items-center text-center gap-8">
        {/* maybe font-sourceSans is better */}
        <h1 className="max-w-5xl font-bold text-balance text-3xl sm:text-4xl md:text-5xl">
          {heroConfig.title.first}{" "}
          <span className="text-gradient_indigo-purple font-bold">
            {heroConfig.title.second}
          </span>
        </h1>

        <p className="max-w-4xl text-balance text-muted-foreground sm:text-xl">
          {heroConfig.subtitle}
        </p>

        <div className="w-full">
          <HomeSearchBox urlPrefix="/" />
        </div>
      </div>
    </div>
  );
}
