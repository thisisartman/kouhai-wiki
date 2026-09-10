import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";
// @ts-expect-error - inline script imported as a string by the esbuild loader
import script from "./scripts/schedule.inline.ts";

const css = `
.st-root { margin: 1.5rem 0 2rem; font-family: var(--bodyFont); }
.st-tabs { display: flex; gap: .5rem; margin-bottom: 1rem; }
.st-tab { padding: .45em .9em; border-radius: 5px; border: 1px solid var(--lightgray);
  background: transparent; color: var(--darkgray); cursor: pointer; font-weight: 600; }
.st-tab[aria-selected="true"] { background: var(--secondary); color: var(--light);
  border-color: var(--secondary); }
.st-panel[hidden] { display: none !important; }
.st-note { font-size: .78rem; color: var(--gray); margin-top: .6rem; line-height: 1.5; }
.st-grid { display: grid; grid-template-columns: 3.5rem repeat(7, 1fr); gap: 1px;
  background: var(--lightgray); border: 1px solid var(--lightgray);
  overflow: auto; user-select: none; }
.st-cell { background: var(--light); min-height: 14px; cursor: pointer; }
.st-cell.st-busy { background: var(--secondary); }
.st-hour { background: var(--light); font-size: .68rem; color: var(--gray);
  padding: 2px 4px; text-align: right; }
.st-head { background: var(--light); font-size: .75rem; font-weight: 700;
  text-align: center; padding: 4px 0; position: sticky; top: 0; z-index: 1; }
.st-actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem;
  align-items: center; }
.st-actions button, .st-actions select, .st-actions input {
  padding: .45em .9em; border-radius: 5px; border: 1px solid var(--lightgray);
  background: var(--light); color: var(--darkgray); font-weight: 600; }
.st-actions button { cursor: pointer; }
.st-code { width: 100%; min-height: 5rem; font-family: var(--codeFont); font-size: .8rem;
  padding: .5rem; border-radius: 5px; border: 1px solid var(--lightgray);
  background: var(--light); color: var(--darkgray); }
.st-slot { display: flex; justify-content: space-between; gap: 1rem; padding: .5em .75em;
  border: 1px solid var(--lightgray); border-radius: 5px; margin-bottom: .4rem;
  cursor: pointer; background: var(--light); }
.st-slot[aria-selected="true"] { border-color: var(--secondary); background: var(--highlight); }
.st-slot-who { font-size: .78rem; color: var(--gray); text-align: right; }
.st-error { color: #a33; font-size: .8rem; margin-top: .5rem; line-height: 1.5; }
@media (max-width: 800px) { .st-grid { font-size: .7rem; } .st-hour { font-size: .6rem; } }
`;

const ScheduleTool: QuartzComponentConstructor = () => {
  const Component: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    // renders on exactly one page: the one whose frontmatter opts in
    if (fileData.frontmatter?.tool !== "schedule") return null;
    // the inline script builds everything inside this mount point
    return <div id="schedule-tool" class="st-root" />;
  };

  Component.css = css;
  Component.afterDOMLoaded = script;

  return Component;
};

export default ScheduleTool;
