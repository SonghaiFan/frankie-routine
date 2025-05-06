"use client";
import { useContext, useEffect } from "react";
import TaskIndicator from "./TaskIndicator";
import { CATEGORY_META } from "@/utils/config";
import type { Task } from "../types";
import { ToDoContext } from "@/context/todo-context";
import { format, isToday, isTomorrow, isYesterday, isThisWeek } from "date-fns";
import { zhCN } from "date-fns/locale";
import DragHandle from "./DragHandle";
import { cn } from "@/lib/utils";
import React from "react";

interface TaskChipProps {
  task: Task;
  compact?: boolean;
  className?: string;
  onDelete?: (id: number) => void;
  onToggleComplete?: (id: number) => void;
  isDraggable?: boolean;
  isOverlay?: boolean;
  overId?: string | null;
}

// Helper function to format dates
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return `今天 ${format(date, "HH:mm")}`;
  } else if (isTomorrow(date)) {
    return `明天 ${format(date, "HH:mm")}`;
  } else if (isYesterday(date)) {
    return `昨天 ${format(date, "HH:mm")}`;
  } else if (isThisWeek(date)) {
    return format(date, "EEE HH:mm", { locale: zhCN });
  }

  return format(date, "MM月dd日 HH:mm", { locale: zhCN });
}

// Function to determine due date status
function getDueDateStatus(
  dueDate: number | undefined,
  isCompleted: boolean
): string {
  if (!dueDate || isCompleted) return "";

  const now = new Date();
  const due = new Date(dueDate);

  if (due < now) {
    return "overdue"; // Past due
  } else if (isToday(due)) {
    return "today"; // Due today
  } else if (isTomorrow(due)) {
    return "tomorrow"; // Due tomorrow
  }

  return "";
}

