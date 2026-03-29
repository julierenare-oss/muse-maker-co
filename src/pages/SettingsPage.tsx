import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getUserProfile, updateUserProfile } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const SettingsPage = () => {
  const [occupation, setOccupation] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setOccupation(data.occupation || "");
        setBio(data.bio || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUserProfile(occupation, bio);
      toast.success("Personalization saved");
    } catch {
      toast.error("Failed to save personalization");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Account and workspace preferences</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-sm font-medium text-foreground">Personalization</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Customize how the AI responds to you
          </p>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Occupation / Role</Label>
              <Input
                placeholder="e.g. Software Engineer, Designer, Student…"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Custom Instructions</Label>
              <Textarea
                placeholder="e.g. Answer me in Spanish, be concise, use code examples…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
            <Button variant="default" size="sm" onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Personalization
            </Button>
          </>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-foreground">Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Display Name</Label>
            <Input defaultValue="Alice Johnson" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input defaultValue="alice@company.com" disabled />
          </div>
        </div>
        <Button variant="default" size="sm">Save Changes</Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-foreground">Workspace</h2>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Workspace Name</Label>
          <Input defaultValue="Acme Corp" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Default Model</Label>
          <Input defaultValue="GPT-5" />
        </div>
        <Button variant="default" size="sm">Save Changes</Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">
          Once you delete your workspace, there is no going back.
        </p>
        <Button variant="destructive" size="sm">Delete Workspace</Button>
      </div>
    </div>
  );
};

export default SettingsPage;
