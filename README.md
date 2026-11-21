# Webhook Sequence Fixtures

Create a deterministic bundle of six fictional webhook delivery scenarios for a workflow builder to inspect and adapt in an isolated test environment. [Open the free browser tool](https://aitoolcast.com/tools/webhook-sequence-fixtures/) or run the interface, generator and tests locally.

The question is whether a small, labeled sequence bundle saves useful preparation work compared with hand-written arrays, native pinned data and provider test tools. That convenience is a hypothesis, not measured user demand.

## Run locally

For the browser interface, run `python serve.py` and open `http://127.0.0.1:8780/`. For generator tests, use Node.js 18 or later. No packages are required.

```sh
node --test fixtures.test.mjs
node --input-type=module -e "import {serializeFixtures} from './fixtures.mjs'; console.log(serializeFixtures())"
```

`buildFixtures({tenant: 'demo-team', entity: 'demo-record'})` accepts only short fictional labels. It does not accept an endpoint, credentials or a real payload. `serializeFixtures()` returns a JSON string. The saved `example-bundle.json` is a deterministic example, not an execution result.

## Cases

1. Exact repeat: same event, separate delivery attempts.
2. New event ID, same stated fictional create intent.
3. Same event ID, conflicting fictional content.
4. Same local IDs in separate fictional tenants.
5. Update revision 2 delivered before create revision 1.
6. A plan for overlapping duplicates, which requires a separate runner.

Every case contains review questions and `outcome: "not_tested"`. `planned_delivery_groups` identifies the intended order: separate groups are sequential; the parallel-plan case puts both deliveries in one group for an external runner to overlap. Nothing is executed by those labels. There are no pass/fail assertions about a real system. Each case requires fresh/reset **test** state; this tool does not reset anything. The fictional contract is not a provider schema or a universal deduplication rule. In particular, event identity, business-operation identity and tenant scope must be established for the actual integration.

The changed-content case deliberately contradicts an immutable-event contract. It is not normal Stripe retry behavior: Stripe documents that created Event objects do not change. Distinct event IDs with similar content likewise do not automatically mean they should be deduplicated.

The generator sends no HTTP requests, stores no inputs and executes no workflow. The linked site privacy notice covers ordinary requests for the hosted tool. Links can take you to other sites. A sequential bundle cannot test atomicity. Crash recovery and actual destination outcomes need separate controlled tests. Do not send these examples to a production endpoint.

## Evidence and alternatives

Two first-person n8n reports motivate the problem class, not demand for our tool:

- [Duplicate orders](https://community.n8n.io/t/duplicate-orders/312811) — September 2026, concurrent checks and downstream recovery.
- [Multiple webhook retries](https://community.n8n.io/t/way-to-prevent-duplicate-workflow-executions-from-multiple-webhook-retries/295919) — May 2026, duplicate executions and effects.

[Stripe's webhook guidance](https://docs.stripe.com/webhooks) documents retries, duplicates and event-order limitations for Stripe. Our generic fixtures do not implement Stripe's schema or authentication. [n8n's idempotency guide](https://blog.n8n.io/idempotency-api/) provides production-pattern context; this artifact implements none of those controls.

Native n8n pinned data, provider dashboard/CLI replay and existing generic payload generators already cover much of testing. Use these fixtures alongside those tools and verify the actual destination behavior in isolated test state. Developed with AI assistance by AI Toolcast.

The interface reuses AI Toolcast’s MIT-licensed Item Linking Lab stylesheet. Editing either label invalidates the old bundle until generation succeeds; no stale download is offered.

See [Use a fixture bundle](USING-THE-BUNDLE.md) for an exact-repeat walkthrough, the distinction between this JSON and a runnable workflow, and a separate observation checklist.
