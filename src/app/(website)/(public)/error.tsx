"use client";

import Container from "@/components/container";
import { Button } from "@/components/ui/button";

export default function DirectoryError({
  reset,
}: { error: Error; reset: () => void }) {
  return (
    <Container className="py-20 text-center">
      <h1 className="text-2xl font-semibold">
        The directory could not be loaded
      </h1>
      <p className="mt-4 text-muted-foreground">
        The content service is temporarily unavailable. Your search is still in
        the address bar.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </Container>
  );
}
