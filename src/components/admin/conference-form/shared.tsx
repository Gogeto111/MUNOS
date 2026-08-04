"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Control, FieldPath } from "react-hook-form";
import type { ConferenceDraftFormValues } from "@/lib/validation/conference";

export type DraftPath = FieldPath<ConferenceDraftFormValues>;

export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      {subtitle ? <p className="mb-4 mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Grid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}

function RequiredMark({ required }: { required?: boolean }) {
  if (!required) return null;
  return <span className="ml-0.5 text-destructive">*</span>;
}

export function TextField({
  control,
  name,
  label,
  required,
  placeholder,
  type,
  className,
  normalize,
  maxLength,
  min,
  step,
}: {
  control: Control<ConferenceDraftFormValues>;
  name: DraftPath;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  className?: string;
  normalize?: (value: string) => string;
  maxLength?: number;
  min?: string | number;
  step?: string | number;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            <RequiredMark required={required} />
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              maxLength={maxLength}
              min={min}
              step={step}
              {...field}
              value={field.value as string}
              onChange={(e) => field.onChange(normalize ? normalize(e.target.value) : e.target.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function TextareaField({
  control,
  name,
  label,
  required,
  placeholder,
  rows,
  className,
}: {
  control: Control<ConferenceDraftFormValues>;
  name: DraftPath;
  label: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            <RequiredMark required={required} />
          </FormLabel>
          <FormControl>
            <Textarea rows={rows} placeholder={placeholder} {...field} value={field.value as string} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SelectField({
  control,
  name,
  label,
  required,
  options,
  placeholder,
  className,
  triggerClassName,
}: {
  control: Control<ConferenceDraftFormValues>;
  name: DraftPath;
  label: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            <RequiredMark required={required} />
          </FormLabel>
          <Select onValueChange={field.onChange} value={field.value as string} disabled={field.disabled}>
            <FormControl>
              <SelectTrigger className={triggerClassName}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SwitchField({
  control,
  name,
  label,
}: {
  control: Control<ConferenceDraftFormValues>;
  name: DraftPath;
  label: string;
}) {
  const id = `switch-${name.replace(/\./g, "-")}`;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
          <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
            {label}
          </Label>
          <Switch id={id} checked={field.value as boolean} onCheckedChange={field.onChange} />
        </div>
      )}
    />
  );
}
