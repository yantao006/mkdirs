import Link from "next/link";

export default function EmptyGrid() {
  return (
    <div
      className="my-12 flex flex-col items-center gap-3 text-center"
      aria-live="polite"
    >
      <h2 className="text-xl font-semibold">No matching resources</h2>
      <p className="text-muted-foreground">
        Try a different search or clear your filters.
      </p>
      <Link
        href="/"
        className="font-medium text-primary underline underline-offset-4"
      >
        Browse all resources
      </Link>
    </div>
  );
}
