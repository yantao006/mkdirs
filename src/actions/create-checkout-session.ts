"use server";

import { getItemById } from "@/data/item";
import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { allowedPrice } from "@/lib/payment-policy";
import { serviceConfigured } from "@/lib/service-config";
import { getStripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { sanityClient } from "@/sanity/lib/private-client";

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
  stripeUrl?: string;
};

export async function createCheckoutSession(
  itemId: string,
  priceId: string,
  pricePlan: string,
): Promise<ServerActionResponse> {
  let redirectUrl: string;
  try {
    const user = await currentUser();
    if (!user?.id || !user.email)
      return { status: "error", message: "Unauthorized" };
    if (!serviceConfigured("payment")) {
      return {
        status: "error",
        message: "Payments are awaiting this site's Stripe configuration",
      };
    }
    if (!allowedPrice(pricePlan, priceId)) {
      return {
        status: "error",
        message: "This payment plan is not configured",
      };
    }
    const item = await getItemById(itemId);
    const owner = await getUserById(user.id);
    if (!item || item.submitter?._ref !== user.id || !owner) {
      return { status: "error", message: "Item not found or not owned by you" };
    }
    const stripe = getStripe();
    if (item.paid) {
      if (!owner.stripeCustomerId)
        return { status: "error", message: "Billing account unavailable" };
      const portal = await stripe.billingPortal.sessions.create({
        customer: owner.stripeCustomerId,
        return_url: absoluteUrl("/dashboard"),
      });
      redirectUrl = portal.url;
    } else {
      const price = await stripe.prices.retrieve(priceId);
      if (!price.active || price.type !== "one_time" || !price.unit_amount) {
        return {
          status: "error",
          message: "This price is not available for purchase",
        };
      }
      let customerId = owner.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create(
          { email: user.email, metadata: { userId: user.id } },
          { idempotencyKey: `mkdirs-customer-${user.id}` },
        );
        await sanityClient
          .patch(user.id)
          .set({ stripeCustomerId: customer.id })
          .commit();
        customerId = customer.id;
      }
      const session = await stripe.checkout.sessions.create(
        {
          customer: customerId,
          mode: "payment",
          line_items: [{ price: priceId, quantity: 1 }],
          metadata: { userId: user.id, itemId, priceId, pricePlan },
          success_url: absoluteUrl(
            `/publish/${encodeURIComponent(itemId)}?pay=success`,
          ),
          cancel_url: absoluteUrl(
            `/payment/${encodeURIComponent(itemId)}?pay=failed`,
          ),
          billing_address_collection: "auto",
          // Repeated requests for the same item revision reuse one checkout session.
        },
        {
          idempotencyKey: `mkdirs-checkout-${item._id}-${item._rev}-${priceId}`,
        },
      );
      redirectUrl = session.url;
    }
    if (!redirectUrl)
      return {
        status: "error",
        message: "Stripe did not return a checkout URL",
      };
  } catch {
    return {
      status: "error",
      message:
        "Unable to open payment. No publication status has been changed.",
    };
  }
  return { status: "success", stripeUrl: redirectUrl };
}
