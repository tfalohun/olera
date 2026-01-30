# Developer Glossary

Plain English explanations for technical terms you'll encounter.

---

## A

### API (Application Programming Interface)
A way for different programs to talk to each other. Like a waiter taking your order to the kitchen - it's the messenger between systems.

### App Router
Next.js's system for creating pages. Each folder in `app/` becomes a URL path.

---

## B

### Branch
A separate copy of the code where you can make changes without affecting the main version. Like making a photocopy to edit before updating the original.

### Build
Converting your code into a format that can run on the web. `npm run build` does this.

---

## C

### CLI (Command Line Interface)
A text-based way to interact with your computer (Terminal on Mac, Command Prompt on Windows).

### Client-side
Code that runs in the user's browser. Any file with `"use client"` at the top.

### Clone
Downloading a copy of code from GitHub to your computer.

### Commit
Saving a snapshot of your changes with a description. Like a save point in a video game.

### Component
A reusable piece of UI. Like LEGO blocks - you build bigger things from small pieces.

### CSS (Cascading Style Sheets)
Code that controls how things look (colors, spacing, fonts).

---

## D

### Dependencies
Other people's code that our project uses. Listed in `package.json`.

### Deploy / Deployment
Publishing your code so it's live on the internet.

### Dev Server / Development Server
A local web server that runs on your computer during development. Started with `npm run dev`.

---

## E

### Environment Variables
Secret values (like passwords) that we don't put in the code directly. Stored in `.env` files.

### ESLint
A tool that checks your code for common mistakes and style issues.

---

## F

### Framework
A pre-built structure for building applications. Next.js is our framework.

### Frontend
The part of a website users see and interact with (the "face" of the app).

### Function
A reusable piece of code that does something. Like a recipe you can follow multiple times.

---

## G

### Git
Software that tracks changes to code over time. Like Google Docs version history, but for code.

### GitHub
A website that hosts Git repositories. Where our code lives online.

---

## H

### Hook
In React, a special function that lets you use features like state. Always starts with `use` (e.g., `useState`, `useEffect`).

### Hot Reload
When changes appear in the browser automatically without refreshing. Magic!

### HTML (HyperText Markup Language)
The structure of web pages. Like the skeleton of a website.

---

## I

### IDE (Integrated Development Environment)
A fancy code editor. VS Code is our IDE.

### Import
Bringing code from another file into the current file.

---

## J

### JavaScript (JS)
The programming language that makes websites interactive.

### JSX
JavaScript that looks like HTML. What we write in React components.

### JSON (JavaScript Object Notation)
A format for storing data. Looks like: `{"name": "Olera", "version": "1.0"}`

---

## L

### Layout
A wrapper component that appears on multiple pages (like the navbar and footer).

### Localhost
Your own computer pretending to be a web server. Only you can see it.

### Linter
A tool that checks code for errors. ESLint is our linter.

---

## M

### Main (Branch)
The primary branch in Git. This is the "official" version of the code.

### Merge
Combining changes from one branch into another.

### Middleware
Code that runs between receiving a request and sending a response.

---

## N

### Node.js
A program that runs JavaScript outside of a browser. We need it to develop.

### npm (Node Package Manager)
A tool for installing and managing JavaScript packages/dependencies.

---

## P

### Package
A bundle of code that does something useful. We install packages with npm.

### Page
In Next.js, a file named `page.tsx` in the `app/` folder becomes a webpage.

### PR (Pull Request)
A request to merge your branch's changes into main. Where code gets reviewed.

### Production
The live version of the site that real users see.

### Props
Data passed to a component. Like arguments to a function.

---

## R

### React
A JavaScript library for building user interfaces. Made by Facebook/Meta.

### Refactor
Improving code without changing what it does. Cleaning up.

### Render
Turning code into what you see on screen.

### Repository (Repo)
A project's folder and all its version history. Stored on GitHub.

### Route
A URL path. `/browse` is a route that shows the browse page.

---

## S

### Server-side
Code that runs on a server, not in the user's browser. More secure for sensitive operations.

### State
Data that can change over time. When state changes, the UI updates.

### Supabase
Our database and authentication service. Stores user data.

---

## T

### Tailwind CSS
A CSS framework that uses utility classes. Instead of writing CSS, you add classes like `bg-blue-500`.

### Terminal
A text-based interface for running commands. Also called command line or shell.

### TypeScript (TS)
JavaScript with type checking. Catches errors before you run the code. Files end in `.ts` or `.tsx`.

---

## U

### UI (User Interface)
What users see and interact with.

### URL (Uniform Resource Locator)
A web address. Like `https://olera.com/browse`.

### Utility Class
In Tailwind, a class that does one thing. Like `text-red-500` makes text red.

---

## V

### Variable
A named container for data. Like a labeled box.

### Vercel
The platform that hosts our website. Automatically deploys when we push to GitHub.

### Version Control
Tracking changes to code over time. Git is version control software.

---

## W-Z

### Webhook
An automatic message sent when something happens. Like a notification.

### Wrapper
A component that contains other components. Layout is a wrapper.

---

## Common File Extensions

| Extension | What It Is |
|-----------|------------|
| `.ts` | TypeScript file |
| `.tsx` | TypeScript with JSX (React component) |
| `.js` | JavaScript file |
| `.jsx` | JavaScript with JSX |
| `.json` | JSON data file |
| `.css` | CSS styles |
| `.md` | Markdown (formatted text, like this file) |
| `.env` | Environment variables |

---

## Common Symbols in Code

| Symbol | Name | Usage |
|--------|------|-------|
| `{ }` | Curly braces | Objects, code blocks |
| `[ ]` | Square brackets | Arrays (lists) |
| `( )` | Parentheses | Function calls, grouping |
| `< >` | Angle brackets | JSX elements, generics |
| `=>` | Arrow | Arrow functions |
| `...` | Spread | Spreading arrays/objects |
| `?` | Question mark | Optional, ternary |
| `??` | Nullish coalescing | Default if null/undefined |
| `?.` | Optional chaining | Safe property access |

---

*Don't see a term? Ask Claude or add it here!*
