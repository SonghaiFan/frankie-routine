"use client";
import { ToDoProvider } from "@/context/todo-context";
import { MainContent } from "@/components/MainContent";

export default function Home() {
  return (
    <ToDoProvider>
      <MainContent />
    </ToDoProvider>
  );
}
