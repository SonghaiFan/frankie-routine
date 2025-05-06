"use client";
import React, { useState, useContext } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ToDoContext } from "@/context/todo-context";
import TaskChip from "./TaskChip";
import { useDroppable, DragOverlay } from "@dnd-kit/core";
import type { Task } from "../types";
import { defaultDropAnimationSideEffects } from "@dnd-kit/core";
import { CATEGORY_META } from "@/utils/config";

interface ToDoListProps {
  activeId?: number | null;
  overId?: string | number | null;
  category?: keyof typeof CATEGORY_META;
  customTasks?: Task[];
  customSetTasks?: React.Dispatch<React.SetStateAction<Task[]>>;
  showAddTaskForm?: boolean;
  showTitle?: boolean;
}

function ToDoList({
  activeId,
  overId,
  category,
  customTasks,
  customSetTasks,
  showAddTaskForm = true,
  showTitle = true,
}: ToDoListProps) {
  const contextValue = useContext(ToDoContext);

  // Use either the custom tasks/setTasks if provided, or the context values
  const tasks = customTasks || contextValue.tasks;
  const setTasks = customSetTasks || contextValue.setTasks;

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [dateOption, setDateOption] = useState<string>("");

  // Set the proper droppable ID
  const droppableId = category ? `category-${category}` : "todolist";
  // console.log("ToDoList droppable ID:", droppableId, "category:", category);
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

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

  function addTask() {
    if (!newTaskTitle) return;
    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      isCompleted: false,
      createdAt: Date.now(),
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      ...(category && { category }),
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setDueDate("");
    setDateOption("");
  }

  function deleteTask(taskId: number) {
    setTasks(tasks.filter((task) => task.id !== taskId));
  }

  function toggleTaskComplete(taskId: number) {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  }

  // Filter tasks based on category if provided
  const filteredTasks = category
    ? tasks.filter((task) => task.category === category)
    : tasks.filter((task) => task.category === undefined);

  // Hide the dragged task if it's over a category card
  const displayedTasks = filteredTasks.filter((task) => {
    if (
      activeId &&
      overId &&
      typeof overId === "string" &&
      task.id === activeId
    ) {
      return false;
    }
    return true;
  });

  // Determine color for styling based on category
  const colorName = category ? CATEGORY_META[category].color : "yellow";

  // Get task stats for category view
  const completedCount = filteredTasks.filter(
    (task) => task.isCompleted
  ).length;

  // Find the active task for the overlay
  const activeTask = activeId
    ? tasks.find((task) => task.id === activeId)
    : null;

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-xl flex flex-col h-full transition-all duration-300 overflow-hidden
        ${
          isOver
            ? `ring-4 ring-offset-2 ring-${colorName}-400 bg-${colorName}-50`
            : ""
        }`}
    >
      {showAddTaskForm && (
        <div className="sticky top-0 z-10 bg-white p-8 pb-6 rounded-t-xl border-b border-gray-100 flex-shrink-0">
          {showTitle && (
            <h2 className="text-2xl font-bold mb-8 text-gray-900">待办事项</h2>
          )}
          <div className="flex flex-col space-y-3">
            <input
              type="text"
              className={`w-full px-6 py-3 rounded-lg bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-${colorName}-400 text-base transition-colors`}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder={`添加新${
                category ? CATEGORY_META[category].label : ""
              }任务...`}
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
                      ? `bg-${colorName}-200`
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
                      ? `bg-${colorName}-200`
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
                      ? `bg-${colorName}-200`
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
                      ? `bg-${colorName}-200`
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
                      ? `bg-${colorName}-200`
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
                      ? `bg-${colorName}-200`
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
                      ? `bg-${colorName}-200`
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
                className={`px-8 py-2 rounded-lg ${
                  category
                    ? `bg-${colorName}-500 hover:bg-${colorName}-600`
                    : "bg-black hover:bg-gray-800"
                } text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0`}
                onClick={addTask}
                disabled={!newTaskTitle.trim()}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 p-8 pt-4 overflow-y-auto min-h-0">
        {!showTitle && displayedTasks.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700">任务列表</h3>
            <div className="text-sm text-gray-500">
              {completedCount}/{displayedTasks.length} 已完成
            </div>
          </div>
        )}
        <SortableContext
          items={displayedTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {displayedTasks.length > 0 ? (
            <ul className="space-y-4">
              {displayedTasks.map((task) => (
                <li
                  key={task.id}
                  className="relative flex items-center group rounded-lg touch-none"
                >
                  <TaskChip
                    task={task}
                    className="flex-1"
                    onDelete={deleteTask}
                    onToggleComplete={toggleTaskComplete}
                    isDraggable={true}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <p className="text-lg mb-2">
                {category ? "此分类下还没有任务" : "还没有待办事项"}
              </p>
              <p className="text-sm italic">
                {category
                  ? "添加新任务或从待办事项拖动任务到这个分类"
                  : "添加新任务或从分类中拖动任务到这里"}
              </p>
            </div>
          )}
        </SortableContext>
      </div>
      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.5",
              },
            },
          }),
        }}
      >
        {activeTask && (
          <TaskChip
            key={activeTask.id}
            task={activeTask}
            isOverlay
            overId={typeof overId === "string" ? overId : null}
            className="transform transition-all duration-200 scale-105"
          />
        )}
      </DragOverlay>
    </div>
  );
}

export default ToDoList;
