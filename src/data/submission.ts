import { SUBMISSIONS_PER_PAGE } from "@/lib/constants";
import { normalizePage } from "@/lib/directory-query";
import type { SubmissionListQueryResult } from "@/sanity.types";
import { privateFetch } from "@/sanity/lib/private-client";
import { itemSimpleFields } from "@/sanity/lib/queries";

export async function getSubmissions({
  userId,
  currentPage,
}: {
  userId?: string;
  currentPage: number;
}) {
  if (!userId) throw new Error("Sign-in required");
  const start = (normalizePage(String(currentPage)) - 1) * SUBMISSIONS_PER_PAGE;
  const params = { userId, start, end: start + SUBMISSIONS_PER_PAGE };
  const filter =
    '_type == "item" && defined(slug.current) && submitter._ref == $userId';
  const [totalCount, submissions] = await Promise.all([
    privateFetch<number>({ query: `count(*[${filter}])`, params }),
    privateFetch<SubmissionListQueryResult>({
      query: `*[${filter}] | order(_createdAt desc, _id asc) [$start...$end] { ${itemSimpleFields} rejectionReason, "order": order-> }`,
      params,
    }),
  ]);
  return { totalCount, submissions };
}
