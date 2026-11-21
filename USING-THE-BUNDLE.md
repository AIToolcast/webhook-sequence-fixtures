# Use a fixture bundle

The download is a set of fictional delivery plans, not a workflow, webhook sender or test report. Keep the original JSON as an input artifact. Record actual results separately.

## Read one case first

Open `example-bundle.json` or your downloaded bundle and find `cases` → `exact-repeat`.

- `delivery_id` identifies an attempt in this plan. The two attempts have different delivery IDs.
- `event.event_id` identifies the fictional event. Both attempts carry `evt_demo_1`.
- `planned_delivery_groups` contains two separate groups: finish the first attempt before starting the second in a sequential test.
- `executed: false` and `outcome: "not_tested"` describe this generator's work. They are not results from your system.

For the fictional create operation, a useful question is whether a completed first delivery followed by its repeat creates one record or two. Decide the intended behavior from your actual integration contract before adapting the example. A failed first attempt needs a separate recovery decision; silently dropping every repeated ID can lose unfinished work.

## Adapt only in an isolated test environment

1. Choose one case and write down the expected destination effect, identity scope and recovery behavior. Use fictional records and an isolated destination.
2. Map each `event` to the input shape your own test harness accepts. This JSON is not an n8n workflow export or a Stripe/Shopify event. Importing it as a workflow will not create a runnable test.
3. Prepare fresh test state for that case. The generator does not clear state, create credentials, sign payloads or send requests.
4. Have your existing test harness carry out the plan. Preserve attempt IDs separately from event and business-operation IDs.
5. Inspect the destination state and side effects, not just HTTP status or a green workflow execution. Save the observations below separately from the unchanged fixture file.

The `concurrent-repeat-plan` case requires an external harness that actually overlaps delivery attempts. Running its two events one after the other is only a sequential test and cannot demonstrate atomic duplicate handling. None of these cases establishes production safety or crash recovery.

## Record an observation

Copy this checklist into your own test record; no result is filled in for you:

```text
Fixture file and case ID:
Fixture version and fictional labels:
Test environment / workflow version:
Expected effect and source of that expectation:
State reset/preparation performed:
Actual execution time and attempt IDs:
Sequential completion order or evidence of real overlap:
Observed destination records and other side effects:
Observed failure/recovery behavior:
Evidence files or execution references:
Result: not tested / inconclusive / expectation met / expectation not met
Uncovered cases and limitations:
```

## Inspect the bundle offline

This command reads the shipped example and prints the exact-repeat plan. It sends nothing and does not execute a workflow:

```sh
node --input-type=module -e "import {readFileSync} from 'node:fs'; const b=JSON.parse(readFileSync('example-bundle.json','utf8')); const c=b.cases.find(x=>x.id==='exact-repeat'); console.log(JSON.stringify({executed:b.executed, groups:c.planned_delivery_groups, events:c.deliveries.map(x=>({delivery:x.delivery_id,event:x.event.event_id}))},null,2));"
```

The repository's `node --test fixtures.test.mjs` checks the generator's data contract. Passing those tests is not a test of your integration.
