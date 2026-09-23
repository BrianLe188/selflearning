"use server";

import { requireAdminSession } from "@/lib/admin-auth";
import { cloudinary, getVideoPosterUrl } from "@/lib/cloudinary";

export type UploadKind = "image" | "audio" | "video";

export interface UploadResult {
  url: string;
  duration: number | null;
  posterUrl: string | null;
}

/**
 * Uploads a file to Cloudinary and returns its delivery URL. Cloudinary has
 * no dedicated audio endpoint — mp3/wav uploads go through the "video"
 * resource type same as video files.
 */
export async function uploadMedia(
  file: File,
  type: UploadKind
): Promise<UploadResult> {
  await requireAdminSession();

  const resourceType = type === "image" ? "image" : "video";
  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    resource_type: resourceType,
    folder: `posts/${type}`,
  });

  return {
    url: result.secure_url,
    duration: result.duration ?? null,
    posterUrl: type === "video" ? getVideoPosterUrl(result.secure_url) : null,
  };
}
