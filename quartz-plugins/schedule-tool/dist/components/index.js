// src/components/scripts/schedule.inline.ts
var schedule_inline_default = 'var I=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];function y(e){let s=Math.floor(e/60),t=e%60;return`${String(s).padStart(2,"0")}:${String(t).padStart(2,"0")}`}var P=e=>e.replace(/\\\\/g,"\\\\\\\\").replace(/\\|/g,"\\\\p"),_=e=>e.replace(/\\\\p/g,"|").replace(/\\\\\\\\/g,"\\\\");function q(e){let s=new TextEncoder().encode(e),t="";for(let n of s)t+=String.fromCharCode(n);return btoa(t).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/,"")}function X(e){let s=e.replace(/-/g,"+").replace(/_/g,"/"),t=atob(s+"=".repeat((4-s.length%4)%4)),n=Uint8Array.from(t,a=>a.charCodeAt(0));return new TextDecoder().decode(n)}function z(e){let s=e.blocks.map(n=>`${n.day}:${n.start}:${n.end}:${n.kind==="course"?"c":"x"}`).join(";"),t=`${e.v}|${P(e.name)}|${P(e.term)}|${s}`;return q(t)}function F(e){let s=e.trim();if(!s)return"";let t="";for(let n of s.split(/\\s+/))/^[A-Za-z0-9_-]+$/.test(n)&&n.length>t.length&&(t=n);return t||s}function V(e){let s=e.trim();if(!s)return{ok:!1,reason:"That code is empty."};let t;try{t=X(s)}catch{return{ok:!1,reason:"That does not look like a schedule code."}}let n=t.split("|");if(n.length<4)return{ok:!1,reason:"That does not look like a schedule code."};let a=Number(n[0]);if(a!==1)return{ok:!1,reason:`That code was made by a different version of this tool (v${n[0]}). Ask for a fresh one.`};let i=_(n[1]),r=_(n[2]),o=n.slice(3).join("|"),l=[];if(o)for(let c of o.split(";")){let[d,u,E,f]=c.split(":"),$=Number(d),T=Number(u),b=Number(E);if(![$,T,b].every(Number.isInteger))return{ok:!1,reason:"That code is damaged. Ask for a fresh one."};if($<0||$>6||T<0||b>1440||b<=T)return{ok:!1,reason:"That code is damaged. Ask for a fresh one."};l.push({memberId:"",day:$,start:T,end:b,kind:f==="c"?"course":"custom",source:"imported"})}return{ok:!0,payload:{v:a,name:i,term:r,blocks:l}}}var ee=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function te(e){return(e+6)%7}function N(e,s){let t=new Date(s.getTime()),n=te(t.getDay()),a=(e-n+7)%7||7;return t.setDate(t.getDate()+a),t}function Y(e,s,t){if(e.length===0)return"No times work for everyone right now. Try a shorter meeting length.";let n=i=>s.find(r=>r.id===i)?.name??"someone";return["Group project \\u2014 when works?","",...e.map(i=>{let r=N(i.day,t),o=`${I[i.day]} ${r.getDate()} ${ee[r.getMonth()]}, ${y(i.start)}-${y(i.end)}`,l=i.busyIds.length===0?`all ${i.freeIds.length} free`:`${i.freeIds.length} of ${s.length}, ${i.busyIds.map(n).join(" and ")} busy`;return`\\u2022 ${o} \\u2014 ${l}`}),"","Reply with whichever works and I\'ll lock it in."].join(`\n`)}var ne=540;function M(e,s){let t=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),0,s-ne),n=new Date(t),a=i=>String(i).padStart(2,"0");return`${n.getUTCFullYear()}${a(n.getUTCMonth()+1)}${a(n.getUTCDate())}T${a(n.getUTCHours())}${a(n.getUTCMinutes())}00Z`}function G(e){let s=N(e.day,e.from);return["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Kouhai Wiki//Schedule Tool//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",`UID:${`kouhai-${s.getTime()}-${e.start}@kouhai-wiki`}`,`DTSTAMP:${M(s,e.start)}`,`DTSTART:${M(s,e.start)}`,`DTEND:${M(s,e.end)}`,`RRULE:FREQ=WEEKLY;COUNT=${e.sessions}`,`SUMMARY:${e.title}`,"END:VEVENT","END:VCALENDAR",""].join(`\\r\n`)}var W="me",R="kw-schedule-codes",p={blocks:[],name:"",term:""},m=[],H=[],g=4,x=480,k=1320,C=new Set,U=!1,S=!1,J,v=null;document.addEventListener("pointerup",()=>{v=null});function O(e,s,t,n){return e.day===s&&e.start<n&&e.end>t}function se(e,s){let t=s+30,n=p.blocks.find(a=>O(a,e,s,t));n?p.blocks=p.blocks.filter(a=>a!==n):p.blocks.push({memberId:W,day:e,start:s,end:t,kind:"custom",source:"manual"}),w()}function w(){let e=document.getElementById("st-grid");if(!e)return;let s=e.scrollTop;e.innerHTML="",e.appendChild(Object.assign(document.createElement("div"),{className:"st-head"}));for(let t of I){let n=document.createElement("div");n.className="st-head",n.textContent=t,e.appendChild(n)}for(let t=oe();t<re();t+=30){let n=t%60===0,a=document.createElement("div");a.className=n?"st-hour":"st-hour st-half",a.textContent=y(t),e.appendChild(a);for(let i=0;i<7;i++){let r=i,o=document.createElement("div");o.className=n?"st-cell st-hourline":"st-cell",p.blocks.some(l=>O(l,r,t,t+30))&&o.classList.add("st-busy"),o.addEventListener("pointerdown",l=>{l.preventDefault(),v={day:r,from:t},se(r,t)}),o.addEventListener("pointerenter",()=>{if(!v||v.day!==r||t===v.from)return;let l=Math.min(v.from,t),c=Math.max(v.from,t)+30;p.blocks=p.blocks.filter(d=>!O(d,r,l,c)),p.blocks.push({memberId:W,day:r,start:l,end:c,kind:"custom",source:"manual"}),w()}),e.appendChild(o)}}e.scrollTop=s,ae()}function oe(){return U||p.blocks.some(e=>e.start<480)?0:480}function re(){return U||p.blocks.some(e=>e.end>1320)?1440:1320}function ae(){let e=document.getElementById("st-clearslots");e&&(e.disabled=p.blocks.length===0,e.disabled&&(S=!1,e.textContent="Clear slots",e.classList.remove("st-armed")))}function le(){try{return sessionStorage.getItem(R)??""}catch{return""}}function ie(e){try{sessionStorage.setItem(R,e)}catch{}}function L(){let e=document.getElementById("st-slots");if(!e)return;let s=Z();e.innerHTML="";for(let t=0;t<g;t++){let n=document.createElement("div");n.className="st-personrow",n.innerHTML=`\n      <label class="st-personlabel" for="st-code-${t}">${t+1}</label>\n      <input class="st-personinput" id="st-code-${t}" type="text"\n             placeholder="Paste person ${t+1}\'s code" value="${s[t]??""}">\n      <span class="st-personstate" id="st-state-${t}"></span>\n    `,e.appendChild(n)}for(let t=0;t<g;t++){let n=document.getElementById(`st-code-${t}`);n?.addEventListener("input",()=>B()),n?.addEventListener("paste",()=>setTimeout(B,0))}B()}function Z(){let e=[];for(let s=0;s<g;s++){let t=document.getElementById(`st-code-${s}`);e.push(F(t?.value??""))}return e}function B(){let e=Z(),s=[],t=new Map,n=new Set;m=[],H=[],C.clear(),e.forEach((o,l)=>{let c=document.getElementById(`st-state-${l}`);if(!o){c&&(c.textContent="",c.className="st-personstate");return}let d=t.get(o);if(d!==void 0){c&&(c.textContent=`same as ${d+1}`,c.className="st-personstate st-bad"),s.push(`Person ${l+1} has the same code as person ${d+1}. Each person needs their own.`);return}t.set(o,l);let u=V(o);if(!u.ok){c&&(c.textContent="not valid",c.className="st-personstate st-bad"),s.push(`Person ${l+1}: ${u.reason}`);return}c&&(c.textContent=u.payload.name||"loaded",c.className="st-personstate st-good");let E=`m${l}`;m.push({id:E,name:u.payload.name||`Person ${l+1}`}),u.payload.term&&n.add(u.payload.term);for(let f of u.payload.blocks)H.push({...f,memberId:E})}),n.size>1&&s.push(`These codes are from different terms (${[...n].join(", ")}). One of them is probably out of date.`);let a=document.getElementById("st-errors");a&&(a.textContent=s.join("  "));let i=g-m.length,r=document.getElementById("st-count");r&&(r.textContent=m.length?`${m.length} of ${g} loaded`+(i>0?`, ${i} still to come`:""):""),ie(JSON.stringify({size:g,codes:e})),D()}function j(e,s){let t=m.filter(a=>H.some(i=>i.memberId===a.id&&i.day===e&&i.start<s+30&&i.end>s)).map(a=>a.name);return{free:m.filter(a=>!t.includes(a.name)).map(a=>a.name),busy:t}}function A(){let e=[];for(let s=0;s<7;s++){let t=null;for(let n=x;n<=k;n+=30){let a=C.has(`${s}:${n}`)&&n<k;if(a&&!t)t={start:n,end:n+30};else if(a&&t)t.end=n+30;else if(!a&&t){let{free:i,busy:r}=j(s,t.start);e.push({day:s,start:t.start,end:t.end,freeIds:m.filter(o=>i.includes(o.name)).map(o=>o.id),busyIds:m.filter(o=>r.includes(o.name)).map(o=>o.id)}),t=null}}}return e}function D(){let e=document.getElementById("st-results");if(!e)return;if(m.length===0){e.innerHTML="";return}let s=document.getElementById("st-min"),t=Number(s?.value??60);e.innerHTML=`\n    <div class="st-legend">\n      <span><i class="st-key st-all"></i> everyone free</span>\n      <span><i class="st-key st-most"></i> most free</span>\n      <span><i class="st-key st-some"></i> some free</span>\n      <span><i class="st-key st-none"></i> nobody</span>\n      <label class="st-hoursbox">\n        <input type="checkbox" id="st-allhours"> show all 24 hours\n      </label>\n    </div>\n    <div class="st-grid st-resultgrid" id="st-rgrid"></div>\n    <p class="st-note">Tap the half hours that suit the group. Runs of tapped cells become one option. Only stretches of at least ${t} minutes where everyone is free are outlined.</p>\n    <div id="st-picked"></div>\n    <div class="st-actions">\n      <button id="st-msg">Copy message</button>\n      <select id="st-sessions" aria-label="How many sessions">\n        ${[1,2,3,4,6,8].map(o=>`<option value="${o}">${o} session${o>1?"s":""}</option>`).join("")}\n      </select>\n      <button id="st-ics">Add to calendar</button>\n    </div>\n  `;let n=document.getElementById("st-rgrid");if(n){n.appendChild(Object.assign(document.createElement("div"),{className:"st-head"}));for(let o of I){let l=document.createElement("div");l.className="st-head",l.textContent=o,n.appendChild(l)}for(let o=x;o<k;o+=30){let l=o%60===0,c=document.createElement("div");c.className=l?"st-hour":"st-hour st-half",c.textContent=y(o),n.appendChild(c);for(let d=0;d<7;d++){let{free:u,busy:E}=j(d,o),f=document.createElement("div"),$=m.length?u.length/m.length:0,T=u.length===m.length?"st-all":$>=.5?"st-most":u.length>0?"st-some":"st-none";f.className=`st-cell ${T}${l?" st-hourline":""}`,C.has(`${d}:${o}`)&&f.classList.add("st-picked"),u.length===m.length&&ce(d,o)>=t&&f.classList.add("st-viable"),f.title=E.length?`${u.length} of ${m.length} free. Busy: ${E.join(", ")}`:"everyone free",f.addEventListener("click",()=>{let b=`${d}:${o}`;C.has(b)?C.delete(b):C.add(b),D()}),n.appendChild(f)}}}let a=A(),i=document.getElementById("st-picked");i&&(i.innerHTML=a.length?a.map(o=>{let l=o.busyIds.map(c=>m.find(d=>d.id===c)?.name).filter(Boolean);return`<div class="st-slot" aria-selected="true">\n              <span><strong>${I[o.day]} ${y(o.start)}-${y(o.end)}</strong></span>\n              <span class="st-slot-who">${l.length===0?`all ${o.freeIds.length} free`:`${o.freeIds.length} of ${m.length}, ${l.join(", ")} busy`}</span>\n            </div>`}).join(""):\'<p class="st-note">Nothing picked yet. Tap the green cells above.</p>\');let r=document.getElementById("st-allhours");r&&(r.checked=x===0&&k===1440,r.addEventListener("change",()=>{r.checked?(x=0,k=1440):(x=480,k=1320),D()})),document.getElementById("st-msg")?.addEventListener("click",async()=>{let o=Y(A(),m,new Date);try{await navigator.clipboard.writeText(o);let l=document.getElementById("st-msg");l&&(l.textContent="Copied",setTimeout(()=>{l.textContent="Copy message"},1500))}catch{window.prompt("Copy this:",o)}}),document.getElementById("st-ics")?.addEventListener("click",()=>{let o=A()[0];if(!o)return;let l=Number(document.getElementById("st-sessions").value),c=G({title:"Group project",day:o.day,start:o.start,end:o.end,sessions:l,from:new Date}),d=URL.createObjectURL(new Blob([c],{type:"text/calendar"})),u=document.createElement("a");u.href=d,u.download="group-meeting.ics",u.click(),URL.revokeObjectURL(d)})}function ce(e,s){let t=s;for(;t<k;){let{free:n}=j(e,t);if(n.length!==m.length)break;t+=30}return t-s}function K(e){for(let s of["mine","group"]){let t=document.getElementById(`st-tab-${s}`),n=document.getElementById(`st-panel-${s}`);t&&t.setAttribute("aria-selected",String(s===e)),n&&(n.hidden=s!==e)}}function Q(){let e=document.getElementById("schedule-tool");if(!e||e.dataset.mounted)return;e.dataset.mounted="1",e.innerHTML=`\n    <div class="st-tabs" role="tablist">\n      <button class="st-tab" id="st-tab-mine" role="tab" aria-selected="true">My schedule</button>\n      <button class="st-tab" id="st-tab-group" role="tab" aria-selected="false">Find group time</button>\n    </div>\n\n    <section class="st-panel" id="st-panel-mine" role="tabpanel">\n      <div class="st-grid" id="st-grid"></div>\n      <div class="st-actions">\n        <button id="st-clearslots" class="st-danger" disabled>Clear slots</button>\n        <label class="st-hoursbox">\n          <input type="checkbox" id="st-mine-allhours"> show all 24 hours\n        </label>\n      </div>\n      <p class="st-note"><strong>Each row is 30 minutes.</strong> Tap a cell to mark yourself busy, tap it again to clear it. On a computer you can drag down a column to fill several at once. On a phone the grid scrolls sideways, so swipe across to reach the weekend.</p>\n      <p class="st-note">Class times like 8:50 do not land on a 30-minute row, so round outward. Being blocked slightly early beats scheduling over a lecture.</p>\n      <div class="st-actions">\n        <input id="st-name" placeholder="Your name">\n        <input id="st-term" placeholder="Term, e.g. 2026 Fall">\n        <button id="st-share" hidden>Send my code</button>\n        <button id="st-copy">Copy my code</button>\n      </div>\n      <p class="st-note">This code contains your weekly schedule. Nothing is sent to any server, it only goes where you paste it.</p>\n    </section>\n\n    <section class="st-panel" id="st-panel-group" role="tabpanel" hidden>\n      <p class="st-note">Ask everyone to open this page, mark their busy times, and send you their code. Then set how many of you there are and paste each code into its own box.</p>\n      <div class="st-actions">\n        <label for="st-size">People in the group</label>\n        <select id="st-size" aria-label="People in the group">\n          ${[2,3,4,5,6,7,8].map(r=>`<option value="${r}"${r===4?" selected":""}>${r}</option>`).join("")}\n        </select>\n        <span class="st-note" id="st-count" style="margin:0"></span>\n      </div>\n      <div id="st-slots"></div>\n      <div class="st-actions">\n        <button id="st-clear">Clear all</button>\n        <label for="st-min">Meeting length</label>\n        <select id="st-min" aria-label="Minimum meeting length">\n          <option value="30">30 min</option>\n          <option value="60" selected>1 hour</option>\n          <option value="90">1.5 hours</option>\n        </select>\n      </div>\n      <p class="st-note">Pasted codes stay in this browser tab and are forgotten when you close it. Nothing is uploaded.</p>\n      <div id="st-errors" class="st-error"></div>\n      <div id="st-results"></div>\n    </section>\n  `,document.getElementById("st-tab-mine")?.addEventListener("click",()=>K("mine")),document.getElementById("st-tab-group")?.addEventListener("click",()=>K("group")),document.getElementById("st-clearslots")?.addEventListener("click",()=>{let r=document.getElementById("st-clearslots");if(!(!r||r.disabled)){if(!S){S=!0,r.textContent="Tap again to clear",r.classList.add("st-armed"),J=setTimeout(()=>{S=!1,r.textContent="Clear slots",r.classList.remove("st-armed")},3e3);return}clearTimeout(J),S=!1,r.classList.remove("st-armed"),r.textContent="Clear slots",p.blocks=[],w()}});function s(){let r=document.getElementById("st-name"),o=document.getElementById("st-term");return p.name=r?.value.trim()||"Someone",p.term=o?.value.trim()||"",z({v:1,name:p.name,term:p.term,blocks:p.blocks})}let t=document.getElementById("st-share");t&&typeof navigator.share=="function"&&(t.hidden=!1,t.addEventListener("click",async()=>{try{await navigator.share({text:s()})}catch{}})),document.getElementById("st-copy")?.addEventListener("click",async()=>{let r=s(),o=document.getElementById("st-copy");try{await navigator.clipboard.writeText(r),o&&(o.textContent="Copied",setTimeout(()=>{o.textContent="Copy my code"},1500))}catch{let l=document.createElement("textarea");l.className="st-code",l.value=r,o?.after(l),l.select()}});let n=document.getElementById("st-size");n?.addEventListener("change",()=>{g=Number(n.value),L()}),document.getElementById("st-clear")?.addEventListener("click",()=>{for(let r=0;r<g;r++){let o=document.getElementById(`st-code-${r}`);o&&(o.value="")}try{sessionStorage.removeItem(R)}catch{}B()}),document.getElementById("st-min")?.addEventListener("change",D);let a=document.getElementById("st-mine-allhours");a?.addEventListener("change",()=>{U=a.checked,w()});let i=le();if(i)try{let r=JSON.parse(i);r.size>=2&&r.size<=8&&(g=r.size,n&&(n.value=String(g))),L(),r.codes.forEach((o,l)=>{let c=document.getElementById(`st-code-${l}`);c&&(c.value=o)}),B()}catch{L()}else L();w()}document.addEventListener("nav",Q);Q();\n';
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
  /* No height cap, so the grid is exactly as tall as its rows and never
     becomes a nested vertical scrollbox. That was trapping the scroll: you
     would reach the bottom of the grid and the page would not take over.
     overflow-x still gives sideways scrolling for the seven columns, and
     overscroll-behavior-x keeps a horizontal swipe from triggering
     browser back navigation. */
  overflow-x: auto; overscroll-behavior-x: contain;
  user-select: none; touch-action: pan-x pan-y; }
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