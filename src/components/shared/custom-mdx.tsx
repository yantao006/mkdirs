import "@/styles/mdx.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Sanity content is Markdown, never executable MDX or arbitrary HTML. */
export function CustomMdx({
  source,
}: { source?: string; components?: Record<string, unknown> }) {
  if (!source?.trim()) {
    return (
      <p className="text-muted-foreground">
        No additional description yet. Visit the official website for
        documentation.
      </p>
    );
  }
  return (
    <article className="prose prose-violet dark:prose-invert max-w-none break-words">
      <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
        {source}
      </ReactMarkdown>
    </article>
  );
}
