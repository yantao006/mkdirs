import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";

/** Generic directory mark, not the upstream Mkdirs trademark logo. */
export function Logo({ className }: { className?: string }) {
  return (
    <FolderOpen
      aria-hidden="true"
      className={cn("size-8 text-primary", className)}
    />
  );
}
