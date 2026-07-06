import { catalog } from "@/supabase/seed/catalog";
import { toCatalogView } from "@/lib/engine";

/**
 * The single-tenant v1 catalog, resolved once into the engine's CatalogView (ADR 0021
 * defaults drive the seed). Static for v1; the multi-tenant app will fetch this from
 * Supabase per Company instead.
 */
export const catalogView = toCatalogView(catalog);
