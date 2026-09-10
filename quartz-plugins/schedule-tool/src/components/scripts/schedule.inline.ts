import { DAY_NAMES, SNAP_MINUTES, fmtTime } from "../../lib/model";
import type { Block, Day, Member, Slot } from "../../lib/model";
import { encodeCode, decodeCode, extractCode } from "../../lib/code";
import { findSlots } from "../../lib/intervals";
import { buildMessage } from "../../lib/message";
import { buildIcs } from "../../lib/ics";

const ME = "me";
const ROWS = (24 * 60) / SNAP_MINUTES; // 48
const SESSION_KEY = "kw-schedule-codes";

const state: { blocks: Block[]; name: string; term: string } = {
  blocks: [],
  name: "",
  term: "",
};

let members: Member[] = [];
let groupBlocks: Block[] = [];
let shortlist: Slot[] = [];
let groupSize = 4;
let clearPending = false;
let clearTimer: ReturnType<typeof setTimeout> | undefined;
let dragging: { day: Day; from: number } | null = null;

document.addEventListener("pointerup", () => {
  dragging = null;
});

function overlaps(b: Block, day: Day, start: number, end: number): boolean {
  return b.day === day && b.start < end && b.end > start;
}

function toggleCell(day: Day, start: number): void {
  const end = start + SNAP_MINUTES;
  const hit = state.blocks.find((b) => overlaps(b, day, start, end));
  if (hit) {
    state.blocks = state.blocks.filter((b) => b !== hit);
  } else {
    state.blocks.push({
      memberId: ME, day, start, end, kind: "custom", source: "manual",
    });
  }
  renderGrid();
}

function renderGrid(): void {
  const grid = document.getElementById("st-grid");
  if (!grid) return;
  const keepScroll = grid.scrollTop;
  grid.innerHTML = "";

  grid.appendChild(
    Object.assign(document.createElement("div"), { className: "st-head" }),
  );
  for (const name of DAY_NAMES) {
    const h = document.createElement("div");
    h.className = "st-head";
    h.textContent = name;
    grid.appendChild(h);
  }

  for (let row = 0; row < ROWS; row++) {
    const minutes = row * SNAP_MINUTES;
    // every row is 30 minutes, so every row gets a label. Labelling only the
    // hours made the grid read as hourly, which it is not.
    const onTheHour = minutes % 60 === 0;
    const label = document.createElement("div");
    label.className = onTheHour ? "st-hour" : "st-hour st-half";
    label.textContent = fmtTime(minutes);
    grid.appendChild(label);

    for (let d = 0; d < 7; d++) {
      const day = d as Day;
      const cell = document.createElement("div");
      cell.className = onTheHour ? "st-cell st-hourline" : "st-cell";
      if (state.blocks.some((b) => overlaps(b, day, minutes, minutes + SNAP_MINUTES))) {
        cell.classList.add("st-busy");
      }
      cell.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        dragging = { day, from: minutes };
        toggleCell(day, minutes);
      });
      cell.addEventListener("pointerenter", () => {
        // the origin cell was already handled by pointerdown
        if (!dragging || dragging.day !== day || minutes === dragging.from) return;
        const start = Math.min(dragging.from, minutes);
        const end = Math.max(dragging.from, minutes) + SNAP_MINUTES;
        state.blocks = state.blocks.filter((b) => !overlaps(b, day, start, end));
        state.blocks.push({
          memberId: ME, day, start, end, kind: "custom", source: "manual",
        });
        renderGrid();
      });
      grid.appendChild(cell);
    }
  }

  // open the viewport around 07:00 without hiding the rest of the day
  grid.scrollTop = keepScroll || (7 * 60) / SNAP_MINUTES * 15;

  syncClearButton();
}

/** Nothing to clear means nothing to press, and a pending confirm is stale. */
function syncClearButton(): void {
  const btn = document.getElementById("st-clearslots") as HTMLButtonElement | null;
  if (!btn) return;
  btn.disabled = state.blocks.length === 0;
  if (btn.disabled) {
    clearPending = false;
    btn.textContent = "Clear slots";
    btn.classList.remove("st-armed");
  }
}

