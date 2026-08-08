"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { addComment, listComments, deleteComment } from "@/lib/actions/comments";

interface Comment {
  id: string;
  content: string;
  author: string;
  initials: string;
  userId: string;
  createdAt: string;
}

interface PostCommentsProps {
  postId: string;
  currentUserId?: string;
}

export function PostComments({ postId, currentUserId }: PostCommentsProps) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadComments = async () => {
    if (loaded) return;
    setLoading(true);
    const result = await listComments(postId);
    if (result.status === "success" && result.data) {
      setComments(result.data);
      setCommentCount(result.data.length);
      setLoaded(true);
    }
    setLoading(false);
  };

  const toggleExpand = () => {
    if (!expanded && !loaded) {
      loadComments();
    }
    setExpanded(!expanded);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    const result = await addComment(postId, newComment.trim());
    if (result.status === "success" && result.data) {
      setNewComment("");
      const listResult = await listComments(postId);
      if (listResult.status === "success" && listResult.data) {
        setComments(listResult.data);
        setCommentCount(listResult.data.length);
      }
      toast.success("Comment added.");
    } else {
      toast.error(result.message);
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const result = await deleteComment(commentId);
    if (result.status === "success") {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentCount((prev) => prev - 1);
      toast.success("Comment deleted.");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="mt-2 border-t pt-2">
      <button
        onClick={toggleExpand}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageSquare className="size-3" />
        {commentCount > 0 ? `${commentCount} comment${commentCount === 1 ? "" : "s"}` : "Add a comment"}
        {expanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {loading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                <div className="grid size-7 shrink-0 place-items-center rounded-full bg-muted/60 text-[10px] font-bold">
                  {comment.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{comment.author}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    {currentUserId && comment.userId === currentUserId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="ml-auto text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))
          )}

          <div className="flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] resize-none border-0 bg-muted/40 p-2 text-xs focus-visible:ring-1"
            />
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 self-end"
              disabled={!newComment.trim() || submitting}
              onClick={handleAddComment}
            >
              {submitting ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Send className="size-3" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
