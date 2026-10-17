# Agent workflow context

Read the repository AGENTS.md for project instructions.

- Beads owns task state, priority, ownership, dependencies, acceptance criteria, and verification results.
- claude-mem captures and recalls experience; do not use work_state as a parallel task list.
- The existing project Wiki owns reviewed knowledge. Actual user statements establish approval.

Use `bd ready`, `bd show <id>`, `bd update <id> --claim`, then execute, verify, record results, and `bd close <id>`.
Consult historical memories with `bd memories <query>` when relevant; do not add general memories to Beads.
Follow the project validation, commit, and synchronization procedure before completing work.
