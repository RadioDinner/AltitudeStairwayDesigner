# Defer the compatibility rules engine; curate a fully-compatible v1 catalog

v1 does not implement a part-to-part compatibility engine. Instead the v1 catalog
is curated so every part is mutually compatible by construction: one Rail System
(e.g. post-to-post), one plow width, one baluster seat type. The user cannot
assemble a mismatch because the catalog contains no incompatible combinations.

The seam for later is reserved now: Products carry a coarse `rail_system` tag and
Match Keys (`plow_width`, `baluster_seat`, …). These are stored from v1 but not
read by any rules engine, so a real compatibility resolver can be added when the
catalog grows without a schema migration.

Why: a full compatibility rules engine is heavy and premature for a deliberately
small v1 catalog (ADR 0008), but silently emitting a physically-unbuildable PO
would destroy the credibility the test depends on. Curating a compatible catalog
gets correctness for free now; the reserved fields avoid painting us into a corner.
