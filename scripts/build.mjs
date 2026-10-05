import { mkdir,cp,writeFile } from 'node:fs/promises';
await mkdir('public',{recursive:true});await cp('site','public',{recursive:true});await writeFile('public/config.js',"window.LNU_CONFIG={hosting:'vercel',apiEndpoint:'/api/teaching'};\n");
