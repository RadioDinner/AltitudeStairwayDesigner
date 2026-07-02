# Coordinated Primary Species with per-part override; material values are per-Product

The material/finish Selection Axis appears on most Products, but its allowed values
are defined **per Product** — treads offer wood species, balusters offer metal
finishes (and/or wood), risers offer species or paint-grade. There is no single
global material value list.

A Design carries a **Primary Species** chosen once. It cascades as the default onto
every Product whose material list contains it, so all wood parts coordinate
automatically. Each part can be **overridden** individually, and parts that cannot
honor the Primary Species (metal balusters, paint-grade risers) simply keep their
own default.

Why: users think "build my stair in Red Oak," not part-by-part. Independent
per-part species means six redundant selections and easy visual mismatch.
Coordination-with-override gives one-click consistency without losing the ability
to mix (e.g. iron balusters against oak rail). Per-Product value lists are required
because "species" is not meaningful for metal or paint-grade parts.
