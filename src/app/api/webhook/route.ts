import { getItemById } from "@/data/item";
import { getUserById } from "@/data/user";
import { sendMessageToDiscord } from "@/lib/discord";
import { sendPaymentSuccessEmail } from "@/lib/mail";
import {
  allowedPrice,
  paymentOrderId,
  stripeAmount,
} from "@/lib/payment-policy";
import { serviceConfigured } from "@/lib/service-config";
import { getStripe } from "@/lib/stripe";
import { PricePlans, ProPlanStatus, SponsorPlanStatus } from "@/lib/submission";
import { readBoundedBody } from "@/lib/upload";
import { absoluteUrl } from "@/lib/utils";
import { sanityClient } from "@/sanity/lib/private-client";
import type Stripe from "stripe";

type PaymentRecord = {
  _id: string;
  emailNotifiedAt?: string;
  discordNotifiedAt?: string;
};

export async function POST(req: Request) {
  if (!serviceConfigured("payment"))
    return new Response("Payments awaiting configuration", { status: 503 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    const body = new TextDecoder().decode(
      await readBoundedBody(req, 1024 * 1024),
    );
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return new Response("Invalid webhook signature or payload", {
      status: 400,
    });
  }
  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return new Response(null, { status: 200 });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  // A completed checkout may still be awaiting an asynchronous payment.
  if (session.mode !== "payment" || session.payment_status !== "paid")
    return new Response(null, { status: 200 });
  try {
    const { userId, itemId, priceId, pricePlan } = session.metadata || {};
    if (!userId || !itemId || !allowedPrice(pricePlan, priceId)) {
      return new Response("Unrecognized product checkout", { status: 400 });
    }
    const [user, item, lines] = await Promise.all([
      getUserById(userId),
      getItemById(itemId),
      stripe.checkout.sessions.listLineItems(session.id, { limit: 2 }),
    ]);
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;
    if (
      !user ||
      !item ||
      item.submitter?._ref !== user._id ||
      user.stripeCustomerId !== customerId ||
      lines.has_more ||
      lines.data.length !== 1 ||
      lines.data[0].price?.id !== priceId ||
      lines.data[0].quantity !== 1
    ) {
      return new Response("Checkout ownership or price mismatch", {
        status: 409,
      });
    }
    const orderId = paymentOrderId(session.id);
    let order: PaymentRecord | undefined =
      await sanityClient.getDocument<PaymentRecord>(orderId);
    if (!order) {
      if (item.paid)
        return new Response(
          "Item already paid; operator reconciliation required",
          { status: 409 },
        );
      // Deterministic create plus revision-guarded item patch are one atomic transaction.
      // Retries cannot create a second order or partially mark an item paid.
      await sanityClient
        .transaction()
        .create({
          _id: orderId,
          _type: "order",
          user: { _type: "reference", _ref: user._id },
          item: { _type: "reference", _ref: item._id },
          status: "success",
          date: new Date().toISOString(),
          checkoutSessionId: session.id,
          stripeEventId: event.id,
          amountMinor: session.amount_total,
          currency: session.currency,
        })
        .patch(itemId, (patch) =>
          patch.ifRevisionId(item._rev).set({
            paid: true,
            featured: true,
            pricePlan,
            sponsor: pricePlan === PricePlans.SPONSOR,
            proPlanStatus:
              pricePlan === PricePlans.PRO
                ? ProPlanStatus.SUCCESS
                : ProPlanStatus.SUBMITTING,
            sponsorPlanStatus:
              pricePlan === PricePlans.SPONSOR
                ? SponsorPlanStatus.SUCCESS
                : SponsorPlanStatus.SUBMITTING,
            order: { _type: "reference", _ref: orderId },
          }),
        )
        .commit();
      order = { _id: orderId };
    }
    // Notification failure never rolls back payment. Stripe retries can finish the pending delivery.
    if (!order.emailNotifiedAt) {
      await sendPaymentSuccessEmail(
        user.name,
        user.email,
        absoluteUrl(`/publish/${encodeURIComponent(item._id)}`),
      );
      await sanityClient
        .patch(orderId)
        .set({ emailNotifiedAt: new Date().toISOString() })
        .commit();
    }
    if (process.env.DISCORD_WEBHOOK_URL && !order.discordNotifiedAt) {
      await sendMessageToDiscord(
        session.id,
        customerId,
        user.name,
        stripeAmount(session.amount_total || 0, session.currency),
        session.currency,
      );
      await sanityClient
        .patch(orderId)
        .set({ discordNotifiedAt: new Date().toISOString() })
        .commit();
    }
    return new Response(null, { status: 200 });
  } catch {
    // No upstream objects, email addresses, tokens, or provider payloads in responses/logs.
    return new Response(
      "Payment processing or notification pending; retry required",
      { status: 503 },
    );
  }
}
