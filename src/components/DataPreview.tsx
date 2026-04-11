import { ParsedData } from "@/lib/csv-parser";
import { motion } from "framer-motion";
import { Database, Rows3 } from "lucide-react";

interface DataPreviewProps {
  data: ParsedData;
}

export function DataPreview({ data }: DataPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="insight-card overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Data Preview</h3>
        <span className="trust-badge ml-auto">
          <Rows3 className="w-3 h-3" />
          {data.rowCount} rows · {data.headers.length} columns
        </span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="data-table">
          <thead>
            <tr>
              {data.headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.preview.map((row, i) => (
              <tr key={i} className="hover:bg-muted/30">
                {data.headers.map((h) => (
                  <td key={h}>{row[h]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
