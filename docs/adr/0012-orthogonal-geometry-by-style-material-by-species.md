# Render data is orthogonal: geometry by Style, material by species; SKU references both

3D render data is split along two independent axes instead of being attached per
SKU:

- **Geometry, keyed by Style** — ornamental parts (baluster/newel styles) are
  authored once as a GLTF asset per style with an Anchor & Scale Spec (base/top
  anchors, the single scalable axis, and fixed-detail zones). Boxy parts
  (tread/riser/handrail/shoe) use a procedural profile id the renderer extrudes to
  the bound dimensions.
- **Material, keyed by species/finish** — a PBR material/texture per material value
  (Red Oak, satin-black iron), applied to whatever geometry.

A **SKU** references a geometry (Style or profile) and a material; it does not own
a model. The same baluster Style in Red Oak vs. Maple is one geometry with two
materials.

Why: geometry and material vary independently. Attaching a distinct 3D model per
SKU would re-author identical geometry once per species and multiply the asset
pipeline (ADR 0004) by the species count. The orthogonal split authors each Style
once and each material once, and the Anchor & Scale Spec keeps procedural
stretching realistic (a taller baluster stretches its shaft, not its finial).
