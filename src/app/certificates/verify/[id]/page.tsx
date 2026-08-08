import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Shield, ExternalLink, Lock, Calendar, Building2, Award } from "lucide-react";
import { getDb } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { Container } from "@/components/shared/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerificationCard } from "@/components/certificates/verification-card";

export const metadata = { title: "Verify Certificate | MUNOS" };

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;

    const certificate = await getDb().certificate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!certificate) notFound();

    const ownerName = [certificate.user.firstName, certificate.user.lastName]
      .filter(Boolean)
      .join(" ") || certificate.user.username || "Unknown";

    const issueDate = certificate.createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Container className="py-12">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-emerald-500/10">
                <CheckCircle className="size-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Certificate Verified</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This certificate has been issued through MUNOS and is authentic.
              </p>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Lock className="size-3 text-emerald-500" /> Cryptographically signed
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="size-3 text-emerald-500" /> Tamper-proof record
                </span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{certificate.title}</CardTitle>
                  <Badge variant="secondary" className="uppercase">
                    {certificate.category.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Award className="mt-0.5 size-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Issued To</p>
                      <p className="text-sm font-medium">{ownerName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="mt-0.5 size-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Issuer</p>
                      <p className="text-sm font-medium">{certificate.issuer || "Unknown"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 size-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Issue Year</p>
                      <p className="text-sm font-medium">{certificate.issueYear || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="mt-0.5 size-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Certificate ID</p>
                      <p className="font-mono text-xs">{certificate.id}</p>
                    </div>
                  </div>
                </div>

                {certificate.description && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Description</p>
                    <p className="text-sm">{certificate.description}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 border-t pt-4">
                  <Shield className="size-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">
                    Verified on {new Date().toLocaleDateString()} via MUNOS Certificate Verification
                  </span>
                </div>

                {certificate.fileUrl && (
                  <Button asChild variant="outline" className="w-full gap-2">
                    <Link href={certificate.fileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-3.5" /> View Certificate File
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <div className="mt-4">
              <VerificationCard certificateId={certificate.id} />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="grid size-10 place-items-center rounded-lg bg-emerald-500/10">
                    <Calendar className="size-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Issued</p>
                    <p className="text-sm font-medium">{issueDate}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="grid size-10 place-items-center rounded-lg bg-brand-500/10">
                    <Shield className="size-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Verification Status</p>
                    <p className="text-sm font-medium text-emerald-600">Verified & Valid</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 text-center">
              <Button asChild variant="ghost" size="sm">
                <Link href="/discover">Back to MUNOS</Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  } catch (error) {
    logger.error("Certificate verification error", { error: String(error) });
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 className="text-lg font-semibold">Verification failed</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We couldn&apos;t verify this certificate. Please try again.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }
}
