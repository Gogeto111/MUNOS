"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Globe,
  MessageSquare,
  Heart,
  Share2,
} from "lucide-react";

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
}

const DEMO_POSTS: Post[] = [];

export function SocialFeed() {
  const [newPost, setNewPost] = useState("");

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-500/10 text-sm font-bold text-brand-600">
              You
            </div>
            <div className="flex-1">
              <Textarea
                placeholder="Share research, insights, or ask a question..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[80px] resize-none border-0 bg-muted/40 p-3 focus-visible:ring-1"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    <Globe className="size-3" /> Public
                  </Button>
                </div>
                <Button size="sm" className="gap-1" disabled={!newPost.trim()}>
                  <Send className="size-3" /> Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {DEMO_POSTS.length === 0 ? (
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
        DEMO_POSTS.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-muted/60 text-sm font-bold">
                  {post.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{post.author}</span>
                    <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                  </div>
                  <p className="mt-2 text-sm">{post.content}</p>
                  {post.tags.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex gap-4">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      <Heart className="size-3" /> {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      <MessageSquare className="size-3" /> {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                      <Share2 className="size-3" /> Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
