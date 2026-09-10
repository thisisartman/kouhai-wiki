// src/components/scripts/schedule.inline.ts
var schedule_inline_default = 'var $=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];function b(e){let o=Math.floor(e/60),n=e%60;return`${String(o).padStart(2,"0")}:${String(n).padStart(2,"0")}`}var A=e=>e.replace(/\\\\/g,"\\\\\\\\").replace(/\\|/g,"\\\\p"),O=e=>e.replace(/\\\\p/g,"|").replace(/\\\\\\\\/g,"\\\\");function G(e){let o=new TextEncoder().encode(e),n="";for(let t of o)n+=String.fromCharCode(t);return btoa(n).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/,"")}function J(e){let o=e.replace(/-/g,"+").replace(/_/g,"/"),n=atob(o+"=".repeat((4-o.length%4)%4)),t=Uint8Array.from(n,l=>l.charCodeAt(0));return new TextDecoder().decode(t)}function H(e){let o=e.blocks.map(t=>`${t.day}:${t.start}:${t.end}:${t.kind==="course"?"c":"x"}`).join(";"),n=`${e.v}|${A(e.name)}|${A(e.term)}|${o}`;return G(n)}function R(e){let o=e.trim();if(!o)return"";let n="";for(let t of o.split(/\\s+/))/^[A-Za-z0-9_-]+$/.test(t)&&t.length>n.length&&(n=t);return n||o}function U(e){let o=e.trim();if(!o)return{ok:!1,reason:"That code is empty."};let n;try{n=J(o)}catch{return{ok:!1,reason:"That does not look like a schedule code."}}let t=n.split("|");if(t.length<4)return{ok:!1,reason:"That does not look like a schedule code."};let l=Number(t[0]);if(l!==1)return{ok:!1,reason:`That code was made by a different version of this tool (v${t[0]}). Ask for a fresh one.`};let a=O(t[1]),c=O(t[2]),s=t.slice(3).join("|"),i=[];if(s)for(let r of s.split(";")){let[d,u,y,k]=r.split(":"),p=Number(d),h=Number(u),S=Number(y);if(![p,h,S].every(Number.isInteger))return{ok:!1,reason:"That code is damaged. Ask for a fresh one."};if(p<0||p>6||h<0||S>1440||S<=h)return{ok:!1,reason:"That code is damaged. Ask for a fresh one."};i.push({memberId:"",day:p,start:h,end:S,kind:k==="c"?"course":"custom",source:"imported"})}return{ok:!0,payload:{v:l,name:a,term:c,blocks:i}}}function w(e,o,n){let t=[];for(let l=0;l<=6;l=l+1){let a=o.filter(r=>r.day===l),c=new Set([0,1440]);for(let r of a)c.add(r.start),c.add(r.end);let s=[...c].sort((r,d)=>r-d),i=[];for(let r=0;r<s.length-1;r++){let d=s[r],u=s[r+1];if(u<=d)continue;let y=e.filter(p=>a.some(h=>h.memberId===p.id&&h.start<u&&h.end>d)).map(p=>p.id),k=e.filter(p=>!y.includes(p.id)).map(p=>p.id);i.push({day:l,start:d,end:u,freeIds:k,busyIds:y})}for(let r of i){let d=t[t.length-1];d&&d.day===l&&d.end===r.start&&d.freeIds.join(",")===r.freeIds.join(",")?d.end=r.end:t.push(r)}}return t.filter(l=>l.end-l.start>=n&&l.freeIds.length>0)}var W=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function K(e){return(e+6)%7}function N(e,o){let n=new Date(o.getTime()),t=K(n.getDay()),l=(e-t+7)%7||7;return n.setDate(n.getDate()+l),n}function j(e,o,n){if(e.length===0)return"No times work for everyone right now. Try a shorter meeting length.";let t=a=>o.find(c=>c.id===a)?.name??"someone";return["Group project \\u2014 when works?","",...e.map(a=>{let c=N(a.day,n),s=`${$[a.day]} ${c.getDate()} ${W[c.getMonth()]}, ${b(a.start)}-${b(a.end)}`,i=a.busyIds.length===0?`all ${a.freeIds.length} free`:`${a.freeIds.length} of ${o.length}, ${a.busyIds.map(t).join(" and ")} busy`;return`\\u2022 ${s} \\u2014 ${i}`}),"","Reply with whichever works and I\'ll lock it in."].join(`\n`)}var Z=540;function M(e,o){let n=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),0,o-Z),t=new Date(n),l=a=>String(a).padStart(2,"0");return`${t.getUTCFullYear()}${l(t.getUTCMonth()+1)}${l(t.getUTCDate())}T${l(t.getUTCHours())}${l(t.getUTCMinutes())}00Z`}function _(e){let o=N(e.day,e.from);return["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Kouhai Wiki//Schedule Tool//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",`UID:${`kouhai-${o.getTime()}-${e.start}@kouhai-wiki`}`,`DTSTAMP:${M(o,e.start)}`,`DTSTART:${M(o,e.start)}`,`DTEND:${M(o,e.end)}`,`RRULE:FREQ=WEEKLY;COUNT=${e.sessions}`,`SUMMARY:${e.title}`,"END:VEVENT","END:VCALENDAR",""].join(`\\r\n`)}var z="me",q=1440/30,B="kw-schedule-codes",m={blocks:[],name:"",term:""},f=[],x=[],E=[],g=4,v=null;document.addEventListener("pointerup",()=>{v=null});function C(e,o,n,t){return e.day===o&&e.start<t&&e.end>n}function Q(e,o){let n=o+30,t=m.blocks.find(l=>C(l,e,o,n));t?m.blocks=m.blocks.filter(l=>l!==t):m.blocks.push({memberId:z,day:e,start:o,end:n,kind:"custom",source:"manual"}),L()}function L(){let e=document.getElementById("st-grid");if(!e)return;let o=e.scrollTop;e.innerHTML="",e.appendChild(Object.assign(document.createElement("div"),{className:"st-head"}));for(let n of $){let t=document.createElement("div");t.className="st-head",t.textContent=n,e.appendChild(t)}for(let n=0;n<q;n++){let t=n*30,l=t%60===0,a=document.createElement("div");a.className=l?"st-hour":"st-hour st-half",a.textContent=b(t),e.appendChild(a);for(let c=0;c<7;c++){let s=c,i=document.createElement("div");i.className=l?"st-cell st-hourline":"st-cell",m.blocks.some(r=>C(r,s,t,t+30))&&i.classList.add("st-busy"),i.addEventListener("pointerdown",r=>{r.preventDefault(),v={day:s,from:t},Q(s,t)}),i.addEventListener("pointerenter",()=>{if(!v||v.day!==s||t===v.from)return;let r=Math.min(v.from,t),d=Math.max(v.from,t)+30;m.blocks=m.blocks.filter(u=>!C(u,s,r,d)),m.blocks.push({memberId:z,day:s,start:r,end:d,kind:"custom",source:"manual"}),L()}),e.appendChild(i)}}e.scrollTop=o||420/30*15}function X(){try{return sessionStorage.getItem(B)??""}catch{return""}}function ee(e){try{sessionStorage.setItem(B,e)}catch{}}function D(){let e=document.getElementById("st-slots");if(!e)return;let o=F();e.innerHTML="";for(let n=0;n<g;n++){let t=document.createElement("div");t.className="st-personrow",t.innerHTML=`\n      <label class="st-personlabel" for="st-code-${n}">${n+1}</label>\n      <input class="st-personinput" id="st-code-${n}" type="text"\n             placeholder="Paste person ${n+1}\'s code" value="${o[n]??""}">\n      <span class="st-personstate" id="st-state-${n}"></span>\n    `,e.appendChild(t)}for(let n=0;n<g;n++){let t=document.getElementById(`st-code-${n}`);t?.addEventListener("input",()=>T()),t?.addEventListener("paste",()=>setTimeout(T,0))}T()}function F(){let e=[];for(let o=0;o<g;o++){let n=document.getElementById(`st-code-${o}`);e.push(R(n?.value??""))}return e}function T(){let e=F(),o=[],n=new Map,t=new Set;f=[],x=[],E=[],e.forEach((s,i)=>{let r=document.getElementById(`st-state-${i}`);if(!s){r&&(r.textContent="",r.className="st-personstate");return}let d=n.get(s);if(d!==void 0){r&&(r.textContent=`same as ${d+1}`,r.className="st-personstate st-bad"),o.push(`Person ${i+1} has the same code as person ${d+1}. Each person needs their own.`);return}n.set(s,i);let u=U(s);if(!u.ok){r&&(r.textContent="not valid",r.className="st-personstate st-bad"),o.push(`Person ${i+1}: ${u.reason}`);return}r&&(r.textContent=u.payload.name||"loaded",r.className="st-personstate st-good");let y=`m${i}`;f.push({id:y,name:u.payload.name||`Person ${i+1}`}),u.payload.term&&t.add(u.payload.term);for(let k of u.payload.blocks)x.push({...k,memberId:y})}),t.size>1&&o.push(`These codes are from different terms (${[...t].join(", ")}). One of them is probably out of date.`);let l=document.getElementById("st-errors");l&&(l.textContent=o.join("  "));let a=g-f.length,c=document.getElementById("st-count");c&&(c.textContent=f.length?`${f.length} of ${g} loaded`+(a>0?`, ${a} still to come`:""):""),ee(JSON.stringify({size:g,codes:e})),Y()}function Y(){let e=document.getElementById("st-results");if(!e)return;if(f.length===0){e.innerHTML="";return}let o=document.getElementById("st-min"),n=Number(o?.value??60),t=w(f,x,n),l=!1;if(!t.some(s=>s.busyIds.length===0)&&n>30){let s=n===90?60:30,i=w(f,x,s);i.some(r=>r.busyIds.length===0)&&(t=i,n=s,l=!0)}t.sort((s,i)=>i.freeIds.length-s.freeIds.length||s.day-i.day||s.start-i.start);let a=t.slice(0,12),c=s=>f.find(i=>i.id===s)?.name??"someone";e.innerHTML=`\n    ${l?`<p class="st-note">Nothing that long works for everyone. Showing ${n} minute options instead.</p>`:""}\n    ${a.map((s,i)=>`\n      <div class="st-slot" data-i="${i}" aria-selected="false">\n        <span><strong>${$[s.day]} ${b(s.start)}-${b(s.end)}</strong></span>\n        <span class="st-slot-who">${s.busyIds.length===0?`all ${s.freeIds.length} free`:`${s.freeIds.length} of ${f.length}, ${s.busyIds.map(c).join(", ")} busy`}</span>\n      </div>`).join("")}\n    ${a.length===0?\'<p class="st-note">No windows that long. Try a shorter meeting length.</p>\':""}\n    <div class="st-actions">\n      <button id="st-msg">Copy message</button>\n      <select id="st-sessions" aria-label="How many sessions">\n        ${[1,2,3,4,6,8].map(s=>`<option value="${s}">${s} session${s>1?"s":""}</option>`).join("")}\n      </select>\n      <button id="st-ics">Add to calendar</button>\n    </div>\n  `,e.querySelectorAll(".st-slot").forEach(s=>{s.addEventListener("click",()=>{let i=a[Number(s.dataset.i)],r=s.getAttribute("aria-selected")==="true";s.setAttribute("aria-selected",String(!r)),E=r?E.filter(d=>d!==i):[...E,i]})}),document.getElementById("st-msg")?.addEventListener("click",async()=>{let s=E.length?E:a.slice(0,3),i=j(s,f,new Date);try{await navigator.clipboard.writeText(i);let r=document.getElementById("st-msg");r&&(r.textContent="Copied",setTimeout(()=>{r.textContent="Copy message"},1500))}catch{window.prompt("Copy this:",i)}}),document.getElementById("st-ics")?.addEventListener("click",()=>{let s=E[0]??a[0];if(!s)return;let i=Number(document.getElementById("st-sessions").value),r=_({title:"Group project",day:s.day,start:s.start,end:s.end,sessions:i,from:new Date}),d=URL.createObjectURL(new Blob([r],{type:"text/calendar"})),u=document.createElement("a");u.href=d,u.download="group-meeting.ics",u.click(),URL.revokeObjectURL(d)})}function P(e){for(let o of["mine","group"]){let n=document.getElementById(`st-tab-${o}`),t=document.getElementById(`st-panel-${o}`);n&&n.setAttribute("aria-selected",String(o===e)),t&&(t.hidden=o!==e)}}function V(){let e=document.getElementById("schedule-tool");if(!e||e.dataset.mounted)return;e.dataset.mounted="1",e.innerHTML=`\n    <div class="st-tabs" role="tablist">\n      <button class="st-tab" id="st-tab-mine" role="tab" aria-selected="true">My schedule</button>\n      <button class="st-tab" id="st-tab-group" role="tab" aria-selected="false">Find group time</button>\n    </div>\n\n    <section class="st-panel" id="st-panel-mine" role="tabpanel">\n      <div class="st-grid" id="st-grid" style="max-height:60vh"></div>\n      <p class="st-note"><strong>Each row is 30 minutes.</strong> Tap a cell to mark yourself busy, tap it again to clear it. On a computer you can drag down a column to fill several at once. On a phone the grid scrolls sideways, so swipe across to reach the weekend.</p>\n      <p class="st-note">Class times like 8:50 do not land on a 30-minute row, so round outward. Being blocked slightly early beats scheduling over a lecture.</p>\n      <div class="st-actions">\n        <input id="st-name" placeholder="Your name">\n        <input id="st-term" placeholder="Term, e.g. 2026 Fall">\n        <button id="st-share" hidden>Send my code</button>\n        <button id="st-copy">Copy my code</button>\n      </div>\n      <p class="st-note">This code contains your weekly schedule. Nothing is sent to any server, it only goes where you paste it.</p>\n    </section>\n\n    <section class="st-panel" id="st-panel-group" role="tabpanel" hidden>\n      <p class="st-note">Ask everyone to open this page, mark their busy times, and send you their code. Then set how many of you there are and paste each code into its own box.</p>\n      <div class="st-actions">\n        <label for="st-size">People in the group</label>\n        <select id="st-size" aria-label="People in the group">\n          ${[2,3,4,5,6,7,8].map(a=>`<option value="${a}"${a===4?" selected":""}>${a}</option>`).join("")}\n        </select>\n        <span class="st-note" id="st-count" style="margin:0"></span>\n      </div>\n      <div id="st-slots"></div>\n      <div class="st-actions">\n        <button id="st-clear">Clear all</button>\n        <label for="st-min">Meeting length</label>\n        <select id="st-min" aria-label="Minimum meeting length">\n          <option value="30">30 min</option>\n          <option value="60" selected>1 hour</option>\n          <option value="90">1.5 hours</option>\n        </select>\n      </div>\n      <p class="st-note">Pasted codes stay in this browser tab and are forgotten when you close it. Nothing is uploaded.</p>\n      <div id="st-errors" class="st-error"></div>\n      <div id="st-results"></div>\n    </section>\n  `,document.getElementById("st-tab-mine")?.addEventListener("click",()=>P("mine")),document.getElementById("st-tab-group")?.addEventListener("click",()=>P("group"));function o(){let a=document.getElementById("st-name"),c=document.getElementById("st-term");return m.name=a?.value.trim()||"Someone",m.term=c?.value.trim()||"",H({v:1,name:m.name,term:m.term,blocks:m.blocks})}let n=document.getElementById("st-share");n&&typeof navigator.share=="function"&&(n.hidden=!1,n.addEventListener("click",async()=>{try{await navigator.share({text:o()})}catch{}})),document.getElementById("st-copy")?.addEventListener("click",async()=>{let a=o(),c=document.getElementById("st-copy");try{await navigator.clipboard.writeText(a),c&&(c.textContent="Copied",setTimeout(()=>{c.textContent="Copy my code"},1500))}catch{let s=document.createElement("textarea");s.className="st-code",s.value=a,c?.after(s),s.select()}});let t=document.getElementById("st-size");t?.addEventListener("change",()=>{g=Number(t.value),D()}),document.getElementById("st-clear")?.addEventListener("click",()=>{for(let a=0;a<g;a++){let c=document.getElementById(`st-code-${a}`);c&&(c.value="")}try{sessionStorage.removeItem(B)}catch{}T()}),document.getElementById("st-min")?.addEventListener("change",Y);let l=X();if(l)try{let a=JSON.parse(l);a.size>=2&&a.size<=8&&(g=a.size,t&&(t.value=String(g))),D(),a.codes.forEach((c,s)=>{let i=document.getElementById(`st-code-${s}`);i&&(i.value=c)}),T()}catch{D()}else D();L()}document.addEventListener("nav",V);V();\n';
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