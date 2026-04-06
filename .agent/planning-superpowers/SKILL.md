---
name: planning-implementation
description: Breaks work into bite-sized, test-driven tasks. Use after a design is approved and before touching code to create a precise implementation roadmap.
---

# Planning with Superpowers

## When to use this skill
- After a design/spec is approved by the user.
- Before starting any implementation to define a clear path.

## Workflow
1. [ ] **Scope Check** — Suggest breaking large specs into sub-project plans.
2. [ ] **File Mapping** — Define which files will be created or modified.
3. [ ] **Bite-Sized Tasks** — Break work into 2-5 minute actions.
4. [ ] **Save Plan** — Save to `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`.

## Instructions
- **TDD Requirement**: Every task MUST include:
    - Failing test code.
    - Command to run and verify failure.
    - Minimal implementation.
    - Command to run and verify success.
- **Task Granularity**: Each step should be one action (Write -> Fail -> Code -> Pass -> Commit).
- **Exact File Paths**: Always provide full paths.
- **Plan Header**: Every plan MUST start with the standard header:
    - **Goal**: One sentence.
    - **Architecture**: 2-3 sentences.
    - **Tech Stack**: Key libraries.

## Execution Choice
After saving the plan, offer the user a choice:
1. **Subagent-Driven**: Dispatch a fresh subagent per task (recommended).
2. **Inline Execution**: Execute tasks in the current session.
