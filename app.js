// Pantrylog app logic. Loaded by index.html.
(() => {
"use strict";
/* ---------- constants ---------- */
const UNITS=["pcs","pack","bottle","can","jar","kg","g","L","ml","bunch"];
const CATS=["Produce","Dairy & eggs","Meat & fish","Bakery","Pantry","Frozen","Drinks","Snacks","Household","Personal care","Other"];
const STAPLES=[
  ["Milk","Dairy & eggs","L",2,1,3],["Eggs","Dairy & eggs","pcs",6,4,12],["Butter","Dairy & eggs","pack",1,1,2],["Cheese","Dairy & eggs","pack",1,1,2],
  ["Bread","Bakery","pcs",1,1,2],["Bananas","Produce","pcs",4,3,6],["Tomatoes","Produce","pcs",4,2,6],["Onions","Produce","pcs",3,2,5],
  ["Pasta","Pantry","pack",2,1,3],["Rice","Pantry","kg",1,0.5,2],["Coffee","Pantry","pack",1,1,2],["Olive oil","Pantry","bottle",1,1,1],
  ["Toilet paper","Household","pack",1,1,2],["Dish soap","Household","bottle",1,1,1]
];

/* ---------- helpers ---------- */
const $=(s,el=document)=>el.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const clone=o=>JSON.parse(JSON.stringify(o));
const num=v=>{const n=parseFloat(String(v??"").replace(",","."));return isFinite(n)?n:0};
const stepOf=u=>(u==="kg"||u==="L")?0.25:(u==="g"||u==="ml")?50:1;
const roundTo=(n,s)=>Math.round(n/s)*s;
const fq=n=>{n=Math.round(num(n)*100)/100;return n.toLocaleString("en-GB",{maximumFractionDigits:2})};
const dfmt=(d,o={day:"numeric",month:"short"})=>new Date(d).toLocaleDateString("en-GB",o);
const tfmt=d=>new Date(d).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
const norm=s=>String(s||"").trim().toLowerCase();
const ls={get(k,f){try{const v=localStorage.getItem(k);return v?JSON.parse(v):f}catch{return f}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
function toast(msg){document.querySelectorAll(".toast").forEach(t=>t.remove());const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2600)}
function armed(btn,fn){
  if(btn.classList.contains("armed")){fn();return}
  const old=btn.textContent;btn.classList.add("armed");btn.textContent="Tap again to confirm";
  setTimeout(()=>{if(btn.isConnected){btn.classList.remove("armed");btn.textContent=old}},3000);
}

/* ---------- state + storage ---------- */
const S={mode:"pending",items:[],lists:[],tab:"list",q:"",filter:"all",listId:null,draft:{name:"",qty:"1",unit:"pcs"},dragging:false,pendingRender:false};
const Store={
  db:null,
  async init(){
    let db=null; try{ if(window.claude?.use) db=await window.claude.use("db") }catch{}
    if(db){
      this.db=db; S.mode="cloud";
      db.collection("items").limit(1000).onSnapshot(q=>{S.items=q.docs.map(d=>d.data()).filter(Boolean);S.itemsLoaded=true;render()},e=>this.err(e));
      db.collection("lists").orderBy("createdAt","desc").limit(500).onSnapshot(q=>{S.lists=q.docs.map(d=>d.data()).filter(Boolean);S.listsLoaded=true;render()},e=>this.err(e));
    }else{
      S.mode="local"; S.items=ls.get("pantrylog.items",[]); S.lists=ls.get("pantrylog.lists",[]); S.itemsLoaded=S.listsLoaded=true;
    }
    render();
  },
  err(e){
    const c=e?.code;
    toast(c==="quota_exceeded"?"Storage is full. Delete old lists from History to make room."
      :c==="revoked"||c==="not_granted"?"You can view this pantry but not change it."
      :"Couldn't save. Check your connection and try again.");
  },
  async saveItem(it){
    it.updatedAt=Date.now();
    S.items=[...S.items.filter(x=>x.id!==it.id),it]; render();
    if(S.mode==="cloud"){try{await this.db.collection("items").doc(it.id).set(it)}catch(e){this.err(e)}}
    else ls.set("pantrylog.items",S.items);
  },
  async deleteItem(id){
    S.items=S.items.filter(x=>x.id!==id); render();
    if(S.mode==="cloud"){try{await this.db.collection("items").doc(id).delete()}catch(e){this.err(e)}}
    else ls.set("pantrylog.items",S.items);
  },
  async saveList(l){
    l.updatedAt=Date.now();
    S.lists=[l,...S.lists.filter(x=>x.id!==l.id)].sort((a,b)=>b.createdAt-a.createdAt); render();
    if(S.mode==="cloud"){try{await this.db.collection("lists").doc(l.id).set(l)}catch(e){this.err(e)}}
    else ls.set("pantrylog.lists",S.lists);
  },
  async deleteList(id){
    S.lists=S.lists.filter(x=>x.id!==id); render();
    if(S.mode==="cloud"){try{await this.db.collection("lists").doc(id).delete()}catch(e){this.err(e)}}
    else ls.set("pantrylog.lists",S.lists);
  }
};

/* ---------- derived ---------- */
const openLists=()=>S.lists.filter(l=>l.status==="open").sort((a,b)=>b.createdAt-a.createdAt);
const doneLists=()=>S.lists.filter(l=>l.status==="completed").sort((a,b)=>(b.completedAt||0)-(a.completedAt||0));
const currentList=()=>{const o=openLists();return o.find(l=>l.id===S.listId)||o[0]||null};
const itemById=id=>S.items.find(i=>i.id===id);
const itemByName=n=>S.items.find(i=>norm(i.name)===norm(n));
const level=it=>num(it.qty)<=0?"out":num(it.qty)<num(it.min)?"low":"ok";
const lowItems=()=>S.items.filter(i=>level(i)!=="ok");
const needFor=it=>{const s=stepOf(it.unit);return Math.max(s,roundTo(Math.max(num(it.target),num(it.min))-num(it.qty),s))};
const newListName=()=>"Shopping list · "+dfmt(new Date(),{weekday:"short",day:"numeric",month:"short"});
const makeList=(name)=>({id:uid("l"),name:name||newListName(),status:"open",createdAt:Date.now(),lines:[]});

/* ---------- core rules ---------- */
// Below minimum → put it on the open list (or start one). Back at/above minimum → take auto-added, unbought lines off again.
async function syncAuto(it,{quiet}={}){
  const lv=level(it);
  if(lv!=="ok"){
    let l=currentList(), created=false;
    const already=l&&l.lines.find(x=>x.itemId===it.id&&!x.done);
    if(already&&!already.auto) return;
    if(l&&l.lines.some(x=>x.itemId===it.id&&x.done)) return; // already in the basket
    if(!l){l=makeList();created=true}else l=clone(l);
    const need=needFor(it);
    const line=l.lines.find(x=>x.itemId===it.id&&!x.done);
    if(line){ if(num(line.qty)===need) return; line.qty=need; line.unit=it.unit; line.name=it.name; }
    else l.lines.push({id:uid("ln"),itemId:it.id,name:it.name,unit:it.unit,qty:need,done:false,auto:true,cat:it.cat||"Other"});
    await Store.saveList(l);
    if(!quiet) toast(created?`${it.name} is low. Started a new list`:line?`Updated ${it.name} on your list`:`${it.name} is low. Added to ${l.name.split(" · ")[0]}`);
  }else{
    for(const l0 of openLists()){
      const idx=l0.lines.findIndex(x=>x.itemId===it.id&&x.auto&&!x.done);
      if(idx>=0){const l=clone(l0);l.lines.splice(idx,1);await Store.saveList(l);if(!quiet)toast(`${it.name} is stocked again. Removed from list`)}
    }
  }
}
const qtyTimers={};
function setQty(id,q,{immediate}={}){
  const it0=itemById(id); if(!it0) return;
  const it={...it0,qty:Math.max(0,roundTo(num(q),stepOf(it0.unit)))};
  S.items=S.items.map(x=>x.id===id?it:x); render();
  clearTimeout(qtyTimers[id]);
  qtyTimers[id]=setTimeout(async()=>{const cur=itemById(id)||it;await Store.saveItem({...cur,qty:it.qty});await syncAuto({...cur,qty:it.qty})},immediate?0:450);
}
async function completeList(l0){
  const l=clone(l0), bought=l.lines.filter(x=>x.done), left=l.lines.filter(x=>!x.done);
  if(!bought.length){toast("Tick what you bought first");return}
  const touched=[];
  for(const ln of bought){
    let it=(ln.itemId&&itemById(ln.itemId))||itemByName(ln.name);
    if(it){ it={...it,qty:roundTo(num(it.qty)+num(ln.qty),stepOf(it.unit))}; }
    else { const q=num(ln.qty)||1; it={id:uid("i"),name:ln.name,cat:ln.cat||"Other",unit:ln.unit||"pcs",qty:q,min:Math.min(1,q),target:q,createdAt:Date.now()}; }
    ln.itemId=it.id; await Store.saveItem(it); touched.push(it);
  }
  l.status="completed"; l.completedAt=Date.now(); l.lines=bought; l.missed=left.map(x=>({name:x.name,qty:x.qty,unit:x.unit}));
  await Store.saveList(l);
  let msg=`${bought.length} item${bought.length>1?"s":""} added to stock`;
  if(left.length){ const n=makeList(); n.lines=left.map(x=>({...x,id:uid("ln")})); await Store.saveList(n); S.listId=n.id; msg+=` · ${left.length} moved to a new list`; }
  else S.listId=null;
  for(const it of touched) await syncAuto(it,{quiet:true});
  toast(msg);
}
function addLine(name,qty,unit,{toListId,auto}={}){
  name=String(name||"").trim(); if(!name) return null;
  let l=openLists().find(x=>x.id===toListId)||currentList(); l=l?clone(l):makeList();
  const it=itemByName(name);
  const ex=l.lines.find(x=>!x.done&&norm(x.name)===norm(name));
  if(ex){ex.qty=num(ex.qty)+(num(qty)||1);ex.auto=false}
  else l.lines.push({id:uid("ln"),itemId:it?.id||null,name:it?.name||name,unit:unit||it?.unit||"pcs",qty:num(qty)||1,done:false,auto:!!auto,cat:it?.cat||"Other"});
  return l;
}

/* ---------- views ---------- */
function viewList(){
  if(!S.listsLoaded) return `<div class="empty">Loading your list…</div>`;
  const opens=openLists(), l=currentList(), low=lowItems();
  const lowOff=l?low.filter(i=>!l.lines.some(x=>x.itemId===i.id)):low;
  const lowCard=lowOff.length?`<div class="card spread" style="background:var(--warn-soft);border-color:transparent">
      <div class="grow"><b>${lowOff.length} item${lowOff.length>1?"s are":" is"} running low</b><div class="muted" style="font-size:13px">${lowOff.slice(0,4).map(i=>esc(i.name)).join(", ")}${lowOff.length>4?` and ${lowOff.length-4} more`:""}</div></div>
      <button class="btn sm" id="addLow">Add to list</button></div>`:"";
  if(!l){
    return `<div class="stack">
      <div><div class="eyebrow">${dfmt(new Date(),{weekday:"long",day:"numeric",month:"long"})}</div><h1>No open shopping list</h1>
      <p class="muted" style="margin:4px 0 0">Start one, or let Stock fill it for you: anything that drops below its minimum lands here automatically.</p></div>
      ${lowCard}
      <button class="btn primary block" id="newList">Start a shopping list</button>
      ${!S.items.length&&S.itemsLoaded?`<div class="empty">Your stock is empty. Go to <a href="#stock">Stock</a> to add what you keep at home.</div>`:""}
    </div>`;
  }
  const todo=l.lines.filter(x=>!x.done), got=l.lines.filter(x=>x.done);
  const pct=l.lines.length?Math.round(got.length/l.lines.length*100):0;
  const groups=new Map(); todo.forEach(x=>{const c=x.cat||"Other";if(!groups.has(c))groups.set(c,[]);groups.get(c).push(x)});
  const order=[...groups.keys()].sort((a,b)=>(CATS.indexOf(a)+100)%100-(CATS.indexOf(b)+100)%100);
  return `<div class="stack">
    ${opens.length>1?`<div class="chips" role="group" aria-label="Open lists">${opens.map(o=>`<button class="fchip" data-pick="${esc(o.id)}" aria-pressed="${o.id===l.id}">${esc(o.name.split(" · ").slice(-1)[0])} · ${o.lines.filter(x=>!x.done).length}</button>`).join("")}</div>`:""}
    <div class="spread" style="align-items:flex-end">
      <div class="grow"><div class="eyebrow">Open list · started ${dfmt(l.createdAt)}</div><h1>${esc(l.name)}</h1></div>
      <button class="btn sm ghost" id="renameList">Rename</button>
    </div>
    <div class="card stack" style="gap:8px">
      <div class="spread"><span style="font-size:14px"><b class="num">${got.length} of ${l.lines.length}</b> in the basket</span><span class="muted num" style="font-size:13px">${pct}%</span></div>
      <div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><b style="width:${pct}%"></b></div>
    </div>
    <form class="add-row" id="addForm" autocomplete="off">
      <input class="field" id="addName" list="itemNames" placeholder="Add an item, e.g. Oat milk" value="${esc(S.draft.name)}" aria-label="Item name">
      <input class="field num" id="addQty" inputmode="decimal" value="${esc(S.draft.qty)}" aria-label="Quantity" style="text-align:center">
      <select class="field" id="addUnit" aria-label="Unit">${UNITS.map(u=>`<option ${u===S.draft.unit?"selected":""}>${u}</option>`).join("")}</select>
      <button class="btn primary" type="submit">Add</button>
    </form>
    ${lowCard}
    ${todo.length?order.map(c=>`<section class="card" style="padding-block:6px"><div class="eyebrow" style="padding-top:8px">${esc(c)}</div><div class="lines">${groups.get(c).map(lineHtml).join("")}</div></section>`).join("")
      :`<div class="empty">${l.lines.length?"Everything is in the basket. Complete the list to add it to your stock.":"This list is empty. Add items above, or lower an item's stock to add it automatically."}</div>`}
    ${got.length?`<div class="basket-head"><div class="eyebrow">In the basket · ${got.length}</div></div><section class="card" style="padding-block:6px"><div class="lines">${got.map(lineHtml).join("")}</div></section>`:""}
    <button class="btn primary block" id="completeBtn" style="min-height:50px;font-size:16px" ${got.length?"":"disabled"}>Complete list and add ${got.length||""} to stock</button>
    ${got.length&&todo.length?`<p class="muted" style="margin:-4px 0 0;font-size:13px;text-align:center">${todo.length} item${todo.length>1?"s":""} not ticked will move to a new list.</p>`:""}
    <div class="row" style="justify-content:center"><button class="btn ghost sm" id="newList">+ Start another list</button><button class="btn ghost sm danger" id="delList">Delete this list</button></div>
  </div>`;
}
function lineHtml(x){
  const it=x.itemId&&itemById(x.itemId);
  return `<div class="line ${x.done?"done":""}" data-line="${esc(x.id)}">
    <button class="tick" data-tick aria-label="${x.done?"Put back":"Mark bought"}: ${esc(x.name)}" aria-pressed="${!!x.done}">✓</button>
    <div style="min-width:0"><div class="lname">${esc(x.name)}</div>
      <div class="lmeta">${x.auto?`<span class="chip warn">Low stock</span>`:""}${it?`<span>${fq(it.qty)} ${esc(it.unit)} at home</span>`:`<span>New to stock</span>`}</div></div>
    <div class="step"><button data-lq="-1" aria-label="Less ${esc(x.name)}">−</button><span class="q">${fq(x.qty)} <span class="muted" style="font-weight:600;font-size:12px">${esc(x.unit)}</span></span><button data-lq="1" aria-label="More ${esc(x.name)}">+</button><button data-ldel aria-label="Remove ${esc(x.name)}" style="border-color:transparent;background:transparent;color:var(--muted)">×</button></div>
  </div>`;
}

function viewStock(){
  if(!S.itemsLoaded) return `<div class="empty">Loading your stock…</div>`;
  const low=lowItems(), cats=[...new Set(S.items.map(i=>i.cat||"Other"))].sort((a,b)=>(CATS.indexOf(a)+100)%100-(CATS.indexOf(b)+100)%100);
  let list=S.items.filter(i=>!S.q||norm(i.name).includes(norm(S.q)));
  if(S.filter==="low") list=list.filter(i=>level(i)!=="ok");
  else if(S.filter!=="all") list=list.filter(i=>(i.cat||"Other")===S.filter);
  const groups=new Map(); list.sort((a,b)=>a.name.localeCompare(b.name)).forEach(i=>{const c=i.cat||"Other";if(!groups.has(c))groups.set(c,[]);groups.get(c).push(i)});
  const gk=[...groups.keys()].sort((a,b)=>(CATS.indexOf(a)+100)%100-(CATS.indexOf(b)+100)%100);
  if(!S.items.length) return `<div class="stack">
    <div class="spread"><h1>Stock</h1><button class="btn primary" data-edit="">+ Item</button></div>
    <div class="card stack"><h3>What do you keep at home?</h3>
      <p class="muted" style="margin:0;font-size:14px">Add the things you buy regularly. Give each a minimum: when the slider drops below it, the item goes on your shopping list. Completed lists add what you bought back here.</p>
      <div class="chips">${STAPLES.slice(0,8).map(s=>`<span class="chip">${s[0]}</span>`).join("")}<span class="chip">+${STAPLES.length-8}</span></div>
      <button class="btn primary block" id="addStaples">Add ${STAPLES.length} common staples</button>
      <button class="btn block" data-edit="">Add my own item</button></div></div>`;
  return `<div class="stack">
    <div class="spread"><div><h1>Stock</h1><p class="muted" style="margin:2px 0 0;font-size:14px">${S.items.length} items · <span style="color:${low.length?"var(--warn)":"var(--accent)"};font-weight:600">${low.length?low.length+" low":"all stocked"}</span></p></div><button class="btn primary" data-edit="">+ Item</button></div>
    <input class="field" id="search" type="search" placeholder="Search stock" value="${esc(S.q)}" aria-label="Search stock">
    <div class="chips" role="group" aria-label="Filter">
      <button class="fchip" data-filter="all" aria-pressed="${S.filter==="all"}">All</button>
      <button class="fchip" data-filter="low" aria-pressed="${S.filter==="low"}">Low · ${low.length}</button>
      ${cats.map(c=>`<button class="fchip" data-filter="${esc(c)}" aria-pressed="${S.filter===c}">${esc(c)}</button>`).join("")}
    </div>
    ${list.length?gk.map(c=>`<div class="eyebrow cat-head">${esc(c)}</div>${groups.get(c).map(itemHtml).join("")}`).join("")
      :`<div class="empty">${S.filter==="low"?"Nothing is low. Your pantry is stocked.":"No items match."}</div>`}
  </div>`;
}
function itemHtml(it){
  const lv=level(it), s=stepOf(it.unit), q=num(it.qty);
  const max=Math.max(s*10,roundTo(Math.max(num(it.target),num(it.min))*2,s),Math.ceil(q/s)*s+s*2);
  const onList=openLists().some(l=>l.lines.some(x=>x.itemId===it.id&&!x.done));
  const pill=lv==="out"?`<span class="chip bad">Out</span>`:lv==="low"?`<span class="chip warn">Low</span>`:`<span class="chip ok">In stock</span>`;
  return `<section class="card item lvl-${lv}" data-item="${esc(it.id)}">
    <div class="item-top"><div style="min-width:0"><h3 style="overflow-wrap:anywhere">${esc(it.name)}</h3><div class="row" style="gap:6px;margin-top:3px">${pill}${onList?`<span class="chip">On list</span>`:""}</div></div>
      <div class="qty" data-qtyout>${fq(q)}<small>${esc(it.unit)}</small></div></div>
    <div class="slider-row">
      <button class="icon-btn" data-dq="-1" aria-label="Use one ${esc(it.name)}">−</button>
      <div class="slider"><input type="range" id="sl-${esc(it.id)}" min="0" max="${max}" step="${s}" value="${q}" style="--p:${q/max};--m:${Math.min(1,num(it.min)/max)}" aria-label="${esc(it.name)} in stock, ${esc(it.unit)}" aria-valuetext="${fq(q)} ${esc(it.unit)}"><span class="minmark" style="--m:${Math.min(1,num(it.min)/max)}" title="Minimum ${fq(it.min)}"></span></div>
      <button class="icon-btn" data-dq="1" aria-label="Add one ${esc(it.name)}">+</button>
    </div>
    <div class="item-foot"><span class="num">Min ${fq(it.min)} · Target ${fq(it.target)} ${esc(it.unit)}</span>
      <span class="row" style="gap:4px">${!onList?`<button class="btn sm ghost" data-tolist>Add to list</button>`:""}<button class="btn sm" data-edit="${esc(it.id)}">Edit</button></span></div>
  </section>`;
}

function viewHistory(){
  if(!S.listsLoaded) return `<div class="empty">Loading history…</div>`;
  const done=doneLists();
  const m0=new Date();m0.setDate(1);m0.setHours(0,0,0,0);
  const month=done.filter(l=>(l.completedAt||0)>=m0.getTime());
  const itemsMonth=month.reduce((t,l)=>t+l.lines.length,0);
  const freq=new Map(); done.forEach(l=>l.lines.forEach(x=>freq.set(x.name,(freq.get(x.name)||0)+1)));
  const top=[...freq].sort((a,b)=>b[1]-a[1])[0];
  return `<div class="stack">
    <div><h1>History</h1><p class="muted" style="margin:2px 0 0;font-size:14px">Every completed shopping list, newest first.</p></div>
    ${done.length?`<div class="stats">
      <div class="stat"><div class="v">${month.length}</div><div class="k">trips in ${dfmt(new Date(),{month:"long"})}</div></div>
      <div class="stat"><div class="v">${itemsMonth}</div><div class="k">items this month</div></div>
      <div class="stat"><div class="v" style="font-size:18px;line-height:1.3;overflow-wrap:anywhere">${top?esc(top[0]):"—"}</div><div class="k">${top?`bought ${top[1]}×`:"most bought"}</div></div></div>`:""}
    ${done.length?done.map(l=>`<details class="hist" data-hist="${esc(l.id)}" ${S.open===l.id?"open":""}>
      <summary><div class="grow"><div class="eyebrow">${dfmt(l.completedAt,{weekday:"short",day:"numeric",month:"short",year:"numeric"})} · ${tfmt(l.completedAt)}</div>
        <div style="font-weight:600;margin-top:2px;overflow-wrap:anywhere">${esc(l.name)}</div>
        <div class="muted" style="font-size:13px">${l.lines.length} bought${(l.missed||[]).length?` · ${l.missed.length} not found`:""}</div></div><span class="chev" aria-hidden="true"></span></summary>
      <div class="body">
        <div class="receipt"><div class="rl"><span>ITEM</span><span>QTY</span></div><hr>
          ${l.lines.map(x=>`<div class="rl"><span>${esc(x.name)}</span><span>${fq(x.qty)} ${esc(x.unit)}</span></div>`).join("")}
          ${(l.missed||[]).map(x=>`<div class="rl miss"><span>${esc(x.name)}</span><span>${fq(x.qty)} ${esc(x.unit)}</span></div>`).join("")}
          <hr><div class="rl"><span>${l.lines.length} LINE${l.lines.length===1?"":"S"} TO STOCK</span><span>${dfmt(l.completedAt,{day:"2-digit",month:"2-digit",year:"2-digit"})}</span></div></div>
        <div class="row"><button class="btn sm" data-again="${esc(l.id)}">Shop this list again</button><span class="grow"></span><button class="btn sm ghost danger" data-hdel="${esc(l.id)}">Delete</button></div>
      </div></details>`).join("")
    :`<div class="empty">No completed lists yet. When you complete a shopping list, it's saved here and what you bought goes into Stock.</div>`}
  </div>`;
}

/* ---------- item sheet ---------- */
function editItem(id){
  const src=itemById(id);
  const it=src?clone(src):{id:uid("i"),name:"",cat:"Pantry",unit:"pcs",qty:0,min:1,target:3,createdAt:Date.now()};
  const host=$("#sheetHost");
  host.innerHTML=`<div class="sheet-bg" id="sheetBg"><form class="sheet stack" id="itemForm" role="dialog" aria-label="${src?"Edit item":"New item"}" autocomplete="off">
    <div class="spread"><h2>${src?"Edit item":"New item"}</h2><button class="btn ghost" type="button" data-close>Close</button></div>
    <div class="form-grid">
      <label class="full">Name<input class="field" id="fName" value="${esc(it.name)}" placeholder="e.g. Oat milk" required></label>
      <label>Category<input class="field" id="fCat" list="catList" value="${esc(it.cat)}"></label>
      <label>Unit<select class="field" id="fUnit">${UNITS.map(u=>`<option ${u===it.unit?"selected":""}>${u}</option>`).join("")}</select></label>
      <label>In stock now<input class="field num" id="fQty" inputmode="decimal" value="${fq(it.qty)}"></label>
      <label>Minimum<input class="field num" id="fMin" inputmode="decimal" value="${fq(it.min)}"></label>
      <label class="full">Top up to (target)<input class="field num" id="fTarget" inputmode="decimal" value="${fq(it.target)}"></label>
    </div>
    <p class="muted" style="margin:0;font-size:13px">When stock goes below the minimum, the item is added to your open shopping list with enough to reach the target. With no open list, a new one is started.</p>
    <button class="btn primary block" type="submit" style="min-height:48px">${src?"Save changes":"Add to stock"}</button>
    ${src?`<button class="btn ghost danger block" type="button" id="fDel">Delete item</button>`:""}
  </form></div>`;
  const close=()=>{host.innerHTML="";host.onclick=null};
  host.onclick=ev=>{const t=ev.target;if(t.id==="sheetBg"||t.closest("[data-close]"))close();if(t.id==="fDel")armed(t,()=>{close();Store.deleteItem(it.id);toast(`Deleted ${it.name}`)})};
  $("#itemForm").onsubmit=async ev=>{
    ev.preventDefault();
    const name=$("#fName").value.trim(); if(!name){$("#fName").focus();return}
    const dupe=itemByName(name); if(dupe&&dupe.id!==it.id){toast(`${dupe.name} is already in stock`);return}
    const out={...it,name,cat:$("#fCat").value.trim()||"Other",unit:$("#fUnit").value,qty:Math.max(0,num($("#fQty").value)),min:Math.max(0,num($("#fMin").value))};
    out.target=Math.max(out.min,num($("#fTarget").value));
    close(); await Store.saveItem(out); await syncAuto(out); if(!src) toast(`Added ${name} to stock`);
  };
  setTimeout(()=>$("#fName")?.focus(),30);
}
function renameList(l){
  const host=$("#sheetHost");
  host.innerHTML=`<div class="sheet-bg" id="sheetBg"><form class="sheet stack" id="renForm" role="dialog" aria-label="Rename list">
    <div class="spread"><h2>Rename list</h2><button class="btn ghost" type="button" data-close>Close</button></div>
    <input class="field" id="renName" value="${esc(l.name)}" aria-label="List name">
    <button class="btn primary block" type="submit">Save name</button></form></div>`;
  const close=()=>{host.innerHTML="";host.onclick=null};
  host.onclick=ev=>{if(ev.target.id==="sheetBg"||ev.target.closest("[data-close]"))close()};
  $("#renForm").onsubmit=ev=>{ev.preventDefault();const n=$("#renName").value.trim();close();if(n){const c=clone(l);c.name=n;Store.saveList(c)}};
  setTimeout(()=>$("#renName")?.select(),30);
}

/* ---------- render ---------- */
function render(){
  if(S.dragging){S.pendingRender=true;return}
  const tab=(location.hash||"#list").slice(1); S.tab=["list","stock","history"].includes(tab)?tab:"list";
  document.querySelectorAll("nav.tabs a").forEach(a=>{if(a.dataset.tab===S.tab)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  const sync=$("#sync"); sync.className="sync "+(S.mode==="cloud"?"cloud":"");
  sync.querySelector("span").textContent=S.mode==="cloud"?"Shared · live":S.mode==="local"?"Saved on this device":"Loading…";
  const l=currentList(), toBuy=l?l.lines.filter(x=>!x.done).length:0, low=lowItems().length;
  const bl=$("#badgeList"); bl.hidden=!toBuy; bl.textContent=toBuy;
  const bs=$("#badgeStock"); bs.hidden=!low; bs.textContent=low;
  $("#itemNames").innerHTML=S.items.map(i=>`<option value="${esc(i.name)}">`).join("");
  $("#catList").innerHTML=CATS.map(c=>`<option value="${esc(c)}">`).join("");
  // keep focus and caret across live re-renders
  const ae=document.activeElement, fid=ae&&ae.id&&$("#main").contains(ae)?ae.id:null, sel=fid&&ae.selectionStart!=null?[ae.selectionStart,ae.selectionEnd]:null;
  $("#main").innerHTML=S.tab==="stock"?viewStock():S.tab==="history"?viewHistory():viewList();
  if(fid){const el=document.getElementById(fid);if(el){el.focus({preventScroll:true});if(sel)try{el.setSelectionRange(...sel)}catch{}}}
}

/* ---------- events ---------- */
const main=$("#main");
main.addEventListener("click",async ev=>{
  const t=ev.target.closest("button,[data-filter]"); if(!t) return;
  const l=currentList();
  if(t.dataset.edit!==undefined){editItem(t.dataset.edit);return}
  if(t.id==="newList"){const n=makeList();if(openLists().some(o=>o.name===n.name))n.name+=" ("+(openLists().length+1)+")";S.listId=n.id;await Store.saveList(n);location.hash="#list";return}
  if(t.id==="renameList"&&l){renameList(l);return}
  if(t.id==="delList"&&l){armed(t,()=>{S.listId=null;Store.deleteList(l.id);toast("List deleted")});return}
  if(t.id==="completeBtn"&&l){t.disabled=true;await completeList(l);return}
  if(t.dataset.pick){S.listId=t.dataset.pick;render();return}
  if(t.id==="addLow"){
    let target=l?clone(l):makeList(), n=0;
    for(const it of lowItems()){ if(target.lines.some(x=>x.itemId===it.id)) continue;
      target.lines.push({id:uid("ln"),itemId:it.id,name:it.name,unit:it.unit,qty:needFor(it),done:false,auto:true,cat:it.cat||"Other"}); n++; }
    S.listId=target.id; await Store.saveList(target); toast(`Added ${n} low item${n>1?"s":""} to the list`); return;
  }
  if(t.id==="addStaples"){
    for(const [name,cat,unit,qty,min,target] of STAPLES){ if(itemByName(name)) continue; await Store.saveItem({id:uid("i"),name,cat,unit,qty,min,target,createdAt:Date.now()}); }
    toast(`Added ${STAPLES.length} staples. Adjust the sliders to what you have`); return;
  }
  const lineEl=t.closest("[data-line]");
  if(lineEl&&l){
    const c=clone(l), ln=c.lines.find(x=>x.id===lineEl.dataset.line); if(!ln) return;
    if(t.dataset.tick!==undefined) ln.done=!ln.done;
    else if(t.dataset.lq){const s=stepOf(ln.unit);ln.qty=Math.max(s,roundTo(num(ln.qty)+s*+t.dataset.lq,s));ln.auto=false}
    else if(t.dataset.ldel!==undefined) c.lines=c.lines.filter(x=>x.id!==ln.id);
    await Store.saveList(c); return;
  }
  if(t.dataset.filter){S.filter=t.dataset.filter;render();return}
  const itemEl=t.closest("[data-item]");
  if(itemEl){
    const it=itemById(itemEl.dataset.item); if(!it) return;
    if(t.dataset.dq){setQty(it.id,num(it.qty)+stepOf(it.unit)*+t.dataset.dq);return}
    if(t.dataset.tolist!==undefined){const c=addLine(it.name,needFor(it),it.unit);if(c){await Store.saveList(c);toast(`Added ${it.name} to ${c.name.split(" · ")[0]}`)}return}
  }
  if(t.dataset.again){
    const h=S.lists.find(x=>x.id===t.dataset.again); if(!h) return;
    let c=l?clone(l):makeList();
    for(const x of [...h.lines,...(h.missed||[])]){ const ex=c.lines.find(y=>!y.done&&norm(y.name)===norm(x.name)); if(ex) continue;
      const it=itemByName(x.name); c.lines.push({id:uid("ln"),itemId:it?.id||null,name:x.name,unit:x.unit,qty:x.qty,done:false,auto:false,cat:it?.cat||"Other"}); }
    S.listId=c.id; await Store.saveList(c); toast("Copied to your open list"); location.hash="#list"; return;
  }
  if(t.dataset.hdel){armed(t,()=>{Store.deleteList(t.dataset.hdel);toast("Removed from history")});return}
});
main.addEventListener("toggle",ev=>{const d=ev.target;if(d.matches?.("details.hist")){if(d.open)S.open=d.dataset.hist;else if(S.open===d.dataset.hist)S.open=null}},true);
main.addEventListener("submit",async ev=>{
  if(ev.target.id!=="addForm") return; ev.preventDefault();
  const name=$("#addName").value.trim(); if(!name){$("#addName").focus();return}
  const c=addLine(name,$("#addQty").value,$("#addUnit").value); if(!c) return;
  S.draft={name:"",qty:"1",unit:"pcs"}; S.listId=c.id; await Store.saveList(c); $("#addName")?.focus();
});
main.addEventListener("input",ev=>{
  const t=ev.target;
  if(t.id==="addName"){S.draft.name=t.value;const it=itemByName(t.value);if(it){S.draft.unit=it.unit;const u=$("#addUnit");if(u)u.value=it.unit}}
  if(t.id==="addQty") S.draft.qty=t.value;
  if(t.id==="search"){S.q=t.value;render()}
  if(t.type==="range"){
    S.dragging=true; const card=t.closest("[data-item]"), it=itemById(card.dataset.item); const v=num(t.value), max=num(t.max);
    t.style.setProperty("--p",v/max); card.querySelector("[data-qtyout]").innerHTML=`${fq(v)}<small>${esc(it.unit)}</small>`;
    const lv=v<=0?"out":v<num(it.min)?"low":"ok"; card.classList.remove("lvl-ok","lvl-low","lvl-out"); card.classList.add("lvl-"+lv);
    t.setAttribute("aria-valuetext",`${fq(v)} ${it.unit}`);
  }
});
main.addEventListener("change",ev=>{
  const t=ev.target;
  if(t.id==="addUnit") S.draft.unit=t.value;
  if(t.type==="range"){S.dragging=false;S.pendingRender=false;setQty(t.closest("[data-item]").dataset.item,t.value,{immediate:true})}
});
["pointerup","touchend","keyup"].forEach(e=>main.addEventListener(e,()=>{if(S.dragging){setTimeout(()=>{if(S.dragging){S.dragging=false;if(S.pendingRender)render()}},300)}}));
window.addEventListener("hashchange",()=>{render();window.scrollTo(0,0)});

render(); Store.init();
})();
