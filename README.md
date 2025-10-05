# TradeZen - Base Mini App

10-second trade logging with AI emotion insights for disciplined traders.

## Features

- **One-Tap Mobile Widget**: Floating widget for instant trade entry
- **AI Emotion Auto-Tagging**: Automatically detect trading psychology patterns
- **Weekly Mental Performance Score**: Track discipline with 0-100 scoring
- **MT4/MT5/TradingView Sync**: Import historical trades (Premium)
- **Farcaster Integration**: Share scores and build social accountability

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Blockchain**: Base (via OnchainKit)
- **Database**: Supabase
- **AI**: OpenAI GPT-4 Turbo
- **Styling**: Tailwind CSS
- **Social**: Farcaster Frames v2

## Architecture

- Mobile-first responsive design
- Professional finance theme (dark navy + gold)
- Real-time emotion analysis
- Offline-capable with local storage
- Frame-based social sharing

## Business Model

- Free: 5 trades/week
- Micro-transactions: $0.10 per trade unlock
- Premium: $2.99/month unlimited logging
- Sync: $4.99/month MT4/MT5/TradingView

## License

MIT
