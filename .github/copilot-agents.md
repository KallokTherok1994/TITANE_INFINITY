# COPILOT-XS Agent Federation (Deprecated Documentation)

**IP / Attribution**

- Creator: Kevin Thibault (TITANE∞)
- Generated/maintained with GitHub Copilot (GPT-5.2)
- Licensing: governed by repository LICENSE.md

This is a **documentation-only** legacy roster.

Operational specialists are now maintained in `.github/agents/*.agent.md` and routed via `.github/copilot-routing.json`.
This file must not be used as execution authority.

## Specialists

- **systems_architect**: architecture, boundaries, DDD
- **security_auditor**: OWASP, secrets, auth
- **data_scientist**: stats, reproducibility
- **ai_ml_engineer**: LLM safety, RAG, evals
- **devops_engineer**: CI/CD, release, observability
- **code_reviewer**: performance, idioms, consistency

## Consensus policy (doc)

- Security can veto changes that introduce obvious risk.
- Prefer minimal scope and repository rules (`.copilot-rules-permanent.md`).

---

## Foundation: Dependency Guardian (Documentation)

Create a dependency-sensitive agent for complex tasks and dependency changes.

**File:** `.github/copilot-agents/dependency-guardian.agent.md`

Mandate:

- Analyze package.json + lock file + existing imports before proposing changes
- Run dependency audit (npm audit / npm ls) before dependency changes
- Verify compatibility with project Node version
- Prefer exact versions (or rely on lockfile) and avoid vague ranges in recommendations
- Run tests after dependency change and summarize risks
