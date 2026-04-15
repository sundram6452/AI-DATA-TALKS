import Papa from "papaparse";

export interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
  preview: Record<string, string>[];
  summary: string;
}

export interface SuggestionCategory {
  label: string;
  questions: string[];
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

// Detect column types
function detectColumnTypes(headers: string[], rows: Record<string, string>[]): Record<string, "numeric" | "categorical" | "date"> {
  const types: Record<string, "numeric" | "categorical" | "date"> = {};

  for (const col of headers) {
    const values = rows.map((r) => r[col]).filter(Boolean);
    const nums = values.map(Number).filter((n) => !isNaN(n));

    // Check if mostly numeric
    if (nums.length > values.length * 0.7 && nums.length > 0) {
      types[col] = "numeric";
    } else {
      // Check if date-like
      const datePattern = /^\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\w+\s\d+,\s\d{4}/;
      const isDate = values.some((v) => datePattern.test(v));
      types[col] = isDate ? "date" : "categorical";
    }
  }

  return types;
}

// Generate context-aware suggestions based on data
export function generateSuggestions(data: ParsedData): SuggestionCategory[] {
  const { headers, rows } = data;
  const types = detectColumnTypes(headers, rows);

  const numericCols = headers.filter((h) => types[h] === "numeric");
  const categoricalCols = headers.filter((h) => types[h] === "categorical");
  const dateCols = headers.filter((h) => types[h] === "date");

  const suggestions: SuggestionCategory[] = [];

  // Numeric analysis suggestions
  if (numericCols.length > 0) {
    const q1 = `What is the average and total of ${numericCols[0]}?`;
    const q2 = `Show me the highest and lowest values in ${numericCols[0]}?`;
    suggestions.push({
      label: "Analysis",
      questions: [q1, q2],
    });
  }

  // Categorical breakdown suggestions
  if (categoricalCols.length > 0) {
    const q1 = `Break down the data by ${categoricalCols[0]}`;
    const q2 = `What are the top categories in ${categoricalCols[0]}?`;
    suggestions.push({
      label: "Breakdown",
      questions: [q1, q2],
    });
  }

  // Time-based suggestions
  if (dateCols.length > 0) {
    const timeCol = dateCols[0];
    const q1 = `Show me the trend over ${timeCol}`;
    const q2 = `What changed between the earliest and latest ${timeCol}?`;
    suggestions.push({
      label: "Trends",
      questions: [q1, q2],
    });
  }

  // Comparison suggestions
  if (numericCols.length > 1 && categoricalCols.length > 0) {
    const q1 = `Compare ${numericCols[0]} across different ${categoricalCols[0]}`;
    const q2 = `Which ${categoricalCols[0]} has the highest ${numericCols[0]}?`;
    suggestions.push({
      label: "Compare",
      questions: [q1, q2],
    });
  }

  // Summary suggestions
  suggestions.push({
    label: "Summary",
    questions: [
      `Give me a summary of the key insights`,
      `What are the most important findings in this dataset?`,
    ],
  });

  return suggestions;
}
