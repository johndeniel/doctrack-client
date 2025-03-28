import { createContext } from "react";
import type { Task } from "@/lib/types";

// Create a context for tasks with an empty array and a dummy setter function as default values
export const TasksContext = createContext<{
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}>({
  tasks: [],
  setTasks: () => {},
});
