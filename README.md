# Olera - Senior Care Discovery Platform

> Helping families find the right senior care for their loved ones.

**Live Site:** [https://olera.vercel.app](https://olera-16h2a9zmu-tj-9995s-projects.vercel.app)

---

## What is Olera?

Olera is a two-sided marketplace connecting:
- **Families** searching for senior care options
- **Providers** offering care services (assisted living, home care, memory care, etc.)

### How It Works

1. Families search by location
2. Browse and compare care providers
3. Send consultation requests to providers they're interested in
4. Providers respond and connect directly with families

---

## For the Team: Quick Start Guide

### First Time Setup (Do This Once)

You'll need three things installed on your computer:

1. **Node.js** - The engine that runs our code
   - Download from: https://nodejs.org (choose "LTS" version)
   - To check if installed: Open Terminal, type `node --version`

2. **Git** - Tracks changes to our code
   - Mac: Already installed! Type `git --version` in Terminal
   - Windows: Download from https://git-scm.com

3. **A Code Editor** - Where you write code
   - We recommend [VS Code](https://code.visualstudio.com/) (free)
   - Install the extensions: "Tailwind CSS IntelliSense" and "ES7+ React snippets"

### Getting the Code

Open Terminal (Mac) or Command Prompt (Windows) and run:

```bash
# 1. Clone (download) the project
git clone https://github.com/olera-care/olera-web.git

# 2. Go into the project folder
cd olera-web

# 3. Install dependencies (libraries our code needs)
npm install

# 4. Start the development server
npm run dev
```

Now open http://localhost:3000 in your browser. You should see Olera!

---

## Project Structure (Where Things Live)

```
olera/
├── app/                    # Pages of the website
│   ├── page.tsx           # Homepage (olera.com/)
│   ├── browse/            # Browse page (olera.com/browse)
│   ├── provider/          # Provider pages (olera.com/provider/sunrise-care)
│   ├── auth/              # Login/signup pages
│   └── layout.tsx         # Wrapper around all pages (navbar, footer)
│
├── components/            # Reusable building blocks
│   ├── shared/            # Used everywhere (Navbar, Footer)
│   ├── ui/                # Basic elements (buttons, inputs, cards)
│   ├── providers/         # Provider-related pieces
│   └── families/          # Family-related pieces
│
├── lib/                   # Helper code
│   └── supabase/          # Database connection
│
├── public/                # Images and static files
│
└── docs/                  # Documentation (you are here!)
```

### Key Files Explained

| File | What It Does |
|------|--------------|
| `app/page.tsx` | The homepage - what people see at olera.com |
| `app/layout.tsx` | The "frame" around every page (navbar + footer) |
| `components/shared/Navbar.tsx` | The navigation bar at the top |
| `tailwind.config.ts` | Our color palette and design settings |
| `package.json` | List of dependencies and scripts we can run |

---

## Common Commands

Run these in Terminal from the `olera` folder:

| Command | What It Does |
|---------|--------------|
| `npm run dev` | Start local development server |
| `npm run build` | Build for production (checks for errors) |
| `npm run lint` | Check code for common mistakes |

---

## Making Changes (Git Workflow)

### The Basic Flow

```
1. Pull latest changes    →  2. Create a branch    →  3. Make changes
                                                            ↓
6. Merge to main  ←  5. Get reviewed  ←  4. Push & create PR
```

### Step by Step

```bash
# 1. Always start by getting the latest code
git pull origin main

# 2. Create a branch for your work (name it after what you're doing)
git checkout -b add-search-filters

# 3. Make your changes in the code editor...

# 4. See what you changed
git status

# 5. Stage your changes (prepare them to be saved)
git add .

# 6. Commit (save) with a message describing what you did
git commit -m "Add care type filter buttons to browse page"

# 7. Push your branch to GitHub
git push origin add-search-filters

# 8. Go to GitHub and create a "Pull Request" (PR)
#    This lets the team review before merging to main
```

### Good Commit Message Examples

- `Add search bar to homepage`
- `Fix mobile menu not closing`
- `Update provider card styling`
- `Add memory care to care types`

### Branch Naming Examples

- `add-login-page`
- `fix-navbar-mobile`
- `update-homepage-hero`
- `feature-provider-dashboard`

---

## Our Tech Stack (What We're Using)

| Technology | What It Does | Learn More |
|------------|--------------|------------|
| **Next.js** | React framework for building websites | [Next.js Docs](https://nextjs.org/docs) |
| **React** | Library for building user interfaces | [React Docs](https://react.dev) |
| **TypeScript** | JavaScript with type checking (catches errors) | [TS for JS Devs](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) |
| **Tailwind CSS** | Utility classes for styling | [Tailwind Docs](https://tailwindcss.com/docs) |
| **Supabase** | Database + authentication | [Supabase Docs](https://supabase.com/docs) |
| **Vercel** | Hosting and deployment | [Vercel Docs](https://vercel.com/docs) |

---

## Learning Resources

### For Complete Beginners

1. **HTML/CSS Basics** (1-2 hours)
   - [freeCodeCamp HTML](https://www.freecodecamp.org/learn/2022/responsive-web-design/)

2. **JavaScript Basics** (2-3 hours)
   - [JavaScript.info - The Modern JavaScript Tutorial](https://javascript.info/)

3. **React Basics** (2-3 hours)
   - [React Official Tutorial](https://react.dev/learn)

### For Our Stack Specifically

1. **Tailwind CSS** - How we style things
   - [Tailwind in 100 Seconds](https://www.youtube.com/watch?v=mr15Xzb1Ook) (video)
   - [Tailwind Playground](https://play.tailwindcss.com/) - try it live!

2. **Next.js App Router** - How our pages work
   - [Next.js Learn Course](https://nextjs.org/learn) (free, interactive)

### AI-Assisted Coding

We embrace AI tools! Here are some that can help:

- **Claude** - Great for explaining code, debugging, writing features
- **GitHub Copilot** - AI autocomplete in VS Code
- **v0.dev** - Generate UI components with AI

**Tip:** When asking AI for help, share the specific file and describe what you're trying to do. The more context, the better!

---

## Design System

### Our Colors

| Name | Usage | Tailwind Class |
|------|-------|----------------|
| Primary (Green) | Main actions, CTAs | `bg-primary-600`, `text-primary-600` |
| Secondary (Blue) | Secondary elements | `bg-secondary-600`, `text-secondary-600` |
| Warm (Orange) | Accents, highlights | `bg-warm-500`, `text-warm-500` |

### Common Patterns

```jsx
// Primary button
<button className="btn-primary">Get Started</button>

// Secondary button
<button className="btn-secondary">Learn More</button>

// Card container
<div className="card p-6">Card content here</div>

// Input field
<input className="input-field" placeholder="Enter text..." />
```

---

## Deployment

Every push to `main` automatically deploys to Vercel. You don't need to do anything special!

- **Preview deployments:** Every PR gets its own preview URL
- **Production:** Merging to `main` updates the live site

---

## Getting Help

1. **Stuck on something?** Ask in our team chat
2. **Found a bug?** Create a GitHub Issue
3. **Have an idea?** Create a GitHub Issue with "idea:" prefix
4. **Need code help?** Ask Claude or check the learning resources above

---

## Current Status

### Phase 1 - MVP (In Progress)
- [x] Project setup
- [x] Homepage with search
- [ ] Browse page with provider cards
- [ ] Individual provider pages
- [ ] User authentication
- [ ] Consultation request flow
- [ ] Family dashboard
- [ ] Provider dashboard

---

*Built with care by the Olera team*
