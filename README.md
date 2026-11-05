![Frankie Routine — current product banner](docs/readme/banner.png)

# Frankie Routine

A visual daily-task board with draggable categories and a to-do list, stored in the current browser.

## Features

- Create tasks and organize them between category cards and the to-do list.
- Rearrange tasks through drag and drop.
- Keep tasks and category preferences in local browser storage.

## Getting started

```sh
npm ci
npm run dev
```

Open the URL printed by Next.js (normally http://localhost:3000).

## Project notes

Built with Next.js, React, TypeScript, Tailwind CSS and dnd-kit. Current state is managed in `src/context/todo-context.tsx`; browser storage is specific to the current origin.

## Development

```sh
npm run build
```

Banner sources and update instructions: [README artwork](docs/readme/README.md).
