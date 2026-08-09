"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Submission {
  id: string;
  conferenceName: string;
  date: string;
  status: "pending" | "accepted" | "rejected" | "waitlisted";
  delegateCount: number;
  submittedBy: string;
  email: string;
  description: string;
}

const MOCK_SUBMISSIONS: Submission[] = [
  { id: "1", conferenceName: "Harvard MUN 2026", date: "2026-08-01", status: "pending", delegateCount: 42, submittedBy: "Sarah Chen", email: "sarah@harvard.edu", description: "Annual Harvard Model United Nations conference focusing on global diplomacy and international relations." },
  { id: "2", conferenceName: "Oxford International MUN", date: "2026-07-28", status: "accepted", delegateCount: 38, submittedBy: "James Wilson", email: "j.wilson@oxford.ac.uk", description: "Oxford's flagship MUN conference with delegates from over 30 countries." },
  { id: "3", conferenceName: "Tokyo Global Summit", date: "2026-07-25", status: "rejected", delegateCount: 15, submittedBy: "Yuki Tanaka", email: "yuki@todai.jp", description: "Asia-Pacific focused MUN with emphasis on regional cooperation." },
  { id: "4", conferenceName: "Geneva Diplomacy Forum", date: "2026-07-20", status: "waitlisted", delegateCount: 56, submittedBy: "Marie Dubois", email: "marie@unige.ch", description: "High-level diplomacy simulation at the Palais des Nations." },
  { id: "5", conferenceName: "Singapore Youth Assembly", date: "2026-07-18", status: "pending", delegateCount: 29, submittedBy: "Li Wei", email: "li.wei@nus.sg", description: "Southeast Asian youth assembly focused on sustainable development." },
  { id: "6", conferenceName: "Cairo Model UN", date: "2026-07-15", status: "accepted", delegateCount: 34, submittedBy: "Ahmed Hassan", email: "ahmed@aucegypt.edu", description: "North African and Middle Eastern MUN conference." },
  { id: "7", conferenceName: "São Paulo Global Forum", date: "2026-07-10", status: "pending", delegateCount: 48, submittedBy: "Ana Silva", email: "ana@usp.br", description: "Latin America's largest student-led MUN." },
  { id: "8", conferenceName: "Berlin European Summit", date: "2026-07-05", status: "accepted", delegateCount: 62, submittedBy: "Hans Mueller", email: "hans@fu-berlin.de", description: "European-focused MUN with UN simulation and policy debates." },
];

const STATUS_CONFIG: Record<Submission["status"], { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  accepted: { label: "Accepted", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  waitlisted: { label: "Waitlisted", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
};

export function SubmissionManager() {
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailSubmission, setDetailSubmission] = useState<Submission | null>(null);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const matchesSearch =
        s.conferenceName.toLowerCase().includes(search.toLowerCase()) ||
        s.submittedBy.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [submissions, search, statusFilter]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  }

  function updateStatus(ids: string[], status: Submission["status"]) {
    setSubmissions((prev) =>
      prev.map((s) => (ids.includes(s.id) ? { ...s, status } : s))
    );
    setSelectedIds(new Set());
    toast.success(`${ids.length} submission(s) ${status}`);
  }

  function exportCSV() {
    const headers = ["Conference", "Date", "Status", "Delegates", "Submitted By", "Email"];
    const rows = filtered.map((s) => [s.conferenceName, s.date, s.status, s.delegateCount, s.submittedBy, s.email]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "submissions.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search submissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="waitlisted">Waitlisted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button size="sm" variant="outline" onClick={() => updateStatus([...selectedIds], "accepted")}>
                <CheckCircle2 className="size-3.5" />
                Accept ({selectedIds.size})
              </Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus([...selectedIds], "rejected")}>
                <XCircle className="size-3.5" />
                Reject ({selectedIds.size})
              </Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={exportCSV}>
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="size-3.5 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Conference</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Delegates</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => {
                  const cfg = STATUS_CONFIG[s.status];
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleSelect(s.id)}
                          className="size-3.5 rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{s.conferenceName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(s.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-medium ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{s.delegateCount}</TableCell>
                      <TableCell className="text-muted-foreground">{s.submittedBy}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => setDetailSubmission(s)}
                          >
                            <Eye className="size-3.5" />
                          </Button>
                          {s.status === "pending" && (
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              onClick={() => updateStatus([s.id], "accepted")}
                            >
                              <CheckCircle2 className="size-3.5 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!detailSubmission} onOpenChange={(open) => !open && setDetailSubmission(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{detailSubmission?.conferenceName}</DialogTitle>
          </DialogHeader>
          {detailSubmission && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-medium ${STATUS_CONFIG[detailSubmission.status].className}`}>
                  {STATUS_CONFIG[detailSubmission.status].label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(detailSubmission.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delegates</span>
                <span>{detailSubmission.delegateCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted By</span>
                <span>{detailSubmission.submittedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{detailSubmission.email}</span>
              </div>
              <div className="border-t pt-3">
                <p className="text-muted-foreground mb-1">Description</p>
                <p>{detailSubmission.description}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">Close</Button>
            </DialogClose>
            {detailSubmission?.status === "pending" && (
              <>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    updateStatus([detailSubmission.id], "rejected");
                    setDetailSubmission(null);
                  }}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    updateStatus([detailSubmission.id], "accepted");
                    setDetailSubmission(null);
                  }}
                >
                  Accept
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
