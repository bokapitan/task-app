import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Edit, Trash2, ChevronDown, ChevronRight, Wand2 } from "lucide-react";
import { getLabelColors } from "@/lib/labels";
import { Task } from "@/types/models";

interface TaskRowProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  // 👇 YOU ARE ADDING THIS LINE (The Contract Update)
  onToggleSubtask: (subtaskId: string, completed: boolean) => void;
}

const TaskRow = ({ task, onDelete, onToggleComplete, onToggleSubtask }: TaskRowProps) => {

  // --- NEW: State to handle expanding the subtasks view ---
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const formatDate = (dateString: string) => {
    return dateString.split("T")[0];
  };

  return (
    <>
      {/* Main Task Row */}
      <TableRow className="hover:bg-muted/50">
        <TableCell className="py-2">
            <div className="flex items-center gap-2">
                {/* --- NEW: Expand Button (Only shows if subtasks exist) --- */}
                {hasSubtasks && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                )}
                {!hasSubtasks && <div className="w-6" />} {/* Spacer to keep alignment */}

                <Checkbox
                    checked={task.completed!}
                    onCheckedChange={(checked) =>
                    onToggleComplete(task.task_id, checked as boolean)
                    }
                />
            </div>
        </TableCell>
        <TableCell className="py-2">
          <Link
            href={`/task?id=${task.task_id}`}
            className="hover:underline font-medium"
          >
            {task.title}
          </Link>
          {/* --- NEW: Tiny indicator that AI helped --- */}
          {hasSubtasks && !isExpanded && (
            <span className="ml-2 text-xs text-muted-foreground flex items-center inline-flex gap-1">
                <Wand2 className="h-3 w-3" /> {task.subtasks?.length} subtasks
            </span>
          )}
        </TableCell>
        <TableCell className="py-2">
          {task.label && (
            <Badge
              variant="outline"
              className={[
                getLabelColors(task.label)["bg-color"],
                getLabelColors(task.label)["text-color"],
                getLabelColors(task.label)["border-color"],
              ].join(" ")}
            >
              {task.label}
            </Badge>
          )}
        </TableCell>
        <TableCell className="py-2 whitespace-nowrap">
          {task.due_date ? formatDate(task.due_date) : ""}
        </TableCell>
        <TableCell className="text-right py-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href={`/task?id=${task.task_id}`}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(task.task_id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </TableCell>
      </TableRow>

      {/* --- NEW: Expanded Subtasks Section --- */}
      {isExpanded && hasSubtasks && (
        <TableRow className="bg-muted/30">
            <TableCell colSpan={5} className="p-4 pl-12">
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                        <Wand2 className="h-3 w-3" /> AI Suggested Steps
                    </h4>
                    <ul className="space-y-2">
                        {task.subtasks?.map((subtask) => (
                            <li key={subtask.subtask_id} className="flex items-center text-sm gap-2 bg-background p-2 rounded border">
                                <Checkbox 
      id={subtask.subtask_id}
      checked={subtask.is_completed}
      // 👇 YOU ARE CONNECTING THE WIRE HERE
      onCheckedChange={(checked) => onToggleSubtask(subtask.subtask_id, checked as boolean)}
  />
                                <label 
                                    htmlFor={subtask.subtask_id}
                                    className={`cursor-pointer ${subtask.is_completed ? "line-through text-muted-foreground" : ""}`}
                                >
                                    {subtask.title}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default TaskRow;