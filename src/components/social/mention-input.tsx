"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { searchUsers, type UserSearchResult } from "@/lib/actions/social";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function MentionInput({
  value,
  onChange,
  placeholder,
  className,
  rows = 3,
  onKeyDown,
}: MentionInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQueryStart, setMentionQueryStart] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (q.trim().length === 0) {
        setSuggestions([]);
        return;
      }
      const result = await searchUsers(q);
      if (result.status === "success" && result.data) {
        setSuggestions(result.data);
        setSelectedIndex(0);
      }
    }, 250);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      triggerSearch(query);
    } else {
      setSuggestions([]);
    }
  }, [query, triggerSearch]);

  const detectMentionQuery = useCallback(
    (text: string, cursorPos: number): { start: number; query: string } | null => {
      const before = text.slice(0, cursorPos);
      const atIndex = before.lastIndexOf("@");
      if (atIndex === -1) return null;
      // Ensure @ is at start or preceded by whitespace
      if (atIndex > 0 && !/\s/.test(before[atIndex - 1])) return null;
      const query = before.slice(atIndex + 1);
      // No spaces in mention query
      if (/\s/.test(query)) return null;
      return { start: atIndex, query };
    },
    [],
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart ?? text.length;
    onChange(text);

    const mention = detectMentionQuery(text, cursorPos);
    if (mention) {
      setMentionQueryStart(mention.start);
      setQuery(mention.query);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setMentionQueryStart(null);
      setQuery("");
    }
  };

  const insertMention = (user: UserSearchResult) => {
    const text = value;
    if (mentionQueryStart === null) return;
    const before = text.slice(0, mentionQueryStart);
    const after = text.slice(mentionQueryStart + query.length + 1);
    const mentionText = `@${user.username || user.name} `;
    const newText = before + mentionText + after;
    onChange(newText);
    setShowSuggestions(false);
    setMentionQueryStart(null);
    setQuery("");

    // Refocus textarea and place cursor after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = mentionText.length + before.length;
        textareaRef.current.selectionStart = pos;
        textareaRef.current.selectionEnd = pos;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        return;
      }
    }
    onKeyDown?.(e);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border bg-popover p-1 shadow-md"
        >
          {suggestions.map((user, i) => (
            <button
              key={user.id}
              type="button"
              onClick={() => insertMention(user)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                i === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <div className="grid size-7 shrink-0 place-items-center rounded-full bg-muted/60 text-[10px] font-bold">
                {user.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user.username ? `@${user.username}` : ""}{" "}
                  {user.country ? `· ${user.country}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Renders post content with @mentions highlighted as styled, clickable links.
 */
export function RenderPostContent({ content }: { content: string }) {
  const parts: (string | { type: "mention"; text: string })[] = [];
  const regex = /@[\w\u00C0-\u024F]+/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push({ type: "mention", text: match[0] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return (
    <p className="mt-2 text-sm whitespace-pre-wrap">
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <span
            key={i}
            className="inline-flex items-center rounded bg-brand-500/10 px-1 py-0.5 text-xs font-semibold text-brand-600 cursor-pointer hover:bg-brand-500/20 transition-colors"
          >
            {part.text}
          </span>
        ),
      )}
    </p>
  );
}
