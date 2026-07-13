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

// src/components/HomeSearch.tsx
var homeSearchCss = `
.home-search {
  max-width: 640px;
  margin: 0.5rem auto 1.8rem;
}
.home-search-intro {
  font-family: var(--bodyFont);
  color: var(--darkgray);
  text-align: center;
  margin: 0 0 1.1rem;
}
.home-search-input {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--bodyFont);
  font-size: 1.1rem;
  color: var(--dark);
  background: var(--light);
  border: 2px solid var(--darkgray);
  border-radius: 10px;
  padding: 0.9rem 1.2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
.home-search-input:focus {
  outline: none;
  border-color: var(--secondary);
}
.home-search-results {
  margin-top: 0.6rem;
  display: none;
  flex-direction: column;
  border: 2px solid var(--darkgray);
  border-radius: 10px;
  padding: 0.4rem;
  overflow: hidden;
}
.home-search-results.hsr-open { display: flex; }
/* Each result is rendered as a whole-card <a>, which Quartz's generic
   internal-link styling (a small "pill" highlight meant for inline
   wikilink mentions inside body text) also applies to as a full-card
   background \u2014 same specificity as that rule, so this needs the extra
   .home-search-results ancestor to reliably win. */
.home-search-results .home-search-result {
  display: block;
  padding: 0.65rem 1rem;
  text-decoration: none;
  background-color: var(--light);
  border-bottom: 1px solid var(--lightgray);
}
.home-search-result:last-child { border-bottom: none; }
.home-search-results .home-search-result:hover {
  background-color: var(--lightgray);
}
.home-search-result .hsr-title {
  font-family: var(--bodyFont);
  font-weight: 600;
  color: var(--dark);
  font-size: 0.95rem;
}
.home-search-result .hsr-snippet {
  font-family: var(--bodyFont);
  font-size: 0.8rem;
  color: var(--gray);
  margin-top: 0.15rem;
}
.home-search-empty {
  padding: 0.65rem 1rem;
  font-family: var(--bodyFont);
  font-size: 0.85rem;
  color: var(--gray);
}
`;
var homeSearchScript = `
(function () {
  var MAX_RESULTS = 8;
  var SNIPPET_LEN = 110;

  function wire() {
    var input = document.getElementById("home-search-input");
    if (!input || input.dataset.wired === "1") return;
    input.dataset.wired = "1";

    var results = document.getElementById("home-search-results");
    var debounceTimer = null;
    var indexPromise = (typeof fetchData !== "undefined") ? fetchData : Promise.resolve({});

    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function snippetAround(content, query) {
      var lower = content.toLowerCase();
      var idx = lower.indexOf(query);
      if (idx === -1) return content.slice(0, SNIPPET_LEN);
      var start = Math.max(0, idx - 30);
      var end = Math.min(content.length, idx + query.length + 60);
      return (start > 0 ? "\u2026" : "") + content.slice(start, end) + (end < content.length ? "\u2026" : "");
    }

    function render(query, entries) {
      if (!query) {
        results.innerHTML = "";
        results.classList.remove("hsr-open");
        return;
      }
      if (entries.length === 0) {
        results.innerHTML = '<div class="home-search-empty">No matching articles.</div>';
        results.classList.add("hsr-open");
        return;
      }
      results.innerHTML = entries
        .map(function (e) {
          var snippet = e.titleMatch ? (e.content || "").slice(0, SNIPPET_LEN) : snippetAround(e.content || "", query);
          return (
            '<a class="home-search-result internal" href="./' + e.slug + '">' +
              '<div class="hsr-title">' + escapeHtml(e.title) + '</div>' +
              '<div class="hsr-snippet">' + escapeHtml(snippet) + '</div>' +
            '</a>'
          );
        })
        .join("");
      results.classList.add("hsr-open");
    }

    function search(query, index) {
      var q = query.trim().toLowerCase();
      if (!q) return [];
      var scored = [];
      for (var slug in index) {
        if (slug === "index" || slug.endsWith("/index")) continue;
        if (slug === "tags" || slug.indexOf("tags/") === 0) continue;
        var entry = index[slug];
        var title = (entry.title || "").toLowerCase();
        var content = (entry.content || "").toLowerCase();
        var titleMatch = title.indexOf(q) !== -1;
        var contentMatch = !titleMatch && content.indexOf(q) !== -1;
        if (!titleMatch && !contentMatch) continue;
        var score = titleMatch ? (title.indexOf(q) === 0 ? 3 : 2) : 1;
        scored.push({ slug: slug, title: entry.title, content: entry.content, titleMatch: titleMatch, score: score });
      }
      scored.sort(function (a, b) { return b.score - a.score; });
      return scored.slice(0, MAX_RESULTS);
    }

    input.addEventListener("input", function () {
      var query = input.value;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        indexPromise.then(function (index) {
          render(query.trim(), search(query, index));
        });
      }, 120);
    });
  }

  document.addEventListener("nav", wire);
  if (document.readyState !== "loading") wire();
})();
`;
var HomeSearch = () => {
  const Component = ({ fileData }) => {
    if (fileData.slug !== "index") return null;
    const description = fileData.frontmatter?.description;
    return /* @__PURE__ */ u2("div", { class: "home-search", children: [
      description && /* @__PURE__ */ u2("p", { class: "home-search-intro", children: description }),
      /* @__PURE__ */ u2(
        "input",
        {
          type: "search",
          id: "home-search-input",
          class: "home-search-input",
          placeholder: "Search the wiki \u2014 visa, housing, banking, SIM cards\u2026",
          autocomplete: "off"
        }
      ),
      /* @__PURE__ */ u2("div", { id: "home-search-results", class: "home-search-results" })
    ] });
  };
  Component.css = homeSearchCss;
  Component.afterDOMLoaded = homeSearchScript;
  return Component;
};
var HomeSearch_default = HomeSearch;

export { HomeSearch_default as HomeSearch };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map