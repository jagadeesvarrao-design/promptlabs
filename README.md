# 🧪 PromptLab

> **A Professional Prompt Engineering Workspace** · Version Control, Sandbox Playgrounds, Visual Diffs, and Scientific A/B Testing for AI Prompts.

---

[![Next.js](https://img.shields.io/badge/Next.js-16.2-blueviolet?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-teal?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini-API-orange?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

PromptLab bridges the gap between ad-hoc prompt writing and systematic, data-backed prompt engineering. By bringing software engineering best practices—like Git-like version control, batch regression testing, and automated quality grading—to prompt design, PromptLab gives AI engineers the workspace they need to build robust, predictable, and cost-effective LLM pipelines.

---

## ✨ Key Features

### 🕒 1. Git-like Version Control
*   **Decoupled Prompts:** Move your prompts out of your code files and manage them in a dedicated repository database.
*   **Systematic Commits:** Save every prompt template modification as a unique version with a descriptive commit log.
*   **State Tagging:** Manage your prompt lifecycles with tag states (`draft` ➔ `staging` ➔ `production`).
*   **Visual Side-by-Side Diffs:** Review exactly what changed between any two prompt versions using an elegant, color-coded visual diff viewer.

### 🎛️ 2. Dynamic Sandbox Playgrounds
*   **Auto-extracted Variables:** Automatically parses dynamic placeholders in curly braces `{variable_name}` inside user templates on keypress.
*   **Granular Parameter Adjustments:** Control temperature, max token limits, and system instruction overrides.
*   **Detailed Analytics:** Track latency (ms), prompt/completion token count, and estimated dollar costs instantly for every query execution.

### 🧪 3. Advanced A/B Regression Testing
*   **Scientific Comparisons:** Evaluate and compare two prompt versions side-by-side across a custom dataset.
*   **LLM-as-a-Judge Evaluation:** Uses `gemini-2.0-flash-lite` to automatically grade the output quality of both versions on a 1.0 to 5.0 scale.
*   **Custom Grading Rubrics:** Write specific grading rules per experiment (e.g. *"Grade 5 if output includes the word 'pirate', 1 if not"*).
*   **Dual Metrics Comparison:** View aggregated comparative graphs (averaging latency, token counts, costs, and quality scores) powered by Recharts.

### 📥 4. Bulk Dataset Imports
*   **Drag-and-Drop CSVs:** Bulk import test inputs and ground-truth values to run regression tests against massive historic logs.
*   **Case-insensitive Mapping:** Auto-detects ground-truth target columns (e.g., matching `"expected"`, `"expected output"`, or `"expectedOutput"` headers).

### 🚀 5. Dynamic Deployment API
*   **Live Injection:** Retrieve prompt templates at runtime via a lightweight API route.
*   **Dynamic Releases:** Instantly update prompts in your production backend applications by changing the `production` tag in the PromptLab dashboard—no code redeployments required!

---

## 📂 Directory Layout

```
prompt-lab/
├── app/                              # Next.js App Router & Server API Routes
│   ├── api/                          # Backend API Routes
│   │   ├── experiments/              # Experiment suites & runners
│   │   ├── projects/                 # Projects CRUD
│   │   ├── prompts/                  # Prompts registry & deployments
│   │   ├── run/                      # Sandbox play runner
│   │   └── versions/                 # Commit versions & tags
│   ├── projects/                     # Client page dashboards
│   ├── globals.css                   # Theme configurations & custom scrollbars
│   └── layout.tsx                    # Shared page wrapper
├── components/                       # Premium Reusable React UI Elements
│   ├── charts/                       # Metric dual-bar charts
│   ├── api-integration-modal.tsx     # Clipboard client integration wizard
│   ├── diff-viewer.tsx               # Monaco-style visual diff modal
│   ├── experiment-creator.tsx        # A/B dataset configuration wizard
│   └── onboarding-tour.tsx           # Step-by-step interactive onboarding
├── lib/                              # Shared backend core utils
│   ├── csv-parser.ts                 # PapaParse-style CSV parser
│   └── llm.ts                        # Gemini SDK & Judge evaluator client
├── prisma/                           # Relational Prisma models configuration
│   └── schema.prisma                 # SQLite relational structure schemas
```

---

## 📊 Database Data Model

PromptLab uses a relational SQLite database. Below is the structure mapping the lifecycle of prompts and evaluations:

| Table | Purpose | Primary Fields |
| :--- | :--- | :--- |
| **Project** | Workspace for grouping related prompts. | `id`, `name`, `description`, `createdAt` |
| **Prompt** | Represents a specific task or microservice prompt. | `id`, `name`, `projectId`, `createdAt` |
| **PromptVersion** | Immutable template "commits" with model parameters. | `id`, `versionNumber`, `userTemplate`, `model`, `tag` |
| **Experiment** | An evaluation comparing two prompt versions. | `id`, `name`, `evaluationRubric`, `status` |
| **TestCase** | A test dataset row containing variable values. | `id`, `inputVariables` (JSON string), `expectedOutput` |
| **Result** | Latency, cost, token, and grade results for a test run. | `id`, `output`, `latencyMs`, `promptTokens`, `qualityScore` |

---

## 🛠️ Quick Local Installation

### Prerequisites
- Node.js (v18+)
- NPM or Yarn
- Google Gemini API Key ([Get one here](https://aistudio.google.com/))

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_actual_google_gemini_api_key_here"
```

### 3. Initialize the database schema
Sync and push the relational database structures to the local SQLite database file:
```bash
npx prisma db push
```

### 4. Boot the Next.js development server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 📡 Deployment API Example

To dynamically fetch your latest `production`-tagged prompt inside your own backend application:

```javascript
// Fetch prompt template from your PromptLab deployment route
const response = await fetch('http://localhost:3000/api/prompts/deploy?promptId=PROMPT_ID_HERE&tag=production');
const promptConfig = await response.json();

console.log(promptConfig);
/*
Output:
{
  "versionNumber": 3,
  "systemMessage": "You are a helpful assistant.",
  "userTemplate": "Summarize this email: {email}",
  "model": "gemini-2.5-flash",
  "temperature": 0.7,
  "maxTokens": 500,
  "tag": "production"
}
*/
```

---

## 🤝 Contribution Guidelines
Contributions to improve PromptLab are highly welcomed! If you find any issues, please create an Issue or submit a Pull Request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingUpgrade`).
3.  Commit your changes (`git commit -m 'feat: Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/AmazingUpgrade`).
5.  Open a Pull Request!
