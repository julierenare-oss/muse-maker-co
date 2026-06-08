import { useMemo, useState } from "react";
import { Search, Calendar, Download, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [modality, setModality] = useState<string>(ALL);
  

  const { types, models, modalities } = useMemo(() => {
    const t = new Set<string>();
    const m = new Set<string>();
    const md = new Set<string>();
    items.forEach((i) => {
      if (i.type) t.add(i.type);
      if (i.model && (type === ALL || i.type === type)) m.add(i.model);
      if (i.modality) md.add(i.modality);
    });
    return {
      types: [...t].sort(),
      models: [...m].sort(),
      modalities: [...md].sort(),
    };
  }, [items, type]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (type !== ALL && i.type !== type) return false;
      if (model !== ALL && i.model !== model) return false;
      if (modality !== ALL && i.modality !== modality) return false;
      if (q) {
        const hay = `${i.product ?? ""} ${i.model ?? ""} ${i.type ?? ""} ${i.billing ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, search, type, model, modality]);

  const resetFilters = () => {
    setSearch("");
    setType(ALL);
    setModel(ALL);
    setModality(ALL);
  };
  const hasFilters =
    !!search || type !== ALL || model !== ALL || modality !== ALL;

  const exportCsv = () => {
    const header = [
      "Type",
      "Model",
      "Product",
      "Context",
      "Billing",
      "Modality",
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
          i.modality,
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
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
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
        <div className="md:col-span-3">
          <Select value={type} onValueChange={(v) => { setType(v); setModel(ALL); }}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger><SelectValue placeholder="Model" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All models</SelectItem>
              {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Select value={modality} onValueChange={setModality}>
            <SelectTrigger><SelectValue placeholder="Modality" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All modalities</SelectItem>
              {modalities.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
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
                <TableHead className="w-[90px]">Modality</TableHead>
                <TableHead className="w-[90px]">Unit</TableHead>
                <TableHead className="w-[130px] text-right">Цена</TableHead>
                <TableHead className="w-[130px] text-right">Цена с НДС (22%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-10">
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
                      <TableCell className="py-2 text-muted-foreground">{i.modality}</TableCell>
                      <TableCell className="py-2 text-muted-foreground">{i.unit ?? "—"}</TableCell>
                      <TableCell className="py-2 text-right tabular-nums font-medium">
                        {fmt(vat === "vat" ? i.priceVat : i.price)}
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
