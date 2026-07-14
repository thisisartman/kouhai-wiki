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

// src/components/SuggestEdit.tsx
var FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/5b121b476fc3d310066a6e491050c454";
var suggestEditCss = `
/* Global header toolbar icon \u2014 sized to fit alongside the search/dark-mode
   buttons, but keeps the original filled-badge look (colored background,
   light icon) rather than going fully flat/monochrome like those. */
.suggest-edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  box-sizing: border-box;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: var(--secondary);
  border: 1px solid var(--secondary);
  border-radius: 8px;
  color: var(--light);
  font-family: var(--bodyFont);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: filter 0.15s ease, transform 0.15s ease;
}
.suggest-edit-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
.suggest-edit-btn svg { width: 16px; height: 16px; flex-shrink: 0; }
/* Stays icon-only at every screen size \u2014 this button lives in
   .sidebar.left, a narrow fixed-width column (not a full top bar) at any
   breakpoint, so an expanded text label here doesn't have room and just
   pushes dark-mode out of the toolbar row. The title attribute on the
   button covers the tooltip/accessible name instead, same as search and
   dark-mode's icon-only buttons. */
.suggest-edit-btn .se-btn-label { display: none; }
.se-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}
.se-overlay.se-open { display: flex; }
.se-modal {
  background: var(--light);
  color: var(--dark);
  border: 1px solid var(--lightgray);
  border-radius: 10px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.4rem 1.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  font-family: var(--bodyFont);
}
.se-modal h3 {
  margin: 0 0 0.15rem;
  font-size: 1.15rem;
}
.se-mode-toggle {
  display: flex;
  gap: 0.5rem;
  margin: 0.7rem 0 0.9rem;
}
.se-mode-btn {
  flex: 1;
  text-align: center;
  font-family: var(--bodyFont);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--darkgray);
  background: transparent;
  border: 1px solid var(--lightgray);
  border-radius: 6px;
  padding: 0.45rem 0.6rem;
  cursor: pointer;
}
.se-mode-btn.se-mode-active {
  background: var(--secondary);
  color: var(--light);
  border-color: var(--secondary);
}
.se-article {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  color: var(--gray);
}
.se-field { margin-bottom: 0.9rem; }
.se-field-row {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}
.se-field-row .se-field { flex: 1 1 auto; min-width: 0; }
.se-field-row .se-field-year { flex: 0 0 auto; width: 6.5rem; }
.se-field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: var(--darkgray);
}
.se-field textarea,
.se-field input {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--bodyFont);
  font-size: 0.9rem;
  color: var(--dark);
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 6px;
  padding: 0.5rem 0.6rem;
}
.se-field textarea { resize: vertical; min-height: 3.5rem; }
.se-field textarea:focus,
.se-field input:focus { outline: none; border-color: var(--secondary); }
.se-hint { font-size: 0.72rem; color: var(--gray); margin-top: 0.25rem; }
.se-field select {
  width: 100%;
  box-sizing: border-box;
  font-family: var(--bodyFont);
  font-size: 0.9rem;
  color: var(--dark);
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 6px;
  padding: 0.5rem 0.6rem;
}
.se-field select:focus { outline: none; border-color: var(--secondary); }
.se-consent {
  display: none;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
  font-size: 0.8rem;
  color: var(--darkgray);
}
.se-consent.se-show { display: flex; }
.se-consent input {
  /* Browsers apply their own UA-stylesheet margin to checkboxes (varies by
     browser, usually a few px), which threw the checkbox's left edge out
     of alignment with the field labels/inputs above it. Zero it out and
     let the label's own gap handle spacing instead. */
  margin: 0;
  flex-shrink: 0;
}
/* display:none (not just off-screen positioning) is what browser autofill
   actually respects as "skip this field" \u2014 off-screen positioning alone
   still left it visible to autofill, which would silently fill it when
   autofilling name/email and trip the bot trap below, closing the modal
   with no error shown. */
.se-honey { display: none; }
.se-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.4rem;
}
.se-btn {
  font-family: var(--bodyFont);
  font-size: 0.85rem;
  border-radius: 6px;
  padding: 0.45rem 0.9rem;
  cursor: pointer;
  border: 1px solid var(--lightgray);
}
.se-cancel { background: transparent; color: var(--darkgray); }
.se-send {
  background: var(--secondary);
  color: var(--light);
  border-color: var(--secondary);
}
.se-send:disabled { opacity: 0.6; cursor: default; }
.se-status { font-size: 0.85rem; margin-top: 0.6rem; color: var(--gray); }
.se-status.se-error { color: #c0392b; }
.se-done { text-align: center; padding: 1rem 0; }
.se-done h3 { margin-bottom: 0.4rem; }
`;
var suggestEditScript = `
(function () {
  var ENDPOINT = "${FORMSUBMIT_ENDPOINT}";
  var YEAR_PLACEHOLDER = "Select year";

  // Built at runtime (not baked in at build time) so the range never goes
  // stale. Covers alumni looking back a while plus a few years of incoming
  // students still to graduate.
  function buildYearOptions() {
    var now = new Date().getFullYear();
    var opts = "";
    for (var y = now + 3; y >= now - 15; y--) {
      opts += '<option value="' + y + '">' + y + "</option>";
    }
    return opts;
  }

  function ensureModal() {
    if (document.getElementById("se-overlay")) return document.getElementById("se-overlay");
    var overlay = document.createElement("div");
    overlay.className = "se-overlay";
    overlay.id = "se-overlay";
    overlay.innerHTML =
      '<div class="se-modal" role="dialog" aria-modal="true" aria-labelledby="se-title">' +
        '<div class="se-body">' +
          '<h3 id="se-title">Suggest an edit</h3>' +
          '<div class="se-mode-toggle">' +
            '<button type="button" class="se-mode-btn se-mode-active" id="se-mode-edit">Suggest an edit</button>' +
            '<button type="button" class="se-mode-btn" id="se-mode-new">Suggest a new page</button>' +
          '</div>' +
          '<p class="se-article" id="se-article"></p>' +
          '<form id="se-form">' +
            '<div class="se-field" id="se-passage-field"><label>Selected passage (optional)</label>' +
              '<textarea name="passage" id="se-passage" rows="3" placeholder="Highlight text on the page before clicking, or paste it here."></textarea></div>' +
            '<div class="se-field"><label id="se-suggestion-label">What should change, and why? *</label>' +
              '<textarea name="suggestion" id="se-suggestion" rows="4" required></textarea></div>' +
            '<div class="se-field"><label>Your name (optional)</label>' +
              '<input type="text" name="name" id="se-name" autocomplete="name"></div>' +
            '<div class="se-field"><label>Your IUJ email *</label>' +
              '<input type="email" name="reply_email" id="se-email" required autocomplete="email" placeholder="you@iuj.ac.jp">' +
              '<div class="se-hint">Must be an @iuj.ac.jp address.</div></div>' +
            '<div class="se-field-row">' +
              '<div class="se-field"><label>Country (optional)</label>' +
                '<input type="text" name="country" id="se-country" autocomplete="country-name"></div>' +
              '<div class="se-field se-field-year"><label>Class of</label>' +
                '<select name="grad_year" id="se-grad-year"><option value="">' + YEAR_PLACEHOLDER + '</option>' + buildYearOptions() + '</select></div>' +
            '</div>' +
            '<label class="se-consent" id="se-consent">' +
              '<input type="checkbox" name="credit_consent" id="se-consent-check">' +
              '<span>List me as a Senpai Contributor</span>' +
            '</label>' +
            '<input type="text" name="_honey" class="se-honey" tabindex="-1" autocomplete="off">' +
            '<div class="se-status" id="se-status"></div>' +
            '<div class="se-actions">' +
              '<button type="button" class="se-btn se-cancel" id="se-cancel">Cancel</button>' +
              '<button type="submit" class="se-btn se-send" id="se-send">Send suggestion</button>' +
            '</div>' +
          '</form>' +
        '</div>' +
        '<div class="se-done" id="se-done" style="display:none">' +
          '<h3>Thanks! \u{1F64C}</h3><p>Your suggestion was sent to the maintainer.</p>' +
          '<button type="button" class="se-btn se-cancel" id="se-close">Close</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    // Consent checkbox only makes sense once there's a name/email to credit
    // \u2014 stays hidden (and unchecked, off by default) until either is filled.
    var consentLabel = overlay.querySelector("#se-consent");
    var consentCheck = overlay.querySelector("#se-consent-check");
    function syncConsentVisibility() {
      var nameVal = overlay.querySelector("#se-name").value.trim();
      var emailVal = overlay.querySelector("#se-email").value.trim();
      var shouldShow = !!(nameVal || emailVal);
      consentLabel.classList.toggle("se-show", shouldShow);
      if (!shouldShow) consentCheck.checked = false;
    }
    overlay.querySelector("#se-name").addEventListener("input", syncConsentVisibility);
    overlay.querySelector("#se-email").addEventListener("input", syncConsentVisibility);

    // Mode toggle \u2014 "edit" (default) vs "new" page/topic suggestion. Stored
    // on the overlay itself (not a plain closure var) so the button's click
    // handler in wire(), which calls ensureModal() again on every open but
    // only runs this setup block once, can still reset it back to "edit" on
    // each open via overlay._seSetMode.
    function setMode(mode) {
      overlay.dataset.mode = mode;
      overlay.querySelector("#se-mode-edit").classList.toggle("se-mode-active", mode === "edit");
      overlay.querySelector("#se-mode-new").classList.toggle("se-mode-active", mode === "new");
      overlay.querySelector("#se-passage-field").style.display = mode === "new" ? "none" : "block";
      overlay.querySelector("#se-suggestion-label").textContent =
        mode === "new" ? "What page/topic should be added, and why? *" : "What should change, and why? *";
      var article = overlay.dataset.article || document.title;
      overlay.querySelector("#se-article").textContent =
        mode === "new" ? "Suggested while browsing: " + article : "On: " + article;
    }
    overlay._seSetMode = setMode;
    overlay.querySelector("#se-mode-edit").addEventListener("click", function () { setMode("edit"); });
    overlay.querySelector("#se-mode-new").addEventListener("click", function () { setMode("new"); });

    function close() { overlay.classList.remove("se-open"); }
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    overlay.querySelector("#se-cancel").addEventListener("click", close);
    overlay.querySelector("#se-close").addEventListener("click", close);

    overlay.querySelector("#se-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var honey = overlay.querySelector('[name="_honey"]').value;
      if (honey) { close(); return; } // bot trap
      var statusEl = overlay.querySelector("#se-status");
      var sendBtn = overlay.querySelector("#se-send");
      var mode = overlay.dataset.mode || "edit";
      var suggestionVal = overlay.querySelector("#se-suggestion").value.trim();
      var emailVal = overlay.querySelector("#se-email").value.trim();
      var atIdx = emailVal.indexOf("@");
      if (!suggestionVal) {
        statusEl.className = "se-status se-error";
        statusEl.textContent = mode === "new" ? "Please describe the page/topic to add." : "Please describe what should change.";
        overlay.querySelector("#se-suggestion").focus();
        return;
      }
      if (atIdx < 1 || emailVal.indexOf(" ") !== -1 || emailVal.toLowerCase().slice(atIdx) !== "@iuj.ac.jp") {
        statusEl.className = "se-status se-error";
        statusEl.textContent = "Please enter your IUJ email address (must end in @iuj.ac.jp).";
        overlay.querySelector("#se-email").focus();
        return;
      }
      statusEl.className = "se-status";
      statusEl.textContent = "Sending\u2026";
      sendBtn.disabled = true;
      var payload = {
        _subject: mode === "new" ? "Kouhai Wiki new page suggestion" : "Kouhai Wiki suggestion: " + (overlay.dataset.article || "unknown"),
        _template: "table",
        _captcha: "false",
        type: mode === "new" ? "New page/topic" : "Edit",
        article: overlay.dataset.article || "",
        page_url: overlay.dataset.url || "",
        slug: overlay.dataset.slug || "",
        passage: overlay.querySelector("#se-passage").value,
        suggestion: overlay.querySelector("#se-suggestion").value,
        name: overlay.querySelector("#se-name").value,
        reply_email: overlay.querySelector("#se-email").value,
        country: overlay.querySelector("#se-country").value,
        grad_year: overlay.querySelector("#se-grad-year").value,
        credit_consent: overlay.querySelector("#se-consent-check").checked ? "yes" : "no"
      };
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          var ok = res.ok && res.d && String(res.d.success) === "true";
          if (ok) {
            overlay.querySelector(".se-body").style.display = "none";
            overlay.querySelector("#se-done").style.display = "block";
          } else {
            statusEl.className = "se-status se-error";
            statusEl.textContent = (res.d && res.d.message) || "Something went wrong. Please try again later.";
            sendBtn.disabled = false;
          }
        })
        .catch(function () {
          statusEl.className = "se-status se-error";
          statusEl.textContent = "Network error. Please try again later.";
          sendBtn.disabled = false;
        });
    });
    return overlay;
  }

  function wire() {
    var btn = document.querySelector(".suggest-edit-btn");
    if (!btn || btn.dataset.wired === "1") return;
    btn.dataset.wired = "1";
    // Safari clears the page's text selection when a <button> receives a
    // click, before the click handler runs \u2014 Chrome/Firefox don't do this.
    // Reading window.getSelection() inside the click handler saw an
    // already-empty selection there, so "highlight text, then click
    // Suggest an edit" never pre-filled the passage on Safari. mousedown
    // fires before Safari's selection-clearing kicks in, so capture it
    // there instead.
    var pendingSelection = "";
    btn.addEventListener("mousedown", function () {
      pendingSelection = (window.getSelection && window.getSelection().toString()) || "";
    });
    btn.addEventListener("click", function () {
      var overlay = ensureModal();
      // reset to form view
      overlay.querySelector(".se-body").style.display = "block";
      overlay.querySelector("#se-done").style.display = "none";
      overlay.querySelector("#se-form").reset();
      overlay.querySelector("#se-status").textContent = "";
      overlay.querySelector("#se-send").disabled = false;
      overlay.querySelector("#se-consent").classList.remove("se-show");
      overlay.dataset.article = btn.dataset.article || document.title;
      overlay.dataset.slug = btn.dataset.slug || "";
      overlay.dataset.url = location.href;
      overlay._seSetMode("edit");
      // Falls back to a fresh read for keyboard activation (Enter/Space on
      // a focused button never fires mousedown, so pendingSelection stays
      // empty \u2014 but nothing has cleared the selection in that path either).
      var sel = pendingSelection || (window.getSelection && window.getSelection().toString()) || "";
      overlay.querySelector("#se-passage").value = sel.trim();
      pendingSelection = "";
      overlay.classList.add("se-open");
      overlay.querySelector("#se-suggestion").focus();
    });
  }

  document.addEventListener("nav", wire);
  if (document.readyState !== "loading") wire();
})();
`;
var SuggestEdit = () => {
  const Component = ({ fileData }) => {
    const slug = fileData.slug || "";
    const title = fileData.frontmatter?.title || "";
    return /* @__PURE__ */ u2(
      "button",
      {
        type: "button",
        class: "suggest-edit-btn",
        "data-article": title,
        "data-slug": slug,
        "aria-haspopup": "dialog",
        "aria-label": "Suggest an edit",
        title: "Suggest an edit",
        children: [
          /* @__PURE__ */ u2(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              children: [
                /* @__PURE__ */ u2("path", { d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" }),
                /* @__PURE__ */ u2("path", { d: "m15 5 4 4" })
              ]
            }
          ),
          /* @__PURE__ */ u2("span", { class: "se-btn-label", children: "Suggest an edit" })
        ]
      }
    );
  };
  Component.css = suggestEditCss;
  Component.afterDOMLoaded = suggestEditScript;
  return Component;
};
var SuggestEdit_default = SuggestEdit;

export { SuggestEdit_default as SuggestEdit };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map