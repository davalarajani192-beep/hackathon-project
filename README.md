# 🚀 Hackathon Project Repository

> **Repository URL:** [https://github.com/tirrigowthamkrishna/hackathon-project](https://github.com/tirrigowthamkrishna/hackathon-project)  
> **Owner:** `tirrigowthamkrishna`  
> **Default Branch:** `master`

---

## 📌 Overview
This repository is the central codebase for our hackathon project. It has been prepared and cleaned so team members can integrate their completed project code directly into this repository using Antigravity or Git CLI.

---

## 🛠️ Step-by-Step Instructions for Teammates

### Option A: If using Antigravity Agent (Easiest)
Copy and paste this prompt directly into your Antigravity chat:

```markdown
I have my completed hackathon project on my computer. I need to push my code to our team's central GitHub repository:
https://github.com/tirrigowthamkrishna/hackathon-project

Please do the following:
1. Check that I am logged into GitHub CLI (`gh auth status`). If not, guide me to run `gh auth login --web --git-protocol https`.
2. Connect my current project folder to remote `origin`:
   https://github.com/tirrigowthamkrishna/hackathon-project.git
3. Create a branch named `feature/<my-name>-complete-project` (or checkout a feature branch).
4. Ensure `.env`, `node_modules/`, `venv/`, and `.db` files are ignored in `.gitignore`.
5. Stage all my code files, commit with a clear message: "feat: add complete hackathon project codebase", and push to `origin`.
6. Open a Pull Request on GitHub against `master`.
```

---

### Option B: If pushing manually via Terminal / Git CLI

#### 1. Sign in to GitHub CLI (one-time)
```bash
gh auth login --web --git-protocol https
```

#### 2. Connect Your Project to this Repository
In your local project folder where your code lives:
```bash
# If git is not yet initialized in your project:
git init

# Connect to this remote repository:
git remote remove origin 2>nul
git remote add origin https://github.com/tirrigowthamkrishna/hackathon-project.git

# Fetch latest repository references:
git fetch origin
```

#### 3. Create your feature branch and push your code
```bash
# Create and switch to your feature branch:
git checkout -b feature/team-code-submission

# Check your .gitignore to ensure secrets and dependency folders are excluded:
# Make sure node_modules/, venv/, and .env are NOT staged

# Stage all your files:
git add .

# Commit your project:
git commit -m "feat: integrate complete hackathon project codebase"

# Push to GitHub:
git push -u origin feature/team-code-submission
```

#### 4. Open a Pull Request
1. Go to [https://github.com/tirrigowthamkrishna/hackathon-project](https://github.com/tirrigowthamkrishna/hackathon-project)
2. You will see a banner: **"feature/team-code-submission had recent pushes"** → Click **"Compare & pull request"**.
3. Click **"Create pull request"**.
4. The team can review and merge it into `master`!

---

## 🔐 Contribution & Security Rules
- **Never commit credentials:** Keep `.env`, API keys, passwords, database credentials, and secret tokens out of Git.
- **Never commit dependency folders:** Do not commit `node_modules/`, `venv/`, `__pycache__/`, or `dist/`.
- **Review before pushing:** Always check `git status` before committing.
