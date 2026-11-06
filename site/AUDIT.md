# Routine code and real-UI audit

Reviewed 2026-11-06 against released source `2ae29b0f924ba7ddae0d2eb0664a72081edd05c0` plus the explicitly authorized category-preservation fix. Three unrelated dirty files were hashed and preserved exactly.

## Design read

Reading this as an explanatory introduction to a small personal-priority board, preserving the actual daylight-blue workspace, rounded white cards and four botanical color semantics. Design variance5, motion1, density4. Native CSS with system sans fallbacks; no new dependencies or network font. The site keeps English root and Chinese `/zh/`, `#use` and `#start`, canonical/alternate URLs and the existing approved Open Graph banner.

The app’s Chinese title is “早起的黄金一小时”. Its functional model is a task board, not a one-hour timer or recurring-morning automation. Intro content is independent of the old generic README renderer.

## Actual app opened

Opened https://morning-routine-phi.vercel.app in shared Ego workspace9/p3. Its task archive was empty. Initial navigation showed the real blue board, categories, date shortcuts and onboarding. A later browser operation encountered the application’s automatic location prompt; all browser work stopped until the user denied it and the coordinating agent resumed the shared space. No location permission was granted or bypassed.

Created clearly labelled sample tasks for a walk, preparing a talk and sorting downloads. Used actual category shortcuts, optional date control, category expansion and completion. Captured three real screenshots. No existing personal data, account, key or paid request was used. The source includes browser geolocation for sunrise/sunset; denial uses a default location and does not prevent task use.

## Owning code read

- `src/utils/config.ts`: actual Plant/Harvest/Dry/Thin names, Chinese definitions, icon paths and colors. This source is read by the intro build, not manually faked.
- `src/components/MainContent.tsx` at `HEAD`: drag target categorization, uncategorizing, selected-task keyboard handling. The uncommitted storage-name change is excluded from this work.
- `src/components/ToDoList.tsx`: add/delete/completion, optional date shortcuts, category filtering; no title editing or reminder engine.
- `src/components/TaskChip.tsx`, `TaskIndicator.tsx`, `DragHandle.tsx`: compact category markers, hover titles, completion indicators and draggable handle. Generic reordering is not claimed merely because SortableContext exists.
- `src/components/GridCard.tsx`, `Modal.tsx`: category overview and expanded list.
- `src/context/todo-context.tsx` at `HEAD`: browser-local task/category storage, no cloud account; unrelated pending key migration preserved.
- `src/context/background-context.tsx`, `Header.tsx`: local clock, time-of-day gradients, external sunrise/sunset lookup and default location.

## Concept research

Read [FranklinCovey, Habit3: Put First Things First](https://www.franklincovey.com/courses/the-7-habits/habit-3/), particularly its four-quadrant explanation. The introduction paraphrases only the distinction between urgency and importance. Gardening names and placement follow this app’s code. It makes no quantified productivity or health claim and does not imply endorsement.

## Discovered data-loss bug and authorized fix

Reproduction on the initially empty real app:

1. Create sampleA in Plant, sampleB in Harvest and sampleC in the uncategorized inbox.
2. Open Plant’s category dialog.
3. Mark sampleA complete in that expanded list.
4. Previously, sampleB and sampleC disappear: the dialog passes its filtered subset into ToDoList, whose array-based setter replaces global state with just that subset.

The same mechanism affects add/delete inside the dialog. The user explicitly authorized fixing this issue and regression tests after it was reported by the coordinating agent.

Fix: clean `Modal.tsx` wraps category updates in the global functional state setter, calling `src/lib/category-tasks.ts`. The helper merges only the edited category into the latest whole archive, preserving other categories, inbox records, existing order and untouched object references. Existing category records are replaced/removed by ID; newly added records append. Cross-category input cannot overwrite an unrelated ID. No storage schema, application identifier or unrelated dirty source changes are included.

Seven tests in `scripts/test-category-tasks.mjs` transpile and import the actual production helper using the already-installed TypeScript dependency. They cover completion, addition, deletion, clearing a category, functional updates, unrelated records added after a visible snapshot, and cross-category ID safety.

## Other observed limits, kept out of app-fix scope

- Current keyboard category iteration follows object order Plant, Harvest, Dry, Thin; the displayed card digits put3/4 in a different order. The intro avoids documenting a misleading numeric mapping.
- The date preset’s ISO/local conversion can shift the displayed day/time. The intro asks users to review the displayed date and does not promise a specific preset timestamp. This is not changed by the category-preservation fix.
- No account sync, recurring task, notification or JSON backup UI is claimed.

## Validation

- Standard-library intro build generated both languages; local asset/link checker:2 pages, zero issues.
- `node --check site/demo.js` passed.
- `node --test scripts/test-category-tasks.mjs`:7/7 passed.
- Clean release archive/build and browser/mobile results recorded below after checks.

- Isolated clean-HEAD release build at `/tmp/routine-release-check` passed `next build`, including type/lint checks and static generation. The three unrelated dirty files were explicitly compared with `git show HEAD:<path>` in that checkout and excluded. Existing BackgroundProvider hook warnings and Browserslist age warning were unchanged.
- Real browser explainer states verified: Harvest, Plant, Dry and Thin all update the source icon/title/meaning together. EN and zh at390×844 each had scrollWidth390 / innerWidth390. Desktop and mobile screenshots visually reviewed; per-page device override cleared.
- Actual fixed-runtime category edit preservation is reserved for the coordinator’s post-deployment browser check on the existing denied-location origin, avoiding another permission prompt.
