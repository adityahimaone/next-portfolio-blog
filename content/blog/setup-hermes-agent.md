---
title: "Setting Up Hermes Agent — My AI-Powered Dev Assistant"
slug: setup-hermes-agent
date: 2026-04-16
description: "How I set up Hermes Agent with 40+ custom skills, RTK token optimization, and automated workflows for finance, development, and productivity."
tags: [ai, automation, terminal, productivity, devtools]
published: true
---

# Setting Up Hermes Agent — My AI-Powered Dev Assistant

I've been using AI assistants in my workflow for a while, but I wanted something deeper — an agent that knows my preferences, runs in my terminal, and automates my daily tasks. That's how I ended up building and configuring **Hermes Agent**.

## What Is Hermes Agent?

Hermes is a terminal-based AI assistant that lives on your machine. It's not just a chatbot — it can execute shell commands, manage files, run cron jobs, send messages, and even control smart home devices. Think of it as a programmable AI that you can customize with "skills" — reusable workflows for specific tasks.

The key difference from ChatGPT or Claude in a browser? Hermes has **persistent memory**, **tool access**, and **skills** that encode how you like things done.

## My Setup

I run Hermes on macOS with the following stack:

- **Primary model:** Nemotron 3 Super 120B via OpenRouter
- **Fallback:** Groq with GPT-OSS 20B, then DeepSeek 3.2
- **Token optimization:** RTK (Rust Token Killer) — 60-90% savings on CLI output
- **Templating:** Caveman — token-efficient output formatting

### RTK — The Token Saver

One of the first things I set up was RTK. If you've ever looked at `git log` output or build errors in an AI context window, you know how expensive verbose output can be. RTK prefixes your commands and compresses the output:

```bash
# Without RTK: 200+ tokens of git log output
git log --oneline -20

# With RTK: ~40 tokens, same info
rtk git log --oneline -20
```

It works with git, npm, pnpm, docker, tsc, lint, vitest, playwright — basically anything that produces structured CLI output. The savings add up fast: 90% on test results, 80% on build output, 59% on git operations.

### Caveman Templates

Caveman takes it further by letting you define output templates. Instead of raw CLI output, you get structured, minimal responses. Combined with RTK, I'm getting 90-99% token savings on repetitive workflows.

## The Skills System

This is where Hermes gets powerful. Skills are markdown files that encode procedures — how to do specific tasks. I have **41 custom skills** across 9 categories:

### Finance (5 skills)
- **Zenith Finance** — Multi-account ledger, transaction logging, OCR receipt processing
- **Google Sheets Sync** — Auto-sync transactions and ledger to Google Sheets
- **Finance Maintenance** — Keep local files clean and synced

### GitHub (7 skills)
- PR lifecycle management (create, review, merge)
- Issue triage and management
- Code review with inline comments
- Repository management and SSH setup

### Productivity (13 skills)
- **Obsidian integration** — Create and search notes across vaults
- **Google Workspace** — Gmail, Calendar, Drive, Sheets via Python
- **Linear** — Issue management via GraphQL API
- **PowerPoint** — Create and edit .pptx files
- **OCR** — Extract text from PDFs and scanned documents

### Research (7 skills)
- **arXiv** — Search and retrieve academic papers
- **Polymarket** — Query prediction market data
- **Blogwatcher** — Monitor RSS/Atom feeds for updates
- **LLM Wiki** — Build persistent knowledge bases

### DevOps (4 skills)
- **Syncthing** — Cross-device folder sync
- **MySQL Service Manager** — Homebrew MySQL management
- **Webhook Subscriptions** — Event-driven agent activation

### Software Development (2 skills)
- **Caveman + RTK Integration** — Token-efficient output formatting
- **Context Optimization** — Manage memory and session pruning

### Debugging (1 skill)
- **Regex Pattern Debugging** — Systematic approach to fixing regex issues

### Frontend Architect (1 skill)
- **Caveman Template Integration** — Token-efficient CLI output for frontend workflows

### Note Taking (1 skill)
- **Obsidian** — Multi-vault note management with smart path resolution

## Automated Workflows

Hermes runs several automated workflows via cron jobs:

- **Morning digest** — Aggregates overnight costs, cron health, and alerts
- **Self-improvement** — Analyzes past sessions for skill gaps and creates patches
- **Finance sync** — Auto-syncs transactions to Google Sheets
- **WFO tracking** — Monitors and syncs work-from-office events between Google and Apple Calendar

## The Backup Strategy

I keep a complete backup of my Hermes setup in a GitHub repo: [hermes-agent-backup](https://github.com/adityahimaone/hermes-agent-backup). It includes:

- Core configuration (RTK rules, memory profile, user preferences)
- All 41 custom skills organized by category
- Wrapper scripts for Caveman and Zenith Finance
- Token-efficient templates
- Automated installation script (`install.sh`)

If I ever need to set up Hermes on a new machine, it's one command:

```bash
git clone https://github.com/adityahimaone/hermes-agent-backup.git
cd hermes-agent-backup
./install.sh
```

## What I Learned

1. **Skills are everything** — The value of an AI agent isn't in the model, it's in the procedures you teach it. A skill that encodes your exact workflow is worth more than a smarter model.

2. **Token optimization matters** — RTK and Caveman saved me thousands of tokens per session. When you're running an agent all day, those savings compound.

3. **Backup your config** — An AI agent with custom skills and memory is a significant investment. Back it up like you would any other codebase.

4. **Start simple, iterate** — I didn't build 41 skills at once. I started with the workflows I use most (git, finance, Obsidian) and added more as I discovered pain points.

## What's Next

I'm exploring MCP (Model Context Protocol) integrations for connecting external services, multi-agent workflows for parallel task execution, and expanding the research skills for better market analysis.

If you're interested in setting up something similar, check out the [hermes-agent-backup](https://github.com/adityahimaone/hermes-agent-backup) repo — it's designed to be a starting point you can customize.
