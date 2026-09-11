import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";
// @ts-expect-error - inline script imported as a string by the esbuild loader
import script from "./scripts/schedule.inline.ts";

const css = `
.st-root { margin: 1.5rem 0 2rem; font-family: var(--bodyFont); }
/* Underline tabs rather than filled pills. A filled rounded rect reads as a
   button you press; an underline reads as the view you are currently in. */
.st-tabs { display: flex; gap: 1.5rem; margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--lightgray); }
.st-tab { padding: .5em 0 .55em; border: 0; border-bottom: 2px solid transparent;
  border-radius: 0; background: none; color: var(--gray); cursor: pointer;
  font-weight: 600; font-size: .95rem; font-family: inherit;
  margin-bottom: -1px; transition: color .12s ease, border-color .12s ease; }
.st-tab:hover { color: var(--darkgray); }
.st-tab[aria-selected="true"] { color: var(--secondary); border-bottom-color: var(--secondary); }
.st-tab:focus-visible { outline: 2px solid var(--secondary); outline-offset: 3px; }
.st-panel[hidden] { display: none !important; }
.st-note { font-size: .78rem; color: var(--gray); margin-top: .6rem; line-height: 1.5; }
/* min-width forces sideways scrolling on a phone instead of squeezing seven
   columns into 375px, where cells become too narrow to tap accurately */
.st-grid { display: grid; grid-template-columns: 3.9rem repeat(7, minmax(74px, 1fr));
  gap: 1px; min-width: max-content;
  background: var(--lightgray); border: 1px solid var(--lightgray);
  /* No height cap, so the grid is exactly as tall as its rows and never
     becomes a nested vertical scrollbox. That was trapping the scroll: you
     would reach the bottom of the grid and the page would not take over.
     overflow-x still gives sideways scrolling for the seven columns, and
     overscroll-behavior-x keeps a horizontal swipe from triggering
     browser back navigation. */
  overflow-x: auto; overscroll-behavior-x: contain;
  user-select: none; touch-action: pan-x pan-y; }
.st-cell { background: var(--light); min-height: 22px; cursor: pointer; }
.st-cell.st-busy { background: var(--secondary); }
/* a heavier line on the hour so the half-hour rows read as subdivisions */
.st-cell.st-hourline { box-shadow: inset 0 1px 0 var(--lightgray); }
.st-hour { background: var(--light); font-size: .66rem; color: var(--darkgray);
  padding: 3px 5px; text-align: right; font-variant-numeric: tabular-nums;
  white-space: nowrap; }
.st-hour.st-half { color: var(--gray); opacity: .6; }
.st-head { background: var(--light); font-size: .75rem; font-weight: 700;
  text-align: center; padding: 6px 0; position: sticky; top: 0; z-index: 1; }
.st-actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem;
  align-items: center; }
.st-actions button, .st-actions select, .st-actions input {
  padding: .45em .9em; border-radius: 5px; border: 1px solid var(--lightgray);
  background: var(--light); color: var(--darkgray); font-weight: 600; }
.st-actions button { cursor: pointer; }
.st-actions button:disabled { opacity: .45; cursor: default; }
.st-danger { color: #a33; }
.st-danger.st-armed { background: #a33; color: var(--light); border-color: #a33; }
.st-code { width: 100%; min-height: 5rem; font-family: var(--codeFont); font-size: .8rem;
  padding: .5rem; border-radius: 5px; border: 1px solid var(--lightgray);
  background: var(--light); color: var(--darkgray); }
.st-slot { display: flex; justify-content: space-between; gap: 1rem; padding: .5em .75em;
  border: 1px solid var(--lightgray); border-radius: 5px; margin-bottom: .4rem;
  cursor: pointer; background: var(--light); }
.st-slot[aria-selected="true"] { border-color: var(--secondary); background: var(--highlight); }
.st-slot-who { font-size: .78rem; color: var(--gray); text-align: right; }
.st-error { color: #a33; font-size: .8rem; margin-top: .5rem; line-height: 1.5; }
.st-personrow { display: flex; align-items: center; gap: .6rem; margin-bottom: .45rem; }
.st-personlabel { flex: 0 0 1.4rem; text-align: right; font-size: .8rem;
  font-weight: 700; color: var(--gray); }
.st-personinput { flex: 1 1 auto; min-width: 0; padding: .45em .6em; border-radius: 5px;
  border: 1px solid var(--lightgray); background: var(--light); color: var(--darkgray);
  font-family: var(--codeFont); font-size: .78rem; }
.st-personstate { flex: 0 0 7rem; font-size: .75rem; color: var(--gray);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.st-personstate.st-good { color: var(--secondary); font-weight: 600; }
.st-personstate.st-bad { color: #a33; }

/* Results grid: availability as a heat map rather than a list of long windows.
   A three-hour free window is not a meeting time; the grid lets you pick the
   part of it you actually want. */
.st-resultgrid .st-cell { cursor: pointer; }
.st-cell.st-all  { background: #2e7d52; }
.st-cell.st-most { background: #4e8f6d; opacity: .72; }
.st-cell.st-some { background: #4e8f6d; opacity: .34; }
.st-cell.st-none { background: var(--light); }
.st-cell.st-viable { box-shadow: inset 0 0 0 1px #8fd3ae; }
.st-cell.st-picked { background: var(--secondary); box-shadow: inset 0 0 0 2px var(--light); }
.st-legend { display: flex; flex-wrap: wrap; gap: .9rem; align-items: center;
  font-size: .74rem; color: var(--gray); margin: .2rem 0 .6rem; }
.st-key { display: inline-block; width: .85em; height: .85em; border-radius: 2px;
  vertical-align: -1px; margin-right: .3em; border: 1px solid var(--lightgray); }
.st-key.st-all  { background: #2e7d52; }
.st-key.st-most { background: #4e8f6d; opacity: .72; }
.st-key.st-some { background: #4e8f6d; opacity: .34; }
.st-key.st-none { background: var(--light); }
.st-hoursbox { display: inline-flex; align-items: center; gap: .35em; cursor: pointer; }
@media (max-width: 550px) {
  .st-personstate { flex-basis: 4.5rem; }
}
@media (max-width: 800px) {
  .st-hour { font-size: .62rem; }
  .st-cell { min-height: 26px; }  /* bigger tap target on touch screens */
}
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
