import { useCallback, useRef, useState } from "react";
import { CalendarClock, Plus, RotateCcw, Sparkles } from "lucide-react";
import { InterviewerInput } from "@/components/InterviewerInput";
import { ResultsTable } from "@/components/ResultsTable";
import { LoadingDots } from "@/components/LoadingDots";
import { findBestSlots, type Interviewer, type SlotResult } from "@/lib/scheduler";
import { useToast } from "@/hooks/use-toast";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const INITIAL_INTERVIEWERS: Interviewer[] = [
  { id: uid(), name: "", availability: "" },
  { id: uid(), name: "", availability: "" },
  { id: uid(), name: "", availability: "" },
];

export default function Index() {
  const [candidateAvailability, setCandidateAvailability] = useState("");
  const [interviewers, setInterviewers] = useState<Interviewer[]>(INITIAL_INTERVIEWERS);
  const [results, setResults] = useState<SlotResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleInterviewerChange = useCallback(
    (id: string, field: "name" | "availability", value: string) => {
      setInterviewers(prev =>
        prev.map(iv => (iv.id === id ? { ...iv, [field]: value } : iv))
      );
    },
    []
  );

  const addInterviewer = () => {
    if (interviewers.length >= 5) {
      toast({ title: "Maximum 5 interviewers", variant: "destructive" });
      return;
    }
    setInterviewers(prev => [...prev, { id: uid(), name: "", availability: "" }]);
  };

  const removeInterviewer = (id: string) => {
    setInterviewers(prev => prev.filter(iv => iv.id !== id));
  };

  const validate = (): string | null => {
    if (!candidateAvailability.trim()) return "Please enter candidate availability.";
    const filled = interviewers.filter(iv => iv.name.trim() && iv.availability.trim());
    if (filled.length === 0) return "Please add at least one interviewer with name and availability.";
    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) {
      setError(err);
      setResults(null);
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);

    // Simulate brief processing delay
    setTimeout(() => {
      const slots = findBestSlots(candidateAvailability, interviewers);
      setLoading(false);
      if (slots.length === 0) {
        setError("No overlapping slots found. Try adjusting the availabilities.");
      } else {
        setResults(slots);
        // Scroll to results
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    }, 800);
  };

  const handleReset = () => {
    setCandidateAvailability("");
    setInterviewers(INITIAL_INTERVIEWERS.map(iv => ({ ...iv, id: uid() })));
    setResults(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <CalendarClock size={18} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">AI Interview Scheduler</h1>
            <p className="text-xs text-muted-foreground">Find the best time for everyone</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        {/* Candidate Section */}
        <section className="animate-fade-up space-y-3">
          <label className="block text-sm font-medium">Candidate Availability</label>
          <textarea
            value={candidateAvailability}
            onChange={e => setCandidateAvailability(e.target.value)}
            placeholder="e.g. Tue 2-5 PM, Wed 1-4 PM, Fri 9-12 PM"
            rows={3}
            className="w-full rounded-xl border bg-card px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </section>

        {/* Interviewers Section */}
        <section className="animate-fade-up animate-fade-up-delay-1 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Interviewers</label>
            <button
              onClick={addInterviewer}
              disabled={interviewers.length >= 5}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
            >
              <Plus size={13} />
              Add
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {interviewers.map((iv, i) => (
              <InterviewerInput
                key={iv.id}
                interviewer={iv}
                index={i}
                canRemove={interviewers.length > 1}
                onChange={handleInterviewerChange}
                onRemove={removeInterviewer}
              />
            ))}
          </div>
        </section>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive animate-fade-up">{error}</p>
        )}

        {/* Actions */}
        <div className="animate-fade-up animate-fade-up-delay-2 flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-60"
          >
            {loading ? (
              <LoadingDots />
            ) : (
              <>
                <Sparkles size={15} />
                Find Best Slots
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors active:scale-[0.97]"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        {/* Results */}
        <div ref={resultsRef}>
          {results && (
            <section className="animate-fade-up animate-fade-up-delay-3">
              <ResultsTable results={results} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
