# Draft autosave with a Share Link from the first edit

A Design persists **continuously from the first edit**, not only at PO submit. A
Share Link (unguessable UUID) is minted when the Configurator opens, and the draft
autosaves as the user edits — so a user can close the tab and reopen their
in-progress Design from the same URL.

Why: v1 exists to measure **user desirability** ([PLAN](../PLAN.md)). Users who
abandon before generating a PO are the most important signal — where they gave up,
what they configured, how long they lasted. A persist-on-submit model would throw
away exactly that cohort and give no crash recovery. Continuous drafts also give
the best resume UX.

## Relationship to the PO snapshot

This does not change the frozen-snapshot model
([ADR 0014](0014-hybrid-postgres-storage-relational-core-jsonb-config.md)): the
`purchase_order` is still an immutable snapshot taken at submit, unaffected by later
catalog or design edits. What changes is only that a **draft `design` row exists
before submit** and updates live, rather than being written once at PO time.

## Consequences

- **Share Link definition changes** — the link is minted at design start, not at PO
  generation ([CONTEXT.md](../../CONTEXT.md)). The unguessable-UUID-as-only-access-
  control story now covers half-finished drafts too.
- **Drafts accumulate** — every visitor (including tire-kickers) mints a link and a
  row. Cleanup / TTL for abandoned drafts is **deferred**; note it as a future
  housekeeping seam, not a v1 concern.

## Open (grill next)

Whether a Design stays editable **after** a PO is generated — i.e. does reopening
the Share Link post-submit resume an editable draft (and allow a second PO), or lock
to a read-only view of what was ordered.
