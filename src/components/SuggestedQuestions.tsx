import { motion } from "framer-motion";
import { TrendingUp, BarChart3, GitCompare, FileText, ArrowRight } from "lucide-react";
import type { SuggestionCategory } from "@/lib/csv-parser";

const iconMap: Record<string, any> = {
  "Analysis": TrendingUp,
  "Breakdown": BarChart3,
  "Compare": GitCompare,
  "Trends": TrendingUp,
  "Summary": FileText,
};

const colorMap: Record<string, string> = {
  "Analysis": "from-orange-400 to-orange-600",
  "Breakdown": "from-purple-400 to-purple-600",
  "Compare": "from-pink-400 to-pink-600",
  "Trends": "from-green-400 to-green-600",
  "Summary": "from-blue-400 to-blue-600",
};

interface Props {
  onSelect: (q: string) => void;
  suggestions?: SuggestionCategory[];
}

export function SuggestedQuestions({ onSelect, suggestions }: Props) {
  // Fallback to default suggestions if none provided
  const finalSuggestions = suggestions || [
    {
      label: "Analysis",
      questions: [
        "Analyze this dataset",
        "What patterns do you see?",
      ],
    },
    {
      label: "Breakdown",
      questions: [
        "Show a breakdown",
        "What are the components?",
      ],
    },
    {
      label: "Compare",
      questions: [
        "Compare the data",
        "What are the differences?",
      ],
    },
    {
      label: "Summary",
      questions: [
        "Summarize the data",
        "What are the key insights?",
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
      {finalSuggestions.map((cat, i) => {
        const Icon = iconMap[cat.label] || FileText;
        const color = colorMap[cat.label] || "from-blue-400 to-blue-600";

        return (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all hover:border-gray-300 dark:hover:border-gray-600"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                {cat.label}
              </span>
            </div>
            <div className="space-y-2.5">
              {cat.questions.map((q) => (
                <button
                  key={q}
                  onClick={() => onSelect(q)}
                  className="w-full text-left text-sm px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border hover:border-blue-300 dark:hover:border-blue-400 border border-transparent transition-all text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 flex items-center justify-between group/item font-medium"
                >
                  <span className="leading-relaxed">{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0 text-blue-500" />
                </button>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
