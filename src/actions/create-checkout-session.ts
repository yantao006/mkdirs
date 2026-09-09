"use server";

import { getItemById } from "@/data/item";
import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import {
  checkoutFailureMessage,
  checkoutIdempotencyKey,
  checkoutPaymentOptions,
} from "@/lib/checkout-policy";
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
  let stage = "auth";
  try {
    const user = await currentUser();
    if (!user?.id || !user.email)
      return { status: "error", message: "Unauthorized" };
    stage = "service configuration";
    if (!serviceConfigured("payment")) {
      return {
        status: "error",
        message: "Payments are awaiting this site's Stripe configuration",
      };
    }
    stage = "price allowlist";
    if (!allowedPrice(pricePlan, priceId)) {
      return {
        status: "error",
        message: "This payment plan is not configured",
      };
    }
    stage = "item lookup";
    const item = await getItemById(itemId);
    stage = "owner lookup";
    const owner = await getUserById(user.id);
    if (!item || item.submitter?._ref !== user.id || !owner) {
      return { status: "error", message: "Item not found or not owned by you" };
    }
    stage = "Stripe initialization";
    const stripe = getStripe();
    if (item.paid) {
      if (!owner.stripeCustomerId)
        return { status: "error", message: "Billing account unavailable" };
      stage = "billing portal";
      const portal = await stripe.billingPortal.sessions.create({
        customer: owner.stripeCustomerId,
        return_url: absoluteUrl("/dashboard"),
      });
      redirectUrl = portal.url;
    } else {
      stage = "prices.retrieve";
      const price = await stripe.prices.retrieve(priceId);
      if (!price.active || price.type !== "one_time" || !price.unit_amount) {
        return {
          status: "error",
          message: "This price is not available for purchase",
        };
      }
      let customerId = owner.stripeCustomerId;
      if (!customerId) {
        stage = "customers.create";
        const customer = await stripe.customers.create(
          { email: user.email, metadata: { userId: user.id } },
          { idempotencyKey: `mkdirs-customer-${user.id}` },
        );
        stage = "save billing customer";
        await sanityClient
          .patch(user.id)
          .set({ stripeCustomerId: customer.id })
          .commit();
        customerId = customer.id;
      }
      stage = "checkout.sessions.create";
      const session = await stripe.checkout.sessions.create(
        {
          customer: customerId,
          mode: "payment",
          // Keep ordinary Checkout independent of the merchant's Managed Payments
          // default. The pinned Stripe SDK predates this supported API parameter.
          ...checkoutPaymentOptions,
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
          idempotencyKey: checkoutIdempotencyKey(item._id, item._rev, priceId),
        },
      );
      redirectUrl = session.url;
    }
    if (!redirectUrl)
      return {
        status: "error",
        message: "Stripe did not return a checkout URL",
      };
  } catch (error) {
    return {
      status: "error",
      message: checkoutFailureMessage(stage, error),
    };
  }
  return { status: "success", stripeUrl: redirectUrl };
}
