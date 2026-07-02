# Active warnings freeze onto the PO; an acknowledgment gate precedes submit

Advisory Overrides never block ([ADR 0003](0003-irc-enforcement-with-advisory-overrides.md)),
so an RFQ ([ADR 0025](0025-po-is-an-rfq-required-buyer-contact.md)) can be submitted
for a design with live **Code** or **Fit** warnings (sub-10″ run, failed headroom,
handrail-too-long, etc.). Two things make that safe rather than silent.

## Warnings are part of the snapshot

The active Advisory Overrides **freeze onto the `purchase_order` snapshot**
([ADR 0014](0014-hybrid-postgres-storage-relational-core-jsonb-config.md)) alongside
the line-items, and **print on both the seller RFQ and the buyer confirmation**.

Why: if warnings die in the browser, the seller receives clean SKUs and may quote
and cut a **knowingly code-non-compliant staircase** with no idea it was flagged — a
liability that lands on the seller, originating from this tool. Freezing them means
the seller quotes with eyes open and the record shows the design was flagged at
submit time.

## An acknowledgment gate precedes submit

When any warning is active, submit is preceded by a **one-tap acknowledgment**
("this design has N warnings — request quote anyway?"). This is **not a block** — the
never-block stance holds — but it makes the override a **deliberate act, not an
accident**. With no warnings active, there is no gate; submit is frictionless.

## Consequence

- The `purchase_order` snapshot gains a **frozen warnings** field; the PDF/email
  templates render it for both recipients.
- The submit flow branches on "any active warning": gate if yes, straight through if
  no.
