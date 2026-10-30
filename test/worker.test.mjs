import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {validateEntry} from '../validation.mjs';

test('hosted Worker saves entries through the migrated D1 contract',async()=>{
  const source=await readFile(new URL('../worker/index.js',import.meta.url),'utf8');
  const worker=(await import(`data:text/javascript;base64,${Buffer.from(`const assets={};const validateEntry=${validateEntry.toString()};${source}`).toString('base64')}`)).default;
  const db=new DatabaseSync(':memory:');
  db.exec(await readFile(new URL('../drizzle/0000_waitlist.sql',import.meta.url),'utf8'));
  const env={DB:{prepare(sql){return {bind(...args){return {async run(){return db.prepare(sql).run(...args);}};}};}}};
  const post=body=>worker.fetch(new Request('https://preview.example/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),env);
  try {
    assert.equal((await post({})).status,400);
    const entry={role:'reader',firstName:'Ada',email:'ada@example.com',phone:'08012345678'};
    assert.equal((await post(entry)).status,200);
    assert.equal((await post(entry)).status,200);
    assert.equal(db.prepare('SELECT COUNT(*) as n FROM waitlist').get().n,1);
    assert.equal(db.prepare('SELECT role FROM waitlist').get().role,'reader');
    const unavailable=await worker.fetch(new Request('https://preview.example/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(entry)}),{});
    assert.equal(unavailable.status,503);
  } finally {db.close();}
});
