# Minimal required Intake: Total Rise + Ceiling Height only

v1's desirability bet is "a few facts → instant 3D stair," and every required field is
friction before that payoff. So Intake requires the **fewest inputs that still let the
engine generate and check a stair**, and defaults the rest.

## Required (2)

- **Total Rise** — the primary input; seeds Riser Count → Rise and the whole geometry
  ([ADR 0016](0016-derived-rise-adjust-riser-count.md)).
- **Ceiling Height** — required because the **headroom** check has no meaning without
  it ([ADR 0015](0015-v1-irc-dimensional-ruleset.md)).

Two numbers to first render.

## Optional, with defaults

- **Run length (available run)** — used *only* for the **Fit warning**
  ([ADR 0019](0019-advisory-fit-warnings-reserve-hard-limits.md)). Omitted → **no Fit
  check runs** (nothing to compare against); the stair still generates from Total Rise.
  Never gates Intake. Can be supplied later in the panel to activate the check.
- **Width** — defaults to **42″** (comfortable, above the 36″ IRC floor), tunable in
  the panel. A default above the code minimum means the starting stair is never itself
  a width warning.
- **Stairwell Opening Length** — optional, defaults to the full projected run
  (already settled in [CONTEXT.md](../../CONTEXT.md)).

## Consequence

- The Fit warning is **conditional on run length being present** — its absence is a
  valid state, not an error.
- The starting Design is always complete and renderable from just two inputs; the rest
  are refinements, not prerequisites.
