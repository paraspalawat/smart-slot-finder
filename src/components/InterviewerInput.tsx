import { Trash2 } from "lucide-react";
import type { Interviewer } from "@/lib/scheduler";

interface Props {
  interviewer: Interviewer;
  index: number;
  canRemove: boolean;
  onChange: (id: string, field: "name" | "availability", value: string) => void;
  onRemove: (id: string) => void;
}

export function InterviewerInput({ interviewer, index, canRemove, onChange, onRemove }: Props) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">
          Interviewer {index + 1}
        </label>
        {canRemove && (
          <button
            onClick={() => onRemove(interviewer.id)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Remove interviewer"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <input
        type="text"
        placeholder="Name (e.g. Alice)"
        value={interviewer.name}
        onChange={e => onChange(interviewer.id, "name", e.target.value)}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <textarea
        placeholder="Availability (e.g. Tue 2-5 PM, Wed 1-3 PM)"
        value={interviewer.availability}
        onChange={e => onChange(interviewer.id, "availability", e.target.value)}
        rows={2}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />
    </div>
  );
}
