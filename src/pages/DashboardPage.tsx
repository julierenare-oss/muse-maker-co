import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Activity, ArrowDownToLine, ArrowUpFromLine, Calendar as CalendarIcon,
  DollarSign, Download, Filter, FileSpreadsheet, FileText, Users, Zap,
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
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { type ModelKey, costForRequest, fmtUSD, PRICING } from "@/lib/pricing";

// ---------------- Mock dataset ----------------
const ALL_MODELS: ModelKey[] = ["MaaS-MJ", "MaaS_image_1", "MaaS_Cl_Opus"];
const MODEL_COLORS: Record<ModelKey, string> = {
  "MaaS-MJ": "hsl(165 100% 50%)",
  "MaaS_image_1": "hsl(270 100% 65%)",
  "MaaS_Cl_Opus": "hsl(45 100% 60%)",
};

type MemberKey = "Anna K." | "Ivan P." | "Maria S." | "Dmitry V.";
const ALL_MEMBERS: MemberKey[] = ["Anna K.", "Ivan P.", "Maria S.", "Dmitry V."];

interface RequestRow {
  ts: Date;
  model: ModelKey;
  member: MemberKey;
  inputTokens: number;
  outputTokens: number;
}

const RAW: RequestRow[] = [
  { ts: new Date("2026-03-02T10:14:00Z"), model: "MaaS_Cl_Opus", member: "Anna K.", inputTokens: 1800, outputTokens: 920 },
  { ts: new Date("2026-03-07T13:40:00Z"), model: "MaaS-MJ", member: "Ivan P.", inputTokens: 1200, outputTokens: 0 },
  { ts: new Date("2026-03-12T09:05:00Z"), model: "MaaS_image_1", member: "Maria S.", inputTokens: 800, outputTokens: 0 },
  { ts: new Date("2026-03-18T16:22:00Z"), model: "MaaS_Cl_Opus", member: "Anna K.", inputTokens: 5400, outputTokens: 2100 },
  { ts: new Date("2026-03-25T11:00:00Z"), model: "MaaS-MJ", member: "Dmitry V.", inputTokens: 1500, outputTokens: 0 },
  { ts: new Date("2026-04-02T08:30:00Z"), model: "MaaS_image_1", member: "Maria S.", inputTokens: 950, outputTokens: 0 },
  { ts: new Date("2026-04-08T14:18:00Z"), model: "MaaS_Cl_Opus", member: "Ivan P.", inputTokens: 3200, outputTokens: 1450 },
  { ts: new Date("2026-04-12T17:45:00Z"), model: "MaaS-MJ", member: "Anna K.", inputTokens: 1100, outputTokens: 0 },
  { ts: new Date("2026-04-15T10:10:00Z"), model: "MaaS_image_1", member: "Dmitry V.", inputTokens: 1300, outputTokens: 0 },
  { ts: new Date("2026-04-20T21:18:00Z"), model: "MaaS_Cl_Opus", member: "Anna K.", inputTokens: 7200, outputTokens: 3100 },
  { ts: new Date("2026-04-20T21:22:00Z"), model: "MaaS-MJ", member: "Ivan P.", inputTokens: 2400, outputTokens: 0 },
  { ts: new Date("2026-04-20T21:25:00Z"), model: "MaaS_Cl_Opus", member: "Anna K.", inputTokens: 8800, outputTokens: 3650 },
  { ts: new Date("2026-04-20T21:27:00Z"), model: "MaaS_image_1", member: "Maria S.", inputTokens: 1850, outputTokens: 0 },
  { ts: new Date("2026-04-20T21:31:00Z"), model: "MaaS-MJ", member: "Dmitry V.", inputTokens: 1700, outputTokens: 0 },
  { ts: new Date("2026-04-20T21:36:00Z"), model: "MaaS_Cl_Opus", member: "Ivan P.", inputTokens: 6900, outputTokens: 2980 },
  { ts: new Date("2026-04-21T09:15:00Z"), model: "MaaS_image_1", member: "Maria S.", inputTokens: 2100, outputTokens: 0 },
  { ts: new Date("2026-04-21T14:02:00Z"), model: "MaaS-MJ", member: "Dmitry V.", inputTokens: 1500, outputTokens: 0 },
];
RAW[9].inputTokens += 4000;
RAW[11].inputTokens += 5000;
RAW[14].inputTokens += 5000;

