import test from 'node:test';
import assert from 'node:assert/strict';
import {buildFixtures, serializeFixtures} from './fixtures.mjs';

test('bundle is deterministic with six unique case IDs and no execution claims',()=>{
  assert.equal(serializeFixtures(),serializeFixtures());
  const b=buildFixtures(); assert.equal(b.cases.length,6); assert.equal(new Set(b.cases.map(c=>c.id)).size,6);
  assert.equal(b.executed,false); assert.ok(b.cases.every(c=>!c.executed && c.outcome==='not_tested'));
});
test('repeat keeps exact event content while distinguishing delivery attempts',()=>{
  const [a,b]=buildFixtures().cases[0].deliveries;
  assert.deepEqual(a.event,b.event); assert.notEqual(a.delivery_id,b.delivery_id);
  assert.deepEqual(buildFixtures().cases[0].planned_delivery_groups,[['delivery_1'],['delivery_2']]);
});
test('same intent varies event ID only',()=>{
  const [a,b]=buildFixtures().cases[1].deliveries.map(d=>d.event);
  assert.notEqual(a.event_id,b.event_id); assert.deepEqual({...a,event_id:b.event_id},b);
});
test('conflict preserves ID and changes data without altering baseline elsewhere',()=>{
  const bundle=buildFixtures();const [a,b]=bundle.cases[2].deliveries.map(d=>d.event);
  assert.equal(a.event_id,b.event_id);assert.notDeepEqual(a.data,b.data);assert.equal(bundle.cases[0].deliveries[0].event.data.revision,1);
});
test('tenant case varies tenant only, with the same scoped IDs',()=>{
  const [a,b]=buildFixtures({tenant:'test',entity:'record'}).cases[3].deliveries.map(d=>d.event);
  assert.equal(b.tenant_id,'test-other');assert.deepEqual({...a,tenant_id:b.tenant_id},b);
});
test('reversed case delivers update revision2 then create revision1',()=>{
  const rows=buildFixtures().cases[4].deliveries.map(d=>d.event);
  assert.deepEqual(rows.map(e=>[e.operation,e.data.revision]),[['update_record',2],['create_record',1]]);
});
test('parallel plan is explicit and is not a concurrent execution',()=>{
  const c=buildFixtures().cases[5];assert.equal(c.execution_mode,'parallel_required');assert.equal(c.executed,false);
  assert.deepEqual(c.deliveries[0].event,c.deliveries[1].event);
  assert.deepEqual(c.planned_delivery_groups,[['delivery_1','delivery_2']]);
});
test('mutating one delivery cannot mutate another case or a later bundle',()=>{
  const b=buildFixtures();b.cases[0].deliveries[0].event.data.status='tampered';
  assert.equal(b.cases[0].deliveries[1].event.data.status,'created');assert.equal(buildFixtures().cases[0].deliveries[0].event.data.status,'created');
});
test('labels cannot be URLs, markup, whitespace, oversized or non-string values',()=>{
  for(const value of ['', 'https://example.com', '<script>', 'two words', 'x'.repeat(49), 5, {}, null]) assert.throws(()=>buildFixtures({tenant:value}));
  assert.doesNotThrow(()=>buildFixtures({tenant:'x'.repeat(48)}));
});
test('reject unsupported options and non-object options',()=>{
  for(const options of [null,[],1,'x',{endpoint:'https://example.com'},{payload:{}}]) assert.throws(()=>buildFixtures(options));
});
test('JSON export preserves exact fixture structure and explicit limitations',()=>{
  const decoded=JSON.parse(serializeFixtures({tenant:'demo',entity:'r1'}));assert.deepEqual(decoded,buildFixtures({tenant:'demo',entity:'r1'}));
  assert.equal(decoded.provider_compatibility,'none');assert.match(decoded.isolation,/TEST state/);
});
