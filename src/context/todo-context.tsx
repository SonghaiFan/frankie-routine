"use client"; // Provider needs to be a client component for useState/useEffect/localStorage

import React, { createContext, useState, useEffect, ReactNode } from "react";
import type { Task } from "@/types";

const LOCAL_STORAGE_KEY_TASKS = "morningRoutineTasks";
const LOCAL_STORAGE_KEY_CATEGORY = "morningRoutineSelectedCategory";

type Category = "plant" | "harvest" | "thin" | "dry";

interface ToDoContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  selectedCategory: Category;
  setSelectedCategory: React.Dispatch<React.SetStateAction<Category>>;
  selectedTaskId: number | null;
  setSelectedTaskId: React.Dispatch<React.SetStateAction<number | null>>;
}

export const ToDoContext = createContext<ToDoContextType>(
  {} as ToDoContextType
);

// Keep the helper, but it won't be used for useState initial value anymore
function safelyGetStoredValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function ToDoProvider({ children }: { children: ReactNode }) {
  // --- Initialize state with default values ONLY ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>("plant");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  // --- End default initialization ---

  const [isMounted, setIsMounted] = useState(false); // Track mount status

  // --- Effect to load state from localStorage AFTER mount ---
  useEffect(() => {
    setIsMounted(true); // Component has mounted
    const storedTasks = safelyGetStoredValue<Task[]>(
      LOCAL_STORAGE_KEY_TASKS,
      []
    );

    // Map old Chinese category names to new English names if needed
    const updatedTasks = storedTasks.map((task) => {
      if (!task.category) return task;

      const categoryMap: Record<string, Category> = {
        播种: "plant",
        收割: "harvest",
        疏苗: "thin",
        风干: "dry",
      };

      return {
        ...task,
        category: (categoryMap[task.category] as Category) || task.category,
      };
    });

    const storedCategory = safelyGetStoredValue<string>(
      LOCAL_STORAGE_KEY_CATEGORY,
      "plant"
    );

    // Map old Chinese category names to new English names
    const categoryMap: Record<string, Category> = {
      播种: "plant",
      收割: "harvest",
      疏苗: "thin",
      风干: "dry",
    };

    const updatedCategory = categoryMap[storedCategory] || "plant";

    setTasks(updatedTasks);
    setSelectedCategory(updatedCategory as Category);
  }, []);
  // --- End load effect ---

  // --- Effects to SAVE state to localStorage ---
  useEffect(() => {
    // Only save if mounted and state is not the initial default
    if (!isMounted) return;
    try {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY_TASKS,
        JSON.stringify(tasks)
      );
    } catch (error) {
      console.error(
        `Error setting localStorage key "${LOCAL_STORAGE_KEY_TASKS}":`,
        error
      );
    }
  }, [tasks, isMounted]);

  useEffect(() => {
    // Only save if mounted and state is not the initial default
    if (!isMounted) return;
    try {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY_CATEGORY,
        JSON.stringify(selectedCategory)
      );
    } catch (error) {
      console.error(
        `Error setting localStorage key "${LOCAL_STORAGE_KEY_CATEGORY}":`,
        error
      );
    }
  }, [selectedCategory, isMounted]);
  // --- End save effects ---

  // Prevent rendering children until state is loaded from localStorage
  // This avoids flashing default content before persisted state applies
  if (!isMounted) {
    return null; // Or a loading indicator
  }

  return (
    <ToDoContext.Provider
      value={{
        tasks,
        setTasks,
        selectedCategory,
        setSelectedCategory,
        selectedTaskId,
        setSelectedTaskId,
      }}
    >
      {children}
    </ToDoContext.Provider>
  );
}
