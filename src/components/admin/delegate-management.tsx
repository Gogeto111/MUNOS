"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Users,
  Download,
  Mail,
  MoreHorizontal,
} from "lucide-react";

interface Delegate {
  id: string;
  name: string;
  email: string;
  country: string;
  registeredAt: string;
  status: "active" | "pending" | "inactive";
}

interface DelegateManagementProps {
  delegates: Delegate[];
  onExport?: () => void;
}

export function DelegateManagement({ delegates, onExport }: DelegateManagementProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = delegates.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600",
    pending: "bg-amber-500/10 text-amber-600",
    inactive: "bg-muted/60 text-muted-foreground",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Users className="size-4" /> Delegate Management
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Mail className="size-3" /> Email All
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={onExport}>
              <Download className="size-3" /> Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search delegates..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {["all", "active", "pending", "inactive"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Email</th>
                <th className="px-4 py-2 text-left font-medium">Country</th>
                <th className="px-4 py-2 text-left font-medium">Registered</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No delegates found.
                  </td>
                </tr>
              ) : (
                filtered.map((delegate) => (
                  <tr key={delegate.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{delegate.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{delegate.email}</td>
                    <td className="px-4 py-3">{delegate.country}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(delegate.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusColors[delegate.status]}>
                        {delegate.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {delegates.length} delegates
        </p>
      </CardContent>
    </Card>
  );
}
