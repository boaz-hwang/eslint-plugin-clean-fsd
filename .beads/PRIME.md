# Agent workflow context

Read the repository AGENTS.md and the user's common instructions.

- Beads owns task state, priority, ownership, dependencies, acceptance criteria, and verification results.
- claude-mem captures and recalls experience; do not use work_state as a parallel task list.
- Reviewed knowledge belongs in the existing Wiki; otherwise use existing docs/, doc/, README, design documents, or ADRs. Preserve draft/verified distinctions and the project's review process. Do not create a parallel Wiki.
- Actual user statements establish approval; memory summaries do not.

Use `bd ready`, `bd show <id>`, `bd update <id> --claim`, then execute, verify, record results, and `bd close <id>`.
Consult historical memories with `bd memories <query>` when relevant; do not add general memories to Beads.
Follow project validation, commit, and synchronization procedures. For a local-only repository without a remote, record that limit; do not create or publish a remote implicitly.
