import { createContext } from "react"
import type { Task } from "@/lib/types"

export const TasksContext = createContext<{
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}>({
  tasks: [],
  setTasks: () => {},
})