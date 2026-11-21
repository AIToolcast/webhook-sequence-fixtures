// Synthetic, provider-neutral fixtures. This module does not send or process events.
const LABEL = /^[A-Za-z0-9_-]{1,48}$/;
const copy = value => JSON.parse(JSON.stringify(value));
export const isValidLabel = value => typeof value === 'string' && LABEL.test(value);

export function buildFixtures(options = {}) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Options must be an object.');
  for (const key of Object.keys(options)) {
    if (!['tenant', 'entity'].includes(key)) throw new TypeError('Only fictional tenant and entity labels are supported.');
  }
  const tenant = options.tenant === undefined ? 'demo-tenant-a' : options.tenant;
  const entity = options.entity === undefined ? 'demo-record-1' : options.entity;
  for (const value of [tenant, entity]) {
    if (!isValidLabel(value)) throw new TypeError('Use a fictional label of 1–48 ASCII letters, digits, hyphens or underscores.');
  }
  const base = {event_id:'evt_demo_1', tenant_id:tenant, operation:'create_record', entity_id:entity, data:{revision:1, status:'created'}};
  const delivery = (id, event) => ({delivery_id:id, event:copy(event)});
  const item = (id, title, mode, events, questions) => ({
    id, title, execution_mode:mode, executed:false, outcome:'not_tested',
    deliveries:events.map((event, i)=>delivery(`delivery_${i+1}`, event)),
    planned_delivery_groups:mode === 'parallel_required'
      ? [events.map((_, i)=>`delivery_${i+1}`)]
      : events.map((_, i)=>[`delivery_${i+1}`]),
    review_questions:questions,
  });
  const sameIntent = {...base, event_id:'evt_demo_2'};
  const conflicting = {...base, data:{revision:2, status:'changed'}};
  const otherTenant = {...base, tenant_id:`${tenant}-other`};
  const laterRevision = {...base, event_id:'evt_demo_2', operation:'update_record', data:{revision:2, status:'updated'}};
  return {
    format:'aitoolcast.webhook-sequence-fixtures/v1', version:'0.1.0',
    synthetic:true, provider_compatibility:'none', executed:false,
    labels:{tenant, entity},
    isolation:'Each case is independent. Use fresh or reset TEST state between cases; this tool does not reset anything.',
    limits:[
      'This is a case bundle, not a sender, runner, validator or idempotency implementation.',
      'No network request, signature, account action, payment or real side effect occurs.',
      'Fictional event fields are not a Stripe, Shopify or n8n API contract.',
      'A completed delivery, HTTP success or selected key is not proof of a correct business outcome.',
      'Concurrency and crash recovery require an actual controlled test runner and outcome inspection.',
    ],
    cases:[
      item('exact-repeat', 'Repeat the same event', 'sequential', [base, base], [
        'After the first delivery is confirmed complete, what happens when the identical event is delivered again?',
        'Inspect the destination outcome, not only the execution status. If the first attempt failed, determine recovery separately.',
      ]),
      item('same-intent-new-event', 'Different event IDs, same fictional create intent', 'sequential', [base, sameIntent], [
        'For this scenario, the stated intent is one create_record action for this tenant and entity. Does event-ID-only deduplication meet that intent?',
        'Real producers may give similar events different meanings. Define the business contract before choosing a key.',
      ]),
      item('conflicting-content', 'Contradictory fixture: same event ID, changed content', 'sequential', [base, conflicting], [
        'How will a conflicting payload for an already observed event ID be surfaced for investigation?',
        'This deliberately contradicts an immutable-event contract. It is an anomaly fixture, not normal Stripe retry behavior or a claim that a provider mutates event objects.',
      ]),
      item('tenant-boundary', 'Same local IDs, different fictional tenants', 'sequential', [base, otherTenant], [
        'This fictional contract scopes event and entity IDs by tenant. Does processing one tenant suppress or affect the other?',
        'Establish your actual producer and destination identity scopes; do not assume this fixture matches them.',
      ]),
      item('reversed-revisions', 'Later fictional revision arrives first', 'sequential', [laterRevision, base], [
        'What happens when the create_record event arrives after the update_record event?',
        'Is revision meaningful for your producer? This fixture does not prescribe timestamp sorting or automatic rejection of older events.',
      ]),
      item('concurrent-repeat-plan', 'Plan an overlapping duplicate delivery', 'parallel_required', [base, base], [
        'Use an isolated runner to overlap both deliveries. A sequential run cannot establish atomicity.',
        'Inspect the actual destination outcome and failure recovery. This bundle does not create concurrency or prove a lock works.',
      ]),
    ],
  };
}

export function serializeFixtures(options = {}) {
  return JSON.stringify(buildFixtures(options), null, 2) + '\n';
}
