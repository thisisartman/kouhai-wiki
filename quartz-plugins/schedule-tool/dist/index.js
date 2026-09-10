// src/components/scripts/schedule.inline.ts
var schedule_inline_default = 'var $=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];function b(t){let o=Math.floor(t/60),n=t%60;return`${String(o).padStart(2,"0")}:${String(n).padStart(2,"0")}`}var A=t=>t.replace(/\\\\/g,"\\\\\\\\").replace(/\\|/g,"\\\\p"),O=t=>t.replace(/\\\\p/g,"|").replace(/\\\\\\\\/g,"\\\\");function V(t){let o=new TextEncoder().encode(t),n="";for(let e of o)n+=String.fromCharCode(e);return btoa(n).replace(/\\+/g,"-").replace(/\\//g,"_").replace(/=+$/,"")}function G(t){let o=t.replace(/-/g,"+").replace(/_/g,"/"),n=atob(o+"=".repeat((4-o.length%4)%4)),e=Uint8Array.from(n,a=>a.charCodeAt(0));return new TextDecoder().decode(e)}function R(t){let o=t.blocks.map(e=>`${e.day}:${e.start}:${e.end}:${e.kind==="course"?"c":"x"}`).join(";"),n=`${t.v}|${A(t.name)}|${A(t.term)}|${o}`;return V(n)}function H(t){let o=t.trim();if(!o)return{ok:!1,reason:"That code is empty."};let n;try{n=G(o)}catch{return{ok:!1,reason:"That does not look like a schedule code."}}let e=n.split("|");if(e.length<4)return{ok:!1,reason:"That does not look like a schedule code."};let a=Number(e[0]);if(a!==1)return{ok:!1,reason:`That code was made by a different version of this tool (v${e[0]}). Ask for a fresh one.`};let l=O(e[1]),c=O(e[2]),s=e.slice(3).join("|"),i=[];if(s)for(let r of s.split(";")){let[d,m,y,k]=r.split(":"),p=Number(d),h=Number(m),S=Number(y);if(![p,h,S].every(Number.isInteger))return{ok:!1,reason:"That code is damaged. Ask for a fresh one."};if(p<0||p>6||h<0||S>1440||S<=h)return{ok:!1,reason:"That code is damaged. Ask for a fresh one."};i.push({memberId:"",day:p,start:h,end:S,kind:k==="c"?"course":"custom",source:"imported"})}return{ok:!0,payload:{v:a,name:l,term:c,blocks:i}}}function x(t,o,n){let e=[];for(let a=0;a<=6;a=a+1){let l=o.filter(r=>r.day===a),c=new Set([0,1440]);for(let r of l)c.add(r.start),c.add(r.end);let s=[...c].sort((r,d)=>r-d),i=[];for(let r=0;r<s.length-1;r++){let d=s[r],m=s[r+1];if(m<=d)continue;let y=t.filter(p=>l.some(h=>h.memberId===p.id&&h.start<m&&h.end>d)).map(p=>p.id),k=t.filter(p=>!y.includes(p.id)).map(p=>p.id);i.push({day:a,start:d,end:m,freeIds:k,busyIds:y})}for(let r of i){let d=e[e.length-1];d&&d.day===a&&d.end===r.start&&d.freeIds.join(",")===r.freeIds.join(",")?d.end=r.end:e.push(r)}}return e.filter(a=>a.end-a.start>=n&&a.freeIds.length>0)}var J=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function W(t){return(t+6)%7}function N(t,o){let n=new Date(o.getTime()),e=W(n.getDay()),a=(t-e+7)%7||7;return n.setDate(n.getDate()+a),n}function U(t,o,n){if(t.length===0)return"No times work for everyone right now. Try a shorter meeting length.";let e=l=>o.find(c=>c.id===l)?.name??"someone";return["Group project \\u2014 when works?","",...t.map(l=>{let c=N(l.day,n),s=`${$[l.day]} ${c.getDate()} ${J[c.getMonth()]}, ${b(l.start)}-${b(l.end)}`,i=l.busyIds.length===0?`all ${l.freeIds.length} free`:`${l.freeIds.length} of ${o.length}, ${l.busyIds.map(e).join(" and ")} busy`;return`\\u2022 ${s} \\u2014 ${i}`}),"","Reply with whichever works and I\'ll lock it in."].join(`\n`)}var K=540;function M(t,o){let n=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate(),0,o-K),e=new Date(n),a=l=>String(l).padStart(2,"0");return`${e.getUTCFullYear()}${a(e.getUTCMonth()+1)}${a(e.getUTCDate())}T${a(e.getUTCHours())}${a(e.getUTCMinutes())}00Z`}function j(t){let o=N(t.day,t.from);return["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Kouhai Wiki//Schedule Tool//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT",`UID:${`kouhai-${o.getTime()}-${t.start}@kouhai-wiki`}`,`DTSTAMP:${M(o,t.start)}`,`DTSTART:${M(o,t.start)}`,`DTEND:${M(o,t.end)}`,`RRULE:FREQ=WEEKLY;COUNT=${t.sessions}`,`SUMMARY:${t.title}`,"END:VEVENT","END:VCALENDAR",""].join(`\\r\n`)}var P="me",q=1440/30,B="kw-schedule-codes",u={blocks:[],name:"",term:""},f=[],w=[],E=[],g=4,v=null;document.addEventListener("pointerup",()=>{v=null});function C(t,o,n,e){return t.day===o&&t.start<e&&t.end>n}function Q(t,o){let n=o+30,e=u.blocks.find(a=>C(a,t,o,n));e?u.blocks=u.blocks.filter(a=>a!==e):u.blocks.push({memberId:P,day:t,start:o,end:n,kind:"custom",source:"manual"}),L()}function L(){let t=document.getElementById("st-grid");if(!t)return;let o=t.scrollTop;t.innerHTML="",t.appendChild(Object.assign(document.createElement("div"),{className:"st-head"}));for(let n of $){let e=document.createElement("div");e.className="st-head",e.textContent=n,t.appendChild(e)}for(let n=0;n<q;n++){let e=n*30,a=e%60===0,l=document.createElement("div");l.className=a?"st-hour":"st-hour st-half",l.textContent=b(e),t.appendChild(l);for(let c=0;c<7;c++){let s=c,i=document.createElement("div");i.className=a?"st-cell st-hourline":"st-cell",u.blocks.some(r=>C(r,s,e,e+30))&&i.classList.add("st-busy"),i.addEventListener("pointerdown",r=>{r.preventDefault(),v={day:s,from:e},Q(s,e)}),i.addEventListener("pointerenter",()=>{if(!v||v.day!==s||e===v.from)return;let r=Math.min(v.from,e),d=Math.max(v.from,e)+30;u.blocks=u.blocks.filter(m=>!C(m,s,r,d)),u.blocks.push({memberId:P,day:s,start:r,end:d,kind:"custom",source:"manual"}),L()}),t.appendChild(i)}}t.scrollTop=o||420/30*15}function Z(){try{return sessionStorage.getItem(B)??""}catch{return""}}function X(t){try{sessionStorage.setItem(B,t)}catch{}}function D(){let t=document.getElementById("st-slots");if(!t)return;let o=F();t.innerHTML="";for(let n=0;n<g;n++){let e=document.createElement("div");e.className="st-personrow",e.innerHTML=`\n      <label class="st-personlabel" for="st-code-${n}">${n+1}</label>\n      <input class="st-personinput" id="st-code-${n}" type="text"\n             placeholder="Paste person ${n+1}\'s code" value="${o[n]??""}">\n      <span class="st-personstate" id="st-state-${n}"></span>\n    `,t.appendChild(e)}for(let n=0;n<g;n++){let e=document.getElementById(`st-code-${n}`);e?.addEventListener("input",()=>T()),e?.addEventListener("paste",()=>setTimeout(T,0))}T()}function F(){let t=[];for(let o=0;o<g;o++){let n=document.getElementById(`st-code-${o}`);t.push(n?.value.trim()??"")}return t}function T(){let t=F(),o=[],n=new Map,e=new Set;f=[],w=[],E=[],t.forEach((s,i)=>{let r=document.getElementById(`st-state-${i}`);if(!s){r&&(r.textContent="",r.className="st-personstate");return}let d=n.get(s);if(d!==void 0){r&&(r.textContent=`same as ${d+1}`,r.className="st-personstate st-bad"),o.push(`Person ${i+1} has the same code as person ${d+1}. Each person needs their own.`);return}n.set(s,i);let m=H(s);if(!m.ok){r&&(r.textContent="not valid",r.className="st-personstate st-bad"),o.push(`Person ${i+1}: ${m.reason}`);return}r&&(r.textContent=m.payload.name||"loaded",r.className="st-personstate st-good");let y=`m${i}`;f.push({id:y,name:m.payload.name||`Person ${i+1}`}),m.payload.term&&e.add(m.payload.term);for(let k of m.payload.blocks)w.push({...k,memberId:y})}),e.size>1&&o.push(`These codes are from different terms (${[...e].join(", ")}). One of them is probably out of date.`);let a=document.getElementById("st-errors");a&&(a.textContent=o.join("  "));let l=g-f.length,c=document.getElementById("st-count");c&&(c.textContent=f.length?`${f.length} of ${g} loaded`+(l>0?`, ${l} still to come`:""):""),X(JSON.stringify({size:g,codes:t})),Y()}function Y(){let t=document.getElementById("st-results");if(!t)return;if(f.length===0){t.innerHTML="";return}let o=document.getElementById("st-min"),n=Number(o?.value??60),e=x(f,w,n),a=!1;if(!e.some(s=>s.busyIds.length===0)&&n>30){let s=n===90?60:30,i=x(f,w,s);i.some(r=>r.busyIds.length===0)&&(e=i,n=s,a=!0)}e.sort((s,i)=>i.freeIds.length-s.freeIds.length||s.day-i.day||s.start-i.start);let l=e.slice(0,12),c=s=>f.find(i=>i.id===s)?.name??"someone";t.innerHTML=`\n    ${a?`<p class="st-note">Nothing that long works for everyone. Showing ${n} minute options instead.</p>`:""}\n    ${l.map((s,i)=>`\n      <div class="st-slot" data-i="${i}" aria-selected="false">\n        <span><strong>${$[s.day]} ${b(s.start)}-${b(s.end)}</strong></span>\n        <span class="st-slot-who">${s.busyIds.length===0?`all ${s.freeIds.length} free`:`${s.freeIds.length} of ${f.length}, ${s.busyIds.map(c).join(", ")} busy`}</span>\n      </div>`).join("")}\n    ${l.length===0?\'<p class="st-note">No windows that long. Try a shorter meeting length.</p>\':""}\n    <div class="st-actions">\n      <button id="st-msg">Copy message</button>\n      <select id="st-sessions" aria-label="How many sessions">\n        ${[1,2,3,4,6,8].map(s=>`<option value="${s}">${s} session${s>1?"s":""}</option>`).join("")}\n      </select>\n      <button id="st-ics">Add to calendar</button>\n    </div>\n  `,t.querySelectorAll(".st-slot").forEach(s=>{s.addEventListener("click",()=>{let i=l[Number(s.dataset.i)],r=s.getAttribute("aria-selected")==="true";s.setAttribute("aria-selected",String(!r)),E=r?E.filter(d=>d!==i):[...E,i]})}),document.getElementById("st-msg")?.addEventListener("click",async()=>{let s=E.length?E:l.slice(0,3),i=U(s,f,new Date);try{await navigator.clipboard.writeText(i);let r=document.getElementById("st-msg");r&&(r.textContent="Copied",setTimeout(()=>{r.textContent="Copy message"},1500))}catch{window.prompt("Copy this:",i)}}),document.getElementById("st-ics")?.addEventListener("click",()=>{let s=E[0]??l[0];if(!s)return;let i=Number(document.getElementById("st-sessions").value),r=j({title:"Group project",day:s.day,start:s.start,end:s.end,sessions:i,from:new Date}),d=URL.createObjectURL(new Blob([r],{type:"text/calendar"})),m=document.createElement("a");m.href=d,m.download="group-meeting.ics",m.click(),URL.revokeObjectURL(d)})}function _(t){for(let o of["mine","group"]){let n=document.getElementById(`st-tab-${o}`),e=document.getElementById(`st-panel-${o}`);n&&n.setAttribute("aria-selected",String(o===t)),e&&(e.hidden=o!==t)}}function z(){let t=document.getElementById("schedule-tool");if(!t||t.dataset.mounted)return;t.dataset.mounted="1",t.innerHTML=`\n    <div class="st-tabs" role="tablist">\n      <button class="st-tab" id="st-tab-mine" role="tab" aria-selected="true">My schedule</button>\n      <button class="st-tab" id="st-tab-group" role="tab" aria-selected="false">Find group time</button>\n    </div>\n\n    <section class="st-panel" id="st-panel-mine" role="tabpanel">\n      <div class="st-grid" id="st-grid" style="max-height:60vh"></div>\n      <p class="st-note"><strong>Each row is 30 minutes.</strong> Tap a cell to mark yourself busy, tap it again to clear it. On a computer you can drag down a column to fill several at once. On a phone the grid scrolls sideways, so swipe across to reach the weekend.</p>\n      <p class="st-note">Class times like 8:50 do not land on a 30-minute row, so round outward. Being blocked slightly early beats scheduling over a lecture.</p>\n      <div class="st-actions">\n        <input id="st-name" placeholder="Your name">\n        <input id="st-term" placeholder="Term, e.g. 2026 Fall">\n        <button id="st-copy">Copy my code</button>\n      </div>\n      <p class="st-note">This code contains your weekly schedule. Nothing is sent to any server, it only goes where you paste it.</p>\n    </section>\n\n    <section class="st-panel" id="st-panel-group" role="tabpanel" hidden>\n      <p class="st-note">Ask everyone to open this page, mark their busy times, and send you their code. Then set how many of you there are and paste each code into its own box.</p>\n      <div class="st-actions">\n        <label for="st-size">People in the group</label>\n        <select id="st-size" aria-label="People in the group">\n          ${[2,3,4,5,6,7,8].map(e=>`<option value="${e}"${e===4?" selected":""}>${e}</option>`).join("")}\n        </select>\n        <span class="st-note" id="st-count" style="margin:0"></span>\n      </div>\n      <div id="st-slots"></div>\n      <div class="st-actions">\n        <button id="st-clear">Clear all</button>\n        <label for="st-min">Meeting length</label>\n        <select id="st-min" aria-label="Minimum meeting length">\n          <option value="30">30 min</option>\n          <option value="60" selected>1 hour</option>\n          <option value="90">1.5 hours</option>\n        </select>\n      </div>\n      <p class="st-note">Pasted codes stay in this browser tab and are forgotten when you close it. Nothing is uploaded.</p>\n      <div id="st-errors" class="st-error"></div>\n      <div id="st-results"></div>\n    </section>\n  `,document.getElementById("st-tab-mine")?.addEventListener("click",()=>_("mine")),document.getElementById("st-tab-group")?.addEventListener("click",()=>_("group")),document.getElementById("st-copy")?.addEventListener("click",async()=>{let e=document.getElementById("st-name"),a=document.getElementById("st-term");u.name=e?.value.trim()||"Someone",u.term=a?.value.trim()||"";let l=R({v:1,name:u.name,term:u.term,blocks:u.blocks}),c=document.getElementById("st-copy");try{await navigator.clipboard.writeText(l),c&&(c.textContent="Copied",setTimeout(()=>{c.textContent="Copy my code"},1500))}catch{let s=document.createElement("textarea");s.className="st-code",s.value=l,c?.after(s),s.select()}});let o=document.getElementById("st-size");o?.addEventListener("change",()=>{g=Number(o.value),D()}),document.getElementById("st-clear")?.addEventListener("click",()=>{for(let e=0;e<g;e++){let a=document.getElementById(`st-code-${e}`);a&&(a.value="")}try{sessionStorage.removeItem(B)}catch{}T()}),document.getElementById("st-min")?.addEventListener("change",Y);let n=Z();if(n)try{let e=JSON.parse(n);e.size>=2&&e.size<=8&&(g=e.size,o&&(o.value=String(g))),D(),e.codes.forEach((a,l)=>{let c=document.getElementById(`st-code-${l}`);c&&(c.value=a)}),T()}catch{D()}else D();L()}document.addEventListener("nav",z);z();\n';
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
.st-tabs { display: flex; gap: .5rem; margin-bottom: 1rem; }
.st-tab { padding: .45em .9em; border-radius: 5px; border: 1px solid var(--lightgray);
  background: transparent; color: var(--darkgray); cursor: pointer; font-weight: 600; }
.st-tab[aria-selected="true"] { background: var(--secondary); color: var(--light);
  border-color: var(--secondary); }
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