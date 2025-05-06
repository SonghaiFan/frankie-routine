"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Task } from "@/types";
import { CATEGORY_META } from "@/utils/config";
import TaskChip from "./TaskChip";

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

  // For category task list
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [dateOption, setDateOption] = useState<string>("");

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

  // Helper functions for preset dates
  const getDateForOption = (option: string): string => {
    const date = new Date();
    let daysToAdd = 0;

    switch (option) {
      case "tonight":
        date.setHours(21, 0, 0, 0);
        break;
      case "tomorrow":
        date.setDate(date.getDate() + 1);
        date.setHours(9, 0, 0, 0);
        break;
      case "3days":
        daysToAdd = 3;
        break;
      case "1week":
        daysToAdd = 7;
        break;
      case "2weeks":
        daysToAdd = 14;
        break;
      case "1month":
        date.setMonth(date.getMonth() + 1);
        break;
      case "3months":
        date.setMonth(date.getMonth() + 3);
        break;
      default:
        return "";
    }

    if (daysToAdd > 0) {
      date.setDate(date.getDate() + daysToAdd);
      date.setHours(9, 0, 0, 0);
    }

    return date.toISOString().slice(0, 16);
  };

  // Handle preset date selection
  const handleDateSelection = (option: string) => {
    if (option === "none") {
      setDueDate("");
      setDateOption("");
    } else {
      const dateString = getDateForOption(option);
      setDueDate(dateString);
      setDateOption(option);
    }
  };

  // Category task list functions
  function addTask() {
    if (!setTasks || !category || !newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      category: category,
      isCompleted: false,
      createdAt: Date.now(),
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
    setDueDate("");
    setDateOption("");
  }

  function deleteTask(taskId: number) {
    if (!setTasks) return;
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  function toggleTaskComplete(taskId: number) {
    if (!setTasks) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  }

  // Calculate task stats
  const completedCount = tasks.filter((task) => task.isCompleted).length;
  const completionPercentage =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (!localOpen) return null;

  // Render category task list if category is provided, otherwise render children
  const renderContent = () => {
    if (category && setTasks) {
      const categoryMeta = CATEGORY_META[category];
      const colorName = categoryMeta.color;

      return (
        <>
          {/* Add task form */}
          <div className="flex flex-col gap-3 mb-6">
            <input
              type="text"
              className={`w-full px-4 py-2 rounded-lg bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-${colorName}-400 text-base transition-colors`}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder={`添加新${categoryMeta.label}任务...`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) addTask();
              }}
            />

            <div className="flex gap-2 items-center">
              <div className="flex flex-wrap gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => handleDateSelection("tonight")}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    dateOption === "tonight"
                      ? `bg-${colorName}-100 text-${colorName}-700`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  今晚
                </button>
                <button
                  type="button"
                  onClick={() => handleDateSelection("tomorrow")}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    dateOption === "tomorrow"
                      ? `bg-${colorName}-100 text-${colorName}-700`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  明天
                </button>
                <button
                  type="button"
                  onClick={() => handleDateSelection("3days")}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    dateOption === "3days"
                      ? `bg-${colorName}-100 text-${colorName}-700`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  后天
                </button>
                <button
                  type="button"
                  onClick={() => handleDateSelection("1week")}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    dateOption === "1week"
                      ? `bg-${colorName}-100 text-${colorName}-700`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  1周
                </button>
                <button
                  type="button"
                  onClick={() => handleDateSelection("2weeks")}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    dateOption === "2weeks"
                      ? `bg-${colorName}-100 text-${colorName}-700`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  2周
                </button>
                <button
                  type="button"
                  onClick={() => handleDateSelection("1month")}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    dateOption === "1month"
                      ? `bg-${colorName}-100 text-${colorName}-700`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  1月
                </button>
                <button
                  type="button"
                  onClick={() => handleDateSelection("3months")}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    dateOption === "3months"
                      ? `bg-${colorName}-100 text-${colorName}-700`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  3月
                </button>
              </div>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => handleDateSelection("none")}
                  className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                  title="清除日期"
                >
                  <svg
                    className="w-5 h-5"
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
              )}
              <button
                className={`px-4 py-2 rounded-lg bg-${colorName}-500 text-white font-medium hover:bg-${colorName}-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
                onClick={addTask}
                disabled={!newTaskTitle.trim()}
              >
                添加
              </button>
            </div>
          </div>

          {/* Tasks header */}
          {tasks.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-700">任务列表</h3>
              <div className="text-sm text-gray-500">
                {tasks.filter((t) => t.isCompleted).length}/{tasks.length}{" "}
                已完成
              </div>
            </div>
          )}

          {/* Task list */}
          {tasks.length > 0 ? (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="relative flex items-center group rounded-lg touch-none"
                >
                  <TaskChip
                    task={task}
                    className="flex-1"
                    onDelete={deleteTask}
                    onToggleComplete={toggleTaskComplete}
                    isDraggable={false}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <p className="text-lg mb-2">此分类下还没有任务</p>
              <p className="text-sm italic">
                添加新任务或从待办事项拖动任务到这个分类
              </p>
            </div>
          )}
        </>
      );
    }

    return children;
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
            <div className="flex items-center">
              <h2 className="text-xl font-medium text-gray-800">{title}</h2>
              {category && (
                <div className="ml-4 flex items-center">
                  <div className="text-sm font-medium text-gray-600 mr-2">
                    {completedCount}/{tasks.length} 已完成
                  </div>
                  <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        category
                          ? `bg-${CATEGORY_META[category].color}-500`
                          : "bg-blue-500"
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
          className="flex-1 overflow-y-auto p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
