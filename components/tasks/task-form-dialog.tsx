"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormValues } from "@/lib/validations/task";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createTaskAction, updateTaskAction } from "@/app/actions/tasks";
import { toast } from "sonner";
import { Task } from "./task-card";

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  onSuccess?: () => void;
}

export function TaskFormDialog({
  isOpen,
  onClose,
  taskToEdit,
  onSuccess,
}: TaskFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: TaskFormValues = {
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  useEffect(() => {
    if (taskToEdit) {
      const formattedDueDate = taskToEdit.dueDate
        ? new Date(taskToEdit.dueDate).toISOString().split("T")[0]
        : "";
      setValue("title", taskToEdit.title);
      setValue("description", taskToEdit.description || "");
      setValue("status", taskToEdit.status);
      setValue("priority", taskToEdit.priority);
      setValue("dueDate", formattedDueDate);
    } else {
      reset(defaultValues);
    }
  }, [taskToEdit, isOpen, setValue, reset]);

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      if (taskToEdit) {
        const res = await updateTaskAction(taskToEdit.id, data);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("Task updated successfully!");
          onSuccess?.();
          onClose();
        }
      } else {
        const res = await createTaskAction(data);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success("New task created!");
          onSuccess?.();
          onClose();
        }
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? "Edit Task" : "Create New Task"}
      description={
        taskToEdit
          ? "Update details for this task."
          : "Add a new task to your workspace."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
            Task Title *
          </label>
          <Input
            placeholder="e.g. Design homepage mockup"
            {...register("title")}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
            Description
          </label>
          <Textarea
            placeholder="Add relevant notes or sub-steps..."
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Status & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
              Status
            </label>
            <Select {...register("status")}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
              Priority
            </label>
            <Select {...register("priority")}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
            Due Date
          </label>
          <Input type="date" {...register("dueDate")} />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-cream-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {taskToEdit ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
