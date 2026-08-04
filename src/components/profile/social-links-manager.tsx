"use client";

import { Link2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { socialLinkSchema, type SocialLinkInput } from "@/lib/validation/profile";
import type { SocialLink } from "@/generated/prisma/browser";
import { addSocialLink, deleteSocialLink } from "@/lib/actions/profile";
import { useServerAction } from "@/components/profile/use-server-action";
import { SectionCard } from "@/components/profile/section-card";
import { FormSubmitButton } from "@/components/profile/form-submit-button";
import { DeleteButton } from "@/components/profile/delete-button";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_LINK: SocialLinkInput = {
  platform: "LINKEDIN",
  url: "",
};

export function SocialLinksManager({ links }: { links: SocialLink[] }) {
  const form = useForm<SocialLinkInput>({
    resolver: zodResolver(socialLinkSchema),
    defaultValues: EMPTY_LINK,
  });

  const { isPending, run } = useServerAction(addSocialLink, form.setError);

  return (
    <SectionCard
      title="Social links"
      description="Links shown on your public portfolio."
      icon={Link2}
    >
      <div className="space-y-4">
        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No links yet. Add one below.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border/70">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    {link.platform}
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm text-foreground underline-offset-4 hover:underline"
                  >
                    {link.url}
                  </a>
                </div>
                <DeleteButton action={deleteSocialLink} id={link.id} />
              </li>
            ))}
          </ul>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              run(values).then((res) => {
                if (res.status === "success") form.reset(EMPTY_LINK);
              }),
            )}
            className="space-y-4 rounded-lg border border-dashed border-border/70 p-4"
            noValidate
          >
            <p className="text-sm font-medium">Add a link</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                className="mr-2"
                onClick={() => form.reset(EMPTY_LINK)}
                disabled={isPending}
              >
                Clear
              </Button>
              <FormSubmitButton isPending={isPending} label="Add link" />
            </div>
          </form>
        </Form>
      </div>
    </SectionCard>
  );
}
