import {createServer} from 'node:http';
import {readFile, mkdir} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {validateEntry} from './validation.mjs';

export async function createApp({dataDirectory=process.env.DATA_DIR || './data'}={}) {
  await mkdir(dataDirectory,{recursive:true});
  const db=new DatabaseSync(resolve(dataDirectory,'waitlist.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS waitlist (id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL, referral TEXT NOT NULL, role TEXT NOT NULL, consent_at TEXT NOT NULL, UNIQUE(email,role))');
  const insert=db.prepare('INSERT OR IGNORE INTO waitlist (first_name,last_name,phone,email,referral,role,consent_at) VALUES (?,?,?,?,?,?,?)');
  const root=fileURLToPath(new URL('./public/',import.meta.url));
  const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
  const server=createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
    const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
    try {
      const url=new URL(req.url,'http://localhost');
      if(url.pathname==='/api/waitlist') {
        if(req.method!=='POST') {res.setHeader('Allow','POST');return json(405,{message:'Method not allowed.'});}
        if(req.headers.origin && req.headers.origin!==`http://${req.headers.host}` && req.headers.origin!==`https://${req.headers.host}`) return json(403,{message:'Request origin not allowed.'});
        if(!req.headers['content-type']?.includes('application/json')) return json(415,{message:'Send JSON data.'});
        let body='';
        for await (const chunk of req) {body+=chunk;if(Buffer.byteLength(body)>8192) return json(413,{message:'Request is too large.'});}
        let parsed;try{parsed=JSON.parse(body);}catch{return json(400,{message:'Invalid JSON.'});}
        const {entry,errors}=validateEntry(parsed);
        if(Object.keys(errors).length) return json(400,{message:'Please check your details.',errors});
        insert.run(entry.firstName,entry.lastName,entry.phone,entry.email,entry.referral,entry.role,new Date().toISOString());
        return json(200,{ok:true});
      }
      if(url.pathname.startsWith('/api/')) return json(404,{message:'Not found.'});
      if(!['GET','HEAD'].includes(req.method)) return json(405,{message:'Method not allowed.'});
      const path=resolve(root,`.${decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname)}`);
      if(!path.startsWith(root)) return json(404,{message:'Not found.'});
      let bytes;try{bytes=await readFile(path);}catch{return json(404,{message:'Not found.'});}
      res.writeHead(200,{'Content-Type':mime[extname(path)] || 'application/octet-stream','Cache-Control':path.includes('/assets/')?'public, max-age=86400':'no-cache'});
      res.end(req.method==='HEAD'?undefined:bytes);
    } catch {json(500,{message:'We couldn’t save your place. Please try again.'});}
  });
  server.on('close',()=>db.close());
  return server;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const server=await createApp();
  const port=Number(process.env.PORT || 3000);
  server.listen(port,'0.0.0.0',()=>console.log(`African Libraries: http://localhost:${port}`));
}
