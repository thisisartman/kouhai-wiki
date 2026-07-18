// node_modules/preact/dist/preact.mjs
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
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l.vnode && l.vnode(l2), l2;
}

// src/components/StatusBadge.tsx
var REASON_COPY = {
  unverified: "hasn't been checked against an official source yet",
  "needs-input": "needs a firsthand student account \u2014 no official source will ever cover this",
  empty: "this article is thin \u2014 barely any content yet"
};
var REASON_ORDER = ["unverified", "needs-input", "empty"];
var statusBadgeCss = `
.status-banner {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  margin-bottom: 1.2rem;
}
.status-line {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5em;
  font-family: var(--bodyFont);
  font-size: 0.85rem;
  padding: 0.55em 0.9em;
  border-radius: 5px;
  border-left: 3px solid var(--status-border, var(--gray));
  background: var(--status-bg, var(--lightgray));
  color: var(--status-fg, var(--darkgray));
}
.status-line .status-chip {
  font-weight: 700;
  white-space: nowrap;
}
.status-line.status-unverified {
  --status-bg: #fdf0da;
  --status-fg: #8a5a12;
  --status-border: #e3b869;
}
.status-line.status-needs-input {
  --status-bg: #f0e8fb;
  --status-fg: #5b3a94;
  --status-border: #b79ce0;
}
.status-line.status-empty {
  --status-bg: #e8edf2;
  --status-fg: #3f5468;
  --status-border: #9db0c2;
}
@media (prefers-color-scheme: dark) {
  .status-line.status-unverified { --status-bg: #3a2e14; --status-fg: #e8bf75; --status-border: #6b4f1e; }
  .status-line.status-needs-input { --status-bg: #2c2338; --status-fg: #c7a9ef; --status-border: #5a4278; }
  .status-line.status-empty { --status-bg: #212a33; --status-fg: #9fb7cc; --status-border: #3d4f60; }
}
[saved-theme="dark"] .status-line.status-unverified { --status-bg: #3a2e14; --status-fg: #e8bf75; --status-border: #6b4f1e; }
[saved-theme="dark"] .status-line.status-needs-input { --status-bg: #2c2338; --status-fg: #c7a9ef; --status-border: #5a4278; }
[saved-theme="dark"] .status-line.status-empty { --status-bg: #212a33; --status-fg: #9fb7cc; --status-border: #3d4f60; }
[saved-theme="light"] .status-line.status-unverified { --status-bg: #fdf0da; --status-fg: #8a5a12; --status-border: #e3b869; }
[saved-theme="light"] .status-line.status-needs-input { --status-bg: #f0e8fb; --status-fg: #5b3a94; --status-border: #b79ce0; }
[saved-theme="light"] .status-line.status-empty { --status-bg: #e8edf2; --status-fg: #3f5468; --status-border: #9db0c2; }
`;
var StatusBadge = () => {
  const Component = ({ fileData }) => {
    const status = fileData.frontmatter?.status;
    if (status !== "needs-work") return null;
    const tags = fileData.frontmatter?.tags ?? [];
    const reasons = REASON_ORDER.filter((r2) => tags.includes(r2));
    if (reasons.length === 0) return null;
    return /* @__PURE__ */ u2("div", { class: "status-banner", children: reasons.map((reason) => /* @__PURE__ */ u2("div", { class: `status-line status-${reason}`, children: [
      /* @__PURE__ */ u2("span", { class: "status-chip", children: reason }),
      /* @__PURE__ */ u2("span", { children: [
        "\u2014 ",
        REASON_COPY[reason],
        "."
      ] })
    ] }, reason)) });
  };
  Component.css = statusBadgeCss;
  return Component;
};
var StatusBadge_default = StatusBadge;

export { StatusBadge_default as StatusBadge };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map