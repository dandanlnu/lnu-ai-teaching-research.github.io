const instructions={
 teacher:'你是辽宁大学《人工智能》课程的备课助教。帮助教师设计可执行的活动、互动问题与评价标准。明确教学目标、步骤、时间和教师核验点；不编造教材章节、引文或学生表现。用中文，建议控制在500字以内。',
 student:'你是《人工智能》课程的学习助教。对学生的问题或作答先指出理解与误区，再通过提示、追问和自测帮助思考。解释判断依据，不虚构学生能力提升或资料来源。用中文，建议控制在400字以内。',
 digital:'你是教师的数字人讲稿助教。根据教学目标生成可朗读的中文讲稿，语言自然、准确。遵守用户要求的语速与时长，标明需要教师核验的内容。只生成文本，不声称已经合成视频。建议控制在500字以内。'
};
const json=(body,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export async function handleAI(request,env){
 if(request.method!=='POST')return json({error:'请通过页面提交教学任务。'},405);
 const origin=request.headers.get('origin');const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);if(origin&&origin!==new URL(request.url).origin&&!allowed.includes(origin))return json({error:'请求来源不匹配。'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'请求格式不正确。'},415);
 if(Number(request.headers.get('content-length'))>16000)return json({error:'输入过长，请缩短后重试。'},413);
 let data;try{const raw=await request.text();if(raw.length>12000)return json({error:'输入过长，请缩短后重试。'},413);data=JSON.parse(raw);}catch{return json({error:'请求格式不正确。'},400);}
 if(!data || typeof data!=='object' || !Object.hasOwn(instructions,data.mode)||typeof data.prompt!=='string'||!data.prompt.trim()||data.prompt.length>4000)return json({error:'请输入4000字以内的教学任务。'},400);
 if(!env.DEEPSEEK_API_KEY)return json({error:'服务尚未配置，请稍后重试。'},503);
 try{
  const response=await fetch('https://api.deepseek.com/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${env.DEEPSEEK_API_KEY}`},body:JSON.stringify({model:env.DEEPSEEK_MODEL||'deepseek-flash',messages:[{role:'system',content:instructions[data.mode]},{role:'user',content:data.prompt.trim()}],max_tokens:1500,stream:false,thinking:{type:'disabled'}}),signal:AbortSignal.timeout(55000)});
  if(!response.ok){const messages={401:'模型服务密钥无效，请联系案例负责人。',402:'模型服务余额不足，请联系案例负责人。',429:'模型服务繁忙，请稍后重试。'};return json({error:messages[response.status]||'模型服务暂时不可用，请稍后重试。'},response.status===429?429:502);}
  const result=await response.json();const text=result.choices?.[0]?.message?.content;if(typeof text!=='string'||!text.trim())return json({error:'模型未返回内容，请重新生成。'},502);
  return json({text,model:result.model||env.DEEPSEEK_MODEL||'deepseek-flash',truncated:result.choices[0].finish_reason==='length'});
 }catch{return json({error:'生成超时或连接失败。请保留输入，稍后重试。'},504);}
}
