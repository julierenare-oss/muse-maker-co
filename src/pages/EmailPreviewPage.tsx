import { useState } from "react";
import { Button } from "@/components/ui/button";

const InviteEmailTemplate = ({ inviterName = "Alice Johnson", memberEmail = "bob@company.com" }: { inviterName?: string; memberEmail?: string }) => (
  <div style={{ fontFamily: "'Inter', Arial, sans-serif", backgroundColor: "#f4f4f5", padding: "40px 20px" }}>
    <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #00ffaa, #a855f7)", padding: "32px 40px", textAlign: "center" as const }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0a0a1a", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>NEXAGEN</h1>
      </div>
      {/* Body */}
      <div style={{ padding: "40px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1a1a2e", margin: "0 0 16px" }}>You've been invited to Nexagen!</h2>
        <p style={{ fontSize: "15px", color: "#555570", lineHeight: 1.6, margin: "0 0 12px" }}>
          Hello,
        </p>
        <p style={{ fontSize: "15px", color: "#555570", lineHeight: 1.6, margin: "0 0 12px" }}>
          <strong style={{ color: "#1a1a2e" }}>{inviterName}</strong> has invited you (<strong style={{ color: "#1a1a2e" }}>{memberEmail}</strong>) to join their team on the <strong style={{ color: "#1a1a2e" }}>Nexagen</strong> AI Generation Platform.
        </p>
        <p style={{ fontSize: "15px", color: "#555570", lineHeight: 1.6, margin: "0 0 28px" }}>
          Click the button below to accept the invitation, set your password, and start using the platform.
        </p>
        <div style={{ textAlign: "center" as const }}>
          <a
            href="#"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              backgroundColor: "#00ffaa",
              color: "#0a0a1a",
              fontSize: "15px",
              fontWeight: 600,
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Accept Invitation
          </a>
        </div>
        <p style={{ fontSize: "13px", color: "#999", lineHeight: 1.5, margin: "28px 0 0", textAlign: "center" as const }}>
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
      {/* Footer */}
      <div style={{ padding: "20px 40px", backgroundColor: "#fafafa", borderTop: "1px solid #eee", textAlign: "center" as const }}>
        <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>© 2026 Nexagen. All rights reserved.</p>
      </div>
    </div>
  </div>
);

const ResetPasswordEmailTemplate = ({ userEmail = "bob@company.com" }: { userEmail?: string }) => (
  <div style={{ fontFamily: "'Inter', Arial, sans-serif", backgroundColor: "#f4f4f5", padding: "40px 20px" }}>
    <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #00ffaa, #a855f7)", padding: "32px 40px", textAlign: "center" as const }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0a0a1a", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>NEXAGEN</h1>
      </div>
      {/* Body */}
      <div style={{ padding: "40px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1a1a2e", margin: "0 0 16px" }}>Reset Your Password</h2>
        <p style={{ fontSize: "15px", color: "#555570", lineHeight: 1.6, margin: "0 0 12px" }}>
          Hello,
        </p>
        <p style={{ fontSize: "15px", color: "#555570", lineHeight: 1.6, margin: "0 0 12px" }}>
          We received a request to reset the password for your Nexagen account (<strong style={{ color: "#1a1a2e" }}>{userEmail}</strong>).
        </p>
        <p style={{ fontSize: "15px", color: "#555570", lineHeight: 1.6, margin: "0 0 28px" }}>
          Click the button below to set a new password. This link will expire in 1 hour.
        </p>
        <div style={{ textAlign: "center" as const }}>
          <a
            href="#"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              backgroundColor: "#00ffaa",
              color: "#0a0a1a",
              fontSize: "15px",
              fontWeight: 600,
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Reset Password
          </a>
        </div>
        <p style={{ fontSize: "13px", color: "#999", lineHeight: 1.5, margin: "28px 0 0", textAlign: "center" as const }}>
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
      {/* Footer */}
      <div style={{ padding: "20px 40px", backgroundColor: "#fafafa", borderTop: "1px solid #eee", textAlign: "center" as const }}>
        <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>© 2026 Nexagen. All rights reserved.</p>
      </div>
    </div>
  </div>
);

