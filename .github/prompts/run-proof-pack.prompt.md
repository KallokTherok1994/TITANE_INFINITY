# Prompt: Run Proof Pack

## Scope
Produce a complete proof pack for one governed session.

## Inputs
- Session objective
- Commands executed
- Check outputs
- Gates summary

## Steps
1. Create proof pack directory with timestamp and sha.
2. Populate mandatory files.
3. Record commands and checks with exit codes.
4. Fill gates report and rollback.
5. Emit one unique final verdict.

## Output
- Complete proof-pack path.
- Gate table.
- Final verdict and next action.
