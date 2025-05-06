"use client"; // Make this a client component for hooks
import { useDroppable } from "@dnd-kit/core"; // Import useDroppable
import { CATEGORY_META } from "@/utils/config";
import React, { useContext, useState, useCallback } from "react";
import { ToDoContext } from "@/context/todo-context";
import TaskChip from "./TaskChip";
import Modal from "./Modal";

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
  // console.log(
  //   "GridCard droppable ID:",
  //   categories,
  //   "displaying tasks:",
  //   filteredTasks.length
  // );
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
  const bgColorClass = `bg-${colorName}-200`; // Light background
  const textColorClass = `text-${colorName}-700`; // Darker text for title

  // Slightly change appearance when a task is dragged over
  const dropZoneStyle = isOver
    ? ` scale-[1.02] bg-${colorName}-50 ring-4 ring-${colorName}-400`
    : "";

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
            className="flex gap-6 mt-4 mb-4 flex-wrap"
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
        category={categories}
        tasks={filteredTasks}
        setTasks={setTasks}
      />
    </>
  );
}

export default GridCard;
