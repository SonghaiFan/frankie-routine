"use client";
import React, { useState, useContext, useEffect } from "react";
import {
  DndContext,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import GridCard from "./GridCard";
import ToDoList from "./ToDoList";
import { CATEGORY_META } from "@/utils/config";
import { ToDoContext } from "@/context/todo-context";
import { BackgroundContext } from "@/context/background-context";
import Header from "./Header";

const ONBOARDING_KEY = "morningRoutineOnboarding";

function MainContent() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overId, setOverId] = useState<string | number | null>(null);
  const { tasks, setTasks, selectedTaskId, setSelectedTaskId } =
    useContext(ToDoContext);
  const { bgStyle } = useContext(BackgroundContext);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastMoveMessage, setLastMoveMessage] = useState("");

  // Configure sensors with delay
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200, // 100ms delay before drag starts
        tolerance: 20, // Allow 5px movement during delay
      },
    })
  );

  useEffect(() => {
    // Show tooltip only on first visit
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding) {
      setShowTooltip(true);
      localStorage.setItem(ONBOARDING_KEY, "true");
      // Auto-hide tooltip after 5 seconds
      const timer = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number);
    console.log("Drag started - Task ID:", event.active.id);
    // Prevent any clicks from happening during drag
    event.active.data.current = {
      ...event.active.data.current,
      ignoreClicks: true,
    };
  }

  function handleDragOver(event: DragOverEvent) {
    setOverId(event.over ? event.over.id : null);
    console.log("Dragging over:", event.over ? event.over.id : "nothing");
  }

  function handleDragEnd(event: any) {
    setActiveId(null);
    setOverId(null);
    console.log(
      "Drag ended - Active ID:",
      event.active.id,
      "Over ID:",
      event.over?.id
    );

    const { active, over } = event;
    if (!active || !over) {
      console.log("No active or over element in drag end");
      return;
    }

    const taskId = active.id as number;
    const overTarget = over.id;
    console.log("Task being moved:", taskId, "To target:", overTarget);

    // Handle dropping on a category grid
    if (
      typeof overTarget === "string" &&
      (Object.keys(CATEGORY_META) as string[]).includes(overTarget)
    ) {
      // Dropped on a category grid
      console.log("Moving task to category grid:", overTarget);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, category: overTarget as keyof typeof CATEGORY_META }
            : task
        )
      );
      return;
    }

    // Handle dropping on a category in todolist or todolist itself
    if (typeof overTarget === "string") {
      if (overTarget === "todolist") {
        // Dropped on the main todo list (uncategorize)
        console.log("Moving task to main todolist (removing category)");
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, category: undefined } : task
          )
        );
      } else if (overTarget.startsWith("category-")) {
        // Dropped on a category within a todolist
        const categoryName = overTarget.replace(
          "category-",
          ""
        ) as keyof typeof CATEGORY_META;
        console.log("Moving task to todolist category:", categoryName);
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, category: categoryName } : task
          )
        );
      }
    }
  }

  // Handle keyboard shortcuts for task movement
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only handle if a task is selected
      if (!selectedTaskId) return;

      const task = tasks.find((t) => t.id === selectedTaskId);
      if (!task) return;

      // Move task between categories with number keys 1-4
      if (["1", "2", "3", "4"].includes(e.key)) {
        const categories = Object.keys(CATEGORY_META);
        const targetCategory = categories[
          parseInt(e.key) - 1
        ] as keyof typeof CATEGORY_META;
        if (targetCategory) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === selectedTaskId ? { ...t, category: targetCategory } : t
            )
          );
          const categoryLabel = CATEGORY_META[targetCategory].label;
          setLastMoveMessage(`任务已移动到 ${categoryLabel}`);
          setTimeout(() => setLastMoveMessage(""), 2000);
        }
      }

      // Remove category with Escape key
      if (e.key === "Escape") {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === selectedTaskId ? { ...t, category: undefined } : t
          )
        );
        setLastMoveMessage("任务已移回待办事项");
        setTimeout(() => setLastMoveMessage(""), 2000);
      }

      // Deselect with Enter
      if (e.key === "Enter") {
        setSelectedTaskId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTaskId, tasks, setTasks, setSelectedTaskId]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen" style={bgStyle}>
        <div className="flex-shrink-0">
          <Header />
        </div>
        {showTooltip && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-yellow-300 text-black px-6 py-3 rounded-lg shadow-lg z-50">
            <p className="text-sm">
              点击选择任务，使用数字键 1-4 快速移动任务到不同区域！
            </p>
          </div>
        )}
        {lastMoveMessage && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up">
            {lastMoveMessage}
          </div>
        )}
        <div className="flex gap-8 px-8 pb-8 w-full max-w-[1600px] mx-auto flex-1 min-h-0">
          <div className="grid grid-cols-2 grid-rows-2 gap-6 flex-1 min-w-[600px] overflow-auto p-2 m-2">
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <GridCard
                key={key}
                categories={key as keyof typeof CATEGORY_META}
                description={meta.description}
                detail={meta.detail}
                number={meta.number}
              />
            ))}
          </div>
          <div className="w-[600px] min-w-[400px] flex-shrink-0 h-full pb-2">
            <ToDoList activeId={activeId} overId={overId} />
          </div>
        </div>
      </div>
    </DndContext>
  );
}

export { MainContent };
