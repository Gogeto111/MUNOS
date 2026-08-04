"use client";

import { useEffect, useState } from "react";
import { Award, FileBadge, Download, Loader2, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCertificates } from "@/lib/actions/profile";

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

const categoryColors: Record<string, string> = {
  PARTICIPATION: "bg-emerald-500/10 text-emerald-600",
  BEST_DELEGATE: "bg-amber-500/10 text-amber-600",
  OUTSTANDING: "bg-brand-500/10 text-brand-600",
  HONORABLE_MENTION: "bg-purple-500/10 text-purple-600",
  OTHER: "bg-muted/60 text-muted-foreground",
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCertificates().then((result) => {
      if (result.status === "success" && result.data) {
        setCertificates(result.data);
      }
      setLoading(false);
    });
  }, []);

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
        <Button className="gap-2">
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
            <Button variant="outline" className="gap-2">
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
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(cert.createdAt).toLocaleDateString()}
                    </span>
                    {cert.fileUrl && (
                      <Button size="sm" variant="ghost" className="gap-1">
                        <Download className="size-3" /> Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
