import assert from 'node:assert/strict';
import {handleAI} from '../server/teaching.mjs';
import handler from '../api/teaching.mjs';
const original=globalThis.fetch;
const env={DEEPSEEK_API_KEY:'test-only-key',ALLOWED_ORIGINS:'https://test.github.io'};
const req=(data,origin='https://test.github.io')=>new Request('https://backend.test/api/teaching',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(data)});
let calls=0;
globalThis.fetch=async()=>{calls++;return Response.json({model:'deepseek-flash',choices:[{message:{content:'测试结果'},finish_reason:'stop'}]});};
for(const mode of ['teacher','student','digital'])assert.equal((await handleAI(req({mode,prompt:'教学任务'}),env)).status,200);
for(const data of [null,{}, {mode:'teacher',prompt:'x'.repeat(4001)}])assert.equal((await handleAI(req(data),env)).status,400);
assert.equal((await handleAI(req({mode:'teacher',prompt:'任务'},'https://other.test'),env)).status,403);
assert.equal((await handleAI(req({mode:'teacher',prompt:'任务'}),{ALLOWED_ORIGINS:env.ALLOWED_ORIGINS})).status,503);
assert.equal(calls,3);
process.env.ALLOWED_ORIGINS=env.ALLOWED_ORIGINS;process.env.DEEPSEEK_API_KEY=env.DEEPSEEK_API_KEY;
const invoke=async(method,body,origin='https://test.github.io')=>{
 const result={headers:{},code:0,body:null};
 const res={setHeader(k,v){result.headers[k.toLowerCase()]=v;},status(code){result.code=code;return this;},json(body){result.body=body;return this;},send(body){result.body=JSON.parse(body);return this;},end(){return this;}};
 await handler({method,body,headers:{host:'backend.test',origin,'content-type':'application/json'}},res);return result;
};
assert.equal((await invoke('OPTIONS')).code,204);
for(const mode of ['teacher','student','digital']){const result=await invoke('POST',{mode,prompt:'课程任务'});assert.equal(result.code,200);assert.equal(result.headers['access-control-allow-origin'],'https://test.github.io');}
assert.equal((await invoke('POST',null)).code,400);
assert.equal((await invoke('POST',{mode:'teacher',prompt:'任务'},'https://other.test')).code,403);
globalThis.fetch=async()=>new Response('test-only-key',{status:401});
const failed=await invoke('POST',{mode:'teacher',prompt:'任务'});assert.equal(failed.code,502);assert.ok(!JSON.stringify(failed.body).includes('test-only-key'));
globalThis.fetch=original;console.log('三类生成、跨域预检、来源校验、输入校验、未配置及安全错误测试通过。');
