# Balusters: per-tread placement, derived count, bump to 3 only for code

Balusters are placed **per tread** at fixed positions — the industry norm for a
closed-riser straight run ([ADR 0017](0017-closed-risers-only-v1.md)). The count
**per tread** is **derived, not user-selectable**: default **2**, bumped to **3**
only when the gap check requires it. Total baluster count = per-tread count ×
tread count, which makes the PO quantity trivial.

Rejected: **continuous even spacing** along the raking guard (uniform gaps but
balusters land at arbitrary points across each tread — looks wrong on a closed-riser
stair and is fussier to instance) and exposing **balusters-per-tread as an Option
Axis** (a density/style knob). Per-tread count is a code-satisfaction output, not a
taste choice, in v1.

## The gap check is against the raking opening

The IRC 4″-sphere rule ([ADR 0015](0015-v1-irc-dimensional-ruleset.md)) is checked
against the **raking (sloped) clear opening**, not the plan-view horizontal spacing.
On a sloped guard the openings are parallelograms, and a 4″ sphere can pass through
the sloped gap even when horizontal spacing looks adequate. The engine bumps 2 → 3
per tread when the raking opening fails 4″.

## Consequence

- Rendering instances a fixed N balusters per tread — cheap in three.js
  ([ADR 0004](0004-hybrid-3d-asset-strategy.md)).
- Baluster count is a pure function of tread count and run geometry; no user input
  feeds it. A style-driven density option is a possible future axis, deferred.
