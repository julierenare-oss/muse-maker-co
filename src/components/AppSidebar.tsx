import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus, History, BarChart3, LayoutDashboard,
  Settings, Users, Key, ChevronLeft, ChevronRight, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/chatStore";
import { useAuthStore } from "@/lib/auth";

const navItems = [
  { icon: History, label: "History", path: "/app/history" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/app/dashboard" },
  { icon: BarChart3, label: "Billing", path: "/app/stats", ownerOnly: true },
  { icon: Users, label: "Team", path: "/app/team", ownerOnly: true },
  { icon: Key, label: "API Keys", path: "/app/api-keys" },
  { icon: Settings, label: "Settings", path: "/app/settings" },
];

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isOwner = true;
  const newConversation = useChatStore((s) => s.newConversation);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <span className="font-mono font-bold text-lg gradient-text">NEXAGEN</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* New Request Button */}
      <div className="p-3">
        <Button
          variant="glow"
          className={cn("w-full", collapsed ? "px-0" : "")}
          onClick={() => {
            newConversation();
            navigate("/app");
          }}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span>New Request</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => !item.ownerOnly || isOwner)
          .map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
