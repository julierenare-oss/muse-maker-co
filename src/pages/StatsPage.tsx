import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground">Upload monthly usage reports and download past files</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" />
          <Button variant="glow" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Report
          </Button>
        </div>
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
                <a href={report.downloadUrl} download target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
