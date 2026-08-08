import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/conference/conference-sections";

interface SecretariatMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
  bio: string | null;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function SecretariatSection({
  members,
}: {
  members: SecretariatMember[];
}) {
  if (members.length === 0) return null;

  return (
    <section>
      <SectionHeading
        icon={Users}
        title="Secretariat"
        subtitle="The team behind the conference"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <Card key={member.id} className="shadow-sm">
            <CardContent className="flex items-start gap-4 p-5">
              <Avatar className="size-14 shrink-0">
                <AvatarImage src={member.photoUrl ?? ""} />
                <AvatarFallback className="bg-brand-500/15 text-sm text-brand-700 dark:text-brand-300">
                  {initials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-brand-600 dark:text-brand-400">
                  {member.role}
                </p>
                {member.bio ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {member.bio}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