const WelcomeEmailTemplate = ({ userEmail = "bob@company.com" }: { userEmail?: string }) => (
  <div style={{ fontFamily: "'Inter', Arial, sans-serif", backgroundColor: "#f4f4f5", padding: "40px 20px" }}>
    <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
      <div style={{ background: "linear-gradient(135deg, #00ffaa, #a855f7)", padding: "32px 40px", textAlign: "center" as const }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0a0a1a", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>NEXAGEN</h1>
      </div>
      <div style={{ padding: "40px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1a1a2e", margin: "0 0 16px" }}>Welcome to Nexagen!</h2>
        <p style={{ fontSize: "15px", color: "#555570", lineHeight: 1.6, margin: "0 0 12px" }}>
          Hello,
        </p>
        <p style={{ fontSize: "15px", color: "#555570", lineHeight: 1.6, margin: "0 0 12px" }}>
          Your account (<strong style={{ color: "#1a1a2e" }}>{userEmail}</strong>) has been created on the <strong style={{ color: "#1a1a2e" }}>Nexagen</strong> AI Generation Platform.
        </p>
        <p style={{ fontSize: "15px", color: "#555570", lineHeight: 1.6, margin: "0 0 28px" }}>
          To get started, please set a password for your account using the button below. This link is unique to you and will expire in 24 hours.
        </p>
        <div style={{ textAlign: "center" as const }}>
          <a
            href="#"
            style={{
              display: "inline-block",
              padding: "14px 36px",
              backgroundColor: "#00ffaa",
              color: "#0a0a1a",
              fontSize: "15px",
              fontWeight: 600,
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Set Your Password
          </a>
        </div>
        <div style={{ marginTop: "32px", padding: "16px 20px", backgroundColor: "#f8f8fb", borderRadius: "8px", borderLeft: "3px solid #00ffaa" }}>
          <p style={{ fontSize: "13px", color: "#555570", lineHeight: 1.5, margin: 0 }}>
            <strong style={{ color: "#1a1a2e" }}>What's next?</strong> Once you set your password, you'll be able to generate text, images and video, manage your team and API keys, and explore the platform.
          </p>
        </div>
        <p style={{ fontSize: "13px", color: "#999", lineHeight: 1.5, margin: "28px 0 0", textAlign: "center" as const }}>
          If you didn't expect this email, you can safely ignore it.
        </p>
      </div>
      <div style={{ padding: "20px 40px", backgroundColor: "#fafafa", borderTop: "1px solid #eee", textAlign: "center" as const }}>
        <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>© 2026 Nexagen. All rights reserved.</p>
      </div>
    </div>
  </div>
);

const EmailPreviewPage = () => {
  const [activeTemplate, setActiveTemplate] = useState<"invite" | "reset" | "welcome">("welcome");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Email Templates Preview</h1>
        <p className="text-sm text-muted-foreground mb-6">Preview how email templates will look to recipients.</p>

        <div className="flex gap-3 mb-6">
          <Button
            variant={activeTemplate === "invite" ? "glow" : "secondary"}
            onClick={() => setActiveTemplate("invite")}
          >
            Team Invitation
          </Button>
          <Button
            variant={activeTemplate === "reset" ? "glow" : "secondary"}
            onClick={() => setActiveTemplate("reset")}
          >
            Password Reset
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Subject:</strong>{" "}
              {activeTemplate === "invite"
                ? "You've been invited to join Nexagen"
                : "Reset your Nexagen password"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong className="text-foreground">From:</strong> noreply@nexagen.ai
            </p>
          </div>
          <div className="overflow-auto">
            {activeTemplate === "invite" ? <InviteEmailTemplate /> : <ResetPasswordEmailTemplate />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreviewPage;
