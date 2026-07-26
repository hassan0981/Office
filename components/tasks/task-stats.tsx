"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, ListTodo, Flame } from "lucide-react";
import { Task } from "./task-card";

interface TaskStatsProps {
  tasks: Task[];
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === "TODO").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const done = tasks.filter((t) => t.status === "DONE").length;

  const stats = [
    {
      title: "Total Tasks",
      count: total,
      icon: ListTodo,
      color: "text-charcoal-700",
      bg: "bg-cream-200/80",
    },
    {
      title: "To Do",
      count: todo,
      icon: Clock,
      color: "text-charcoal-600",
      bg: "bg-cream-300/50",
    },
    {
      title: "In Progress",
      count: inProgress,
      icon: Flame,
      color: "text-amber-700",
      bg: "bg-amber-100/80",
    },
    {
      title: "Completed",
      count: done,
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-100/80",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className="flex items-center gap-3.5 rounded-2xl border border-cream-300/70 bg-white/80 p-4 shadow-warm backdrop-blur-sm"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal-400">
                {stat.title}
              </p>
              <h4 className="text-2xl font-bold text-charcoal-900 tracking-tight">
                {stat.count}
              </h4>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
