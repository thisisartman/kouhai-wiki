import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";

// The homepage states the same thing at length, in its own voice, as part of
// the opening copy. Rendering the short version there too just stacks two
// disclaimers above the fold.
const SUPPRESSED_SLUGS = new Set(["index"]);

// Deliberately quieter than status-badge's palette. That banner flags a problem
// with a specific article and should catch the eye; this one is site chrome that
// appears on every page, so it has to survive being read 117 times.
const siteNoticeCss = `
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

const SiteNotice: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const slug = fileData.slug as string | undefined;
    if (slug && SUPPRESSED_SLUGS.has(slug)) return null;

    return (
      <aside class="site-notice">
        <span class="site-notice-chip">Unofficial</span>
        <span>
          Student-written and not endorsed by IUJ. Confirm procedures and
          deadlines through official IUJ channels before acting.
        </span>
      </aside>
    );
  };

  Component.css = siteNoticeCss;

  return Component;
};

export default SiteNotice;
