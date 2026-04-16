---
title: "Access Any Device from Anywhere — How Tailscale Replaced My Entire VPN Setup"
slug: tailscale-access-any-device-anywhere
date: 2026-04-16
description: "How Tailscale creates a private mesh network between your Mac, Windows, and Android devices — with zero port forwarding, no public IP, and SSH access that actually works."
tags: [devtools, networking, tailscale, vpn, remote-access]
published: true
---

# Access Any Device from Anywhere — How Tailscale Replaced My Entire VPN Setup

Every developer who works across multiple devices has hit this wall. You need to grab a file from your desktop at home, or run a command on your Windows machine while sitting at a cafe with your Mac, or debug a service running on your laptop from your phone. The traditional answers are all terrible: expose ports to the internet and pray your firewall rules are correct, pay for a VPS to act as a relay, or set up a WireGuard config that breaks every time your ISP assigns a new IP.

Tailscale replaces all of that with something that feels absurdly simple for how powerful it is. Install it on your devices, log in with the same account, and they can see each other as if they were on the same local network. No port forwarding, no static IPs, no manual configuration. Your Mac gets an address like `100.75.2.78`, your Windows machine gets `100.122.101.28`, and you can SSH from one to the other as naturally as if they were sitting next to each other on the same desk.

## What Tailscale Actually Is

Tailscale is a mesh VPN built on top of WireGuard. Instead of routing all your traffic through a central server, it creates direct encrypted connections between your devices. Each device runs a small agent that negotiates peer-to-peer tunnels with every other device in your network. The coordination happens through Tailscale's control plane, but the actual data flows directly between devices. Tailscale never sees your traffic.

The key insight is the `100.x.x.x` address space. Tailscale assigns each device a stable IP in the CGNAT range that does not conflict with typical home or office networks. These addresses do not change. Your Mac is always `100.75.2.78` whether you are on home WiFi, a mobile hotspot, or a hotel network in another country. This stability is what makes it useful for SSH and service access — you hardcode the Tailscale IP once and it works forever.

The free tier covers up to 100 devices and 3 users. For personal use, that is effectively unlimited. No credit card required to start.

## How It Works Under the Hood

When two Tailscale devices need to connect, they first try a direct connection over the local network. If both are behind NAT (which is almost always the case), Tailscale uses NAT traversal techniques borrowed from WebRTC: STUN to discover public addresses, hole punching to establish direct connections through NAT devices. If direct connection fails, Tailscale falls back to a relay server called DERP, which forwards encrypted packets between the two devices. The relay sees only encrypted WireGuard frames, so your data remains private even in the fallback path.

In practice, direct connection succeeds most of the time on home and office networks. The DERP relay adds some latency but keeps everything working. You can check which path a connection is using with `tailscale ping <device-ip>` — it will tell you whether the route is direct or going through DERP.

```
$ tailscale ping 100.122.101.28
pong from windows (100.122.101.28) via 192.168.1.5:41641 in 2ms
```

Two milliseconds means it went direct. If it says "via DERP" you are on the relay, which is still functional but ideally you would troubleshoot the NAT issue.

## My Real Setup

I run Tailscale on three devices: a Mac as my primary development machine, a Windows desktop that I sometimes need for Windows-specific builds and testing, and an Android phone that I use for quick checks and captures on the go. Each device has a fixed Tailscale IP.

The Mac runs most of my services. I use Tailscale to SSH into it from my phone or from Windows. I run a local development server on port 3002 that I can access from any device on the Tailscale network by navigating to `http://100.75.2.78:3002`. No tunneling, no ngrok, no port forwarding on my router.

On Windows, I installed OpenSSH Server so I can run commands remotely from my Mac. I set up key-based authentication so there is no password prompt. From my Mac terminal I can do things like:

```bash
ssh user@100.122.101.28 "dir C:\Users"
```

and get a directory listing from the Windows machine. This is useful for cross-platform development verification — checking that a build works the same way on both platforms, or grabbing a file from the Windows filesystem without leaving my Mac.

## Setup Guide

### macOS

Download Tailscale from the Mac App Store or install it via Homebrew:

```bash
brew install --cask tailscale
```

Open the Tailscale app from your Applications folder. It will ask you to log in — you can use Google, GitHub, Apple, or a few other identity providers. Pick one and stick with it; all your devices need to be on the same account.

