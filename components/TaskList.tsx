import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TaskRow from "./TaskRow";
import { Task } from "@/types/models";

interface TaskListProps {
  tasks: Task[];
  onDelete: (taskId: string) => Promise<void>;
  onToggleComplete: (taskId: string, completed: boolean) => Promise<void>;
  // 👇 YOU ARE ADDING THIS LINE (The Contract)
  onToggleSubtask: (subtaskId: string, completed: boolean) => Promise<void>; 
}

// 👇 YOU ARE ADDING 'onToggleSubtask' TO THIS LIST OF ARGUMENTS
const TaskList = ({ tasks, onDelete, onToggleComplete, onToggleSubtask }: TaskListProps) => {
  return (
    <Table>
      {/* ... header code ... */}
      <TableBody>
        {tasks.map((task) => (
          <TaskRow
            key={task.task_id}
            task={task}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
            // 👇 AND YOU ARE ADDING THIS LINE (The Handoff)
            onToggleSubtask={onToggleSubtask} 
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default TaskList;
