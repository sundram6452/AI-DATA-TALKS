import Papa from "papaparse";

export interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
  preview: Record<string, string>[];
  summary: string;
}

export function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];
        const preview = rows.slice(0, 5);
        const summary = generateSummary(headers, rows);
        resolve({ headers, rows, rowCount: rows.length, preview, summary });
      },
      error: (err) => reject(err),
    });
  });
}

function generateSummary(headers: string[], rows: Record<string, string>[]): string {
  const lines: string[] = [];
  lines.push(`Dataset has ${rows.length} rows and ${headers.length} columns.`);
  lines.push(`Columns: ${headers.join(", ")}`);

  // Detect numeric columns and compute basic stats
  for (const col of headers) {
    const values = rows.map((r) => r[col]).filter(Boolean);
    const nums = values.map(Number).filter((n) => !isNaN(n));
    if (nums.length > values.length * 0.7 && nums.length > 0) {
      const sum = nums.reduce((a, b) => a + b, 0);
      const avg = sum / nums.length;
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      lines.push(
        `${col}: numeric, min=${min}, max=${max}, avg=${avg.toFixed(2)}, sum=${sum.toFixed(2)}`
      );
    } else {
      const unique = new Set(values).size;
      lines.push(`${col}: categorical, ${unique} unique values`);
      if (unique <= 8) {
        const counts: Record<string, number> = {};
        values.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
        const top = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([k, v]) => `${k}(${v})`)
          .join(", ");
        lines.push(`  Top values: ${top}`);
      }
    }
  }

  return lines.join("\n");
}

export function dataToContext(data: ParsedData): string {
  let ctx = data.summary + "\n\nSample rows (first 10):\n";
  const sample = data.rows.slice(0, 10);
  ctx += data.headers.join(" | ") + "\n";
  ctx += sample.map((r) => data.headers.map((h) => r[h] || "").join(" | ")).join("\n");

  // If dataset is small enough, include all data
  if (data.rows.length <= 200) {
    ctx += "\n\nFull dataset:\n";
    ctx += data.headers.join(" | ") + "\n";
    ctx += data.rows.map((r) => data.headers.map((h) => r[h] || "").join(" | ")).join("\n");
  }

  return ctx;
}
