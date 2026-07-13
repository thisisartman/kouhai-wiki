import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";

// Formsubmit AJAX endpoint (hashed alias, so the maintainer's email is not
// exposed in the page source). Delivers to the activated Formsubmit form.
const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/5b121b476fc3d310066a6e491050c454";

const suggestEditCss = `
.suggest-edit {
  margin: 0.6rem 0 0.3rem;
}
.suggest-edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--bodyFont);
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--light);
  background: var(--secondary);
  border: 1px solid var(--secondary);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: filter 0.15s ease, transform 0.15s ease;
}
.suggest-edit-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
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
.se-article {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  color: var(--gray);
}
.se-field { margin-bottom: 0.9rem; }
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
.se-honey { position: absolute; left: -9999px; }
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

// afterDOMLoaded runs as a plain <script> — no TS syntax here. Kept as a string so the
// plugin needs no inline-script build step.
const suggestEditScript = `
(function () {
  var ENDPOINT = "${FORMSUBMIT_ENDPOINT}";

  function ensureModal() {
    if (document.getElementById("se-overlay")) return document.getElementById("se-overlay");
    var overlay = document.createElement("div");
    overlay.className = "se-overlay";
    overlay.id = "se-overlay";
    overlay.innerHTML =
      '<div class="se-modal" role="dialog" aria-modal="true" aria-labelledby="se-title">' +
        '<div class="se-body">' +
          '<h3 id="se-title">Suggest an edit</h3>' +
          '<p class="se-article" id="se-article"></p>' +
          '<form id="se-form">' +
            '<div class="se-field"><label>Selected passage (optional)</label>' +
              '<textarea name="passage" id="se-passage" rows="3" placeholder="Highlight text on the page before clicking, or paste it here."></textarea></div>' +
            '<div class="se-field"><label>What should change, and why? *</label>' +
              '<textarea name="suggestion" id="se-suggestion" rows="4" required></textarea></div>' +
            '<div class="se-field"><label>Your name (optional)</label>' +
              '<input type="text" name="name" id="se-name" autocomplete="name"></div>' +
            '<div class="se-field"><label>Your IUJ email *</label>' +
              '<input type="email" name="reply_email" id="se-email" required autocomplete="email" placeholder="you@iuj.ac.jp">' +
              '<div class="se-hint">Must be an @iuj.ac.jp address.</div></div>' +
            '<input type="text" name="_honey" class="se-honey" tabindex="-1" autocomplete="off">' +
            '<div class="se-status" id="se-status"></div>' +
            '<div class="se-actions">' +
              '<button type="button" class="se-btn se-cancel" id="se-cancel">Cancel</button>' +
              '<button type="submit" class="se-btn se-send" id="se-send">Send suggestion</button>' +
            '</div>' +
          '</form>' +
        '</div>' +
        '<div class="se-done" id="se-done" style="display:none">' +
          '<h3>Thanks! 🙌</h3><p>Your suggestion was sent to the maintainer.</p>' +
          '<button type="button" class="se-btn se-cancel" id="se-close">Close</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

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
      var suggestionVal = overlay.querySelector("#se-suggestion").value.trim();
      var emailVal = overlay.querySelector("#se-email").value.trim();
      var atIdx = emailVal.indexOf("@");
      if (!suggestionVal) {
        statusEl.className = "se-status se-error";
        statusEl.textContent = "Please describe what should change.";
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
      statusEl.textContent = "Sending…";
      sendBtn.disabled = true;
      var payload = {
        _subject: "Kouhai Wiki suggestion: " + (overlay.dataset.article || "unknown"),
        _template: "table",
        _captcha: "false",
        article: overlay.dataset.article || "",
        page_url: overlay.dataset.url || "",
        slug: overlay.dataset.slug || "",
        passage: overlay.querySelector("#se-passage").value,
        suggestion: overlay.querySelector("#se-suggestion").value,
        name: overlay.querySelector("#se-name").value,
        reply_email: overlay.querySelector("#se-email").value
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
    btn.addEventListener("click", function () {
      var overlay = ensureModal();
      // reset to form view
      overlay.querySelector(".se-body").style.display = "block";
      overlay.querySelector("#se-done").style.display = "none";
      overlay.querySelector("#se-form").reset();
      overlay.querySelector("#se-status").textContent = "";
      overlay.querySelector("#se-send").disabled = false;
      overlay.dataset.article = btn.dataset.article || document.title;
      overlay.dataset.slug = btn.dataset.slug || "";
      overlay.dataset.url = location.href;
      overlay.querySelector("#se-article").textContent = "On: " + (btn.dataset.article || document.title);
      var sel = (window.getSelection && window.getSelection().toString()) || "";
      overlay.querySelector("#se-passage").value = sel.trim();
      overlay.classList.add("se-open");
      overlay.querySelector("#se-suggestion").focus();
    });
  }

  document.addEventListener("nav", wire);
  if (document.readyState !== "loading") wire();
})();
`;

const SuggestEdit: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const slug = (fileData.slug as string) || "";
    // Don't show on the landing page.
    if (slug === "index") return null;
    const title = (fileData.frontmatter?.title as string) || "";
    return (
      <div class="suggest-edit">
        <button
          type="button"
          class="suggest-edit-btn"
          data-article={title}
          data-slug={slug}
          aria-haspopup="dialog"
        >
          ✏️ Suggest an edit
        </button>
      </div>
    );
  };

  Component.css = suggestEditCss;
  Component.afterDOMLoaded = suggestEditScript;

  return Component;
};

export default SuggestEdit;
