"use client"; // Make this a client component for hooks
import { useDroppable } from "@dnd-kit/core"; // Import useDroppable
import { CATEGORY_META } from "@/utils/config";
import React, { useContext, useState, useCallback } from "react";
import { ToDoContext } from "@/context/todo-context";
import TaskChip from "./TaskChip";
import Modal from "./Modal";
import type { Task } from "@/types";

type Category = keyof typeof CATEGORY_META;

interface GridCardProps {
  categories: Category;
  description: string;
  detail: string;
  number: string;
}

function GridCard({ categories, description, detail, number }: GridCardProps) {
  const { tasks, setTasks } = useContext(ToDoContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const filteredTasks = tasks.filter((task) => task.category === categories);

  const categoryMeta = CATEGORY_META[categories];
  const colorName = categoryMeta.color; // e.g., 'red', 'green'

  // --- dnd-kit droppable setup ---
  const { isOver, setNodeRef } = useDroppable({
    id: categories, // Use category name as the droppable ID
  });
  // --- end droppable setup ---

  // Memoize the click handler
  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      // Prevent if event has already been processed
      if (e.isPropagationStopped() || e.defaultPrevented) {
        return;
      }

      // Stop propagation to prevent double triggers
      e.stopPropagation();

      // Only open modal if clicking directly on the card background
      // and not during drag operations
      const target = e.target as HTMLElement;
      const currentTarget = e.currentTarget as HTMLElement;

      if (target === currentTarget && !isOver) {
        setIsModalOpen(true);
      }
    },
    [isOver]
  );

  // Memoize task handlers
  const toggleTaskComplete = useCallback(
    (taskId: number) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, isCompleted: !task.isCompleted }
            : task
        )
      );
    },
    [setTasks]
  );

  // Close modal handler
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Generate Tailwind class names based on the color
  const bgColorClass = `bg-${colorName}-100`; // Light background
  const textColorClass = `text-${colorName}-700`; // Darker text for title

  // Slightly change appearance when a task is dragged over
  const dropZoneStyle = isOver ? ` scale-[1.02] bg-${colorName}-50` : "";

  return (
    <>
      <div
        ref={setNodeRef}
        className={`grid-card relative rounded-xl p-6 flex flex-col min-h-[180px] transition-all duration-300 cursor-pointer 
          ${bgColorClass} hover:shadow-md ${dropZoneStyle}`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick(e as any);
          }
        }}
      >
        <div
          className={`text-3xl font-bold mb-1 ${textColorClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          {categoryMeta.label}
        </div>
        <div
          className="text-base font-medium mb-1 text-gray-900"
          onClick={(e) => e.stopPropagation()}
        >
          {description}
        </div>
        <div
          className="text-xs text-gray-500 mb-2"
          onClick={(e) => e.stopPropagation()}
        >
          {detail}
        </div>
        {filteredTasks.length > 0 ? (
          <div
            className="flex gap-2 mt-2 mb-4 flex-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            {filteredTasks.map((task) => (
              <TaskChip
                key={task.id}
                task={task}
                compact
                onToggleComplete={toggleTaskComplete}
              />
            ))}
          </div>
        ) : (
          <div
            className={`flex items-center justify-center flex-1 text-${colorName}-400 text-sm italic`}
            onClick={(e) => e.stopPropagation()}
          >
            拖动任务到这里进行分类
          </div>
        )}
        <span
          className={`text-5xl absolute right-4 bottom-2 opacity-10 select-none ${textColorClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          {number}
        </span>
      </div>

      {/* Modal for category tasks */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        width="max-w-4xl"
        title={categoryMeta.label}
      >
        <div className="p-4">
          <CategoryTaskList
            tasks={filteredTasks}
            categoryId={categories}
            setTasks={setTasks}
          />
        </div>
      </Modal>
    </>
  );
}

// Component to display category tasks in a TodoList-like format
function CategoryTaskList({
  tasks,
  categoryId,
  setTasks,
}: {
  tasks: Task[];
  categoryId: keyof typeof CATEGORY_META;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const categoryMeta = CATEGORY_META[categoryId];
  const colorName = categoryMeta.color;

  function addTask() {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      category: categoryId,
      isCompleted: false,
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
  }

  function deleteTask(taskId: number) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  function toggleTaskComplete(taskId: number) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  }

  // Count completed tasks
  const completedCount = tasks.filter((task) => task.isCompleted).length;
  const completionPercentage =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="bg-white rounded-xl flex flex-col h-full">
      <div
        className={`sticky top-0 z-10 bg-white px-6 pt-6 pb-4 rounded-t-xl border-b border-gray-100`}
      >
        {/* Category information */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-3 h-3 rounded-full bg-${colorName}-500`}
              ></span>
              <h3 className={`text-lg font-bold text-${colorName}-700`}>
                {categoryMeta.label}
              </h3>
            </div>
            <p className="text-sm text-gray-500">{categoryMeta.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              {completedCount}/{tasks.length} 已完成
            </div>
            <div className="w-24 h-2 mt-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-${colorName}-500 transition-all duration-500 ease-out`}
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Add task form */}
        <div className="flex gap-3">
          <input
            type="text"
            className={`flex-1 px-6 py-3 rounded-lg bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-${colorName}-400 text-base transition-colors`}
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder={`添加新${categoryMeta.label}任务...`}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
          />
          <button
            className={`px-8 py-3 rounded-lg bg-${colorName}-500 text-white font-semibold hover:bg-${colorName}-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={addTask}
            disabled={!newTaskTitle.trim()}
          >
            添加
          </button>
        </div>
      </div>

      <div className="p-6 pt-4 flex-1">
        {tasks.length > 0 ? (
          <ul className="space-y-4">
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
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <p className="text-lg mb-2">此分类下还没有任务</p>
            <p className="text-sm italic">
              添加新任务或从待办事项拖动任务到这个分类
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GridCard;
