import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SettingsPage = () => {
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Account and workspace preferences</p>
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
