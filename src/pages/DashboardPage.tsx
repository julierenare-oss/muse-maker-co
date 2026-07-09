import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Activity, ArrowDownToLine, ArrowUpFromLine, Calendar as CalendarIcon,
  Download, Filter, FileSpreadsheet, FileText, Search, Users, Zap,
  Image as ImageIcon, Video as VideoIcon, MessageSquare, Trophy,
  ChevronLeft, ChevronRight, RefreshCw,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* ---------------- Models ---------------- */
type ModelType = "text" | "image" | "video";
interface ModelDef { name: string; type: ModelType; }

const TEXT_MODELS = [
  "gpt-4o", "gpt-4o-mini", "claude-opus-4", "claude-sonnet-4", "gemini-2.5-pro",
  "gemini-2.5-flash", "llama-3.3-70b", "mistral-large-2", "deepseek-v3", "qwen-2.5-72b",
];
const IMAGE_MODELS = [
  "dall-e-3", "midjourney-v7", "stable-diffusion-3.5", "flux-pro-1.1", "flux-schnell",
  "imagen-3", "ideogram-v2", "leonardo-phoenix", "playground-v3", "recraft-v3",
];
const VIDEO_MODELS = [
  "sora-2", "veo-3", "runway-gen-4", "pika-2.0", "kling-1.6",
  "luma-dream-machine", "haiper-2.5", "hailuo-01", "cogvideox-5b", "mochi-1",
];

const ALL_MODELS: ModelDef[] = [
  ...TEXT_MODELS.map((n) => ({ name: n, type: "text" as ModelType })),
  ...IMAGE_MODELS.map((n) => ({ name: n, type: "image" as ModelType })),
  ...VIDEO_MODELS.map((n) => ({ name: n, type: "video" as ModelType })),
];
const MODEL_NAMES = ALL_MODELS.map((m) => m.name);
const MODEL_TYPE: Record<string, ModelType> = Object.fromEntries(
  ALL_MODELS.map((m) => [m.name, m.type]),
);

const TYPE_COLOR: Record<ModelType, string> = {
  text: "hsl(165 100% 50%)",   // primary teal
  image: "hsl(270 100% 65%)",  // accent purple
  video: "hsl(35 100% 60%)",   // amber
};
const TYPE_ICON: Record<ModelType, typeof MessageSquare> = {
  text: MessageSquare,
  image: ImageIcon,
  video: VideoIcon,
};

/* ---------------- Clients ---------------- */
const CLIENTS = [
  "Acme Corp", "Globex", "Initech", "Umbrella", "Stark Industries",
  "Wayne Enterprises", "Cyberdyne", "Soylent", "Massive Dynamic", "Tyrell Corp",
  "Aperture Science", "Black Mesa", "Weyland-Yutani", "Oscorp", "Hooli",
  "Pied Piper", "Dunder Mifflin", "Vandelay", "Nakatomi", "Los Pollos",
  "Vault-Tec", "Rekall", "Blue Sun", "Combine", "Prime Focus",
  "Northwind", "Contoso", "Fabrikam", "Adventure Works", "Litware Labs",
];

/* ---------------- Seeded RNG for stable mocks ---------------- */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface RequestRow {
  ts: Date;
  model: string;
  type: ModelType;
  client: string;
  inputTokens: number;
  outputTokens: number;
}

