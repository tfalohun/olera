# Contributing to Olera

Welcome! This guide will help you contribute to Olera, even if you're new to coding.

---

## Our Philosophy

1. **No question is dumb** - We're all learning
2. **Small changes are great** - Fix a typo? Update a color? That counts!
3. **Ask for help early** - Don't struggle alone for hours
4. **AI is your friend** - Use Claude, Copilot, etc. liberally
5. **Done is better than perfect** - Ship it, then improve

---

## Before You Start

Make sure you've completed the [Quick Start Guide](README.md#for-the-team-quick-start-guide) in the README.

---

## Types of Contributions

### 1. Bug Fixes
Found something broken? Fix it!

### 2. New Features
Adding new functionality (check with team first for big features)

### 3. Styling/Design
Improving how things look

### 4. Documentation
Improving these docs, adding comments to code

### 5. Refactoring
Cleaning up code without changing what it does

---

## The Contribution Workflow

### Step 1: Pick Something to Work On

Check our [GitHub Issues](https://github.com/tfalohun/olera/issues) or the roadmap in the README.

**Good first contributions:**
- Fixing typos
- Adjusting colors or spacing
- Adding missing content
- Improving documentation

### Step 2: Create a Branch

Always work on a branch, never directly on `main`.

```bash
# Make sure you have the latest code
git checkout main
git pull origin main

# Create your branch
git checkout -b your-branch-name
```

**Branch naming conventions:**
- `feature/what-youre-adding` - New features
- `fix/what-youre-fixing` - Bug fixes
- `style/what-youre-styling` - Design changes
- `docs/what-youre-documenting` - Documentation
- `refactor/what-youre-cleaning` - Code cleanup

### Step 3: Make Your Changes

Open the project in VS Code and make your changes.

**Tips:**
- Save frequently (Cmd+S on Mac, Ctrl+S on Windows)
- Check the browser often to see your changes
- If something breaks, undo with Cmd+Z / Ctrl+Z

### Step 4: Test Your Changes

```bash
# Make sure the app still runs
npm run dev

# Check for errors
npm run build
```

Visit http://localhost:3000 and click around to make sure nothing is broken.

### Step 5: Commit Your Changes

```bash
# See what files you changed
git status

# Stage all changes
git add .

# Commit with a descriptive message
git commit -m "Add filter buttons to browse page"
```

**Good commit messages:**
- Start with a verb: Add, Fix, Update, Remove, Refactor
- Be specific: "Fix navbar dropdown on mobile" not "Fix bug"
- Keep it short: Under 50 characters ideally

### Step 6: Push to GitHub

```bash
git push origin your-branch-name
```

### Step 7: Create a Pull Request (PR)

1. Go to https://github.com/tfalohun/olera
2. You'll see a yellow banner saying "your-branch-name had recent pushes"
3. Click "Compare & pull request"
4. Write a description of what you changed and why
5. Click "Create pull request"

### Step 8: Get Reviewed

- Someone will review your PR
- They might suggest changes - that's normal and helpful!
- Make any requested changes on your branch and push again
- Once approved, your PR will be merged

---

## Code Style Guidelines

### File Naming
- Components: `PascalCase.tsx` (e.g., `ProviderCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Folders: `kebab-case` (e.g., `provider-dashboard/`)

### Component Structure

```tsx
// 1. Imports at the top
import { useState } from "react";
import Link from "next/link";

// 2. Types/interfaces (if needed)
interface Props {
  title: string;
  description?: string; // ? means optional
}

// 3. The component
export default function MyComponent({ title, description }: Props) {
  // 4. Hooks and state at the top of the function
  const [isOpen, setIsOpen] = useState(false);

  // 5. Helper functions
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  // 6. The JSX return
  return (
    <div className="p-4">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      <button onClick={handleClick}>
        {isOpen ? "Close" : "Open"}
      </button>
    </div>
  );
}
```

### Tailwind CSS Tips

- Use existing utility classes instead of custom CSS
- Group related classes together
- Use our custom classes: `btn-primary`, `btn-secondary`, `card`, `input-field`

```tsx
// Good
<button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg">

// Even better - use our custom class
<button className="btn-primary">
```

---

## Common Tasks

### Adding a New Page

1. Create a folder in `app/` with the route name
2. Add a `page.tsx` file inside

```bash
# Example: Create /about page
mkdir app/about
touch app/about/page.tsx
```

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">About Olera</h1>
      <p className="mt-4">Your content here...</p>
    </div>
  );
}
```

### Adding a New Component

1. Decide which folder it belongs in (`shared/`, `ui/`, `providers/`, `families/`)
2. Create the file with PascalCase name
3. Export the component

```tsx
// components/ui/Badge.tsx
interface BadgeProps {
  text: string;
  color?: "green" | "blue" | "orange";
}

export default function Badge({ text, color = "green" }: BadgeProps) {
  const colors = {
    green: "bg-primary-100 text-primary-800",
    blue: "bg-secondary-100 text-secondary-800",
    orange: "bg-warm-100 text-warm-800",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm ${colors[color]}`}>
      {text}
    </span>
  );
}
```

### Using the Component

```tsx
import Badge from "@/components/ui/Badge";

// In your JSX:
<Badge text="Home Care" color="green" />
```

---

## Troubleshooting

### "npm run dev" isn't working

```bash
# Try reinstalling dependencies
rm -rf node_modules
npm install
npm run dev
```

### "I made changes but don't see them"

1. Make sure you saved the file
2. Check the terminal for errors
3. Try refreshing with Cmd+Shift+R (hard refresh)

### "Git says I have merge conflicts"

Don't panic! This happens when two people edit the same file.

```bash
# Get the latest main
git checkout main
git pull origin main

# Go back to your branch
git checkout your-branch-name

# Merge main into your branch
git merge main
```

If there are conflicts, VS Code will show them. Look for:
```
<<<<<<< HEAD
your changes
=======
their changes
>>>>>>> main
```

Choose which to keep (or combine them), save, then:
```bash
git add .
git commit -m "Resolve merge conflicts"
git push origin your-branch-name
```

### "I accidentally committed to main"

```bash
# Create a branch with your changes
git branch my-feature

# Reset main to match remote
git checkout main
git reset --hard origin/main

# Go to your branch
git checkout my-feature
```

---

## Questions?

- **Slack/Discord:** Ask in #olera-dev
- **GitHub:** Open an issue with your question
- **AI:** Ask Claude! Copy the relevant code and explain your question

---

*Happy coding!*
