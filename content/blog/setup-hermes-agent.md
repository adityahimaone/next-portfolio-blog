---
title: "Setting Up Hermes Agent — My AI-Powered Dev Assistant"
slug: setup-hermes-agent
date: 2026-04-16
description: "How I set up Hermes Agent with 40+ custom skills, RTK token optimization, and automated workflows for finance, development, and productivity."
tags: [ai, automation, terminal, productivity, devtools]
published: true
---

# Setting Up Hermes Agent — My AI-Powered Dev Assistant

I got tired of copy-pasting terminal output into browser tabs. Every debugging session meant switching between ChatGPT, my editor, and my terminal, losing context every time I switched windows. I wanted something that lived where I already worked and remembered how I liked things done. That is how I ended up building and configuring Hermes Agent.

## What Hermes Actually Is

Hermes is a terminal-based AI assistant that runs on your machine. It can execute shell commands, manage files, schedule cron jobs, send messages, and control smart home devices. The difference from ChatGPT or Claude in a browser is not just convenience. Hermes maintains persistent memory across sessions, has direct tool access to your filesystem and network, and uses a system called "skills" to encode reusable procedures. A skill is a markdown file that tells the agent exactly how to perform a task the way you want it done.

## The Stack

I run Hermes on macOS. The primary model is Xiaomi MiMo v2 Pro via OpenRouter, with Qwen 3.6 Plus as a secondary option for heavier reasoning tasks. Model routing is automatic — if one provider hits rate limits, it switches to the next without manual intervention.

```yaml
# config.yaml — model routing
primary:
  provider: openrouter
  model: xiaomi/mimo-v2-pro
secondary:
  provider: openrouter
  model: qwen/qwen-3.6-plus
```

The real cost savings come from two tools layered on top: RTK (Rust Token Killer) and Caveman. RTK compresses CLI output by 60 to 90 percent depending on the command type. Running `rtk git log` instead of plain `git log` cuts the token count from 200-plus down to around 40, with the same information.

```bash
# Without RTK: 200+ tokens
git log --oneline -20

# With RTK: ~40 tokens, same info
rtk git log --oneline -20
```

RTK works across git, npm, pnpm, docker, tsc, lint, vitest, and Playwright. Test results compress by 90 percent, build output by 80 percent, git operations by 59 percent. The pattern is always the same — prefix with `rtk` and the tool strips noise from the output.

```bash
# All RTK commands follow the same pattern
rtk tsc              # TypeScript errors grouped by file (83% savings)
rtk vitest run       # Vitest failures only (99.5% savings)
rtk pnpm install     # Compact install output (90% savings)
rtk docker ps        # Compact container list (85% savings)
```

Caveman goes further by letting you define output templates. Instead of raw CLI dump, you get structured, minimal responses. The two tools combined push savings into the 95 to 99 percent range on repetitive workflows. Over a full day of agent use, that is thousands of tokens saved.

## Forty-One Skills Across Nine Categories

Skills are where Hermes stops being a chatbot and becomes infrastructure. Each skill is a markdown file with instructions, examples, pitfalls, and verification steps. I have 41 of them organized into nine categories.

```
~/.hermes/skills/
├── finance/                 # 5 skills — Zenith Finance suite
│   ├── zenith-finance/
│   ├── zenith-finance-gsheets-sync/
│   ├── zenith-finance-maintenance/
│   ├── zenith-finance-sync/
│   └── zenith-finance-caveman-optimization/
├── github/                  # 7 skills — PR lifecycle, issues, code review
│   ├── github-auth/
│   ├── github-pr-workflow/
│   ├── github-issues/
│   ├── github-code-review/
│   ├── github-repo-management/
│   ├── github-ssh-token-workflow/
│   └── codebase-inspection/
├── productivity/            # 13 skills — Obsidian, Google, Linear, etc.
├── research/                # 7 skills — arXiv, Polymarket, Blogwatcher
├── devops/                  # 4 skills — Syncthing, MySQL, SSH, Webhooks
├── software-development/    # 2 skills — Caveman+RTK, Context optimization
├── debugging/               # 1 skill — Regex pattern debugging
├── frontend-architect/      # 1 skill — Caveman template integration
└── note-taking/             # 1 skill — Obsidian multi-vault management
```

The finance category has five skills built around Zenith Finance, a multi-account ledger system that tracks transactions, processes OCR receipts, and syncs to Google Sheets automatically. The GitHub category covers the full PR lifecycle — creating branches, reviewing code with inline comments, monitoring CI, and merging. Thirteen productivity skills handle Obsidian note management, Google Workspace integration, Linear issue tracking, PowerPoint creation, and PDF text extraction. Seven research skills search arXiv papers, query Polymarket prediction data, monitor RSS feeds, and build persistent knowledge bases.

What makes skills different from just having good prompts is that they persist, they accumulate, and they get refined over time. A skill I wrote three months ago for Zenith Finance sync has been patched four times as I discovered edge cases. That institutional knowledge lives in the skill file, not in my head.

## Automated Workflows

Several processes run on schedule without my input. A morning digest aggregates overnight API costs, cron job health status, and any alerts from the past 24 hours. A self-improvement cron analyzes past sessions for recurring failures and skill gaps, then creates or patches skills automatically. Finance transactions sync to Google Sheets on a schedule. Work-from-office events get synchronized between Google Calendar and Apple Calendar so my phone and laptop stay in agreement.

```bash
# Cron jobs run autonomously — this is what Hermes manages internally
0 7 * * *    morning-digest        # Aggregates costs, health, alerts
0 3 * * *    self-improvement      # Analyzes sessions, patches skills
*/30 * * * * finance-sync          # Syncs transactions to Google Sheets
0 6 * * *    wfo-calendar-sync     # Google Calendar ↔ Apple Calendar
```

These are not complex workflows individually. The value is that they run consistently without me remembering to trigger them.

## The Backup Problem

An AI agent with custom skills and persistent memory is a real investment. Losing it would mean weeks of reconfiguration. I keep a complete backup in a GitHub repo called hermes-agent-backup. Setting up Hermes on a new machine is a single command sequence.

```bash
git clone https://github.com/adityahimaone/hermes-agent-backup.git
cd hermes-agent-backup
./install.sh
```

The repo contains the core RTK configuration, all 41 skills organized by category, wrapper scripts for Caveman and Zenith Finance, token-efficient templates, and the automated installer. The backup also serves as documentation — when I want to remember why I configured something a certain way, the skill files and configuration comments tell the story.

## What I Got Wrong Initially

I started with too many skills. The first iteration had 60-plus skills, many of them overlapping or too granular. A skill for "git commit" and another for "git push" is wasteful when a single "git workflow" skill handles both. I consolidated down to 41 and the system became faster and easier to maintain.

I also underestimated token optimization at first. Running agents without RTK meant burning through context windows on verbose output that added no value. Once I integrated RTK and Caveman, the same tasks used a fraction of the tokens. That compounds over a full workday.

The other mistake was not backing up early enough. I lost a week of skill refinements during a machine migration because I had not set up the backup repo yet. Now the backup runs as part of my regular workflow, not as an afterthought.

## Where This Goes Next

I am looking at MCP (Model Context Protocol) integrations to connect external services more cleanly, multi-agent workflows for running independent tasks in parallel, and expanding the research skills for deeper market analysis. The skills system is extensible by design — when I discover a new recurring workflow, I write a skill for it and it becomes permanent infrastructure.

The repo at hermes-agent-backup is designed as a starting point for anyone who wants to build something similar. The configuration, the skills, and the automation patterns are all there. What you build on top of it depends on what problems you actually have.
