import "server-only";

import { ApprovalEmail } from "@/emails/approval-email";
import { NotifySubmissionEmail } from "@/emails/notify-submission-to-admin";
import { NotifySubmissionToUserEmail } from "@/emails/notify-submission-to-user";
import { PaymentSuccessEmail } from "@/emails/payment-success";
import RejectionEmail from "@/emails/rejection-email";
import { ResetPasswordEmail } from "@/emails/reset-password";
import VerifyEmail from "@/emails/verify-email";
import { requireService } from "@/lib/service-config";
import type { ReactNode } from "react";
import { Resend } from "resend";

export function getResend() {
  requireService("email");
  return new Resend(process.env.RESEND_API_KEY);
}

async function sendMail(to: string, subject: string, react: ReactNode) {
  const result = await getResend().emails.send({
    from: process.env.RESEND_EMAIL_FROM,
    to,
    subject,
    react,
  });
  if (result.error || !result.data?.id) {
    throw new Error("The email provider could not accept the message");
  }
  return result.data;
}

export function sendPasswordResetEmail(
  userName: string,
  email: string,
  token: string,
) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${encodeURIComponent(token)}`;
  return sendMail(
    email,
    "Reset your password",
    ResetPasswordEmail({ userName, resetLink }),
  );
}

export function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${encodeURIComponent(token)}`;
  return sendMail(email, "Confirm your email", VerifyEmail({ confirmLink }));
}

export async function sendNotifySubmissionEmail(
  userName: string,
  userEmail: string,
  itemName: string,
  statusLink: string,
  reviewLink: string,
) {
  requireService("submissionNotifications");
  await sendMail(
    userEmail,
    "Thank you for your submission",
    NotifySubmissionToUserEmail({ userName, itemName, statusLink }),
  );
  await sendMail(
    process.env.RESEND_EMAIL_ADMIN,
    "New submission",
    NotifySubmissionEmail({ itemName, reviewLink }),
  );
}

export function sendPaymentSuccessEmail(
  userName: string,
  email: string,
  itemLink: string,
) {
  return sendMail(
    email,
    "Your submission payment was received",
    PaymentSuccessEmail({ userName, itemLink }),
  );
}

export function sendApprovalEmail(
  userName: string,
  email: string,
  itemLink: string,
) {
  return sendMail(
    email,
    "Your submission has been approved",
    ApprovalEmail({ userName, itemLink }),
  );
}

export function sendRejectionEmail(
  userName: string,
  email: string,
  dashboardLink: string,
) {
  return sendMail(
    email,
    "Please check your submission",
    RejectionEmail({ userName, dashboardLink }),
  );
}
