import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import type { SlotResult } from "@/lib/scheduler";

const statusConfig = {
  Best: {
    bg: "bg-status-best-bg",
    text: "text-status-best",
    border: "border-status-best/20",
    icon: CheckCircle2,
  },
  Good: {
    bg: "bg-status-good-bg",
    text: "text-status-good",
    border: "border-status-good/20",
    icon: Clock,
  },
  Limited: {
    bg: "bg-status-limited-bg",
    text: "text-status-limited",
    border: "border-status-limited/20",
    icon: AlertTriangle,
  },
} as const;

interface Props {
  results: SlotResult[];
}

export function ResultsTable({ results }: Props) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-balance">
        Top Recommended Slots
      </h2>

      <div className="space-y-3">
        {results.map((slot, i) => {
          const cfg = statusConfig[slot.status];
          const Icon = cfg.icon;

          return (
            <div
              key={i}
              className={`rounded-xl border ${cfg.border} ${cfg.bg} p-5 space-y-3 animate-fade-up`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <p className="font-mono text-base font-medium">
                    {slot.day} {slot.startLabel} – {slot.endLabel}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {slot.availableNames.join(" + ")}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.text} ${cfg.bg} border ${cfg.border}`}
                >
                  <Icon size={13} />
                  {slot.status}
                </span>
              </div>

              {/* Reasoning */}
              <p className="text-sm text-foreground/70">{slot.reasoning}</p>

              {/* Conflict info */}
              {slot.unavailableNames.length > 0 && (
                <p className="text-xs text-muted-foreground italic">
                  ⚠ Unavailable: {slot.unavailableNames.join(", ")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
