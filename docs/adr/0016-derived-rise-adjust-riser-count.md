# Derived Rise, user adjusts Riser Count (uniform steps by construction)

**Rise** is never directly editable. The engine derives
`Riser Count = round(Total Rise ÷ 7¾″)`, then `Rise = Total Rise ÷ Riser Count`,
and displays Rise read-only. The user's step-geometry controls are a **Riser Count**
stepper (±1, which re-derives Rise), a **Run** slider (≥ 10″), and a **width**
slider. Total Rise is a fixed Intake fact, not a live control.

Why: dividing Total Rise evenly across the chosen Riser Count makes every riser
identical by construction, so a user can never accidentally build non-uniform or
out-of-code steps by typing a Rise that doesn't divide evenly. It also sidesteps
off-by-one rounding surprises inherent in "type a target Rise, snap the count."

## Consequence

Rise & run uniformity checks ([ADR 0015](0015-v1-irc-dimensional-ruleset.md) #3/#4)
**cannot trip in v1** — all risers and all runs are equal by construction. They are
kept in the ruleset regardless: they are cheap and become load-bearing the moment
per-step editing arrives (L-shaped/winder geometries, out of v1 scope).
