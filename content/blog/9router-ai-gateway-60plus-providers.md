---
title: "9Router — One Gateway to 60+ AI Providers with Smart Fallback"
slug: 9router-ai-gateway-60plus-providers
date: 2026-05-05
description: "How I set up 9Router as a local AI gateway with 3-tier fallback, RTK token compression, and seamless integration with Claude Code, Codex, and Hermes Agent."
tags: [ai, tools, automation, productivity, devtools, router, free-tier]
published: true
pinned: false
---

# 9Router — One Gateway to 60+ AI Providers with Smart Fallback

Managing multiple AI subscriptions udah jadi masalah sendiri. Tiap bulan gw ada Claude, OpenAI, Gemini, plus some free-tier accounts. Tiap CLI tool (Claude Code, Codex, Cursor) butuh config berbeda. Too many API keys, too many endpoints.

Enter **9Router** — one OpenAI-compatible endpoint di `localhost:20128` yang nge-route semua requests ke 60+ AI providers dengan **3-tier smart fallback**.

## What is 9Router?

9Router itu **AI gateway** yang jalan locally di mesin lu. Dia bikin satu endpoint (OpenAI-compatible) yang bisa dipake oleh semua tools:

```
┌─────────────────┐
│  Claude Code    │
│  Codex CLI      │
│  Hermes Agent   │
│  Cursor / Cline │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  9Router        │ ← localhost:20128
│  (Smart Router)│
└────────┬────────┘
         │
    ┌────┼────┬────┬────┐
    ▼    ▼    ▼    ▼    ▼
┌────┐┌────┐┌────┐┌────┐┌────┐
│Tier1││Tier2││Tier3││Free││OAuth│
└────┘└────┘└────┘└────┘└────┘
```

## 3-Tier Smart Fallback

Ini yang bikin 9Router powerful — **automatic fallback** pas quota habis:

### Tier 1 — Subscription (Priority)
- Claude Code (Anthropic)
- OpenAI Codex
- GitHub Copilot
- Gemini (Google AI Studio)

### Tier 2 — Cheap & Fast
- GLM Coding ($0.60/1M tokens)
- MiniMax ($0.20/1M)
- Kimi ($9/month unlimited)

### Tier 3 — FREE (Unlimited)
- iFlow
- Qwen (Alibaba)
- OpenCode
- Kiro AI
- OpenRouter free tier

**Gimana cara kerjanya?**  
Lu coding pake Claude Code. Pas quota Claude abis, 9Router otomatis switch ke Tier 2 (GLM/Kimi), terus kalau perlu ke Tier 3 (FREE). Lu nggak pernah berhenti coding.

## Built-in Token Savers

Dua fitur yang bikin 9Router hemat token (dan uang):

### 1. RTK (Rust Token Killer) — INPUT Compression
RTK auto-compress tool results (git diff, grep, ls, find) sebelum dikirim ke LLM.
- **Lossless compression** — sama informasi, cuma lebih ringkas
- **Default ON** — Jalan otomatis
- **Savings**: 20% — 65% tergantung command

```
# Tanpa RTK: 47K tokens
git diff --staged

# Dengan RTK: 28K tokens (same info)
```

### 2. Caveman Mode — OUTPUT Compression
Inject terse-style system prompt biar LLM jawab lebih ringkas.
- 5 intensity levels
- "verbose paragraph" → "telegraphic why use many token when few do trick"

## My Setup on VPS

Gw install 9Router di VPS (Ubuntu 22.04) biar jalan 24/7 dan bisa diakses dari mana aja.

### Installation

```bash
npm install -g 9router
```

### Running as System Service

Gw pake **PM2** buat jagain 9Router supaya auto-start:

```bash
# Start 9router (no browser, headless mode)
9router --no-browser

# Save PM2 process
pm2 save
pm2 startup  # auto-start on boot
```

### Cloudflare Tunnel (Access from Anywhere)

Karena 9Router jalan di `localhost:20128`, gw pake **Cloudflare Tunnel** biar bisa diakses dari luar:

```bash
# 9Router bundles cloudflared
9router tunnel  # auto-starts cloudflared

# Result: https://xxx.trycloudflare.com → localhost:20128
```

Sekarang gw bisa pake 9Router dari laptop manapun, termasuk Hermes Agent di macOS.

### Connecting Tools

Setiap tool tinggal point ke `localhost:20128` (atau tunnel URL):

**Claude Code:**
```bash
export ANTHROPIC_BASE_URL="http://localhost:20128/v1"
export ANTHROPIC_API_KEY="dummy"  # 9Router nggak butuh real key
claude
```

**OpenAI Codex:**
```bash
export OPENAI_BASE_URL="http://localhost:20128/v1"
export OPENAI_API_KEY="dummy"
codex
```

**Hermes Agent (`config.yaml`):**
```yaml
providers:
  - name: "9router"
    type: "openai-compatible"
    base_url: "http://localhost:20128/v1"
    api_key: "dummy"
```

## 60+ Providers Supported

9Router supports **10 service kinds** — bukan cuma chat/LLM:

| Service Kind | Examples |
|-------------|---------|
| **Chat/LLM** | Claude, GPT-4, Gemini, Qwen, GLM, Kimi |
| **Embeddings** | Voyage, Jina, OpenAI, Cohere |
| **Text-to-Speech** | ElevenLabs, Deepgram, Edge TTS |
| **Speech-to-Text** | Deepgram, AssemblyAI, Whisper |
| **Image Gen** | Fal, Stability, BFL Flux, Recraft |
| **Vision/Image-to-Text** | OpenAI, Gemini, Anthropic, Groq |
| **Video Gen** | Runway ML, Topaz |
| **Web Search** | Tavily, Brave, Serper, Perplexity |
| **Web Fetch** | Tavily, Exa, Firecrawl, Jina Reader |
| **OAuth Subscription** | Claude Code, Copilot, Cursor, Kiro |

## Real-time Dashboard

9Router punya **visual dashboard** di `http://localhost:20128` (atau tunnel URL):

- Live token tracking per provider
- Quota reset countdown
- Cost estimation
- Provider health status
- 3-tier fallback logs

Gw bisa liat exact usage dan sisa quota sebelum ke-limit.

## Why I Love It

1. **Zero downtime coding** — Pas quota habis, auto-switch ke provider lain
2. **Maximize subscriptions** — Claude Code, Copilot, Cursor tetep kepake maksimal
3. **FREE tier backup** — iFlow, Qwen, OpenCode siap cadangan
4. **Token savings** — RTK + Caveman hemat 20-65% tokens
5. **One endpoint** — Nggak perlu gonta-ganti API keys di setiap tool
6. **Cloud sync** — Tunnel + Cloudflare, akses dari mana aja

## What's Next

- [ ] Setup **Smart Combos** — chain multiple providers jadi one virtual provider
- [ ] Configure **multi-account** per provider (round-robin load balancing)
- [ ] Integrate **proxy pools** buat region-restricted providers
- [ ] MITM Bridge — intercept Antigravity/Copilot/Kiro IDE traffic

---

Building this setup ngajarin gw gimana manage multiple AI subscriptions tanpa pusing. Sekarang gw cuma perlu inget satu endpoint: `localhost:20128`. Sisanya diserahin ke 9Router. 😊

**Stack**: 9Router • PM2 • Cloudflare Tunnel • Claude Code • OpenAI Codex • Hermes Agent • RTK • Caveman Mode

**Cost**: $0/month (pake free tiers + subscriptions lu) — **FREE forever** buat 8 providers, atau pake subscription lu untuk 6 providers OAuth.
