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

    // Brand palette (deep navy + neon teal/purple)
    const navy: [number, number, number] = [15, 23, 42];
    const teal: [number, number, number] = [45, 212, 191];
    const purple: [number, number, number] = [167, 139, 250];
    const muted: [number, number, number] = [148, 163, 184];

    // Header band
    doc.setFillColor(...navy);
    doc.rect(0, 0, pageW, 70, "F");
    doc.setFillColor(...teal);
    doc.rect(0, 70, pageW, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("NEXAGEN", 40, 35);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    doc.text("MaaS Price List", 40, 52);

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    const meta = `Updated: ${updated}    •    Currency: USD    •    Positions: ${filtered.length}`;
    doc.text(meta, pageW - 40, 35, { align: "right" });
    doc.setTextColor(...muted);
    doc.text(
      `Generated: ${new Date().toLocaleString("en-GB")}`,
      pageW - 40,
      52,
      { align: "right" },
    );

    // jsPDF default fonts (helvetica) cannot render some Unicode chars (≤, em-dash)
    const ascii = (s: string | null | undefined) =>
      (s ?? "—").replace(/≤/g, "<=").replace(/≥/g, ">=").replace(/—/g, "-");

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
      startY: 90,
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
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 5,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.4,
      },
      headStyles: {
        fillColor: navy,
        textColor: [226, 232, 240],
        fontStyle: "bold",
        fontSize: 9,
        halign: "left",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 70, fontStyle: "bold" },
        2: { cellWidth: 170, textColor: muted, font: "courier", fontSize: 7.5 },
        3: { cellWidth: 60 },
        4: { cellWidth: 110 },
        5: { cellWidth: 70, textColor: muted },
        6: { halign: "right", fontStyle: "bold" },
        7: { halign: "right", fontStyle: "bold", textColor: [124, 58, 237] },
      },
      margin: { left: 30, right: 30, top: 90, bottom: 40 },
      didDrawPage: (data) => {
        // Footer
        const page = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(...muted);
        doc.setDrawColor(226, 232, 240);
        doc.line(30, pageH - 28, pageW - 30, pageH - 28);
        doc.text(
          "Nexagen · Confidential — pricing for contracted customers only",
          30,
          pageH - 14,
        );
        doc.text(`Page ${data.pageNumber} of ${page}`, pageW - 30, pageH - 14, {
          align: "right",
        });
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
