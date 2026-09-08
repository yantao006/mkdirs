import { EditForm } from "@/components/edit/edit-form";
import { siteConfig } from "@/config/site";
import { currentUser } from "@/lib/auth";
import { constructMetadata } from "@/lib/metadata";
import type {
  CategoryListQueryResult,
  TagListQueryResult,
} from "@/sanity.types";
import { privateFetch as sanityFetch } from "@/sanity/lib/private-client";
import {
  categoryListQuery,
  itemFullInfoByIdQuery,
  tagListQuery,
} from "@/sanity/lib/queries";
import type { ItemFullInfo } from "@/types";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata | undefined> {
  const params = await paramsPromise;

  return constructMetadata({
    title: "Edit product information",
    description: "Edit product information",
    canonicalUrl: `${siteConfig.url}/edit/${params.id}`,
  });
}

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({
  params: paramsPromise,
}: EditPageProps) {
  const params = await paramsPromise;

  const user = await currentUser();
  if (!user) {
    console.error("EditPage, user not found");
    return redirect("/auth/login");
  }

  const [item, categoryList, tagList] = await Promise.all([
    sanityFetch<ItemFullInfo>({
      query: itemFullInfoByIdQuery,
      params: { id: params.id },
    }),
    sanityFetch<CategoryListQueryResult>({
      query: categoryListQuery,
    }),
    sanityFetch<TagListQueryResult>({
      query: tagListQuery,
    }),
  ]);

  if (!item) {
    console.error("EditPage, item not found");
    return notFound();
  }
  // redirect to dashboard if the item is not submitted by the user
  if (item.submitter._id !== user.id) {
    console.error("EditPage, user not match");
    return redirect("/dashboard");
  }

  return <EditForm item={item} tagList={tagList} categoryList={categoryList} />;
}
