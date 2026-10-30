// Assets and validateEntry are bundled by scripts/build.mjs.
export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    const json=(status,body)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
    if(url.pathname==='/api/waitlist') {
      if(request.method!=='POST') return json(405,{message:'Method not allowed.'});
      if(request.headers.get('Origin') && request.headers.get('Origin')!==url.origin) return json(403,{message:'Request origin not allowed.'});
      if(!request.headers.get('Content-Type')?.includes('application/json')) return json(415,{message:'Send JSON data.'});
      let text='';
      const reader=request.body?.getReader();
      if(!reader) return json(400,{message:'Invalid JSON.'});
      let length=0;const decoder=new TextDecoder();
      while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>8192){await reader.cancel();return json(413,{message:'Request is too large.'});}text+=decoder.decode(value,{stream:true});}
      text+=decoder.decode();
      let parsed;try{parsed=JSON.parse(text);}catch{return json(400,{message:'Invalid JSON.'});}
      const {entry,errors}=validateEntry(parsed);
      if(Object.keys(errors).length) return json(400,{message:'Please check your details.',errors});
      try {
        await env.DB.prepare('INSERT OR IGNORE INTO waitlist (first_name,last_name,phone,email,referral,role,consent_at) VALUES (?,?,?,?,?,?,?)').bind(entry.firstName,entry.lastName,entry.phone,entry.email,entry.referral,entry.role,new Date().toISOString()).run();
        return json(200,{ok:true});
      } catch {return json(503,{message:'We couldn’t save your place. Please try again.'});}
    }
    if(!['GET','HEAD'].includes(request.method)) return json(405,{message:'Method not allowed.'});
    const asset=assets[url.pathname==='/'?'/index.html':url.pathname];
    if(!asset) return json(404,{message:'Not found.'});
    const bytes=Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0));
    return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':asset.type,'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':url.pathname.startsWith('/assets/')?'public, max-age=86400':'no-cache'}});
  }
};
