import { useState } from "react";
import { Plus, Trash2, Shield, User, Construction } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "member";
}

const mockTeam: TeamMember[] = [
  { id: "1", name: "Alice Johnson", email: "alice@company.com", role: "owner" },
  { id: "2", name: "Bob Smith", email: "bob@company.com", role: "member" },
  { id: "3", name: "Carol Williams", email: "carol@company.com", role: "member" },
];

const TeamPage = () => {
  const [inviteEmail, setInviteEmail] = useState("");

  return (
    <div className="p-6 space-y-6">
      <Alert className="border-primary/30 bg-primary/5">
        <Construction className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm text-muted-foreground">
          🚧 This page is under development. Full functionality coming soon.
        </AlertDescription>
      </Alert>

      <div>
        <h1 className="text-xl font-semibold text-foreground">Team Management</h1>
        <p className="text-sm text-muted-foreground">Manage team members and roles</p>
      </div>

      {/* Invite */}
      <div className="flex gap-3">
        <Input
          placeholder="Enter email to invite..."
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="glow" disabled={!inviteEmail.includes("@")}>
          <Plus className="h-4 w-4 mr-1" />
          Invite
        </Button>
      </div>

      {/* Members list */}
      <div className="space-y-3">
        {mockTeam.map((member) => (
          <div
            key={member.id}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 group"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {member.role === "owner" ? (
                <Shield className="h-5 w-5 text-primary" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.email}</p>
            </div>
            <Badge variant={member.role === "owner" ? "default" : "secondary"}>
              {member.role}
            </Badge>
            {member.role !== "owner" && (
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamPage;
