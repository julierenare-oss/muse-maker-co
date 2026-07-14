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

const LimitWarningEmailTemplate = ({
  ownerName = "Alice Johnson",
  memberName = "j.rybakova",
  memberEmail = "j.rybakova@cdnvideo.ru",
  usedUsd = 285,
  limitUsd = 300,
  percentLeft = 5,
  period = "месяц" as "день" | "месяц",
}: {
  ownerName?: string;
  memberName?: string;
  memberEmail?: string;
  usedUsd?: number;
  limitUsd?: number;
  percentLeft?: number;
  period?: "день" | "месяц";
}) => {
  const percentUsed = Math.min(100, Math.round((usedUsd / limitUsd) * 100));
  const barColor = percentLeft <= 5 ? "#ef4444" : "#f59e0b";
  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", backgroundColor: "#f4f4f5", padding: "40px 20px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ background: "linear-gradient(135deg, #00ffaa, #a855f7)", padding: "32px 40px", textAlign: "center" as const }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0a0a1a", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>NEXAGEN</h1>
        </div>
        <div style={{ padding: "40px" }}>
          <div style={{ display: "inline-block", padding: "6px 12px", borderRadius: "6px", backgroundColor: `${barColor}20`, color: barColor, fontSize: "12px", fontWeight: 600, marginBottom: "16px" }}>
            ⚠ Осталось {percentLeft}% лимита
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1a1a2e", margin: "0 0 16px" }}>Лимит участника подходит к концу</h2>
          <p style={{ fontSize: "15px", color: "#555570", lineHeight: 1.6, margin: "0 0 12px" }}>Привет, {ownerName}!</p>
          <p style={{ fontSize: "15px", color: "#555570", lineHeight: 1.6, margin: "0 0 20px" }}>
            У участника <strong style={{ color: "#1a1a2e" }}>{memberName}</strong> ({memberEmail}) осталось меньше {percentLeft}% от лимита на {period}. Когда лимит закончится, генерации для этого участника будут заблокированы до сброса или ручного увеличения.
          </p>

          <div style={{ padding: "20px", backgroundColor: "#fafafa", borderRadius: "10px", border: "1px solid #eee", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#555570", marginBottom: "8px" }}>
              <span>Использовано за {period}</span>
              <strong style={{ color: "#1a1a2e" }}>${usedUsd} / ${limitUsd}</strong>
            </div>
            <div style={{ height: "8px", backgroundColor: "#eee", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${percentUsed}%`, backgroundColor: barColor, borderRadius: "999px" }} />
            </div>
            <p style={{ fontSize: "12px", color: "#999", margin: "8px 0 0" }}>Осталось ≈ ${(limitUsd - usedUsd).toFixed(2)}</p>
          </div>

          <div style={{ textAlign: "center" as const }}>
            <a href="#" style={{ display: "inline-block", padding: "14px 36px", backgroundColor: "#00ffaa", color: "#0a0a1a", fontSize: "15px", fontWeight: 600, borderRadius: "8px", textDecoration: "none" }}>
              Увеличить лимит
            </a>
          </div>
          <p style={{ fontSize: "13px", color: "#999", lineHeight: 1.5, margin: "24px 0 0", textAlign: "center" as const }}>
            Настроить лимиты можно в разделе «Команда» → участник → «Настроить».
          </p>
        </div>
        <div style={{ padding: "20px 40px", backgroundColor: "#fafafa", borderTop: "1px solid #eee", textAlign: "center" as const }}>
          <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>© 2026 Nexagen. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

const TopUpRequestEmailTemplate = ({
  ownerName = "Alice Johnson",
  memberName = "j.rybakova",
  memberEmail = "j.rybakova@cdnvideo.ru",
  currentLimitUsd = 300,
  requestedLimitUsd = 500,
  period = "месяц" as "день" | "месяц",
  reason = "Заканчивается бюджет на генерацию баннеров к запуску нового продукта — нужно ещё ~$200 до конца месяца.",
}: {
  ownerName?: string;
  memberName?: string;
  memberEmail?: string;
  currentLimitUsd?: number;
  requestedLimitUsd?: number;
  period?: "день" | "месяц";
  reason?: string;
}) => (
  <div style={{ fontFamily: "'Inter', Arial, sans-serif", backgroundColor: "#f4f4f5", padding: "40px 20px" }}>
    <div style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
      <div style={{ background: "linear-gradient(135deg, #00ffaa, #a855f7)", padding: "32px 40px", textAlign: "center" as const }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0a0a1a", fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>NEXAGEN</h1>
      </div>
      <div style={{ padding: "40px" }}>
        <div style={{ display: "inline-block", padding: "6px 12px", borderRadius: "6px", backgroundColor: "rgba(168,85,247,0.12)", color: "#7c3aed", fontSize: "12px", fontWeight: 600, marginBottom: "16px" }}>
          Запрос на увеличение лимита
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1a1a2e", margin: "0 0 16px" }}>Участник просит увеличить бюджет</h2>
        <p style={{ fontSize: "15px", color: "#555570", lineHeight: 1.6, margin: "0 0 12px" }}>Привет, {ownerName}!</p>
        <p style={{ fontSize: "15px", color: "#555570", lineHeight: 1.6, margin: "0 0 20px" }}>
          <strong style={{ color: "#1a1a2e" }}>{memberName}</strong> ({memberEmail}) отправил запрос на увеличение лимита на {period}.
        </p>

        <div style={{ padding: "20px", backgroundColor: "#fafafa", borderRadius: "10px", border: "1px solid #eee", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #eee" }}>
            <span style={{ fontSize: "13px", color: "#555570" }}>Текущий лимит</span>
            <strong style={{ color: "#1a1a2e", fontSize: "14px" }}>${currentLimitUsd} / {period}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 4px" }}>
            <span style={{ fontSize: "13px", color: "#555570" }}>Запрошено</span>
            <strong style={{ color: "#00b37e", fontSize: "16px" }}>${requestedLimitUsd} / {period}</strong>
          </div>
        </div>

        <div style={{ padding: "16px 20px", backgroundColor: "#f8f8fb", borderRadius: "8px", borderLeft: "3px solid #a855f7", marginBottom: "28px" }}>
          <p style={{ fontSize: "12px", color: "#999", margin: "0 0 6px", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Комментарий</p>
          <p style={{ fontSize: "14px", color: "#1a1a2e", lineHeight: 1.5, margin: 0 }}>{reason}</p>
        </div>

        <div style={{ textAlign: "center" as const }}>
          <a href="#" style={{ display: "inline-block", padding: "14px 28px", backgroundColor: "#00ffaa", color: "#0a0a1a", fontSize: "15px", fontWeight: 600, borderRadius: "8px", textDecoration: "none", marginRight: "8px" }}>
            Одобрить
          </a>
          <a href="#" style={{ display: "inline-block", padding: "14px 28px", backgroundColor: "#ffffff", color: "#1a1a2e", fontSize: "15px", fontWeight: 600, borderRadius: "8px", textDecoration: "none", border: "1px solid #ddd" }}>
            Отклонить
          </a>
        </div>
        <p style={{ fontSize: "13px", color: "#999", lineHeight: 1.5, margin: "24px 0 0", textAlign: "center" as const }}>
          Или откройте раздел «Команда» → «Запросы на лимиты».
        </p>
      </div>
      <div style={{ padding: "20px 40px", backgroundColor: "#fafafa", borderTop: "1px solid #eee", textAlign: "center" as const }}>
        <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>© 2026 Nexagen. All rights reserved.</p>
      </div>
    </div>
  </div>
);

type TemplateKey = "welcome" | "invite" | "reset" | "limit-warning" | "topup-request";

const EmailPreviewPage = () => {
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>("limit-warning");

  const tabs: { key: TemplateKey; label: string; subject: string }[] = [
    { key: "welcome", label: "Welcome / Set Password", subject: "Welcome to Nexagen — set your password" },
    { key: "invite", label: "Team Invitation", subject: "You've been invited to join Nexagen" },
    { key: "reset", label: "Password Reset", subject: "Reset your Nexagen password" },
    { key: "limit-warning", label: "Лимит подходит к концу", subject: "⚠ Осталось 5% лимита у участника j.rybakova" },
    { key: "topup-request", label: "Запрос на доп. бюджет", subject: "j.rybakova просит увеличить лимит до $500/мес" },
  ];
  const active = tabs.find((t) => t.key === activeTemplate)!;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Email Templates Preview</h1>
        <p className="text-sm text-muted-foreground mb-6">Preview how email templates will look to recipients.</p>

        <div className="flex gap-3 mb-6 flex-wrap">
          {tabs.map((t) => (
            <Button
              key={t.key}
              variant={activeTemplate === t.key ? "glow" : "secondary"}
              onClick={() => setActiveTemplate(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Subject:</strong> {active.subject}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong className="text-foreground">From:</strong> noreply@nexagen.ai
            </p>
          </div>
          <div className="overflow-auto">
            {activeTemplate === "invite" && <InviteEmailTemplate />}
            {activeTemplate === "reset" && <ResetPasswordEmailTemplate />}
            {activeTemplate === "welcome" && <WelcomeEmailTemplate />}
            {activeTemplate === "limit-warning" && <LimitWarningEmailTemplate />}
            {activeTemplate === "topup-request" && <TopUpRequestEmailTemplate />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPreviewPage;
