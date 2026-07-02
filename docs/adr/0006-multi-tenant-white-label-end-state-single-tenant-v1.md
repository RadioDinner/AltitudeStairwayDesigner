# End state is a multi-tenant white-label widget; v1 is single-tenant and anonymous

The product's end state is an embeddable, white-label stair configurator that
stair-parts companies license and place on their own websites. Each Company is a
tenant with its own catalog, per-company price sheet (ADR 0005), and branding;
its site visitors design stairs and POs route to that Company.

v1 is a single-tenant, anonymous test harness (ADR: anonymous-first users): one
implicit catalog, no login, POs emailed to one configured address. The goal of v1
is to prove the configurator and PO flow, not to onboard companies.

Architectural implication now: even though v1 is single-tenant, catalog, pricing,
branding, and PO routing are all scoped by Company from the start so the jump to
multi-tenant is additive, not a rewrite. Global singletons for catalog/branding
are avoided.

Why record this early: multi-tenancy and embeddability (iframe/widget isolation,
per-tenant theming, tenant-scoped data) are expensive to retrofit. Building v1's
data model tenant-aware — while keeping the running system single-tenant — is
cheap now and avoids a rewrite later.
