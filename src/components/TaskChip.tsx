"use client";
import { useContext } from "react";
import { useDraggable } from "@dnd-kit/core";
import TaskIndicator from "./TaskIndicator";
import { CATEGORY_META } from "@/utils/config";
import type { Task } from "../types";
import { ToDoContext } from "@/context/todo-context";
import { format, isToday, isTomorrow, isYesterday, isThisWeek } from "date-fns";
import { zhCN } from "date-fns/locale";

type DraggableResult = ReturnType<typeof useDraggable> & {
  isDelayed?: boolean;
};

interface TaskChipProps {
  task: Task;
  compact?: boolean;
  className?: string;
  onDelete?: (id: number) => void;
  onToggleComplete?: (id: number) => void;
  isDraggable?: boolean;
  isOverlay?: boolean;
  overCategoryId?: string | null;
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
  overCategoryId = null,
}: TaskChipProps) {
  const { selectedTaskId, setSelectedTaskId } = useContext(ToDoContext);
  const categoryColor = CATEGORY_META[task.category!]?.color || "gray";
  const isSelected = selectedTaskId === task.id;

  // If this is an overlay, use the overCategoryId to determine compact state
  const shouldBeCompact = isOverlay ? !!overCategoryId : compact;

  // Setup draggable functionality
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    isDragging,
    isDelayed,
  }: DraggableResult = useDraggable({
    id: task.id,
    data: { task },
  });

  const handleClick = (e: React.MouseEvent) => {
    if (!isDelayed) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedTaskId(isSelected ? null : task.id);
    }
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

  // Handle all pointer events to prevent bubbling
  const preventBubbling = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  // If this is the original dragging item, make it invisible but keep its space
  if (isDraggable && isDragging && !isOverlay) {
    return <div ref={setNodeRef} className="invisible" />;
  }

  const style =
    isDraggable && !isOverlay
      ? {
          transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
          transition: "all 0.2s ease",
        }
      : {};

  // Determine overlay styles based on target area
  const overlayStyles = isOverlay
    ? overCategoryId
      ? "scale-90 min-w-[200px] rotate-[-2deg]" // Over category: compact with tilt
      : "w-[600px] min-h-[64px] rotate-[2deg]" // Over todo list: full width with opposite tilt
    : "";

  // Get due date status
  const dueDateStatus = getDueDateStatus(task.dueDate, task.isCompleted);

  const content = (
    <>
      <TaskIndicator
        category={task.category}
        isCompleted={task.isCompleted}
        className={`${
          shouldBeCompact ? "" : "mr-2"
        } group-hover:scale-110 transition-transform`}
        onClick={
          !isOverlay && onToggleComplete ? handleToggleComplete : undefined
        }
      />
      {!shouldBeCompact && (
        <>
          <div className="flex-1 flex flex-col">
            <span
              className={`text-base transition-colors ${
                task.isCompleted
                  ? "line-through text-gray-400"
                  : "text-gray-900"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {task.title}
            </span>
            <div
              className="flex items-center text-xs mt-1 space-x-3"
              onClick={(e) => e.stopPropagation()}
            >
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
                  className={`flex items-center
                    ${
                      dueDateStatus === "overdue"
                        ? "text-red-500 font-medium"
                        : ""
                    }
                    ${
                      dueDateStatus === "today"
                        ? "text-orange-500 font-medium"
                        : ""
                    }
                    ${dueDateStatus === "tomorrow" ? "text-yellow-600" : ""}
                    ${!dueDateStatus ? "text-gray-500" : ""}
                  `}
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
          className={`
            absolute left-1/2 -translate-x-1/2 -translate-y-2 
            bottom-full mb-2 bg-gray-900/90 text-white 
            px-4 py-2.5 rounded-lg text-sm whitespace-nowrap 
            shadow-xl backdrop-blur-md
            opacity-0 scale-90 -translate-y-1
            group-hover:opacity-100 group-hover:scale-100 group-hover:-translate-y-2
            transition-all duration-300 ease-out
            z-50
          `}
          onClick={(e) => e.stopPropagation()}
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
              className={`text-xs mt-1 flex items-center gap-1.5
              ${dueDateStatus === "overdue" ? "text-red-400" : "text-gray-300"}
            `}
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
    </>
  );

  const containerProps = {
    role: "button",
    tabIndex: 0,
    onClick: handleClick,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (["Enter", " "].includes(e.key)) {
        e.preventDefault();
        handleClick(e as any);
      }
    },
    // Add more event handlers to prevent bubbling
    onMouseDown: preventBubbling,
    onMouseUp: preventBubbling,
    onTouchStart: preventBubbling,
    onTouchEnd: preventBubbling,
    className: `
      flex items-center rounded-lg group relative
      ${shouldBeCompact ? "px-3 py-2 min-h-[40px]" : "px-6 py-4 min-h-[64px]"}
      ${className}
      bg-${categoryColor}-50
      ${isSelected ? `ring-2 ring-${categoryColor}-500 shadow-md` : ""}
      ${isDragging ? "opacity-60" : "hover:shadow-md hover:scale-[1.01]"}
      ${isDelayed ? "scale-105 shadow-lg cursor-grabbing" : "cursor-pointer"}
      ${isOverlay ? "shadow-xl backdrop-blur-sm bg-opacity-90" : ""}
      ${overlayStyles}
      transition-all duration-200 ease-in-out will-change-transform
    `,
  };

  return isDraggable && !isOverlay ? (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      {...containerProps}
    >
      {content}
    </div>
  ) : (
    <div {...containerProps}>{content}</div>
  );
}