function readSession(): string {
  try {
    return sessionStorage.getItem(SESSION_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeSession(text: string): void {
  // private browsing and blocked site data make this throw rather than no-op
  try {
    sessionStorage.setItem(SESSION_KEY, text);
  } catch {
    /* not fatal, the tool still works for this session */
  }
}

/** One paste box per person, so a bad code can be fixed without redoing the rest. */
function renderSlots(): void {
  const box = document.getElementById("st-slots");
  if (!box) return;

  const existing = readSlotValues();
  box.innerHTML = "";

  for (let i = 0; i < groupSize; i++) {
    const row = document.createElement("div");
    row.className = "st-personrow";
    row.innerHTML = `
      <label class="st-personlabel" for="st-code-${i}">${i + 1}</label>
      <input class="st-personinput" id="st-code-${i}" type="text"
             placeholder="Paste person ${i + 1}'s code" value="${existing[i] ?? ""}">
      <span class="st-personstate" id="st-state-${i}"></span>
    `;
    box.appendChild(row);
  }

  for (let i = 0; i < groupSize; i++) {
    const input = document.getElementById(`st-code-${i}`) as HTMLInputElement | null;
    input?.addEventListener("input", () => loadFromSlots());
    input?.addEventListener("paste", () => setTimeout(loadFromSlots, 0));
  }

  loadFromSlots();
}

function readSlotValues(): string[] {
  const out: string[] = [];
  for (let i = 0; i < groupSize; i++) {
    const el = document.getElementById(`st-code-${i}`) as HTMLInputElement | null;
    // people paste the whole chat message, not just the code
    out.push(extractCode(el?.value ?? ""));
  }
  return out;
}

function loadFromSlots(): void {
  const values = readSlotValues();
  const errors: string[] = [];
  const seen = new Map<string, number>();
  const terms = new Set<string>();
  members = [];
  groupBlocks = [];
  shortlist = [];

  values.forEach((code, i) => {
    const state = document.getElementById(`st-state-${i}`);
    if (!code) {
      if (state) { state.textContent = ""; state.className = "st-personstate"; }
      return;
    }

    const dupeOf = seen.get(code);
    if (dupeOf !== undefined) {
      if (state) {
        state.textContent = `same as ${dupeOf + 1}`;
        state.className = "st-personstate st-bad";
      }
      errors.push(`Person ${i + 1} has the same code as person ${dupeOf + 1}. Each person needs their own.`);
      return;
    }
    seen.set(code, i);

    const res = decodeCode(code);
    if (!res.ok) {
      if (state) { state.textContent = "not valid"; state.className = "st-personstate st-bad"; }
      errors.push(`Person ${i + 1}: ${res.reason}`);
      return;
    }

    if (state) {
      state.textContent = res.payload.name || "loaded";
      state.className = "st-personstate st-good";
    }

    const id = `m${i}`;
    members.push({ id, name: res.payload.name || `Person ${i + 1}` });
    if (res.payload.term) terms.add(res.payload.term);
    for (const b of res.payload.blocks) groupBlocks.push({ ...b, memberId: id });
  });

  if (terms.size > 1) {
    errors.push(
      `These codes are from different terms (${[...terms].join(", ")}). One of them is probably out of date.`,
    );
  }

  const errBox = document.getElementById("st-errors");
  if (errBox) errBox.textContent = errors.join("  ");

  const missing = groupSize - members.length;
  const count = document.getElementById("st-count");
  if (count) {
    count.textContent = members.length
      ? `${members.length} of ${groupSize} loaded` + (missing > 0 ? `, ${missing} still to come` : "")
      : "";
  }

  writeSession(JSON.stringify({ size: groupSize, codes: values }));
  renderResults();
}

function renderResults(): void {
  const box = document.getElementById("st-results");
  if (!box) return;
  if (members.length === 0) {
    box.innerHTML = "";
    return;
  }

  const minEl = document.getElementById("st-min") as HTMLSelectElement | null;
  let min = Number(minEl?.value ?? 60);

  let slots = findSlots(members, groupBlocks, min);
  let relaxed = false;

  // the empty state is when help is most needed, so drop a step rather than show nothing
  if (!slots.some((s) => s.busyIds.length === 0) && min > 30) {
    const next = min === 90 ? 60 : 30;
    const retry = findSlots(members, groupBlocks, next);
    if (retry.some((s) => s.busyIds.length === 0)) {
      slots = retry;
      min = next;
      relaxed = true;
    }
  }

  slots.sort(
    (a, b) => b.freeIds.length - a.freeIds.length || a.day - b.day || a.start - b.start,
  );
  const top = slots.slice(0, 12);
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? "someone";

  box.innerHTML = `
    ${relaxed ? `<p class="st-note">Nothing that long works for everyone. Showing ${min} minute options instead.</p>` : ""}
    ${top
      .map(
        (s, i) => `
      <div class="st-slot" data-i="${i}" aria-selected="false">
        <span><strong>${DAY_NAMES[s.day]} ${fmtTime(s.start)}-${fmtTime(s.end)}</strong></span>
        <span class="st-slot-who">${
          s.busyIds.length === 0
            ? `all ${s.freeIds.length} free`
            : `${s.freeIds.length} of ${members.length}, ${s.busyIds.map(nameOf).join(", ")} busy`
        }</span>
      </div>`,
      )
      .join("")}
    ${top.length === 0 ? `<p class="st-note">No windows that long. Try a shorter meeting length.</p>` : ""}
    <div class="st-actions">
      <button id="st-msg">Copy message</button>
      <select id="st-sessions" aria-label="How many sessions">
        ${[1, 2, 3, 4, 6, 8]
          .map((n) => `<option value="${n}">${n} session${n > 1 ? "s" : ""}</option>`)
          .join("")}
      </select>
      <button id="st-ics">Add to calendar</button>
    </div>
  `;

  box.querySelectorAll<HTMLElement>(".st-slot").forEach((el) => {
    el.addEventListener("click", () => {
      const slot = top[Number(el.dataset.i)];
      const on = el.getAttribute("aria-selected") === "true";
      el.setAttribute("aria-selected", String(!on));
      shortlist = on ? shortlist.filter((s) => s !== slot) : [...shortlist, slot];
    });
  });

  document.getElementById("st-msg")?.addEventListener("click", async () => {
    const chosen = shortlist.length ? shortlist : top.slice(0, 3);
    const text = buildMessage(chosen, members, new Date());
    try {
      await navigator.clipboard.writeText(text);
      const btn = document.getElementById("st-msg");
      if (btn) {
        btn.textContent = "Copied";
        setTimeout(() => { btn.textContent = "Copy message"; }, 1500);
      }
    } catch {
      window.prompt("Copy this:", text);
    }
  });

  document.getElementById("st-ics")?.addEventListener("click", () => {
    const slot = shortlist[0] ?? top[0];
    if (!slot) return;
    const sessions = Number(
      (document.getElementById("st-sessions") as HTMLSelectElement).value,
    );
    const ics = buildIcs({
      title: "Group project",
      day: slot.day,
      start: slot.start,
      end: slot.end,
      sessions,
      from: new Date(),
    });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "group-meeting.ics";
    a.click();
    URL.revokeObjectURL(url);
  });
}

function switchTab(which: "mine" | "group"): void {
  for (const key of ["mine", "group"] as const) {
    const tab = document.getElementById(`st-tab-${key}`);
    const panel = document.getElementById(`st-panel-${key}`);
    if (tab) tab.setAttribute("aria-selected", String(key === which));
    if (panel) (panel as HTMLElement).hidden = key !== which;
  }
}

function mount(): void {
  const root = document.getElementById("schedule-tool");
  if (!root || root.dataset.mounted) return;
  root.dataset.mounted = "1";

  root.innerHTML = `
    <div class="st-tabs" role="tablist">
      <button class="st-tab" id="st-tab-mine" role="tab" aria-selected="true">My schedule</button>
      <button class="st-tab" id="st-tab-group" role="tab" aria-selected="false">Find group time</button>
    </div>

    <section class="st-panel" id="st-panel-mine" role="tabpanel">
      <div class="st-grid" id="st-grid" style="max-height:60vh"></div>
      <div class="st-actions">
        <button id="st-clearslots" class="st-danger" disabled>Clear slots</button>
      </div>
      <p class="st-note"><strong>Each row is 30 minutes.</strong> Tap a cell to mark yourself busy, tap it again to clear it. On a computer you can drag down a column to fill several at once. On a phone the grid scrolls sideways, so swipe across to reach the weekend.</p>
      <p class="st-note">Class times like 8:50 do not land on a 30-minute row, so round outward. Being blocked slightly early beats scheduling over a lecture.</p>
      <div class="st-actions">
        <input id="st-name" placeholder="Your name">
        <input id="st-term" placeholder="Term, e.g. 2026 Fall">
        <button id="st-share" hidden>Send my code</button>
        <button id="st-copy">Copy my code</button>
      </div>
      <p class="st-note">This code contains your weekly schedule. Nothing is sent to any server, it only goes where you paste it.</p>
    </section>

    <section class="st-panel" id="st-panel-group" role="tabpanel" hidden>
      <p class="st-note">Ask everyone to open this page, mark their busy times, and send you their code. Then set how many of you there are and paste each code into its own box.</p>
      <div class="st-actions">
        <label for="st-size">People in the group</label>
        <select id="st-size" aria-label="People in the group">
          ${[2, 3, 4, 5, 6, 7, 8].map((n) => `<option value="${n}"${n === 4 ? " selected" : ""}>${n}</option>`).join("")}
        </select>
        <span class="st-note" id="st-count" style="margin:0"></span>
      </div>
      <div id="st-slots"></div>
      <div class="st-actions">
        <button id="st-clear">Clear all</button>
        <label for="st-min">Meeting length</label>
        <select id="st-min" aria-label="Minimum meeting length">
          <option value="30">30 min</option>
          <option value="60" selected>1 hour</option>
          <option value="90">1.5 hours</option>
        </select>
      </div>
      <p class="st-note">Pasted codes stay in this browser tab and are forgotten when you close it. Nothing is uploaded.</p>
      <div id="st-errors" class="st-error"></div>
      <div id="st-results"></div>
    </section>
  `;

  document.getElementById("st-tab-mine")?.addEventListener("click", () => switchTab("mine"));
  document.getElementById("st-tab-group")?.addEventListener("click", () => switchTab("group"));

  // Two taps rather than a dialog. Wiping a week of marked slots has no undo,
  // but a modal for a one-second action is heavier than the risk warrants.
  document.getElementById("st-clearslots")?.addEventListener("click", () => {
    const btn = document.getElementById("st-clearslots") as HTMLButtonElement | null;
    if (!btn || btn.disabled) return;

    if (!clearPending) {
      clearPending = true;
      btn.textContent = "Tap again to clear";
      btn.classList.add("st-armed");
      clearTimer = setTimeout(() => {
        clearPending = false;
        btn.textContent = "Clear slots";
        btn.classList.remove("st-armed");
      }, 3000);
      return;
    }

    clearTimeout(clearTimer);
    clearPending = false;
    btn.classList.remove("st-armed");
    btn.textContent = "Clear slots";
    state.blocks = [];
    renderGrid();
  });

  function currentCode(): string {
    const nameEl = document.getElementById("st-name") as HTMLInputElement | null;
    const termEl = document.getElementById("st-term") as HTMLInputElement | null;
    state.name = nameEl?.value.trim() || "Someone";
    state.term = termEl?.value.trim() || "";
    return encodeCode({
      v: 1, name: state.name, term: state.term, blocks: state.blocks,
    });
  }

  // Only offered where the browser actually has a share sheet. A button that
  // silently does nothing is worse than no button.
  const shareBtn = document.getElementById("st-share") as HTMLButtonElement | null;
  if (shareBtn && typeof navigator.share === "function") {
    shareBtn.hidden = false;
    shareBtn.addEventListener("click", async () => {
      try {
        // the bare code, so the recipient can paste it straight in without
        // picking it out of a sentence
        await navigator.share({ text: currentCode() });
      } catch {
        /* the user dismissed the share sheet, which is not an error */
      }
    });
  }

  document.getElementById("st-copy")?.addEventListener("click", async () => {
    const code = currentCode();
    const btn = document.getElementById("st-copy");
    try {
      await navigator.clipboard.writeText(code);
      if (btn) {
        btn.textContent = "Copied";
        setTimeout(() => { btn.textContent = "Copy my code"; }, 1500);
      }
    } catch {
      // clipboard can be blocked; show the code so it can be copied by hand
      const box = document.createElement("textarea");
      box.className = "st-code";
      box.value = code;
      btn?.after(box);
      box.select();
    }
  });

  const sizeEl = document.getElementById("st-size") as HTMLSelectElement | null;
  sizeEl?.addEventListener("change", () => {
    groupSize = Number(sizeEl.value);
    renderSlots();
  });

  document.getElementById("st-clear")?.addEventListener("click", () => {
    for (let i = 0; i < groupSize; i++) {
      const el = document.getElementById(`st-code-${i}`) as HTMLInputElement | null;
      if (el) el.value = "";
    }
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    loadFromSlots();
  });

  document.getElementById("st-min")?.addEventListener("change", renderResults);

  // restore a previous collection so a stray refresh does not cost five codes
  const saved = readSession();
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as { size: number; codes: string[] };
      if (parsed.size >= 2 && parsed.size <= 8) {
        groupSize = parsed.size;
        if (sizeEl) sizeEl.value = String(groupSize);
      }
      renderSlots();
      parsed.codes.forEach((c, i) => {
        const el = document.getElementById(`st-code-${i}`) as HTMLInputElement | null;
        if (el) el.value = c;
      });
      loadFromSlots();
    } catch {
      // an older or damaged session payload: start clean rather than half-restored
      renderSlots();
    }
  } else {
    renderSlots();
  }

  renderGrid();
}

document.addEventListener("nav", mount);
mount();
