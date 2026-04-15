import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  suggestions?: string[];
}

export function ChatInput({ onSend, isLoading, disabled, suggestions }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + "px";
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="space-y-4 w-full">
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setInput(s); textareaRef.current?.focus(); }}
              className="text-xs px-4 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium shadow-sm hover:shadow-md"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className={`flex items-end gap-3 bg-white dark:bg-gray-800 border rounded-2xl p-3 shadow-lg transition-all ${
        isFocused
          ? "ring-2 ring-blue-500/40 border-blue-400 dark:border-blue-500 shadow-xl"
          : "border-gray-300 dark:border-gray-700 hover:shadow-xl"
      }`}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={disabled ? "Upload a dataset first..." : "Ask me anything about your data..."}
          disabled={disabled || isLoading}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none text-sm px-1 py-1.5 placeholder:text-gray-500 dark:placeholder:text-gray-400 disabled:opacity-50 text-gray-900 dark:text-gray-100 max-h-[140px]"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || disabled}
          className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex-shrink-0 shadow-md hover:shadow-lg"
          title="Send message (Enter)"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