/* Generate ~4000 requests over the last 14 days, aligned to 10-min buckets. */
const ANCHOR = new Date("2026-04-21T23:50:00Z");
const RAW: RequestRow[] = (() => {
  const rand = mulberry32(1337);
  const rows: RequestRow[] = [];
  const N = 4000;
  const spanMs = 14 * 24 * 60 * 60 * 1000;
  const start = ANCHOR.getTime() - spanMs;

  // Give some clients more weight for realism
  const clientWeights = CLIENTS.map((_, i) => 1 + rand() * (i < 8 ? 6 : 2));
  const sumCW = clientWeights.reduce((s, x) => s + x, 0);

  const pickWeighted = (weights: number[], sum: number) => {
    let r = rand() * sum;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return weights.length - 1;
  };

  for (let i = 0; i < N; i++) {
    // Time — 10-minute aligned, biased toward business hours
    const raw = start + rand() * spanMs;
    const d = new Date(Math.floor(raw / (10 * 60 * 1000)) * 10 * 60 * 1000);

    const ci = pickWeighted(clientWeights, sumCW);
    const client = CLIENTS[ci];

    const typeRoll = rand();
    const type: ModelType = typeRoll < 0.55 ? "text" : typeRoll < 0.85 ? "image" : "video";
    const pool = type === "text" ? TEXT_MODELS : type === "image" ? IMAGE_MODELS : VIDEO_MODELS;
    const model = pool[Math.floor(rand() * pool.length)];

    let inputTokens = 0;
    let outputTokens = 0;
    if (type === "text") {
      inputTokens = Math.round(400 + rand() * 6000);
      outputTokens = Math.round(200 + rand() * 3000);
    } else if (type === "image") {
      inputTokens = Math.round(80 + rand() * 400);
      outputTokens = Math.round(1500 + rand() * 3500); // treat pixels-equivalent
    } else {
      inputTokens = Math.round(100 + rand() * 500);
      outputTokens = Math.round(8000 + rand() * 20000);
    }

    rows.push({ ts: d, model, type, client, inputTokens, outputTokens });
  }
  rows.sort((a, b) => a.ts.getTime() - b.ts.getTime());
  return rows;
})();

/* ---------------- Filters ---------------- */
type RangePreset = "10m" | "1h" | "6h" | "24h" | "7d" | "14d" | "custom";
type Granularity = "auto" | "10min" | "hour" | "day" | "week";

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: "10m", label: "Last 10 min" },
  { value: "1h", label: "Last 1h" },
  { value: "6h", label: "Last 6h" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
  { value: "custom", label: "Custom range" },
];

const presetToRange = (p: RangePreset, anchor: Date): { from: Date; to: Date } => {
  const to = new Date(anchor);
  const from = new Date(to);
  switch (p) {
    case "10m": from.setMinutes(from.getMinutes() - 10); break;
    case "1h": from.setHours(from.getHours() - 1); break;
    case "6h": from.setHours(from.getHours() - 6); break;
    case "24h": from.setDate(from.getDate() - 1); break;
    case "7d": from.setDate(from.getDate() - 7); break;
    case "14d": from.setDate(from.getDate() - 14); break;
    case "custom": from.setDate(from.getDate() - 14); break;
  }
  return { from, to };
};

const autoGranularity = (from: Date, to: Date): Exclude<Granularity, "auto"> => {
  const hours = (to.getTime() - from.getTime()) / 36e5;
  if (hours <= 6) return "10min";
  if (hours <= 48) return "hour";
  if (hours <= 24 * 21) return "day";
  return "week";
};

const bucketKey = (d: Date, g: Exclude<Granularity, "auto">) => {
  const x = new Date(d);
  if (g === "10min") {
    const ms = Math.floor(x.getTime() / (10 * 60 * 1000)) * 10 * 60 * 1000;
    return new Date(ms).toISOString();
  }
  if (g === "hour") { x.setUTCMinutes(0, 0, 0); return x.toISOString(); }
  if (g === "day") { x.setUTCHours(0, 0, 0, 0); return x.toISOString().slice(0, 10); }
  const day = x.getUTCDay();
  const diff = (day + 6) % 7;
  x.setUTCDate(x.getUTCDate() - diff);
  x.setUTCHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
};

const labelBucket = (k: string, g: Exclude<Granularity, "auto">) => {
  if (g === "10min") return format(new Date(k), "MMM d, HH:mm");
  if (g === "hour") return format(new Date(k), "MMM d, HH:mm");
  if (g === "day") return format(new Date(k), "MMM d");
  return `W of ${format(new Date(k), "MMM d")}`;
};

const fmtNumber = (n: number) => n.toLocaleString("en-US");
const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `${(n / 1_000).toFixed(1)}k`
  : String(n);

/* ---------------- Component ---------------- */
const PAGE_SIZE = 8;

