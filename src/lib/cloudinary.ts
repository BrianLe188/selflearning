import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Cloudinary's automatic video thumbnail: same public ID, video delivery
 * pipeline, .jpg extension swapped in for the source format.
 */
export function getVideoPosterUrl(secureUrl: string): string {
  return secureUrl.replace(/\.[^./]+$/, ".jpg");
}
