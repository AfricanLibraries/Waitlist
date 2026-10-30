import {readFile,readdir,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {extname,join} from 'node:path';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf'};
const assets={};
async function collect(directory='public',prefix='') {
  for(const file of await readdir(directory,{withFileTypes:true})) {
    const path=join(directory,file.name),url=`${prefix}/${file.name}`;
    if(file.isDirectory()) await collect(path,url);
    else assets[url]={type:types[extname(path)]||'application/octet-stream',data:(await readFile(path)).toString('base64')};
  }
}
await collect();
const validation=await readFile('validation.mjs','utf8');
const worker=await readFile('worker/index.js','utf8');
await mkdir('dist/server',{recursive:true});
await mkdir('dist/.openai',{recursive:true});
await writeFile('dist/server/index.js',`const assets=${JSON.stringify(assets)};\n${validation.replace('export function','function')}\n${worker}`);
await copyFile('.openai/hosting.json','dist/.openai/hosting.json');
const built=await import(`${new URL('../dist/server/index.js',import.meta.url)}?t=${Date.now()}`);
if(typeof built.default?.fetch!=='function') throw new Error('Missing Worker fetch export');
const result=await built.default.fetch(new Request('https://preview.example/'),{});
if(result.status!==200 || !(await result.text()).includes('African Libraries')) throw new Error('Built homepage failed verification');
console.log(`Built and verified Worker with ${Object.keys(assets).length} bundled local assets.`);
