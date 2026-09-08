import "@/styles/globals.css";

import {
  fontBricolageGrotesque as fontBricolage,
  fontSourceSans,
  fontSourceSerif,
  fontWorkSans,
} from "@/assets/fonts";

import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Toaster } from "@/components/ui/sonner";
import { constructMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";

export const metadata = constructMetadata();

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          fontBricolage.className,
          // fontSourceSans.className,
          // fontSourceSerif.className,
          // fontWorkSans.className,
          fontSourceSerif.variable,
          fontSourceSans.variable,
          fontWorkSans.variable,
          fontBricolage.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          {/* https://sonner.emilkowal.ski/toaster */}
          <Toaster richColors position="top-right" offset={64} />

          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}
