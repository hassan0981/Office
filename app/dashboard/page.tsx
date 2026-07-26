"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, ListTodo, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCard, Task } from "@/components/tasks/task-card";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskStats } from "@/components/tasks/task-stats";
import { getTasksAction } from "@/app/actions/tasks";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Filters & Sorting state
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "createdAt">("createdAt");

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    const res = await getTasksAction(statusFilter, priorityFilter, sortBy);
    if (res?.tasks) {
      setTasks(res.tasks as Task[]);
    }
    setIsLoading(false);
  }, [statusFilter, priorityFilter, sortBy]);

  // Subscribe to real-time Task updates
  useEffect(() => {
    fetchTasks();

    const supabase = createClient();
    const channel = supabase
      .channel("live-tasks-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Task",
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  const handleOpenCreate = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-charcoal-900 sm:text-4xl">
            Task Dashboard
          </h1>
          <p className="mt-1 text-sm text-charcoal-500">
            Manage your daily tasks, set priorities, and track progress effortlessly.
          </p>
        </div>

        <Button onClick={handleOpenCreate} size="lg" className="gap-2 shadow-md">
          <Plus className="h-5 w-5 stroke-[2.5]" /> Create Task
        </Button>
      </div>

      {/* Stats Cards Overview */}
      <TaskStats tasks={tasks} />

      {/* Filters & Sorting Controls */}
      <TaskFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Tasks List Content */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-cream-300 bg-white/60 p-12 text-center backdrop-blur-sm"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-200 text-terracotta-500 mb-4">
            <ListTodo className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-charcoal-900">
            No tasks found
          </h3>
          <p className="mt-1 text-sm text-charcoal-500 max-w-sm">
            {statusFilter !== "ALL" || priorityFilter !== "ALL"
              ? "No tasks match your current filter selection. Try adjusting filters."
              : "You haven't created any tasks yet. Click below to add your first task."}
          </p>
          <Button onClick={handleOpenCreate} className="mt-6 gap-2">
            <Sparkles className="h-4 w-4" /> Create Your First Task
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenEdit}
                onTaskUpdated={fetchTasks}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      <TaskFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        taskToEdit={taskToEdit}
        onSuccess={fetchTasks}
      />
    </div>
  );
}
