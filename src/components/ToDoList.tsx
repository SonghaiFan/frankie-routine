"use client";
import React, { useState, useRef, useEffect } from "react";
import { categoriesToColorClass } from "@/utils/config";

interface Task {
  id: number;
  title: string;
  category: "播种" | "收割" | "疏苗" | "风干";
  isEditing: boolean;
  isCompleted: boolean;
}

const ToDoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<
    "播种" | "收割" | "疏苗" | "风干"
  >("播种");
  console.log("tasks", tasks);

  const addTask = () => {
    if (newTaskTitle) {
      const newTask: Task = {
        id: Date.now(), // simple unique ID
        title: newTaskTitle,
        category: newTaskCategory,
        isEditing: false,
        isCompleted: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
    }
  };

  const deleteTask = (taskId: number) => {
    const newTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(newTasks);
  };

  const toggleEdit = (taskId: number) => {
    const newTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, isEditing: !task.isEditing } : task
    );
    setTasks(newTasks);
  };

  const updateTask = (taskId: number, title: string) => {
    if (!title) {
      deleteTask(taskId);
      return;
    }

    const newTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, title } : task
    );
    setTasks(newTasks);
  };

  const toggleCompletion = (taskId: number) => {
    const newTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    );
    setTasks(newTasks);
  };

  return (
    <div className="p-4 pt-0 border-2 border-gray-300 rounded-lg shadow-lg max-h-full overflow-auto">
      <div className="sticky top-0 z-10 bg-white p-4">
        <h2 className="text-xl font-bold mb-4">待办事项</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add new task"
          />
          <select
            className="p-2 border border-gray-300"
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
          >
            <option value="播种">播种</option>
            <option value="收割">收割</option>
            <option value="疏苗">疏苗</option>
            <option value="风干">风干</option>
          </select>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={addTask}
          >
            Add Task
          </button>
        </div>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className={`p-2 rounded mb-2`}>
            <div className="flex items-center gap-2">
              {task.isEditing ? (
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 h-10 "
                  value={task.title}
                  onChange={(e) => updateTask(task.id, e.target.value)}
                  onBlur={() => toggleEdit(task.id)}
                  autoFocus
                />
              ) : (
                <div
                  className={`flex items-center text-${
                    task.isCompleted
                      ? "gray-500"
                      : categoriesToColorClass[task.category]
                  } h-10`}
                >
                  <button
                    className={`px-3 py-1 rounded`}
                    onClick={() => toggleCompletion(task.id)}
                  >
                    {task.isCompleted ? "◎" : "◉"}
                  </button>
                  <div
                    className={`${
                      task.isCompleted ? "line-through text-gray-500" : ""
                    }`}
                    onClick={() => toggleEdit(task.id)}
                  >
                    {task.title}
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ToDoList;