export default function TaskChip({
  task,
  compact = false,
  className = "",
  onDelete,
  onToggleComplete,
  isDraggable = true,
  isOverlay = false,
  overId = null,
}: TaskChipProps) {
  const { selectedTaskId, setSelectedTaskId } = useContext(ToDoContext);
  const categoryColor = task.category
    ? CATEGORY_META[task.category]?.color || "gray"
    : "gray";
  const isSelected = selectedTaskId === task.id;

  // If this is an overlay, use the overId to determine compact state
  const shouldBeCompact = isOverlay
    ? overId && !overId.startsWith("category-") && overId !== "todolist"
    : compact;

  const handleClick = (e: React.MouseEvent) => {
    setSelectedTaskId(isSelected ? null : task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(task.id);
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleComplete?.(task.id);
  };

  // Get due date status
  const dueDateStatus = getDueDateStatus(task.dueDate, task.isCompleted);

  // Determine overlay styles based on target area
  const overlayStyles = isOverlay
    ? (() => {
        // Over todolist: full width with right tilt
        if (overId === "todolist") {
          return "w-[600px] min-h-[64px] rotate-[2deg] bg-white/80";
        }
        // Over category-specific todolist: full width with no tilt
        else if (overId && overId.startsWith("category-")) {
          return "w-[600px] min-h-[64px] bg-white/80";
        }
        // Over a category card: compact with left tilt
        else if (overId) {
          return "scale-90 min-w-fit rotate-[-2deg] bg-white/90";
        }
        // Not over any droppable: standard appearance
        else {
          return "w-[600px] min-h-[64px] bg-white/60";
        }
      })()
    : "";

  // We need to still handle hiding the task when it's being dragged
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  // Track a timeout to automatically reset dragging state
  const dragTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Listen for drag events from the DragHandle component
  React.useEffect(() => {
    const handleDragStart = (e: CustomEvent) => {
      if (e.detail?.id === task.id) {
        // Clear any existing timeout
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }
        setIsDragging(true);
      }
    };

    const handleDragEnd = (e: CustomEvent) => {
      if (e.detail?.id === task.id) {
        // Set a short timeout before revealing the task again
        // This ensures the UI stays consistent during quick updates
        dragTimeoutRef.current = setTimeout(() => {
          setIsDragging(false);
        }, 100);
      }
    };

    window.addEventListener(
      "draghandle:start",
      handleDragStart as EventListener
    );
    window.addEventListener("draghandle:end", handleDragEnd as EventListener);

    return () => {
      // Clean up event listeners and any pending timeouts
      window.removeEventListener(
        "draghandle:start",
        handleDragStart as EventListener
      );
      window.removeEventListener(
        "draghandle:end",
        handleDragEnd as EventListener
      );
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, [task.id]);

  // Safety timeout: If a task is stuck in dragging state, reset after 3 seconds
  React.useEffect(() => {
    if (isDragging && !isOverlay) {
      const safetyTimeout = setTimeout(() => {
        setIsDragging(false);
      }, 3000);

      return () => clearTimeout(safetyTimeout);
    }
  }, [isDragging, isOverlay]);

  // If this task is being dragged and it's not the overlay version, hide it
  if (isDragging && !isOverlay) {
    return <div className="opacity-0 h-0 overflow-hidden"></div>;
  }

  const content = (
    <div
      ref={containerRef}
      onClick={handleClick}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (["Enter", " "].includes(e.key)) {
          e.preventDefault();
          handleClick(e as any);
        }
      }}
      className={cn(
        "flex items-center rounded-lg group relative",
        shouldBeCompact ? "px-3 py-2 min-h-[40px]" : "px-6 py-4 min-h-[64px]",
        className,
        `bg-${categoryColor}-50`,
        isSelected && `ring-2 ring-${categoryColor}-500 shadow-md`,
        !isOverlay && "hover:shadow-md hover:scale-[1.01]",
        isOverlay && "shadow-xl backdrop-blur-sm bg-opacity-90",
        overlayStyles,
        "transition-all duration-200 ease-in-out will-change-transform touch-none"
      )}
    >
      {isDraggable && !isOverlay && (
        <DragHandle
          id={task.id}
          data={{ task }}
          className="drag-handle opacity-0 group-hover:opacity-100 -ml-2 mr-2"
        />
      )}
      <div className="flex items-center flex-1 transition-all duration-200">
        <TaskIndicator
          category={task.category}
          isCompleted={task.isCompleted}
          className={cn(
            "group-hover:scale-110 transition-transform task-indicator",
            !shouldBeCompact && "mr-2"
          )}
          onClick={
            !isOverlay && onToggleComplete
              ? (e) => {
                  e.stopPropagation();
                  handleToggleComplete(e);
                }
              : undefined
          }
        />
        {!shouldBeCompact && (
          <>
            <div className="flex-1 flex flex-col">
              <span
                className={cn(
                  "text-base transition-colors",
                  task.isCompleted
                    ? "line-through text-gray-400"
                    : "text-gray-900"
                )}
              >
                {task.title}
              </span>
              <div className="flex items-center text-xs mt-1 space-x-3">
                {task.createdAt && (
                  <span className="text-gray-500 flex items-center">
                    <svg
                      className="w-3 h-3 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 8V12L15 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    {formatDate(task.createdAt)}
                  </span>
                )}
                {task.dueDate && (
                  <span
                    className={cn(
                      "flex items-center",
                      dueDateStatus === "overdue" && "text-red-500 font-medium",
                      dueDateStatus === "today" &&
                        "text-orange-500 font-medium",
                      dueDateStatus === "tomorrow" && "text-yellow-600",
                      !dueDateStatus && "text-gray-500"
                    )}
                  >
                    <svg
                      className="w-3 h-3 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M3 10H21"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 2L8 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M16 2L16 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    截止: {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
            {!isOverlay && onDelete && (
              <button
                onClick={handleDelete}
                className="ml-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                aria-label="删除任务"
              >
                ×
              </button>
            )}
          </>
        )}
        {shouldBeCompact && (
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 -translate-y-2",
              "bottom-full mb-2 bg-gray-900/90 text-white",
              "px-4 py-2.5 rounded-lg text-sm whitespace-nowrap",
              "shadow-xl backdrop-blur-md",
              isOverlay
                ? "opacity-100 scale-100 -translate-y-2"
                : "opacity-0 scale-90 -translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-2",
              "transition-all duration-300 ease-out z-50 pointer-events-none"
            )}
          >
            <div className="font-medium text-sm mb-0.5">{task.title}</div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              {task.category && (
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full bg-${categoryColor}-400`}
                  />
                  {CATEGORY_META[task.category].label}
                </span>
              )}
              {task.isCompleted && (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  已完成
                </span>
              )}
            </div>
            {task.dueDate && (
              <div
                className={cn(
                  "text-xs mt-1 flex items-center gap-1.5",
                  dueDateStatus === "overdue" ? "text-red-400" : "text-gray-300"
                )}
              >
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M8 2L8 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16 2L16 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                {dueDateStatus === "overdue" ? "已过期: " : "截止: "}
                {formatDate(task.dueDate)}
              </div>
            )}
            <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1">
              <div className="border-8 border-transparent border-t-gray-900/90" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return content;
}
