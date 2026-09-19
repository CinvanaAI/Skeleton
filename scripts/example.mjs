import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

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
async function request(route,body){const response=await fetch(api+route,{...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});return {status:response.status,body:await response.json()}}
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
 const result={example:'Text Normalizer: draft to recorded execution',input,unpublished_request:{http_status:refused.status,status:refused.body.executorRun.status,reasons:refused.body.executorRun.permissionDenials},validation:checked.body.ok,published_version:published.body.publishedRelease.version,execution:{status:run.body.executorRun.status,output},external_model_calls:0,scope:'Actual local runtime and Python execution with synthetic text. This is not a security sandbox.'};
 await writeFile(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
 console.log('Result and complete local runtime records retained in the selected output directory.');
}finally{
 const stopped=new Promise(resolve=>runtime.once('exit',resolve));
 if(runtime.exitCode===null){runtime.kill();await stopped}
}
