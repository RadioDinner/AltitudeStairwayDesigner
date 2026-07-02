# Handrail is single-piece with a max; splice-ability is a Product property

Whether a linear part may be **spliced** (built from multiple sticks with a joint)
or must be **continuous** (a single unbroken piece) is a **property of the Product**,
declared in the catalog — not a blanket engine rule. Different parts answer
differently, so the catalog carries the answer.

## The handrail is continuous

The **handrail** is declared **continuous**: v1's guard has newels only at the two
ends ([ADR 0018](0018-single-open-side-fixed-v1.md)), so a spliced handrail would
show a **joint mid-span with nothing to hide it** — a finish-quality problem, not
just a cut-list detail. It is therefore resolved as a single piece cut to flight
length.

If the flight exceeds the **longest available stock length** for that handrail
Product, it can't be built as one piece. Rather than silently splice or silently
clamp, the engine raises an **advisory Fit warning** ("handrail exceeds maximum
single length"), consistent with the never-block stance
([ADR 0003](0003-irc-enforcement-with-advisory-overrides.md)). In v1 the limit is
read from the Product's available stock lengths; the reserved physical hard-limit
seam ([ADR 0019](0019-advisory-fit-warnings-reserve-hard-limits.md)) is the same
family of constraint and is where a future *hard* clamp would live.

## Spliceable parts

Parts declared **spliceable** (e.g. the **shoe rail**, and other low, less-scrutinized
linear stock) resolve via `stock_lengths` ([ADR 0010](0010-selection-axes-vs-dimension-bindings.md)):
the engine picks a stock length and computes **how many sticks**, and the PO lists
that quantity. A joint here is acceptable because the part isn't visually inspected
the way a handrail is.

## Consequence

- The `product` JSONB gains a **splice policy** (`continuous` | `spliceable`) read by
  the engine when resolving a length dimension binding.
- The handrail is the first concrete consumer of a length-limit warning; it uses
  stocking data in v1 and slots into the reserved hard-limit seam when enforcement
  is built.
