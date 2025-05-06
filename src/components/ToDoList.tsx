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

interface ToDoListProps {
  activeId?: number | null;
  overId?: string | number | null;
}

function ToDoList({ activeId, overId }: ToDoListProps) {
  const { tasks, setTasks } = useContext(ToDoContext);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const { setNodeRef, isOver } = useDroppable({ id: "todolist" });

  function addTask() {
    if (!newTaskTitle) return;
    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle,
      isCompleted: false,
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
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

  // Hide the dragged task if it's over a category card
  const uncategorizedTasks = tasks.filter((task) => {
    if (task.category !== undefined) return false;
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

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-xl flex flex-col h-full transition-all duration-300
        ${isOver ? "ring-4 ring-offset-2 ring-yellow-400 bg-yellow-50" : ""}`}
    >
      <div className="sticky top-0 z-10 bg-white p-8 pb-6 rounded-t-xl border-b border-gray-100">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">待办事项</h2>
        <div className="flex gap-3">
          <input
            type="text"
            className="flex-1 px-6 py-3 rounded-lg bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base transition-colors"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="添加新任务..."
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
          />
          <button
            className="px-8 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={addTask}
            disabled={!newTaskTitle.trim()}
          >
            添加
          </button>
        </div>
      </div>
      <div className="flex-1 p-8 pt-4">
        <SortableContext
          items={uncategorizedTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {uncategorizedTasks.length > 0 ? (
            <ul className="space-y-4">
              {uncategorizedTasks.map((task) => (
                <li
                  key={task.id}
                  className="relative flex items-center group rounded-lg touch-none"
                >
                  <TaskChip
                    task={task}
                    className="flex-1"
                    onDelete={deleteTask}
                    onToggleComplete={toggleTaskComplete}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <p className="text-lg mb-2">还没有待办事项</p>
              <p className="text-sm italic">
                添加新任务或从分类中拖动任务到这里
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
        {activeId != null
          ? (() => {
              const task = tasks.find((t) => t.id === activeId);
              if (!task) return null;
              return (
                <TaskChip
                  key={task.id}
                  task={task}
                  isOverlay
                  overCategoryId={typeof overId === "string" ? overId : null}
                  className="transform transition-all duration-200 scale-105"
                />
              );
            })()
          : null}
      </DragOverlay>
    </div>
  );
}

export default ToDoList;
