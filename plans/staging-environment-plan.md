# Plan: Set Up Staging Environment

Created: 2026-02-12
Status: Not Started

## Goal

Create a staging environment that acts as a QA buffer between feature development and production, so PRs get validated on a real deployment before going live.

## Success Criteria

- [ ] A `staging` branch exists and deploys to a distinct Vercel URL (e.g. `staging-olera.vercel.app`)
- [ ] `main` branch has branch protection (require PR, no direct push)
- [ ] Team has a clear documented workflow: feature branch → PR to `staging` → QA → promote to `main`
- [ ] Vercel preview deployments still work per-PR for quick checks

## How It Works

```
feature/xyz ──PR──▶ staging ──PR──▶ main (production)
                      │                  │
                      ▼                  ▼
              staging.olera.app    olera.vercel.app
              (QA / demo)         (live for users)
```

Both staging and production share the same Supabase project for now (read-only provider data + shared auth). When a separate Supabase project makes sense later, only the Vercel env vars need to change.

## Tasks

### Phase 1: Git & Branch Setup
- [ ] 1. Create `staging` branch from `main`
      - Command: `git checkout main && git pull && git checkout -b staging && git push -u origin staging`
      - Verify: `git branch -r` shows `origin/staging`

### Phase 2: Vercel Configuration
- [ ] 2. Set Vercel production branch to `main` (confirm current setting)
      - In Vercel Dashboard → Project Settings → Git → Production Branch = `main`
      - Verify: Pushes to `main` still deploy to production URL

- [ ] 3. Assign a stable preview alias to the `staging` branch
      - Option A (recommended): In Vercel Dashboard → Project Settings → Domains, add a domain alias like `staging-olera.vercel.app` or `staging.olera.care` and link it to the `staging` branch
      - Option B: Use `vercel.json` to configure branch-specific aliases (see below)
      - Verify: Pushing to `staging` produces a deployment at the stable staging URL

- [ ] 4. (Optional) Add environment variable overrides for staging
      - In Vercel Dashboard → Project Settings → Environment Variables
      - For each variable, Vercel lets you set different values per environment (Production / Preview / Development)
      - For now: staging and production share the same Supabase keys (same project)
      - Later: if you create a staging Supabase project, update the Preview env vars
      - Verify: Check the deployment logs to confirm correct env vars

### Phase 3: GitHub Branch Protection
- [ ] 5. Protect `main` branch
      - GitHub → Settings → Branches → Add rule for `main`
      - Enable: "Require a pull request before merging"
      - Enable: "Require approvals" (set to 1)
      - Enable: "Require status checks to pass" (add Vercel deployment check once available)
      - Disable: "Allow force pushes"
      - Verify: Try pushing directly to `main` — should be rejected

- [ ] 6. (Optional) Protect `staging` branch with lighter rules
      - Require PR before merging (but 0 approvals required — self-merge OK)
      - This prevents accidental direct pushes while keeping the workflow fast
      - Verify: Direct push to `staging` is rejected; PR merge works

### Phase 4: Documentation
- [ ] 7. Add `CONTRIBUTING.md` with the staging workflow
      - Files: `CONTRIBUTING.md` (new file)
      - Content:
        ```
        ## Branch Strategy

        | Branch    | Purpose           | Deploys to                   |
        |-----------|-------------------|------------------------------|
        | `main`    | Production        | olera.vercel.app             |
        | `staging` | QA / Demo         | staging-olera.vercel.app     |
        | `feature/*` | Development    | Vercel preview (per-PR)      |

        ## Workflow

        1. Create a feature branch from `staging`
        2. Open a PR targeting `staging`
        3. Get review + Vercel preview check
        4. Merge to `staging` → auto-deploys to staging URL
        5. QA on staging
        6. When ready: open a PR from `staging` → `main`
        7. Merge → auto-deploys to production

        ## Hotfixes

        For urgent production fixes:
        1. Branch from `main`
        2. PR directly to `main`
        3. After merging, merge `main` back into `staging` to keep them in sync
        ```
      - Verify: File exists, team can read it

- [ ] 8. Update SCRATCHPAD.md
      - Move "Environment strategy" from Next Up to In Progress / Done
      - Add decision record

## Optional: vercel.json for branch aliases

If you prefer infrastructure-as-code over dashboard config, you can create a `vercel.json`:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "staging": true
    }
  }
}
```

Note: Vercel handles branch deployments automatically via GitHub integration. The `vercel.json` is only needed if you want explicit control. Domain aliases are managed in the Vercel dashboard regardless.

## Risks

- **Staging drift**: If `staging` gets far ahead of `main`, the "promote" PR becomes large and risky. Mitigation: promote to `main` frequently (at least weekly).
- **Merge conflicts**: Two-branch model adds one more merge step. Mitigation: keep PRs small, promote often.
- **Shared Supabase**: Staging writes (auth, connections, admin) hit production data. Mitigation: this is acceptable for now since the team is small. When user-facing writes increase, create a separate Supabase project for staging.

## What This Does NOT Include (Future)

- Separate Supabase project for staging (add when write-heavy features go live)
- GitHub Actions CI (automated tests, lint checks) — add when test suite exists
- Automated promotion (staging → main) — keep manual for now
- Preview environment comments on PRs (Vercel does this by default)

## Notes

- Vercel already creates preview deployments per-PR — those are great for quick checks during review
- The staging environment is for "final QA" before production, not a replacement for PR previews
- The whole setup is ~30 minutes of dashboard clicks + one branch creation
- No code changes needed — this is purely git workflow + Vercel config + GitHub settings
