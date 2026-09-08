import { CustomMdx } from "@/components/shared/custom-mdx";
import { siteConfig } from "@/config/site";
import { portableTextToMarkdown } from "@/lib/mdx";
import { constructMetadata } from "@/lib/metadata";
import type { PageQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { pageQuery } from "@/sanity/lib/queries";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const params = await paramsPromise;

  const page = await sanityFetch<PageQueryResult>({
    query: pageQuery,
    params: { slug: params.slug },
  });
  if (!page) notFound();

  return constructMetadata({
    title: page.title,
    description: page.excerpt,
    canonicalUrl: `${siteConfig.url}/${params.slug}`,
  });
}

interface CustomPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CustomPage({
  params: paramsPromise,
}: CustomPageProps) {
  const params = await paramsPromise;

  console.log(`CustomPage, params: ${JSON.stringify(params)}`);
  const page = await sanityFetch<PageQueryResult>({
    query: pageQuery,
    params: { slug: params.slug },
  });

  if (!page) {
    return notFound();
  }

  console.log(`CustomPage, page title: ${page.title}`);
  // console.log('CustomPage, page body: ', page.body);
  const markdownContent = portableTextToMarkdown(page.body);
  // console.log("markdownContent", markdownContent);

  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <h1 className="inline-block text-2xl font-bold">{page.title}</h1>
        {page.excerpt && (
          <p className="mt-4 text-lg text-muted-foreground">{page.excerpt}</p>
        )}
      </div>
      <hr className="my-4" />
      <article className="">
        {markdownContent && <CustomMdx source={markdownContent} />}
      </article>
    </div>
  );
}
