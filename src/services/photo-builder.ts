/**
 * Turns the raw gallery data (Supabase rows, the blacklist and Cloudinary's
 * tag list) into the photo list the site renders.
 *
 * Kept free of imports beyond `cloudinary.ts` so the inline home prefetch
 * script (`src/prefetch/home-prefetch.ts`) can share it without pulling in
 * supabase-js or React.
 */
import { cloudinaryImage } from "../utils/cloudinary";

export const CLOUD_NAME = "dtscgoycp";

/** Columns and joins the gallery reads from `photo_order`. */
export const PHOTO_ORDER_SELECT =
  "*,photo_variants(id,url,position),photo_descriptions(description)";

/** Human-friendly alt text per photo tag, for image SEO and accessibility. */
const TAG_LABELS: Record<string, string> = {
  weddings_main: "Bröllopsfotografi i Skåne",
  engagement: "Förlovningsfotografi i Skåne",
};

function photoAlt(tag: string) {
  if (tag === "about") return "Myelie Lendelund, bröllopsfotograf i Skåne";
  return `${TAG_LABELS[tag] ?? "Fotografi i Skåne"} av Myelie Lendelund`;
}

export interface CloudinaryResource {
  public_id: string;
  format: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

export interface RawPhotoData {
  blacklist: { photo_id: string }[];
  /** Resources from Cloudinary's tag list; empty if the list was unavailable. */
  resources: CloudinaryResource[];
  /** `photo_order` rows for the tag, by position. */
  order: any[];
}

/**
 * Bucket the Cloudinary list cache buster so repeated visits within a few
 * minutes reuse the cached list instead of forcing a fresh round trip.
 */
export function cloudinaryListUrl(tag: string) {
  const cacheBuster = Math.floor(Date.now() / (5 * 60 * 1000));
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${tag}.json?cb=${cacheBuster}`;
}

export function buildPhotos(tag: string, { blacklist, resources, order }: RawPhotoData) {
  const blacklistedIds = new Set(blacklist.map((b) => b.photo_id));

  const cloudResources = resources.filter((r) => !blacklistedIds.has(r.public_id));
  const validDbOrder = order.filter((item) => !blacklistedIds.has(item.id));
  const sortedIds = new Set(validDbOrder.map((item) => item.id));
  const cloudMetaById = new Map(
    cloudResources.map((resource) => [resource.public_id, resource])
  );

  return [
    ...validDbOrder.map((item) => {
      const rawDescription = item.photo_descriptions;
      let descriptionText = "";

      if (Array.isArray(rawDescription) && rawDescription.length > 0) {
        descriptionText = rawDescription[0].description;
      } else if (rawDescription && typeof rawDescription === 'object') {
        descriptionText = (rawDescription as any).description || "";
      }

      const cloudMeta = cloudMetaById.get(item.id);

      return {
        id: item.id as string,
        url: cloudinaryImage(item.url),
        alt: photoAlt(tag),
        description: descriptionText,
        width: cloudMeta?.width,
        height: cloudMeta?.height,
        mobileHero: Boolean(item.mobile_hero),
        photo_variants: item.photo_variants?.sort((a: any, b: any) => a.position - b.position) || []
      };
    }),
    ...cloudResources
      .filter((r) => !sortedIds.has(r.public_id))
      .map((r) => ({
        id: r.public_id,
        url: cloudinaryImage(
          `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${r.public_id}.${r.format}`
        ),
        alt: photoAlt(tag),
        description: "",
        width: r.width,
        height: r.height,
        mobileHero: false,
        photo_variants: []
      }))
  ];
}

export type GalleryPhoto = ReturnType<typeof buildPhotos>[number];
