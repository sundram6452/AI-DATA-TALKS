import { motion } from "framer-motion";
import { TrendingUp, BarChart3, GitCompare, FileText } from "lucide-react";

const categories = [
  {
    icon: TrendingUp,
    label: "Understand changes",
    questions: [
      "What changed the most recently?",
      "What caused the biggest increase?",
    ],
  },
  {
    icon: BarChart3,
    label: "Breakdown",
    questions: [
      "Show the breakdown by category",
      "What are the top contributors?",
    ],
  },
  {
    icon: GitCompare,
    label: "Compare",
    questions: [
      "Compare the top 2 categories",
      "Which segment is growing fastest?",
    ],
  },
  {
    icon: FileText,
    label: "Summarize",
    questions: [
      "Give me a summary of the data",
      "What are the key takeaways?",
    ],
  },
];

interface Props {
  onSelect: (q: string) => void;
}

export function SuggestedQuestions({ onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="insight-card group"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <cat.icon className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {cat.label}
            </span>
          </div>
          <div className="space-y-2">
            {cat.questions.map((q) => (
              <button
                key={q}
                onClick={() => onSelect(q)}
                className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-accent transition-colors text-foreground/80 hover:text-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
