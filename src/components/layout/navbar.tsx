"use client";

import Container from "@/components/container";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { DashboardConfig, MarketingConfig } from "@/types";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ModeToggle } from "./mode-toggle";

export function Navbar({
  config,
}: { scroll?: boolean; config: DashboardConfig | MarketingConfig }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (pathname) setOpen(false);
  }, [pathname]);
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="mkdirs home"
        >
          <Logo />
          <span className="text-xl font-bold">{siteConfig.name}</span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center gap-6"
        >
          {config.menus.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
              className={cn(
                "text-base hover:text-primary",
                active(item.href) ? "font-semibold" : "text-muted-foreground",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <MenuIcon className="size-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle>mkdirs navigation</SheetTitle>
              <nav
                aria-label="Mobile navigation"
                className="mt-8 flex flex-col gap-2"
              >
                {config.menus.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (pathname === item.href) setOpen(false);
                    }}
                    aria-current={active(item.href) ? "page" : undefined}
                    className={cn(
                      "rounded-md p-3 hover:bg-muted",
                      active(item.href) && "bg-muted font-semibold",
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
