import { getItemById } from "@/data/item";
import { getUserById } from "@/data/user";
import { currentRole } from "@/lib/auth";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/mail";
import { serviceConfigured } from "@/lib/service-config";
import { FreePlanStatus, PricePlans } from "@/lib/submission";
import { absoluteUrl, getDashboardLink } from "@/lib/utils";
import { UserRole } from "@/types/user-role";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json(
      { message: "Invalid request origin" },
      { status: 403 },
    );
  }
  if (
    !serviceConfigured("accounts") ||
    (await currentRole()) !== UserRole.ADMIN
  ) {
    return NextResponse.json(
      { message: "Administrator sign-in required" },
      { status: 403 },
    );
  }
  if (!serviceConfigured("email")) {
    return NextResponse.json(
      { message: "Email service is awaiting configuration" },
      { status: 503 },
    );
  }
  try {
    const { itemId } = await request.json();
    if (typeof itemId !== "string" || !itemId || itemId.length > 128) {
      return NextResponse.json({ message: "Invalid item ID" }, { status: 400 });
    }
    const item = await getItemById(itemId);
    const submitter = item?.submitter?._ref
      ? await getUserById(item.submitter._ref)
      : null;
    if (!item || !submitter) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 },
      );
    }
    if (item.pricePlan !== PricePlans.FREE) {
      return NextResponse.json(
        { message: "Not a free-plan review notification" },
        { status: 409 },
      );
    }
    if (item.freePlanStatus === FreePlanStatus.APPROVED) {
      await sendApprovalEmail(
        submitter.name,
        submitter.email,
        absoluteUrl(`/publish/${encodeURIComponent(item._id)}`),
      );
    } else if (item.freePlanStatus === FreePlanStatus.REJECTED) {
      await sendRejectionEmail(
        submitter.name,
        submitter.email,
        getDashboardLink(),
      );
    } else {
      return NextResponse.json(
        { message: "Review is not complete" },
        { status: 409 },
      );
    }
    return NextResponse.json({
      message: "Email accepted by the delivery provider",
    });
  } catch {
    return NextResponse.json(
      { message: "Could not send the review notification" },
      { status: 502 },
    );
  }
}
