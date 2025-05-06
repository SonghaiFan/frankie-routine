export interface Task {
  id: number;
  title: string;
  category?: "播种" | "收割" | "疏苗" | "风干";
  isCompleted: boolean;
}