// ---------------- Filters ----------------
type RangePreset = "1h" | "6h" | "24h" | "7d" | "30d" | "custom";
type Granularity = "auto" | "hour" | "day" | "week" | "month";

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: "1h", label: "Last 1h" },
  { value: "6h", label: "Last 6h" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" },
  { value: "30d", label: "Last 30d" },
  { value: "custom", label: "Custom range" },
];

const presetToRange = (p: RangePreset, anchor: Date): { from: Date; to: Date } => {
  const to = anchor;
  const from = new Date(to);
  switch (p) {
    case "1h": from.setHours(from.getHours() - 1); break;
    case "6h": from.setHours(from.getHours() - 6); break;
    case "24h": from.setDate(from.getDate() - 1); break;
    case "7d": from.setDate(from.getDate() - 7); break;
    case "30d": from.setDate(from.getDate() - 30); break;
    case "custom": from.setDate(from.getDate() - 30); break;
  }
  return { from, to };
};

const autoGranularity = (from: Date, to: Date): Exclude<Granularity, "auto"> => {
  const hours = (to.getTime() - from.getTime()) / 36e5;
  if (hours <= 24) return "hour";
  if (hours <= 24 * 14) return "day";
  if (hours <= 24 * 90) return "week";
  return "month";
};

const bucketKey = (d: Date, g: Exclude<Granularity, "auto">) => {
  const x = new Date(d);
  if (g === "hour") { x.setMinutes(0, 0, 0); return x.toISOString(); }
  if (g === "day") { x.setHours(0, 0, 0, 0); return x.toISOString().slice(0, 10); }
  if (g === "week") {
    const day = x.getUTCDay();
    const diff = (day + 6) % 7;
    x.setUTCDate(x.getUTCDate() - diff);
    x.setUTCHours(0, 0, 0, 0);
    return x.toISOString().slice(0, 10);
  }
  x.setUTCDate(1); x.setUTCHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 7);
};

const labelBucket = (k: string, g: Exclude<Granularity, "auto">) => {
  if (g === "hour") return format(new Date(k), "MMM d, HH:mm");
  if (g === "day") return format(new Date(k), "MMM d");
  if (g === "week") return `Week of ${format(new Date(k), "MMM d")}`;
  return format(new Date(k + "-01"), "MMM yyyy");
};

const fmtNumber = (n: number) => n.toLocaleString("en-US");

