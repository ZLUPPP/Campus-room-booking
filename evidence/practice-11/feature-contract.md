# Feature contract

As a student, I want a short explanation of room availability so I understand the
confirmed decision. Explanation is optional and must not change fixtures/status.

Input: roomLabel (1-80 chars), whole minute start/end (raw strings up to 4 digits),
isAvailable boolean and reasonCode from the deterministic evaluator.
Output: {explanation: string}, 1-240 chars, max two sentences. Current mock uses
an exact allowlist for factual agreement. Empty/malformed/long input rejected.
Timeout 800ms, API error/missing key/invalid output -> deterministic fallback.
UI labels confirmed status separately from mock-generated or fallback explanation.

Architecture: fields -> evaluate -> decision banner
                         -> buildContext -> frozen validated snapshot
                         -> mock adapter + deadline -> validateOutput -> text
                                                 failure -> rule-based fallback
No secrets/network model/login/database or booking mutations.

Prompt comparison (manual wording inspection + executed mock agreement test):
P1: concise and respectful; underspecifies fields and untrusted context.
P2: explicit fields/schema; missing explicit untrusted-context instruction.
P3: chosen: reason-grounded, untrusted data, schema, sentence limit and status.
All three produced identical canonical mock output; consistency/factual agreement
passed in mock only. Real-model clarity/consistency were NOT experimentally tested.
