import {buildFixtures, isValidLabel} from './fixtures.mjs';
const $ = id => document.getElementById(id);
let bundle = null;
function renderCase() {
  if (!bundle) return;
  const selected = bundle.cases.find(c => c.id === $('case').value);
  $('mode').textContent = selected.execution_mode === 'parallel_required' ? 'Overlap plan: requires a separate test runner. No concurrent execution has occurred.' : 'Sequential plan: delivery groups are listed in intended order. Nothing has been executed.';
  $('questions').replaceChildren(...selected.review_questions.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
  $('preview').textContent=JSON.stringify(selected,null,2);
}
function invalidate() {
  bundle=null;
  for (const id of ['tenant','entity']) { $(id).removeAttribute('aria-invalid'); $(id+'-error').textContent=''; }
  $('case').disabled=true;$('download').disabled=true;
  $('case').replaceChildren();$('questions').replaceChildren();
  $('preview').textContent='Build fixtures to preview a case.';$('mode').textContent='';
  $('status').textContent='Labels changed. Build a new bundle before downloading.';$('download-status').textContent='';
}
function generate(event) {
  event?.preventDefault();
  const invalid = ['tenant','entity'].filter(id=>!isValidLabel($(id).value));
  if (invalid.length) {
    invalidate();
    for (const id of invalid) {
      $(id).setAttribute('aria-invalid','true');
      $(id+'-error').textContent=`${id === 'tenant' ? 'Tenant' : 'Record'} label: use 1–48 letters, digits, hyphens or underscores.`;
    }
    $('status').textContent='Check the highlighted label fields.';$(invalid[0]).focus();return;
  }
  try {
    bundle=buildFixtures({tenant:$('tenant').value,entity:$('entity').value});
    $('case').replaceChildren(...bundle.cases.map(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.title;return o;}));
    $('case').disabled=false;$('download').disabled=false;
    $('status').textContent='Six fictional cases prepared. No events executed; no outcomes tested.';$('download-status').textContent='';
    renderCase();
  } catch(error) {invalidate();$('status').textContent=error.message;}
}
$('form').addEventListener('submit',generate);
for(const id of ['tenant','entity']) $(id).addEventListener('input',invalidate);
$('case').addEventListener('change',renderCase);
$('download').addEventListener('click',()=>{
  if (!bundle) return;
  const data=JSON.stringify(bundle,null,2)+'\n';const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='webhook-sequence-fixtures.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);$('download-status').textContent='Download requested. The bundle contains fictional plans and review questions, not test results.';
});
generate();
