# Detailed Setup Guide

This guide walks you through setting up your development environment step by step.

---

## Part 1: Install Required Software

### 1.1 Install Node.js

Node.js runs JavaScript code on your computer.

1. Go to https://nodejs.org
2. Click the **LTS** button (Long Term Support - the stable version)
3. Run the downloaded installer
4. Click "Next" through all the steps
5. Verify it worked:
   - Open Terminal (Mac) or Command Prompt (Windows)
   - Type: `node --version`
   - You should see something like: `v20.11.0`

### 1.2 Install VS Code

VS Code is where you'll write code.

1. Go to https://code.visualstudio.com
2. Download for your operating system
3. Install it
4. Open VS Code

#### Install Helpful Extensions

In VS Code:
1. Click the Extensions icon in the left sidebar (looks like 4 squares)
2. Search for and install:
   - **Tailwind CSS IntelliSense** - Autocomplete for styles
   - **ES7+ React/Redux/React-Native snippets** - Code shortcuts
   - **Prettier - Code formatter** - Auto-formats your code
   - **GitLens** - See who changed what in the code

### 1.3 Install Git (Windows only)

Mac has Git built in. Windows users:
1. Go to https://git-scm.com
2. Download and install
3. Use all default options

---

## Part 2: Get the Code

### 2.1 Open Terminal

**Mac:**
- Press Cmd + Space
- Type "Terminal"
- Press Enter

**Windows:**
- Press Windows key
- Type "Command Prompt" or "PowerShell"
- Press Enter

### 2.2 Navigate to Where You Want the Project

```bash
# Go to your Desktop (or wherever you want)
cd ~/Desktop
```

**What is `cd`?** It stands for "change directory" - it's how you move between folders in Terminal.

### 2.3 Clone the Repository

```bash
git clone https://github.com/olera-care/olera-web.git
```

**What does this do?** "Clone" means download. This downloads the entire project to your computer.

### 2.4 Enter the Project Folder

```bash
cd olera-web
```

### 2.5 Install Dependencies

```bash
npm install
```

**What are dependencies?** They're code libraries that our project uses. Think of them like ingredients in a recipe - we need them for things to work.

This might take a minute. You'll see a lot of text - that's normal!

### 2.6 Start the Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 16.x.x
- Local: http://localhost:3000
```

### 2.7 View the Site

Open your web browser and go to: http://localhost:3000

You should see the Olera homepage!

**What is localhost?** It's your computer pretending to be a web server. Only you can see it.

---

## Part 3: Open the Project in VS Code

### Option A: From Terminal

```bash
code .
```

(The `.` means "current folder")

### Option B: From VS Code

1. Open VS Code
2. File → Open Folder
3. Navigate to the `olera` folder
4. Click "Open"

---

## Part 4: Make Your First Change

Let's make a small change to prove everything works!

### 4.1 Open the Homepage File

In VS Code's file explorer (left side), navigate to:
```
app/page.tsx
```

### 4.2 Find the Headline

Look for this line (around line 48):
```tsx
Find the Right Senior Care for Your Loved One
```

### 4.3 Change It

Change it to something like:
```tsx
Find the Perfect Senior Care for Your Loved One
```

### 4.4 Save the File

Press Cmd+S (Mac) or Ctrl+S (Windows)

### 4.5 Check the Browser

Go back to http://localhost:3000 - the page should update automatically!

This is called "hot reload" - changes appear instantly without refreshing.

---

## Part 5: Understanding the Terminal

The terminal is how developers "talk" to the computer. Here are commands you'll use:

| Command | What It Does | Example |
|---------|--------------|---------|
| `cd` | Change directory (folder) | `cd olera` |
| `ls` | List files in current folder | `ls` |
| `pwd` | Print working directory (where am I?) | `pwd` |
| `npm run dev` | Start the dev server | |
| `npm run build` | Build for production | |
| `git status` | See changed files | |
| `git pull` | Get latest code | |
| `git push` | Upload your code | |

### Stopping the Server

To stop `npm run dev`, press `Ctrl+C` in the terminal.

---

## Part 6: VS Code Tips

### Keyboard Shortcuts

| Shortcut | What It Does |
|----------|--------------|
| Cmd/Ctrl + S | Save file |
| Cmd/Ctrl + P | Quick open file by name |
| Cmd/Ctrl + Shift + P | Open command palette |
| Cmd/Ctrl + / | Toggle comment |
| Cmd/Ctrl + D | Select next occurrence |
| Cmd/Ctrl + Z | Undo |
| Cmd/Ctrl + Shift + Z | Redo |

### The Integrated Terminal

VS Code has a built-in terminal!
- Open it: View → Terminal (or Ctrl + `)
- You can run all commands here instead of a separate Terminal app

### File Explorer Tips

- Click a file once to preview it
- Double-click to keep it open
- Drag files to move them
- Right-click for more options

---

## Troubleshooting

### "command not found: node"

Node.js isn't installed correctly. Try reinstalling it.

### "command not found: npm"

Same as above - npm comes with Node.js.

### "EACCES permission denied"

On Mac/Linux, you might need to fix npm permissions:
```bash
sudo chown -R $(whoami) ~/.npm
```

### "Port 3000 is already in use"

Another app is using port 3000. Either:
1. Close that app, or
2. Run on a different port: `npm run dev -- -p 3001`

### "Module not found"

Run `npm install` again - you might be missing dependencies.

### The page won't load

1. Is `npm run dev` still running in the terminal?
2. Are there any red error messages in the terminal?
3. Try stopping (Ctrl+C) and restarting `npm run dev`

---

## Next Steps

Now that you're set up:

1. Read the [README](../README.md) to understand the project
2. Read [CONTRIBUTING](../CONTRIBUTING.md) to learn how to make changes
3. Try making small changes and seeing them update
4. When you're ready, pick something from the roadmap to work on!

---

*Questions? Ask in the team chat or open a GitHub issue!*
