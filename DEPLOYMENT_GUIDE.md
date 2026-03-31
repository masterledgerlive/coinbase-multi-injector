# Coinbase Multi-Chain Injector - Railway Deployment Guide

**Deploy your multi-chain injection service to Railway in 5 minutes.**

---

## Prerequisites

- Coinbase API keys (from https://portal.cdp.coinbase.com)
- Railway.app account (https://railway.app)
- Git installed

---

## Step 1: Get Coinbase API Keys

### 1.1 Create Coinbase Developer Account

1. Go to https://portal.cdp.coinbase.com
2. Sign up or log in
3. Create a new API key
4. Download the JSON file (save securely)

### 1.2 Extract Credentials

From the JSON file, you'll need:
- `name` → API Key
- `private_key` → Private Key
- `privateKeyHex` → Private Key (hex format)

---

## Step 2: Deploy to Railway

### 2.1 Clone Repository

```bash
git clone https://github.com/masterledgerlive/coinbase-multi-injector.git
cd coinbase-multi-injector
```

### 2.2 Connect to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link project
railway link
```

### 2.3 Set Environment Variables

```bash
# Set API credentials
railway variables set COINBASE_API_KEY=your_api_key
railway variables set COINBASE_API_SECRET=your_api_secret
railway variables set COINBASE_PRIVATE_KEY=your_private_key

# Set service configuration
railway variables set NODE_ENV=production
railway variables set ENABLED_CHAINS=ethereum,base,polygon,solana,arbitrum,optimism
railway variables set DEFAULT_CHAIN=base
```

### 2.4 Deploy

```bash
# Deploy to Railway
railway up

# View deployment status
railway status

# Get public URL
railway domains

# View logs
railway logs --follow
```

---

## Step 3: Verify Deployment

### 3.1 Test Health Endpoint

```bash
# Get your Railway URL
RAILWAY_URL=$(railway domains | grep -oE 'https://[^[:space:]]+')

# Test health
curl $RAILWAY_URL/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "2024-03-31T...",
#   "chains": 12,
#   "uptime": 45
# }
```

### 3.2 Test Injection Endpoint

```bash
# Inject data to Base (cheapest chain)
curl -X POST $RAILWAY_URL/inject \
  -H "Content-Type: application/json" \
  -d '{
    "data": "hello world from railway",
    "chains": ["base"],
    "token": "ETH"
  }'

# Should return:
# {
#   "injectionId": "inj_...",
#   "injections": [...],
#   "totalCost": 0.001
# }
```

### 3.3 Check Supported Chains

```bash
curl $RAILWAY_URL/chains

# Should list all supported chains
```

---

## Step 4: Configure Auto-Scaling

### 4.1 Set Memory Limits

```bash
railway variables set RAILWAY_MEMORY=512MB
railway variables set RAILWAY_CPU=0.5
```

### 4.2 Enable Auto-Scaling

In Railway dashboard:
1. Go to your project
2. Click "Settings"
3. Enable "Auto Scaling"
4. Set min replicas: 1
5. Set max replicas: 5

---

## Step 5: Set Up Monitoring

### 5.1 View Logs

```bash
# Real-time logs
railway logs --follow

# Last 100 lines
railway logs --tail 100

# Filter by level
railway logs --filter "ERROR"
```

### 5.2 Monitor Metrics

```bash
# CPU usage
railway status

# Memory usage
railway logs | grep "memory"

# Request metrics
curl $RAILWAY_URL/metrics
```

### 5.3 Set Up Alerts

In Railway dashboard:
1. Go to "Alerts"
2. Create alert for:
   - High CPU (> 80%)
   - High memory (> 80%)
   - Error rate (> 1%)
   - Downtime (> 5 min)

---

## Step 6: Integrate with Kite Agentic Layer

### 6.1 Get Railway URL

```bash
RAILWAY_URL=$(railway domains | grep -oE 'https://[^[:space:]]+')
echo $RAILWAY_URL
```

### 6.2 Update Kite Configuration

In your Kite Agentic Layer `.env`:

```bash
COINBASE_INJECTOR_URL=$RAILWAY_URL
COINBASE_API_KEY=your_api_key
COINBASE_API_SECRET=your_api_secret
```

### 6.3 Use in Agent Code

```typescript
import { KiteAgenticLite } from "kite-agentic-layer";
import axios from "axios";

const agent = new KiteAgenticLite({
  agentId: "my-agent",
  budget: 100
});

// Inject data via Coinbase Multi-Injector
const injectorUrl = process.env.COINBASE_INJECTOR_URL;
const result = await axios.post(`${injectorUrl}/inject`, {
  data: "Agent memory",
  chains: ["ethereum", "base", "polygon"],
  token: "ETH"
});

// Pay for injection
await agent.makePayment("coinbase-injector", result.data.totalCost);
```

---

## Step 7: Manage Wallet

### 7.1 Check Balance

```bash
RAILWAY_URL=$(railway domains | grep -oE 'https://[^[:space:]]+')
curl $RAILWAY_URL/wallet/balance
```

### 7.2 Fund Wallet

```bash
# Get wallet address from balance response
# Fund via Coinbase or exchange

# Or use Paymaster for gasless transactions
curl -X POST $RAILWAY_URL/inject \
  -H "Content-Type: application/json" \
  -d '{
    "data": "hello world",
    "chains": ["base"],
    "usePaymaster": true
  }'
