import { Upload, Download, FileSpreadsheet, Loader2, Receipt, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRef, useState } from "react";
import { toast } from "sonner";
import PriceListTab from "@/components/PriceListTab";

interface MonthlyReport {
  id: string;
  month: string;
  year: number;
  fileName: string;
  uploadedAt: string;
  downloadUrl: string;
}

const mockReports: MonthlyReport[] = [
  { id: "1", month: "March", year: 2026, fileName: "march.pdf", uploadedAt: "2026-03-15", downloadUrl: "https://s3c2.001.gpucloud.ru/test-cdn-bucket/documents/march.pdf" },
  { id: "2", month: "February", year: 2026, fileName: "feb.pdf", uploadedAt: "2026-02-14", downloadUrl: "https://s3c2.001.gpucloud.ru/test-cdn-bucket/documents/feb.pdf" },
  { id: "3", month: "January", year: 2026, fileName: "january.pdf", uploadedAt: "2026-01-12", downloadUrl: "https://s3c2.001.gpucloud.ru/test-cdn-bucket/documents/january.pdf" },
];

const StatsPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reports] = useState<MonthlyReport[]>(mockReports);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (report: MonthlyReport) => {
    setDownloadingId(report.id);
    try {
      const res = await fetch(report.downloadUrl);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = report.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download file");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground">Monthly invoices and the current MaaS price list</p>
        </div>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList>
          <TabsTrigger value="invoices" className="gap-2">
            <Receipt className="h-4 w-4" /> Invoices
          </TabsTrigger>
          <TabsTrigger value="pricelist" className="gap-2">
            <ListOrdered className="h-4 w-4" /> Price list
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-5 space-y-4">
          <div className="flex justify-end">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.pdf" className="hidden" />
            <Button variant="glow" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Report
            </Button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-medium text-foreground">Monthly Reports</h2>
            </div>
            {reports.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No reports uploaded yet. Upload your first monthly usage file.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {report.month} {report.year}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {report.fileName} · Uploaded {report.uploadedAt}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      disabled={downloadingId === report.id}
                      onClick={() => handleDownload(report)}
                    >
                      {downloadingId === report.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3 mr-1" />
                      )}
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pricelist" className="mt-5">
          <PriceListTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsPage;
