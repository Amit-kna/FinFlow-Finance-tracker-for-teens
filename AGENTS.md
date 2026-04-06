# FinFlow Session Startup

## Global Rules (GEMINI.md)
- Think in tasks/features, not files
- Trust through Artifacts - review plans before approval
- Default: `Request Review` - never `Always Proceed` for production
- Deny list: `rm -rf`, `DROP TABLE`, `git push --force`, `truncate`, `delete from` (no WHERE)
- Set up `.gitignore`, venv/`node_modules` before first task
- Goal-oriented prompts, one task = one goal
- Request Plan Mode for complex tasks
- Use inline comments for feedback
- Never paste secrets in chat

## Workflows to Follow

### audit.md - Visual & Functional Quality Gate
- Environmental Check → Visual Excellence Audit → Interaction & Trust Audit → Audit Report
- Scores: Visual, Functional, Trust (1-10)

### blast.md - B.L.A.S.T. Protocol
- Initialize: task_plan.md, findings.md, progress.md, claude.md
- Phase 1: Blueprint (Discovery, Data Schema, Research)
- Phase 2: Link (Verify connections)
- Phase 3: Architect (3-layer: architecture/, navigation, tools/)
- Phase 4: Stylize
- Phase 5: Trigger

### workflow.md - Debugging (Workflow E)
- Classify: A (Runtime), B (Logic), C (Env/Config), D (Regression)
- Gather Evidence (read-only)
- Propose Fix Plan → User approves
- Checkpoint (git commit)
- Apply minimal fix
- Validate
- Escalate if fails (Strategy → Isolation → Rollback)
- Save to Knowledge Base
