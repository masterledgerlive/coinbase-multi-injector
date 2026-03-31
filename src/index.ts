/**
 * Coinbase Multi-Chain Injector
 * 
 * Plug-and-play multi-chain data injection service using Coinbase SDK 2.0
 * Deploy to Railway with just API keys and start injecting data across 25+ blockchains
 */

import express, { Express, Request, Response } from "express";
import pinoHttp from "pino-http";
import dotenv from "dotenv";
import { CoinbaseInjectionEngine } from "./engine/injection-engine";
import { ChainRouter } from "./routers/chain-router";
import { InjectionController } from "./controllers/injection-controller";
import { HealthController } from "./controllers/health-controller";

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(pinoHttp());

// Initialize services
let injectionEngine: CoinbaseInjectionEngine;
let chainRouter: ChainRouter;
let injectionController: InjectionController;
let healthController: HealthController;

/**
 * Initialize all services
 */
async function initializeServices(): Promise<void> {
  try {
    console.log("🚀 Initializing Coinbase Multi-Chain Injector...");

    // Initialize injection engine
    injectionEngine = new CoinbaseInjectionEngine({
      apiKey: process.env.COINBASE_API_KEY!,
      apiSecret: process.env.COINBASE_API_SECRET!,
      privateKey: process.env.COINBASE_PRIVATE_KEY!,
    });

    // Initialize chain router
    chainRouter = new ChainRouter();
    await chainRouter.initialize();

    // Initialize controllers
    injectionController = new InjectionController(injectionEngine, chainRouter);
    healthController = new HealthController(injectionEngine, chainRouter);

    console.log("✅ All services initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
    process.exit(1);
  }
}

/**
 * Health check endpoint
 */
app.get("/health", async (req: Request, res: Response) => {
  try {
    const health = await healthController.getHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: "Health check failed" });
  }
});

/**
 * Get supported chains
 */
app.get("/chains", async (req: Request, res: Response) => {
  try {
    const chains = await chainRouter.getSupportedChains();
    res.json({ chains });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chains" });
  }
});

/**
 * Get supported tokens on a chain
 */
app.get("/tokens", async (req: Request, res: Response) => {
  try {
    const { chain } = req.query;
    if (!chain) {
      return res.status(400).json({ error: "Chain parameter required" });
    }
    const tokens = await injectionEngine.getSupportedTokens(chain as string);
    res.json({ tokens });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tokens" });
  }
});

/**
 * Get current gas prices
 */
app.get("/gas-prices", async (req: Request, res: Response) => {
  try {
    const gasPrices = await chainRouter.getGasPrices();
    res.json(gasPrices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch gas prices" });
  }
});

/**
 * Inject data to blockchain(s)
 */
app.post("/inject", async (req: Request, res: Response) => {
  try {
    const result = await injectionController.injectData(req.body);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * Get injection status
 */
app.get("/status/:injectionId", async (req: Request, res: Response) => {
  try {
    const { injectionId } = req.params;
    const status = await injectionController.getStatus(injectionId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

/**
 * Batch injection
 */
app.post("/batch", async (req: Request, res: Response) => {
  try {
    const result = await injectionController.batchInject(req.body);
    res.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * Get metrics
 */
app.get("/metrics", async (req: Request, res: Response) => {
  try {
    const metrics = await injectionController.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

/**
 * Get wallet balance
 */
app.get("/wallet/balance", async (req: Request, res: Response) => {
  try {
    const balance = await injectionEngine.getWalletBalance();
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wallet balance" });
  }
});

/**
 * Error handling middleware
 */
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/**
 * Start server
 */
async function startServer(): Promise<void> {
  try {
    // Initialize services
    await initializeServices();

    // Start listening
    app.listen(port, () => {
      console.log(`\n╔════════════════════════════════════════╗`);
      console.log(`║  Coinbase Multi-Chain Injector         ║`);
      console.log(`║  Server running on port ${port}           ║`);
      console.log(`╚════════════════════════════════════════╝\n`);
      console.log(`📍 API: http://localhost:${port}`);
      console.log(`📊 Health: http://localhost:${port}/health`);
      console.log(`⛓️  Chains: http://localhost:${port}/chains`);
      console.log(`💉 Inject: POST http://localhost:${port}/inject\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

export { app, injectionEngine, chainRouter };
