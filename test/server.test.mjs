import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {createApp} from '../server.mjs';

test('waitlist API saves valid roles, rejects invalid input, and survives restart',async()=>{
  const dataDirectory=await mkdtemp(join(tmpdir(),'waitlist-test-'));
  let server;
  const start=async()=>{server=await createApp({dataDirectory});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));return `http://127.0.0.1:${server.address().port}`;};
  const stop=()=>new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));
  try {
    let origin=await start();
    const post=(body,extra={})=>fetch(`${origin}/api/waitlist`,{method:'POST',headers:{'Content-Type':'application/json',...extra},body:JSON.stringify(body)});
    const input={firstName:' Ada ',lastName:'Okafor',email:' ADA@example.com ',phone:'+234 801 234 5678',role:'author',referral:'founding'};
    const bad=await post({role:'author'});
    assert.equal(bad.status,400);
    assert.deepEqual(Object.keys((await bad.json()).errors).sort(),['email','firstName','phone']);
    assert.equal((await post({...input,role:'admin'})).status,400);
    assert.equal((await post(input,{Origin:'https://unrelated.example'})).status,403);
    assert.equal((await post(input)).status,200);
    assert.equal((await post(input)).status,200);
    assert.equal((await post({...input,role:'reader'})).status,200);
    assert.equal((await fetch(`${origin}/api/waitlist`)).status,405);
    assert.equal((await fetch(`${origin}/data/waitlist.sqlite`)).status,404);
    assert.match(await (await fetch(origin)).text(),/African Libraries/);
    assert.match((await fetch(`${origin}/assets/person.svg`)).headers.get('Content-Type'),/image\/svg/);
    await stop();
    origin=await start();
    assert.equal((await post(input)).status,200);
    const db=new DatabaseSync(join(dataDirectory,'waitlist.sqlite'));
    const rows=db.prepare('SELECT * FROM waitlist ORDER BY role').all();
    assert.equal(rows.length,2);
    assert.equal(rows[0].first_name,'Ada');
    assert.equal(rows[0].email,'ada@example.com');
    assert.equal(rows[0].referral,'founding');
    assert.ok(rows[0].consent_at);
    db.close();
  } finally {if(server?.listening) await stop();await rm(dataDirectory,{recursive:true,force:true});}
});
