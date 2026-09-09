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

// src/components/SiteNotice.tsx
var SUPPRESSED_SLUGS = /* @__PURE__ */ new Set(["index"]);
var siteNoticeCss = `
.site-notice {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.45em;
  font-family: var(--bodyFont);
  font-size: 0.75rem;
  line-height: 1.5;
  padding: 0.45em 0.75em;
  margin-bottom: 1.2rem;
  border-radius: 4px;
  border-left: 2px solid var(--notice-border, var(--gray));
  background: var(--notice-bg, var(--lightgray));
  color: var(--notice-fg, var(--darkgray));
}
.site-notice .site-notice-chip {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.site-notice a {
  color: inherit;
  text-decoration: underline;
}
:root {
  --notice-bg: #f4f4f5;
  --notice-fg: #5b5b66;
  --notice-border: #c9c9d1;
}
@media (prefers-color-scheme: dark) {
  :root {
    --notice-bg: #26262b;
    --notice-fg: #9a9aa6;
    --notice-border: #45454f;
  }
}
[saved-theme="dark"] {
  --notice-bg: #26262b;
  --notice-fg: #9a9aa6;
  --notice-border: #45454f;
}
[saved-theme="light"] {
  --notice-bg: #f4f4f5;
  --notice-fg: #5b5b66;
  --notice-border: #c9c9d1;
}
`;
var SiteNotice = () => {
  const Component = ({ fileData }) => {
    const slug = fileData.slug;
    if (slug && SUPPRESSED_SLUGS.has(slug)) return null;
    return /* @__PURE__ */ u2("aside", { class: "site-notice", children: [
      /* @__PURE__ */ u2("span", { class: "site-notice-chip", children: "Unofficial" }),
      /* @__PURE__ */ u2("span", { children: "Student-written and not endorsed by IUJ. Confirm procedures and deadlines through official IUJ channels before acting." })
    ] });
  };
  Component.css = siteNoticeCss;
  return Component;
};
var SiteNotice_default = SiteNotice;

export { SiteNotice_default as SiteNotice };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map