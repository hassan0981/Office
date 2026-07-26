"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Edit3, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Task } from "@/components/tasks/task-card";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { getTaskByIdAction, deleteTaskAction, toggleTaskStatusAction } from "@/app/actions/tasks";
import { Status, Priority } from "@prisma/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    setIsLoading(true);
    const res = await getTaskByIdAction(taskId);
    if (res?.task) {
      setTask(res.task as Task);
    } else {
      toast.error("Task not found");
      router.push("/dashboard");
    }
    setIsLoading(false);
  }, [taskId, router]);

  // Subscribe to real-time updates for this specific Task
  useEffect(() => {
    fetchTask();

    const supabase = createClient();
    const channel = supabase
      .channel(`task-detail-${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Task",
          filter: `id=eq.${taskId}`,
        },
        (payload) => {
          console.log("Realtime Task detail event received:", payload);
          if (payload.eventType === "DELETE") {
            toast.info("This task was deleted by another session.");
            router.push("/dashboard");
          } else {
            fetchTask();
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime Task detail channel status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId, fetchTask, router]);

  const handleStatusToggle = async (newStatus: Status) => {
    if (!task) return;
    const res = await toggleTaskStatusAction(task.id, newStatus);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(`Task status updated to ${newStatus}`);
      fetchTask();
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setIsDeleting(true);
    const res = await deleteTaskAction(task.id);
    setIsDeleting(false);
    setIsDeleteOpen(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Task deleted");
      router.push("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
      {/* Back button */}
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2 text-charcoal-600">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-cream-300 bg-white/90 p-6 sm:p-8 shadow-warm-lg"
      >
        {/* Top Badges & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-cream-200 pb-6">
          <div className="flex items-center gap-3">
            {task.status === "TODO" && <Badge variant="todo">To Do</Badge>}
            {task.status === "IN_PROGRESS" && <Badge variant="inProgress">In Progress</Badge>}
            {task.status === "DONE" && <Badge variant="done">Done</Badge>}

            {task.priority === "LOW" && <Badge variant="low">Low Priority</Badge>}
            {task.priority === "MEDIUM" && <Badge variant="medium">Medium Priority</Badge>}
            {task.priority === "HIGH" && <Badge variant="high">High Priority</Badge>}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="gap-2">
              <Edit3 className="h-4 w-4" /> Edit Task
            </Button>
            <Button variant="danger" size="sm" onClick={() => setIsDeleteOpen(true)} className="gap-2">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-6 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            {task.title}
          </h1>

          <div className="prose max-w-none text-charcoal-700 bg-cream-50/70 p-5 rounded-2xl border border-cream-200 min-h-[120px]">
            {task.description ? (
              <p className="whitespace-pre-wrap leading-relaxed">{task.description}</p>
            ) : (
              <p className="italic text-charcoal-400">No detailed description provided for this task.</p>
            )}
          </div>
        </div>

        {/* Status Dropdown Quick Update */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-cream-200 bg-cream-100/50 p-4">
          <span className="text-sm font-semibold text-charcoal-800">
            Change Task Status:
          </span>
          <select
            value={task.status}
            onChange={(e) => handleStatusToggle(e.target.value as Status)}
            className="rounded-xl border border-cream-300 bg-white px-4 py-2 text-sm font-medium text-charcoal-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500 cursor-pointer"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Metadata Footer */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal-500 pt-4 border-t border-cream-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-terracotta-500" />
            <span>Due Date: <strong>{formatDate(task.dueDate)}</strong></span>
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            <Clock className="h-4 w-4 text-charcoal-400" />
            <span>Created: <strong>{formatDate(task.createdAt)}</strong></span>
          </div>
        </div>
      </motion.div>

      {/* Edit Form Dialog */}
      <TaskFormDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        taskToEdit={task}
        onSuccess={fetchTask}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
      >
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            Confirm Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