After login, the app shows your Tailscale IP address. Note this down. You can also find it anytime by running:

```bash
tailscale ip
```

To enable SSH access to your Mac, turn on Remote Login in System Settings. Go to General, then Sharing, and toggle Remote Login to on. This starts the built-in SSH server on port 22.

For key-based authentication so you can connect without a password:

```bash
# Generate a key if you do not already have one
ssh-keygen -t ed25519

# Add the public key to your authorized keys
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Copy the public key (`id_ed25519.pub`) to any other device you want to connect from. On Android, you can use Termux. On Windows, you can use `ssh-copy-id` from Git Bash or manually paste the key into the `authorized_keys` file.

### Windows

Download Tailscale from the Microsoft Store or from [tailscale.com/download](https://tailscale.com/download). Install it, open it, and log in with the same account you used on your Mac.

Your Windows machine will get its own Tailscale IP. Note it down. You can find it by right-clicking the Tailscale tray icon and looking at the device details, or by running in PowerShell:

```powershell
tailscale ip
```

For SSH access to the Windows machine, you need to install OpenSSH Server. Open PowerShell as Administrator and run:

```powershell
# Install the OpenSSH Server capability
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Start the SSH service
Start-Service sshd

# Set it to start automatically on boot
Set-Service -Name sshd -StartupType 'Automatic'
```

Verify it is running:

```powershell
Get-Service sshd
```

You should see `Status = Running`.

If Windows Firewall blocks the connection, add a rule to allow inbound traffic on port 22:

```powershell
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' `
  -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

Next, copy your SSH public key from your Mac to the Windows machine. The easiest way is `ssh-copy-id` from your Mac:

```bash
ssh-copy-id -f user@100.122.101.28
```

If that does not work, you can do it manually. On Windows, create the `.ssh` directory and the `authorized_keys` file:

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ssh"
Set-Content -Path "$env:USERPROFILE\.ssh\authorized_keys" `
  -Value 'ssh-ed25519 AAAA...your-key-here... user@mac' -NoNewline
```

Windows OpenSSH has strict permission requirements on `authorized_keys`. The file must be owned by the user and have limited access. Fix the permissions with:

```powershell
icacls "$env:USERPROFILE\.ssh\authorized_keys" /reset
icacls "$env:USERPROFILE\.ssh\authorized_keys" /grant:r "SYSTEM:F"
icacls "$env:USERPROFILE\.ssh\authorized_keys" /grant:r "Administrators:F"
icacls "$env:USERPROFILE\.ssh\authorized_keys" /grant:r "$env:USERNAME:R"
```

If your user is in the Administrators group, Windows also checks a second location for authorized keys. Copy the same key there too:

```powershell
Set-Content -Path "C:\ProgramData\ssh\administrators_authorized_keys" `
  -Value 'ssh-ed25519 AAAA...your-key-here... user@mac' -NoNewline

icacls "C:\ProgramData\ssh\administrators_authorized_keys" /reset
icacls "C:\ProgramData\ssh\administrators_authorized_keys" /grant:r "SYSTEM:F"
icacls "C:\ProgramData\ssh\administrators_authorized_keys" /grant:r "Administrators:F"
```

Restart the SSH service and test from your Mac:

```powershell
Restart-Service sshd
```

```bash
ssh user@100.122.101.28 "echo Connected; whoami; hostname"
```

One more thing. Windows defaults to `cmd.exe` as the SSH shell, which means PowerShell syntax does not work in remote commands. If you prefer PowerShell, set it as the default SSH shell:

```powershell
New-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" -Name DefaultShell `
  -Value "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" `
  -PropertyType String -Force
Restart-Service sshd
```

With PowerShell as the default shell, remember that `&&` is bash syntax. Use `;` instead for chaining commands. Or force a specific mode per command:

```bash
# CMD syntax
ssh user@100.122.101.28 "cmd /c echo hello && dir"

# PowerShell syntax
ssh user@100.122.101.28 "powershell -NoProfile -Command 'Write-Host Hello'"
```

**Common Windows SSH pitfalls:**

If you have `.bashrc`, `.bash_profile`, or `.zshrc` in your Windows home directory (left over from Git Bash or WSL), PowerShell will try to parse them on SSH login and throw errors. Rename them:

