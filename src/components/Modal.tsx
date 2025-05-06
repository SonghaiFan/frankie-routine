"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Task } from "@/types";
import { CATEGORY_META } from "@/utils/config";
import ToDoList from "./ToDoList";
import Image from "next/image";
import { getIconFilter } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  width?: string;
  category?: keyof typeof CATEGORY_META;
  tasks?: Task[];
  setTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  width = "max-w-3xl",
  category,
  tasks = [],
  setTasks,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [localOpen, setLocalOpen] = useState(false);

  // Sync local state with prop
  useEffect(() => {
    if (isOpen) {
      setLocalOpen(true);
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
      // Animation timing
      setTimeout(() => setIsAnimating(false), 300);
    } else if (localOpen) {
      setIsAnimating(true);
      // Wait for animation before removing from DOM
      const timer = setTimeout(() => {
        setLocalOpen(false);
        document.body.style.overflow = "";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, localOpen]);

  // Memoize handlers
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isAnimating) {
        onClose();
      }
    },
    [onClose, isAnimating]
  );

  // Set up escape key listener
  useEffect(() => {
    if (localOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [localOpen, handleEsc]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if clicking the backdrop itself and not during animation
      if (e.target === e.currentTarget && !isAnimating) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    },
    [onClose, isAnimating]
  );

  // Calculate task stats
  const completedCount = tasks.filter((task) => task.isCompleted).length;
  const completionPercentage =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (!localOpen) return null;

  // Render category task list if category is provided, otherwise render children
  const renderContent = () => {
    if (category && setTasks) {
      return (
        <ToDoList
          category={category}
          customTasks={tasks}
          customSetTasks={setTasks}
          showAddTaskForm={true}
          showTitle={false}
        />
      );
    }

    return children;
  };

  // Get color name for styling
  const colorName = category ? CATEGORY_META[category].color : "gray";
  // Icon styling with color filter
  const iconStyle = {
    filter: category ? getIconFilter(colorName) : "none",
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300"
      onClick={handleBackdropClick}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(5px)",
        opacity: isAnimating && !isOpen ? 0 : 1,
      }}
    >
      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-lg ${width} w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300
          ${isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {title ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {category && (
                  <div className={`text-${colorName}-500`}>
                    <Image
                      src={CATEGORY_META[category].icon}
                      alt={CATEGORY_META[category].label}
                      width={24}
                      height={24}
                      className="mr-1"
                      style={iconStyle}
                    />
                  </div>
                )}
                <h2 className="text-xl font-medium text-gray-800">{title}</h2>
              </div>
              {category && (
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-gray-600">
                    {completedCount}/{tasks.length} 已完成
                  </div>
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        category
                          ? `bg-${CATEGORY_META[category].color}-500`
                          : "bg-gray-500"
                      } transition-all duration-500 ease-out`}
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div />
          )}
          <button
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isAnimating) {
                onClose();
              }
            }}
            aria-label="关闭"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div
          className="flex-1 p-6 overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
