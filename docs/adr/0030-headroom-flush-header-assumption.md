# Headroom assumes a flush header; the assumption is documented, not hidden

The headroom check ([ADR 0015](0015-v1-irc-dimensional-ruleset.md)) computes
`headroom = ceiling_height − Total Rise + slope × opening_length`. The geometry is
correct **if the limiting plane at the stairwell header is the finished ceiling
itself** — i.e. the header's underside is **flush** with the ceiling: no dropped
header beam, no soffit, no thick floor-trim buildout.

## The error is optimistic — so name it

If a dropped header or soffit exists, the real obstruction sits **below**
`ceiling_height`, so actual headroom is **less** than the formula reports. That is the
**optimistic** (unsafe) direction for a code check: it can say "you clear 6′8″" when
you don't.

v1 accepts this rather than complicating Intake ([ADR 0027](0027-minimal-required-intake-set.md)),
because the risk is bounded: headroom is **advisory-only** (never blocks —
[ADR 0003](0003-irc-enforcement-with-advisory-overrides.md)), it is **acknowledged**
at submit ([ADR 0026](0026-warnings-freeze-onto-po-with-acknowledgment-gate.md)), and
a real installer verifies on site. What is **not** acceptable is letting the
assumption be invisible.

So:

- The **headroom warning copy states the assumption**: "assumes no dropped header /
  soffit — verify clearance on site."
- The assumption is recorded here rather than buried in the formula.

## Reserved seam — a future header-drop input

An optional **header-drop** input (how far the opening's underside sits below the
ceiling) is a **reserved future Intake field**, not v1 — same record-now-enforce-later
pattern as the hard-limit ([ADR 0019](0019-advisory-fit-warnings-reserve-hard-limits.md))
and Match Key seams. When added, it subtracts from `ceiling_height` in the formula
and the flush assumption goes away. Until then, flush is the documented default.
