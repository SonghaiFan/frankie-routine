"use client"; // Provider needs to be a client component for useState/useEffect/localStorage

import React, { createContext, useState, useEffect, ReactNode } from "react";
import type { Task } from "@/types";

const LOCAL_STORAGE_KEY_TASKS = "morningRoutineTasks";
const LOCAL_STORAGE_KEY_CATEGORY = "morningRoutineSelectedCategory";

type Category = "播种" | "收割" | "疏苗" | "风干";

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
    console.error(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
}

export function ToDoProvider({ children }: { children: ReactNode }) {
  // --- Initialize state with default values ONLY ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>("播种");
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
    const storedCategory = safelyGetStoredValue<Category>(
      LOCAL_STORAGE_KEY_CATEGORY,
      "播种"
    );
    setTasks(storedTasks);
    setSelectedCategory(storedCategory);
  }, []); // Empty dependency array ensures this runs only once on mount
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
        `Error setting localStorage key “${LOCAL_STORAGE_KEY_TASKS}”:`,
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
        `Error setting localStorage key “${LOCAL_STORAGE_KEY_CATEGORY}”:`,
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
