# PromptLab — Prompt Version Control + A/B Testing Dashboard

## What We're Building

A full-stack web app called **PromptLab** — a professional tool where you can write AI prompts, track every version like Git, and run A/B experiments to scientifically compare which prompt performs better. Think of it as "GitHub + Google Optimize — but for LLM prompts."

---

## Tech Stack Decisions (and Why)

| Technology | Role | Reason |
|-----------|------|--------|
| **Next.js 14 (App Router)** | Full-stack framework | Frontend + backend API in one project |
| **SQLite + Prisma** | Database + ORM | Zero setup, type-safe queries, easy to understand |
| **OpenAI API** | LLM provider | Industry standard, easy to get API key |
| **Recharts** | Data visualization | Beautiful, React-native charting library |
| **Tailwind CSS** | Styling | Utility-first, fast to build premium UIs |
| **shadcn/ui** | UI components | Polished, accessible component library |
| **diff** (npm package) | Text diffing | Highlight what changed between prompt versions |

---

## Open Questions

> [!IMPORTANT]
> **Do you have an OpenAI API key?**
> The project needs one to actually call LLMs. If not, we can mock LLM calls for now and you can add a real key later. Let me know!

> [!NOTE]
> **API Key Storage**: For this portfolio project, we'll store the API key in a `.env.local` file (never committed to Git). This is the standard approach.

---

## Project Structure

```
prompt-lab/
├── app/
│   ├── layout.tsx                    ← Root layout, fonts, global styles
│   ├── page.tsx                      ← Home / Dashboard (stats overview)
│   ├── projects/
│   │   ├── page.tsx                  ← List all projects
│   │   └── [id]/
│   │       ├── page.tsx              ← Project detail (list prompts)
│   │       └── prompts/
│   │           └── [promptId]/
│   │               ├── page.tsx      ← Prompt editor + version history
│   │               └── experiments/
│   │                   └── [expId]/
│   │                       └── page.tsx ← Experiment results + charts
│   └── api/
│       ├── projects/route.ts         ← CRUD for projects
│       ├── prompts/route.ts          ← CRUD for prompts
│       ├── versions/route.ts         ← Save / list versions
│       ├── experiments/route.ts      ← Create / list experiments
│       ├── run/route.ts              ← Run a single prompt against LLM
│       └── evaluate/route.ts         ← Score outputs (LLM-as-Judge)
├── components/
│   ├── ui/                           ← shadcn/ui base components
│   ├── prompt-editor.tsx             ← Textarea with {variable} highlighting
│   ├── version-history.tsx           ← Git-log style sidebar
│   ├── diff-viewer.tsx               ← Side-by-side diff of two versions
│   ├── experiment-creator.tsx        ← Form to set up A/B test
│   ├── experiment-runner.tsx         ← Live progress during test run
│   ├── results-table.tsx             ← Detailed per-test-case results
│   └── charts/
│       ├── metric-trend-chart.tsx    ← Line chart: accuracy over versions
│       └── ab-comparison-chart.tsx   ← Bar chart: A vs B metrics
├── lib/
│   ├── db.ts                         ← Prisma client singleton
│   ├── llm.ts                        ← OpenAI API wrapper
│   └── evaluator.ts                  ← Scoring logic (latency, cost, quality)
├── prisma/
│   └── schema.prisma                 ← Database schema
└── .env.local                        ← OPENAI_API_KEY (gitignored)
```

---

## Database Schema

```prisma
// A workspace for a set of prompts (like a Git repo)
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  prompts     Prompt[]
}

// A named prompt within a project (like a file)
model Prompt {
  id          String          @id @default(cuid())
  name        String
  description String?
  projectId   String
  project     Project         @relation(fields: [projectId], references: [id])
  createdAt   DateTime        @default(now())
  versions    PromptVersion[]
}

// A snapshot of a prompt at a point in time (like a Git commit)
model PromptVersion {
  id             String   @id @default(cuid())
  promptId       String
  prompt         Prompt   @relation(fields: [promptId], references: [id])
  versionNumber  Int
  systemMessage  String?
  userTemplate   String
  model          String   @default("gpt-4o-mini")
  temperature    Float    @default(0.7)
  maxTokens      Int      @default(500)
  tag            String   @default("draft") // draft | staging | production
  commitMessage  String?
  createdAt      DateTime @default(now())
  
  experimentsAsA Experiment[] @relation("VersionA")
  experimentsAsB Experiment[] @relation("VersionB")
  results        Result[]
}

// A test input with optional expected output
model TestCase {
  id             String       @id @default(cuid())
  experimentId   String
  experiment     Experiment   @relation(fields: [experimentId], references: [id])
  inputVariables Json         // { "topic": "AI", "language": "English" }
  expectedOutput String?
  results        Result[]
}

// An A/B experiment comparing two prompt versions
model Experiment {
  id              String        @id @default(cuid())
  name            String
  versionAId      String
  versionBId      String
  versionA        PromptVersion @relation("VersionA", fields: [versionAId], references: [id])
  versionB        PromptVersion @relation("VersionB", fields: [versionBId], references: [id])
  status          String        @default("pending") // pending | running | completed
  createdAt       DateTime      @default(now())
  completedAt     DateTime?
  testCases       TestCase[]
  results         Result[]
}

// The LLM output for one prompt version on one test case
model Result {
  id             String        @id @default(cuid())
  experimentId   String
  testCaseId     String
  versionId      String
  experiment     Experiment    @relation(fields: [experimentId], references: [id])
  testCase       TestCase      @relation(fields: [testCaseId], references: [id])
  version        PromptVersion @relation(fields: [versionId], references: [id])
  output         String
  latencyMs      Int
  promptTokens   Int
  completionTokens Int
  estimatedCostUsd Float
  qualityScore   Float?        // 1-5 from LLM-as-Judge
  createdAt      DateTime      @default(now())
}
```

