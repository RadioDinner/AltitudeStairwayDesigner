# Hybrid configurator, with the seller catalog as the source of truth

The configurator uses a hybrid model: *structural* dimensions (number of steps,
overall stair width, floor-to-floor height) are free/continuous and drive the
layout, while *product* selections (tread species/profile, riser type, baluster
style, handrail species/profile, newel style) are discrete picks from a real
seller catalog. Continuous dimensions snap to available stock sizes or are
cut-to-length where the trade normally cuts.

The catalog (SKUs, dimensions, prices) is the source of truth: a design can only
contain parts that exist in it, and the purchase order is assembled from those
SKUs. Without a real catalog the app cannot produce a real PO.

Why: pure free-form parametric design (option B) produces parts no seller
stocks; a pure discrete catalog (option A) loses the fluid "resize my staircase"
feel. The hybrid keeps the layout playful while keeping every purchasable part
real and priceable.

Consequence / open risk: sourcing a real catalog from a specific stair-parts
seller is on the critical path and is not yet done. Everything downstream (PO,
pricing, configurator constraints) is blocked on it.
