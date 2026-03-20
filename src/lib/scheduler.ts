// ── Types ──

export interface TimeRange {
  day: string;
  start: number; // 24h numeric, e.g. 14 = 2 PM
  end: number;
}

export interface Interviewer {
  id: string;
  name: string;
  availability: string;
}

export interface SlotResult {
  day: string;
  startLabel: string;
  endLabel: string;
  start: number;
  end: number;
  duration: number;
  availableNames: string[];
  unavailableNames: string[];
  status: "Best" | "Good" | "Limited";
  reasoning: string;
}

// ── Parsing ──

const DAY_MAP: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri",
  sat: "Sat", sun: "Sun",
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

function normalizeDay(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/[^a-z]/g, "");
  return DAY_MAP[key] ?? raw.trim();
}

function parseHour(raw: string): number {
  const cleaned = raw.trim().toLowerCase();
  const num = parseInt(cleaned, 10);
  if (isNaN(num)) return -1;
  const isPM = cleaned.includes("pm") || cleaned.includes("p");
  const isAM = cleaned.includes("am") || cleaned.includes("a");
  if (isPM && num < 12) return num + 12;
  if (isAM && num === 12) return 0;
  return num;
}

export function parseAvailability(text: string): TimeRange[] {
  const ranges: TimeRange[] = [];
  // Split by comma or newline
  const segments = text.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);

  for (const seg of segments) {
    // Match patterns like "Tue 2-5 PM" or "Wed 1 PM - 4 PM" or "Friday 9-12"
    const match = seg.match(
      /^([a-zA-Z]+)\s+(\d{1,2})\s*(?:am|pm|a|p)?\s*[-–to]+\s*(\d{1,2})\s*(am|pm|a|p)?/i
    );
    if (!match) continue;

    const day = normalizeDay(match[1]);
    const period = (match[4] || "").toLowerCase();
    let startH = parseInt(match[2], 10);
    let endH = parseInt(match[3], 10);

    // Apply AM/PM logic
    const isPM = period.startsWith("p");
    if (isPM) {
      if (endH < 12) endH += 12;
      if (startH < 12 && startH < endH - 12) startH += 12;
      // handle cases like "2-5 PM" → 14-17
      if (startH < endH - 12) startH += 12;
    }
    // If end <= start (e.g. misparse), try fixing
    if (endH <= startH && isPM) {
      // already handled
    }

    if (startH >= 0 && endH > startH) {
      ranges.push({ day, start: startH, end: endH });
    }
  }
  return ranges;
}

// ── Overlap calculation ──

function intersect(a: TimeRange, b: TimeRange): TimeRange | null {
  if (a.day !== b.day) return null;
  const start = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);
  if (end - start < 1) return null; // at least 1 hour overlap
  return { day: a.day, start, end };
}

function formatHour(h: number): string {
  if (h === 0 || h === 24) return "12 AM";
  if (h === 12) return "12 PM";
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

export function findBestSlots(
  candidateText: string,
  interviewers: Interviewer[]
): SlotResult[] {
  const candidateRanges = parseAvailability(candidateText);
  const interviewerData = interviewers
    .filter(i => i.name.trim() && i.availability.trim())
    .map(i => ({
      name: i.name.trim(),
      ranges: parseAvailability(i.availability),
    }));

  if (candidateRanges.length === 0 || interviewerData.length === 0) return [];

  // For each candidate range, find which interviewers overlap and the common window
  const rawSlots: {
    day: string; start: number; end: number;
    available: string[]; unavailable: string[];
  }[] = [];

  for (const cRange of candidateRanges) {
    // Find each interviewer's overlap with this candidate range
    const overlaps: { name: string; range: TimeRange }[] = [];
    const noOverlap: string[] = [];

    for (const iv of interviewerData) {
      let bestOverlap: TimeRange | null = null;
      for (const ivRange of iv.ranges) {
        const ov = intersect(cRange, ivRange);
        if (ov && (!bestOverlap || (ov.end - ov.start) > (bestOverlap.end - bestOverlap.start))) {
          bestOverlap = ov;
        }
      }
      if (bestOverlap) {
        overlaps.push({ name: iv.name, range: bestOverlap });
      } else {
        noOverlap.push(iv.name);
      }
    }

    if (overlaps.length === 0) continue;

    // Find the common intersection of all overlapping interviewers + candidate
    // Try biggest group first, then subsets
    // Sort by number of participants (try all combos is expensive, use greedy)
    // Find the intersection of ALL overlapping interviewers
    let commonStart = cRange.start;
    let commonEnd = cRange.end;
    const allAvailable: string[] = [];
    const allUnavailable = [...noOverlap];

    for (const ov of overlaps) {
      const newStart = Math.max(commonStart, ov.range.start);
      const newEnd = Math.min(commonEnd, ov.range.end);
      if (newEnd - newStart >= 1) {
        commonStart = newStart;
        commonEnd = newEnd;
        allAvailable.push(ov.name);
      } else {
        allUnavailable.push(ov.name);
      }
    }

    if (allAvailable.length > 0) {
      rawSlots.push({
        day: cRange.day,
        start: commonStart,
        end: commonEnd,
        available: ["Candidate", ...allAvailable],
        unavailable: allUnavailable,
      });
    }

    // Also try individual pairs for more options
    for (const ov of overlaps) {
      const exists = rawSlots.some(
        s => s.day === cRange.day && s.start === ov.range.start && s.end === ov.range.end
      );
      if (!exists) {
        rawSlots.push({
          day: cRange.day,
          start: ov.range.start,
          end: ov.range.end,
          available: ["Candidate", ov.name],
          unavailable: interviewerData
            .filter(iv => iv.name !== ov.name)
            .map(iv => iv.name),
        });
      }
    }
  }

  // Deduplicate and rank
  const unique = new Map<string, typeof rawSlots[0]>();
  for (const s of rawSlots) {
    const key = `${s.day}-${s.start}-${s.end}-${s.available.length}`;
    const existing = unique.get(key);
    if (!existing || s.available.length > existing.available.length) {
      unique.set(key, s);
    }
  }

  const sorted = [...unique.values()].sort((a, b) => {
    const diffPart = b.available.length - a.available.length;
    if (diffPart !== 0) return diffPart;
    return (b.end - b.start) - (a.end - a.start);
  });

  const maxParticipants = sorted[0]?.available.length ?? 0;

  return sorted.slice(0, 3).map((s, i) => {
    let status: SlotResult["status"];
    if (s.available.length >= maxParticipants) status = "Best";
    else if (s.available.length >= maxParticipants - 1) status = "Good";
    else status = "Limited";

    const duration = s.end - s.start;
    let reasoning: string;
    if (status === "Best") {
      reasoning = `Maximum overlap — ${s.available.length} participants available for ${duration}h`;
    } else if (status === "Good") {
      reasoning = `Strong overlap with ${s.available.length} participants across ${duration}h`;
    } else {
      reasoning = `Partial overlap — only ${s.available.length} participants for ${duration}h`;
    }

    return {
      day: s.day,
      startLabel: formatHour(s.start),
      endLabel: formatHour(s.end),
      start: s.start,
      end: s.end,
      duration,
      availableNames: s.available,
      unavailableNames: s.unavailable,
      status,
      reasoning,
    };
  });
}
