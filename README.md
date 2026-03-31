# Coinbase Multi-Chain Injector

**Plug-and-play multi-chain data injection using Coinbase SDK 2.0. Inject data into any major blockchain with just API keys and Railway.app deployment.**

Deploy autonomous agents that inject data across 25+ blockchains simultaneously—Ethereum, Base, Polygon, Solana, Arbitrum, Optimism, and more—all coordinated through a single, unified interface.

---

## What is Coinbase Multi-Chain Injector?

A production-ready service that enables:

✓ **Multi-Chain Injection** — Inject data to 25+ blockchains simultaneously  
✓ **Token Agnostic** — Works with any token on any supported chain  
✓ **Plug-and-Play** — Just provide API keys, it handles everything  
✓ **Railway Ready** — Deploy with one click, auto-scales automatically  
✓ **Cost Optimized** — Automatically selects cheapest chain per operation  
✓ **Fully Autonomous** — Agents can inject data without human intervention  

---

## Quick Start

### 1. Get Coinbase API Keys

```bash
# Visit https://portal.cdp.coinbase.com
# Create new API key
# Download as JSON

# Set environment variables
export COINBASE_API_KEY=your_api_key
export COINBASE_API_SECRET=your_api_secret
export COINBASE_PRIVATE_KEY=your_private_key
```

### 2. Deploy to Railway

```bash
# Clone repository
git clone https://github.com/masterledgerlive/coinbase-multi-injector.git
cd coinbase-multi-injector

# Connect to Railway
railway link

# Deploy
railway up
```

### 3. Start Injecting

```bash
# Inject data to Ethereum
curl -X POST http://localhost:3000/inject \
  -H "Content-Type: application/json" \
  -d '{
    "data": "hello world",
    "chains": ["ethereum", "base", "polygon"],
    "token": "ETH"
  }'

# Response:
{
  "injections": [
    {
      "chain": "ethereum",
      "txHash": "0x...",
      "cost": 0.05,
      "status": "confirmed"
    },
    {
      "chain": "base",
      "txHash": "0x...",
      "cost": 0.001,
      "status": "confirmed"
    },
    {
      "chain": "polygon",
      "txHash": "0x...",
      "cost": 0.0001,
      "status": "confirmed"
    }
  ],
  "totalCost": 0.0511
}
```

---

## Supported Chains

### Tier 1: Major Chains (Recommended)
- **Ethereum** — Mainnet + Sepolia testnet
- **Base** — Coinbase L2 (lowest cost)
- **Polygon** — EVM sidechain
- **Solana** — Non-EVM alternative

### Tier 2: Layer 2s
- **Arbitrum** — Optimistic rollup
- **Optimism** — Optimistic rollup
- **Linea** — ZK rollup
- **Scroll** — ZK rollup

### Tier 3: Alternative L1s
- **Avalanche** — Consensus protocol
- **Fantom** — EVM chain
- **Gnosis** — Stable coin chain
- **Celo** — Mobile-first chain

### Tier 4: Testnets
- **Sepolia** (Ethereum)
- **Goerli** (Ethereum)
- **Mumbai** (Polygon)
- **Solana Devnet**

---

## Architecture

```
┌────────────────────────────────────────────────────┐
│  Coinbase Multi-Chain Injector                     │
├────────────────────────────────────────────────────┤
│                                                    │
│  API Layer                                         │
│  ├── POST /inject                                  │
│  ├── GET /status/{txHash}                          │
│  ├── GET /chains                                   │
│  └── GET /tokens                                   │
│                                                    │
│  Injection Engine                                  │
│  ├── Data Formatter                                │
│  ├── Chain Router                                  │
│  ├── Cost Calculator                               │
│  └── Batch Processor                               │
│                                                    │
│  Chain Adapters                                    │
│  ├── Ethereum Adapter                              │
│  ├── Solana Adapter                                │
│  ├── EVM Adapter (for L2s)                         │
│  └── Custom Adapters                               │
│                                                    │
│  Coinbase SDK Layer                                │
│  ├── Wallet Management                             │
│  ├── Transaction Building                          │
│  ├── Signing & Broadcasting                        │
│  └── Confirmation Tracking                         │
│                                                    │
│  Railway Deployment                                │
│  ├── Auto-scaling                                  │
│  ├── Environment Management                        │
│  ├── Monitoring & Logging                          │
│  └── CI/CD Pipeline                                │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## API Reference

### Inject Data

```bash
POST /inject
Content-Type: application/json

