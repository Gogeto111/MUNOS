"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ConferenceComparisonProps {
  conferences: Array<{
    id: string;
    name: string;
    city: string;
    country: string;
    startDate: string;
    endDate: string;
    format: string;
    fee: number | null;
    capacity: number | null;
    difficulty: string;
    committeeCount: number;
    delegateCount: number;
  }>;
}

export function ConferenceComparison({ conferences }: ConferenceComparisonProps) {
  if (conferences.length < 2) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Select at least 2 conferences to compare.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatFee = (fee: number | null) => {
    if (!fee) return "Free";
    return `$${fee.toLocaleString()}`;
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Conference Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Feature</th>
                {conferences.map((conf) => (
                  <th key={conf.id} className="px-4 py-2 text-left font-medium">
                    {conf.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3 text-muted-foreground">Location</td>
                {conferences.map((conf) => (
                  <td key={conf.id} className="px-4 py-3">
                    {conf.city}, {conf.country}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 text-muted-foreground">Dates</td>
                {conferences.map((conf) => (
                  <td key={conf.id} className="px-4 py-3">
                    {formatDate(conf.startDate)} - {formatDate(conf.endDate)}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 text-muted-foreground">Format</td>
                {conferences.map((conf) => (
                  <td key={conf.id} className="px-4 py-3">
                    <Badge variant="secondary">{conf.format}</Badge>
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 text-muted-foreground">Fee</td>
                {conferences.map((conf) => (
                  <td key={conf.id} className="px-4 py-3">
                    {formatFee(conf.fee)}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 text-muted-foreground">Capacity</td>
                {conferences.map((conf) => (
                  <td key={conf.id} className="px-4 py-3">
                    {conf.capacity?.toLocaleString() ?? "No limit"}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 text-muted-foreground">Difficulty</td>
                {conferences.map((conf) => (
                  <td key={conf.id} className="px-4 py-3">
                    <Badge variant="outline">{conf.difficulty}</Badge>
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 text-muted-foreground">Committees</td>
                {conferences.map((conf) => (
                  <td key={conf.id} className="px-4 py-3">
                    {conf.committeeCount}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted-foreground">Delegates</td>
                {conferences.map((conf) => (
                  <td key={conf.id} className="px-4 py-3">
                    {conf.delegateCount}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
