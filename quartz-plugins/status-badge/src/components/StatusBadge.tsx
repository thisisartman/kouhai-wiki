import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";

const REASON_COPY: Record<string, string> = {
  unverified: "hasn't been checked against an official source yet",
  "needs-input": "needs a firsthand student account — no official source will ever cover this",
  empty: "this article is thin — barely any content yet",
};

// Fixed display order regardless of how tags are listed in frontmatter, so a
// page with all three reasons always renders them the same way.
const REASON_ORDER = ["unverified", "needs-input", "empty"];

const statusBadgeCss = `
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

const StatusBadge: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const status = fileData.frontmatter?.status as string | undefined;
    if (status !== "needs-work") return null;

    const tags = (fileData.frontmatter?.tags as string[] | undefined) ?? [];
    const reasons = REASON_ORDER.filter((r) => tags.includes(r));
    if (reasons.length === 0) return null;

    return (
      <div class="status-banner">
        {reasons.map((reason) => (
          <div class={`status-line status-${reason}`} key={reason}>
            <span class="status-chip">{reason}</span>
            <span>— {REASON_COPY[reason]}.</span>
          </div>
        ))}
      </div>
    );
  };

  Component.css = statusBadgeCss;

  return Component;
};

export default StatusBadge;
