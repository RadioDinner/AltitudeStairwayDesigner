# Units: feet-inches-fractions input, exact-float core, quantized cut dimensions

One measurement system end to end — **imperial inches** — with a clean split
between how numbers are *entered*, how they are *carried*, and how they *leave the
building*.

## Input — feet-inches-fractions (a UI concern)

Intake and side-panel fields accept **feet-inches-fractions** (e.g. `9' 1-3/4"`),
because that is how homeowners and contractors think. Parsing/formatting is a **UI
concern**: fields convert to and from decimal inches at the edge. **The engine never
sees a fraction** — it receives decimal inches.

## Core — exact decimal inches (float), single source of truth

The engine carries every dimension as an **exact decimal-inch float**. Derived
values stay exact: Rise = Total Rise ÷ Riser Count is uniform *by construction* in
the core (e.g. 109.75 ÷ 15 = 7.31666…″). No rounding happens inside the model.

## Edges — quantize to a manufacturing increment (1/16″)

Nothing physical can be cut to 7.31666″. At the **display** and **PO cut list**
edges, dimensions quantize to a manufacturing increment (**1/16″** default). Display
shows the quantized fraction (7 5/16″); the PO carries quantized, cuttable numbers.
The increment is a single v1 constant; making it **per-shop** later fits the same
company-scoped catalog seam as the hard limits ([ADR 0019](0019-advisory-fit-warnings-reserve-hard-limits.md)).

## The uniformity check runs on the quantized dimensions

The IRC ⅜″ rise/run uniformity check ([ADR 0015](0015-v1-irc-dimensional-ruleset.md))
runs against the **quantized cut dimensions, not the exact floats**. Against exact
floats it would pass trivially and validate a fiction; the tool's credibility rests
on the parts that actually get cut. Once each riser is quantized to 1/16″, real
variation appears (some 7 5/16″, some 7 1/4″) — well under ⅜″ in practice, but now
the check is verifying the real staircase.

## Consequence

- "Uniform by construction" is true of the **core float**, not necessarily of the
  quantized parts — the uniformity advisory exists precisely to catch the rare case
  where quantization pushes spread past ⅜″.
- Display can show apparent non-uniformity (rounded risers differ) while the model is
  exact; that is expected, not a bug.
