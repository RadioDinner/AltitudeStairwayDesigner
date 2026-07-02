# Altitude Stairway Designer

A web app where a user configures a straight-run staircase in an interactive 3D
model — sizing steps, treads, risers, balusters, and handrail — and generates a
purchase order for the resulting parts to send to a stair-parts seller.

## Language

**Stairway Package**:
The complete configured set of *finish* stair parts a user designs and purchases
as one unit — treads, risers, balusters, handrail, and newel posts. Structural
parts (stringers) are excluded from the package and the purchase order.
_Avoid_: kit, bundle, assembly

**Newel Post**:
A heavy vertical post that anchors the handrail — typically one at the bottom
(starting newel) and one at the top of a straight run.
_Avoid_: post, column

**Stringer**:
The structural sawtooth board that carries the treads and risers. Out of scope
entirely — not modeled in 3D, not configurable, and never on the purchase order.
_Avoid_: carriage, stinger

**Design**:
A user's specific stair configuration — the space dimensions plus every product
and dimensional choice. What the editor edits and what a purchase order is
generated from. _Avoid_: project, build, model (3D "model" is the rendering)

**Share Link**:
The no-login URL (an unguessable UUID) minted when the Configurator opens, which
persists a Design and reopens it for viewing or resuming. The Design autosaves as a
draft from the first edit, so the link resumes in-progress work — not just completed
orders ([ADR 0020](docs/adr/0020-draft-autosave-share-link-from-start.md)). The link
itself is the only access control — anyone holding it can view the Design.
_Avoid_: permalink, save link

**Configurator**:
The live editor where a user shapes a Design: a 3D preview alongside side-panel
controls (dropdowns for styles/species, sliders for dimensions). v1 edits via the
panel, not by dragging the 3D model. _Avoid_: builder, designer, tool

**Intake**:
The short initial step where the user enters space details that seed the first
code-compliant Design before the Configurator opens. Only **Total Rise** and
**Ceiling Height** are required; run length (enables the Fit warning), width
(defaults 42″), and Stairwell Opening Length (defaults to full run) are optional
([ADR 0027](docs/adr/0027-minimal-required-intake-set.md)).
_Avoid_: wizard, setup, onboarding

**Ceiling Height**:
The finished floor-to-ceiling height of the lower level — a required Intake input.
Combined with Total Rise and Stairwell Opening Length, it lets the engine check
IRC headroom. Distinct from Total Rise (floor-to-floor). _Avoid_: room height

**Stairwell Opening Length**:
The horizontal length of the opening in the floor above, measured along the run —
an optional Intake input that defaults to the stair's full projected run length.
It positions the header (the opening's near edge) where headroom is tightest; a
longer opening yields more headroom. _Avoid_: hole size, well opening

**Tread**:
The horizontal board a person steps on.
_Avoid_: step (ambiguous — "step" means the tread+riser pair, not just the surface)

**Riser**:
The vertical face closing the gap between two treads. Always present in v1 (closed
risers only); open risers are deferred ([ADR 0017](docs/adr/0017-closed-risers-only-v1.md)).
_Avoid_: kick, back

**Total Rise**:
The total vertical floor-to-floor height the staircase must climb — the primary
user input. The riser count is derived from it. _Avoid_: total height, elevation

**Rise**:
The vertical height of a single step (one riser). IRC-capped (7¾″ max by default).
Always **derived** (Total Rise ÷ Riser Count) and shown read-only — never typed
directly; the user changes it by adjusting Riser Count. _Avoid_: unit rise, step height

**Run**:
The horizontal depth of a single step, measured nose-to-nose — NOT the physical
board depth. IRC-floored (10″ min by default). Distinct from **tread depth**,
which is the board's actual dimension including nosing overhang.
_Avoid_: going, tread depth (they are different)

**Riser Count**:
The number of risers in the flight. Initially derived as round(Total Rise ÷ max
Rise), then user-adjustable via a ±1 stepper — the primary step-geometry control,
since Rise is derived from it. Drives the "number of steps."
_Avoid_: step count (ambiguous)

**Flight**:
A continuous series of steps between two levels. For a v1 straight run, the
flight is the entire staircase. _Avoid_: run (overloaded)

**Advisory Override**:
A user choice or derived result that falls outside a limit. Permitted but flagged
with a visible warning — never silently accepted or hard-blocked. Two kinds: a
**Code warning** (an IRC rule is violated) and a **Fit warning** (the stair doesn't
fit the physical space, e.g. total run > available run length). Real technical hard
limits are deferred ([ADR 0019](docs/adr/0019-advisory-fit-warnings-reserve-hard-limits.md)).
_Avoid_: exception, violation

**Guard**:
The protective barrier along the open side of the flight — the handrail, balusters,
shoe rail, fillets, and newels together. Present only on an open side; a wall side
has no guard. v1 has exactly one open side, so exactly one guard
([ADR 0018](docs/adr/0018-single-open-side-fixed-v1.md)). _Avoid_: railing, guardrail, banister

**Baluster**:
A vertical infill member running from tread/shoe to handrail, providing guard
infill and style.
_Avoid_: spindle, picket

**Handrail**:
The graspable rail running along the flight that a person holds.
_Avoid_: rail, bannister

**Shoe Rail**:
The bottom rail that runs parallel to the handrail and receives the feet of the
balusters. In v1's part set. _Avoid_: base rail, sub-rail

**Fillet**:
The small filler strips that fit between balusters in the plowed groove of the
handrail and shoe rail. Quantity derives from baluster spacing. In v1's part set.
_Avoid_: infill, spacer

**Cap**:
The decorative top that finishes a newel post (and any exposed rail end). One per
newel in v1's part set. _Avoid_: finial, topper

**Catalog**:
The set of real, purchasable parts offered by a stair-parts seller — the source
of truth for what can be selected and what a purchase order can contain. Product
choices in the configurator are drawn from it; a design can only contain parts
that exist in the catalog.
_Avoid_: inventory, product list

**Style**:
An ornamental geometry family (a baluster style, a newel style) authored once as a
GLTF asset, independent of species. For boxy parts the analogue is a procedural
**profile** (bullnose, square-edge) the renderer extrudes. Geometry is keyed by
Style; material is keyed by species — a SKU references both.
_Avoid_: design, pattern, model

**Anchor & Scale Spec**:
Metadata on an ornamental Style telling the renderer how to place and stretch it:
base/top anchor points (where it meets tread and rail), the single scalable axis
(e.g. height), and fixed-detail zones that must not stretch (turned finials).
_Avoid_: rig, transform

**Product**:
A configurable family of parts of a single part type that a Company offers (e.g.
"Bullnose Tread"). It declares the Option Axes the Configurator shows and maps
their combinations to orderable SKUs.
_Avoid_: item family, model, line

**Option Axis** (Selection Axis):
A *discrete, user-facing* choice on a Product (e.g. species, profile, baluster
style) that renders as a side-panel control. Distinct from a Dimension Binding —
axes are picked, dimensions are computed.
_Avoid_: variant, attribute, option group

**Primary Species**:
A design-level material choice that cascades as the default onto every Product
whose material/finish list contains it (all wood parts default to it). Always
overridable per part; parts that can't honor it (e.g. metal balusters, paint-grade
risers) keep their own default. Picked once, not per part.
_Avoid_: global species, default wood

