# 🐾 imp.cx Bot

> Solana Copy Trading & Sniping Telegram Bot — with Web Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A powerful Telegram bot for Solana token trading with copy trading, portfolio tracking, and a web dashboard.

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/LIONBABYCRYPTO/imp-cx-bot.git
cd imp-cx-bot

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your keys

# Setup Database
createdb impcx_bot
psql impcx_bot < src/db/schema.sql

# Start Bot
npm start
```

## 🤖 Features

| Feature | Status | Description |
|---|---|---|
| 💰 Buy/Sell Tokens | ✅ MVP | Trade any SPL token via Jupiter |
| 🔐 Non-Custodial | ✅ MVP | You hold your keys, encrypted at rest |
| 👤 Copy Trading | 🔧 Week 3 | Mirror top wallets' trades automatically |
| 📊 Web Dashboard | 🔧 Week 4 | Track positions, P&L, history in browser |
| 🎯 Referral Program | ✅ MVP | Earn 20% of referred users' fees |
| ⚙️ Settings | ✅ MVP | Slippage, priority fees, defaults |
| 🛡️ MEV Protection | 🔧 Week 3 | Jito integration for frontrunning protection |
| 📈 Portfolio View | 🔧 Week 4 | Real-time P&L and position tracking |

## 💰 Fee Structure

- **Standard:** 0.5% per trade
- **Silver:** 0.4% (10K+ volume)
- **Gold:** 0.3% (100K+ volume)
- **Platinum:** 0.2% (1M+ volume)

## 🏗️ Architecture

```
imp.cx/                    # imp.cx — Landing page (GitHub Pages)
imp.cx/app                # Web dashboard (Next.js)
t.me/impcx_bot            # Telegram bot (Node.js)

Bot ──→ Jupiter API ──→ Solana
Bot ──→ Helius Webhooks ──→ Wallet Tracking
Bot ──→ PostgreSQL ──→ User Data
Web ──→ Bot API ──→ User Dashboard
```

## 🛠️ Tech Stack

- **Bot Framework:** grammY (Node.js)
- **Blockchain:** Solana + Jupiter API
- **Database:** PostgreSQL
- **Web Dashboard:** Express + React (coming)
- **Hosting:** Mac mini (dev) → DigitalOcean (prod)

## 📈 Revenue Model

- 0.5% per swap transaction
- Referral rewards: 20% of referred fees
- Future: Premium subscription tiers

## 📄 License

MIT
