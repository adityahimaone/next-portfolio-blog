---
title: "VPS Monitoring: Prometheus + Grafana"
slug: vps-monitoring-grafana-prometheus-blackbox
date: 2026-05-05
description: "How I built a full-stack monitoring system on Ubuntu VPS with Grafana, Prometheus, Blackbox Exporter, and automated uptime tracking with Telegram alerts."
tags: [devops, monitoring, grafana, prometheus, vps, self-hosted, telegram]
published: true
pinned: false
---


Managing a VPS (Virtual Private Server) itu kayak jagain rumah sendiri — lu harus tahu apa yang terjadi di dalam, kapan saja. Setelah beberapa kali service tiba-tiba mati tanpa tau sebabnya, I decided to build a proper monitoring stack.

## The Stack

VPS gw jalan di **Ubuntu 22.04** (xxx.xxx.xxx.xxx) dengan stack lengkap:

- **Prometheus** — Time-series database buat nyimpen metrics
- **Grafana** — Visualization & dashboard (subdomain: `grafana.adityahimaone.space`)
- **Node Exporter** — System metrics (CPU, RAM, disk, network)
- **Nginx Exporter** — Web server metrics
- **PM2 Exporter** — Node.js process monitoring
- **Blackbox Exporter** — HTTP/HTTPS uptime & response time probing
- **Alertmanager** — Alert routing ke **Telegram** (`@hiumannbot`)

## Architecture Overview

```
┌─────────────────┐
│  Blackbox       │
│  Exporter       │ ◄── Prometheus scrapes HTTP endpoints
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Prometheus     │ ◄── Scrapes all exporters
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Grafana        │ ◄── Visualizes Prometheus data
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Alertmanager   │ ◄── Sends alerts
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Telegram Bot   │ ◄── Notifications to my phone
└─────────────────┘
```

## Blackbox Exporter — The Game Changer

Yang paling menarik itu **Blackbox Exporter**. Bedanya sama exporter lain: dia nggak ngambil metrics dari local system, tapi *probes* external endpoints.

```yaml
# prometheus.yml — blackbox config
scrape_configs:
  - job_name: 'blackbox-http'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
        - https://adityahimaone.space
        - https://grafana.adityahimaone.space
        - https://netdata.adityahimaone.space
        - https://9router.adityahimaone.space
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
      - source_labels: [__param_target]
        target_label: __address__
        replacement: xxx.xxx.xxx.xxx:9115  # Blackbox exporter
```

Dengan config ini, Prometheus bakal nge-probe semua HTTPS endpoints dan nyimpen metrics:
- `probe_success` — 1 (up) atau 0 (down)
- `probe_duration_seconds` — Response time
- `probe_ssl_earliest_cert_expiry` — Kapan SSL cert expired

## Grafana Dashboard

Gw bikin dashboard **"VPS Monitoring — Full Stack v2"** dengan panels:

### Uptime Panels
- **24h Uptime %** — Average success rate dalam 24 jam terakhir
- **7d Uptime %** — Seminggu terakhir
- **30d Overall Uptime %** — Sebulan penuh
- **Service Uptime Status (Timeline)** — Visual timeline per service

### Performance Panels
- **Current Response Time** — Real-time latency
- **Response Time History** — Grafana over time
- **Node Exporter Metrics** — CPU, RAM, disk usage
- **Nginx Request Rate** — Requests per second

### PM2 Process Monitoring
- **PM2 Up Status** — Status aplikasi Node.js (9router, next-portfolio-blog, dll)
- **PM2 Restart Count** — Berapa kali aplikasi restart

Query-nya pake PromQL dengan `label_replace` buat extract domain name:

```promql
label_replace(
  avg_over_time(probe_success{job="blackbox-http"}[24h]),
  "service_name", "$1", "instance",
  "https?://([^/]+).*"
)
```

## SSL Certificate Monitoring

One of my favorite features — **SSL cert expiry tracking**:

```promql
(probe_ssl_earliest_cert_expiry - time()) / 86400 < 30
```

