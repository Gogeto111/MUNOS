"use client";

import { Flag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { countrySchema, type CountryInput } from "@/lib/validation/profile";
import type { CountryRepresented } from "@/generated/prisma/browser";
import { addCountry, deleteCountry } from "@/lib/actions/profile";
import { useServerAction } from "@/components/profile/use-server-action";
import { SectionCard } from "@/components/profile/section-card";
import { FormSubmitButton } from "@/components/profile/form-submit-button";
import { DeleteButton } from "@/components/profile/delete-button";
import { COUNTRIES } from "@/lib/constants";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_COUNTRY: CountryInput = {
  country: "",
  conferenceName: "",
  year: "",
};

export function CountriesManager({
  countries,
}: {
  countries: CountryRepresented[];
}) {
  const form = useForm<CountryInput>({
    resolver: zodResolver(countrySchema),
    defaultValues: EMPTY_COUNTRY,
  });

  const { isPending, run } = useServerAction(addCountry, form.setError);

  return (
    <SectionCard
      title="Countries represented"
      description="The delegations you have represented."
      icon={Flag}
    >
      <div className="space-y-4">
        {countries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No countries yet. Add your first delegation below.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border/70">
            {countries.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.country}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {[item.conferenceName, item.year]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <DeleteButton action={deleteCountry} id={item.id} />
              </li>
            ))}
          </ul>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              run(values).then((res) => {
                if (res.status === "success") form.reset(EMPTY_COUNTRY);
              }),
            )}
            className="space-y-4 rounded-lg border border-dashed border-border/70 p-4"
            noValidate
          >
            <p className="text-sm font-medium">Add a country</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <ScrollArea className="max-h-64">
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="conferenceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conference</FormLabel>
                    <FormControl>
                      <Input placeholder="MUNOSMUN 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2025"
                        min={1950}
                        max={2100}
                        {...field}
                      />
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
                onClick={() => form.reset(EMPTY_COUNTRY)}
                disabled={isPending}
              >
                Clear
              </Button>
              <FormSubmitButton isPending={isPending} label="Add country" />
            </div>
          </form>
        </Form>
      </div>
    </SectionCard>
  );
}