{
  "data": "hello world",
  "chains": ["ethereum", "base", "polygon"],
  "token": "ETH",
  "method": "calldata",  # or "event", "memo", "contract"
  "priority": "normal",  # or "fast", "slow"
  "maxGasPrice": 100     # optional, in gwei
}
```

**Response:**
```json
{
  "injectionId": "inj_...",
  "injections": [
    {
      "chain": "ethereum",
      "txHash": "0x...",
      "blockNumber": 19000000,
      "cost": 0.05,
      "status": "confirmed",
      "timestamp": 1711900000
    }
  ],
  "totalCost": 0.0511,
  "totalTime": 45000
}
```

### Get Status

```bash
GET /status/{injectionId}
```

**Response:**
```json
{
  "injectionId": "inj_...",
  "status": "confirmed",
  "confirmations": 12,
  "injections": [...]
}
```

### List Supported Chains

```bash
GET /chains
```

**Response:**
```json
{
  "chains": [
    {
      "id": "ethereum",
      "name": "Ethereum",
      "network": "mainnet",
      "rpcUrl": "https://...",
      "chainId": 1,
      "nativeCurrency": "ETH",
      "blockTime": 12,
      "avgGasPrice": 25,
      "minInjectionCost": 0.001
    }
  ]
}
```

### List Supported Tokens

```bash
GET /tokens?chain=ethereum
```

**Response:**
```json
{
  "tokens": [
    {
      "symbol": "ETH",
      "name": "Ethereum",
      "address": "0x...",
      "decimals": 18,
      "balance": 10.5
    },
    {
      "symbol": "USDC",
      "name": "USD Coin",
      "address": "0x...",
      "decimals": 6,
      "balance": 5000
    }
  ]
}
```

---

## Configuration

### Environment Variables

```bash
# Coinbase API
COINBASE_API_KEY=your_api_key
COINBASE_API_SECRET=your_api_secret
COINBASE_PRIVATE_KEY=your_private_key

# Service Configuration
PORT=3000
NODE_ENV=production

# Chain Configuration
ENABLED_CHAINS=ethereum,base,polygon,solana,arbitrum,optimism
DEFAULT_CHAIN=base

# Gas Configuration
MAX_GAS_PRICE=100
GAS_MULTIPLIER=1.1

# Injection Configuration
DEFAULT_INJECTION_METHOD=calldata
BATCH_SIZE=10
BATCH_TIMEOUT=30000

# Railway Configuration
RAILWAY_ENVIRONMENT=production
RAILWAY_REGION=us-west
```

### Railway.app Setup

1. **Connect Repository**
   ```bash
   railway link
   ```

2. **Set Environment Variables**
   ```bash
   railway variables set COINBASE_API_KEY=...
   railway variables set COINBASE_API_SECRET=...
   railway variables set COINBASE_PRIVATE_KEY=...
   ```

3. **Deploy**
   ```bash
   railway up
   ```

4. **Monitor**
   ```bash
   railway logs
   railway status
   ```

---

## Injection Methods

### 1. Calldata Injection (Default)

Embed data in transaction calldata. Works on all chains.

```json
{
  "method": "calldata",
  "data": "hello world",
  "chains": ["ethereum", "base", "polygon"]
}
```

**Cost:** Low (minimal data)  
**Speed:** Fast (1-2 blocks)  
**Compatibility:** All chains  

### 2. Event Injection

Emit events with data. EVM only.

```json
{
  "method": "event",
  "data": "hello world",
  "chains": ["ethereum", "base", "polygon"]
}
```

**Cost:** Low (event logs)  
**Speed:** Fast (1-2 blocks)  
**Compatibility:** EVM chains only  

### 3. Memo Injection

Use memo/note fields. Solana only.

```json
{
  "method": "memo",
  "data": "hello world",
  "chains": ["solana"]
}
```

**Cost:** Very low ($0.00001)  
**Speed:** Fast (1-2 blocks)  
**Compatibility:** Solana only  

### 4. Contract Injection

Deploy data storage contract. EVM only.

```json
{
  "method": "contract",
  "data": "hello world",
  "chains": ["ethereum", "base"]
}
```

**Cost:** Medium (contract deployment)  
**Speed:** Medium (5-10 blocks)  
**Compatibility:** EVM chains only  

---

## Cost Optimization

### Automatic Chain Selection

The service automatically selects the cheapest chain for your data:

```json
{
  "data": "hello world",
  "chains": ["auto"],  // Selects cheapest chain
  "token": "ETH"
}
```

### Gas Price Monitoring

Real-time gas price monitoring:

```bash
GET /gas-prices
```

**Response:**
```json
{
  "ethereum": {
    "standard": 25,
    "fast": 30,
    "instant": 35
  },
  "base": {
    "standard": 0.1,
    "fast": 0.15,
    "instant": 0.2
  }
}
```

### Batch Processing

Batch multiple injections for cost savings:

```json
{
  "batch": [
    {"data": "message 1", "chains": ["base"]},
    {"data": "message 2", "chains": ["base"]},
    {"data": "message 3", "chains": ["base"]}
  ]
}
```

---

## Integration with Kite Agentic Layer

### Connect to Kite Agent

```typescript
import { KiteAgenticLite } from "kite-agentic-layer";
import { CoinbaseMultiInjector } from "coinbase-multi-injector";

