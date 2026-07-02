# No pricing in v1; future pricing is per-company price sheets, not SKU prices

The v1 purchase order carries no prices. When pricing is added later it will be a
per-company Price Sheet layered over the catalog — different companies/dealers see
different prices for the same SKU — rather than a single global price attached to
each SKU.

Implication for the data model now: keep price OUT of the SKU. A SKU describes
what a part IS (species, profile, stock dimensions); price is a separate mapping
of (company, SKU) → price added later. Baking a single price into the SKU now
would have to be torn out when per-company sheets arrive.

Why defer: prices from distributors are relationship-specific and fluctuate, and
no seller partner/catalog is signed yet (ADR 0002). Shipping a price-free,
emailable PO lets the product prove itself without a pricing relationship, while
the per-company design keeps the eventual pricing model honest.
