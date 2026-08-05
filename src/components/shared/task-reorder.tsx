"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TaskReorderProps {
  items: string[];
  onReorder: (items: string[]) => void;
  renderItem: (id: string, index: number) => React.ReactNode;
}

export function TaskReorder({ items, onReorder, renderItem }: TaskReorderProps) {
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const newItems = [...items];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(index, 0, removed);
    onReorder(newItems);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="space-y-2">
      {items.map((id, index) => (
        <div
          key={id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          onDragEnd={handleDragEnd}
          className={cn(
            "cursor-grab rounded-lg border border-border/60 transition-all active:cursor-grabbing",
            dragIndex === index && "opacity-50",
            overIndex === index && "border-brand-500/50 bg-brand-500/5",
          )}
        >
          {renderItem(id, index)}
        </div>
      ))}
    </div>
  );
}
