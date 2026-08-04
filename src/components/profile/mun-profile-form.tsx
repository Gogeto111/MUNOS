"use client";

import { Globe2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { munProfileSchema, type MunProfileInput } from "@/lib/validation/profile";
import type { CurrentUser } from "@/lib/auth";
import { updateMunProfile } from "@/lib/actions/profile";
import { useServerAction } from "@/components/profile/use-server-action";
import { SectionCard } from "@/components/profile/section-card";
import { FormSubmitButton } from "@/components/profile/form-submit-button";
import { EXPERIENCE_LEVELS } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MunProfileForm({ user }: { user: CurrentUser }) {
  const form = useForm<MunProfileInput>({
    resolver: zodResolver(munProfileSchema),
    defaultValues: {
      experienceLevel: user.munProfile?.experienceLevel ?? "BEGINNER",
      munsAttended: String(user.munProfile?.munsAttended ?? 0),
      awardsWon: String(user.munProfile?.awardsWon ?? 0),
    },
  });

  const { isPending, run } = useServerAction(updateMunProfile, form.setError);

  return (
    <SectionCard
      title="MUN profile"
      description="Your experience and stats as a delegate."
      icon={Globe2}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => run(values))}
          className="space-y-6"
          noValidate
        >
          <FormField
            control={form.control}
            name="experienceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="munsAttended"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MUNs attended</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormDescription>Total conferences attended.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="awardsWon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Awards won</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <FormSubmitButton isPending={isPending} label="Save MUN profile" />
          </div>
        </form>
      </Form>
    </SectionCard>
  );
}
