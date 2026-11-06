import type { Task } from "../types";

type Category = NonNullable<Task["category"]>;
type CategoryChange = Task[] | ((tasks: Task[]) => Task[]);

/** Apply a category-list edit without replacing other categories or the inbox. */
export function applyCategoryTaskChange(
  current: Task[],
  category: Category,
  change: CategoryChange
): Task[] {
  const subset = current.filter((task) => task.category === category);
  const changed = typeof change === "function" ? change(subset) : change;
  const next = changed.filter((task) => task.category === category);
  const nextById = new Map(next.map((task) => [task.id, task]));
  const existingIds = new Set(current.map((task) => task.id));
  const result: Task[] = [];

  // Keep existing order and untouched task objects, replacing only this category.
  for (const task of current) {
    if (task.category !== category) {
      result.push(task);
    } else {
      const replacement = nextById.get(task.id);
      if (replacement) result.push(replacement);
    }
  }
  for (const task of next) {
    if (!existingIds.has(task.id)) result.push(task);
  }
  return result;
}
