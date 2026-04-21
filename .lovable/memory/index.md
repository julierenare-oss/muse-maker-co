# Memory: index.md
Updated: now

# Project Memory

## Core
NEXAGEN MVP. Deep navy bg, neon teal/purple accents, glassmorphism. Right-side settings panel.
Zustand for global chat state. Login/password JWT Bearer auth flow.
API requires `X-Project-ID: 1` and `Authorization: Bearer <token>`. Modality routes: `/conversations/text`, `.../image`, `.../video`.
Prompt limit: 2000 chars. No `top_p` parameter.
Navigation: 7 sections (New Request, History, Dashboard, Billing, Team, API Keys, Settings). Do NOT re-add Gallery or Prompt Library.

## Memories
- [Visual Design](mem://style/visual-design) — High-contrast dark & techy aesthetic with neon teal/purple accents
- [Role System](mem://auth/role-system) — Owner and Member roles with access control differences
- [Auth Method](mem://auth/auth-method) — Login/password JWT Bearer flow
- [Planned Workflows](mem://auth/planned-workflows) — Password reset and Team invitations
- [Generation Modalities](mem://features/generation-modalities) — Text, Image, and Video generation specific interfaces
- [API Proxy Strategy](mem://architecture/api-proxy-strategy) — Acts as an API proxy for third-party AI providers
- [API Integration](mem://architecture/api-integration) — Specific routing and headers for API calls
- [State Management](mem://architecture/state-management) — Global chat state using Zustand
- [Billing Details](mem://features/billing) — Monthly report download mechanism bypassing S3 CORS
- [History](mem://features/history) — Chat history navigation and modality switching
- [Generation Controls](mem://features/generation-controls) — Send and Stop buttons behavior
- [Chat Streaming](mem://features/chat-streaming) — Server-Sent Events (SSE) parsing and transient states
- [File Attachments](mem://features/file-attachments) — Multi-file uploads and rendering
- [Generation Parameters](mem://features/generation-parameters) — Settings available per modality
- [User Personalization](mem://features/user-personalization) — Profile details via /user_profile endpoint
- [Generation Limits](mem://constraints/generation-limits) — User prompt restrictions
- [Navigation Structure](mem://project/navigation-structure) — 7-section navigation including Dashboard
- [Layout Organization](mem://style/layout-organization) — Model selection and parameters positioning
- [Chat UI Formatting](mem://features/chat-ui-formatting) — Markdown, code blocks, and copy buttons
