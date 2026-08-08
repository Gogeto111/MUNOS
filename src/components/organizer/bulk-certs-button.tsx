"use client";

import { useState } from "react";
import { Loader2, Award } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bulkGenerateCertificates } from "@/lib/actions/organizer";

interface BulkCertsButtonProps {
  conferenceId: string;
  delegateCount: number;
  disabled?: boolean;
}

export function BulkCertsButton({
  conferenceId,
  delegateCount,
  disabled,
}: BulkCertsButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const result = await bulkGenerateCertificates(conferenceId);
    setLoading(false);

    if (result.status === "success") {
      const count = result.data?.generated ?? 0;
      if (count > 0) {
        toast.success(`Generated ${count} certificate(s) successfully.`);
      } else {
        toast.info(result.message);
      }
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={loading || disabled || delegateCount === 0}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Award className="size-4" />
      )}
      Generate Certificates
    </Button>
  );
}
