import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import sharp from 'sharp';
const s=fs.readFileSync('src/App.vue','utf8');
const probe=s.slice(s.indexOf('function probeAvailable('),s.indexOf('/**',s.indexOf('function probeAvailable(')));
const gallery=s.slice(s.indexOf('const galleryRequested'),s.indexOf('/**',s.indexOf('const galleryRequested')));
const pending=[],hits=[];
let peak=0,active=0;
const context={imageLoadingStopped:false,Image:class{setAttribute(){}},setImageRequest(image,src){image.url=src;pending.push(image);peak=Math.max(peak,++active)},watch(){},galleryStarted:{value:false},galleryAvailable:{value:{}},galleryPhotoSlots:Array.from({length:10},(_,i)=>String(i+1)),gallerySlideCount:10,activeGalleryIndex:{value:0},hits};
vm.createContext(context);
vm.runInContext(ts.transpileModule(probe+gallery,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,context);
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
const meta=await sharp('public'+value.small).metadata();assert.ok(meta.width<=960);assert.ok(meta.width<=value.width);
if(/^\/images\/(\d+|gallery-\d+)\.webp$/.test(key)){original+=fs.statSync('public'+value.src).size;mobile+=fs.statSync('public'+value.small).size;}
}
const built=fs.readFileSync('dist/index.html','utf8');assert.ok(built.includes('imagesrcset'));assert.ok(built.includes('loading="lazy"'));
console.log('Passed bounded loading, failed-image continuation, deferred gallery, five-card window, deduplication, generated variants, preload and lazy markup.');
console.log('Hero/gallery bytes: original '+original+', mobile '+mobile+'; reduction '+Math.round((1-mobile/original)*100)+'%.');
