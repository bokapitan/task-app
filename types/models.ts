import { Database } from "@/lib/database.types";

// 1. Add the Subtask definition manually
export type Subtask = {
  subtask_id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
};

// Database Models
// We use a trick here: we take the database row and JOIN it with an optional array of subtasks
export type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  subtasks?: Subtask[]; 
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Extended User type
export type User = Profile & {
  email: string;
  tasks_created: number;
};