# Smart Slot Finder

> Intelligent interview scheduling that turns candidate and interviewer availability into ranked, conflict-aware meeting recommendations.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)

## Overview

Smart Slot Finder is a browser-based interview scheduling assistant designed to reduce the manual coordination involved in finding a meeting time.

Users enter a candidate's availability and the availability of one or more interviewers. The application parses natural availability ranges, calculates overlaps, detects conflicts, and ranks the strongest scheduling options. The interface then presents the top three recommendations with participant availability, status, duration, and a short explanation of why each slot was selected.

The core scheduling engine is implemented in TypeScript and runs locally in the application. It normalizes weekday names, converts AM/PM input into comparable 24-hour values, computes time-range intersections, removes duplicate results, and ranks slots by participant coverage and duration.

## Key Features

### Availability parsing
Accepts practical inputs such as `Tue 2-5 PM`, `Wed 1 PM - 4 PM`, or multiple ranges separated by commas/newlines.

### Multi-interviewer scheduling
Supports multiple interviewers, each with their own availability and editable details.

### Overlap detection
Compares candidate availability against every interviewer and calculates usable time intersections with a minimum one-hour overlap.

### Ranked recommendations
Produces up to three recommended slots, prioritizing the number of available participants and then the length of the overlap.

### Conflict visibility
Shows which participants are unavailable for a suggested slot instead of hiding scheduling conflicts.

### Explainable recommendations
Every result includes reasoning such as maximum overlap, strong overlap, or partial overlap, along with the meeting duration.

### Clean scheduling UI
The application separates interviewer input from recommended results and provides lightweight interaction feedback for a focused scheduling workflow.

## How It Works

```text
Candidate Availability
        +
Interviewer Availability
        │
        ▼
   Input Parsing
        │
        ▼
Day + Time Normalization
        │
        ▼
Intersection / Conflict Analysis
        │
        ▼
Deduplication + Ranking
        │
        ▼
Top 3 Recommended Slots
        │
        ├── Participants Available
        ├── Participants Unavailable
        ├── Duration
        ├── Status
        └── Reasoning
```

## Scheduling Logic

The scheduling engine is centered around `src/lib/scheduler.ts`.

1. Candidate and interviewer availability strings are split into individual ranges.
2. Day names are normalized to a common weekday format.
3. Times are converted to numeric 24-hour values.
4. Candidate ranges are intersected with interviewer ranges on the same day.
5. The engine evaluates common windows and additional interviewer-specific options.
6. Duplicate slots are removed.
7. Results are ranked by participant availability and overlap duration.
8. The best three results are labeled `Best`, `Good`, or `Limited` and receive human-readable reasoning.

This keeps the scheduling behavior deterministic and explainable rather than relying on opaque recommendations.

## Tech Stack

| Area | Technology |
|---|---|
| UI | React 18 |
| Language | TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS |
| Components | Radix UI + custom UI components |
| Forms | React Hook Form + Zod |
| Routing | React Router |
| Data/query utilities | TanStack Query |
| Icons | Lucide React |
| Date/time utilities | date-fns |
| Testing | Vitest + Testing Library + Playwright |
| Package tooling | npm / Bun lockfiles |

The project's package configuration includes dedicated scripts for development, production builds, linting, unit tests, and watch mode.

## Project Structure

```text
smart-slot-finder/
├── src/
│   ├── components/
│   │   ├── InterviewerInput.tsx
│   │   ├── ResultsTable.tsx
│   │   ├── LoadingDots.tsx
│   │   ├── NavLink.tsx
│   │   └── ui/                # Reusable UI primitives
│   ├── lib/
│   │   └── scheduler.ts       # Parsing, overlap and ranking logic
│   ├── pages/                  # Application pages
│   ├── App.tsx                 # App shell and routing
│   └── ...
├── playwright-fixture.ts
├── playwright.config.ts
├── package.json
├── tailwind.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or Bun)

### Installation

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

### Production build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Tests

```bash
npm run test
```

For watch mode:

```bash
npm run test:watch
```

## Example Input

**Candidate**

```text
Tue 2-5 PM, Wed 1-4 PM
```

**Interviewers**

```text
Alice → Tue 3-5 PM, Wed 1-2 PM
Bob   → Tue 2-4 PM, Wed 2-5 PM
```

The scheduler parses these ranges, checks intersections, evaluates participant coverage, and returns the strongest available options with conflict information.

## Why This Project

Interview coordination often becomes a repetitive back-and-forth exercise when multiple calendars are involved. Smart Slot Finder explores a practical automation approach: convert messy availability text into structured time ranges, apply deterministic scheduling logic, and return recommendations that are easy for a recruiter or hiring manager to understand.

The project demonstrates:

- TypeScript application design
- Algorithmic time-range processing
- Input normalization and validation
- Multi-participant conflict analysis
- Ranking and recommendation logic
- Component-based React UI development
- Automated testing setup

## Testing Strategy

The repository includes Vitest, Testing Library, and Playwright dependencies/configuration, providing a foundation for unit, component, and end-to-end testing of the scheduling workflow.

## Future Improvements

Potential next steps include calendar API integrations, timezone-aware scheduling, recurrence support, calendar event creation, larger-scale optimization across many interviewers, and smarter natural-language availability parsing.

## Security & Privacy

The scheduler's core recommendation logic operates on the availability information entered into the interface. Do not commit API keys, credentials, private calendar tokens, or other secrets to the repository.

## Author

Built by [Paras Palawat](https://github.com/paraspalawat).

---

⭐ If this project is useful, consider giving the repository a star.
