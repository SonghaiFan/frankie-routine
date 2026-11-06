# Routine introduction maintenance / Routine 介绍页维护

The introduction is an independent English-first static page, with Chinese at `zh/`. It uses the real app’s daytime blue wash, white rounded panels, and red/green/gray/blue category semantics. It does not request geolocation, read app storage, or load the Next.js app.

介绍页独立构建；英文在根目录，中文在 `zh/`。沿用真实应用的日间蓝色背景、白色圆角卡片与分类颜色，不请求位置，也不读取任务存储。

## Content and actual rules / 内容与真实规则

- Edit both languages in `site/content.json`. Keep labels and feature claims aligned with released code rather than README summaries.
- `src/utils/config.ts` owns the four category labels, icon paths and descriptions. `site/build.py` reads them directly and copies `public/{plant,harvest,dry,thin}.png` into the output. Update the explanatory translations in `content.json` if these meanings change.
- `site/demo.js` is an explicitly unsaved two-question explainer. It chooses a source-defined category; it is not the full task board, a saved task editor or an automatic priority judgement.
- `ToDoList.tsx`, `TaskChip.tsx`, `GridCard.tsx` and `Modal.tsx` own actual task interactions. No title editor, notification scheduler, recurring-task engine, account sync or JSON backup is currently exposed. Do not add those claims based on the product name.
- Deadline shortcuts attach dates. Verify the date shown by the actual task before documenting a specific preset time; the existing timezone conversion is not changed by this intro work.
- `BackgroundProvider` in `src/context/background-context.tsx` requests location for external sunrise/sunset data and uses a default location if denied. A changing backdrop does not imply reminders or a timer.

更新双语内容时核对实际行为，不把名称中的“一小时”写成计时器，也不暗示支持每日重复任务或提醒。

## Screenshot replacement map / 截图替换表

| Asset | Replace when | Owning UI |
| --- | --- | --- |
| `site/assets/board-current.png` | Board layout, category copy, header or sky changes | `Header.tsx`, `MainContent.tsx`, `GridCard.tsx`, `background-context.tsx` |
| `site/assets/tasks-current.png` | Compact markers, inbox, completion or task controls change | `TaskChip.tsx`, `TaskIndicator.tsx`, `ToDoList.tsx` |
| `site/assets/category-current.png` | Expanded list, add form or completion summary changes | `Modal.tsx`, `ToDoList.tsx` |
| `public/plant.png`, `harvest.png`, `dry.png`, `thin.png` | Botanical marks change | `CATEGORY_META` icon paths |
| `docs/readme/banner.png` | Approved banner is refreshed | Copied to `media/banner.png` for Open Graph |
| `docs/readme/assets/frankie.svg` | Approved signature changes | Intro header |

All three new screenshots are real captures of the released application, using an initially empty browser archive and clearly labelled `Sample:` tasks. No private task content is included. The hero uses a CSS crop of the full screenshot; do not replace it with a simulated board. The app’s compact markers reveal titles on hover. Keep full source images and adjust `.hero-screen img` crop if the layout changes.

使用真实、稳定后的界面，录入明确标为 Sample 的无隐私示例。不要读取或覆盖已有个人任务。若浏览器出现位置权限提示，由用户处理，介绍页采集不需要同意定位。调整 CSS 裁切，不重绘假界面。

## Category update safety / 分类更新的安全性

`src/lib/category-tasks.ts` applies a category-list change to the latest whole task array. `Modal.tsx` uses it through a functional React state update. Other categories and uncategorized tasks must retain their values and references. When changing the dialog or task setter, run:

```sh
node --test scripts/test-category-tasks.mjs
```

The tests exercise actual production code for completion, add, deletion, empty categories, functional updates and unrelated concurrent records. Also use three harmless tasks in different places in the real browser: complete/add/delete inside one category and verify the other category plus inbox remain intact after each action and reload.

分类内操作必须保留其他分类与未分类任务。改动状态更新方式时，运行回归测试，并在真实浏览器使用无隐私的跨分类示例验证。

## Build and verify / 构建与检查

```sh
python3 site/build.py --out _site
python3 -m http.server 8080 --bind 127.0.0.1 --directory _site
node --check site/demo.js
```

Open `/` and `/zh/` on desktop and at 390px width. Try all four important/urgent combinations, check the correct name/icon/explanation appears, and verify all images after scrolling. Check keyboard focus, readable contrast, one-line desktop navigation and no horizontal overflow. The intro’s fixed daylight theme matches one real app state; it does not simulate location-based sky calculations.

## Release separation / 区分本次改动与其他代码

Only commit reviewed introduction files and explicit task-preservation fix files. Three unrelated pre-existing working edits existed during this audit: `src/app/layout.tsx`, `src/components/MainContent.tsx`, `src/context/todo-context.tsx`. They were read for context but left byte-for-byte intact. The production app fix is verified in an isolated clean `HEAD` archive with only reviewed files overlaid; do not deploy a local working directory that silently includes those edits.

Pages uses `.github/workflows/pages.yml` and watches site files plus the actual category/icon sources. Push `main` to publish the introduction. App deployment is separate; confirm its Vercel release before claiming a runtime bug fixed online. Never commit environment files or private browser data.
