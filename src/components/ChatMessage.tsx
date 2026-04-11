import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { User, Bot, ShieldCheck } from "lucide-react";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? "chat-bubble-user" : "chat-bubble-ai"}`}>
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-card-foreground prose-headings:text-card-foreground prose-strong:text-card-foreground prose-code:font-mono prose-code:text-xs prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse-soft rounded-sm ml-0.5" />
            )}
          </div>
        )}
        {!isUser && !isStreaming && message.content.length > 20 && (
          <div className="mt-3 pt-2 border-t border-border/50 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Verified against your dataset</span>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </motion.div>
  );
}
