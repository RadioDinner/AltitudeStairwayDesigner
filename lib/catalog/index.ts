/**
 * Catalog domain contracts — the app-side validators for the schema materialized in
 * `supabase/migrations/*_init_catalog_schema.sql`. Enums mirror the Postgres enums;
 * JSONB validators guard the read/write edge (ADR 0014).
 */
export * from "./enums";
export * from "./jsonb";
