import type { Order } from "@/sanity.types";
import { privateFetch } from "@/sanity/lib/private-client";

export const getOrderByUserIdAndItemId = (userId: string, itemId: string) =>
  privateFetch<Order | null>({
    query:
      '*[_type == "order" && _id in path("mkdirsPrivate.order.*") && user._ref == $userId && item._ref == $itemId][0]',
    params: { userId, itemId },
  });
