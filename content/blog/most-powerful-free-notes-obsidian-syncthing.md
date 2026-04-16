---
title: "Stop Paying for Notes — Obsidian + Syncthing Is All You Need"
slug: stop-paying-for-notes-obsidian-syncthing
date: 2026-04-16
description: "A free, private, cross-platform note-taking system using Obsidian and Syncthing — with setup guides for macOS, Windows, and Android. No subscriptions, no cloud, no compromises."
tags: [productivity, tools, obsidian, sync, devtools]
published: true
---

# Stop Paying for Notes — Obsidian + Syncthing Is All You Need

I have tried most of the popular note apps. Notion, Apple Notes, Google Keep, Bear, even a plain folder of markdown files synced with Dropbox. They all had the same problem: either I was locked into someone else's ecosystem, paying a subscription for basic features, or giving up control of my data. When I found the combination of Obsidian and Syncthing, I stopped looking.

## The Setup in One Sentence

Obsidian handles the writing and organization. Syncthing handles the syncing. Neither one needs an account, a subscription, or an internet connection to work. Your notes stay on your devices, and they sync between each other directly.

## Why Obsidian

Obsidian is a markdown editor that works on top of a local folder. That is the entire architecture. You point it at a directory full of `.md` files and it turns that directory into a knowledge base. No proprietary format, no database, no vendor lock-in. If Obsidian disappears tomorrow, your notes are still just markdown files you can open with any text editor on earth.

The plugin ecosystem is where it gets interesting. There are community plugins for almost anything you can think of: Kanban boards, calendar views, spaced repetition flashcards, Dataview queries that turn your notes into a database. My trading journal uses Dataview to pull stock analyses from the last 7 days into a dashboard automatically. That kind of cross-referencing is possible because everything is plain text with YAML frontmatter.

```yaml
---
title: "ARCI Analysis"
type: stock_analysis
date: 2026-04-16
tags: [IDX, saham, ARCI]
sentiment: bullish
---
```

The graph view is genuinely useful once your vault grows past a few hundred notes. You start seeing connections between ideas that you would not have noticed in a folder-based system. Wikilinks like `[[React Server Components]]` create bidirectional references automatically. Click into any note and you can see everything that links to it and everything it links to.

The free tier has no limitations on the number of notes, plugins, or vaults. The only paid feature is Obsidian Sync, their cloud sync service. But we do not need that, because Syncthing does the same job for free.

## Why Syncthing

Syncthing is an open-source file synchronization tool that works peer-to-peer. No central server, no cloud storage, no account creation. You install it on your devices, pair them with device IDs, and point it at the folders you want to sync. That is it.

The sync is real-time. When I edit a note on my Mac, it shows up on my Android phone within seconds. When I jot something down on my phone during my commute, it is already on my laptop when I open it at my desk. The transfer happens over your local network when both devices are on the same WiFi, and falls back to relay servers over the internet when they are not.

All traffic is encrypted with TLS. The device pairing uses cryptographic certificates, so only devices you explicitly approve can connect. Syncthing has no central server that can be breached, because there is no central server at all.

## How They Work Together

The workflow looks like this. You have an Obsidian vault stored in a regular folder on your computer. Syncthing watches that folder and syncs any changes to your other devices. On your phone, you open the same folder as a vault in Obsidian Mobile. Edits on either device propagate to the other automatically.

My vault structure looks something like this:

```
~/Documents/Obsidian/
├── Notes/                    # General notes
│   ├── Work/                 # Meeting notes, project docs
│   ├── Dev/                  # Technical notes, snippets
│   └── Personal/             # Ideas, journal
├── Trading/                  # Stock analysis and journal
│   ├── Stocks/               # Per-ticker analysis
│   ├── Watchlist/            # Scanner results
│   └── Journal/              # Daily trading log
└── Finance/                  # Budget, expenses, reports
```

