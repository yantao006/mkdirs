"use server";

import type { slugify } from "@/lib/utils";
import type { Category, Tag } from "@/sanity.types";
import type { sanityClient } from "@/sanity/lib/client";
import type { deepseek } from "@ai-sdk/deepseek";
import type { google } from "@ai-sdk/google";
import type { openai } from "@ai-sdk/openai";
import type { xai } from "@ai-sdk/xai";
import type { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { generateObject } from "ai";
import { z } from "zod";

/**
 * Website info schema
 *
 * 1. when AI generates the image and icon, it will return the image URL and icon URL
 * 2. when the image and icon are uploaded to Sanity, the image reference Id and icon reference Id will be set to the image and icon
 * 3. when this server action is called, it will return the image url and icon url, and the image reference Id and icon reference Id
 */
const WebsiteInfoSchema = z.object({
  name: z.string().describe("A short, concise name without description"),
  description: z
    .string()
    .max(160)
    .describe("One sentence summary, max 160 characters"),
  introduction: z.string().describe("Detailed introduction in markdown format"),
  categories: z
    .array(z.string())
    .describe("Array of category names that best match the content"),
  tags: z
    .array(z.string())
    .describe("Array of tag names that best match the content"),
  image: z.string().describe("Website screenshot image URL"),
  icon: z.string().describe("Website logo image URL"),
  imageId: z
    .string()
    .optional()
    .describe("Website screenshot image reference Id"),
  iconId: z.string().optional().describe("Website logo image reference Id"),
});

export type ServerActionResponse = {
  status: "success" | "error";
  message?: string;
  data?: z.infer<typeof WebsiteInfoSchema>;
};

/**
 * fetch info for the specified url
 */
export async function fetchWebsite(url: string): Promise<ServerActionResponse> {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
}

/**
 * fetch website info for the specified url with Microlink and AI SDK
 */
export const fetchWebsiteInfo = async (url: string) => {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
};

/**
 * fetch website info for the specified url with AI SDK
 */
export const fetchWebsiteInfoWithAI = async (url: string) => {
  throw new Error(
    "This directory is read-only. Template service actions are disabled.",
  );
};
