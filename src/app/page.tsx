"use client";
import { ToDoProvider } from "@/context/todo-context";
import { BackgroundProvider } from "@/context/background-context";
import { MainContent } from "@/components/MainContent";

export default function Home() {
  return (
    <BackgroundProvider>
      <ToDoProvider>
        <MainContent />
      </ToDoProvider>
    </BackgroundProvider>
  );
}