Syncthing syncs the entire `Notes/` directory and the `Trading/` directory as separate shared folders. The folder IDs must match between devices, but the paths can differ. On my Mac the vault lives at `~/Documents/Obsidian/Notes/`, on my Android it is at `/storage/emulated/0/Documents/Obsidian/Notes/`. Syncthing handles the path mapping transparently.

## The Conflict Question

The obvious concern with real-time two-way sync is: what happens when you edit the same note on two devices simultaneously? Syncthing handles this by creating a conflict file. It keeps both versions and appends a `-sync-conflict` suffix to the older one. You pick which version to keep and delete the other.

In practice, this almost never happens. The sync is fast enough that by the time you switch from your phone to your laptop, the earlier edit has already propagated. I have been running this setup for over a year and I can count the conflict files on one hand.

## Where This Beats the Alternatives

Notion requires an internet connection and stores your data on their servers. The free tier has block limits. If Notion goes down or changes their pricing, you have no recourse. Your notes are in their format on their infrastructure.

Apple Notes is locked to the Apple ecosystem. There is no way to open an Apple Note on a Windows machine or an Android phone. The export options are limited.

Google Keep is fine for quick captures but falls apart for structured knowledge. No markdown, no linking, no plugins, no real organization beyond labels and colors.

Obsidian plus Syncthing gives you local-first storage, cross-platform sync, full markdown support, a plugin ecosystem with thousands of options, and zero recurring cost. The data is yours, on your devices, in a format that will outlive any single application.

---

## Setup Guide

Here is exactly how to get this running on every platform. The whole thing takes about 15 to 20 minutes from zero.

### macOS

**Install Obsidian:**

```bash
brew install --cask obsidian
```

