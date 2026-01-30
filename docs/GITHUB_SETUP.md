# GitHub Repository Setup

One-time setup steps for the repository owner.

---

## 1. Enable Branch Protection (Recommended)

Branch protection prevents accidental pushes directly to `main`. All changes go through pull requests.

### Steps:

1. Go to https://github.com/tfalohun/olera/settings/branches
2. Under "Branch protection rules", click "Add rule"
3. In "Branch name pattern", type: `main`
4. Check these options:
   - [x] Require a pull request before merging
   - [x] Require approvals (set to 1)
   - [x] Dismiss stale pull request approvals when new commits are pushed
5. Click "Create"

**Why?** This ensures everyone uses branches and PRs. No one accidentally breaks the main code.

---

## 2. Connect to Vercel

Vercel should auto-deploy from GitHub.

### Steps:

1. Go to https://vercel.com
2. Sign in with GitHub
3. Import the `olera` repository
4. Use default settings and deploy

Now every push to `main` auto-deploys, and every PR gets a preview URL!

---

## 3. Add Team Members

### To the GitHub repo:

1. Go to https://github.com/tfalohun/olera/settings/access
2. Click "Add people"
3. Enter their GitHub username or email
4. Choose role:
   - **Write** - Can push branches, create PRs (use this for team members)
   - **Admin** - Full control (use sparingly)

### To Vercel (if needed):

1. Go to Vercel project settings
2. Team → Invite Team Member

---

## 4. Set Up Labels

Labels help organize issues. Create these labels:

| Label | Color | Description |
|-------|-------|-------------|
| `bug` | #d73a4a (red) | Something isn't working |
| `enhancement` | #a2eeef (teal) | New feature or improvement |
| `task` | #0075ca (blue) | General task |
| `good first issue` | #7057ff (purple) | Good for newcomers |
| `help wanted` | #008672 (green) | Extra attention needed |
| `documentation` | #0075ca (blue) | Documentation updates |
| `blocked` | #b60205 (red) | Waiting on something |
| `in progress` | #fbca04 (yellow) | Being worked on |

Go to: https://github.com/tfalohun/olera/labels to manage labels.

---

## 5. Create Initial Issues

Help the team get started with some clear tasks:

### Example Issues to Create:

1. **[Task] Set up Supabase database**
   - Create Supabase project
   - Add environment variables
   - Create database schema

2. **[Task] Build browse page with provider cards**
   - Create `/browse` route
   - Display provider cards in a grid
   - Add basic filtering

3. **[Task] Create individual provider page**
   - Create `/provider/[slug]` route
   - Display provider details
   - Add "Request Consultation" button

4. **[Good First Issue] Update homepage copy**
   - Review and improve text content
   - Make sure tone is warm and helpful

---

## 6. Set Up Project Board (Optional)

GitHub Projects helps visualize work.

1. Go to https://github.com/tfalohun/olera/projects
2. Click "New project"
3. Choose "Board" template
4. Create columns: `Backlog`, `To Do`, `In Progress`, `Review`, `Done`

---

## Environment Variables

When you set up Supabase, you'll need to add environment variables.

### For Local Development:

Create a file called `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Never commit this file!** It's in `.gitignore` for safety.

### For Vercel:

1. Go to Vercel project settings
2. Environment Variables
3. Add the same variables

---

## Quick Links

- **Repository:** https://github.com/tfalohun/olera
- **Issues:** https://github.com/tfalohun/olera/issues
- **Pull Requests:** https://github.com/tfalohun/olera/pulls
- **Settings:** https://github.com/tfalohun/olera/settings
- **Live Site:** Check Vercel for URL

---

*Once these are set up, you're ready for team collaboration!*
