import type { QuartzComponent, QuartzComponentConstructor } from "@quartz-community/types";

// A small grab-bag of fixes for gitignored third-party plugins (explorer,
// search) whose own source resets to its pinned upstream commit on every
// fresh install (local or CI) — patching them directly doesn't survive
// that, so anything they don't already do right lives here instead,
// driven purely by the class names/markup each is known to render.
// Every explorer-related behavior below re-triggers a real click on its
// own toggle button rather than duplicating that plugin's state handling.
const closeNavOnOutsideTapScript = `
(function () {
  function wireOutsideTapClose() {
    if (document.documentElement.dataset.closeNavWired === "1") return;
    document.documentElement.dataset.closeNavWired = "1";

    document.addEventListener("click", function (e) {
      if (!window.matchMedia("(max-width: 800px)").matches) return;
      var explorer = document.querySelector(".explorer");
      if (!explorer || explorer.classList.contains("collapsed")) return;
      if (explorer.contains(e.target)) return;
      var toggle = explorer.querySelector(".explorer-toggle.mobile-explorer");
      if (toggle) toggle.click();
    });
  }

  // Swipe-right-to-open. Ignores a strip along both edges — most mobile OSes
  // and browsers already bind edge swipes to back/forward navigation, and
  // stealing that gesture would be a worse regression than not having this
  // feature at all — so only swipes starting in the middle of the screen
  // count, matching the ask to trigger from "the center" specifically.
  function wireSwipeOpen() {
    if (document.documentElement.dataset.navSwipeWired === "1") return;
    document.documentElement.dataset.navSwipeWired = "1";

    var EDGE = 32;
    var THRESHOLD = 60;
    var startX = 0;
    var startY = 0;
    var tracking = false;

    document.addEventListener(
      "touchstart",
      function (e) {
        if (!window.matchMedia("(max-width: 800px)").matches) return;
        var explorer = document.querySelector(".explorer");
        if (!explorer || !explorer.classList.contains("collapsed")) return;
        var t = e.touches[0];
        if (t.clientX < EDGE || t.clientX > window.innerWidth - EDGE) return;
        startX = t.clientX;
        startY = t.clientY;
        tracking = true;
      },
      { passive: true },
    );

    document.addEventListener(
      "touchmove",
      function (e) {
        if (!tracking) return;
        var t = e.touches[0];
        var dx = t.clientX - startX;
        var dy = t.clientY - startY;
        if (Math.abs(dy) > Math.abs(dx)) return;
        if (dx > THRESHOLD) {
          tracking = false;
          var explorer = document.querySelector(".explorer");
          var toggle = explorer && explorer.querySelector(".explorer-toggle.mobile-explorer");
          if (toggle) toggle.click();
        }
      },
      { passive: true },
    );

    document.addEventListener("touchend", function () {
      tracking = false;
    });
    document.addEventListener("touchcancel", function () {
      tracking = false;
    });
  }

  // The explorer's server-rendered markup has no "collapsed" class at all —
  // it's added by the plugin's own script only after checking whether the
  // mobile toggle is visible. On every SPA navigation, Quartz swaps in a
  // fresh copy of that markup (uncollapsed by default), and the explorer's
  // own "nav" listener re-adds "collapsed" ~100ms later — so the mobile
  // nav visibly flashes open and springs shut on every navigation, since
  // that swap-then-correct sequence plays out through this file's own CSS
  // transitions. Can't fix the swap itself (same gitignored plugin as
  // above), so mute the transitions for a beat around every navigation
  // instead — the state still flips, just without animating, so there's
  // nothing left to see flash.
  function wireNavFlashSuppression() {
    if (document.documentElement.dataset.navFlashWired === "1") return;
    document.documentElement.dataset.navFlashWired = "1";

    document.addEventListener("nav", function () {
      document.documentElement.setAttribute("data-nav-transitioning", "");
      setTimeout(function () {
        document.documentElement.removeAttribute("data-nav-transitioning");
      }, 200);
    });
  }

  // The overlay search only navigates on Enter once a result is focused
  // via arrow keys or mouse hover (its own script tracks that as
  // currentHover, exposed to CSS as .result-card.focus) — hitting Enter
  // right after typing, before ever touching an arrow key, did nothing at
  // all. Falls back to the top result in that case, without touching the
  // plugin's existing arrow-key/hover navigation (that already works).
  function wireSearchEnterFallback() {
    if (document.documentElement.dataset.searchEnterWired === "1") return;
    document.documentElement.dataset.searchEnterWired = "1";

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var input = e.target;
      if (!input || input.className !== "search-bar") return;
      if (document.querySelector(".result-card.focus")) return;
      var first = document.querySelector(".results-container .result-card");
      if (first) {
        e.preventDefault();
        first.click();
      }
    });
  }

  // The explorer only recalculates its own collapsed state on "nav" events
  // (SPA navigation / initial load) — never on a plain window resize, so
  // crossing the mobile breakpoint by resizing alone (most realistically:
  // rotating a tablet or phone) leaves it in whatever state it started in:
  //
  // - Stuck collapsed outside mobile: tree data present in the DOM but
  //   zero-height, invisible. Used to be recoverable by clicking the
  //   desktop toggle, but that's now deliberately inert (see the
  //   custom.scss collapse-disable rule), so this had no escape hatch.
  // - Stuck open (not collapsed) after resizing into mobile: the nav
  //   renders as an unexpected full-screen overlay on top of the page.
  //
  // Reconciles both by forcing the correct state on every resize: open
  // outside mobile, closed on entering mobile.
  function wireResizeUncollapse() {
    if (document.documentElement.dataset.resizeUncollapseWired === "1") return;
    document.documentElement.dataset.resizeUncollapseWired = "1";

    var mq = window.matchMedia("(max-width: 800px)");
    var wasMobile = mq.matches;

    window.addEventListener("resize", function () {
      var isMobile = mq.matches;
      // Only correct on an actual crossing, not every resize tick — a
      // legitimately-open mobile nav shouldn't get force-closed by a
      // trivial resize (e.g. a mobile browser's keyboard opening) that
      // never left the mobile regime in the first place.
      if (isMobile === wasMobile) return;
      wasMobile = isMobile;
      var explorer = document.querySelector(".explorer");
      if (!explorer) return;
      if (isMobile) {
        explorer.classList.add("collapsed");
      } else {
        explorer.classList.remove("collapsed");
      }
    });
  }

  function wire() {
    wireOutsideTapClose();
    wireSwipeOpen();
    wireNavFlashSuppression();
    wireSearchEnterFallback();
    wireResizeUncollapse();
  }

  document.addEventListener("nav", wire);
  if (document.readyState !== "loading") wire();
})();
`;

const CloseNavOnOutsideTap: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = () => null;
  Component.afterDOMLoaded = closeNavOnOutsideTapScript;
  return Component;
};

export default CloseNavOnOutsideTap;
