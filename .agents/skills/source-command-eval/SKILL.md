---
name: "source-command-eval"
description: "Run the promptfoo eval suite (grounding, tools, refusal, injection, fail-safe, persona warmth) and report pass/fail."
---

# source-command-eval

Use this skill when the user asks to run the migrated source command `eval`.

## Command Template

# /eval

Delegate to the `eval-runner` subagent. Run `promptfoo eval` against the suite in the repo.

## Steps

1. Invoke the `eval-runner` agent with: "Run the full promptfoo eval suite and report results."
2. The agent runs `promptfoo eval` and captures output.
3. Report a table of case → pass/fail → the premortem failure it guards.

## Output format

```
| Case                  | Result | Premortem failure guarded              |
|-----------------------|--------|----------------------------------------|
| grounding-projects    | PASS   | PM-3: model invents a project          |
| refusal-salary        | PASS   | PM-4: answers off-topic questions      |
| tool-nav-closed-enum  | PASS   | PM-5: malformed tool call crashes      |
| injection-system      | PASS   | PM-6: prompt injection leaks persona   |
| fail-safe-degraded    | PASS   | PM-7: ungrounded answer slips through  |
| persona-warmth-orby   | PASS   | PM-8: Orby sounds robotic              |
```

## Rules

- If **any case fails**: stop immediately. Surface the exact assertion that failed. Do not proceed to deploy.
- Do not run promptfoo in Vitest — this command is the only eval entry point.
- A full pass is required before `/deploy` or `/ship-check` proceeds.