Alert ini bakal fire kalau SSL certificate tinggal **30 hari lagi** sebelum expired. Gw terhubung ke Telegram, jadi dapet notif langsung di HP.

## Telegram Alerts

Alertmanager config buat kirim alert ke Telegram:

```yaml
# alertmanager.yml
receivers:
  - name: 'telegram'
    telegram_configs:
        - bot_token: '[REDACTED]'  # @hiumannbot
        chat_id: 123456789              # @sineztra00
        message: |
          🚨 *Alert: {{ .GroupLabels.alertname }}*
          Service: {{ .CommonLabels.instance }}
          Status: {{ .Status }}
          Summary: {{ .CommonAnnotations.summary }}
```

Sekarang tiap ada service yang down atau SSL cert mau expired, gw langsung dapet notif di Telegram.

## Authentication & Security

Karena dashboard jalan di public subdomain, gw pake **Nginx Basic Auth**:

```nginx
# /etc/nginx/sites-available/grafana
location /grafana/ {
    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/.htpasswd_grafana;
    proxy_pass http://localhost:3000/;
}
```

Credentials: `adit / [HIDDEN]`

**Challenge:** Karena pake Basic Auth, `HTTP-01` challenge buat SSL cert nggak bisa jalan (diblokir auth). Solution-nya: pake **DNS-01 challenge via Cloudflare**:

```bash
certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials /root/.secrets/cloudflare.ini \
  -d grafana.adityahimaone.space \
  -d netdata.adityahimaone.space
```

## Recent Fixes & Improvements

### Filtering Dev Subdomain

Gw baru aja nambahin filter buat exclude `dev.adityahimaone.space` dari monitoring (karena itu development environment, nggak perlu di-track uptime-nya):

```promql
probe_success{job="blackbox-http", instance!="https://dev.adityahimaone.space"}
```

### Fixing Query Syntax Errors

Sempat ada issue di panel "Service Uptime Status (Right = Now, Left = Past)" karena syntax error di PromQL query:

```promql
# SALAH — nested braces
up{job=~{job="blackbox-http", ...}}

# BENAR
up{job=~"blackbox-http", ...}
```

Fixed lewat Grafana API pake Python script + requests library.

## Dashboard Access

- **Grafana**: https://grafana.adityahimaone.space (adit/[HIDDEN])
- **Netdata**: https://netdata.adityahimaone.space (adit/[HIDDEN])
- **Dashboard UID**: `vps-monitoring-v2`
- **Version**: 10 (terakhir diupdate 5 Mei 2026)

## Lessons Learned

1. **Always use subpaths for multiple services** — Nginx subpath proxy (`/grafana/`, `/netdata/`) jauh lebih gampang dari manage multiple subdomains + SSL certs
2. **DNS-01 > HTTP-01** kalau pake Basic Auth — jangan buang waktu troubleshoot HTTP challenge yang bakal selalu gagal
3. **Blackbox Exporter itu wajib** — HTTP monitoring nggak cuma tau service "up", tapi juga response time history & SSL expiry
4. **Telegram alerts > Email** — Notif langsung di HP jauh lebih actionable
5. **Dashboard versioning matters** — Grafana dashboard version 10 dan tiap update ada changelog yang jelas

## What's Next

- [ ] Implementasi **Uptime Kuma style** timeline (bikin panel yang mirip Uptime Kuma UI)
- [ ] Add **custom alert thresholds** per service (different SLA buat production vs staging)
- [ ] Integrate **Hermes Agent** buat auto-remediation (kalo service down, automatically restart via SSH)

---

Building this monitoring stack ngajarin gw banyak hal tentang observability. Sekarang gw bisa tidur tenang karena tau persis apa yang terjadi di VPS, dan kalau ada yang wrong, gw tau sebelum user lain ngerasainya. 😊

**Stack**: Ubuntu 22.04 • Prometheus 2.x • Grafana 10.x • Blackbox Exporter 0.24+ • Node Exporter • Nginx • PM2 • Alertmanager • Telegram Bot API
