# Practice 10 — Smart Campus risk review

This repository contains the React app from Bolt Version 8. The two accessibility changes associate visible labels with the time fields and give the decision banner a live status role.

Use Node 26.11.1 for the same runtime as the recorded local checks.

```sh
npm ci
npm test
npm run build
npm run lint
npm run typecheck
npm run dev
```

Open the local address printed by Vite. The test logs, risk register, reviewed UI diff, browser checks and screenshots are in [evidence](evidence/). The AGENTS.md patch is a proposal awaiting review.
