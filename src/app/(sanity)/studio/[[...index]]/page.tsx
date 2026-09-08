"use client";

import dynamic from "next/dynamic";

// Studio authenticates directly with Sanity. Do not initialize its editor stack
// in the public Worker's request path or include it in the server bundle.
const Studio = dynamic(() => import("@/components/studio"), {
  ssr: false,
  loading: () => <p className="p-8">Loading mkdirs content editor…</p>,
});

export default function StudioPage() {
  return <Studio />;
}
