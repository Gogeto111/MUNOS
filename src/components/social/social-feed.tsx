"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Send,
  MessageSquare,
  Heart,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { createPost, listPosts, togglePostLike, type PostItem } from "@/lib/actions/social";
import { PostComments } from "@/components/social/post-comments";
import { PostShare } from "@/components/social/post-share";
import { MentionInput, RenderPostContent } from "@/components/social/mention-input";

function PostSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-4 pt-1">
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SocialFeedProps {
  topicFilter?: string | null;
}

export function SocialFeed({ topicFilter }: SocialFeedProps) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPage = useCallback(
    async (pageCursor?: string, topic?: string | null) => {
      const result = await listPosts(pageCursor, topic ?? undefined);
      if (result.status === "success" && result.data) {
        const { posts: page, nextCursor } = result.data;
        if (pageCursor) {
          setPosts((prev) => [...prev, ...page]);
        } else {
          setPosts(page);
        }
        setCursor(nextCursor);
        setHasMore(nextCursor !== null);
      }
      setLoading(false);
      setLoadingMore(false);
    },
    [],
  );

  useEffect(() => {
    setLoading(true);
    setCursor(null);
    setHasMore(true);
    loadPage(undefined, topicFilter);
  }, [topicFilter, loadPage]);

  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          loadPage(cursor ?? undefined, topicFilter);
        }
      },
      { rootMargin: "200px" },
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [cursor, hasMore, loadingMore, loading, loadPage, topicFilter]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image must be under 15 MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported.");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "posts");

    try {
      const res = await fetch("/api/upload/social", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Image upload failed.");
        return null;
      }
      const data = await res.json();
      return data.url;
    } catch {
      toast.error("Image upload failed.");
      return null;
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !imageFile) return;
    setPosting(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      setUploadingImage(true);
      imageUrl = await uploadImage(imageFile);
      setUploadingImage(false);
      if (imageFile && !imageUrl) {
        setPosting(false);
        return;
      }
    }

    const result = await createPost(newPost.trim(), imageUrl ?? undefined);
    if (result.status === "success") {
      toast.success("Posted!");
      setNewPost("");
      removeImage();
      setCursor(null);
      setHasMore(true);
      setLoading(true);
      await loadPage(undefined, topicFilter);
    } else {
      toast.error(result.message);
    }
    setPosting(false);
  };

  const handleLike = async (postId: string) => {
    const result = await togglePostLike(postId);
    if (result.status === "success" && result.data) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likedByMe: result.data!.liked, likes: result.data!.likes }
            : p,
        ),
      );
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-500/10 text-sm font-bold text-brand-600">
              You
            </div>
            <div className="flex-1">
              <MentionInput
                value={newPost}
                onChange={setNewPost}
                placeholder="Share research, insights, or ask a question... Use @ to mention users"
                className="min-h-[80px] w-full resize-none border-0 bg-muted/40 p-3 text-sm focus-visible:ring-1 rounded-lg"
              />
              {imagePreview && (
                <div className="relative mt-2">
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className="max-h-48 rounded-lg object-cover border"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5 hover:bg-background transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => fileInputRef.current?.click()}
                    title="Add image"
                  >
                    <ImagePlus className="size-3.5" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="gap-1"
                  disabled={(!newPost.trim() && !imageFile) || posting}
                  onClick={handlePost}
                >
                  {posting || uploadingImage ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Send className="size-3" />
                  )}
                  {uploadingImage ? "Uploading..." : posting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="mb-4 size-10 text-muted-foreground" />
            <p className="text-sm font-medium">No posts yet</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Be the first to share research, insights, or questions with the MUN community.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-muted/60 text-sm font-bold">
                    {post.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{post.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <RenderPostContent content={post.content} />
                    {post.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={post.imageUrl}
                          alt="Post attachment"
                          className="max-h-64 rounded-lg object-cover border"
                        />
                      </div>
                    )}
                    <div className="mt-3 flex gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-1 text-xs ${post.likedByMe ? "text-red-500" : ""}`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={`size-3 ${post.likedByMe ? "fill-current" : ""}`} /> {post.likes}
                      </Button>
                      <PostShare author={post.author} content={post.content} />
                    </div>
                    <PostComments postId={post.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-4">
              {loadingMore && (
                <div className="space-y-4 w-full">
                  <PostSkeleton />
                </div>
              )}
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">
              You&apos;re all caught up
            </p>
          )}
        </>
      )}
    </div>
  );
}
