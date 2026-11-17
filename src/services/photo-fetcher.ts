import { supabase } from "@/services";
import { takePrefetchedPhotos } from "@/prefetch/prefetch-store";
import {
  buildPhotos,
  cloudinaryListUrl,
  PHOTO_ORDER_SELECT,
  type RawPhotoData,
} from "./photo-builder";

async function fetchRawPhotos(tag: string): Promise<RawPhotoData> {
  // All three requests are independent — run them in parallel so the gallery
  // is ready after one round trip instead of three.
  const [blacklistResult, response, dbResult] = await Promise.all([
    supabase.from("photo_blacklist").select("photo_id"),
    fetch(cloudinaryListUrl(tag)),
    supabase
      .from("photo_order")
      .select(PHOTO_ORDER_SELECT)
      .eq("tag", tag)
      .order("position", { ascending: true }),
  ]);

  if (dbResult.error) throw dbResult.error;

  return {
    blacklist: blacklistResult.data || [],
    resources: response.ok ? (await response.json()).resources : [],
    order: dbResult.data || [],
  };
}

export async function fetchPhotosByTag(tag: string | null) {
  if (!tag) return [];

  try {
    // The home page's data is usually already on its way: the inline prefetch
    // script in index.html requests it before the app bundle has loaded.
    const raw = (await takePrefetchedPhotos(tag)) ?? (await fetchRawPhotos(tag));
    return buildPhotos(tag, raw);
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}
