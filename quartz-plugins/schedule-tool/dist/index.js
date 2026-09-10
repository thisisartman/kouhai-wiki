// src/components/scripts/schedule.inline.ts
var schedule_inline_default = 'var I=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];function b(e){let s=Math.floor(e/60),n=e%60;return`${String(s).padStart(2,"0")}:${String(n).padStart(2,"0")}`}var j=e=>e.replace(/\\\\/g,"\\\\\\\\").replace(/\\|/g,"\\\\p"),P=e=>e.replace(/\\\\p/g,"|").replace(/\\\\\\\\/g,"\\\\");function Q(e){let s=new TextEncoder().encode(e),n="";for(let t of s)n+=String.fromCharCode(t);return btoa(n).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/,"")}function q(e){let s=e.replace(/-/g,"+").replace(/_/g,"/"),n=atob(s+"=".repeat((4-s.length%4)%4)),t=Uint8Array.from(n,a=>a.charCodeAt(0));return new TextDecoder().decode(t)}function _(e){let s=e.blocks.map(t=>`${t.day}:${t.start}:${t.end}:${t.kind==="course"?"c":"x"}`).join(";"),n=`${e.v}|${j(e.name)}|${j(e.term)}|${s}`;return Q(n)}function z(e){let s=e.trim();if(!s)return"";let n="";for(let t of s.split(/\\s+/))/^[A-Za-z0-9_-]+$/.test(t)&&t.length>n.length&&(n=t);return n||s}function F(e){let s=e.trim();if(!s)return{ok:!1,reason:"That code is empty."};let n;try{n=q(s)}catch{return{ok:!1,reason:"That does not look like a schedule code."}}let t=n.split("|");if(t.length<4)return{ok:!1,reason:"That does not look like a schedule code."};let a=Number(t[0]);if(a!==1)return{ok:!1,reason:`That code was made by a different version of this tool (v${t[0]}). Ask for a fresh one.`};let r=P(t[1]),i=P(t[2]),o=t.slice(3).join("|"),l=[];if(o)for(let c of o.split(";")){let[u,d,E,g]=c.split(":"),$=Number(u),T=Number(d),y=Number(E);if(![$,T,y].every(Number.isInteger))return{ok:!1,reason:"That code is damaged. Ask for a fresh one."};if($<0||$>6||T<0||y>1440||y<=T)return{ok:!1,reason:"That code is damaged. Ask for a fresh one."};l.push({memberId:"",day:$,start:T,end:y,kind:g==="c"?"course":"custom",source:"imported"})}return{ok:!0,payload:{v:a,name:r,term:i,blocks:l}}}var X=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function ee(e){return(e+6)%7}function N(e,s){let n=new Date(s.getTime()),t=ee(n.getDay()),a=(e-t+7)%7||7;return n.setDate(n.getDate()+a),n}function V(e,s,n){if(e.length===0)return"No times work for everyone right now. Try a shorter meeting length.";let t=r=>s.find(i=>i.id===r)?.name??"someone";return["Group project \\u2014 when works?","",...e.map(r=>{let i=N(r.day,n),o=`${I[r.day]} ${i.getDate()} ${X[i.getMonth()]}, ${b(r.start)}-${b(r.end)}`,l=r.busyIds.length===0?`all ${r.freeIds.length} free`:`${r.freeIds.length} of ${s.length}, ${r.busyIds.map(t).join(" and ")} busy`;return`\\u2022 ${o} \\u2014 ${l}`}),"","Reply with whichever works and I\'ll lock it in."].join(`\n`)}var te=540;function M(e,s){let n=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),0,s-te),t=new Date(n),a=r=>String(r).padStart(2,"0");return`${t.getUTCFullYear()}${a(t.getUTCMonth()+1)}${a(t.getUTCDate())}T${a(t.getUTCHours())}${a(t.getUTCMinutes())}00Z`}function Y(e){let s=N(e.day,e.from);return["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Kouhai Wiki//Schedule Tool//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",`UID:${`kouhai-${s.getTime()}-${e.start}@kouhai-wiki`}`,`DTSTAMP:${M(s,e.start)}`,`DTSTART:${M(s,e.start)}`,`DTEND:${M(s,e.end)}`,`RRULE:FREQ=WEEKLY;COUNT=${e.sessions}`,`SUMMARY:${e.title}`,"END:VEVENT","END:VCALENDAR",""].join(`\\r\n`)}var W="me",ne=1440/30,R="kw-schedule-codes",p={blocks:[],name:"",term:""},m=[],O=[],h=4,x=480,k=1320,C=new Set,S=!1,G,v=null;document.addEventListener("pointerup",()=>{v=null});function H(e,s,n,t){return e.day===s&&e.start<t&&e.end>n}function se(e,s){let n=s+30,t=p.blocks.find(a=>H(a,e,s,n));t?p.blocks=p.blocks.filter(a=>a!==t):p.blocks.push({memberId:W,day:e,start:s,end:n,kind:"custom",source:"manual"}),D()}function D(){let e=document.getElementById("st-grid");if(!e)return;let s=e.scrollTop;e.innerHTML="",e.appendChild(Object.assign(document.createElement("div"),{className:"st-head"}));for(let n of I){let t=document.createElement("div");t.className="st-head",t.textContent=n,e.appendChild(t)}for(let n=0;n<ne;n++){let t=n*30,a=t%60===0,r=document.createElement("div");r.className=a?"st-hour":"st-hour st-half",r.textContent=b(t),e.appendChild(r);for(let i=0;i<7;i++){let o=i,l=document.createElement("div");l.className=a?"st-cell st-hourline":"st-cell",p.blocks.some(c=>H(c,o,t,t+30))&&l.classList.add("st-busy"),l.addEventListener("pointerdown",c=>{c.preventDefault(),v={day:o,from:t},se(o,t)}),l.addEventListener("pointerenter",()=>{if(!v||v.day!==o||t===v.from)return;let c=Math.min(v.from,t),u=Math.max(v.from,t)+30;p.blocks=p.blocks.filter(d=>!H(d,o,c,u)),p.blocks.push({memberId:W,day:o,start:c,end:u,kind:"custom",source:"manual"}),D()}),e.appendChild(l)}}e.scrollTop=s||420/30*15,oe()}function oe(){let e=document.getElementById("st-clearslots");e&&(e.disabled=p.blocks.length===0,e.disabled&&(S=!1,e.textContent="Clear slots",e.classList.remove("st-armed")))}function re(){try{return sessionStorage.getItem(R)??""}catch{return""}}function ae(e){try{sessionStorage.setItem(R,e)}catch{}}function B(){let e=document.getElementById("st-slots");if(!e)return;let s=K();e.innerHTML="";for(let n=0;n<h;n++){let t=document.createElement("div");t.className="st-personrow",t.innerHTML=`\n      <label class="st-personlabel" for="st-code-${n}">${n+1}</label>\n      <input class="st-personinput" id="st-code-${n}" type="text"\n             placeholder="Paste person ${n+1}\'s code" value="${s[n]??""}">\n      <span class="st-personstate" id="st-state-${n}"></span>\n    `,e.appendChild(t)}for(let n=0;n<h;n++){let t=document.getElementById(`st-code-${n}`);t?.addEventListener("input",()=>w()),t?.addEventListener("paste",()=>setTimeout(w,0))}w()}function K(){let e=[];for(let s=0;s<h;s++){let n=document.getElementById(`st-code-${s}`);e.push(z(n?.value??""))}return e}function w(){let e=K(),s=[],n=new Map,t=new Set;m=[],O=[],C.clear(),e.forEach((o,l)=>{let c=document.getElementById(`st-state-${l}`);if(!o){c&&(c.textContent="",c.className="st-personstate");return}let u=n.get(o);if(u!==void 0){c&&(c.textContent=`same as ${u+1}`,c.className="st-personstate st-bad"),s.push(`Person ${l+1} has the same code as person ${u+1}. Each person needs their own.`);return}n.set(o,l);let d=F(o);if(!d.ok){c&&(c.textContent="not valid",c.className="st-personstate st-bad"),s.push(`Person ${l+1}: ${d.reason}`);return}c&&(c.textContent=d.payload.name||"loaded",c.className="st-personstate st-good");let E=`m${l}`;m.push({id:E,name:d.payload.name||`Person ${l+1}`}),d.payload.term&&t.add(d.payload.term);for(let g of d.payload.blocks)O.push({...g,memberId:E})}),t.size>1&&s.push(`These codes are from different terms (${[...t].join(", ")}). One of them is probably out of date.`);let a=document.getElementById("st-errors");a&&(a.textContent=s.join("  "));let r=h-m.length,i=document.getElementById("st-count");i&&(i.textContent=m.length?`${m.length} of ${h} loaded`+(r>0?`, ${r} still to come`:""):""),ae(JSON.stringify({size:h,codes:e})),L()}function U(e,s){let n=m.filter(a=>O.some(r=>r.memberId===a.id&&r.day===e&&r.start<s+30&&r.end>s)).map(a=>a.name);return{free:m.filter(a=>!n.includes(a.name)).map(a=>a.name),busy:n}}function A(){let e=[];for(let s=0;s<7;s++){let n=null;for(let t=x;t<=k;t+=30){let a=C.has(`${s}:${t}`)&&t<k;if(a&&!n)n={start:t,end:t+30};else if(a&&n)n.end=t+30;else if(!a&&n){let{free:r,busy:i}=U(s,n.start);e.push({day:s,start:n.start,end:n.end,freeIds:m.filter(o=>r.includes(o.name)).map(o=>o.id),busyIds:m.filter(o=>i.includes(o.name)).map(o=>o.id)}),n=null}}}return e}function L(){let e=document.getElementById("st-results");if(!e)return;if(m.length===0){e.innerHTML="";return}let s=document.getElementById("st-min"),n=Number(s?.value??60);e.innerHTML=`\n    <div class="st-legend">\n      <span><i class="st-key st-all"></i> everyone free</span>\n      <span><i class="st-key st-most"></i> most free</span>\n      <span><i class="st-key st-some"></i> some free</span>\n      <span><i class="st-key st-none"></i> nobody</span>\n      <label class="st-hoursbox">\n        <input type="checkbox" id="st-allhours"> show all 24 hours\n      </label>\n    </div>\n    <div class="st-grid st-resultgrid" id="st-rgrid" style="max-height:60vh"></div>\n    <p class="st-note">Tap the half hours that suit the group. Runs of tapped cells become one option. Only stretches of at least ${n} minutes where everyone is free are outlined.</p>\n    <div id="st-picked"></div>\n    <div class="st-actions">\n      <button id="st-msg">Copy message</button>\n      <select id="st-sessions" aria-label="How many sessions">\n        ${[1,2,3,4,6,8].map(o=>`<option value="${o}">${o} session${o>1?"s":""}</option>`).join("")}\n      </select>\n      <button id="st-ics">Add to calendar</button>\n    </div>\n  `;let t=document.getElementById("st-rgrid");if(t){t.appendChild(Object.assign(document.createElement("div"),{className:"st-head"}));for(let o of I){let l=document.createElement("div");l.className="st-head",l.textContent=o,t.appendChild(l)}for(let o=x;o<k;o+=30){let l=o%60===0,c=document.createElement("div");c.className=l?"st-hour":"st-hour st-half",c.textContent=b(o),t.appendChild(c);for(let u=0;u<7;u++){let{free:d,busy:E}=U(u,o),g=document.createElement("div"),$=m.length?d.length/m.length:0,T=d.length===m.length?"st-all":$>=.5?"st-most":d.length>0?"st-some":"st-none";g.className=`st-cell ${T}${l?" st-hourline":""}`,C.has(`${u}:${o}`)&&g.classList.add("st-picked"),d.length===m.length&&le(u,o)>=n&&g.classList.add("st-viable"),g.title=E.length?`${d.length} of ${m.length} free. Busy: ${E.join(", ")}`:"everyone free",g.addEventListener("click",()=>{let y=`${u}:${o}`;C.has(y)?C.delete(y):C.add(y),L()}),t.appendChild(g)}}}let a=A(),r=document.getElementById("st-picked");r&&(r.innerHTML=a.length?a.map(o=>{let l=o.busyIds.map(c=>m.find(u=>u.id===c)?.name).filter(Boolean);return`<div class="st-slot" aria-selected="true">\n              <span><strong>${I[o.day]} ${b(o.start)}-${b(o.end)}</strong></span>\n              <span class="st-slot-who">${l.length===0?`all ${o.freeIds.length} free`:`${o.freeIds.length} of ${m.length}, ${l.join(", ")} busy`}</span>\n            </div>`}).join(""):\'<p class="st-note">Nothing picked yet. Tap the green cells above.</p>\');let i=document.getElementById("st-allhours");i&&(i.checked=x===0&&k===1440,i.addEventListener("change",()=>{i.checked?(x=0,k=1440):(x=480,k=1320),L()})),document.getElementById("st-msg")?.addEventListener("click",async()=>{let o=V(A(),m,new Date);try{await navigator.clipboard.writeText(o);let l=document.getElementById("st-msg");l&&(l.textContent="Copied",setTimeout(()=>{l.textContent="Copy message"},1500))}catch{window.prompt("Copy this:",o)}}),document.getElementById("st-ics")?.addEventListener("click",()=>{let o=A()[0];if(!o)return;let l=Number(document.getElementById("st-sessions").value),c=Y({title:"Group project",day:o.day,start:o.start,end:o.end,sessions:l,from:new Date}),u=URL.createObjectURL(new Blob([c],{type:"text/calendar"})),d=document.createElement("a");d.href=u,d.download="group-meeting.ics",d.click(),URL.revokeObjectURL(u)})}function le(e,s){let n=s;for(;n<k;){let{free:t}=U(e,n);if(t.length!==m.length)break;n+=30}return n-s}function J(e){for(let s of["mine","group"]){let n=document.getElementById(`st-tab-${s}`),t=document.getElementById(`st-panel-${s}`);n&&n.setAttribute("aria-selected",String(s===e)),t&&(t.hidden=s!==e)}}function Z(){let e=document.getElementById("schedule-tool");if(!e||e.dataset.mounted)return;e.dataset.mounted="1",e.innerHTML=`\n    <div class="st-tabs" role="tablist">\n      <button class="st-tab" id="st-tab-mine" role="tab" aria-selected="true">My schedule</button>\n      <button class="st-tab" id="st-tab-group" role="tab" aria-selected="false">Find group time</button>\n    </div>\n\n    <section class="st-panel" id="st-panel-mine" role="tabpanel">\n      <div class="st-grid" id="st-grid" style="max-height:60vh"></div>\n      <div class="st-actions">\n        <button id="st-clearslots" class="st-danger" disabled>Clear slots</button>\n      </div>\n      <p class="st-note"><strong>Each row is 30 minutes.</strong> Tap a cell to mark yourself busy, tap it again to clear it. On a computer you can drag down a column to fill several at once. On a phone the grid scrolls sideways, so swipe across to reach the weekend.</p>\n      <p class="st-note">Class times like 8:50 do not land on a 30-minute row, so round outward. Being blocked slightly early beats scheduling over a lecture.</p>\n      <div class="st-actions">\n        <input id="st-name" placeholder="Your name">\n        <input id="st-term" placeholder="Term, e.g. 2026 Fall">\n        <button id="st-share" hidden>Send my code</button>\n        <button id="st-copy">Copy my code</button>\n      </div>\n      <p class="st-note">This code contains your weekly schedule. Nothing is sent to any server, it only goes where you paste it.</p>\n    </section>\n\n    <section class="st-panel" id="st-panel-group" role="tabpanel" hidden>\n      <p class="st-note">Ask everyone to open this page, mark their busy times, and send you their code. Then set how many of you there are and paste each code into its own box.</p>\n      <div class="st-actions">\n        <label for="st-size">People in the group</label>\n        <select id="st-size" aria-label="People in the group">\n          ${[2,3,4,5,6,7,8].map(r=>`<option value="${r}"${r===4?" selected":""}>${r}</option>`).join("")}\n        </select>\n        <span class="st-note" id="st-count" style="margin:0"></span>\n      </div>\n      <div id="st-slots"></div>\n      <div class="st-actions">\n        <button id="st-clear">Clear all</button>\n        <label for="st-min">Meeting length</label>\n        <select id="st-min" aria-label="Minimum meeting length">\n          <option value="30">30 min</option>\n          <option value="60" selected>1 hour</option>\n          <option value="90">1.5 hours</option>\n        </select>\n      </div>\n      <p class="st-note">Pasted codes stay in this browser tab and are forgotten when you close it. Nothing is uploaded.</p>\n      <div id="st-errors" class="st-error"></div>\n      <div id="st-results"></div>\n    </section>\n  `,document.getElementById("st-tab-mine")?.addEventListener("click",()=>J("mine")),document.getElementById("st-tab-group")?.addEventListener("click",()=>J("group")),document.getElementById("st-clearslots")?.addEventListener("click",()=>{let r=document.getElementById("st-clearslots");if(!(!r||r.disabled)){if(!S){S=!0,r.textContent="Tap again to clear",r.classList.add("st-armed"),G=setTimeout(()=>{S=!1,r.textContent="Clear slots",r.classList.remove("st-armed")},3e3);return}clearTimeout(G),S=!1,r.classList.remove("st-armed"),r.textContent="Clear slots",p.blocks=[],D()}});function s(){let r=document.getElementById("st-name"),i=document.getElementById("st-term");return p.name=r?.value.trim()||"Someone",p.term=i?.value.trim()||"",_({v:1,name:p.name,term:p.term,blocks:p.blocks})}let n=document.getElementById("st-share");n&&typeof navigator.share=="function"&&(n.hidden=!1,n.addEventListener("click",async()=>{try{await navigator.share({text:s()})}catch{}})),document.getElementById("st-copy")?.addEventListener("click",async()=>{let r=s(),i=document.getElementById("st-copy");try{await navigator.clipboard.writeText(r),i&&(i.textContent="Copied",setTimeout(()=>{i.textContent="Copy my code"},1500))}catch{let o=document.createElement("textarea");o.className="st-code",o.value=r,i?.after(o),o.select()}});let t=document.getElementById("st-size");t?.addEventListener("change",()=>{h=Number(t.value),B()}),document.getElementById("st-clear")?.addEventListener("click",()=>{for(let r=0;r<h;r++){let i=document.getElementById(`st-code-${r}`);i&&(i.value="")}try{sessionStorage.removeItem(R)}catch{}w()}),document.getElementById("st-min")?.addEventListener("change",L);let a=re();if(a)try{let r=JSON.parse(a);r.size>=2&&r.size<=8&&(h=r.size,t&&(t.value=String(h))),B(),r.codes.forEach((i,o)=>{let l=document.getElementById(`st-code-${o}`);l&&(l.value=i)}),w()}catch{B()}else B();D()}document.addEventListener("nav",Z);Z();\n';
var l;
l = { __e: function(n2, l2, u3, t2) {
  for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
    if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
  } catch (l3) {
    n2 = l3;
  }
  throw n2;
} }, "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, Math.random().toString(8);