```

---

## Troubleshooting

### Issue: Deployment Failed

```bash
# Check logs
railway logs

# Rebuild
railway build

# Redeploy
railway up
```

### Issue: API Key Invalid

```bash
# Verify API key
railway variables get COINBASE_API_KEY

# Update if needed
railway variables set COINBASE_API_KEY=new_key

# Restart service
railway restart
```

### Issue: High Latency

```bash
# Check region
railway status

# Change region
railway variables set RAILWAY_REGION=us-east

# Restart
railway restart
```

### Issue: Out of Memory

```bash
# Increase memory
railway variables set RAILWAY_MEMORY=1024MB

# Restart
railway restart
```

---

## Performance Optimization

### 1. Enable Caching

```bash
railway variables set CACHE_ENABLED=true
railway variables set CACHE_TTL=300
```

### 2. Batch Requests

```bash
# Instead of multiple /inject calls
curl -X POST $RAILWAY_URL/batch \
  -H "Content-Type: application/json" \
  -d '{
    "injections": [
      {"data": "msg1", "chains": ["base"]},
      {"data": "msg2", "chains": ["base"]},
      {"data": "msg3", "chains": ["base"]}
    ]
  }'
```

### 3. Use Cheapest Chain

```bash
# Auto-select cheapest chain
curl -X POST $RAILWAY_URL/inject \
  -H "Content-Type: application/json" \
  -d '{
    "data": "hello world",
    "chains": ["auto"],
    "token": "ETH"
  }'
```

---

## Cost Optimization

### 1. Use Base Network

Base has the lowest costs (~$0.001 per injection)

```bash
curl -X POST $RAILWAY_URL/inject \
  -H "Content-Type: application/json" \
  -d '{
    "data": "hello world",
    "chains": ["base"],
    "token": "ETH"
  }'
```

### 2. Use Solana for Minimal Cost

Solana memo injections cost ~$0.00001

```bash
curl -X POST $RAILWAY_URL/inject \
  -H "Content-Type: application/json" \
  -d '{
    "data": "hello world",
    "chains": ["solana"],
    "method": "memo"
  }'
```

### 3. Batch Multiple Injections

Reduces per-injection overhead

---

## Maintenance

### 1. Update Dependencies

```bash
pnpm update
git add pnpm-lock.yaml
git commit -m "Update dependencies"
railway up
```

### 2. Monitor API Key Expiration

```bash
# Check expiration in Coinbase dashboard
# Rotate keys before expiration
railway variables set COINBASE_API_KEY=new_key
```

### 3. Regular Backups

```bash
# Export metrics
curl $RAILWAY_URL/metrics > metrics-backup.json

# Export logs
railway logs > logs-backup.txt
```

---

## Support

- **Documentation:** https://docs.coinbase-injector.ai
- **Discord:** https://discord.gg/coinbase-injector
- **GitHub Issues:** https://github.com/masterledgerlive/coinbase-multi-injector/issues
- **Email:** support@coinbase-injector.ai

---

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Verify health endpoint
3. ✅ Test injection
4. ✅ Integrate with Kite Agentic Layer
5. ✅ Start injecting data across 25+ chains

**Your multi-chain injection service is now live!**

🚀 **Plug in your keys. Deploy to Railway. Inject forever.**
