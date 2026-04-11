import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  fileName?: string;
  onClear: () => void;
}

export function FileUpload({ onFileSelect, isLoading, fileName, onClear }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".csv")) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  if (fileName) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 bg-accent rounded-lg px-4 py-3"
      >
        <FileSpreadsheet className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium flex-1 truncate">{fileName}</span>
        <button onClick={onClear} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.label
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-2xl cursor-pointer
        transition-all duration-200
        ${isDragging ? "border-primary bg-accent scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-accent/50"}
        ${isLoading ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
        <Upload className="w-6 h-6 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Drop your CSV file here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
      </div>
      <input
        type="file"
        accept=".csv"
        onChange={handleChange}
        className="hidden"
        disabled={isLoading}
      />
    </motion.label>
  );
}
