"use client";

import PropTypes from "prop-types";
import { CATEGORY_META } from "@/utils/config";
import type { Task } from "../types";

interface TaskIndicatorProps {
  category?: Task["category"];
  isCompleted: boolean;
  className?: string;
  title?: string;
  onClick?: (e: React.MouseEvent) => void;
}

function TaskIndicator({
  category,
  isCompleted,
  className = "",
  title,
  onClick,
}: TaskIndicatorProps) {
  // Defensive: only use CATEGORY_META if category is valid
  let colorName = "gray";
  if (category && CATEGORY_META[category as keyof typeof CATEGORY_META]) {
    colorName = CATEGORY_META[category as keyof typeof CATEGORY_META].color;
  }

  const baseClasses = "w-5 h-5 rounded-full inline-block transition-all";
  const borderClass = `border-2 border-${colorName}-500`;
  const backgroundClass = isCompleted
    ? `bg-${colorName}-500`
    : "bg-transparent hover:bg-${colorName}-50";
  const cursorClass = onClick ? "cursor-pointer" : "";

  // Complete event handler for all types of interactions
  const handleInteraction = (e: React.SyntheticEvent) => {
    if (onClick && e.type === "click") {
      e.preventDefault();
      e.stopPropagation();
      onClick(e as React.MouseEvent);
    } else {
      // Always stop propagation for other events
      e.stopPropagation();
    }
  };

  return (
    <button
      type="button"
      className={`${baseClasses} ${borderClass} ${backgroundClass} ${cursorClass} ${className}`}
      title={title || (isCompleted ? "标记为未完成" : "标记为已完成")}
      onClick={handleInteraction}
      onMouseDown={handleInteraction}
      onMouseUp={handleInteraction}
      onTouchStart={handleInteraction}
      onTouchEnd={handleInteraction}
      disabled={!onClick}
    >
      <span className="sr-only">
        {category ? category : "Uncategorized"} task indicator{" "}
        {isCompleted ? "(completed)" : "(incomplete)"}
      </span>
      {isCompleted && (
        <svg
          className="w-3 h-3 text-white mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
  );
}

TaskIndicator.propTypes = {
  isCompleted: PropTypes.bool.isRequired,
  className: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default TaskIndicator;
