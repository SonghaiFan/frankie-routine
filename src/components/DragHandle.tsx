"use client";

import { useDraggable } from "@dnd-kit/core";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface DragHandleProps {
  id: number | string;
  data?: any;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

type DraggableResult = ReturnType<typeof useDraggable> & {
  isDelayed?: boolean;
};

const DragHandle = forwardRef<HTMLDivElement, DragHandleProps>(
  ({ id, data, className, disabled = false, children }, ref) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      isDragging,
      isDelayed,
    }: DraggableResult = useDraggable({
      id,
      data,
    });

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={cn(
          "cursor-grab touch-none select-none w-0 group-hover:w-6",
          "overflow-hidden transition-all duration-200",
          isDragging && "cursor-grabbing",
          isDelayed && "scale-105",
          disabled && "pointer-events-none opacity-50",
          className
        )}
      >
        {children || (
          <div className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 transition-colors">
            <svg
              className="w-4 h-4 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 6H16M8 12H16M8 18H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>
    );
  }
);

DragHandle.displayName = "DragHandle";

export default DragHandle;
