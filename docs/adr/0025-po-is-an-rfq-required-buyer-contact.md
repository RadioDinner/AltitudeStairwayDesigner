# The PO is an RFQ; buyer contact is captured and required at submit

In v1 the generated document is a **Request for Quote in a Purchase Order's clothing**.
Because v1 carries **no pricing** ([ADR 0005](0005-no-pricing-in-v1-future-per-company-price-sheets.md)),
the seller's response to a submission is a **quote**, not a fulfillment. So:

- **Internal name stays `purchase_order`** — the entity, snapshot model
  ([ADR 0014](0014-hybrid-postgres-storage-relational-core-jsonb-config.md)), and
  glossary term are unchanged, avoiding churn now and matching the priced end state.
- **Buyer-facing framing is a quote request** — the submit action reads "Request
  Quote" (or similar), not "Place Order," so no one believes they've bought anything.

## Buyer contact is required

Anonymous while you **design**; identified the moment you **transact**. At submit the
flow captures **required buyer contact** (name + email, optionally phone / ZIP). This
is not an optional field — an RFQ with no reply-to is a **dead letter**: the seller
receives a parts list from nobody and cannot send the quote back. This is the single
point where the no-login stance ([ADR 0006](0006-multi-tenant-white-label-end-state-single-tenant-v1.md))
must yield.

On submit:

- The **seller** gets the parts list **plus the buyer's contact** and the Share Link.
- The **buyer** gets a **confirmation email** carrying their Share Link (their
  read-only receipt — [ADR 0020](0020-draft-autosave-share-link-from-start.md)), so
  they know the request landed.

## Consequence

- The `purchase_order` snapshot gains **buyer contact** fields.
- Two emails leave on submit (seller RFQ, buyer confirmation), both carrying the
  Share Link.
- If future testing shows required contact hurts completion, revisit — but a
  contactless RFQ has no one to fulfill, so the default is required.