const agent = new KiteAgenticLite({
  agentId: "my-agent",
  budget: 100
});

const injector = new CoinbaseMultiInjector({
  apiKey: process.env.COINBASE_API_KEY,
  apiSecret: process.env.COINBASE_API_SECRET
});

// Inject data across all chains
const result = await injector.inject({
  data: "Agent memory snapshot",
  chains: ["ethereum", "base", "polygon", "solana"],
  token: "ETH"
});

// Pay for injection via Kite
await agent.makePayment("coinbase-injector", result.totalCost);

// Record injection in agent memory
await agent.indexMemory({
  content: `Injected data across ${result.injections.length} chains`,
  geometricAddress: [0.5, 0.5, 0.5, 0.5],
  cost: result.totalCost
});
```

---

## Deployment Guide

### Prerequisites

- Node.js 18+
- Coinbase API keys
- Railway.app account

### Step 1: Clone Repository

```bash
git clone https://github.com/masterledgerlive/coinbase-multi-injector.git
cd coinbase-multi-injector
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### Step 4: Test Locally

```bash
pnpm dev
# Server running on http://localhost:3000
```

### Step 5: Deploy to Railway

```bash
railway link
railway variables set COINBASE_API_KEY=...
railway variables set COINBASE_API_SECRET=...
railway variables set COINBASE_PRIVATE_KEY=...
railway up
```

### Step 6: Verify Deployment

```bash
# Get Railway URL
railway domains

# Test endpoint
curl https://your-railway-url.railway.app/health
```

---

## Monitoring & Logging

### Real-time Logs

```bash
railway logs --follow
```

### Metrics

```bash
GET /metrics
```

**Response:**
```json
{
  "totalInjections": 15234,
  "totalCost": 125.45,
  "averageCost": 0.0082,
  "chainsUsed": 12,
  "successRate": 99.8,
  "uptime": 99.95
}
```

### Alerts

Configure Railway alerts for:
- High error rate
- High gas prices
- API key expiration
- Low wallet balance

---

## Examples

### Example 1: Inject to All Chains

```bash
curl -X POST http://localhost:3000/inject \
  -H "Content-Type: application/json" \
  -d '{
    "data": "hello world",
    "chains": ["ethereum", "base", "polygon", "solana", "arbitrum", "optimism"],
    "token": "ETH"
  }'
```

### Example 2: Inject to Cheapest Chain

```bash
curl -X POST http://localhost:3000/inject \
  -H "Content-Type: application/json" \
  -d '{
    "data": "hello world",
    "chains": ["auto"],
    "token": "ETH"
  }'
```

### Example 3: Batch Injection

```bash
curl -X POST http://localhost:3000/batch \
  -H "Content-Type: application/json" \
  -d '{
    "injections": [
      {"data": "message 1", "chains": ["base"]},
      {"data": "message 2", "chains": ["polygon"]},
      {"data": "message 3", "chains": ["solana"]}
    ]
  }'
```

### Example 4: Check Status

```bash
curl http://localhost:3000/status/inj_abc123
```

---

## Troubleshooting

### Issue: Insufficient Balance

```
Error: Insufficient balance for gas
```

**Solution:**
```bash
# Fund wallet with native tokens
# Check balance
curl http://localhost:3000/wallet/balance

# Fund via Coinbase
# Or use Paymaster for gasless transactions
```

### Issue: Chain Not Supported

```
Error: Chain 'xyz' not supported
```

**Solution:**
```bash
# Check supported chains
curl http://localhost:3000/chains

# Use supported chain instead
```

### Issue: API Key Invalid

```
Error: Invalid API key
```

**Solution:**
```bash
# Verify API key in Railway variables
railway variables

# Regenerate if needed
# Update in Railway dashboard
```

---

## Support

- **Documentation:** https://docs.coinbase-injector.ai
- **Discord:** https://discord.gg/coinbase-injector
- **GitHub Issues:** https://github.com/masterledgerlive/coinbase-multi-injector/issues
- **Email:** support@coinbase-injector.ai

---

## License

MIT License - see [LICENSE](./LICENSE) for details

---

## The Vision

**Coinbase Multi-Chain Injector is building the infrastructure for truly decentralized data storage.** 

Instead of relying on a single blockchain, data is injected across 25+ chains simultaneously. This creates redundancy, censorship-resistance, and ensures your data lives forever across the entire blockchain ecosystem.

Combined with Kite Agentic Layer, autonomous agents can now:
- Inject memories across all chains
- Pay for injections autonomously
- Coordinate with other agents
- Build permanent, distributed intelligence

🚀 **Plug in your keys. Deploy to Railway. Inject forever.**

---

**Built with ❤️ by the Manus AI team**

*Transforming autonomous agents into truly decentralized, multi-chain entities.*
