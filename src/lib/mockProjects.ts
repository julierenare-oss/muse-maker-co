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
  // ---------- Brand Refresh 2026 ----------
  {
    uuid: "mock-c-brand-1",
    title: "Logo exploration — minimal marks",
    type: "image",
    projectId: "mock-p-brand",
    createdAt: "2026-06-02T10:00:00Z",
    messages: [
      {
        role: "user",
        content:
          "Загружаю референсы конкурентов и текущий гайдлайн. Нужен минималистичный знак: геометрия, один акцентный цвет, читаемость от 16px.",
        attachments: [img("brandref1"), img("brandref2"), doc("brand-guidelines-v1.pdf")],
      },
      {
        role: "assistant",
        content:
          "Собрал 4 направления:\n\n1. **Monogram N** — жёсткая сетка, 2 модуля.\n2. **Aperture** — кольцо с разрывом, хорошо масштабируется.\n3. **Signal** — три штриха, отсылка к передаче данных.\n4. **Prism** — грань с градиентом (только для digital).\n\nВсе варианты проверены на 16/24/64 px.",
        attachments: [bigImg("logo1"), bigImg("logo2"), bigImg("logo3"), bigImg("logo4")],
      },
      {
        role: "user",
        content: "Возьмём Aperture. Покажи в монохроме и на тёмном фоне.",
      },
      {
        role: "assistant",
        content: "Готово: монохром, инверсия, safe-area и минимальные размеры на одном листе.",
        attachments: [bigImg("logo-aperture-mono"), bigImg("logo-aperture-dark"), doc("logo-aperture-kit.zip")],
      },
    ],
  },
  {
    uuid: "mock-c-brand-2",
    title: "Brand voice guidelines",
    type: "text",
    projectId: "mock-p-brand",
    createdAt: "2026-06-05T12:00:00Z",
    messages: [
      {
        role: "user",
        content: "Собери tone-of-voice на основе аудита конкурентов. Аудитория — технические специалисты.",
        attachments: [doc("competitor-audit.docx"), doc("interviews-notes.md")],
      },
      {
        role: "assistant",
        content:
          "Драфт готов. Ключевые принципы: точность вместо пафоса, короткие предложения, никаких превосходных степеней. Внутри — 12 пар «пишем / не пишем» и словарь терминов.",
        attachments: [doc("brand-voice-v2.pdf"), doc("brand-voice-v2.md")],
      },
      {
        role: "user",
        content: "Добавь раздел про письма и уведомления в продукте.",
      },
      {
        role: "assistant",
        content: "Добавил: транзакционные письма, ошибки, лимиты. Для каждого — шаблон и пример.",
        attachments: [doc("brand-voice-v3.pdf")],
      },
    ],
  },
  {
    uuid: "mock-c-brand-3",
    title: "Палитра и типографика",
    type: "image",
    projectId: "mock-p-brand",
    createdAt: "2026-06-07T09:20:00Z",
    messages: [
      {
        role: "user",
        content: "Нужна палитра под тёмный интерфейс + пара шрифтов.",
        attachments: [img("palette-ref")],
      },
      {
        role: "assistant",
        content:
          "Базовый фон #0a0e17, поверхность #121826, акценты #2de6b3 и #8b5cf6. Заголовки — Space Grotesk, текст — DM Sans. Контраст AA пройден на всех парах.",
        attachments: [bigImg("palette-sheet"), bigImg("type-scale"), doc("design-tokens.json")],
      },
    ],
  },

  // ---------- Product Launch — Nova X ----------
  {
    uuid: "mock-c-launch-1",
    title: "Hero visuals for landing page",
    type: "image",
    projectId: "mock-p-launch",
    createdAt: "2026-05-21T09:00:00Z",
    messages: [
      {
        role: "user",
        content: "Стиль для hero-секции: продукт на тёмном фоне, объёмный свет, без стоковых людей.",
        attachments: [img("herostyle1"), img("herostyle2"), doc("landing-wireframe.fig")],
      },
      {
        role: "assistant",
        content: "Три варианта композиции: центр, диагональ и разрез. Все 2560×1440, есть версия под мобильный кроп.",
        attachments: [bigImg("hero1"), bigImg("hero2"), bigImg("hero3")],
      },
      {
        role: "user",
        content: "Второй вариант, но холоднее и с отражением на поверхности.",
      },
      {
        role: "assistant",
        content: "Обновил: холодный свет, отражение, добавил слой с шумом для печати.",
        attachments: [bigImg("hero2-cold"), bigImg("hero2-cold-mobile")],
      },
    ],
  },
  {
    uuid: "mock-c-launch-2",
    title: "Press release copy",
    type: "text",
    projectId: "mock-p-launch",
    createdAt: "2026-05-23T15:20:00Z",
    messages: [
      {
        role: "user",
        content: "Пресс-релиз о запуске Nova X: 1 страница, цитата CEO, три ключевые цифры.",
        attachments: [doc("nova-x-factsheet.xlsx")],
      },
      {
        role: "assistant",
        content:
          "Готово в двух языках. Лид — 2 предложения, дальше блок цифр (−40% latency, 3× throughput, 99.95% uptime), цитата и boilerplate.",
        attachments: [doc("press-release-EN.pdf"), doc("press-release-RU.docx")],
      },
    ],
  },
  {
    uuid: "mock-c-launch-3",
    title: "Product teaser 10s",
    type: "video",
    projectId: "mock-p-launch",
    createdAt: "2026-05-25T18:00:00Z",
    messages: [
      {
        role: "user",
        content: "Тизер 10 секунд по раскадровке, вертикаль 9:16, без озвучки.",
        attachments: [img("teaserboard"), doc("teaser-storyboard.pdf")],
      },
      {
        role: "assistant",
        content: "Два рендера: динамичный и спокойный. Оба 10s, 30fps, с местом под логотип в конце.",
        attachments: [vid("BigBuckBunny"), vid("ElephantsDream")],
      },
      {
        role: "user",
        content: "Возьмём первый. Сделай ещё горизонталь 16:9.",
      },
      {
        role: "assistant",
        content: "Готова горизонтальная версия и превью-кадр для постера.",
        attachments: [vid("ForBiggerJoyrides"), bigImg("teaser-poster")],
      },
    ],
  },
  {
    uuid: "mock-c-launch-4",
    title: "FAQ и возражения",
    type: "text",
    projectId: "mock-p-launch",
    createdAt: "2026-05-27T11:10:00Z",
    messages: [
      {
        role: "user",
        content: "Собери FAQ по продукту для сейлзов: цена, миграция, безопасность.",
        attachments: [doc("sales-calls-summary.md")],
      },
      {
        role: "assistant",
        content: "18 вопросов с короткими ответами и ссылками на документацию. Отдельный блок — 5 частых возражений.",
        attachments: [doc("nova-x-faq.pdf"), doc("objections-cheatsheet.pdf")],
      },
    ],
  },

  // ---------- Social Campaign Q3 ----------
  {
    uuid: "mock-c-social-1",
    title: "Instagram carousels — July",
    type: "image",
    projectId: "mock-p-social",
    createdAt: "2026-05-15T10:30:00Z",
    messages: [
      {
        role: "user",
        content: "Референсы каруселей. Нужна серия из 6 постов в едином стиле, 1080×1350.",
        attachments: [img("ig1"), img("ig2"), img("ig3")],
      },
      {
        role: "assistant",
        content: "Серия готова: обложка, 4 контентных слайда, CTA. Единая сетка и типографика.",
        attachments: [
          bigImg("post1"),
          bigImg("post2"),
          bigImg("post3"),
          bigImg("post4"),
          bigImg("post5"),
          bigImg("post6"),
        ],
      },
    ],
  },
  {
    uuid: "mock-c-social-2",
    title: "Captions & hashtags",
    type: "text",
    projectId: "mock-p-social",
    createdAt: "2026-05-16T11:00:00Z",
    messages: [
      {
        role: "user",
        content: "Подписи к 6 постам + хэштеги. Тон — спокойный, без эмодзи-спама.",
        attachments: [doc("content-plan-q3.xlsx")],
      },
      {
        role: "assistant",
        content: "Готово: по 2 варианта подписи на пост, отдельно 3 набора хэштегов (широкий, нишевый, брендовый).",
        attachments: [doc("captions.csv"), doc("hashtags.txt")],
      },
    ],
  },
  {
    uuid: "mock-c-social-3",
    title: "Reels — 3 короткие нарезки",
    type: "video",
    projectId: "mock-p-social",
    createdAt: "2026-05-18T16:40:00Z",
    messages: [
      {
        role: "user",
        content: "Из промо-ролика сделай три вертикальные нарезки по 8–12 секунд.",
        attachments: [vid("ForBiggerMeltdowns"), doc("subtitles.srt")],
      },
      {
        role: "assistant",
        content: "Три нарезки с вшитыми субтитрами и разными хуками в первые 1.5 секунды.",
        attachments: [vid("ForBiggerBlazes"), vid("ForBiggerEscapes"), vid("ForBiggerFun")],
      },
    ],
  },

  // ---------- Market Research EU ----------
  {
    uuid: "mock-c-research-1",
    title: "EU AI market — quick take",
    type: "text",
    projectId: "mock-p-research",
    createdAt: "2026-04-29T09:15:00Z",
    messages: [
      {
        role: "user",
        content: "На основе приложенных источников — краткий обзор рынка AI в EU: объём, рост, игроки.",
        attachments: [doc("statista-eu-ai.pdf"), doc("mckinsey-2026.pdf"), doc("eurostat-2025.csv")],
      },
      {
        role: "assistant",
        content:
          "Отчёт на 6 страниц: объём рынка, CAGR по сегментам, топ-15 игроков, регуляторный контекст (AI Act) и три сценария до 2029.",
        attachments: [doc("eu-ai-market-report.pdf"), doc("eu-ai-market-tables.xlsx")],
      },
      {
        role: "user",
        content: "Добавь разрез по Германии и Франции отдельно.",
      },
      {
        role: "assistant",
        content: "Добавил два страновых приложения с бюджетами на AI и структурой спроса.",
        attachments: [doc("eu-ai-de-appendix.pdf"), doc("eu-ai-fr-appendix.pdf")],
      },
    ],
  },
  {
    uuid: "mock-c-research-2",
    title: "Карта конкурентов",
    type: "image",
    projectId: "mock-p-research",
    createdAt: "2026-05-02T13:30:00Z",
    messages: [
      {
        role: "user",
        content: "Сделай визуальную карту конкурентов по осям «цена / глубина интеграции».",
        attachments: [doc("competitors-raw.csv")],
      },
      {
        role: "assistant",
        content: "Карта на 22 компании, четыре кластера подписаны. Есть светлая и тёмная версии.",
        attachments: [bigImg("competitor-map-dark"), bigImg("competitor-map-light"), doc("competitor-map.svg")],
      },
    ],
  },
  {
    uuid: "mock-c-research-3",
    title: "Интервью с клиентами — сводка",
    type: "text",
    projectId: "mock-p-research",
    createdAt: "2026-05-04T10:05:00Z",
    messages: [
      {
        role: "user",
        content: "12 расшифровок интервью. Нужны повторяющиеся боли и цитаты.",
        attachments: [doc("interviews-batch1.zip"), doc("interviews-batch2.zip")],
      },
      {
        role: "assistant",
        content:
          "Выделил 7 повторяющихся тем. Топ-3: непрозрачные лимиты, долгая интеграция, отсутствие ролевой модели. К каждой — 3 цитаты и частота упоминаний.",
        attachments: [doc("interview-insights.pdf"), doc("quotes-bank.xlsx")],
      },
    ],
  },

  // ---------- Video Ads Sprint ----------
  {
    uuid: "mock-c-video-1",
    title: "15s pre-roll variations",
    type: "video",
    projectId: "mock-p-video",
    createdAt: "2026-04-12T13:00:00Z",
    messages: [
      {
        role: "user",
        content: "Скрипт готов — нужны три варианта pre-roll по 15 секунд с разными финальными CTA.",
        attachments: [doc("preroll-script.md"), doc("brand-sound.mp3")],
      },
      {
        role: "assistant",
        content: "Три ролика: «скидка», «демо», «регистрация». Одинаковая первая секунда, разные концовки.",
        attachments: [vid("ForBiggerBlazes"), vid("ForBiggerEscapes"), vid("ForBiggerFun")],
      },
      {
        role: "user",
        content: "Сделай ещё 6-секундные bumper-версии.",
      },
      {
        role: "assistant",
        content: "Готовы три bumper-ролика по 6 секунд под YouTube.",
        attachments: [vid("ForBiggerJoyrides"), vid("ForBiggerMeltdowns"), vid("Sintel")],
      },
    ],
  },
  {
    uuid: "mock-c-video-2",
    title: "Storyboard frames",
    type: "image",
    projectId: "mock-p-video",
    createdAt: "2026-04-14T10:00:00Z",
    messages: [
      {
        role: "user",
        content: "Референсы кадров и тайминг. Нужна раскадровка на 8 сцен.",
        attachments: [img("sb1"), img("sb2"), doc("timing-sheet.xlsx")],
      },
      {
        role: "assistant",
        content: "Раскадровка на 8 кадров с подписями по действию и длительности каждой сцены.",
        attachments: [
          bigImg("frame1"),
          bigImg("frame2"),
          bigImg("frame3"),
          bigImg("frame4"),
          bigImg("frame5"),
          bigImg("frame6"),
          bigImg("frame7"),
          bigImg("frame8"),
        ],
      },
    ],
  },
  {
    uuid: "mock-c-video-3",
    title: "Тексты для озвучки",
    type: "text",
    projectId: "mock-p-video",
    createdAt: "2026-04-16T09:45:00Z",
    messages: [
      {
        role: "user",
        content: "Нужен закадровый текст под три ролика, укладка в 15 секунд.",
        attachments: [doc("preroll-script.md")],
      },
      {
        role: "assistant",
        content: "Три версии по 34–38 слов — это ровно 14.5 секунды при спокойном темпе. Разметил паузы.",
        attachments: [doc("voiceover-scripts.pdf")],
      },
    ],
  },
];

export const MOCK_MESSAGES_BY_CONV: Record<string, MockConversation["messages"]> =
  Object.fromEntries(MOCK_CONVERSATIONS.map((c) => [c.uuid, c.messages]));

export const isMockId = (id?: string | null) => !!id && id.startsWith(MOCK_PREFIX);
