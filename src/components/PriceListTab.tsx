import { useMemo, useState } from "react";
import { Search, Calendar, Download, X, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import priceData from "@/data/priceList.json";

type Item = {
  type: string | null;
  model: string | null;
  product: string | null;
  context: string | null;
  billing: string | null;
  modality: string | null;
  unit: string | null;
  price: number | null;
  priceVat: number | null;
};

const ALL = "__all__";

const fmt = (n: number | null) =>
  n == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n);

const PriceListTab = () => {
  const items = priceData.items as Item[];
  const updated = priceData.updated;

  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>(ALL);
  const [model, setModel] = useState<string>(ALL);
  

  const { types, models } = useMemo(() => {
    const t = new Set<string>();
    const m = new Set<string>();
    items.forEach((i) => {
      if (i.type) t.add(i.type);
      if (i.model && (type === ALL || i.type === type)) m.add(i.model);
    });
    return {
      types: [...t].sort(),
      models: [...m].sort(),
    };
  }, [items, type]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (type !== ALL && i.type !== type) return false;
      if (model !== ALL && i.model !== model) return false;
      if (q) {
        const hay = `${i.product ?? ""} ${i.model ?? ""} ${i.type ?? ""} ${i.billing ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, type, model]);

  const resetFilters = () => {
    setSearch("");
    setType(ALL);
    setModel(ALL);
  };
  const hasFilters =
    !!search || type !== ALL || model !== ALL;

  const exportCsv = () => {
    const header = [
      "Type",
      "Model",
      "Product",
      "Context",
      "Billing",
      "Unit",
      "Price USD",
      "Price USD (VAT)",
    ];
    const lines = [header.join(",")].concat(
      filtered.map((i) =>
        [
          i.type,
          i.model,
          i.product,
          i.context,
          i.billing,
          i.unit,
          i.price ?? "",
          i.priceVat ?? "",
        ]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexagen-price-list-${updated}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Brand palette — light theme using service colors
    const navy: [number, number, number] = [15, 23, 42];        // primary text / logo
    const navySoft: [number, number, number] = [30, 41, 59];    // body text
    const teal: [number, number, number] = [13, 148, 136];      // primary accent (teal-600, readable on white)
    const tealSoft: [number, number, number] = [204, 251, 241]; // teal-100 — soft tint
    const purple: [number, number, number] = [109, 40, 217];    // purple-700 — VAT highlight
    const purpleSoft: [number, number, number] = [237, 233, 254]; // purple-100
    const muted: [number, number, number] = [100, 116, 139];    // slate-500
    const border: [number, number, number] = [226, 232, 240];   // slate-200
    const stripe: [number, number, number] = [248, 250, 252];   // slate-50
    const bgTint: [number, number, number] = [240, 253, 250];   // teal-50

    // ---------- HEADER ----------
    // Soft teal tint strip across the top
    doc.setFillColor(...bgTint);
    doc.rect(0, 0, pageW, 92, "F");
    // Accent gradient-feel: two stacked rules (teal + purple) under header
    doc.setFillColor(...teal);
    doc.rect(0, 90, pageW * 0.62, 2, "F");
    doc.setFillColor(...purple);
    doc.rect(pageW * 0.62, 90, pageW * 0.38, 2, "F");

    // Logo mark — rounded square with "N"
    const markX = 40, markY = 26, markS = 38;
    doc.setFillColor(...navy);
    doc.roundedRect(markX, markY, markS, markS, 8, 8, "F");
    doc.setFillColor(...teal);
    doc.roundedRect(markX + markS - 10, markY + markS - 10, 8, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("N", markX + markS / 2, markY + markS / 2 + 8, { align: "center" });

    // Wordmark + tagline
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("NEXAGEN", markX + markS + 14, 44);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...muted);
    doc.text("Models-as-a-Service  ·  Official Price List", markX + markS + 14, 60);

    // Right-side meta "pills"
    const pill = (label: string, value: string, x: number, y: number, accent: [number, number, number], bg: [number, number, number]) => {
      doc.setFillColor(...bg);
      doc.roundedRect(x, y, 150, 26, 6, 6, "F");
      doc.setFillColor(...accent);
      doc.roundedRect(x, y, 3, 26, 1.5, 1.5, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...muted);
      doc.text(label.toUpperCase(), x + 10, y + 10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...navy);
      doc.text(value, x + 10, y + 21);
    };
    pill("Updated", updated, pageW - 40 - 150, 22, teal, tealSoft);
    pill("Positions", `${filtered.length} of ${items.length}`, pageW - 40 - 150 - 160, 22, purple, purpleSoft);
    pill("Currency", "USD  ·  VAT 22%", pageW - 40 - 150, 54, teal, tealSoft);
    pill("Generated", new Date().toLocaleDateString("en-GB"), pageW - 40 - 150 - 160, 54, purple, purpleSoft);

    // jsPDF default fonts (helvetica) cannot render some Unicode chars
    const ascii = (s: string | null | undefined) =>
      (s ?? "—").replace(/≤/g, "<=").replace(/≥/g, ">=").replace(/＞/g, ">").replace(/＜/g, "<").replace(/—/g, "-").replace(/×/g, "x").replace(/•/g, "*");

    // Build rows
    const body = filtered.map((i) => [
      ascii(i.type),
      ascii(i.model),
      ascii(i.product),
      ascii(i.context),
      ascii(i.billing),
      ascii(i.unit),
      i.price == null ? "-" : `$${i.price.toFixed(2)}`,
      i.priceVat == null ? "-" : `$${i.priceVat.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: 112,
      head: [[
        "Type",
        "Model",
        "Product",
        "Context",
        "Billing item",
        "Unit",
        "Price",
        "Price + VAT (22%)",
      ]],
      body,
      theme: "plain",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: { top: 7, right: 6, bottom: 7, left: 8 },
        textColor: navySoft,
        lineColor: border,
        lineWidth: 0,
      },
      headStyles: {
        fillColor: navy,
        textColor: [226, 232, 240],
        fontStyle: "bold",
        fontSize: 8.5,
        halign: "left",
        cellPadding: { top: 9, right: 6, bottom: 9, left: 8 },
      },
      bodyStyles: {
        lineColor: border,
        lineWidth: { top: 0, right: 0, bottom: 0.5, left: 0 },
      },
      alternateRowStyles: { fillColor: stripe },
      columnStyles: {
        0: { cellWidth: 56 },
        1: { cellWidth: 72, fontStyle: "bold", textColor: navy },
        2: { cellWidth: 180, textColor: muted, font: "courier", fontSize: 7.5 },
        3: { cellWidth: 62, textColor: muted },
        4: { cellWidth: 120 },
        5: { cellWidth: 72, textColor: muted },
        6: { halign: "right", fontStyle: "bold", textColor: navy },
        7: { halign: "right", fontStyle: "bold", textColor: purple, fillColor: purpleSoft },
      },
      margin: { left: 30, right: 30, top: 112, bottom: 44 },
      didParseCell: (data) => {
        // Render Type as a soft pill (teal tint)
        if (data.section === "body" && data.column.index === 0) {
          data.cell.styles.fillColor = tealSoft;
          data.cell.styles.textColor = teal;
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fontSize = 7.5;
          data.cell.styles.halign = "center";
        }
      },
      didDrawPage: (data) => {
        // Footer
        const totalPages = doc.getNumberOfPages();
        doc.setDrawColor(...border);
        doc.setLineWidth(0.5);
        doc.line(30, pageH - 32, pageW - 30, pageH - 32);

        // Footer mark
        doc.setFillColor(...teal);
        doc.circle(36, pageH - 18, 3, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...navy);
        doc.text("NEXAGEN", 44, pageH - 16);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...muted);
        doc.text(
          "Confidential  ·  Pricing for contracted customers only  ·  Subject to change",
          100,
          pageH - 16,
        );

        doc.setFont("helvetica", "bold");
        doc.setTextColor(...navy);
        doc.text(`${data.pageNumber}`, pageW - 30, pageH - 16, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...muted);
        doc.text(` / ${totalPages}`, pageW - 24, pageH - 16);
      },
    });

    doc.save(`nexagen-price-list-${updated}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Meta strip */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Price list updated:</span>
          <span className="font-medium text-foreground">{updated}</span>
          <span className="ml-1 inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
            Current
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          Prices in USD
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export
                <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={exportPdf} className="gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm">PDF</span>
                  <span className="text-[10px] text-muted-foreground">Branded report</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportCsv} className="gap-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm">CSV</span>
                  <span className="text-[10px] text-muted-foreground">Raw data</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>


      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by model or product…"
            className="pl-9"
          />
        </div>
        <div className="md:col-span-4">
          <Select value={type} onValueChange={(v) => { setType(v); setModel(ALL); }}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-4">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger><SelectValue placeholder="Model" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All models</SelectItem>
              {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{filtered.length}</span> of {items.length} positions
        </span>
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <X className="h-3 w-3" /> Reset filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-secondary/80 backdrop-blur z-10">
              <TableRow>
                <TableHead className="w-[90px]">Type</TableHead>
                <TableHead className="w-[110px]">Model</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="w-[90px]">Context</TableHead>
                <TableHead className="w-[140px]">Billing item</TableHead>
                <TableHead className="w-[90px]">Unit</TableHead>
                <TableHead className="w-[130px] text-right">Цена</TableHead>
                <TableHead className="w-[130px] text-right">Цена с НДС (22%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                    No positions match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((i, idx) => {
                  const spanFor = (keyFn: (x: Item) => string) => {
                    const prev = filtered[idx - 1];
                    if (prev && keyFn(prev) === keyFn(i)) return 0;
                    let span = 1;
                    for (let j = idx + 1; j < filtered.length; j++) {
                      if (keyFn(filtered[j]) === keyFn(i)) span++;
                      else break;
                    }
                    return span;
                  };
                  const typeKey = (x: Item) => `${x.type}`;
                  const modelKey = (x: Item) => `${x.type}|${x.model}`;
                  const productKey = (x: Item) => `${x.type}|${x.model}|${x.product}`;
                  const contextKey = (x: Item) => `${x.type}|${x.model}|${x.product}|${x.context}`;

                  const typeSpan = spanFor(typeKey);
                  const modelSpan = spanFor(modelKey);
                  const productSpan = spanFor(productKey);
                  const contextSpan = spanFor(contextKey);

                  return (
                    <TableRow
                      key={idx}
                      className={modelSpan > 0 ? "border-t-2 border-t-border/70" : ""}
                    >
                      {typeSpan > 0 && (
                        <TableCell rowSpan={typeSpan} className="py-2 align-top">
                          <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium">{i.type}</span>
                        </TableCell>
                      )}
                      {modelSpan > 0 && (
                        <TableCell rowSpan={modelSpan} className="py-2 align-top font-medium text-foreground">
                          {i.model}
                        </TableCell>
                      )}
                      {productSpan > 0 && (
                        <TableCell rowSpan={productSpan} className="py-2 align-top font-mono text-xs text-muted-foreground">
                          {i.product}
                        </TableCell>
                      )}
                      {contextSpan > 0 && (
                        <TableCell rowSpan={contextSpan} className="py-2 align-top text-muted-foreground">
                          {i.context ?? "—"}
                        </TableCell>
                      )}
                      <TableCell className="py-2">{i.billing}</TableCell>
                      <TableCell className="py-2 text-muted-foreground">{i.unit ?? "—"}</TableCell>
                      <TableCell className="py-2 text-right tabular-nums font-medium">
                        {fmt(i.price)}
                      </TableCell>
                      <TableCell className="py-2 text-right tabular-nums font-medium">
                        {fmt(i.priceVat)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PriceListTab;