**Dimension Binding**:
A physical dimension of a Product's part bound to a geometry value (e.g. tread
length = stair width; handrail length = flight length) or a fixed value — computed
by the engine, never a dropdown. Carries a Stocking Rule.
_Avoid_: size option, measurement

**Rail System**:
The coarse compatibility family a set of parts belongs to (e.g. post-to-post vs.
over-the-post), which governs how rails, fittings, newels, and balusters combine.
v1 ships a single Rail System — **post-to-post** (straight rail dying into cap-topped
newels, no curved fittings) — so every part is mutually compatible; `rail_system`
carries a real value in the schema from day one ([ADR 0028](docs/adr/0028-v1-is-post-to-post-rail-system-named-in-schema.md)).
_Avoid_: railing type, kit

**Match Key**:
A reserved compatibility field on a Product (e.g. `plow_width`, `baluster_seat`)
that records a physical-fit constraint. Present from v1 but not enforced by any
rules engine yet — the seam a future compatibility resolver reads.
_Avoid_: fit tag, constraint

**Stocking Rule**:
How a Dimension Binding is satisfied by real stock: `fixed` (one stocked size,
trimmed on site), `stock_lengths` (discrete lengths cut to need — the engine picks
a length and computes how many sticks), or `cut_to_size` (any size within
min/max). Drives SKU resolution, quantity, and the cut list.
_Avoid_: sizing mode, cut rule

**SKU**:
The orderable resolution of a Product's Option Axis values — a concrete part with
a fixed species/profile/style and fixed stock dimensions. The atomic unit a
purchase order is built from. Carries no price of its own — pricing lives in a
separate per-company Price Sheet.
_Avoid_: part number, item

**Price Sheet**:
A per-company set of prices layered over the catalog. Different companies/dealers
see different prices for the same SKU. Deferred — not in v1; the data model
anticipates it by keeping price out of the SKU.
_Avoid_: pricing, rate card

**Purchase Order** (PO):
The document generated at the end of a design that lists the configured parts
(SKUs, quantities, cut dimensions) and is delivered by email to a stair-parts
seller. Carries no prices in v1, so it functions as a **Request for Quote** — the
buyer-facing act is "Request Quote," the seller replies with a price. Captures
**required buyer contact** (a reply-to) at submit; the buyer also gets a confirmation
carrying the Share Link ([ADR 0025](docs/adr/0025-po-is-an-rfq-required-buyer-contact.md)).
`purchase_order` stays the internal name for the priced end state.
_Avoid_: order, cart (RFQ is what it *does* in v1, PO is what it *is*)

**Stair-Parts Seller**:
The external vendor who receives a purchase order and fulfills the parts. In the
mature product this is the same entity as the **Company** — the tenant embeds the
configurator on its own site and receives its customers' POs. In v1 there is one
implicit test seller.
_Avoid_: supplier, vendor, merchant

**Company** (Tenant):
A stair-parts business that licenses the configurator to embed on its own website,
bringing its own catalog, price sheet, and branding. The unit of tenancy. Deferred
to a later phase — v1 runs single-tenant and anonymous — but the data model scopes
catalog and pricing per Company from the start.
_Avoid_: tenant (in UI copy), client, account, org
