export interface Task {
  id: number;
  title: string;
  category?: "播种" | "收割" | "疏苗" | "风干";
  isCompleted: boolean;
  createdAt: number; // Timestamp when the task was created
  dueDate?: number; // Optional timestamp for when the task is due
}
