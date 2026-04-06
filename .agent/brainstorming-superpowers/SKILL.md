---
name: brainstorming-ideas
description: Explores user intent, requirements, and design before implementation. Use when the user asks for a new feature, component, or functional change to ensure deep alignment and avoid wasted work.
---

# Brainstorming Ideas Into Designs

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

## When to use this skill
- Before any creative or functional work (new features, components, etc.).
- When a user request is ambiguous or large.
- To reduce wasted work by uncovering unexamined assumptions.

## Workflow
1. [x] **Explore project context** — Check files, docs, and recent commits.
2. [ ] **Ask clarifying questions** — One at a time, focused on purpose and constraints.
3. [ ] **Propose 2-3 approaches** — Include trade-offs and a recommendation.
4. [ ] **Present design sections** — Scale to complexity and get incremental approval.
5. [ ] **Write design doc** — Save to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`.

## Instructions
- **Hard Gate**: Do NOT write code or implement until the design is approved. This applies even for "simple" projects.
- **One question at a time**: Don't overwhelm the user.
- **YAGNI**: Ruthlessly remove unnecessary features.
- **Design for Isolation**: Break systems into small, well-bounded units with clear interfaces.
- **Existing Codebases**: Follow existing patterns but include targeted improvements where code is problematic.

## Documentation
- Write the validated design to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`.
- Commit the design document to git.
- **Invoke writing-plans next**: The only skill to invoke after brainstorming is `writing-plans`.
