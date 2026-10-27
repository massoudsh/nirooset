# Iranian energy-device shop roadmap

Publication status: scheduled through the repository workflow in `.github/workflows/sync-roadmap.yml`. Its canonical, idempotent input is `docs/github-planning.json`; a push changing either file, or a manual workflow dispatch, creates only missing exact-title milestones/issues and assigns matching issues to their planned milestone. GitHub Actions must be enabled and allow `issues: write`. The GitHub CLI session is not required. Milestone names below are proposed, without invented due dates or issue numbers.

## M1 — Trustworthy shop foundation

Goal: make the existing demo usable without pretending it is a live retailer.

### Repair catalog filtering and disclose demo commerce
- Implementation included: category/brand IDs, working price/name sorting, Wh-only capacity ranges, removal of displayed sample reviews, explicit sample prices/stock and simulated checkout disclosures.
- Acceptance: regression tests pass; unknown capacity units never match energy bounds; no wallet needed to browse/use demo cart; no promises of credits or shipping.
- Remaining verification: manual UI review outside this environment.

### Transparent backup runtime calculator
- Implementation included: nominal Wh × usable percentage ÷ actual watts, input validation and assumption/compatibility/ISP caveats.
- Acceptance: 40 Wh at 80% usable and 10 W gives 3.2 hours; invalid values give no estimate; no inferred voltage or guaranteed runtime.
- Remaining verification: manual UI review outside this environment.

### Persian retail experience and storefront separation
- Priority: high. Reuse the existing i18n issue where applicable.
- Acceptance: Persian RTL catalog/cart/forms, accessible labels and keyboard flows, mobile layouts, clear shop navigation, no wallet requirement for retail; protocol dashboard remains accessible separately.
- Decision needed: independent storefront versus shop within current app; do not migrate protocol routes without agreement.

### Verified catalog and compatibility schema
- Priority: high. Depends on supplier evidence.
- Acceptance: actual SKU/model, source and verification date, nominal Wh, voltage/current, connector dimensions/polarity, PD profiles, continuous/peak output, warranty provider and evidence; explicit unknown fields; no fabricated reviews or stock.
- Begin with modem/router UPS, supported laptop power banks, lighting and compatible accessories. Larger stations can be quote-only until supply is confirmed.

## M2 — Real orders and payments

Launch gate: no real payment button before every issue in this milestone is verified.

### Order backend, inventory and price validity
- Priority: high. Depends on verified catalog and approved hosting/backend choice.
- Acceptance: server-authoritative totals, integer money amounts, stock reservations with expiry, atomic decrement and cancellation release, idempotent order creation, explicit order status transitions and restricted administration.
- Record replacement cost, supplier availability timestamp and quote expiry; do not silently substitute stale prices.

### Iranian payment integration and currency safety
- Priority: high. Depends on provider account and order backend.
- Acceptance: explicit toman display/rial gateway conversion; server-side verification of amount, merchant reference and successful payment; duplicate callbacks cannot double-fulfill; failed/canceled payments release reservations; refund/reconciliation workflow tested.
- Provider credentials stay server-side and never enter browser bundles or logs.

### Guest checkout, receipts and order tracking
- Priority: high. Depends on orders/payments.
- Acceptance: phone/address validation, guest tracking with appropriate access controls, minimal personal data collection and retention, receipt with real order status; wallet linking optional and never required.
- Verify applicable merchant, privacy and sales obligations before launch.

## M3 — Office fulfillment and after-sales

### Battery shipping eligibility and office pickup
- Priority: high. Depends on office location and carrier confirmation.
- Acceptance: carrier-confirmed lithium battery restrictions for each SKU/route, permitted packaging and labels, documented dispatch cutoff and pricing; reject unsupported shipping combinations; pickup address/hours published only after approval.
- Being next to a post office is not evidence batteries will be accepted.

### Serial tracking, bench tests and warranty/returns
- Priority: high. Depends on actual stock and supplier warranty terms.
- Acceptance: record serial and condition before dispatch; switching/runtime tests include load, method, date and measured results; publish truthful warranty and return terms; support tickets link to order/serial with restricted access.

### Supplier and cash-flow operations
- Priority: high. Depends on business-only budget and supplier quotes.
- Acceptance: track replacement cost, packing/shipping, fees, acquisition cost, return reserve and contribution margin separately; reorder threshold and stock age report; keep personal/marriage savings separate from inventory funding.
- No revenue or margin guarantees. Start with limited verified stock rather than broad speculative inventory.

## M4 — Evidence-based AI assistance

### Device-label extraction with human confirmation
- Priority: medium. Depends on verified compatibility schema and explicit AI service/privacy approval.
- Acceptance: user consents to label-image processing; extracted voltage/current/polarity/model include confidence and visible source; user confirms values; uncertain labels require manual entry; uploaded images are not retained unnecessarily.

### Rule-based compatibility with AI explanations
- Priority: medium. Depends on validated device and product data.
- Acceptance: deterministic voltage/polarity/connector/PD/output-power rules decide compatibility; unknowns block a definitive recommendation; AI explains sourced results but cannot invent stock, specifications or safe electrical connections.
- Use measured runtime evidence where available; otherwise show an estimate and assumptions, not a promise. Test incompatible and incomplete-data cases.

## M5 — Sustainable growth

### B2B backup assessments and installation referrals
- Priority: medium. Depends on successful fulfillment and qualified partners.
- Acceptance: opt-in office/shop load survey, quote with assumptions and expiry, approved installation partner handoff, clear responsibility and warranty boundaries; no unsafe DIY mains advice.

### Retail conversion and unit economics reporting
- Priority: medium. Depends on live commerce and privacy consent.
- Acceptance: distinguish browsing, quotes, paid orders, delivery, returns and net contribution; exclude demo events; report acquisition spend and replacement-cost margin; aggregate data and minimize personal identifiers.

## Separate protocol hardening backlog

Keep retail launch milestones separate from protocol financial-security work. Deduplicate against `docs/NEW_ISSUES.md` BUG-1 through BUG-8 and existing GitHub issues before assigning a dedicated Protocol correctness milestone.

- Auction lifecycle is implemented; run/update all affected tests before closing its issue.
- Record-only settlement is implemented but still needs consistent accounting tests and review of non-uniform market pricing versus reported payment amounts.
- Remaining work: release unfilled collateral; true uniform-price clearing; oracle report consistency; executable governance; authorized dispute workflow.
- Acceptance for each: focused regression tests, clear invariants and independent review before any production financial deployment. Do not treat unexecuted Forge tests as passing.

## Publication checklist

1. Restore GitHub API authentication through the project's approved integration; never paste tokens into chat.
2. Query all existing issues and milestones in `massoudsh/nirooset` before writing.
3. Create/reuse M1–M5 milestones and a separate protocol milestone; do not invent dates.
4. Reuse overlapping issues, attaching acceptance criteria and dependencies; create missing issues from headings above.
5. Link implementation commits to foundation issues, leaving visual verification open.
6. Record actual GitHub URLs only after successful creation. This file is not evidence of publication.
