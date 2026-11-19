# Practice 11 - read-only agentic review

Reviewed uncommitted feature diff, README, AGENTS.md, evaluator and tests.
Reviewer did not edit files or receive production/merge access.

1. CONFIRMED P1 - src/lib/explanation.ts:1 omitted the .ts import extension.
   Node direct TS test import failed ERR_MODULE_NOT_FOUND. Minimal fix: explicit
   extension. Final npm test imports module normally and passes all 50 tests.
2. CONFIRMED P2 - exported explain boundary trusted contradictory/mutable context.
   isAvailable=true with BLOCKED produced contradictory text. UI's buildContext
   already froze its output, so exposure was limited to direct adapter callers.
   Fix validates fields and status/reason agreement; passes a frozen copy. New
   regression tests reject contradiction and prevent adapter mutation; both pass.
3. CONFIRMED P3 - README and AGENTS file map/test command described Practice 10.
   Updated authorized scope, commands, adapter seam and local verification setup.
4. UNSUPPORTED - stale responses overwrite newer input: App remounts panel on
   inputs and panel invalidates request IDs on mode/input change and cleanup.
   Source inspection supports guards; browser interaction is separately recorded.
5. UNSUPPORTED - HTML/prompt injection executes in current mock: output is exact
   canonical text, rendered by React as text; adapter never interprets the label.
   Adversarial-output tests pass. A real-model adapter requires separate review.

Prompt comparison limitation: mock ignores prompt wording. Identical output is
an adapter check, not experimental proof of prompt superiority or LLM accuracy.
Manual follow-up inspected fixes and reran tests/build/lint/typecheck. Human
assessment remains final; classroom mock demonstration only, no public release.
