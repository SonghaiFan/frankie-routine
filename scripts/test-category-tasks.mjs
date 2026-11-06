// Test the actual production helper without adding a test framework or loader.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';
const source=readFileSync(new URL('../src/lib/category-tasks.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;
const {applyCategoryTaskChange:apply}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const task=(id,category,title=String(id))=>({id,category,title,isCompleted:false,createdAt:id});
const fixture=()=>[task(1,'plant'),task(2,'harvest'),task(3,undefined),task(4,'plant')];

test('completing a visible category task retains the other category and inbox',()=>{
 const current=fixture();const subset=current.filter(t=>t.category==='plant');
 const next=apply(current,'plant',subset.map(t=>t.id===1?{...t,isCompleted:true}:t));
 assert.deepEqual(next.map(t=>t.id),[1,2,3,4]);assert.equal(next[0].isCompleted,true);
 assert.strictEqual(next[1],current[1]);assert.strictEqual(next[2],current[2]);assert.equal(current[0].isCompleted,false);
});
test('adding inside a category appends only the new task without losing other records',()=>{
 const current=fixture();const added=task(5,'plant','new category task');
 const next=apply(current,'plant',[...current.filter(t=>t.category==='plant'),added]);
 assert.deepEqual(next.map(t=>t.id),[1,2,3,4,5]);assert.strictEqual(next[1],current[1]);assert.strictEqual(next[2],current[2]);
});
test('deleting inside a category removes only the selected task',()=>{
 const current=fixture();const next=apply(current,'plant',current.filter(t=>t.category==='plant'&&t.id!==1));
 assert.deepEqual(next.map(t=>t.id),[2,3,4]);assert.strictEqual(next[0],current[1]);assert.strictEqual(next[1],current[2]);
});
test('emptying a category retains every other category and uncategorized task',()=>{
 const current=fixture();assert.deepEqual(apply(current,'plant',[]).map(t=>t.id),[2,3]);
});
test('functional updates receive the latest category subset',()=>{
 const current=[...fixture(),task(6,'plant')];let received;
 const next=apply(current,'plant',subset=>{received=subset.map(t=>t.id);return subset.map(t=>({...t,isCompleted:true}));});
 assert.deepEqual(received,[1,4,6]);assert.deepEqual(next.map(t=>t.id),[1,2,3,4,6]);
 assert.equal(next.filter(t=>t.category==='plant').every(t=>t.isCompleted),true);assert.equal(next[1].isCompleted,false);
});
test('an array edit based on a visible subset retains newly added unrelated tasks',()=>{
 const old=fixture();const edited=old.filter(t=>t.category==='plant').map(t=>({...t,isCompleted:true}));
 const current=[...old,task(7,'thin'),task(8,undefined)];
 assert.deepEqual(apply(current,'plant',edited).map(t=>t.id),[1,2,3,4,7,8]);
});
test('a scoped edit cannot replace or duplicate a different category record',()=>{
 const current=fixture();const next=apply(current,'plant',[current[0],current[3],{...current[1],category:'plant',title:'collision'},task(9,'harvest')]);
 assert.deepEqual(next.map(t=>t.id),[1,2,3,4]);assert.strictEqual(next[1],current[1]);
});
