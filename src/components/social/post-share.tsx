"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Repeat, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPost } from "@/lib/actions/social";

interface PostShareProps {
  author: string;
  content: string;
}

export function PostShare({ author, content }: PostShareProps) {
  const [open, setOpen] = useState(false);
  const [shareContent, setShareContent] = useState("");
  const [posting, setPosting] = useState(false);

  const handleShare = async () => {
    const text = `Reposted from @${author}:\n\n"${content}"${shareContent ? `\n\n${shareContent}` : ""}`;
    setPosting(true);
    const result = await createPost(text);
    if (result.status === "success") {
      toast.success("Reposted!");
      setOpen(false);
      setShareContent("");
    } else {
      toast.error(result.message);
    }
    setPosting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-xs">
          <Repeat className="size-3" /> Repost
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share to your feed</DialogTitle>
          <DialogDescription>
            This post will be shared to your feed with attribution.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Reposted from @{author}:</span>
            <p className="mt-1 line-clamp-3">&ldquo;{content}&rdquo;</p>
          </div>
          <Textarea
            placeholder="Add your thoughts (optional)..."
            value={shareContent}
            onChange={(e) => setShareContent(e.target.value)}
            className="min-h-[60px] resize-none border-0 bg-muted/40 p-3 text-xs focus-visible:ring-1"
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" disabled={posting} onClick={handleShare}>
            {posting ? <Loader2 className="size-3 animate-spin mr-1" /> : <Repeat className="size-3 mr-1" />}
            {posting ? "Posting..." : "Repost"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