```powershell
Rename-Item "$env:USERPROFILE\.bashrc" "$env:USERPROFILE\.bashrc.bak" -ErrorAction SilentlyContinue
Rename-Item "$env:USERPROFILE\.bash_profile" "$env:USERPROFILE\.bash_profile.bak" -ErrorAction SilentlyContinue
Rename-Item "$env:USERPROFILE\.zshrc" "$env:USERPROFILE\.zshrc.bak" -ErrorAction SilentlyContinue
```

If you use oh-my-posh or PSReadLine in your PowerShell profile, these also break over SSH because they require a virtual terminal that SSH does not provide. Create a minimal SSH-safe profile:

```powershell
Rename-Item "$env:USERPROFILE\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1" `
  "$env:USERPROFILE\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1.bak" -ErrorAction SilentlyContinue
Set-Content -Path "$env:USERPROFILE\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1" `
  -Value "# SSH-safe profile"
```

### Android

Install Tailscale from the Google Play Store. Open it, log in with the same account, and grant the VPN permission when prompted. Your phone will get a Tailscale IP in the same `100.x.x.x` range.

The Android Tailscale app also provides a quick access tile in your notification shade. You can toggle the VPN on and off without opening the app.

From your phone, you can now access any service running on your Mac or Windows machine. Open a browser and navigate to `http://100.75.2.78:3002` to hit a local dev server on your Mac. Use an SSH client app like Termux or JuiceSSH to get a terminal on your Mac:

```bash
# In Termux on Android
pkg install openssh
ssh adityahimawan@100.75.2.78
```

This is surprisingly useful. I use it to check on running services, restart a crashed process, or pull a file I need while away from my desk. The connection is encrypted end to end and works on mobile data, not just WiFi.

### Connecting It All Together

The pairing process is straightforward. Install Tailscale on every device, log in with the same account, and they are all on the same network automatically. You do not need to manually pair devices or exchange keys — Tailscale handles device discovery through its control plane.

If you want to restrict which devices can talk to each other, Tailscale supports ACLs (access control lists) that let you define rules like "only the Mac can SSH into the Windows machine" or "the phone can only reach port 3002 on the Mac." For personal use with a small number of devices, the default permissive policy is fine.

Verify everything is working:

```bash
# From Mac — check Tailscale status
tailscale status

# From Mac — ping Windows
tailscale ping 100.122.101.28

# From Mac — SSH to Windows
ssh user@100.122.101.28 "echo OK"

# From Android — access Mac dev server
# Open browser: http://100.75.2.78:3002
```

## When Cloudflare Tunnel Makes Sense Too

Tailscale is perfect when all your devices are on the same account. But what if you want to share a service with someone who is not on your Tailscale network, or expose something publicly for a webhook callback? That is where Cloudflare Tunnel comes in.

```bash
brew install cloudflare/cloudflare/cloudflared
cloudflared tunnel --url http://localhost:3002
```

This gives you a temporary public URL like `https://xxx.trycloudflare.com` that anyone on the internet can reach. The traffic still flows through an encrypted tunnel, but instead of being limited to your Tailscale network, it is publicly accessible. The URL changes each time you restart the tunnel, which is fine for quick demos or webhook testing. For permanent public URLs you would need a Cloudflare account and a custom domain.

I use Tailscale for all my personal device-to-device access and Cloudflare Tunnel for the rare case where I need to expose something to the public internet temporarily. The two tools complement each other without conflict.

## Why Not WireGuard Directly

You could set up raw WireGuard without Tailscale and achieve a similar result. The problem is the maintenance burden. With WireGuard you need to manually generate keys for each device, configure peer endpoints, handle NAT traversal yourself, and update configs whenever an IP changes. If your home ISP changes your public IP, your WireGuard tunnels break until you update the configs on every device.

Tailscale automates all of that. Key rotation, NAT traversal, device discovery, ACLs — it handles the operational complexity that makes raw WireGuard impractical for most people. You are still using WireGuard under the hood, but the experience is closer to "log in and it works" than "spend a weekend configuring iptables."

## Final Thought

Tailscale solved a problem I had been duct-taping together for years. I no longer think about how to reach my devices. My Mac, my Windows machine, and my phone are all on the same private network no matter where they are physically. I can SSH between them, access local services, and transfer files without exposing anything to the public internet or paying for a relay server. The free tier covers everything I need, and the setup took less than 20 minutes across all three platforms. That is the kind of tool that stays in your stack permanently.
