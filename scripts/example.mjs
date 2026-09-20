import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
if(args.length && (args.length!==2 || args[0]!=='--out'))throw Error('Usage: node scripts/example.mjs --out NEW_DIRECTORY');
const out=path.resolve(args[1]||path.join(project,'.demo-runs','run-'+Date.now()));
await mkdir(path.dirname(out),{recursive:true});
await mkdir(out); // A previous run is never overwritten.
const port=await new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))})});
const runtime=spawn(process.execPath,['dist/apps/runtime/src/server.js'],{cwd:project,env:{...process.env,PORT:String(port),SKELETON_PROJECT_ROOT:project,SKELETON_DATA_ROOT:path.join(out,'runtime'),SKELETON_LEGACY_ROOT:''},stdio:['ignore','pipe','pipe'],windowsHide:true});
let log='';runtime.stdout.on('data',b=>log+=b);runtime.stderr.on('data',b=>log+=b);
const api='http://127.0.0.1:'+port+'/api';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function request(route,body,method='POST'){const response=await fetch(api+route,{...(body?{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});return {status:response.status,body:await response.json()}}
try{
 let ready=false;
 for(let n=0;n<100;n++){if(runtime.exitCode!==null)throw Error('Runtime exited during setup. '+log);try{ready=(await request('/framework/bootstrap')).status===200;if(ready)break}catch{}await sleep(100)}
 if(!ready)throw Error('Runtime did not become ready.');
 const route='/capability-platform/packages/cap.text.normalizer';
 const input={value:'  hello   world  '};
 const action={requestedByOwnerId:'capability-platform',surfaceId:'published',payload:input};
 const refused=await request(route+'/actions/run',action);
 assert.equal(refused.status,403);assert.equal(refused.body.executorRun.status,'denied');
 const checked=await request(route+'/validate',{});assert.equal(checked.status,200);assert.equal(checked.body.ok,true);
 const published=await request(route+'/publish',{});assert.equal(published.status,200);assert.ok(published.body.publishedRelease);
 const run=await request(route+'/actions/run',action);assert.equal(run.status,200);assert.equal(run.body.executorRun.status,'complete');
 const output=run.body.executorRun.outputs.map(o=>{try{return JSON.parse(o.body)}catch{return null}}).find(o=>o?.output)?.output;
 assert.equal(output,'hello world');
 const firstRelease=published.body.publishedRelease;
 const steps=[];
 function recordExecution(step,response,release,expected){
  assert.equal(response.status,200);
  assert.equal(response.body.executorRun.status,'complete');
  assert.equal(response.body.authorization.releaseId,release.releaseId);
  assert.equal(response.body.evidence.releaseId,release.releaseId);
  assert.equal(response.body.evidence.executorRunId,response.body.executorRun.runId);
  const actual=JSON.parse(response.body.executorRun.outputs[0].body).output;
  assert.equal(actual,expected);
  steps.push({step,operation:'POST /capability-platform/packages/cap.text.normalizer/actions/run',
   http_status:response.status,release_version:release.version,input,output:actual,
   authorization_matches_release:true,action_record_matches_executor:true});
 }
 recordExecution('published v1',run,firstRelease,'hello world');
 const changedSource="def normalize_text(value):\n    return ' '.join(str(value).split()).upper()\n";
 const draft={...published.body.package.draft,sourceText:changedSource};
 const saved=await request(route+'/draft',draft,'PUT');assert.equal(saved.status,200);
 assert.equal(saved.body.package.draft.sourceText,changedSource);
 const afterDraft=await request(route+'/actions/run',action);
 recordExecution('draft edited; v1 still selected',afterDraft,firstRelease,'hello world');
 const rechecked=await request(route+'/validate',{});assert.equal(rechecked.status,200);assert.equal(rechecked.body.ok,true);
 const second=await request(route+'/publish',{});assert.equal(second.status,200);assert.equal(second.body.publishedRelease.version,2);
 const secondRun=await request(route+'/actions/run',action);
 recordExecution('published v2',secondRun,second.body.publishedRelease,'HELLO WORLD');
 const rollback=await request(route+'/rollback',{releaseId:firstRelease.releaseId});
 assert.equal(rollback.status,200);assert.equal(rollback.body.publishedRelease.version,3);
 const restored=await request(route+'/actions/run',action);
 recordExecution('rollback republishes v1 source as v3',restored,rollback.body.publishedRelease,'hello world');
 const history=await request(route);assert.equal(history.status,200);
 assert.deepEqual(history.body.releases.find(release=>release.releaseId===firstRelease.releaseId),firstRelease);
 assert.equal(history.body.releases.length,3);
 const trace={example:'One input across draft edits, releases and rollback',package_id:'cap.text.normalizer',
  changed_draft_source:changedSource,steps,
  retained_releases:history.body.releases.map(release=>({version:release.version,entrypoint:release.entrypoint,
   source:release.forms.source,source_sha256:createHash('sha256').update(release.forms.source).digest('hex')})),
  original_release_record_unchanged:true,external_model_calls:0,
  evidence_note:'Public projection of actual local HTTP/Python results. Full identifiers and records remain in the local runtime directory.'};
 const result={example:'Text Normalizer: draft to recorded execution',input,unpublished_request:{http_status:refused.status,status:refused.body.executorRun.status,reasons:refused.body.executorRun.permissionDenials},validation:checked.body.ok,published_version:firstRelease.version,execution:{status:run.body.executorRun.status,output},version_flow:steps.map(({step,release_version,output})=>({step,release_version,output})),original_release_record_unchanged:true,external_model_calls:0,scope:'Actual local runtime and Python execution with synthetic text. This is not a security sandbox.'};
 await writeFile(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');
 await writeFile(path.join(out,'trace.json'),JSON.stringify(trace,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
 console.log('Result and complete local runtime records retained in the selected output directory.');
}finally{
 const stopped=new Promise(resolve=>runtime.once('exit',resolve));
 if(runtime.exitCode===null){runtime.kill();await stopped}
}
