# Closed risers only in v1

Every step in v1 has a riser board (closed). Open-riser stairs (no riser board)
are deferred.

Why: open risers would add a "no riser" path through the catalog, a second 3D
render per tread style, a tread-end baluster mounting variant distinct from the
committed shoe-rail path ([ADR 0008](0008-v1-part-set.md)), and a second IRC
spacing check (the 4″-sphere rule applied to the gap between treads). Closed-only
keeps the part set and asset pipeline deliberately small.

## Consequence / revisit trigger

A known tension with v1's desirability-testing goal: open risers are a popular
modern aesthetic, so the demo may read as dated to test users. Revisit if
desirability feedback points at open risers; the catalog and geometry model can
accommodate a later open/closed toggle without rework.
