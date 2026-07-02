# Catalog is modeled as Products with Option Axes that resolve to SKUs

Each Company's catalog is a set of **Products** (one per part type family, e.g.
"Bullnose Tread"). A Product declares **Option Axes** — the dimensions of choice
the configurator's side panel renders (species, profile, length, style, …). A
specific value picked on each axis resolves to a concrete orderable **SKU**. Not
every axis combination must exist; a Product→SKU mapping records which
combinations are real, so impossible picks simply don't resolve.

Why: the configurator UI must be declarative and data-driven — controls come from
the Product's axes, not hardcoded per part type — so a white-label tenant can
define its own products without a code change. At the same time every selection
must resolve to a real, orderable SKU so the PO stays honest (ADR 0002). Flat SKUs
alone would push grouping logic into the UI and lose the explicit "which
combinations exist" mapping; products-with-axes captures both.

Consequence: the schema needs product, option-axis, and sku entities plus a
mapping from axis-value combinations to SKUs. More upfront structure than a flat
SKU list, justified by the multi-tenant, self-serve-catalog end state (ADR 0006).