const DashboardPage = () => {
  const [preset, setPreset] = useState<RangePreset>("14d");
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date }>({
    from: new Date(ANCHOR.getTime() - 14 * 86400_000),
    to: ANCHOR,
  });
  const [granularity, setGranularity] = useState<Granularity>("auto");
  const [selectedTypes, setSelectedTypes] = useState<ModelType[]>(["text", "image", "video"]);
  const [selectedModels, setSelectedModels] = useState<string[]>([...MODEL_NAMES]);
  const [selectedClients, setSelectedClients] = useState<string[]>([...CLIENTS]);
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "models">("overview");
  const [clientQuery, setClientQuery] = useState("");
  const [clientSort, setClientSort] = useState<"requests" | "input" | "output" | "total">("requests");
  const [page, setPage] = useState(0);

  const range = preset === "custom" ? customRange : presetToRange(preset, ANCHOR);
  const effGran: Exclude<Granularity, "auto"> =
    granularity === "auto" ? autoGranularity(range.from, range.to) : granularity;

  const filtered = useMemo(
    () => RAW.filter(
      (r) =>
        r.ts >= range.from &&
        r.ts <= range.to &&
        selectedTypes.includes(r.type) &&
        selectedModels.includes(r.model) &&
        selectedClients.includes(r.client),
    ),
    [range.from, range.to, selectedTypes, selectedModels, selectedClients],
  );

  const totalRequests = filtered.length;
  const totalInput = filtered.reduce((s, r) => s + r.inputTokens, 0);
  const totalOutput = filtered.reduce((s, r) => s + r.outputTokens, 0);
  const activeClients = new Set(filtered.map((r) => r.client)).size;

  /* Time series */
  const reqOverTime = useMemo(() => {
    const map = new Map<string, { requests: number; input: number; output: number }>();
    filtered.forEach((r) => {
      const k = bucketKey(r.ts, effGran);
      const cur = map.get(k) ?? { requests: 0, input: 0, output: 0 };
      cur.requests += 1;
      cur.input += r.inputTokens;
      cur.output += r.outputTokens;
      map.set(k, cur);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([k, v]) => ({ bucket: k, label: labelBucket(k, effGran), ...v }));
  }, [filtered, effGran]);

  /* Per type */
  const byType = useMemo(() => {
    const types: ModelType[] = ["text", "image", "video"];
    return types.map((t) => {
      const rows = filtered.filter((r) => r.type === t);
      return {
        type: t,
        requests: rows.length,
        input: rows.reduce((s, r) => s + r.inputTokens, 0),
        output: rows.reduce((s, r) => s + r.outputTokens, 0),
      };
    });
  }, [filtered]);

  /* Per model */
  const byModel = useMemo(() => {
    const map = new Map<string, { requests: number; input: number; output: number }>();
    filtered.forEach((r) => {
      const cur = map.get(r.model) ?? { requests: 0, input: 0, output: 0 };
      cur.requests += 1;
      cur.input += r.inputTokens;
      cur.output += r.outputTokens;
      map.set(r.model, cur);
    });
    return Array.from(map.entries())
      .map(([model, v]) => ({ model, type: MODEL_TYPE[model], ...v }))
      .sort((a, b) => b.requests - a.requests);
  }, [filtered]);

  /* Per client with mini sparkline */
  const byClient = useMemo(() => {
    const map = new Map<string, { requests: number; input: number; output: number; series: Map<string, number> }>();
    filtered.forEach((r) => {
      const cur = map.get(r.client) ?? { requests: 0, input: 0, output: 0, series: new Map() };
      cur.requests += 1;
      cur.input += r.inputTokens;
      cur.output += r.outputTokens;
      const k = bucketKey(r.ts, effGran);
      cur.series.set(k, (cur.series.get(k) ?? 0) + 1);
      map.set(r.client, cur);
    });
    return Array.from(map.entries()).map(([client, v]) => ({
      client,
      requests: v.requests,
      input: v.input,
      output: v.output,
      total: v.input + v.output,
      spark: Array.from(v.series.entries())
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([, r]) => ({ v: r })),
    }));
  }, [filtered, effGran]);

  const clientsSorted = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    const list = byClient
      .filter((c) => !q || c.client.toLowerCase().includes(q));
    list.sort((a, b) => b[clientSort] - a[clientSort]);
    return list;
  }, [byClient, clientQuery, clientSort]);

  const topClients = useMemo(() => [...byClient].sort((a, b) => b.requests - a.requests).slice(0, 5), [byClient]);
  const maxTopReq = topClients[0]?.requests ?? 1;

  const totalPages = Math.max(1, Math.ceil(clientsSorted.length / PAGE_SIZE));
  const pagedClients = clientsSorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const toggleType = (t: ModelType) =>
    setSelectedTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const tooltipStyle = {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    color: "hsl(var(--popover-foreground))",
    fontSize: 12,
  } as const;

  /* ---------------- Exports ---------------- */
  const periodLabel = `${format(range.from, "dd.MM.yyyy_HHmm")}_${format(range.to, "dd.MM.yyyy_HHmm")}`;

  const exportXlsx = () => {
    const wb = XLSX.utils.book_new();
    const summary = [
      ["NEXAGEN — Analytics Report"],
      ["Period", `${format(range.from, "dd.MM.yyyy HH:mm")} — ${format(range.to, "dd.MM.yyyy HH:mm")} UTC`],
      ["Granularity", effGran],
      ["Total Requests", totalRequests],
      ["Total Input Tokens", totalInput],
      ["Total Output Tokens", totalOutput],
      ["Active Clients", activeClients],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["Time", "Requests", "Input Tokens", "Output Tokens"],
      ...reqOverTime.map((r) => [r.label, r.requests, r.input, r.output]),
    ]), "Timeseries");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["Client", "Requests", "Input Tokens", "Output Tokens"],
      ...clientsSorted.map((c) => [c.client, c.requests, c.input, c.output]),
    ]), "By Client");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["Model", "Type", "Requests", "Input Tokens", "Output Tokens"],
      ...byModel.map((m) => [m.model, m.type, m.requests, m.input, m.output]),
    ]), "By Model");
    XLSX.writeFile(wb, `nexagen_analytics_${periodLabel}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, W, 70, "F");
    doc.setTextColor(34, 211, 238);
    doc.setFontSize(18);
    doc.text("NEXAGEN — Analytics Report", 40, 35);
    doc.setTextColor(226, 232, 240);
    doc.setFontSize(10);
    doc.text(
      `Period: ${format(range.from, "dd.MM.yyyy HH:mm")} — ${format(range.to, "dd.MM.yyyy HH:mm")} UTC`,
      40, 55,
    );
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    let y = 95;
    doc.text(`Total Requests: ${fmtNumber(totalRequests)}`, 40, y); y += 16;
    doc.text(`Total Input Tokens: ${fmtNumber(totalInput)}`, 40, y); y += 16;
    doc.text(`Total Output Tokens: ${fmtNumber(totalOutput)}`, 40, y); y += 16;
    doc.text(`Active Clients: ${activeClients}`, 40, y); y += 6;

    autoTable(doc, {
      startY: y + 12,
      head: [["Client", "Requests", "Input Tokens", "Output Tokens"]],
      body: clientsSorted.map((c) => [c.client, fmtNumber(c.requests), fmtNumber(c.input), fmtNumber(c.output)]),
      headStyles: { fillColor: [34, 211, 238], textColor: 15 },
      styles: { fontSize: 9 },
      margin: { left: 40, right: 40 },
    });
    autoTable(doc, {
      head: [["Model", "Type", "Requests", "Input Tokens", "Output Tokens"]],
      body: byModel.map((m) => [m.model, m.type, fmtNumber(m.requests), fmtNumber(m.input), fmtNumber(m.output)]),
      headStyles: { fillColor: [168, 85, 247], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 40, right: 40 },
    });
    doc.save(`nexagen_analytics_${periodLabel}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            Аналитика запросов, токенов и моделей
            <span className="inline-flex items-center gap-1 text-[11px] text-primary/80">
              <RefreshCw className="h-3 w-3" /> обновление раз в 10 минут
            </span>
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="glow" size="sm" className="h-9">
              <Download className="h-4 w-4" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Export report</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportXlsx}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportPdf}>
              <FileText className="h-4 w-4 mr-2" /> PDF (.pdf)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters */}
      <Card className="card-glow">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="h-4 w-4" /> Filters
          </div>

          <Select value={preset} onValueChange={(v) => setPreset(v as RangePreset)}>
            <SelectTrigger className="w-[170px] h-9">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {preset === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 font-normal">
                  <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                  {format(customRange.from, "dd.MM.yyyy")} — {format(customRange.to, "dd.MM.yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={customRange.from}
                  selected={{ from: customRange.from, to: customRange.to }}
                  onSelect={(r) => {
                    if (r?.from && r?.to) setCustomRange({ from: r.from, to: r.to });
                  }}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          )}

          <Select value={granularity} onValueChange={(v) => setGranularity(v as Granularity)}>
            <SelectTrigger className="w-[170px] h-9">
              <SelectValue placeholder="Granularity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto ({effGran})</SelectItem>
              <SelectItem value="10min">10 minutes</SelectItem>
              <SelectItem value="hour">Hour</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
            </SelectContent>
          </Select>

          {/* Type chips */}
          <div className="flex items-center gap-1">
            {(["text", "image", "video"] as ModelType[]).map((t) => {
              const Icon = TYPE_ICON[t];
              const on = selectedTypes.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`h-9 px-3 rounded-md border text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                    on
                      ? "border-transparent text-background"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                  style={on ? { backgroundColor: TYPE_COLOR[t] } : undefined}
                >
                  <Icon className="h-3.5 w-3.5" /> {t}
                </button>
              );
            })}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 font-normal">
                Models: {selectedModels.length} / {MODEL_NAMES.length}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-[380px] overflow-auto">
              <DropdownMenuLabel>Filter models</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_MODELS.map((m) => (
                <DropdownMenuCheckboxItem
                  key={m.name}
                  checked={selectedModels.includes(m.name)}
                  onCheckedChange={() =>
                    setSelectedModels((prev) =>
                      prev.includes(m.name) ? prev.filter((x) => x !== m.name) : [...prev, m.name],
                    )
                  }
                  onSelect={(e) => e.preventDefault()}
                >
                  <span
                    className="w-2 h-2 rounded-full mr-2 inline-block"
                    style={{ backgroundColor: TYPE_COLOR[m.type] }}
                  />
                  {m.name}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedModels([...MODEL_NAMES])}>Select all</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedModels([])}>Clear</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 font-normal">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Clients: {selectedClients.length} / {CLIENTS.length}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 max-h-[380px] overflow-auto">
              <DropdownMenuLabel>Filter clients</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CLIENTS.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c}
                  checked={selectedClients.includes(c)}
                  onCheckedChange={() =>
                    setSelectedClients((prev) =>
                      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
                    )
                  }
                  onSelect={(e) => e.preventDefault()}
                >
                  {c}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedClients([...CLIENTS])}>Select all</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedClients([])}>Clear</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto text-xs text-muted-foreground">
            {format(range.from, "dd.MM.yyyy HH:mm")} → {format(range.to, "dd.MM.yyyy HH:mm")} UTC
          </div>
        </CardContent>
      </Card>

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" /> Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold gradient-text tabular-nums">{fmtNumber(totalRequests)}</div>
            <p className="text-xs text-muted-foreground mt-1">за выбранный период</p>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownToLine className="h-3.5 w-3.5" /> Input tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary tabular-nums">{compact(totalInput)}</div>
            <p className="text-xs text-muted-foreground mt-1">{fmtNumber(totalInput)}</p>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpFromLine className="h-3.5 w-3.5" /> Output tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent tabular-nums">{compact(totalOutput)}</div>
            <p className="text-xs text-muted-foreground mt-1">{fmtNumber(totalOutput)}</p>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-3.5 w-3.5" /> Active clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground tabular-nums">
              {activeClients}<span className="text-base text-muted-foreground"> / {CLIENTS.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">делали запросы в этот период</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setPage(0); }}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="clients" className="gap-2">
            <Users className="h-3.5 w-3.5" /> Clients
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2">
            <Zap className="h-3.5 w-3.5" /> Models
          </TabsTrigger>
        </TabsList>

        {/* ---------- OVERVIEW ---------- */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Requests over time · granularity: {effGran}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reqOverTime} margin={{ top: 10, right: 12, bottom: 20, left: 0 }}>
                  <defs>
                    <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} minTickGap={40} />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtNumber(v)} />
                  <Area type="monotone" dataKey="requests" name="Requests" stroke="hsl(var(--primary))" fill="url(#gReq)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Tokens over time</CardTitle>
              </CardHeader>
              <CardContent className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reqOverTime} margin={{ top: 10, right: 12, bottom: 20, left: 0 }}>
                    <defs>
                      <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} minTickGap={40} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} tickFormatter={(v) => compact(v)} />
                    <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtNumber(v)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="input" name="Input" stroke="hsl(var(--primary))" fill="url(#gIn)" strokeWidth={2} />
                    <Area type="monotone" dataKey="output" name="Output" stroke="hsl(var(--accent))" fill="url(#gOut)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Requests by modality</CardTitle>
              </CardHeader>
              <CardContent className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byType.filter((t) => t.requests > 0)}
                      dataKey="requests"
                      nameKey="type"
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={95} paddingAngle={2}
                      label={({ type, requests }) => `${type} · ${requests}`}
                      labelLine={false}
                    >
                      {byType.map((entry) => (
                        <Cell key={entry.type} fill={TYPE_COLOR[entry.type]} />
                      ))}
                    </Pie>
                    <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtNumber(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---------- CLIENTS ---------- */}
        <TabsContent value="clients" className="space-y-4 mt-4">
          {/* Top-5 leaderboard */}
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-primary" /> Top clients by requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-5">
                {topClients.map((c, i) => (
                  <div key={c.client} className="rounded-lg border border-border bg-secondary/30 p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">#{i + 1}</span>
                      <span className="text-[10px] text-muted-foreground">{compact(c.input + c.output)} tok</span>
                    </div>
                    <div className="text-sm font-medium text-foreground truncate">{c.client}</div>
                    <div className="text-xl font-bold gradient-text tabular-nums">{fmtNumber(c.requests)}</div>
                    <div className="h-8 -mx-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={c.spark} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                          <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.25)" strokeWidth={1.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="h-1 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(c.requests / maxTopReq) * 100}%`, background: "var(--gradient-primary)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compact searchable table */}
          <Card className="card-glow">
            <CardHeader className="pb-2 flex flex-row items-center gap-3 flex-wrap">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-3.5 w-3.5" /> All clients · {clientsSorted.length}
              </CardTitle>
              <div className="ml-auto flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={clientQuery}
                    onChange={(e) => { setClientQuery(e.target.value); setPage(0); }}
                    placeholder="Search client…"
                    className="h-8 pl-8 w-[200px] text-xs"
                  />
                </div>
                <Select value={clientSort} onValueChange={(v) => setClientSort(v as typeof clientSort)}>
                  <SelectTrigger className="h-8 w-[160px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requests">Sort: Requests</SelectItem>
                    <SelectItem value="input">Sort: Input tokens</SelectItem>
                    <SelectItem value="output">Sort: Output tokens</SelectItem>
                    <SelectItem value="total">Sort: Total tokens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Input</TableHead>
                    <TableHead className="text-right">Output</TableHead>
                    <TableHead className="w-[200px]">Distribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-6">
                        Нет данных
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedClients.map((c) => {
                      const total = c.input + c.output || 1;
                      const inPct = (c.input / total) * 100;
                      return (
                        <TableRow key={c.client}>
                          <TableCell className="font-medium">{c.client}</TableCell>
                          <TableCell className="text-right tabular-nums">{fmtNumber(c.requests)}</TableCell>
                          <TableCell className="text-right tabular-nums text-primary">{compact(c.input)}</TableCell>
                          <TableCell className="text-right tabular-nums text-accent">{compact(c.output)}</TableCell>
                          <TableCell>
                            <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
                              <div className="h-full bg-primary" style={{ width: `${inPct}%` }} />
                              <div className="h-full bg-accent" style={{ width: `${100 - inPct}%` }} />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
                <span>Page {page + 1} / {totalPages}</span>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- MODELS ---------- */}
        <TabsContent value="models" className="space-y-4 mt-4">
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">Requests by model</CardTitle>
            </CardHeader>
            <CardContent className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byModel} layout="vertical" margin={{ top: 10, right: 20, bottom: 10, left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="model"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    width={100}
                  />
                  <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtNumber(v)} />
                  <Bar dataKey="requests" radius={[0, 6, 6, 0]}>
                    {byModel.map((m) => (
                      <Cell key={m.model} fill={TYPE_COLOR[m.type]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                Models breakdown
                <div className="ml-auto flex gap-1">
                  {(["text", "image", "video"] as ModelType[]).map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TYPE_COLOR[t] }} />
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Input Tokens</TableHead>
                    <TableHead className="text-right">Output Tokens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byModel.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-6">
                        Нет данных
                      </TableCell>
                    </TableRow>
                  ) : (
                    byModel.map((m) => (
                      <TableRow key={m.model}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TYPE_COLOR[m.type] }} />
                          {m.model}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] capitalize">{m.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{fmtNumber(m.requests)}</TableCell>
                        <TableCell className="text-right tabular-nums text-primary">{fmtNumber(m.input)}</TableCell>
                        <TableCell className="text-right tabular-nums text-accent">{fmtNumber(m.output)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
