# Hybrid 3D asset strategy: procedural boxy parts, authored models per ornamental SKU

Boxy parts (treads, risers, handrail, skirt) are generated procedurally from
dimensions, with wood species applied as a material swap. Ornamental parts
(baluster styles, newel styles) cannot be cleanly parametrized and are instead
hand-authored 3D models (GLTF), one per style, instanced and scaled along the
generated stair.

Consequence: every ornamental style in the catalog is a modeling task. This
couples to the catalog-sourcing risk in ADR 0002 — the catalog needs authored
models alongside SKUs and prices. To keep the pipeline tractable, the v1 catalog
deliberately ships a small number of ornamental styles (a handful of baluster
styles, a few newel styles); breadth is added later.

Why: procedural generation gives free, infinite resizing for the parts that are
geometrically simple, while authored assets preserve realism for the parts whose
value is their ornamental detail. A single approach for both would either lose
realism (all procedural) or lose free resizing and balloon asset count (all
authored).
