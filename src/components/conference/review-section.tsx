"use client";

import * as React from "react";
import { Star, PencilLine, Lock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isAuthConfigured } from "@/lib/public-env";
import { submitReview, deleteReview } from "@/lib/actions/conference";
import { cn } from "@/lib/utils";

export interface ReviewView {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  authorName: string | null;
  authorAvatar: string | null;
  canDelete: boolean;
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            size === "sm" ? "size-3.5" : "size-4",
            value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}

function RatingPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110"
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
        >
          <Star
            className={cn(
              "size-6",
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({
  conferenceId,
  reviews,
  average,
  count,
}: {
  conferenceId: string;
  reviews: ReviewView[];
  average: number;
  count: number;
}) {
  const router = useRouter();
  const [rating, setRating] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (rating === 0) {
      toast.error("Pick a star rating first.");
      return;
    }
    setSubmitting(true);
    const result = await submitReview(conferenceId, {
      rating,
      title: title.trim() || undefined,
      body: body.trim() || undefined,
    });
    setSubmitting(false);
    if (result.status === "success") {
      setRating(0);
      setTitle("");
      setBody("");
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message ?? "Could not submit your review.");
    }
  };

  const remove = async (reviewId: string) => {
    setDeleting(reviewId);
    const result = await deleteReview(conferenceId);
    setDeleting(null);
    if (result.status === "success") {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message ?? "Could not delete the review.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-6">
        <div className="text-center">
          <div className="text-5xl font-bold tracking-tight">
            {count > 0 ? average.toFixed(1) : "—"}
          </div>
          <div className="mt-1.5 flex justify-center">
            <Stars rating={Math.round(average)} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {count} review{count === 1 ? "" : "s"}
          </p>
        </div>
        <div className="h-16 w-px bg-border/60" />
        <div className="flex-1">
          <h3 className="font-semibold">What delegates are saying</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Reviews help other delegates find the right conference. We remove
            duplicates — each delegate can rate a conference once.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          {isAuthConfigured ? (
            <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="inline-flex items-center gap-1.5 font-semibold">
                  <PencilLine className="size-4" />
                  Write a review
                </h4>
                <RatingPicker value={rating} onChange={setRating} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="review-title" className="text-xs text-muted-foreground">
                  Short title
                </Label>
                <Input
                  id="review-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Incredible crisis committee"
                  maxLength={80}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="review-body" className="text-xs text-muted-foreground">
                  Your experience
                </Label>
                <Textarea
                  id="review-body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="What was the conference like? Committees, organization, awards, community…"
                  rows={4}
                  maxLength={1000}
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full rounded-full">
                {submitting ? "Publishing…" : "Publish review"}
              </Button>
            </form>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
              <Lock className="mt-0.5 size-4 shrink-0" />
              <p>
                <span className="font-medium text-foreground">Sign in to leave a review.</span>
                <br />
                Authentication is not configured in this environment.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              No reviews yet. Be the first delegate to share your experience.
            </div>
          ) : (
            reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={review.authorAvatar ?? ""} />
                      <AvatarFallback className="bg-brand-500/15 text-xs font-semibold text-brand-700 dark:text-brand-300">
                        {initials(review.authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-semibold">
                        {review.authorName ?? "Anonymous"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Stars rating={review.rating} size="sm" />
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {review.canDelete ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground"
                      disabled={deleting === review.id}
                      onClick={() => void remove(review.id)}
                    >
                      {deleting === review.id ? "Removing…" : "Delete"}
                    </Button>
                  ) : null}
                </div>
                {review.title ? (
                  <h5 className="mt-3 font-semibold">{review.title}</h5>
                ) : null}
                {review.body ? (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {review.body}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
