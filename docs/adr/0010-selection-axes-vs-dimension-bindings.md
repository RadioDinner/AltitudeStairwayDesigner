# A Product separates Selection Axes from Dimension Bindings

A Product declares two distinct kinds of configuration:

- **Selection Axes** — discrete, user-facing choices (species, profile, style)
  that render as side-panel controls and are picked by the user (ADR 0009).
- **Dimension Bindings** — physical dimensions bound to a geometry value (tread
  length = stair width, handrail length = flight length, baluster height =
  derived) or a fixed value, computed by the engine and never shown as a dropdown.

Each Dimension Binding carries a **Stocking Rule** describing how real stock
satisfies it: `fixed` (one stocked size, trimmed), `stock_lengths` (discrete
lengths cut to need, engine picks length and stick count), or `cut_to_size`
(any size within min/max). SKU resolution and quantity/cut-list math read the
stocking rule.

Why: user-facing style choices and engine-computed dimensions are fundamentally
different — one is a dropdown, the other is arithmetic driven by the stair
geometry (ADR 0003). Cramming both into one uniform "axis" list would push
dimension logic into the UI and invite rendering a dropdown for something the
engine must compute. Splitting them keeps the configurator declarative and the
quantity math in the engine.