---

## Pages & Features Breakdown

### 1. Dashboard (`/`)
- Total projects, prompts, versions, experiments (stats cards)
- Recent activity feed
- Quick-create project button

### 2. Projects List (`/projects`)
- Card grid of all projects
- Create new project modal

### 3. Project Detail (`/projects/[id]`)
- List of prompts in this project
- Create new prompt

### 4. Prompt Editor (`/projects/[id]/prompts/[promptId]`)
This is the **main page** — most features live here:
- **Left panel**: Prompt editor with `{variable}` highlighting
  - System message field
  - User message template
  - Model selector (gpt-4o, gpt-4o-mini, etc.)
  - Temperature slider
  - Max tokens input
- **Right panel**: Version history sidebar (Git log style)
  - Each version shows: version #, commit message, tag, time ago
  - Click any version → loads it into the editor
  - Tag buttons: Set as Production / Staging / Draft
- **Bottom panel**: Quick test
  - Fill in `{variable}` values
  - Click "Run" → see LLM output + latency + cost
- **Save Version button** → saves current editor state as new version

### 5. Version Diff (`/projects/[id]/prompts/[promptId]?diff=v1,v2`)
- Side-by-side view of two versions
- Green = added, Red = removed (like GitHub diff)

### 6. Experiments List (`/projects/[id]/prompts/[promptId]/experiments`)
- Table of all A/B experiments for this prompt
- Status badges (running / completed)
- Winner badge on completed experiments

### 7. Create Experiment (modal/form)
- Pick Version A vs Version B from dropdowns
- Add test cases (input variables + optional expected output)
- Can add multiple test cases
- Set judge mode: None / LLM-as-Judge

### 8. Experiment Results (`/experiments/[expId]`)
- **Head-to-head metric cards**: Avg latency, avg cost, avg quality
- **Winner banner**: "🏆 Version 2 wins by 23% quality score"
- **Bar charts**: A vs B on each metric
- **Results table**: Per test case — input, A output, B output, scores
- **Cost breakdown**: Total tokens used, total $ spent

---

## Build Phases

### Phase 1 — Foundation (Project Setup)
- [ ] Initialize Next.js project with Tailwind + shadcn/ui
- [ ] Set up Prisma schema + SQLite database
- [ ] Run initial migration
- [ ] Create Prisma client singleton
- [ ] Set up global layout, fonts, dark theme

### Phase 2 — Core Data Layer (API Routes)
- [ ] `GET/POST /api/projects`
- [ ] `GET/POST /api/prompts`
- [ ] `GET/POST /api/versions`
- [ ] `POST /api/run` (call LLM with a prompt version)
- [ ] `GET/POST /api/experiments`
- [ ] `POST /api/experiments/[id]/run` (run full A/B experiment)

### Phase 3 — Main UI Pages
- [ ] Dashboard page with stats
- [ ] Projects list + creation
- [ ] Prompt editor with variable highlighting
- [ ] Version history sidebar
- [ ] Quick test panel

### Phase 4 — Version Control Features
- [ ] Save version with commit message
- [ ] Version history sidebar (Git log style)
- [ ] Side-by-side diff viewer
- [ ] Tag management (draft/staging/production)
- [ ] Rollback (load any version into editor)

### Phase 5 — A/B Testing
- [ ] Experiment creation form + test case manager
- [ ] Experiment runner (calls LLM for both versions on all test cases)
- [ ] LLM-as-Judge scoring
- [ ] Results storage

### Phase 6 — Analytics & Polish
- [ ] Charts (Recharts): metric trends, A vs B comparison
- [ ] Winner detection with percentage improvement
- [ ] Results table with per-case detail
- [ ] Export to CSV
- [ ] Final UI polish + animations

---

## Verification Plan

### During Build
- Test each API route with browser or Postman before wiring to UI
- Verify database inserts via `npx prisma studio`

### Final Check
- Create a real project → write a prompt → save 3 versions
- Run a quick test on a version (verify LLM call works)
- Create an A/B experiment with 5 test cases
- Verify results table and charts render correctly
- Check cost calculation is accurate

---

## Estimated Build Time
- **Phase 1-2**: ~1-2 hours (foundation + APIs)
- **Phase 3-4**: ~2-3 hours (UI + version control)  
- **Phase 5-6**: ~2-3 hours (A/B + analytics)
- **Total**: ~1-2 focused coding sessions
