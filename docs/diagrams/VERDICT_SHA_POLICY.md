# Verdict SHA Policy (No Self-Hash)

## Rule

A verdict file must not claim the exact final commit SHA in the same commit that introduces or edits the verdict.

## Official pattern

- Record the observed value as `HEAD_SHA_AT_TIME`.
- Add a note: "final SHA recorded in follow-up commit if needed".
- If a strict final SHA is required, add a follow-up commit that updates the verdict file.

## Rationale

A commit cannot self-contain its own final SHA without a follow-up change. Enforcing this avoids circular updates and repeated amend loops.
