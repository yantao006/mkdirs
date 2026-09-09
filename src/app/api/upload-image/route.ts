import { currentUser } from "@/lib/auth";
import { serviceConfigured } from "@/lib/service-config";
import {
  MAX_IMAGE_BYTES,
  MAX_UPLOAD_BYTES,
  readBoundedBody,
  validImageSignature,
} from "@/lib/upload";
import { sanityClient } from "@/sanity/lib/private-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }
  if (!serviceConfigured("accounts")) {
    return NextResponse.json(
      { error: "Uploads are awaiting account configuration" },
      { status: 503 },
    );
  }
  const user = await currentUser();
  if (!user?.id) {
    return NextResponse.json(
      { error: "Sign in to upload images" },
      { status: 401 },
    );
  }
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.startsWith("multipart/form-data;")) {
    return NextResponse.json(
      { error: "Expected an image form upload" },
      { status: 415 },
    );
  }
  if (Number(request.headers.get("content-length")) > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Image must be at most 5 MiB" },
      { status: 413 },
    );
  }
  try {
    const bytes = await readBoundedBody(request, MAX_UPLOAD_BYTES);
    const formData = await new Response(bytes, {
      headers: { "content-type": contentType },
    }).formData();
    const file = formData.get("file");
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > MAX_IMAGE_BYTES
    ) {
      return NextResponse.json(
        { error: "Provide one non-empty image of at most 5 MiB" },
        { status: 400 },
      );
    }
    const image = new Uint8Array(await file.arrayBuffer());
    if (!validImageSignature(image, file.type)) {
      return NextResponse.json(
        { error: "Use a valid PNG, JPEG, WebP, or GIF image" },
        { status: 415 },
      );
    }
    const asset = await sanityClient.assets.upload(
      "image",
      Buffer.from(image),
      {
        contentType: file.type,
        filename: `upload-${crypto.randomUUID()}.${file.type.split("/")[1]}`,
      },
    );
    return NextResponse.json({ asset });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof RangeError
            ? "Image must be at most 5 MiB"
            : "Image upload failed; please retry",
      },
      { status: error instanceof RangeError ? 413 : 502 },
    );
  }
}
