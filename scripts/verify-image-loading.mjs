import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import sharp from 'sharp';
import crypto from 'node:crypto';
import path from 'node:path';
const s=fs.readFileSync('src/App.vue','utf8');
// 按语法节点提取队列逻辑，避免相邻注释或轮播实现变化使测试误读其他代码。
const script=s.slice(s.indexOf('>')+1,s.indexOf('</script>'));
const sourceFile=ts.createSourceFile('App.ts',script,ts.ScriptTarget.Latest,true);
const names=new Set(['probeAvailable','galleryRequested','galleryPending','galleryActiveRequests','pumpGallery','probeGallerySlides','startGalleryLoading']);
const queueNodes=sourceFile.statements.filter(node=>ts.isFunctionDeclaration(node)
  ? names.has(node.name?.text)
  : ts.isVariableStatement(node)&&node.declarationList.declarations.some(declaration=>ts.isIdentifier(declaration.name)&&names.has(declaration.name.text)));
assert.equal(queueNodes.length,names.size,'Missing image queue declarations');
const queueCode=queueNodes.map(node=>node.getText(sourceFile)).join('\n');
const pending=[],hits=[];
let peak=0,active=0;
const context={imageLoadingStopped:false,Image:class{setAttribute(){}},setImageRequest(image,src){image.url=src;pending.push(image);peak=Math.max(peak,++active)},watch(){},galleryStarted:{value:false},galleryAvailable:{value:{}},galleryPhotoSlots:Array.from({length:10},(_,i)=>String(i+1)),gallerySlideCount:10,activeGalleryIndex:{value:0},hits};
vm.createContext(context);
vm.runInContext(ts.transpileModule(queueCode,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,context);
function settle(fail=false){const image=pending.shift();active--;image[fail?'onerror':'onload']();}
vm.runInContext('probeAvailable(["a","b","c","d"], n=>hits.push(n), ()=>hits.push("done"))',context);
assert.equal(pending.length,2);settle(true);while(pending.length)settle();assert.equal(peak,2);assert.deepEqual(hits,[2,3,4,'done']);
vm.runInContext('probeGallerySlides()',context);assert.equal(pending.length,0);
vm.runInContext('startGalleryLoading()',context);assert.equal(pending.length,2);while(pending.length)settle();
assert.equal(Object.keys(context.galleryAvailable.value).length,5);
context.activeGalleryIndex.value=1;vm.runInContext('probeGallerySlides()',context);assert.equal(pending.length,1);assert.equal(pending[0].url,'6');settle();
vm.runInContext('probeGallerySlides()',context);assert.equal(pending.length,0);
const manifest=JSON.parse(fs.readFileSync('src/data/imageManifest.json'));
let original=0,mobile=0;
for(const [key,value] of Object.entries(manifest)){
assert.ok(fs.existsSync('public'+value.src));assert.ok(fs.existsSync('public'+value.small));
// 检查最终字节而非源图哈希，并验证发布目录既不缺图也不包含源图副本。
const source=path.join('images',key.slice('/images/'.length));
assert.ok(fs.existsSync(source), 'Missing source: '+source);
assert.deepEqual(fs.readFileSync(source),fs.readFileSync('public'+value.src));
assert.ok(!fs.existsSync('dist'+key), 'Source image leaked into deployment: '+key);
for(const url of new Set([value.src,value.small])){
const bytes=fs.readFileSync('public'+url);
const hash=crypto.createHash('sha256').update(bytes).digest('hex').slice(0,16);
assert.equal(path.basename(url).slice(0,16),hash,'Output hash mismatch: '+url);
assert.deepEqual(fs.readFileSync('dist'+url),bytes,'Deployment image mismatch: '+url);
}
const meta=await sharp('public'+value.small).metadata();assert.ok(meta.width<=960);assert.ok(meta.width<=value.width);
if(/^\/images\/(\d+|gallery-\d+)\.webp$/.test(key)){original+=fs.statSync('public'+value.src).size;mobile+=fs.statSync('public'+value.small).size;}
}
const built=fs.readFileSync('dist/index.html','utf8');assert.ok(built.includes('imagesrcset'));assert.ok(built.includes('loading="lazy"'));
const headers=fs.readFileSync('dist/_headers','utf8');
const rules=[];
for(const line of headers.split(/\r?\n/)){
if(!line.trim()||line.trim().startsWith('#'))continue;
if(!/^\s/.test(line))rules.push({pattern:line.trim(),cache:[]});
else if(line.trim().startsWith('Cache-Control:'))rules.at(-1).cache.push(line.trim().slice('Cache-Control:'.length).trim());
}
for(const url of [...Object.values(manifest).flatMap(value=>[value.src,value.small]),'/images/brand-mark.png']){
const matching=rules.filter(rule=>new RegExp('^'+rule.pattern.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replaceAll('*','.*')+'$').test(url));
assert.deepEqual(matching.flatMap(rule=>rule.cache),['public, max-age=604800'],'Conflicting image cache: '+url);
}
console.log('Passed bounded loading, failed-image continuation, deferred gallery, five-card window, deduplication, output hashes, source exclusion, deployment images, seven-day image cache, preload and lazy markup.');
console.log('Hero/gallery bytes: original '+original+', mobile '+mobile+'; reduction '+Math.round((1-mobile/original)*100)+'%.');
