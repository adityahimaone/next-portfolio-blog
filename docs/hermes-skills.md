
# Hermes Agent Skills Index

Last updated: 2026-04-16

Complete list of 41 custom skills installed in Hermes Agent, organized by category.

## Categories Overview

| Category | Skills | Description |
|----------|--------|-------------|
| Finance | 5 | Zenith Finance, Google Sheets sync, maintenance |
| GitHub | 7 | PR lifecycle, issues, code review, repo management |
| Productivity | 13 | Obsidian, Google Workspace, Linear, PowerPoint, OCR |
| Research | 7 | arXiv, Polymarket, Blogwatcher, LLM Wiki |
| DevOps | 4 | Syncthing, MySQL, SSH, Webhooks |
| Software Development | 2 | Caveman + RTK, Context optimization |
| Debugging | 1 | Regex pattern debugging |
| Frontend Architect | 1 | Caveman template integration |
| Note Taking | 1 | Obsidian multi-vault management |

## Finance (5 skills)

### zenith-finance
Advanced Finance & Asset Manager. Multi-account ledger, transaction logging, OCR receipt processing, and budget alerts. Triggered by: "zenith", "finance", "catat pengeluaran", "cek saldo".

### zenith-finance-gsheets-sync
Synchronize Zenith Finance ledger and transactions to Google Sheets with automatic updates. Creates/maintains Dashboard and History sheets.

### zenith-finance-maintenance
Maintain Zenith Finance local files (Ledger.md and Transactions.md) in easy-to-maintain format. Provides simple key-value format for ledger, standard transaction format.

### zenith-finance-sync
Auto-sync Zenith Finance data (transactions, ledger) to Google Sheets. Creates/updates spreadsheet with Dashboard and History sheets.

### zenith-finance-caveman-optimization
Complete Zenith Finance optimization with Caveman + RTK for token-efficient reporting. Includes transaction summaries, ledger views, monthly reports, and category breakdowns.

## GitHub (7 skills)

### github-auth
Set up GitHub authentication using git (universally available) or gh CLI. Covers HTTPS tokens, SSH keys, credential helpers.

### github-pr-workflow
Full pull request lifecycle — create branches, commit changes, open PRs, monitor CI status, auto-fix failures, and merge.

### github-issues
Create, manage, triage, and close GitHub issues. Search existing issues, add labels, assign people, and link to PRs.

### github-code-review
Review code changes by analyzing git diffs, leaving inline comments on PRs, and performing thorough pre-push review.

### github-repo-management
Clone, create, fork, configure, and manage GitHub repositories. Manage remotes, secrets, releases, and workflows.

### github-ssh-token-workflow
GitHub setup with SSH keys and understanding when tokens vs SSH are needed.

### codebase-inspection
Inspect and analyze codebases using pygount for LOC counting, language breakdown, and code-vs-comment ratios.

## Productivity (13 skills)

### obsidian
Read, search, create, and organize notes across multiple Obsidian vaults. Smart vault/folder resolution from natural commands.

### google-workspace
Gmail, Calendar, Drive, Contacts, Sheets, and Docs integration via Python. Uses OAuth2 with automatic token refresh.

### google-workspace-setup
Properly set up Google Workspace OAuth2 authentication for Hermes agent.

### linear
Manage Linear issues, projects, and teams via the GraphQL API. Create, update, search, and organize issues.

### notion
Notion API for creating and managing pages, databases, and blocks via curl.

### powerpoint
Create, read, edit .pptx files. Covers slide decks, pitch decks, presentations.

### nano-pdf
Edit PDFs with natural-language instructions using the nano-pdf CLI.

### ocr-and-documents
Extract text from PDFs and scanned documents. Uses pymupdf for text-based PDFs, marker-pdf for OCR.

### obi-notes
Trading and finance-specific Obsidian writes. Stock analysis, scanner results, orderbook analysis.

### obi-stock-recommendations
Specialized skill for creating stock recommendation notes with RTK + Caveman integration.

### stock-orderbook-analysis
Analyze Indonesian stock (IDX) orderbook snapshots. Detects bid/ask walls, smart money signals.

### documentation-index-maintenance
Maintain and fix inconsistencies in documentation indexes, tables of contents.

### wfo-calendar-complete
Complete WFO calendar sync between Google Calendar and Apple Calendar.

## Research (7 skills)

### arxiv
Search and retrieve academic papers from arXiv using their free REST API.

### polymarket
Query Polymarket prediction market data — search markets, get prices, orderbooks.

### blogwatcher
Monitor blogs and RSS/Atom feeds for updates using the blogwatcher-cli tool.

### llm-wiki
Karpathy's LLM Wiki — build and maintain a persistent, interlinked markdown knowledge base.

### market-alpha-scout
Consolidated Indonesian stock market scanner. Multi-source analysis for IDX stocks.

### financial_analysis_automation
Create automated financial analysis skills with scheduled execution and result storage.

### research-paper-writing
End-to-end pipeline for writing ML/AI research papers.

## DevOps (4 skills)

### syncthing-setup
Install and configure Syncthing for folder sync between macOS and Android devices.

### mysql-service-manager
Manages MySQL services via Homebrew with RTK integration for token optimization.

### git-ssh-custom-host
Set up SSH authentication for custom Git hosts (non-standard ports, custom domains).

### webhook-subscriptions
Create and manage webhook subscriptions for event-driven agent activation.

## Software Development (2 skills)

### caveman-rtk-integration
Integrates Caveman templating engine with RTK (Rust Token Killer) for token-optimized output formatting.

### context-optimization
Optimize Hermes context usage — expand RTK coverage, prune sessions, manage memory.

## Debugging (1 skill)

### debug-regex-patterns-in-files
Guide for debugging regex patterns stored in Python files that aren't matching as expected.

## Frontend Architect (1 skill)

### caveman-template-integration
Integrate Caveman templating engine to minimize token output from repetitive CLI commands.

## Note Taking (1 skill)

### obsidian
Multi-vault note management with smart path resolution. Handles create, read, search, organize notes.

## Token Optimization Stack

| Tool | Savings | Use Case |
|------|---------|----------|
| RTK | 60-90% | CLI output compression |
| Caveman | 90-99% | Templated output formatting |
| Combined | 95-99% | Full workflow optimization |

## Backup Repository

All skills are backed up at: [hermes-agent-backup](https://github.com/adityahimaone/hermes-agent-backup)

Quick restore:
```bash
git clone https://github.com/adityahimaone/hermes-agent-backup.git
cd hermes-agent-backup
./install.sh
```
