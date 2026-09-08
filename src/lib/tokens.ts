import { getPasswordResetTokenByEmail } from "@/data/password-reset-token";
import { getVerificationTokenByEmail } from "@/data/verification-token";
import { privateDocumentId } from "@/lib/private-documents";
import { sanityClient } from "@/sanity/lib/private-client";
import { uuid } from "@sanity/uuid";

export const generateVerificationToken = async (email: string) => {
  const token = `token.${uuid()}`;

  // expires in 1 hour
  const expires = new Date(new Date().getTime() + 3600 * 1000).toISOString();

  const existingToken = await getVerificationTokenByEmail(email);
  if (existingToken) {
    await sanityClient.delete(existingToken._id);
  }

  const verificationToken = await sanityClient.create({
    _id: privateDocumentId("verificationToken"),
    _type: "verificationToken",
    identifier: email.trim().toLowerCase(),
    token,
    expires,
  });

  return verificationToken;
};

export const generatePasswordResetToken = async (email: string) => {
  const token = `token.${uuid()}`;

  // expires in 1 hour
  const expires = new Date(new Date().getTime() + 3600 * 1000).toISOString();

  const existingToken = await getPasswordResetTokenByEmail(email);
  if (existingToken) {
    await sanityClient.delete(existingToken._id);
  }

  const passwordResetToken = await sanityClient.create({
    _id: privateDocumentId("passwordResetToken"),
    _type: "passwordResetToken",
    identifier: email.trim().toLowerCase(),
    token,
    expires,
  });

  return passwordResetToken;
};
