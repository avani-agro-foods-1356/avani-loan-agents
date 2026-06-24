# Agent Operations Manual - Avani Loan Agents

This document details the operational workflow, capabilities, and best practices for the **Avani Loan Agents** team to operate their agentic coding assistant, **Antigravity**.

---

## 1. How the Agent Operates for Avani Loan Agents

The agent operates in an **interactive auto-mode** tailored for the Avani Loan Agents project structure (which contains Next.js frontend pages, SQLite databases, and AI-powered advisory chat modules). 

You do **not** need to:
- Manually run development servers or install dependencies.
- Write raw React/TypeScript or SQL query code.
- Manually check local websites or API configurations.

### Automatic Execution Model
When you give an instruction in the chat, the agent uses its tool suite to execute the request automatically. You are only prompted to **Approve** or **Reject** actions that execute commands on your system or change project resources. Once approved, the execution is fully automatic.

---

## 2. Step-by-Step Operation Process

Here is the flow of how the Avani Loan Agents team operates the agent:

```mermaid
graph TD
    A[Avani Loan Agents Team Request] --> B[Agent Research & Planning]
    B --> C{Complex Change?}
    C -- Yes --> D[Create Implementation Plan]
    D --> E[Team Approves/Rejects Plan]
    E -- Approved --> F[Execute Code Changes]
    C -- No --> F
    F --> G[Run Terminal/Build/Dev Commands]
    G --> H[Team Approves Command Execution]
    H -- Approved --> I[Browser Verification Subagent]
    I --> J[Generate Walkthrough Document]
    J --> K[Team Reviews Completed Task]
```

### Step 1: Requesting a Change (User Input)
State the business or technical requirement for Avani Loan Agents. For example:
- *"Add a feature to collect loan applicants' employment history."*
- *"Check why the SQLite database is not saving new customer inquiries."*
- *"Improve the responsiveness of the loan calculator widget."*

### Step 2: Codebase Scan & Planning (Automatic)
The agent scans the workspace files including:
- Next.js application routes: `app/`
- Helper utilities and db configurations: `lib/`
- Local configuration variables: `.env.local`

For complex features, the agent creates an `implementation_plan.md` first and waits for your confirmation.

### Step 3: Performing Modifications (Automatic)
The agent writes, updates, or deletes file content directly without manual copy-paste errors.

### Step 4: Running Build & Server Commands (Interactive Approval)
When the agent needs to compile the project or start development servers (e.g., `npm run dev`), it prompts you.
- Simply click **Approve** in the IDE workspace.
- The agent handles the console outputs, logs, and any debugging if compilation fails.

### Step 5: Web Browser Validation (Automatic)
The agent opens a web browser to test the local dev server:
- Checks the landing page: `http://localhost:3000`
- Tests the loan chat interaction: `http://localhost:3000/chat`
- Inspects the administration dashboard: `http://localhost:3000/dashboard`

### Step 6: Walkthrough & Delivery (Automatic)
A new [walkthrough.md](file:///C:/Users/ALPHA-1/.gemini/antigravity-ide/brain/432c6a54-57e7-442a-8bcc-4e005a0ec28d/walkthrough.md) is created containing screenshots and visual confirmation of the working feature.

---

## 3. Useful Commands & Best Practices

- **Slash Command `/goal`**: Use this when you have a complex goal (e.g., building a complete multi-step loan onboarding flow). The agent will keep running in the background and verify all steps automatically.
- **Slash Command `/grill-me`**: Recommend this if you want the agent to interview you on business requirements before starting code execution.
- **Auto-Mode is Default**: Let the agent execute all file operations and command setups. Do not feel the need to execute CLI commands manually.
