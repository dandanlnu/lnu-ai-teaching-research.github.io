import { handleAI } from '../server/teaching.mjs';
export default async function handler(req,res){
 const origin=req.headers.origin;
 const host=req.headers.host;
 const ownOrigin='https://'+host;
 const allowed=(process.env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
 res.setHeader('Cache-Control','no-store');res.setHeader('Vary','Origin');
 if(origin && origin!==ownOrigin && !allowed.includes(origin)){return res.status(403).json({error:'请求来源不匹配。'});}
 if(origin){res.setHeader('Access-Control-Allow-Origin',origin);}
 if(req.method==='OPTIONS'){
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  return res.status(204).end();
 }
 try{
  const body=typeof req.body==='string'?req.body:JSON.stringify(req.body??null);
  const headers=new Headers();
  if(origin)headers.set('origin',origin);
  if(req.headers['content-type'])headers.set('content-type',req.headers['content-type']);
  if(req.headers['content-length'])headers.set('content-length',req.headers['content-length']);
  const request=new Request(ownOrigin+'/api/teaching',{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body}:{})});
  const result=await handleAI(request,process.env);
  for(const [key,value] of result.headers)res.setHeader(key,value);
  return res.status(result.status).send(await result.text());
 }catch{return res.status(400).json({error:'请求格式不正确。'});}
}
