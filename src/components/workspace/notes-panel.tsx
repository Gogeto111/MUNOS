"use client";

import { useState } from "react";
import { Folder, FolderPlus, NotebookPen, Pin } from "lucide-react";
import type { Folder as FolderModel, Note } from "@/generated/prisma/browser";
import { createFolder, deleteFolder, deleteNote } from "@/lib/actions/workspace";
import { NoteEditor } from "@/components/workspace/note-editor";
import { DeleteButton } from "@/components/profile/delete-button";
import { SectionCard } from "@/components/profile/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NotesPanel({
  workspaceId,
  folders,
  notes,
}: {
  workspaceId: string;
  folders: FolderModel[];
  notes: Note[];
}) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showNewNote, setShowNewNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");
  const [isAddingFolder, setIsAddingFolder] = useState(false);

  const visibleNotes = selectedFolderId
    ? notes.filter((n) => n.folderId === selectedFolderId)
    : notes;

  const handleCreateFolder = async () => {
    const name = folderName.trim();
    if (!name) return;
    const result = await createFolder(workspaceId, { name });
    if (result.status === "success") {
      toast.success(result.message);
      setFolderName("");
      setIsAddingFolder(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    const result = await deleteFolder(workspaceId, id);
    if (result.status === "success") {
      toast.success(result.message);
      if (selectedFolderId === id) setSelectedFolderId(null);
    } else {
      toast.error(result.message);
    }
    return result;
  };

  const handleDeleteNote = async (id: string) => {
    const result = await deleteNote(workspaceId, id);
    if (result.status === "success") {
      toast.success(result.message);
      if (editingNoteId === id) setEditingNoteId(null);
    } else {
      toast.error(result.message);
    }
    return result;
  };

  return (
    <SectionCard title="Notes" description="Research notes organized in folders." icon={NotebookPen}>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <aside className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Folders</p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="New folder"
              onClick={() => setIsAddingFolder((v) => !v)}
            >
              <FolderPlus className="size-4" />
            </Button>
          </div>
          {isAddingFolder ? (
            <div className="flex gap-2">
              <Input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Folder name"
                className="h-8"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleCreateFolder();
                }}
              />
              <Button type="button" size="sm" onClick={() => void handleCreateFolder()}>
                Add
              </Button>
            </div>
          ) : null}
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => setSelectedFolderId(null)}
                className={cn(
                  "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  selectedFolderId === null
                    ? "bg-brand-500/10 text-brand-700 dark:text-brand-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                All notes ({notes.length})
              </button>
            </li>
            {folders.map((folder) => (
              <li key={folder.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                    selectedFolderId === folder.id
                      ? "bg-brand-500/10 text-brand-700 dark:text-brand-300"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Folder className="size-3.5 shrink-0" />
                  <span className="truncate">{folder.name}</span>
                  <span className="ml-auto text-xs tabular-nums">
                    {notes.filter((n) => n.folderId === folder.id).length}
                  </span>
                </button>
                <DeleteButton
                  action={handleDeleteFolder}
                  id={folder.id}
                  className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-4">
          {showNewNote || editingNoteId ? (
            <NoteEditor
              workspaceId={workspaceId}
              folders={folders}
              note={notes.find((n) => n.id === editingNoteId)}
              defaultFolderId={selectedFolderId ?? undefined}
              onSaved={() => {
                setShowNewNote(false);
                setEditingNoteId(null);
              }}
              onCancel={() => {
                setShowNewNote(false);
                setEditingNoteId(null);
              }}
            />
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => setShowNewNote(true)}>
              <NotebookPen className="size-4" />
              New note
            </Button>
          )}

          {visibleNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {selectedFolderId ? "No notes in this folder yet." : "No notes yet. Create your first one above."}
            </p>
          ) : (
            <ul className="divide-y divide-border/70 rounded-lg border border-border/70">
              {visibleNotes.map((note) => (
                <li key={note.id} className="group flex items-start justify-between gap-3 px-4 py-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => {
                      setEditingNoteId(note.id);
                      setShowNewNote(false);
                    }}
                  >
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                      {note.pinned ? <Pin className="size-3.5 shrink-0 text-brand-600" /> : null}
                      {note.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {note.content}
                    </p>
                  </button>
                  <DeleteButton
                    action={handleDeleteNote}
                    id={note.id}
                    className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
