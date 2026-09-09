"use client";

import { createCheckoutSession } from "@/actions/create-checkout-session";
import { Button } from "@/components/ui/button";
import {
  PricePlans,
  SponsorPlanStatus,
  canStartPaidCheckout,
} from "@/lib/submission";
import { cn } from "@/lib/utils";
import type { ItemInfo, PricePlan } from "@/types";
import {
  ArrowRightIcon,
  ArrowUpLeftIcon,
  CheckCircleIcon,
  RocketIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Icons } from "../icons/icons";

interface SponsorPlanButtonProps {
  item?: ItemInfo;
  pricePlan: PricePlan;
  className?: string;
}

export function SponsorPlanButton({
  item,
  pricePlan,
  className,
}: SponsorPlanButtonProps) {
  // console.log('SponsorPlanButton, item:', item);
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const handleCreateCheckoutSession = () => {
    if (!item?._id || !pricePlan.stripePriceId) {
      toast.error("This payment plan is not configured");
      return;
    }
    startTransition(async () => {
      try {
        const data = await createCheckoutSession(
          item._id,
          pricePlan.stripePriceId,
          PricePlans.SPONSOR,
        );
        if (data?.status === "error") {
          toast.error(data.message || "Failed to create checkout session");
          return;
        }
        if (data?.stripeUrl) {
          window.location.assign(data.stripeUrl);
          return;
        }
        toast.error("Failed to create checkout session");
      } catch (error) {
        console.error("createCheckoutSession, error:", error);
        toast.error("Failed to create checkout session");
      }
    });
  };

  const handleClick = () => {
    if (!item) {
      router.push("/submit");
    } else if (canStartPaidCheckout(item.sponsorPlanStatus)) {
      handleCreateCheckoutSession();
    } else if (item.sponsorPlanStatus === SponsorPlanStatus.SUCCESS) {
      if (item.publishDate) {
        // already published
        console.log("SponsorPlanButton, handleClick, already published");
        router.push("/dashboard");
      } else {
        // pay success but not published yet
        console.log(
          "SponsorPlanButton, handleClick, pay success but not published yet",
        );
        router.push(`/publish/${item._id}`);
      }
    } else if (item.sponsorPlanStatus === SponsorPlanStatus.FAILED) {
      console.log("SponsorPlanButton, handleClick, pay failed");
    } else {
      console.error(
        "SponsorPlanButton, invalid sponsor plan status:",
        item.sponsorPlanStatus,
      );
    }
  };

  return (
    <Button
      size="lg"
      variant="default"
      className={cn(
        "overflow-hidden rounded-full",
        "group transition-transform duration-300 ease-in-out hover:scale-105",
        "bg-primary text-primary-foreground dark:bg-primary/90",
        "hover:bg-primary/90 dark:hover:bg-primary/80",
        "shadow-lg hover:shadow-xl",
        className,
      )}
      disabled={isPending}
      onClick={handleClick}
    >
      {!item ? (
        <div className="flex items-center justify-center gap-2">
          <span>Go Submit</span>
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      ) : isPending ? (
        // when creating checkout session
        <div className="flex items-center justify-center">
          <Icons.spinner className="mr-2 size-4 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : item.sponsorPlanStatus === SponsorPlanStatus.SUCCESS ? (
        // maybe published already(pay success or approved in free plan)
        item.publishDate ? (
          <div className="flex items-center justify-center">
            <ArrowUpLeftIcon className="mr-2 size-4 icon-scale" />
            <span>Go Dashboard</span>
          </div>
        ) : (
          // maybe pay success but not published yet
          <div className="flex items-center justify-center">
            <CheckCircleIcon className="mr-2 size-4 icon-scale" />
            <span>Go Publish</span>
          </div>
        )
      ) : (
        // not paid success yet
        <div className="flex items-center justify-center">
          <RocketIcon className="mr-2 size-4 icon-scale" />
          <span>Pay & Publish Right Now</span>
        </div>
      )}
    </Button>
  );
}
