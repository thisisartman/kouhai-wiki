import type { QuartzComponent, QuartzComponentConstructor } from "@quartz-community/types";

// The explorer (hamburger nav) is a third-party plugin (quartz-community/explorer)
// installed into the gitignored .quartz/plugins/ cache, which gets wiped and
// re-fetched from its pinned upstream commit on every fresh install (local or CI).
// Patching its own source directly doesn't survive that, so mobile-nav gesture
// behavior it doesn't already provide lives here instead, driven purely by the
// class names/markup it's known to render: `.explorer` (container), `.collapsed`
// (closed state), and the mobile toggle button `.explorer-toggle.mobile-explorer`
// that its own script already wires up to open/close consistently (mobile-no-scroll,
// aria state, etc) — every behavior below re-triggers a real click on it rather
// than duplicating that state handling.
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

  function wire() {
    wireOutsideTapClose();
    wireSwipeOpen();
    wireNavFlashSuppression();
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
