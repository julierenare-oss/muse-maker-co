// Mock projects & conversations used for demo/preview.
// Merged into HistoryPage on top of real API data — mock UUIDs are prefixed
// so real handlers (open/delete) can bail out gracefully.

import type { ConversationItem } from "./api";
import type { Project } from "./projects";

export const MOCK_PREFIX = "mock-";

export interface MockConversation extends ConversationItem {
  projectId: string;
  createdAt: string;
  messages: {
    role: "user" | "assistant";
    content: string;
    attachments?: string[];
  }[];
}

const img = (seed: string, ext = "jpg") =>
  `https://picsum.photos/seed/${seed}/800/600.${ext}`;
const bigImg = (seed: string) => `https://picsum.photos/seed/${seed}/1200/900.jpg`;

const doc = (name: string) => `https://example.com/files/${name}`;
const vid = (seed: string) =>
  `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/${seed}.mp4`;

export const MOCK_PROJECTS: Project[] = [
  { id: "mock-p-brand", name: "Brand Refresh 2026", createdAt: "2026-06-01T10:00:00Z" },
  { id: "mock-p-launch", name: "Product Launch — Nova X", createdAt: "2026-05-20T09:30:00Z" },
  { id: "mock-p-social", name: "Social Campaign Q3", createdAt: "2026-05-12T14:15:00Z" },
  { id: "mock-p-research", name: "Market Research EU", createdAt: "2026-04-28T11:00:00Z" },
  { id: "mock-p-video", name: "Video Ads Sprint", createdAt: "2026-04-10T16:45:00Z" },
];

export const MOCK_CONVERSATIONS: MockConversation[] = [
  // Brand Refresh
  {
    uuid: "mock-c-brand-1",
    title: "Logo exploration — minimal marks",
    type: "image",
    projectId: "mock-p-brand",
    createdAt: "2026-06-02T10:00:00Z",
    messages: [
      { role: "user", content: "Референсы для логотипа", attachments: [img("brandref1"), img("brandref2"), doc("brand-guidelines-v1.pdf")] },
      { role: "assistant", content: "Вот 4 варианта логотипа", attachments: [bigImg("logo1"), bigImg("logo2"), bigImg("logo3"), bigImg("logo4")] },
    ],
  },
  {
    uuid: "mock-c-brand-2",
    title: "Brand voice guidelines",
    type: "text",
    projectId: "mock-p-brand",
    createdAt: "2026-06-05T12:00:00Z",
    messages: [
      { role: "user", content: "Draft the tone-of-voice document", attachments: [doc("competitor-audit.docx")] },
      { role: "assistant", content: "Готов драфт брендбука", attachments: [doc("brand-voice-v2.pdf"), doc("brand-voice-v2.md")] },
    ],
  },
  // Nova X launch
  {
    uuid: "mock-c-launch-1",
    title: "Hero visuals for landing page",
    type: "image",
    projectId: "mock-p-launch",
    createdAt: "2026-05-21T09:00:00Z",
    messages: [
      { role: "user", content: "Стиль для hero-секции", attachments: [img("herostyle1"), img("herostyle2")] },
      { role: "assistant", content: "Варианты hero", attachments: [bigImg("hero1"), bigImg("hero2"), bigImg("hero3")] },
    ],
  },
  {
    uuid: "mock-c-launch-2",
    title: "Press release copy",
    type: "text",
    projectId: "mock-p-launch",
    createdAt: "2026-05-23T15:20:00Z",
    messages: [
      { role: "user", content: "Напиши пресс-релиз о запуске Nova X" },
      { role: "assistant", content: "Готово", attachments: [doc("press-release-EN.pdf"), doc("press-release-RU.docx")] },
    ],
  },
  {
    uuid: "mock-c-launch-3",
    title: "Product teaser 10s",
    type: "video",
    projectId: "mock-p-launch",
    createdAt: "2026-05-25T18:00:00Z",
    messages: [
      { role: "user", content: "Тизер продукта, 10 секунд", attachments: [img("teaserboard")] },
      { role: "assistant", content: "Готов тизер", attachments: [vid("BigBuckBunny"), vid("ElephantsDream")] },
    ],
  },
  // Social campaign
  {
    uuid: "mock-c-social-1",
    title: "Instagram carousels — July",
    type: "image",
    projectId: "mock-p-social",
    createdAt: "2026-05-15T10:30:00Z",
    messages: [
      { role: "user", content: "Референсы карусели", attachments: [img("ig1"), img("ig2"), img("ig3")] },
      { role: "assistant", content: "6 постов", attachments: [bigImg("post1"), bigImg("post2"), bigImg("post3"), bigImg("post4"), bigImg("post5"), bigImg("post6")] },
    ],
  },
  {
    uuid: "mock-c-social-2",
    title: "Captions & hashtags",
    type: "text",
    projectId: "mock-p-social",
    createdAt: "2026-05-16T11:00:00Z",
    messages: [
      { role: "user", content: "Подготовь подписи и хэштеги" },
      { role: "assistant", content: "Готово", attachments: [doc("captions.csv"), doc("hashtags.txt")] },
    ],
  },
  // Market research
  {
    uuid: "mock-c-research-1",
    title: "EU AI market — quick take",
    type: "text",
    projectId: "mock-p-research",
    createdAt: "2026-04-29T09:15:00Z",
    messages: [
      { role: "user", content: "Дай отчёт о рынке AI в EU", attachments: [doc("statista-eu-ai.pdf"), doc("mckinsey-2026.pdf")] },
      { role: "assistant", content: "Отчёт готов", attachments: [doc("eu-ai-market-report.pdf"), doc("eu-ai-market-tables.xlsx")] },
    ],
  },
  // Video Ads Sprint
  {
    uuid: "mock-c-video-1",
    title: "15s pre-roll variations",
    type: "video",
    projectId: "mock-p-video",
    createdAt: "2026-04-12T13:00:00Z",
    messages: [
      { role: "user", content: "Скрипт для pre-roll", attachments: [doc("preroll-script.md")] },
      { role: "assistant", content: "Три варианта", attachments: [vid("ForBiggerBlazes"), vid("ForBiggerEscapes"), vid("ForBiggerFun")] },
    ],
  },
  {
    uuid: "mock-c-video-2",
    title: "Storyboard frames",
    type: "image",
    projectId: "mock-p-video",
    createdAt: "2026-04-14T10:00:00Z",
    messages: [
      { role: "user", content: "Референсы кадров", attachments: [img("sb1"), img("sb2")] },
      { role: "assistant", content: "Раскадровка", attachments: [bigImg("frame1"), bigImg("frame2"), bigImg("frame3"), bigImg("frame4"), bigImg("frame5"), bigImg("frame6"), bigImg("frame7"), bigImg("frame8")] },
    ],
  },
];

export const MOCK_MESSAGES_BY_CONV: Record<string, MockConversation["messages"]> =
  Object.fromEntries(MOCK_CONVERSATIONS.map((c) => [c.uuid, c.messages]));

export const isMockId = (id?: string | null) => !!id && id.startsWith(MOCK_PREFIX);
