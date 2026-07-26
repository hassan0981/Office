"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Trash2, Edit3, CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Status, Priority } from "@prisma/client";
import { toggleTaskStatusAction, deleteTaskAction } from "@/app/actions/tasks";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SignatureModal } from "@/components/tasks/signature-modal";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: Status;
  priority: Priority;
  dueDate?: string | Date | null;
  sketch?: string | null;
  signature?: string | null;
  createdAt: string | Date;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onTaskUpdated?: () => void;
}

export function TaskCard({ task, onEdit, onTaskUpdated }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusToggle = async (newStatus: Status) => {
    if (newStatus === "DONE" && !task.signature) {
      setIsSignatureOpen(true);
      return;
    }

    setIsUpdatingStatus(true);
    const res = await toggleTaskStatusAction(task.id, newStatus);
    setIsUpdatingStatus(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
      
      // Broadcast realtime change
      const supabase = createClient();
      supabase.channel("live-tasks-channel").send({
        type: "broadcast",
        event: "task-changed",
        payload: { action: "update", id: task.id }
      });

      onTaskUpdated?.();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteTaskAction(task.id);
    setIsDeleting(false);
    setIsDeleteOpen(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Task deleted");
      
      // Broadcast realtime change
      const supabase = createClient();
      supabase.channel("live-tasks-channel").send({
        type: "broadcast",
        event: "task-changed",
        payload: { action: "delete", id: task.id }
      });

      onTaskUpdated?.();
    }
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "TODO":
        return <Badge variant="todo">To Do</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="inProgress">In Progress</Badge>;
      case "DONE":
        return <Badge variant="done">Done</Badge>;
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case "LOW":
        return <Badge variant="low">Low Priority</Badge>;
      case "MEDIUM":
        return <Badge variant="medium">Medium Priority</Badge>;
      case "HIGH":
        return <Badge variant="high">High Priority</Badge>;
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="group relative rounded-2xl border border-cream-300/80 bg-white/80 p-5 shadow-warm backdrop-blur-sm transition-all duration-300 hover:border-terracotta-300/60 hover:shadow-warm-md"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Main info & Title */}
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            {/* Quick status check toggle */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() =>
                handleStatusToggle(
                  task.status === "DONE" ? "TODO" : "DONE"
                )
              }
              disabled={isUpdatingStatus}
              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border transition-all ${
                task.status === "DONE"
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-cream-400 bg-cream-50 hover:border-terracotta-500 text-transparent"
              }`}
            >
              <CheckCircle2 className="h-4 w-4 stroke-[3]" />
            </motion.button>

            <div className="flex-1 min-w-0">
              <Link href={`/dashboard/tasks/${task.id}`}>
                <h3
                  className={`text-base font-semibold tracking-tight transition-colors group-hover:text-terracotta-600 ${
                    task.status === "DONE"
                      ? "line-through text-charcoal-400"
                      : "text-charcoal-900"
                  }`}
                >
                  {task.title}
                </h3>
              </Link>

              {task.description && (
                <p className="mt-1 text-sm text-charcoal-500 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Badges & Meta info */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}

                {task.dueDate && (
                  <span className="inline-flex items-center gap-1 text-charcoal-400 ml-1">
                    <Calendar className="h-3.5 w-3.5 text-terracotta-500" />
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions & Status Dropdown */}
          <div className="flex items-center justify-between sm:justify-end gap-2 border-t border-cream-200/60 pt-3 sm:border-t-0 sm:pt-0">
            {/* Status change select */}
            <select
              value={task.status}
              onChange={(e) => handleStatusToggle(e.target.value as Status)}
              disabled={isUpdatingStatus}
              className="rounded-lg border border-cream-300 bg-cream-50 px-2.5 py-1 text-xs font-medium text-charcoal-700 hover:border-cream-400 focus:outline-none focus:ring-1 focus:ring-terracotta-500 cursor-pointer"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task)}
                className="h-8 w-8 text-charcoal-400 hover:text-charcoal-800"
              >
                <Edit3 className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleteOpen(true)}
                className="h-8 w-8 text-charcoal-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
      >
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setIsDeleteOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Confirm Delete
          </Button>
        </div>
      </Dialog>

      {/* Signature Completion Modal */}
      <SignatureModal
        isOpen={isSignatureOpen}
        onClose={() => setIsSignatureOpen(false)}
        taskId={task.id}
        taskTitle={task.title}
        onSuccess={onTaskUpdated}
      />
    </>
  );
}
