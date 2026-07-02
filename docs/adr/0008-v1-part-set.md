# v1 part set: five hero parts plus fillets, shoe rails, and caps

The v1 catalog and purchase order include:

- **Hero parts (user-configurable):** treads, risers, balusters, handrail, newel posts.
- **Included accessories:** fillets, shoe rails, and caps — kept because they are
  structurally inseparable from mounting the balusters and finishing the newels
  (you cannot install balusters without a shoe rail and fillets, or a newel
  without a cap).

Deferred to a later phase: all other accessories (rail fittings/brackets,
nosing/cove trim, fasteners/adhesive, mounting hardware). These multiply SKUs and
3D modeling effort for little value while proving the product.

Baluster count and spacing are auto-derived from the IRC 4″-sphere rule and shown
to the user; the user may override spacing as an advisory action (ADR 0003), but
the default is computed — it is not a raw user input.

Why: the hero parts plus the three inseparable accessories are the minimum set
that produces a genuinely installable straight-run guard-and-rail system, keeping
the catalog and asset pipeline small (ADR 0004) without shipping something a
builder couldn't actually assemble.
