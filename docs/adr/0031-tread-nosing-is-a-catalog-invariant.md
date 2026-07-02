# Every tread has a front nosing; tread depth = Run + nosing

**Nosing is not cosmetic** — it is the difference between the **Run** the user
controls (nose-to-nose going, IRC ≥ 10″) and the **tread depth** the seller actually
cuts:

> tread depth = Run + nosing projection

The nose overhangs the riser below by the nosing amount, so the board is deeper than
the going by exactly that projection. The engine computes tread depth from Run + the
tread's nosing and puts **that** on the PO cut list (quantized —
[ADR 0022](0022-units-exact-float-core-quantized-edges.md)). If nosing were ignored,
every tread would ship ~1″ short — the one dimension a seller would cut wrong.

## Nosing is a per-profile catalog value, derived

Nosing is a geometric property of the **tread profile** ([ADR 0012](0012-orthogonal-geometry-by-style-material-by-species.md)):
a front roundover. It is a **fixed value per profile in the catalog**, read by the
engine and extruded by the renderer — **never a user-typed dimension**.

## Compliance by invariant, not by rule

Every tread the catalog offers **has a front nosing** (roundover). That makes the
IRC nosing requirement — a ¾″–1¼″ nose when solid risers are used and tread depth
< 11″ ([ADR 0015](0015-v1-irc-dimensional-ruleset.md)) — **satisfied by construction**:
the violating case (a square-edge tread with zero nosing at a shallow Run) cannot
arise because **no zero-nosing tread exists in the catalog**.

So v1 adds **no runtime nosing advisory**. This is deliberately the
curate-a-compatible-catalog stance ([ADR 0013](0013-defer-compatibility-engine-curate-compatible-catalog.md))
rather than an engine check — the same reasoning that defers the compatibility
engine. If the catalog ever gains a genuinely square-edged tread, revisit with the
advisory.

## Deferred

**Return nosing** on the exposed tread ends of the single open side
([ADR 0018](0018-single-open-side-fixed-v1.md)) — the finished, mitered end return —
is left as a **profile detail**, not pinned in v1. It affects the tread's end
treatment, not the front-nosing / tread-depth relationship above.
