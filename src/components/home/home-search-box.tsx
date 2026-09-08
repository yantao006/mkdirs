"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";

export default function HomeSearchBox({ urlPrefix }: { urlPrefix: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams(searchParams);
    const value = String(form.get("q") || "").trim();
    if (value) params.set("q", value);
    else params.delete("q");
    params.delete("page");
    router.push(`${urlPrefix}?${params}`, { scroll: false });
  }
  return (
    <form
      action={urlPrefix}
      method="get"
      onSubmit={submit}
      aria-label="Search resources"
      className="mx-auto flex w-full max-w-2xl items-center"
    >
      {[...searchParams.entries()]
        .filter(([key]) => key !== "q" && key !== "page")
        .map(([key, value]) => (
          <input
            key={`${key}-${value}`}
            type="hidden"
            name={key}
            value={value}
          />
        ))}
      <Input
        key={query}
        name="q"
        type="search"
        aria-label="Search resources"
        placeholder="Search tools and resources"
        defaultValue={query}
        maxLength={200}
        autoComplete="off"
        className="h-12 min-w-0 flex-1 rounded-r-none text-base"
      />
      <Button type="submit" className="size-12 shrink-0 rounded-l-none">
        <SearchIcon className="size-5" aria-hidden="true" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  );
}
