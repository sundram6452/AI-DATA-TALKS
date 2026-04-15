import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUpload } from "@/components/FileUpload";
import { DataPreview } from "@/components/DataPreview";
import { ChatMessage, Message } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { parseCSV, ParsedData, dataToContext, generateSuggestions, SuggestionCategory } from "@/lib/csv-parser";
import { Sparkles, Database } from "lucide-react";
import { toast } from "sonner";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/data-chat`;

const Index = () => {
  const [data, setData] = useState<ParsedData | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionCategory[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoadingFile(true);
    try {
      const parsed = await parseCSV(file);
      setData(parsed);
      setFileName(file.name);
      setShowPreview(true);
      setMessages([]);

      // Generate context-aware suggestions based on the data
      const contextSuggestions = generateSuggestions(parsed);
      setSuggestions(contextSuggestions);

      toast.success(`Loaded ${parsed.rowCount} rows from ${file.name}`);
    } catch {
      toast.error("Failed to parse CSV file");
    } finally {
      setIsLoadingFile(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setData(null);
    setFileName("");
    setMessages([]);
    setShowPreview(false);
    setSuggestions([]);
  }, []);

  const handleSend = useCallback(async (input: string) => {
    if (!data) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          dataContext: dataToContext(data),
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "Request failed" }));
        toast.error(errData.error || "Something went wrong");
        setIsStreaming(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to get response");
    } finally {
      setIsStreaming(false);
    }
  }, [data, messages]);

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">DataTalks</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Talk to your data</p>
            </div>
          </div>
          {data && (
            <button
              onClick={() => setShowPreview((p) => !p)}
              className="trust-badge cursor-pointer hover:bg-accent transition-colors"
            >
              <Database className="w-3 h-3" />
              {showPreview ? "Hide" : "Show"} data
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Upload area */}
        {!data && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-3"
            >
              <h2 className="text-3xl font-bold tracking-tight">Ask your data anything</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Upload a CSV file and get instant, clear answers. No complicated tools — just plain language.
              </p>
            </motion.div>
            <div className="w-full max-w-lg">
              <FileUpload
                onFileSelect={handleFileSelect}
                isLoading={isLoadingFile}
                fileName={fileName}
                onClear={handleClear}
              />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-6 text-center"
            >
              {[
                { label: "Clarity", desc: "Simple answers" },
                { label: "Trust", desc: "Source transparency" },
                { label: "Speed", desc: "Instant insights" },
              ].map((p) => (
                <div key={p.label} className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Data loaded state */}
        {data && (
          <>
            <FileUpload
              onFileSelect={handleFileSelect}
              isLoading={isLoadingFile}
              fileName={fileName}
              onClear={handleClear}
            />

            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <DataPreview data={data} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat messages container */}
            <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto px-2 py-4">
              {!hasMessages && (
                <SuggestedQuestions onSelect={handleSend} suggestions={suggestions} />
              )}
              {messages.map((m, i) => (
                <ChatMessage
                  key={i}
                  message={m}
                  isStreaming={isStreaming && i === messages.length - 1 && m.role === "assistant"}
                />
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input container */}
            <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-background/80 pb-6 pt-4 w-full">
              <div className="mx-auto px-2">
                <ChatInput
                  onSend={handleSend}
                  isLoading={isStreaming}
                  suggestions={
                    hasMessages
                      ? ["Show a breakdown", "What changed the most?", "Summarize key insights"]
                      : undefined
                  }
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
