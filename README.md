# Practice 11 - Smart Campus explanations

The Practice 10 React prototype now has an optional **Explain availability** button.
The pure evaluator remains authoritative; the explanation never saves bookings or
changes availability. Fictional fixtures only; no login, database, API key or network
model call. A local mock adapter returns a validated, two-sentence explanation.

Use Node 26 (verified locally on 26.13.1), or the Node 22 runtime in Bolt.

```sh
npm ci
npm test
npm run build
npm run lint
npm run typecheck
npm run dev
```

Select Room A, enter 720 and 780, then click Explain availability. Open **Classroom
failure simulation** to try timeout, API error, missing-key and invalid-output modes.
Failures preserve the decision and display a clearly labelled rule-based fallback.

Flow: raw inputs -> pure evaluator -> bounded structured context -> frozen snapshot
-> mock adapter with deadline -> output allowlist -> separately labelled text.
Input limits: four digits per time, room label 80 characters; output 240 characters,
exact known explanation and no more than two sentences. Deadline: 800 ms.

The mock deliberately accepts only canonical explanations. It is an adapter seam,
not a live LLM integration; replacing it requires a separate server-side design and
review. Three prompt variants are recorded for wording comparison; the mock ignores
prompt wording, so identical mock responses do not prove real-model reliability.

Existing Practice 10 evidence is in `evidence/`; Practice 11 checks and review are
in `evidence/practice-11/`. The PDF report is supplied separately. This repository
may require GitHub access; the report contains self-contained evidence and local
startup instructions so assessment does not depend on access to the Bolt editor.
