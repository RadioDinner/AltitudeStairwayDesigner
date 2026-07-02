# Derived Rise, user adjusts Riser Count (uniform steps by construction)

**Rise** is never directly editable. The engine derives
`Riser Count = ceil(Total Rise ÷ 7¾″)`, then `Rise = Total Rise ÷ Riser Count`,
and displays Rise read-only. The user's step-geometry controls are a **Riser Count**
stepper (±1, which re-derives Rise), a **Run** slider (≥ 10″), and a **width**
slider. Total Rise is a fixed Intake fact, not a live control.

Why: dividing Total Rise evenly across the chosen Riser Count makes every riser
identical by construction, so a user can never accidentally build non-uniform or
out-of-code steps by typing a Rise that doesn't divide evenly. It also sidesteps
off-by-one rounding surprises inherent in "type a target Rise, snap the count."

**`ceil`, not `round`.** Round-to-nearest can round the count *down* and produce a
Rise **over** 7¾″ (e.g. Total Rise 117″ → round(15.10)=15 → Rise 7.8″), so the very
first render would open **already carrying a Code warning**. `ceil` yields the
minimum riser count that satisfies max rise, so the seeded design is always
code-clean on rise. Stepping the count **down** into a steeper, warned stair is then
a **deliberate override**, consistent with the clean-by-default / overrides-are-
deliberate stance ([ADR 0026](0026-warnings-freeze-onto-po-with-acknowledgment-gate.md)).
`ceil` biases toward more, shorter steps → longer run → marginally likelier to trip
the advisory **Fit** warning, which is the right bias: max-rise is a safety rule,
run-fit is a space preference — seed safe, trade space consciously.

## Consequence

Rise & run uniformity checks ([ADR 0015](0015-v1-irc-dimensional-ruleset.md) #3/#4)
**cannot trip in v1** — all risers and all runs are equal by construction. They are
kept in the ruleset regardless: they are cheap and become load-bearing the moment
per-step editing arrives (L-shaped/winder geometries, out of v1 scope).
