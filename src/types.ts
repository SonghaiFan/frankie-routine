export interface Task {
  id: number;
  title: string;
  category?: "plant" | "harvest" | "thin" | "dry";
  isCompleted: boolean;
  createdAt: number; // Timestamp when the task was created
  dueDate?: number; // Optional timestamp for when the task is due
}
