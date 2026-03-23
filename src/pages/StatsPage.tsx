import { Upload, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const teamUsage = [
  { member: "Alice", requests: 145, tokens: 520000, cost: "$12.40" },
  { member: "Bob", requests: 98, tokens: 310000, cost: "$8.20" },
  { member: "Carol", requests: 67, tokens: 180000, cost: "$5.10" },
];

const StatsPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Statistics & Billing</h1>
          <p className="text-sm text-muted-foreground">Upload monthly usage report and view team breakdown</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Report
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">310</p>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-xs text-muted-foreground">Team Members</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <span className="text-emerald-400 font-bold">$</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">$25.70</p>
              <p className="text-xs text-muted-foreground">Total Cost (March)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team usage table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Usage by Team Member</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs text-muted-foreground font-medium">Member</th>
              <th className="text-right px-5 py-3 text-xs text-muted-foreground font-medium">Requests</th>
              <th className="text-right px-5 py-3 text-xs text-muted-foreground font-medium">Tokens</th>
              <th className="text-right px-5 py-3 text-xs text-muted-foreground font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            {teamUsage.map((u) => (
              <tr key={u.member} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="px-5 py-3 text-sm text-foreground">{u.member}</td>
                <td className="px-5 py-3 text-sm text-foreground text-right">{u.requests}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground text-right font-mono">{u.tokens.toLocaleString()}</td>
                <td className="px-5 py-3 text-sm text-foreground text-right">{u.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsPage;
