"use client";

import { useEffect, useState, useRef } from "react";
import {
  Award,
  FileBadge,
  Download,
  Loader2,
  Upload,
  Trash2,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  getCertificates,
  uploadCertificate,
  deleteCertificate,
} from "@/lib/actions/profile";

interface Certificate {
  id: string;
  title: string;
  issuer: string | null;
  category: string;
  issueYear: number | null;
  fileName: string;
  fileUrl: string;
  description: string | null;
  createdAt: string;
}

const CATEGORIES = [
  { value: "PARTICIPATION", label: "Participation" },
  { value: "AWARD", label: "Award" },
  { value: "BEST_DELEGATE", label: "Best Delegate" },
  { value: "HONORABLE_MENTION", label: "Honorable Mention" },
  { value: "SPECIAL_MENTION", label: "Special Mention" },
  { value: "VERBAL_COMMENDATION", label: "Verbal Commendation" },
  { value: "RESEARCH_PAPER", label: "Research Paper" },
  { value: "OTHER", label: "Other" },
];

const categoryColors: Record<string, string> = {
  PARTICIPATION: "bg-emerald-500/10 text-emerald-600",
  AWARD: "bg-amber-500/10 text-amber-600",
  BEST_DELEGATE: "bg-amber-500/10 text-amber-600",
  OUTSTANDING: "bg-brand-500/10 text-brand-600",
  HONORABLE_MENTION: "bg-purple-500/10 text-purple-600",
  SPECIAL_MENTION: "bg-purple-500/10 text-purple-600",
  VERBAL_COMMENDATION: "bg-purple-500/10 text-purple-600",
  RESEARCH_PAPER: "bg-blue-500/10 text-blue-600",
  OTHER: "bg-muted/60 text-muted-foreground",
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [category, setCategory] = useState("PARTICIPATION");
  const [issueYear, setIssueYear] = useState("");
  const [description, setDescription] = useState("");

  const loadCertificates = async () => {
    const result = await getCertificates();
    if (result.status === "success" && result.data) {
      setCertificates(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const resetForm = () => {
    setTitle("");
    setIssuer("");
    setCategory("PARTICIPATION");
    setIssueYear("");
    setDescription("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast.error("Please select a file and enter a title.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title);
    formData.append("issuer", issuer);
    formData.append("category", category);
    formData.append("issueYear", issueYear);
    formData.append("description", description);

    const result = await uploadCertificate(formData);

    if (result.status === "success") {
      toast.success("Certificate uploaded!");
      setShowUpload(false);
      resetForm();
      await loadCertificates();
    } else {
      toast.error(result.message);
    }
    setUploading(false);
  };

  const handleDelete = async (certId: string, certTitle: string) => {
    if (!confirm(`Delete "${certTitle}"?`)) return;
    const result = await deleteCertificate(certId);
    if (result.status === "success") {
      toast.success("Certificate deleted.");
      await loadCertificates();
    } else {
      toast.error(result.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
          <p className="text-sm text-muted-foreground">
            Upload, preview, and organize your MUN certificates.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowUpload(true)}>
          <Upload className="size-3.5" /> Upload Certificate
        </Button>
      </div>

      {certificates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full bg-muted/60">
              <FileBadge className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-sm font-semibold">No certificates yet</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Upload your MUN certificates to keep them organized.
            </p>
            <Button variant="outline" className="gap-2" onClick={() => setShowUpload(true)}>
              <Upload className="size-3.5" /> Upload Your First Certificate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[60vh]">
          <div className="space-y-3">
            {certificates.map((cert) => (
              <Card key={cert.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="grid size-12 place-items-center rounded-lg bg-amber-500/10">
                    <Award className="size-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold truncate">{cert.title}</h3>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] uppercase ${categoryColors[cert.category] ?? categoryColors.OTHER}`}
                      >
                        {cert.category.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cert.issuer ?? "Unknown issuer"}
                      {cert.issueYear && ` • ${cert.issueYear}`}
                    </p>
                    {cert.description && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{cert.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground mr-2">
                      {new Date(cert.createdAt).toLocaleDateString()}
                    </span>
                    {cert.fileUrl && (
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Button size="sm" variant="ghost" className="gap-1">
                          <Download className="size-3" /> Download
                        </Button>
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(cert.id, cert.title)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg">
            <div className="flex items-center justify-between p-4 pb-0">
              <h2 className="text-sm font-semibold">Upload Certificate</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowUpload(false); resetForm(); }}>
                <X className="size-4" />
              </Button>
            </div>
            <CardContent className="space-y-3 pt-4">
              <div>
                <label className="mb-1 block text-xs font-medium">Certificate File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:text-primary-foreground hover:file:bg-primary/90"
                />
                {selectedFile && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Best Delegate Award — HMUN 2025"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">Issuer</label>
                  <Input
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="e.g., Harvard"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Year</label>
                  <Input
                    type="number"
                    value={issueYear}
                    onChange={(e) => setIssueYear(e.target.value)}
                    placeholder="e.g., 2025"
                    min={1990}
                    max={2099}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional notes about this certificate"
                  rows={2}
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !title.trim() || uploading}
                className="w-full"
              >
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {uploading ? "Uploading..." : "Upload Certificate"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
