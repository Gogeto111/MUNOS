"use client";

import { useState } from "react";
import { ListTodo, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskInputSchema, type TaskInput } from "@/lib/validation/workspace";
import { createTask, deleteTask, updateTask } from "@/lib/actions/workspace";
import type { WorkspaceTask, TaskStatus } from "@/generated/prisma/browser";
import {
  isTaskOverdue,
  taskPriorityLabel,
  toDateInputValue,
} from "@/lib/workspace";
import { TASK_PRIORITIES } from "@/components/workspace/status-options";
import { formatDate } from "@/lib/format";
import { useServerAction } from "@/components/profile/use-server-action";
import { FormSubmitButton } from "@/components/profile/form-submit-button";
import { DeleteButton } from "@/components/profile/delete-button";
import { SectionCard } from "@/components/profile/section-card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TASK_TEMPLATES = [
  { label: "GSL Speech", title: "Draft GSL speech", description: "Write and rehearse a 60-90 second General Speakers List speech.", priority: "HIGH" as const },
  { label: "Position Paper", title: "Write position paper", description: "Draft a 1-2 page position paper covering country stance and proposed solutions.", priority: "HIGH" as const },
  { label: "Research Dossier", title: "Research agenda topic", description: "Complete research dossier with country position, evidence, and POI bank.", priority: "MEDIUM" as const },
  { label: "POI Practice", title: "Prepare POIs", description: "Draft 5-10 Points of Information for opposing arguments.", priority: "MEDIUM" as const },
  { label: "Resolution Draft", title: "Draft resolution clauses", description: "Write preambulatory and operative clauses for a draft resolution.", priority: "MEDIUM" as const },
  { label: "Bloc Strategy", title: "Plan bloc strategy", description: "Identify allies, draft working paper, and plan coalition building.", priority: "LOW" as const },
];

const EMPTY_TASK: TaskInput = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueAt: "",
};

const PRIORITY_VARIANT: Record<string, "outline" | "secondary" | "default" | "destructive"> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "default",
  URGENT: "destructive",
};

export function TasksPanel({
  workspaceId,
  tasks,
}: {
  workspaceId: string;
  tasks: WorkspaceTask[];
}) {
  const form = useForm<TaskInput>({
    resolver: zodResolver(taskInputSchema),
    defaultValues: EMPTY_TASK,
  });
  const { isPending, run } = useServerAction(
    (values) => createTask(workspaceId, values),
    form.setError,
  );

  const sorted = [...tasks].sort((a, b) => {
    const statusRank: Record<TaskStatus, number> = { DONE: 3, IN_PROGRESS: 1, TODO: 2 };
    if (statusRank[a.status] !== statusRank[b.status]) {
      return statusRank[a.status] - statusRank[b.status];
    }
    if (a.dueAt && b.dueAt) return a.dueAt.getTime() - b.dueAt.getTime();
    if (a.dueAt) return -1;
    if (b.dueAt) return 1;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  const handleToggle = (task: WorkspaceTask, done: boolean) => {
    void updateTask(workspaceId, task.id, {
      title: task.title,
      description: task.description ?? "",
      status: done ? "DONE" : "TODO",
      priority: task.priority,
      dueAt: task.dueAt ? toDateInputValue(task.dueAt) : "",
    });
  };

  const handleStatusChange = (task: WorkspaceTask, status: TaskStatus) => {
    void updateTask(workspaceId, task.id, {
      title: task.title,
      description: task.description ?? "",
      status,
      priority: task.priority,
      dueAt: task.dueAt ? toDateInputValue(task.dueAt) : "",
    });
  };

  return (
    <SectionCard title="Tasks" description="Prep work for this conference." icon={ListTodo}>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              run(values).then((res) => {
                if (res.status === "success") form.reset(EMPTY_TASK);
              }),
            )}
            className="space-y-4 rounded-lg border border-dashed border-border/70 p-4"
            noValidate
          >
            <p className="text-sm font-medium">Add a task</p>
            <div className="flex flex-wrap gap-1.5">
              {TASK_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => {
                    form.setValue("title", t.title);
                    form.setValue("description", t.description);
                    form.setValue("priority", t.priority);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Zap className="size-2.5" />
                  {t.label}
                </button>
              ))}
            </div>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Draft opening speech" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_PRIORITIES.map((key) => (
                            <SelectItem key={key} value={key}>
                              {taskPriorityLabel(key)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Optional details…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <FormSubmitButton isPending={isPending} label="Add task" />
            </div>
          </form>
        </Form>

        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks yet. Add your first one.
          </p>
        ) : (
          <ul className="divide-y divide-border/70 rounded-lg border border-border/70">
            {sorted.map((task) => {
              const overdue = task.dueAt ? isTaskOverdue(task.dueAt, task.status) : false;
              return (
                <li
                  key={task.id}
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3",
                    task.status === "DONE" && "opacity-60",
                  )}
                >
                  <Checkbox
                    checked={task.status === "DONE"}
                    onCheckedChange={(checked) => handleToggle(task, Boolean(checked))}
                    className="mt-0.5"
                    aria-label="Mark done"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        task.status === "DONE" && "line-through",
                      )}
                    >
                      {task.title}
                    </p>
                    {task.description ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{task.description}</p>
                    ) : null}
                    {task.dueAt ? (
                      <p
                        className={cn(
                          "mt-1 text-xs",
                          overdue ? "font-medium text-destructive" : "text-muted-foreground",
                        )}
                      >
                        Due {formatDate(task.dueAt)}
                        {overdue ? " · overdue" : ""}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={PRIORITY_VARIANT[task.priority]} className="capitalize">
                      {taskPriorityLabel(task.priority)}
                    </Badge>
                    <Select
                      value={task.status}
                      onValueChange={(value) => handleStatusChange(task, value as TaskStatus)}
                    >
                      <SelectTrigger size="sm" className="w-28" aria-label="Task status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <DeleteButton
                      action={(id) => deleteTask(workspaceId, id)}
                      id={task.id}
                      className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