// ---------------- Component ----------------
const DashboardPage = () => {
  const ANCHOR = new Date("2026-04-21T23:59:59Z");

  const [preset, setPreset] = useState<RangePreset>("custom");
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date }>({
    from: new Date("2026-03-01T00:00:00Z"),
    to: new Date("2026-04-21T23:59:59Z"),
  });
  const [granularity, setGranularity] = useState<Granularity>("auto");
  const [selectedModels, setSelectedModels] = useState<ModelKey[]>([...ALL_MODELS]);
  const [selectedMembers, setSelectedMembers] = useState<MemberKey[]>([...ALL_MEMBERS]);
  const [activeTab, setActiveTab] = useState<"requests" | "tokens" | "models">("requests");

  const range = preset === "custom" ? customRange : presetToRange(preset, ANCHOR);
  const effGran: Exclude<Granularity, "auto"> =
    granularity === "auto" ? autoGranularity(range.from, range.to) : granularity;

  const filtered = useMemo(
    () => RAW.filter(
      (r) =>
        r.ts >= range.from &&
        r.ts <= range.to &&
        selectedModels.includes(r.model) &&
        selectedMembers.includes(r.member),
    ),
    [range.from, range.to, selectedModels, selectedMembers],
  );

  const totalRequests = filtered.length;
  const totalInput = filtered.reduce((s, r) => s + r.inputTokens, 0);
  const totalOutput = filtered.reduce((s, r) => s + r.outputTokens, 0);
  const totalCost = filtered.reduce(
    (s, r) => s + costForRequest(r.model, r.inputTokens, r.outputTokens),
    0,
  );

  const reqOverTime = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      const k = bucketKey(r.ts, effGran);
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([k, v]) => ({ bucket: k, label: labelBucket(k, effGran), requests: v }));
  }, [filtered, effGran]);

  const reqByModel = useMemo(() => {
    const map = new Map<ModelKey, number>();
    filtered.forEach((r) => map.set(r.model, (map.get(r.model) ?? 0) + 1));
    const total = filtered.length || 1;
    return Array.from(map.entries()).map(([model, value]) => ({
      model,
      value,
      percent: Math.round((value / total) * 100),
    }));
  }, [filtered]);

  const tokensOverTime = useMemo(() => {
    const map = new Map<string, { input: number; output: number }>();
    filtered.forEach((r) => {
      const k = bucketKey(r.ts, effGran);
      const cur = map.get(k) ?? { input: 0, output: 0 };
      cur.input += r.inputTokens;
      cur.output += r.outputTokens;
      map.set(k, cur);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([k, v]) => ({ bucket: k, label: labelBucket(k, effGran), ...v }));
  }, [filtered, effGran]);

  const tokensByModel = useMemo(() => {
    return ALL_MODELS.filter((m) => selectedModels.includes(m)).map((m) => {
      const rows = filtered.filter((r) => r.model === m);
      return {
        model: m,
        input: rows.reduce((s, r) => s + r.inputTokens, 0),
        output: rows.reduce((s, r) => s + r.outputTokens, 0),
      };
    });
  }, [filtered, selectedModels]);

  const modelTrend = useMemo(() => {
    const buckets = new Map<string, Record<string, number | string>>();
    filtered.forEach((r) => {
      const k = bucketKey(r.ts, effGran);
      const row = buckets.get(k) ?? { bucket: k, label: labelBucket(k, effGran) };
      row[r.model] = ((row[r.model] as number) ?? 0) + 1;
      buckets.set(k, row);
    });
    return Array.from(buckets.values()).sort((a, b) =>
      (a.bucket as string) < (b.bucket as string) ? -1 : 1,
    );
  }, [filtered, effGran]);

  // Per-member breakdown
  const byMember = useMemo(() => {
    return ALL_MEMBERS.filter((m) => selectedMembers.includes(m)).map((member) => {
      const rows = filtered.filter((r) => r.member === member);
      return {
        member,
        requests: rows.length,
        input: rows.reduce((s, r) => s + r.inputTokens, 0),
        output: rows.reduce((s, r) => s + r.outputTokens, 0),
      };
    });
  }, [filtered, selectedMembers]);

  const toggleModel = (m: ModelKey) =>
    setSelectedModels((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  const toggleMember = (m: MemberKey) =>
    setSelectedMembers((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );

  const tooltipStyle = {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    color: "hsl(var(--popover-foreground))",
    fontSize: 12,
  } as const;

  // ---------------- Exports ----------------
  const periodLabel = `${format(range.from, "dd.MM.yyyy")}_${format(range.to, "dd.MM.yyyy")}`;

  const exportXlsx = () => {
    const wb = XLSX.utils.book_new();

    const summary = [
      ["Cloudsway MaaS — Analytics Report"],
      ["Period", `${format(range.from, "dd.MM.yyyy HH:mm")} — ${format(range.to, "dd.MM.yyyy HH:mm")} UTC`],
      ["Granularity", effGran],
      ["Models", selectedModels.join(", ")],
      ["Members", selectedMembers.join(", ")],
      [],
      ["Total Requests", totalRequests],
      ["Total Input Tokens", totalInput],
      ["Total Output Tokens", totalOutput],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Summary");

    const reqRows = [["Time", "Requests"], ...reqOverTime.map((r) => [r.label, r.requests])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(reqRows), "Requests over Time");

    const modelRows = [
      ["Model", "Requests", "Share %"],
      ...reqByModel.map((r) => [r.model, r.value, r.percent]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(modelRows), "Requests by Model");

    const tokRows = [
      ["Time", "Input", "Output"],
      ...tokensOverTime.map((r) => [r.label, r.input, r.output]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tokRows), "Tokens over Time");

    const tokByModel = [
      ["Model", "Input", "Output"],
      ...tokensByModel.map((r) => [r.model, r.input, r.output]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tokByModel), "Tokens by Model");

    const memberRows = [
      ["Member", "Requests", "Input Tokens", "Output Tokens"],
      ...byMember.map((r) => [r.member, r.requests, r.input, r.output]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(memberRows), "By Member");

    const rawRows = [
      ["Timestamp UTC", "Member", "Model", "Input Tokens", "Output Tokens"],
      ...filtered.map((r) => [
        format(r.ts, "yyyy-MM-dd HH:mm"),
        r.member, r.model, r.inputTokens, r.outputTokens,
      ]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rawRows), "Raw Data");

    XLSX.writeFile(wb, `cloudsway_analytics_${periodLabel}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, W, 70, "F");
    doc.setTextColor(34, 211, 238);
    doc.setFontSize(18);
    doc.text("Cloudsway MaaS — Analytics Report", 40, 35);
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
    doc.text(`Total Output Tokens: ${fmtNumber(totalOutput)}`, 40, y); y += 8;

    autoTable(doc, {
      startY: y + 8,
      head: [["Model", "Requests", "Share %"]],
      body: reqByModel.map((r) => [r.model, fmtNumber(r.value), `${r.percent}%`]),
      headStyles: { fillColor: [34, 211, 238], textColor: 15 },
      styles: { fontSize: 9 },
      margin: { left: 40, right: 40 },
    });

    autoTable(doc, {
      head: [["Model", "Input Tokens", "Output Tokens"]],
      body: tokensByModel.map((r) => [r.model, fmtNumber(r.input), fmtNumber(r.output)]),
      headStyles: { fillColor: [168, 85, 247], textColor: 255 },
      styles: { fontSize: 9 },
      margin: { left: 40, right: 40 },
    });

    autoTable(doc, {
      head: [["Member", "Requests", "Input Tokens", "Output Tokens"]],
      body: byMember.map((r) => [r.member, fmtNumber(r.requests), fmtNumber(r.input), fmtNumber(r.output)]),
      headStyles: { fillColor: [34, 211, 238], textColor: 15 },
      styles: { fontSize: 9 },
      margin: { left: 40, right: 40 },
    });

    autoTable(doc, {
      head: [["Time", "Requests"]],
      body: reqOverTime.map((r) => [r.label, fmtNumber(r.requests)]),
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
      styles: { fontSize: 8 },
      margin: { left: 40, right: 40 },
    });

    doc.save(`cloudsway_analytics_${periodLabel}.pdf`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Cloudsway MaaS API · аналитика запросов, токенов и моделей
          </p>
        </div>

        {/* Export menu */}
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
            <SelectTrigger className="w-[160px] h-9">
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
              <SelectItem value="hour">Hour</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 font-normal">
                Models: {selectedModels.length} / {ALL_MODELS.length}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filter models</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_MODELS.map((m) => (
                <DropdownMenuCheckboxItem
                  key={m}
                  checked={selectedModels.includes(m)}
                  onCheckedChange={() => toggleModel(m)}
                  onSelect={(e) => e.preventDefault()}
                >
                  <span
                    className="w-2 h-2 rounded-full mr-2 inline-block"
                    style={{ backgroundColor: MODEL_COLORS[m] }}
                  />
                  {m}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 font-normal">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Members: {selectedMembers.length} / {ALL_MEMBERS.length}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Filter team members</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_MEMBERS.map((m) => (
                <DropdownMenuCheckboxItem
                  key={m}
                  checked={selectedMembers.includes(m)}
                  onCheckedChange={() => toggleMember(m)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {m}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedMembers([...ALL_MEMBERS])}>
                Select all
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedMembers([])}>
                Clear
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto text-xs text-muted-foreground">
            {format(range.from, "dd.MM.yyyy HH:mm")} → {format(range.to, "dd.MM.yyyy HH:mm")} UTC
          </div>
        </CardContent>
      </Card>

      {/* Member consumption summary */}
      <Card className="card-glow">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Users className="h-3.5 w-3.5" /> Consumption by Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">Input Tokens</TableHead>
                <TableHead className="text-right">Output Tokens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byMember.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground text-sm py-6">
                    Нет данных по выбранным фильтрам
                  </TableCell>
                </TableRow>
              ) : (
                byMember.map((r) => (
                  <TableRow key={r.member}>
                    <TableCell className="font-medium">{r.member}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtNumber(r.requests)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtNumber(r.input)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtNumber(r.output)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabs: Requests / Tokens / Models */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="requests" className="gap-2">
            <Activity className="h-3.5 w-3.5" /> Requests
          </TabsTrigger>
          <TabsTrigger value="tokens" className="gap-2">
            <ArrowDownToLine className="h-3.5 w-3.5" /> Tokens
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2">
            <Zap className="h-3.5 w-3.5" /> Models
          </TabsTrigger>
        </TabsList>

        {/* ============ TAB 1: REQUESTS ============ */}
        <TabsContent value="requests" className="space-y-4 mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="card-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5" /> Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold gradient-text tabular-nums">
                  {fmtNumber(totalRequests)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">за выбранный период</p>
              </CardContent>
            </Card>

            <Card className="card-glow lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Requests over Time
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reqOverTime} margin={{ top: 10, right: 12, bottom: 24, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false}
                      label={{ value: "Time", position: "insideBottom", offset: -10, fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false}
                      label={{ value: "Requests", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <RTooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="requests" stroke="hsl(var(--primary))" strokeWidth={2}
                      dot={{ r: 3, fill: "hsl(var(--primary))" }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Requests by Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={reqByModel} dataKey="value" nameKey="model" cx="50%" cy="50%"
                        innerRadius={60} outerRadius={95} paddingAngle={2}
                        label={({ model, percent }) => `${model} ${percent}%`} labelLine={false}>
                        {reqByModel.map((entry) => (
                          <Cell key={entry.model} fill={MODEL_COLORS[entry.model]} />
                        ))}
                      </Pie>
                      <RTooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead className="text-right">Requests</TableHead>
                        <TableHead className="text-right">Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reqByModel.map((r) => (
                        <TableRow key={r.model}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: MODEL_COLORS[r.model] }} />
                            {r.model}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{fmtNumber(r.value)}</TableCell>
                          <TableCell className="text-right tabular-nums">{r.percent}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ TAB 2: TOKENS ============ */}
        <TabsContent value="tokens" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <ArrowDownToLine className="h-3.5 w-3.5" /> Total Input Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary tabular-nums">
                  {fmtNumber(totalInput)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">входящие токены</p>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <ArrowUpFromLine className="h-3.5 w-3.5" /> Total Output Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-accent tabular-nums">
                  {fmtNumber(totalOutput)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">исходящие токены</p>
              </CardContent>
            </Card>
          </div>

          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Token Usage over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tokensOverTime} margin={{ top: 10, right: 12, bottom: 24, left: 0 }}>
                  <defs>
                    <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false}
                    label={{ value: "Time", position: "insideBottom", offset: -10, fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false}
                    label={{ value: "Tokens", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
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
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Tokens by Model
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tokensByModel} margin={{ top: 10, right: 12, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="model" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false}
                    label={{ value: "Tokens", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <RTooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtNumber(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="input" name="Input" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="output" name="Output" stackId="a" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ TAB 3: MODELS ============ */}
        <TabsContent value="models" className="space-y-4 mt-4">
          <Card className="card-glow">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" /> Model Usage Trend
              </CardTitle>
              <div className="flex gap-1 flex-wrap">
                {ALL_MODELS.filter((m) => selectedModels.includes(m)).map((m) => (
                  <Badge key={m} variant="outline" className="text-[10px] gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MODEL_COLORS[m] }} />
                    {m}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={modelTrend} margin={{ top: 10, right: 12, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false}
                    label={{ value: "Time", position: "insideBottom", offset: -10, fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false}
                    label={{ value: "Requests", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <RTooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {ALL_MODELS.filter((m) => selectedModels.includes(m)).map((m) => (
                    <Line key={m} type="monotone" dataKey={m} stroke={MODEL_COLORS[m]} strokeWidth={2}
                      dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