Or download from [obsidian.md](https://obsidian.md) and drag to Applications.

**Create your vault:**

Open Obsidian, click "Create new vault", name it something like "Notes", and pick a location like `~/Documents/Obsidian/Notes/`. This is your primary vault where all your notes will live.

**Install Syncthing:**

```bash
brew install syncthing
brew services start syncthing
```

Wait a few seconds, then verify it is running:

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8384
```

This should return `200`.

**Known macOS bug — the "tcp://default" issue:**

On some macOS installs, the default Syncthing config contains `<listenAddress>tcp://default</listenAddress>`. Syncthing treats "default" as a literal hostname and tries to resolve it, which fails. If your devices show "Disconnected (Inactive)" after setup, this is why.

Check if the sync port is actually listening:

```bash
lsof -i :22000
```

If that returns nothing, you need to fix the config. Stop Syncthing first:

```bash
brew services stop syncthing
```

Open the config file:

```bash
open -a TextEdit ~/Library/Application\ Support/Syncthing/config.xml
```

Find every `<listenAddress>tcp://default</listenAddress>` and replace it with:

```xml
<listenAddress>tcp://0.0.0.0:22000</listenAddress>
<listenAddress>quic://0.0.0.0:22000</listenAddress>
```

Check both the `<options>` section and the `<defaults>` section — the bug can appear in either place. Then restart:

```bash
brew services start syncthing
lsof -i :22000  # Should now show a process
```

**Add your vault folder to Syncthing:**

Open `http://127.0.0.1:8384` in your browser. Click "Add Folder", set the label to "Notes", the folder ID to "notes", and the path to your vault directory (e.g. `/Users/yourname/Documents/Obsidian/Notes/`). Click Save.

**Pair your device:**

Click "Add Remote Device" in the Devices section. Enter the device ID from your other device (you will get this in the Windows or Android section below). Give it a friendly name and click Save. Then go into the folder you just created, open the Sharing tab, check the remote device, and save.

### Windows

**Install Obsidian:**

Download the installer from [obsidian.md](https://obsidian.md) and run it. Create a new vault, for example at `C:\Users\YourName\Documents\Obsidian\Notes\`.

**Install Syncthing:**

The easiest way on Windows is to use the SyncTrayzor wrapper, which gives you a system tray icon and manages the Syncthing process for you. Download it from the [SyncTrayzor GitHub releases page](https://github.com/canton7/SyncTrayzor/releases) and install it.

SyncTrayzor starts Syncthing automatically and opens the web UI at `http://127.0.0.1:8384`. From here the process is identical to macOS: add your vault folder, pair your other devices, and share the folder.

If you prefer a standalone install without the tray wrapper, you can install Syncthing directly via Scoop:

```bash
scoop install syncthing
syncthing
```

This opens the web UI in your default browser.

**Add your vault folder:**

Same as macOS. In the web UI, click "Add Folder", set label to "Notes", folder ID to "notes", and path to `C:\Users\YourName\Documents\Obsidian\Notes\`.

**Pair your device:**

Click "Add Remote Device", enter the device ID from your other device, and share the Notes folder with it through the Sharing tab.

**Windows firewall note:**

On the first run, Windows Firewall may prompt you to allow Syncthing through. Allow it on private networks. If you skip this or accidentally deny it, other devices will not be able to connect. You can fix this later in Windows Defender Firewall settings by allowing `syncthing.exe` on private networks.

### Android

**Install Obsidian Mobile:**

Get it from the Google Play Store or F-Droid. When you first open it, it will ask you to create or open a vault. Choose "Open folder as vault" and navigate to the Syncthing sync directory, which will be something like `/storage/emulated/0/Documents/Obsidian/Notes/`.

Do not create a vault yet if you have not installed Syncthing on Android first. The folder needs to exist before Obsidian can open it.

**Install Syncthing:**

Install **Syncthing** from the Play Store or **Syncthing-Fork** from F-Droid (the fork is better maintained on Android). Open the app, accept the terms of service, and grant the required permissions. For full functionality, grant "All files access" in Android settings so Syncthing can read and write to any directory.

**Note your Device ID:**

In the Syncthing app, tap the menu and go to "Device ID". It will show a long string like `ABC1234-XYZ5678-...`. You will need this to pair with your computer. Also tap "Add Device" on the main screen and enter your computer's device ID, which you can find in the Syncthing web UI on your computer (the device ID is displayed in the Actions menu at the top right).

**Accept the folder share:**

After you pair the devices and share the Notes folder from your computer, the Syncthing app on Android will show a notification asking you to accept the shared folder. Accept it and set the local path to `/storage/emulated/0/Documents/Obsidian/Notes/`.

The folder ID must be exactly "notes" on both sides. If the IDs do not match, the sync will fail silently.

**Open the vault in Obsidian:**

Once the folder has synced (give it a minute for the first sync), open Obsidian Mobile, tap "Open folder as vault", and navigate to `/storage/emulated/0/Documents/Obsidian/Notes/`. Your notes will appear.

**A note on Android storage permissions:**

Android 11 and later enforce scoped storage. If Syncthing cannot write to the sync folder, go to Android Settings, find Syncthing in the app list, and enable "All files access" under the Permissions section. Without this, the sync will silently fail and you will see zero files in the folder.

### Pairing Everything Together

The full pairing flow works like this:

1. Get the device ID from each device (Mac, Windows, or Android)
2. On each device, add every other device as a remote device
3. On each device, create or accept the shared folder with the same folder ID ("notes")
4. Wait for the initial sync to complete

You do not need all three platforms. Mac plus Android is a common combination. Two Macs works too. The only requirement is that every device runs Syncthing and shares the folder with a matching ID.

After the initial sync finishes, every edit on any device propagates to all other devices automatically. You do not need to press a sync button, trigger a manual refresh, or have an internet connection if both devices are on the same local network.

---

## Final Thought

The best tools are the ones that get out of your way. Obsidian gives you a clean editor and lets you organize your thoughts however you want. Syncthing moves your files between devices without asking for your email or your credit card. Together they form a note-taking system that is free, private, cross-platform, and will still work in ten years regardless of what any company decides to do with their pricing or their terms of service. That is a rare combination, and it is worth setting up even if it takes you an afternoon to get it right.
