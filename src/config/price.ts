import { PricePlans } from "@/lib/submission";
import type { PriceConfig } from "@/types";

// Paid amounts are read from this product's configured Stripe prices on the server.
// Do not publish the template author's prices or operating promises as our policy.
export const priceConfig: PriceConfig = {
  plans: [
    {
      title: PricePlans.FREE,
      description: "Submit for review",
      benefits: [
        "Submit a resource to the directory",
        "Manage your submission from your dashboard",
        "Publish after approval",
      ],
      limitations: ["Review is required before publication"],
      price: 0,
      priceSuffix: "",
      stripePriceId: null,
    },
    {
      title: PricePlans.PRO,
      description: "Paid submission",
      benefits: [
        "Complete payment through Stripe",
        "Featured directory placement after payment",
        "Choose when to publish after successful payment",
      ],
      limitations: [],
      price: null,
      priceSuffix: "",
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || null,
    },
    {
      title: PricePlans.SPONSOR,
      description: "Sponsored placement",
      benefits: [
        "Paid submission features",
        "Scheduled sponsored placement",
        "Manage the resource from your dashboard",
      ],
      limitations: [],
      price: null,
      priceSuffix: "",
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_SPONSOR_PRICE_ID || null,
    },
  ],
};
