"use client";

import { Filter, ArrowUpDown } from "lucide-react";
import { Select } from "@/components/ui/select";

interface TaskFiltersProps {
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  sortBy: "dueDate" | "priority" | "createdAt";
  setSortBy: (val: "dueDate" | "priority" | "createdAt") => void;
}

export function TaskFilters({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-cream-300/80 bg-white/70 p-4 shadow-warm backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charcoal-500">
        <Filter className="h-4 w-4 text-terracotta-500" />
        <span>Filter & Sort Tasks</span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
        {/* Status Filter */}
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 py-1 text-xs"
        >
          <option value="ALL">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </Select>

        {/* Priority Filter */}
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-9 py-1 text-xs"
        >
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </Select>

        {/* Sort By */}
        <Select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "dueDate" | "priority" | "createdAt")
          }
          className="h-9 py-1 text-xs"
        >
          <option value="createdAt">Newest First</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">High Priority</option>
        </Select>
      </div>
    </div>
  );
}