// node_modules/preact/jsx-runtime/dist/jsxRuntime.mjs
var f2 = 0;
function u2(e2, t2, n2, o2, i2, u3) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f2, __i: -1, __u: 0, __source: i2, __self: u3 };
  return l.vnode && l.vnode(l2), l2;
}

// src/components/ScheduleTool.tsx
var css = `
.st-root { margin: 1.5rem 0 2rem; font-family: var(--bodyFont); }
/* Underline tabs rather than filled pills. A filled rounded rect reads as a
   button you press; an underline reads as the view you are currently in. */
.st-tabs { display: flex; gap: 1.5rem; margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--lightgray); }
.st-tab { padding: .5em 0 .55em; border: 0; border-bottom: 2px solid transparent;
  border-radius: 0; background: none; color: var(--gray); cursor: pointer;
  font-weight: 600; font-size: .95rem; font-family: inherit;
  margin-bottom: -1px; transition: color .12s ease, border-color .12s ease; }
.st-tab:hover { color: var(--darkgray); }
.st-tab[aria-selected="true"] { color: var(--secondary); border-bottom-color: var(--secondary); }
.st-tab:focus-visible { outline: 2px solid var(--secondary); outline-offset: 3px; }
.st-panel[hidden] { display: none !important; }
.st-note { font-size: .78rem; color: var(--gray); margin-top: .6rem; line-height: 1.5; }
/* min-width forces sideways scrolling on a phone instead of squeezing seven
   columns into 375px, where cells become too narrow to tap accurately */
.st-grid { display: grid; grid-template-columns: 3.9rem repeat(7, minmax(74px, 1fr));
  gap: 1px; min-width: max-content;
  background: var(--lightgray); border: 1px solid var(--lightgray);
  overflow: auto; user-select: none; touch-action: pan-x pan-y; }
.st-cell { background: var(--light); min-height: 22px; cursor: pointer; }
.st-cell.st-busy { background: var(--secondary); }
/* a heavier line on the hour so the half-hour rows read as subdivisions */
.st-cell.st-hourline { box-shadow: inset 0 1px 0 var(--lightgray); }
.st-hour { background: var(--light); font-size: .66rem; color: var(--darkgray);
  padding: 3px 5px; text-align: right; font-variant-numeric: tabular-nums;
  white-space: nowrap; }
.st-hour.st-half { color: var(--gray); opacity: .6; }
.st-head { background: var(--light); font-size: .75rem; font-weight: 700;
  text-align: center; padding: 6px 0; position: sticky; top: 0; z-index: 1; }
.st-actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem;
  align-items: center; }
.st-actions button, .st-actions select, .st-actions input {
  padding: .45em .9em; border-radius: 5px; border: 1px solid var(--lightgray);
  background: var(--light); color: var(--darkgray); font-weight: 600; }
.st-actions button { cursor: pointer; }
.st-actions button:disabled { opacity: .45; cursor: default; }
.st-danger { color: #a33; }
.st-danger.st-armed { background: #a33; color: var(--light); border-color: #a33; }
.st-code { width: 100%; min-height: 5rem; font-family: var(--codeFont); font-size: .8rem;
  padding: .5rem; border-radius: 5px; border: 1px solid var(--lightgray);
  background: var(--light); color: var(--darkgray); }
.st-slot { display: flex; justify-content: space-between; gap: 1rem; padding: .5em .75em;
  border: 1px solid var(--lightgray); border-radius: 5px; margin-bottom: .4rem;
  cursor: pointer; background: var(--light); }
.st-slot[aria-selected="true"] { border-color: var(--secondary); background: var(--highlight); }
.st-slot-who { font-size: .78rem; color: var(--gray); text-align: right; }
.st-error { color: #a33; font-size: .8rem; margin-top: .5rem; line-height: 1.5; }
.st-personrow { display: flex; align-items: center; gap: .6rem; margin-bottom: .45rem; }
.st-personlabel { flex: 0 0 1.4rem; text-align: right; font-size: .8rem;
  font-weight: 700; color: var(--gray); }
.st-personinput { flex: 1 1 auto; min-width: 0; padding: .45em .6em; border-radius: 5px;
  border: 1px solid var(--lightgray); background: var(--light); color: var(--darkgray);
  font-family: var(--codeFont); font-size: .78rem; }
.st-personstate { flex: 0 0 7rem; font-size: .75rem; color: var(--gray);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.st-personstate.st-good { color: var(--secondary); font-weight: 600; }
.st-personstate.st-bad { color: #a33; }

/* Results grid: availability as a heat map rather than a list of long windows.
   A three-hour free window is not a meeting time; the grid lets you pick the
   part of it you actually want. */
.st-resultgrid .st-cell { cursor: pointer; }
.st-cell.st-all  { background: #2e7d52; }
.st-cell.st-most { background: #4e8f6d; opacity: .72; }
.st-cell.st-some { background: #4e8f6d; opacity: .34; }
.st-cell.st-none { background: var(--light); }
.st-cell.st-viable { box-shadow: inset 0 0 0 1px #8fd3ae; }
.st-cell.st-picked { background: var(--secondary); box-shadow: inset 0 0 0 2px var(--light); }
.st-legend { display: flex; flex-wrap: wrap; gap: .9rem; align-items: center;
  font-size: .74rem; color: var(--gray); margin: .2rem 0 .6rem; }
.st-key { display: inline-block; width: .85em; height: .85em; border-radius: 2px;
  vertical-align: -1px; margin-right: .3em; border: 1px solid var(--lightgray); }
.st-key.st-all  { background: #2e7d52; }
.st-key.st-most { background: #4e8f6d; opacity: .72; }
.st-key.st-some { background: #4e8f6d; opacity: .34; }
.st-key.st-none { background: var(--light); }
.st-hoursbox { display: inline-flex; align-items: center; gap: .35em; cursor: pointer; }
@media (max-width: 550px) {
  .st-personstate { flex-basis: 4.5rem; }
}
@media (max-width: 800px) {
  .st-hour { font-size: .62rem; }
  .st-cell { min-height: 26px; }  /* bigger tap target on touch screens */
}
`;
var ScheduleTool = () => {
  const Component = ({ fileData }) => {
    if (fileData.frontmatter?.tool !== "schedule") return null;
    return /* @__PURE__ */ u2("div", { id: "schedule-tool", class: "st-root" });
  };
  Component.css = css;
  Component.afterDOMLoaded = schedule_inline_default;
  return Component;
};
var ScheduleTool_default = ScheduleTool;

export { ScheduleTool_default as ScheduleTool };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map