import { priceConfig } from "@/config/price";
import { stripeAmount } from "@/lib/payment-policy";
import { serviceConfigured } from "@/lib/service-config";
import { getStripe } from "@/lib/stripe";
import type { PricePlan } from "@/types";

export async function getPricingPlans(): Promise<PricePlan[]> {
  if (!serviceConfigured("payment")) return priceConfig.plans;
  return Promise.all(
    priceConfig.plans.map(async (plan) => {
      if (!plan.stripePriceId) return plan;
      try {
        const price = await getStripe().prices.retrieve(plan.stripePriceId);
        if (
          !price.active ||
          price.type !== "one_time" ||
          price.unit_amount === null
        )
          return plan;
        return {
          ...plan,
          price: stripeAmount(price.unit_amount, price.currency),
          currency: price.currency,
        };
      } catch {
        return plan;
      }
    }),
  );
}
