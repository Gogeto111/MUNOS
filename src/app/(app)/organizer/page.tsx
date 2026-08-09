"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  PlusCircle,
  Megaphone,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OrganizerDashboard } from "@/components/organizer/organizer-dashboard";
import { SubmissionManager } from "@/components/organizer/submission-manager";
import { ConferenceCreator } from "@/components/organizer/conference-creator";
import { AnnouncementBuilder } from "@/components/organizer/announcement-builder";

const TABS = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "submissions", label: "Submissions", icon: ClipboardCheck },
  { value: "create", label: "Create", icon: PlusCircle },
  { value: "announcements", label: "Announcements", icon: Megaphone },
] as const;

export default function OrganizerPage() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line" className="w-full sm:w-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              <t.icon className="size-4" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <OrganizerDashboard onNavigate={setTab} />
        </TabsContent>

        <TabsContent value="submissions">
          <SubmissionManager />
        </TabsContent>

        <TabsContent value="create">
          <ConferenceCreator />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}
