import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";

const homeSearchCss = `
.home-search {
  margin: 0.5rem 0 1.8rem;
}
.home-search-input {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--bodyFont);
  font-size: 1.1rem;
  color: var(--dark);
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 10px;
  padding: 0.85rem 1.1rem;
}
.home-search-input:focus {
  outline: none;
  border-color: var(--secondary);
}
.home-search-results {
  margin-top: 0.6rem;
  display: none;
  flex-direction: column;
  border: 1px solid var(--lightgray);
  border-radius: 10px;
  overflow: hidden;
}
.home-search-results.hsr-open { display: flex; }
.home-search-result {
  display: block;
  padding: 0.65rem 1rem;
  text-decoration: none;
  border-bottom: 1px solid var(--lightgray);
}
.home-search-result:last-child { border-bottom: none; }
.home-search-result:hover {
  background: var(--lightgray);
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

// afterDOMLoaded runs as a plain <script> — no TS syntax here, mirrors the
// suggest-edit plugin's approach so no inline-script build step is needed.
const homeSearchScript = `
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
      return (start > 0 ? "…" : "") + content.slice(start, end) + (end < content.length ? "…" : "");
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

const HomeSearch: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return null;
    return (
      <div class="home-search">
        <input
          type="search"
          id="home-search-input"
          class="home-search-input"
          placeholder="Search the wiki — visa, housing, banking, SIM cards…"
          autocomplete="off"
        />
        <div id="home-search-results" class="home-search-results"></div>
      </div>
    );
  };

  Component.css = homeSearchCss;
  Component.afterDOMLoaded = homeSearchScript;

  return Component;
};

export default HomeSearch;
